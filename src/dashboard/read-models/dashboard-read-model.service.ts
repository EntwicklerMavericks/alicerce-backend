import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LedgerService } from '../../financeiro/ledger/ledger.service';
import {
  PlanningOverviewReadModelService,
  MetaDestaque,
  OrcamentoAlerta,
} from '../../financeiro/planning/read-models/planning-overview-read-model.service';

export type SeveridadeAlerta = 'CRITICO' | 'ALTO' | 'MEDIO';

export type TipoAlertaDashboard =
  | 'DEFICIT_PROJETADO'
  | 'ORCAMENTO_EXCEDIDO'
  | 'FATURA_VENCIDA'
  | 'LANCAMENTO_ATRASADO';

export interface AlertaCritico {
  id: string;
  tipo: TipoAlertaDashboard;
  severidade: SeveridadeAlerta;
  titulo: string;
  mensagem: string;
  detalhes?: Record<string, any>;
  dataIdentificacao: Date;
}

export interface FaturaAberta {
  id: string;
  cartaoId: string;
  cartaoNome: string;
  cartaoCor?: string | null;
  cartaoIcone?: string | null;
  mes: number;
  ano: number;
  valorTotal: number;
  dataVencimento: Date;
  status: string;
}

export interface LancamentoAtrasadoItem {
  id: string;
  descricao: string;
  valor: number;
  tipo: 'RECEITA' | 'DESPESA';
  dataVencimento: Date;
  diasAtraso: number;
}

export interface DashboardResult {
  referenceDate: Date;
  saldoGlobal: number;
  faturasAbertas: FaturaAberta[];
  orcamentoMes: OrcamentoAlerta[];
  metasAtivas: MetaDestaque[];
  alertasCriticos: AlertaCritico[];
}

@Injectable()
export class DashboardReadModelService {
  constructor(
    private readonly ledgerService: LedgerService,
    private readonly planningOverviewReadModelService: PlanningOverviewReadModelService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Obtém a visão consolidada do Dashboard da Home.
   *
   * Regras Arquiteturais (Invariantes 1 a 6):
   * 1. Read Model Agregador Puro: Não recalcula regras de saldo, forecast, metas ou orçamentos.
   *    Injeta LedgerService e PlanningOverviewReadModelService diretamente.
   * 2. Concorrência Concorrente (Sem N+1): Executa todas as seções via Promise.all.
   * 3. Contrato Estrito DashboardResult: referenceDate, saldoGlobal, faturasAbertas, orcamentoMes, metasAtivas (máx 3), alertasCriticos.
   * 4. Alertas Canônicos: Sourced de PlanningOverviewReadModelService, Faturas e Lançamentos Atrasados.
   * 5. Limite Estrito de 3 Metas Prioritárias.
   * 6. Tratamento de Zero Absoluto sem NaN ou Infinity.
   */
  async obterDashboard(
    workspaceId: string,
    referenceDateInput?: Date | string,
  ): Promise<DashboardResult> {
    const referenceDate = referenceDateInput
      ? new Date(referenceDateInput)
      : new Date();

    // Execução paralela concorrente sem N+1 (Invariante 2)
    const [saldoGlobal, planningOverview, faturasAbertas, lancamentosAtrasados] =
      await Promise.all([
        this.ledgerService.obterSaldoGlobal(workspaceId, referenceDate),
        this.planningOverviewReadModelService.obterVisaoUnificada(
          workspaceId,
          referenceDate,
        ),
        this.buscarFaturasAbertas(workspaceId, referenceDate),
        this.buscarLancamentosAtrasados(workspaceId, referenceDate),
      ]);

    // Limite Estrito de 3 Metas Prioritárias (Invariante 5)
    const metasAtivas = (planningOverview.metasDestaque || [])
      .filter((m) => m.status === 'ATIVA')
      .slice(0, 3);

    // Mapeamento e Deduplicação Canônica de Alertas (Invariante 4)
    const alertasCriticos = this.mapearAlertasCriticos({
      referenceDate,
      resumoForecast: planningOverview.resumoForecast,
      orcamentosAlerta: planningOverview.orcamentosAlerta,
      faturasAbertas,
      lancamentosAtrasados,
    });

    return {
      referenceDate,
      saldoGlobal: this.sanitizarNumero(saldoGlobal),
      faturasAbertas,
      orcamentoMes: planningOverview.orcamentosAlerta || [],
      metasAtivas,
      alertasCriticos,
    };
  }

  /**
   * Consulta especializada via Prisma para Faturas Abertas/Fechadas/Atrasadas.
   */
  private async buscarFaturasAbertas(
    workspaceId: string,
    referenceDate: Date,
  ): Promise<FaturaAberta[]> {
    const faturasDb = await this.prisma.faturaCartao.findMany({
      where: {
        cartao: { workspaceId, ativo: true },
        status: { in: ['ABERTA', 'FECHADA', 'ATRASADA'] },
      },
      include: {
        cartao: true,
        parcelas: true,
      },
      orderBy: [{ ano: 'asc' }, { mes: 'asc' }],
    });

    const resultado: FaturaAberta[] = [];

    for (const f of faturasDb) {
      let valorTotal = 0;
      if (f.valorPago && Number(f.valorPago) > 0) {
        valorTotal = Number(f.valorPago);
      } else if (f.parcelas && f.parcelas.length > 0) {
        valorTotal = f.parcelas
          .filter((p) => p.status !== 'CANCELADA')
          .reduce((acc, p) => acc + Number(p.valor || 0), 0);
      }

      valorTotal = this.sanitizarNumero(valorTotal);

      resultado.push({
        id: f.id,
        cartaoId: f.cartaoId,
        cartaoNome: f.cartao.nome,
        cartaoCor: f.cartao.cor,
        cartaoIcone: f.cartao.icone,
        mes: f.mes,
        ano: f.ano,
        valorTotal,
        dataVencimento: new Date(f.dataVencimento),
        status: f.status,
      });
    }

    return resultado;
  }

  /**
   * Consulta especializada via Prisma para Lançamentos Atrasados (Despesas e Receitas).
   */
  private async buscarLancamentosAtrasados(
    workspaceId: string,
    referenceDate: Date,
  ): Promise<LancamentoAtrasadoItem[]> {
    const [despesasAtrasadas, receitasAtrasadas] = await Promise.all([
      this.prisma.despesa.findMany({
        where: {
          workspaceId,
          statusDocumento: 'ATIVO',
          statusLiquidacao: 'PENDENTE',
          dataExclusao: null,
          dataVencimento: { lt: referenceDate },
        },
      }),
      this.prisma.receita.findMany({
        where: {
          workspaceId,
          statusDocumento: 'ATIVO',
          statusLiquidacao: 'PENDENTE',
          data: { lt: referenceDate },
        },
      }),
    ]);

    const itens: LancamentoAtrasadoItem[] = [];

    for (const d of despesasAtrasadas) {
      const dataVenc = new Date(d.dataVencimento);
      const diffTime = referenceDate.getTime() - dataVenc.getTime();
      const diasAtraso = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      itens.push({
        id: d.id,
        descricao: d.descricao,
        valor: this.sanitizarNumero(Number(d.valor)),
        tipo: 'DESPESA',
        dataVencimento: dataVenc,
        diasAtraso: Math.max(1, diasAtraso),
      });
    }

    for (const r of receitasAtrasadas) {
      const dataRec = new Date(r.data);
      const diffTime = referenceDate.getTime() - dataRec.getTime();
      const diasAtraso = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      itens.push({
        id: r.id,
        descricao: r.descricao,
        valor: this.sanitizarNumero(Number(r.valor)),
        tipo: 'RECEITA',
        dataVencimento: dataRec,
        diasAtraso: Math.max(1, diasAtraso),
      });
    }

    itens.sort((a, b) => b.diasAtraso - a.diasAtraso || a.id.localeCompare(b.id));

    return itens;
  }

  /**
   * Consolida e deduplica alertas canônicos com severidade normalizada (Invariante 4).
   */
  private mapearAlertasCriticos(params: {
    referenceDate: Date;
    resumoForecast?: any;
    orcamentosAlerta?: OrcamentoAlerta[];
    faturasAbertas: FaturaAberta[];
    lancamentosAtrasados: LancamentoAtrasadoItem[];
  }): AlertaCritico[] {
    const {
      referenceDate,
      resumoForecast,
      orcamentosAlerta,
      faturasAbertas,
      lancamentosAtrasados,
    } = params;

    const mapAlertas = new Map<string, AlertaCritico>();

    const adicionarAlerta = (alerta: AlertaCritico) => {
      if (!mapAlertas.has(alerta.id)) {
        mapAlertas.set(alerta.id, alerta);
      }
    };

    // 1. DEFICIT_PROJETADO (From PlanningOverviewReadModelService / resumoForecast)
    if (resumoForecast && Array.isArray(resumoForecast.competencias)) {
      for (const comp of resumoForecast.competencias) {
        if (comp.zonaSaude === 'DEFICIT_PROJETADO' || comp.saldoProjetadoFinal < 0) {
          adicionarAlerta({
            id: `alert-deficit-${comp.competencia}`,
            tipo: 'DEFICIT_PROJETADO',
            severidade: 'CRITICO',
            titulo: `Déficit Projetado (${comp.exibicao || comp.competencia})`,
            mensagem: `Previsão de saldo negativo em ${comp.exibicao || comp.competencia}. Saldo projetado: R$ ${this.sanitizarNumero(comp.saldoProjetadoFinal).toFixed(2)}.`,
            detalhes: {
              competencia: comp.competencia,
              saldoProjetadoFinal: comp.saldoProjetadoFinal,
            },
            dataIdentificacao: referenceDate,
          });
        }
      }
    }

    // 2. ORCAMENTO_EXCEDIDO (From PlanningOverviewReadModelService / orcamentosAlerta)
    for (const orc of orcamentosAlerta || []) {
      if (orc.estado === 'EXCEDIDO' || orc.percentualConsumido >= 100) {
        adicionarAlerta({
          id: `alert-orcamento-${orc.id}`,
          tipo: 'ORCAMENTO_EXCEDIDO',
          severidade: 'CRITICO',
          titulo: `Orçamento Excedido: ${orc.categoriaNome}`,
          mensagem: `O orçamento para "${orc.categoriaNome}" excedeu o limite programado (${orc.percentualConsumido}% consumido).`,
          detalhes: {
            categoriaId: orc.categoriaId,
            limite: orc.limite,
            valorConsumido: orc.valorConsumido,
          },
          dataIdentificacao: referenceDate,
        });
      } else if (orc.estado === 'ATENCAO') {
        adicionarAlerta({
          id: `alert-orcamento-${orc.id}`,
          tipo: 'ORCAMENTO_EXCEDIDO',
          severidade: 'ALTO',
          titulo: `Orçamento Próximo do Limite: ${orc.categoriaNome}`,
          mensagem: `A categoria "${orc.categoriaNome}" atingiu ${orc.percentualConsumido}% do orçamento estipulado.`,
          detalhes: {
            categoriaId: orc.categoriaId,
            limite: orc.limite,
            valorConsumido: orc.valorConsumido,
          },
          dataIdentificacao: referenceDate,
        });
      } else if (orc.estado === 'ALERTA') {
        adicionarAlerta({
          id: `alert-orcamento-${orc.id}`,
          tipo: 'ORCAMENTO_EXCEDIDO',
          severidade: 'MEDIO',
          titulo: `Alerta de Consumo: ${orc.categoriaNome}`,
          mensagem: `A categoria "${orc.categoriaNome}" consumiu ${orc.percentualConsumido}% do orçamento estipulado.`,
          detalhes: {
            categoriaId: orc.categoriaId,
            limite: orc.limite,
            valorConsumido: orc.valorConsumido,
          },
          dataIdentificacao: referenceDate,
        });
      }
    }

    // 3. FATURA_VENCIDA (From Card queries)
    for (const fat of faturasAbertas) {
      if (fat.dataVencimento < referenceDate || fat.status === 'ATRASADA') {
        adicionarAlerta({
          id: `alert-fatura-${fat.id}`,
          tipo: 'FATURA_VENCIDA',
          severidade: 'CRITICO',
          titulo: `Fatura Vencida: ${fat.cartaoNome}`,
          mensagem: `Fatura do cartão ${fat.cartaoNome} no valor de R$ ${fat.valorTotal.toFixed(2)} está vencida.`,
          detalhes: {
            faturaId: fat.id,
            cartaoId: fat.cartaoId,
            valorTotal: fat.valorTotal,
            dataVencimento: fat.dataVencimento,
          },
          dataIdentificacao: referenceDate,
        });
      }
    }

    // 4. LANCAMENTO_ATRASADO (From specialized query)
    for (const item of lancamentosAtrasados) {
      const severidade: SeveridadeAlerta =
        item.tipo === 'DESPESA' ? 'CRITICO' : 'ALTO';
      adicionarAlerta({
        id: `alert-lancamento-${item.id}`,
        tipo: 'LANCAMENTO_ATRASADO',
        severidade,
        titulo: `Lançamento Atrasado: ${item.descricao}`,
        mensagem: `${item.tipo === 'DESPESA' ? 'Despesa' : 'Receita'} "${item.descricao}" no valor de R$ ${item.valor.toFixed(2)} está atrasada há ${item.diasAtraso} dia(s).`,
        detalhes: {
          lancamentoId: item.id,
          tipo: item.tipo,
          diasAtraso: item.diasAtraso,
        },
        dataIdentificacao: referenceDate,
      });
    }

    const ordemSeveridade: Record<SeveridadeAlerta, number> = {
      CRITICO: 1,
      ALTO: 2,
      MEDIO: 3,
    };

    const listaAlertas = Array.from(mapAlertas.values());

    listaAlertas.sort((a, b) => {
      const pA = ordemSeveridade[a.severidade] || 4;
      const pB = ordemSeveridade[b.severidade] || 4;
      if (pA !== pB) return pA - pB;
      return a.id.localeCompare(b.id);
    });

    return listaAlertas;
  }

  /**
   * Garantia de Zero Absoluto sem NaN ou Infinity (Invariante 6)
   */
  private sanitizarNumero(valor: number): number {
    if (isNaN(valor) || !isFinite(valor)) {
      return 0;
    }
    return Math.round(valor * 100) / 100;
  }
}
