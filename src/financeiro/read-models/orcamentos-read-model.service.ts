import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TipoMovimentacao } from '@prisma/client';

export type EstadoOrcamento = 'NORMAL' | 'ALERTA' | 'ATENCAO' | 'EXCEDIDO';

export interface ItemOrcamentoConsumo {
  id: string;
  categoriaId: string;
  categoriaNome: string;
  categoriaIcone?: string | null;
  categoriaCor?: string | null;
  mes: number;
  ano: number;
  teto: number;
  valorConsumido: number;
  valorDisponivel: number;
  percentualConsumido: number;
  estado: EstadoOrcamento;
}

@Injectable()
export class OrcamentosReadModelService {
  constructor(private readonly prisma: PrismaService) {}

  async obterOrcamentosComConsumo(
    workspaceId: string,
    ano: number,
    mes: number,
  ): Promise<ItemOrcamentoConsumo[]> {
    const dataInicio = new Date(ano, mes - 1, 1);
    const dataFim = new Date(ano, mes, 0, 23, 59, 59);

    // 1. Buscar todos os orçamentos cadastrados para o workspace/mês/ano
    const orcamentos = await this.prisma.orcamento.findMany({
      where: { workspaceId, mes, ano },
      include: { categoria: true },
    });

    if (orcamentos.length === 0) {
      return [];
    }

    // 2. Buscar todas as movimentações do Ledger (DESPESA e ESTORNO) no período
    const movimentacoesLedger = await this.prisma.movimentacaoFinanceira.findMany({
      where: {
        workspaceId,
        tipo: { in: [TipoMovimentacao.DESPESA, TipoMovimentacao.ESTORNO] },
        data: { gte: dataInicio, lte: dataFim },
      },
    });

    // Buscar IDs das despesas referenciadas no Ledger para mapear categoria
    const despesaIds = movimentacoesLedger
      .filter((m) => m.referenciaId && m.referenciaTipo === 'DESPESA')
      .map((m) => m.referenciaId as string);

    // REGRA DE OURO: Pagamento de fatura de cartão não consome orçamento
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

    // Map para acumular consumo do Ledger por categoria: categoriaId -> total
    const consumoLedgerPorCategoria = new Map<string, number>();

    for (const mov of movimentacoesLedger) {
      if (!mov.referenciaId) continue;
      // REGRA DE OURO: Se o movimento for pagamento de fatura de cartão, IGNORAR!
      if (faturaIdsSet.has(mov.referenciaId)) continue;

      const categoriaId = mapDespesaCategoria.get(mov.referenciaId);
      if (!categoriaId) continue;

      const valor = Number(mov.valor);
      const atual = consumoLedgerPorCategoria.get(categoriaId) || 0;

      if (mov.tipo === TipoMovimentacao.DESPESA) {
        consumoLedgerPorCategoria.set(categoriaId, atual + valor);
      } else if (mov.tipo === TipoMovimentacao.ESTORNO) {
        consumoLedgerPorCategoria.set(categoriaId, atual - valor);
      }
    }

    // 3. Buscar todas as ParcelasCartao daquele mês/ano
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

    // 4. Montar os itens de orçamento com consumo total e cálculo de estado
    return orcamentos.map((orc) => {
      const consumoLedger = consumoLedgerPorCategoria.get(orc.categoriaId) || 0;
      const consumoCartao = consumoCartaoPorCategoria.get(orc.categoriaId) || 0;
      const valorConsumido = Math.max(0, consumoLedger + consumoCartao);
      const teto = Number(orc.valorPlanejado);

      const percentualConsumido = teto > 0 ? (valorConsumido / teto) * 100 : 0;
      const percentualFormatado = Number(percentualConsumido.toFixed(2));

      let estado: EstadoOrcamento = 'NORMAL';
      if (percentualFormatado >= 100) {
        estado = 'EXCEDIDO';
      } else if (percentualFormatado >= 90) {
        estado = 'ATENCAO';
      } else if (percentualFormatado >= 70) {
        estado = 'ALERTA';
      }

      return {
        id: orc.id,
        categoriaId: orc.categoriaId,
        categoriaNome: orc.categoria.nome,
        categoriaIcone: orc.categoria.icone,
        categoriaCor: orc.categoria.cor,
        mes: orc.mes,
        ano: orc.ano,
        teto,
        valorConsumido,
        valorDisponivel: teto - valorConsumido,
        percentualConsumido: percentualFormatado,
        estado,
      };
    });
  }
}
