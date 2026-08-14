import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MetaAggregate, AporteMetaItem } from '../domain/entities/meta.aggregate';
import { Money } from '../domain/value-objects/money.vo';
import { YearMonth } from '../domain/value-objects/year-month.vo';
import { CalculadoraEsforcoMetaService } from '../domain/services/calculadora-esforco-meta.service';

export interface MetaComEsforco {
  id: string;
  nome: string;
  descricao?: string | null;
  valorAlvo: number;
  valorAcumulado: number;
  progressoPercentual: number;
  status: string;
  prazo?: Date | null;
  prazoAnoMes?: string | null;
  icone?: string | null;
  cor?: string | null;
  prioridade: number;
  esforcoMensal: {
    mesesRestantes: number;
    valorMensalNecessario: number;
    noPrazo: boolean;
  };
  ritmo: 'EXCELENTE' | 'NO_RITMO' | 'ATRASADO' | 'CONCLUIDO';
  aportes?: any[];
  dataCriacao: Date;
  dataAtualizacao: Date;
}

@Injectable()
export class MetasReadModelService {
  private readonly calculadoraEsforco: CalculadoraEsforcoMetaService;

  constructor(private readonly prisma: PrismaService) {
    this.calculadoraEsforco = new CalculadoraEsforcoMetaService();
  }

  async listarMetasComCalculos(workspaceId: string): Promise<MetaComEsforco[]> {
    const metasDb = await this.prisma.meta.findMany({
      where: {
        workspaceId,
        dataExclusao: null,
      },
      include: {
        aportes: {
          orderBy: { data: 'desc' },
        },
      },
      orderBy: [{ prioridade: 'asc' }, { dataCriacao: 'desc' }],
    });

    const competenciaAtual = YearMonth.daData(new Date());

    return metasDb.map((m) => this.mapearParaMetaComCalculos(m, competenciaAtual));
  }

  async obterMetaDetalhadaPorId(workspaceId: string, metaId: string) {
    const metaDb = await this.prisma.meta.findFirst({
      where: {
        id: metaId,
        workspaceId,
        dataExclusao: null,
      },
      include: {
        aportes: {
          orderBy: { data: 'desc' },
        },
      },
    });

    if (!metaDb) {
      return null;
    }

    const competenciaAtual = YearMonth.daData(new Date());
    const resumo = this.mapearParaMetaComCalculos(metaDb, competenciaAtual);

    return {
      ...resumo,
      historicoAportes: metaDb.aportes.map((a) => ({
        id: a.id,
        valor: Number(a.valor),
        data: a.data,
        descricao: a.descricao,
        tipo: a.tipo,
        dataCriacao: a.dataCriacao,
      })),
    };
  }

  private mapearParaMetaComCalculos(metaDb: any, competenciaAtual: YearMonth): MetaComEsforco {
    const aportesDomain: AporteMetaItem[] = metaDb.aportes.map((a: any) => ({
      id: a.id,
      metaId: a.metaId,
      valor: Money.deReais(Number(a.valor)),
      data: a.data,
      descricao: a.descricao,
      dataCriacao: a.dataCriacao,
    }));

    const valorAlvoMoney = Money.deReais(Number(metaDb.valorAlvo));
    const prazoYearMonth = metaDb.prazo ? YearMonth.daData(metaDb.prazo) : undefined;

    const metaAggregate = new MetaAggregate(
      metaDb.id,
      metaDb.workspaceId,
      metaDb.nome,
      valorAlvoMoney,
      prazoYearMonth,
      metaDb.icone,
      metaDb.cor,
      metaDb.status as any,
      metaDb.descricao,
      metaDb.prioridade,
      aportesDomain,
    );

    const valorAcumuladoMoney = metaAggregate.valorAcumulado;
    const valorAcumuladoNum = valorAcumuladoMoney.paraReais();
    const valorAlvoNum = valorAlvoMoney.paraReais();

    const progressoRaw = valorAlvoNum > 0 ? (valorAcumuladoNum / valorAlvoNum) * 100 : 0;
    const progressoPercentual = Number(Math.min(100, progressoRaw).toFixed(2));

    const esforco = this.calculadoraEsforco.calcularEsforcoMensal(
      valorAlvoMoney,
      valorAcumuladoMoney,
      prazoYearMonth,
      competenciaAtual,
    );

    let ritmo: 'EXCELENTE' | 'NO_RITMO' | 'ATRASADO' | 'CONCLUIDO' = 'NO_RITMO';
    if (metaAggregate.status === 'CONCLUIDA' || progressoPercentual >= 100) {
      ritmo = 'CONCLUIDO';
    } else if (!esforco.noPrazo) {
      ritmo = 'ATRASADO';
    } else if (progressoPercentual >= 50 && esforco.mesesRestantes > 3) {
      ritmo = 'EXCELENTE';
    }

    return {
      id: metaDb.id,
      nome: metaDb.nome,
      descricao: metaDb.descricao,
      valorAlvo: valorAlvoNum,
      valorAcumulado: valorAcumuladoNum,
      progressoPercentual,
      status: metaAggregate.status,
      prazo: metaDb.prazo,
      prazoAnoMes: prazoYearMonth ? prazoYearMonth.formatarISO() : null,
      icone: metaDb.icone,
      cor: metaDb.cor,
      prioridade: metaDb.prioridade,
      esforcoMensal: {
        mesesRestantes: esforco.mesesRestantes,
        valorMensalNecessario: esforco.valorMensalNecessario.paraReais(),
        noPrazo: esforco.noPrazo,
      },
      ritmo,
      aportes: (metaDb.aportes || []).map((a: any) => ({
        id: a.id,
        metaId: a.metaId,
        valor: Number(a.valor),
        data: a.data,
        descricao: a.descricao,
        dataCriacao: a.dataCriacao,
      })),
      dataCriacao: metaDb.dataCriacao,
      dataAtualizacao: metaDb.dataAtualizacao,
    };
  }
}
