import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AlertasEngineService, AlertasDetectionContext } from './domain/alertas-engine.service';
import { TipoAlerta, Prisma, Alerta } from '@prisma/client';
import { ListarAlertasQueryDto } from './dto/listar-alertas-query.dto';

export enum SeveridadeAlertaEnum {
  CRITICO = 'CRITICO',
  ALTO = 'ALTO',
  MEDIO = 'MEDIO',
}

export interface ListarAlertasQuery {
  page?: number;
  pageSize?: number;
  apenasNaoLidos?: boolean | string;
  severidade?: SeveridadeAlertaEnum | string;
}

export function getSeveridadeFromTipo(tipo: TipoAlerta): SeveridadeAlertaEnum {
  switch (tipo) {
    case TipoAlerta.CONTA_VENCENDO:
    case TipoAlerta.ORCAMENTO_EXCEDIDO:
      return SeveridadeAlertaEnum.CRITICO;
    case TipoAlerta.QUEDA_PRECO:
      return SeveridadeAlertaEnum.ALTO;
    case TipoAlerta.META_ATINGIDA:
    case TipoAlerta.SALARIO_RECEBIDO:
    case TipoAlerta.SISTEMA:
    default:
      return SeveridadeAlertaEnum.MEDIO;
  }
}

export function getSeveridadeRank(tipo: TipoAlerta): number {
  const sev = getSeveridadeFromTipo(tipo);
  switch (sev) {
    case SeveridadeAlertaEnum.CRITICO:
      return 3;
    case SeveridadeAlertaEnum.ALTO:
      return 2;
    case SeveridadeAlertaEnum.MEDIO:
      return 1;
    default:
      return 0;
  }
}

@Injectable()
export class AlertasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly alertasEngineService: AlertasEngineService,
  ) {}

  /**
   * Executa a detecção de alertas pelo AlertasEngineService, aplica as regras de preferências do usuário
   * (Opt-In Default: se não existir ConfigAlerta, ativo = true) e salva no banco de dados com
   * idempotência baseada na chaveFormatada.
   */
  async gerarESalvarAlertas(
    usuarioId: string,
    workspaceId: string,
    contexto: AlertasDetectionContext,
  ) {
    // 1. Detectar candidatos usando Pure Domain Engine
    const candidatos = this.alertasEngineService.detectarAlertas(contexto);

    // 2. Buscar preferências do usuário no banco (Opt-In Default)
    const userConfigs = await this.prisma.configAlerta.findMany({
      where: { usuarioId },
    });

    const configMap = new Map<TipoAlerta, boolean>();
    userConfigs.forEach((cfg) => {
      configMap.set(cfg.tipo, cfg.ativo);
    });

    // 3. Filtrar candidatos respeitando preferências
    const candidatosFiltrados = candidatos.filter((candidate) => {
      if (configMap.has(candidate.tipo)) {
        return configMap.get(candidate.tipo) === true;
      }
      // Opt-In Default: se não existir registro ➔ ativo = true
      return true;
    });

    const alertasSalvos: Alerta[] = [];

    // 4. Formatar chave de idempotência e salvar no banco com tratamento de concorrência/duplicidade P2002
    for (const candidate of candidatosFiltrados) {
      const tipoRef = candidate.tipoReferencia || 'GERAL';
      const refId = candidate.referenciaId || 'GLOBAL';
      const comp = candidate.competenciaConcreta || 'ATUAL';

      const chaveIdempotencia = [
        usuarioId,
        workspaceId,
        candidate.tipo,
        tipoRef,
        refId,
        comp,
      ].join(':');

      try {
        const alertaCriado = await this.prisma.alerta.create({
          data: {
            usuarioId,
            workspaceId,
            tipo: candidate.tipo,
            titulo: candidate.titulo,
            mensagem: candidate.mensagem,
            tipoReferencia: candidate.tipoReferencia || null,
            referenciaId: candidate.referenciaId || null,
            chaveIdempotencia,
            lido: false,
            dataDisparo: contexto.referenceDate
              ? new Date(contexto.referenceDate)
              : new Date(),
          },
        });
        alertasSalvos.push(alertaCriado);
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          // Captura e ignora erro Prisma P2002 de chave única duplicada (Idempotência)
        } else {
          throw error;
        }
      }
    }

    return {
      processados: candidatos.length,
      filtrados: candidatosFiltrados.length,
      gerados: alertasSalvos.length,
      alertas: alertasSalvos,
    };
  }

  /**
   * Lista alertas paginados com isolamento duplo usuarioId + workspaceId.
   * Ordenação determinística:
   * 1. severidade DESC (CRITICO > ALTO > MEDIO)
   * 2. dataDisparo DESC
   * 3. id ASC
   */
  async listarAlertas(
    usuarioId: string,
    workspaceId: string,
    query: ListarAlertasQuery,
  ) {
    const page = query.page ? Math.max(1, Number(query.page)) : 1;
    const pageSize = query.pageSize ? Math.max(1, Number(query.pageSize)) : 10;

    const apenasNaoLidos =
      query.apenasNaoLidos === true || query.apenasNaoLidos === 'true';
    const severidadeFiltro = query.severidade;

    const where: Prisma.AlertaWhereInput = {
      usuarioId,
      workspaceId,
    };

    if (apenasNaoLidos) {
      where.lido = false;
    }

    const alertas = await this.prisma.alerta.findMany({
      where,
    });

    // Filtra por severidade (se informado)
    let alertasFiltrados = alertas;
    if (severidadeFiltro) {
      alertasFiltrados = alertas.filter(
        (a) => getSeveridadeFromTipo(a.tipo) === severidadeFiltro,
      );
    }

    // Ordenação determinística: 1. severidade DESC -> 2. dataDisparo DESC -> 3. id ASC
    alertasFiltrados.sort((a, b) => {
      const rankA = getSeveridadeRank(a.tipo);
      const rankB = getSeveridadeRank(b.tipo);
      if (rankA !== rankB) {
        return rankB - rankA;
      }
      const timeA = new Date(a.dataDisparo).getTime();
      const timeB = new Date(b.dataDisparo).getTime();
      if (timeA !== timeB) {
        return timeB - timeA;
      }
      return a.id.localeCompare(b.id);
    });

    const total = alertasFiltrados.length;
    const totalPages = Math.ceil(total / pageSize);
    const paginated = alertasFiltrados.slice((page - 1) * pageSize, page * pageSize);

    const data = paginated.map((alerta) => ({
      ...alerta,
      severidade: getSeveridadeFromTipo(alerta.tipo),
    }));

    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  }

  /**
   * Retorna a contagem de alertas não lidos para o contexto usuarioId + workspaceId.
   */
  async contarNaoLidos(usuarioId: string, workspaceId: string) {
    const count = await this.prisma.alerta.count({
      where: {
        usuarioId,
        workspaceId,
        lido: false,
      },
    });

    return { count };
  }

  /**
   * Marca um alerta específico como lido respeitando o isolamento do usuarioId + workspaceId.
   */
  async marcarComoLido(
    usuarioId: string,
    workspaceId: string,
    alertaId: string,
  ) {
    const alerta = await this.prisma.alerta.findFirst({
      where: {
        id: alertaId,
        usuarioId,
        workspaceId,
      },
    });

    if (!alerta) {
      throw new NotFoundException('Alerta não encontrado.');
    }

    return this.prisma.alerta.update({
      where: { id: alertaId },
      data: {
        lido: true,
        dataLeitura: new Date(),
      },
    });
  }

  /**
   * Operação atômica updateMany para marcar todos os alertas não lidos do usuarioId + workspaceId como lidos.
   */
  async marcarTodosComoLidos(usuarioId: string, workspaceId: string) {
    const resultado = await this.prisma.alerta.updateMany({
      where: {
        usuarioId,
        workspaceId,
        lido: false,
      },
      data: {
        lido: true,
        dataLeitura: new Date(),
      },
    });

    return { count: resultado.count };
  }
}
