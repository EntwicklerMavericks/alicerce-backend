import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  TimelineForecastReadModelService,
  TimelineForecastResult,
} from './timeline-forecast-read-model.service';
import {
  ProjetosReadModelService,
  ProjetoConsolidadoResult,
} from '../../../projetos/read-models/projetos-read-model.service';

export type StatusVencimentoCalendario = 'PENDENTE' | 'VENCIDO' | 'PROGRAMADO';
export type TipoTransacaoCalendario = 'RECEITA' | 'DESPESA';
export type OrigemCalendario = 'DESPESA' | 'RECEITA' | 'CARTAO' | 'RECORRENCIA';

export interface ItemCalendarioVencimento {
  id: string;
  descricao: string;
  valor: number;
  data: Date;
  tipo: TipoTransacaoCalendario;
  origem: OrigemCalendario;
  status: StatusVencimentoCalendario;
  categoriaId?: string | null;
  categoriaNome?: string | null;
}

export interface MetaDestaque {
  id: string;
  nome: string;
  descricao?: string | null;
  valorAlvo: number;
  valorAcumulado: number;
  distancia: number;
  progressoPercentual: number;
  status: string;
  prioridade: number;
  prazo?: Date | null;
  icone?: string | null;
  cor?: string | null;
  dataCriacao: Date;
}

export type EstadoOrcamentoOverview = 'NORMAL' | 'ALERTA' | 'ATENCAO' | 'EXCEDIDO';

export interface OrcamentoAlerta {
  id: string;
  categoriaId: string;
  categoriaNome: string;
  categoriaIcone?: string | null;
  categoriaCor?: string | null;
  mes: number;
  ano: number;
  limite: number;
  valorConsumido: number;
  valorDisponivel: number;
  percentualConsumido: number;
  estado: EstadoOrcamentoOverview;
}

export interface PeriodoOverview {
  inicio: Date;
  fim: Date;
}

export interface PlanningOverviewResult {
  referenceDate: Date;
  periodo: PeriodoOverview;
  resumoForecast: TimelineForecastResult;
  calendarioVencimentos: ItemCalendarioVencimento[];
  projetosGargalo: ProjetoConsolidadoResult[];
  metasDestaque: MetaDestaque[];
  orcamentosAlerta: OrcamentoAlerta[];
}

function arredondar(valor: number): number {
  if (isNaN(valor) || !isFinite(valor)) return 0;
  return Math.round(valor * 100) / 100;
}

@Injectable()
export class PlanningOverviewReadModelService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly timelineForecastReadModelService: TimelineForecastReadModelService,
    private readonly projetosReadModelService: ProjetosReadModelService,
  ) {}

  /**
   * Obtém a visão unificada do planejamento financeiro (Overview).
   *
   * Regras Arquiteturais:
   * - Não recalculador: Injeta e consome TimelineForecastReadModelService e ProjetosReadModelService diretamente.
   * - Usa PrismaService apenas para queries especializadas (Calendário 30 dias, Metas, Orçamentos).
   * - Executa todas as 5 seções em paralelo via Promise.all.
   */
  async obterVisaoUnificada(
    workspaceId: string,
    referenceDateInput?: Date | string,
  ): Promise<PlanningOverviewResult> {
    const referenceDate = referenceDateInput
      ? new Date(referenceDateInput)
      : new Date();

    const fim30Dias = new Date(
      referenceDate.getTime() + 30 * 24 * 60 * 60 * 1000,
    );

    // Invariante 2: Execução em Paralelo via Promise.all
    const [
      resumoForecast,
      projetosConsolidados,
      calendarioVencimentos,
      metasDestaque,
      orcamentosAlerta,
    ] = await Promise.all([
      // 1. Forecast de 12 meses via Read Model Canônico
      this.timelineForecastReadModelService.gerarProjecao(
        workspaceId,
        referenceDate,
      ),

      // 2. Projetos via Read Model Canônico
      this.projetosReadModelService.listarProjetosConsolidados(
        workspaceId,
        referenceDate,
      ),

      // 3. Calendário de Vencimentos (30 dias estritos)
      this.buscarCalendarioVencimentos(workspaceId, referenceDate, fim30Dias),

      // 4. Metas com Ordenação Multicritério Determinística
      this.buscarMetasDestaque(workspaceId),

      // 5. Orçamentos em Alerta do Mês com Tratamento de Limite Zero
      this.buscarOrcamentosAlerta(workspaceId, referenceDate),
    ]);

    return {
      referenceDate,
      periodo: {
        inicio: referenceDate,
        fim: fim30Dias,
      },
      resumoForecast,
      calendarioVencimentos,
      projetosGargalo: projetosConsolidados,
      metasDestaque,
      orcamentosAlerta,
    };
  }

  /**
   * Alias para obterVisaoUnificada
   */
  async obterOverview(
    workspaceId: string,
    referenceDateInput?: Date | string,
  ): Promise<PlanningOverviewResult> {
    return this.obterVisaoUnificada(workspaceId, referenceDateInput);
  }

  /**
   * Calendário de Vencimentos (30 dias)
   * Regra estrita: referenceDate < data <= referenceDate + 30 dias
   */
  private async buscarCalendarioVencimentos(
    workspaceId: string,
    referenceDate: Date,
    fim30Dias: Date,
  ): Promise<ItemCalendarioVencimento[]> {
    const [despesas, receitas, parcelasCartao, regrasRecorrencia] =
      await Promise.all([
        this.prisma.despesa.findMany({
          where: {
            workspaceId,
            statusDocumento: 'ATIVO',
            statusLiquidacao: 'PENDENTE',
            dataExclusao: null,
            dataVencimento: {
              gt: referenceDate,
              lte: fim30Dias,
            },
          },
          include: { categoria: true },
        }),
        this.prisma.receita.findMany({
          where: {
            workspaceId,
            statusDocumento: 'ATIVO',
            statusLiquidacao: 'PENDENTE',
            data: {
              gt: referenceDate,
              lte: fim30Dias,
            },
          },
          include: { categoria: true },
        }),
        this.prisma.parcelaCartao.findMany({
          where: {
            status: { not: 'CANCELADA' },
            compra: {
              cartao: { workspaceId, ativo: true },
            },
          },
          include: {
            compra: {
              include: { categoria: true, cartao: true },
            },
          },
        }),
        this.prisma.regraRecorrencia.findMany({
          where: {
            workspaceId,
            status: 'ATIVA',
          },
          include: { categoria: true },
        }),
      ]);

    const itens: ItemCalendarioVencimento[] = [];

    // Despesas Pendentes
    for (const d of despesas) {
      const dataVenc = new Date(d.dataVencimento);
      itens.push({
        id: d.id,
        descricao: d.descricao,
        valor: arredondar(Number(d.valor)),
        data: dataVenc,
        tipo: 'DESPESA',
        origem: d.recorrente ? 'RECORRENCIA' : 'DESPESA',
        status: this.determinarStatusCalendario(
          dataVenc,
          referenceDate,
          d.recorrente,
          d.recorrente ? 'RECORRENCIA' : 'DESPESA',
        ),
        categoriaId: d.categoriaId,
        categoriaNome: d.categoria?.nome,
      });
    }

    // Receitas Pendentes
    for (const r of receitas) {
      const dataRec = new Date(r.data);
      itens.push({
        id: r.id,
        descricao: r.descricao,
        valor: arredondar(Number(r.valor)),
        data: dataRec,
        tipo: 'RECEITA',
        origem: r.recorrente ? 'RECORRENCIA' : 'RECEITA',
        status: this.determinarStatusCalendario(
          dataRec,
          referenceDate,
          r.recorrente,
          r.recorrente ? 'RECORRENCIA' : 'RECEITA',
        ),
        categoriaId: r.categoriaId,
        categoriaNome: r.categoria?.nome,
      });
    }

    // Parcelas de Cartão
    for (const p of parcelasCartao) {
      const diaVenc = Math.min(
        Math.max(1, p.compra.cartao.diaVencimento || 10),
        28,
      );
      const dataVenc = new Date(
        p.competenciaAno,
        p.competenciaMes - 1,
        diaVenc,
      );

      if (dataVenc > referenceDate && dataVenc <= fim30Dias) {
        itens.push({
          id: p.id,
          descricao: `${p.compra.descricao} (${p.numero}/${p.compra.qtdParcelas || 1})`,
          valor: arredondar(Number(p.valor)),
          data: dataVenc,
          tipo: 'DESPESA',
          origem: 'CARTAO',
          status: this.determinarStatusCalendario(
            dataVenc,
            referenceDate,
            false,
            'CARTAO',
          ),
          categoriaId: p.compra.categoriaId,
          categoriaNome: p.compra.categoria?.nome,
        });
      }
    }

    // Regras de Recorrência
    const mesesParaVerificar: { ano: number; mes: number }[] = [];
    let curr = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
    const end = new Date(fim30Dias.getFullYear(), fim30Dias.getMonth(), 1);
    while (curr <= end) {
      mesesParaVerificar.push({
        ano: curr.getFullYear(),
        mes: curr.getMonth() + 1,
      });
      curr.setMonth(curr.getMonth() + 1);
    }

    for (const r of regrasRecorrencia) {
      for (const m of mesesParaVerificar) {
        const diaVenc = Math.min(Math.max(1, r.diaVencimento || 1), 28);
        const dataVenc = new Date(m.ano, m.mes - 1, diaVenc);

        const inicioOk = r.dataInicio
          ? new Date(r.dataInicio) <= dataVenc
          : true;
        const fimOk = r.dataFim ? new Date(r.dataFim) >= dataVenc : true;

        if (inicioOk && fimOk && dataVenc > referenceDate && dataVenc <= fim30Dias) {
          const jaExiste = itens.some(
            (i) => i.descricao === r.descricao && i.data.getTime() === dataVenc.getTime(),
          );
          if (!jaExiste) {
            itens.push({
              id: `reg-${r.id}-${m.ano}-${m.mes}`,
              descricao: r.descricao,
              valor: arredondar(Number(r.valor)),
              data: dataVenc,
              tipo: r.tipo === 'RECEITA' ? 'RECEITA' : 'DESPESA',
              origem: 'RECORRENCIA',
              status: this.determinarStatusCalendario(
                dataVenc,
                referenceDate,
                true,
                'RECORRENCIA',
              ),
              categoriaId: r.categoriaId,
              categoriaNome: r.categoria?.nome,
            });
          }
        }
      }
    }

    // Ordenação determinística: por data ASC, depois id ASC
    itens.sort((a, b) => {
      const timeDiff = a.data.getTime() - b.data.getTime();
      if (timeDiff !== 0) return timeDiff;
      return a.id.localeCompare(b.id);
    });

    return itens;
  }

  private determinarStatusCalendario(
    dataItem: Date,
    referenceDate: Date,
    recorrente?: boolean,
    origem?: OrigemCalendario,
  ): StatusVencimentoCalendario {
    if (dataItem < referenceDate) {
      return 'VENCIDO';
    }
    if (recorrente || origem === 'RECORRENCIA' || origem === 'CARTAO') {
      return 'PROGRAMADO';
    }
    return 'PENDENTE';
  }

  /**
   * Metas com Ordenação Multicritério Determinística
   * Invariante 5:
   * 1. distancia ASC (distancia = Math.max(0, valorAlvo - valorAcumulado))
   * 2. progresso DESC
   * 3. dataCriacao ASC
   * 4. id ASC
   */
  private async buscarMetasDestaque(workspaceId: string): Promise<MetaDestaque[]> {
    const metas = await this.prisma.meta.findMany({
      where: {
        workspaceId,
        dataExclusao: null,
      },
      include: {
        aportes: true,
      },
    });

    const metasMapeadas: MetaDestaque[] = metas.map((meta) => {
      const valorAlvo = arredondar(Number(meta.valorAlvo));
      const valorAcumulado = arredondar(
        (meta.aportes || []).reduce(
          (sum, a) => sum + Number(a.valor),
          0,
        ),
      );

      const distancia = Math.max(0, arredondar(valorAlvo - valorAcumulado));

      const progressoRaw =
        valorAlvo > 0 ? (valorAcumulado / valorAlvo) * 100 : 0;
      const progressoPercentual = Math.min(100, arredondar(progressoRaw));

      return {
        id: meta.id,
        nome: meta.nome,
        descricao: meta.descricao,
        valorAlvo,
        valorAcumulado,
        distancia,
        progressoPercentual,
        status: meta.status,
        prioridade: meta.prioridade,
        prazo: meta.prazo,
        icone: meta.icone,
        cor: meta.cor,
        dataCriacao: meta.dataCriacao,
      };
    });

    metasMapeadas.sort((a, b) => {
      if (a.distancia !== b.distancia) {
        return a.distancia - b.distancia;
      }
      if (a.progressoPercentual !== b.progressoPercentual) {
        return b.progressoPercentual - a.progressoPercentual;
      }
      const timeA = new Date(a.dataCriacao).getTime();
      const timeB = new Date(b.dataCriacao).getTime();
      if (timeA !== timeB) {
        return timeA - timeB;
      }
      return a.id.localeCompare(b.id);
    });

    return metasMapeadas;
  }

  /**
   * Orçamentos em Alerta do Mês
   * Invariante 6: Thresholds Exatos & Proteção de Limite Zero
   */
  private async buscarOrcamentosAlerta(
    workspaceId: string,
    referenceDate: Date,
  ): Promise<OrcamentoAlerta[]> {
    const ano = referenceDate.getFullYear();
    const mes = referenceDate.getMonth() + 1;

    const dataInicio = new Date(ano, mes - 1, 1);
    const dataFim = new Date(ano, mes, 0, 23, 59, 59, 999);

    const orcamentos = await this.prisma.orcamento.findMany({
      where: { workspaceId, mes, ano },
      include: { categoria: true },
    });

    if (orcamentos.length === 0) {
      return [];
    }

    const movimentacoesLedger = await this.prisma.movimentacaoFinanceira.findMany({
      where: {
        workspaceId,
        tipo: { in: ['DESPESA', 'ESTORNO'] },
        data: { gte: dataInicio, lte: dataFim },
      },
    });

    const despesaIds = movimentacoesLedger
      .filter((m) => m.referenciaId && m.referenciaTipo === 'DESPESA')
      .map((m) => m.referenciaId as string);

    const faturasPagamento = despesaIds.length > 0
      ? await this.prisma.faturaCartao.findMany({
          where: { id: { in: despesaIds } },
          select: { id: true },
        })
      : [];
    const faturaIdsSet = new Set(faturasPagamento.map((f) => f.id));

    const despesasReferenciadas = despesaIds.length > 0
      ? await this.prisma.despesa.findMany({
          where: { id: { in: despesaIds } },
          select: { id: true, categoriaId: true },
        })
      : [];

    const mapDespesaCategoria = new Map<string, string>();
    for (const d of despesasReferenciadas) {
      mapDespesaCategoria.set(d.id, d.categoriaId);
    }

    const consumoLedgerPorCategoria = new Map<string, number>();
    for (const mov of movimentacoesLedger) {
      if (!mov.referenciaId) continue;
      if (faturaIdsSet.has(mov.referenciaId)) continue;

      const categoriaId = mapDespesaCategoria.get(mov.referenciaId);
      if (!categoriaId) continue;

      const valor = Number(mov.valor);
      const atual = consumoLedgerPorCategoria.get(categoriaId) || 0;

      if (mov.tipo === 'DESPESA') {
        consumoLedgerPorCategoria.set(categoriaId, atual + valor);
      } else if (mov.tipo === 'ESTORNO') {
        consumoLedgerPorCategoria.set(categoriaId, atual - valor);
      }
    }

    const parcelasCartao = await this.prisma.parcelaCartao.findMany({
      where: {
        competenciaAno: ano,
        competenciaMes: mes,
        status: { not: 'CANCELADA' },
        compra: {
          cartao: { workspaceId },
        },
      },
      include: {
        compra: { select: { categoriaId: true } },
      },
    });

    const consumoCartaoPorCategoria = new Map<string, number>();
    for (const p of parcelasCartao) {
      const catId = p.compra.categoriaId;
      const valor = Number(p.valor);
      const atual = consumoCartaoPorCategoria.get(catId) || 0;
      consumoCartaoPorCategoria.set(catId, atual + valor);
    }

    const resultado: OrcamentoAlerta[] = orcamentos.map((orc) => {
      const limite = arredondar(Number(orc.valorPlanejado || 0));
      const consumoLedger = consumoLedgerPorCategoria.get(orc.categoriaId) || 0;
      const consumoCartao = consumoCartaoPorCategoria.get(orc.categoriaId) || 0;
      const valorConsumido = arredondar(Math.max(0, consumoLedger + consumoCartao));

      let percentualConsumido = 0;
      let estado: EstadoOrcamentoOverview = 'NORMAL';

      if (limite === 0) {
        if (valorConsumido > 0) {
          percentualConsumido = 100;
          estado = 'EXCEDIDO';
        } else {
          percentualConsumido = 0;
          estado = 'NORMAL';
        }
      } else {
        percentualConsumido = arredondar((valorConsumido / limite) * 100);
        if (percentualConsumido >= 100) {
          estado = 'EXCEDIDO';
        } else if (percentualConsumido >= 90) {
          estado = 'ATENCAO';
        } else if (percentualConsumido >= 70) {
          estado = 'ALERTA';
        } else {
          estado = 'NORMAL';
        }
      }

      return {
        id: orc.id,
        categoriaId: orc.categoriaId,
        categoriaNome: orc.categoria.nome,
        categoriaIcone: orc.categoria.icone,
        categoriaCor: orc.categoria.cor,
        mes: orc.mes,
        ano: orc.ano,
        limite,
        valorConsumido,
        valorDisponivel: arredondar(limite - valorConsumido),
        percentualConsumido,
        estado,
      };
    });

    resultado.sort((a, b) => {
      if (b.percentualConsumido !== a.percentualConsumido) {
        return b.percentualConsumido - a.percentualConsumido;
      }
      return a.id.localeCompare(b.id);
    });

    return resultado;
  }
}
