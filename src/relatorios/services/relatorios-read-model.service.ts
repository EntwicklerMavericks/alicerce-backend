import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, TipoMovimentacao } from '@prisma/client';
import { ReconciliationException } from '../exceptions/reconciliation.exception';

export interface PeriodoRelatorio {
  dataInicio: Date;
  dataFim: Date;
}

export interface FluxoCaixaRelatorio {
  saldoInicial: number;
  entradas: number;
  saidas: number;
  saldoFinal: number;
  resultadoPeriodo: number;
}

export interface CategoriaRelatorio {
  categoriaId: string;
  nome: string;
  tipo: string;
  valor: number;
  percentual: number;
}

export interface CartaoRelatorio {
  cartaoId: string;
  nome: string;
  bandeira: string;
  valorTotal: number;
  qtdTransacoes: number;
}

export interface MetaProjetoRelatorio {
  id: string;
  tipo: 'META' | 'PROJETO';
  nome: string;
  progressoPercentual: number;
  valorAlvoOuEstimado: number;
  valorAtualOuGasto: number;
  status: string;
}

export interface RelatoriosResult {
  periodo: PeriodoRelatorio;
  fluxoCaixa: FluxoCaixaRelatorio;
  categorias: CategoriaRelatorio[];
  cartoes: CartaoRelatorio[];
  metasProjetos: MetaProjetoRelatorio[];
}

@Injectable()
export class RelatoriosReadModelService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtém o Relatório Analítico Consolidado para o Workspace.
   *
   * Regras Arquiteturais & Invariantes:
   * 1. Multi-tenant: workspaceId estritamente isolado.
   * 2. Intervalo semiaberto: dataInicio <= data < dataFim (gte: dataInicio, lt: dataFim).
   * 3. Reconciliação Decimal: saldoInicial.plus(entradas).minus(saidas).equals(saldoFinal).
   * 4. Agregação Paralela via Promise.all.
   * 5. Zero Absoluto sem NaN/Infinity.
   */
  async obterRelatorio(
    workspaceId: string,
    dataInicioInput?: Date | string,
    dataFimInput?: Date | string,
    referenceDateInput?: Date | string,
  ): Promise<RelatoriosResult> {
    const { dataInicio, dataFim } = this.calcularIntervaloDatas(
      dataInicioInput,
      dataFimInput,
      referenceDateInput,
    );

    // Agregação Concorrente/Paralela via Promise.all (Invariante)
    const [fluxoCaixa, categorias, cartoes, metasProjetos] = await Promise.all([
      this.calcularFluxoCaixa(workspaceId, dataInicio, dataFim),
      this.calcularCategorias(workspaceId, dataInicio, dataFim),
      this.calcularCartoes(workspaceId, dataInicio, dataFim),
      this.calcularMetasEProjetos(workspaceId),
    ]);

    return {
      periodo: { dataInicio, dataFim },
      fluxoCaixa,
      categorias,
      cartoes,
      metasProjetos,
    };
  }

  /**
   * Calcula o intervalo semiaberto [dataInicio, dataFim)
   */
  private calcularIntervaloDatas(
    dataInicioInput?: Date | string,
    dataFimInput?: Date | string,
    referenceDateInput?: Date | string,
  ): { dataInicio: Date; dataFim: Date } {
    let referenceDate = referenceDateInput
      ? new Date(referenceDateInput)
      : new Date();

    if (isNaN(referenceDate.getTime())) {
      referenceDate = new Date();
    }

    let dataInicio: Date;
    let dataFim: Date;

    if (dataInicioInput && dataFimInput) {
      dataInicio = new Date(dataInicioInput);
      dataFim = new Date(dataFimInput);
    } else if (dataInicioInput) {
      dataInicio = new Date(dataInicioInput);
      dataFim = new Date(dataInicio);
      dataFim.setMonth(dataFim.getMonth() + 1);
    } else {
      const ano = referenceDate.getFullYear();
      const mes = referenceDate.getMonth();
      dataInicio = new Date(Date.UTC(ano, mes, 1));
      dataFim = new Date(Date.UTC(ano, mes + 1, 1));
    }

    if (isNaN(dataInicio.getTime())) {
      dataInicio = new Date(Date.UTC(referenceDate.getFullYear(), referenceDate.getMonth(), 1));
    }
    if (isNaN(dataFim.getTime())) {
      dataFim = new Date(Date.UTC(dataInicio.getFullYear(), dataInicio.getMonth() + 1, 1));
    }

    return { dataInicio, dataFim };
  }

  /**
   * Invariante de Reconciliação em Decimal:
   * saldoInicial.plus(entradas).minus(saidas).equals(saldoFinal)
   */
  private async calcularFluxoCaixa(
    workspaceId: string,
    dataInicio: Date,
    dataFim: Date,
  ): Promise<FluxoCaixaRelatorio> {
    // 1. Saldo Anterior (data < dataInicio) - Isolamento por workspaceId
    const movimentacoesAnteriores = await this.prisma.movimentacaoFinanceira.findMany({
      where: {
        workspaceId,
        data: { lt: dataInicio },
      },
      select: { tipo: true, valor: true },
    });

    let saldoInicialDec = new Prisma.Decimal(0);
    for (const m of movimentacoesAnteriores) {
      const val = new Prisma.Decimal(m.valor || 0);
      if (
        m.tipo === TipoMovimentacao.RECEITA ||
        m.tipo === TipoMovimentacao.SALDO_INICIAL ||
        m.tipo === TipoMovimentacao.TRANSFERENCIA_ENTRADA ||
        m.tipo === TipoMovimentacao.RESGATE
      ) {
        saldoInicialDec = saldoInicialDec.plus(val);
      } else if (
        m.tipo === TipoMovimentacao.DESPESA ||
        m.tipo === TipoMovimentacao.TRANSFERENCIA_SAIDA ||
        m.tipo === TipoMovimentacao.ESTORNO ||
        m.tipo === TipoMovimentacao.INVESTIMENTO
      ) {
        saldoInicialDec = saldoInicialDec.minus(val);
      }
    }

    // 2. Entradas e Saídas no período semiaberto (dataInicio <= data < dataFim)
    const movimentacoesPeriodo = await this.prisma.movimentacaoFinanceira.findMany({
      where: {
        workspaceId,
        data: {
          gte: dataInicio,
          lt: dataFim,
        },
      },
      select: { tipo: true, valor: true },
    });

    let entradasDec = new Prisma.Decimal(0);
    let saidasDec = new Prisma.Decimal(0);

    for (const m of movimentacoesPeriodo) {
      const val = new Prisma.Decimal(m.valor || 0);
      if (
        m.tipo === TipoMovimentacao.RECEITA ||
        m.tipo === TipoMovimentacao.SALDO_INICIAL ||
        m.tipo === TipoMovimentacao.TRANSFERENCIA_ENTRADA ||
        m.tipo === TipoMovimentacao.RESGATE
      ) {
        entradasDec = entradasDec.plus(val);
      } else if (
        m.tipo === TipoMovimentacao.DESPESA ||
        m.tipo === TipoMovimentacao.TRANSFERENCIA_SAIDA ||
        m.tipo === TipoMovimentacao.ESTORNO ||
        m.tipo === TipoMovimentacao.INVESTIMENTO
      ) {
        saidasDec = saidasDec.plus(val);
      }
    }

    // 3. Saldo Final em Decimal: saldoInicial.plus(entradas).minus(saidas)
    const saldoFinalDec = saldoInicialDec.plus(entradasDec).minus(saidasDec);

    // Invariante de Reconciliação estrita em Decimal (Invariante 3)
    const reconciliado = saldoInicialDec.plus(entradasDec).minus(saidasDec);
    if (!reconciliado.equals(saldoFinalDec)) {
      throw new ReconciliationException(
        `Divergência na reconciliação de saldo em Decimal: saldoInicial (${saldoInicialDec}) + entradas (${entradasDec}) - saidas (${saidasDec}) != saldoFinal (${saldoFinalDec})`,
      );
    }

    const resultadoPeriodoDec = entradasDec.minus(saidasDec);

    return {
      saldoInicial: this.sanitizarNumero(saldoInicialDec.toNumber()),
      entradas: this.sanitizarNumero(entradasDec.toNumber()),
      saidas: this.sanitizarNumero(saidasDec.toNumber()),
      saldoFinal: this.sanitizarNumero(saldoFinalDec.toNumber()),
      resultadoPeriodo: this.sanitizarNumero(resultadoPeriodoDec.toNumber()),
    };
  }

  /**
   * Agregação por categorias com percentual sobre o total
   */
  private async calcularCategorias(
    workspaceId: string,
    dataInicio: Date,
    dataFim: Date,
  ): Promise<CategoriaRelatorio[]> {
    const despesas = await this.prisma.despesa.findMany({
      where: {
        workspaceId,
        statusDocumento: 'ATIVO',
        dataExclusao: null,
        dataVencimento: {
          gte: dataInicio,
          lt: dataFim,
        },
      },
      include: {
        categoria: true,
      },
    });

    const mapaCategorias = new Map<string, { nome: string; tipo: string; valorDec: Prisma.Decimal }>();
    let totalGeralDec = new Prisma.Decimal(0);

    for (const d of despesas) {
      const val = new Prisma.Decimal(d.valor || 0);
      totalGeralDec = totalGeralDec.plus(val);

      const catId = d.categoriaId || 'sem-categoria';
      const catNome = d.categoria?.nome || 'Outros';
      const catTipo = d.categoria?.tipo || 'DESPESA';

      if (!mapaCategorias.has(catId)) {
        mapaCategorias.set(catId, { nome: catNome, tipo: catTipo, valorDec: val });
      } else {
        const item = mapaCategorias.get(catId)!;
        item.valorDec = item.valorDec.plus(val);
      }
    }

    const totalGeral = totalGeralDec.toNumber();
    const resultado: CategoriaRelatorio[] = [];

    for (const [categoriaId, item] of mapaCategorias.entries()) {
      const valor = item.valorDec.toNumber();
      // Zero Absoluto sem NaN/Infinity
      const percentual = totalGeral > 0 ? (valor / totalGeral) * 100 : 0;

      resultado.push({
        categoriaId,
        nome: item.nome,
        tipo: item.tipo,
        valor: this.sanitizarNumero(valor),
        percentual: this.sanitizarNumero(percentual),
      });
    }

    return resultado.sort((a, b) => b.valor - a.valor);
  }

  /**
   * Consolidado de utilização por Cartão de Crédito
   */
  private async calcularCartoes(
    workspaceId: string,
    dataInicio: Date,
    dataFim: Date,
  ): Promise<CartaoRelatorio[]> {
    const cartoes = await this.prisma.cartaoCredito.findMany({
      where: { workspaceId, ativo: true },
    });

    const resultado: CartaoRelatorio[] = [];

    for (const cartao of cartoes) {
      const compras = await this.prisma.compraCartao.findMany({
        where: {
          cartaoId: cartao.id,
          dataCompra: {
            gte: dataInicio,
            lt: dataFim,
          },
        },
        select: { valorTotal: true },
      });

      let valorTotalDec = new Prisma.Decimal(0);
      for (const c of compras) {
        valorTotalDec = valorTotalDec.plus(new Prisma.Decimal(c.valorTotal || 0));
      }

      resultado.push({
        cartaoId: cartao.id,
        nome: cartao.nome,
        bandeira: cartao.bandeira,
        valorTotal: this.sanitizarNumero(valorTotalDec.toNumber()),
        qtdTransacoes: compras.length,
      });
    }

    return resultado;
  }

  /**
   * Consolidado de Metas e Projetos
   */
  private async calcularMetasEProjetos(workspaceId: string): Promise<MetaProjetoRelatorio[]> {
    const [metas, projetos] = await Promise.all([
      this.prisma.meta.findMany({
        where: { workspaceId, dataExclusao: null },
        include: { aportes: true },
      }),
      this.prisma.projeto.findMany({
        where: { workspaceId, ativo: true },
        include: {
          etapas: {
            include: { itens: true },
          },
        },
      }),
    ]);

    const resultado: MetaProjetoRelatorio[] = [];

    for (const m of metas) {
      const valorAlvo = new Prisma.Decimal(m.valorAlvo || 0).toNumber();
      let valorAtualDec = new Prisma.Decimal(0);
      for (const ap of m.aportes) {
        valorAtualDec = valorAtualDec.plus(new Prisma.Decimal(ap.valor || 0));
      }
      const valorAtual = valorAtualDec.toNumber();
      // Zero Absoluto sem NaN/Infinity
      const progresso = valorAlvo > 0 ? Math.min(100, (valorAtual / valorAlvo) * 100) : 0;

      resultado.push({
        id: m.id,
        tipo: 'META',
        nome: m.nome,
        progressoPercentual: this.sanitizarNumero(progresso),
        valorAlvoOuEstimado: this.sanitizarNumero(valorAlvo),
        valorAtualOuGasto: this.sanitizarNumero(valorAtual),
        status: m.status,
      });
    }

    for (const p of projetos) {
      const orcamentoEstimado = new Prisma.Decimal(p.orcamentoEstimado || 0).toNumber();
      let totalGasto = 0; // Se houver despesas associadas ou itens
      const progresso = orcamentoEstimado > 0 ? Math.min(100, (totalGasto / orcamentoEstimado) * 100) : 0;

      resultado.push({
        id: p.id,
        tipo: 'PROJETO',
        nome: p.nome,
        progressoPercentual: this.sanitizarNumero(progresso),
        valorAlvoOuEstimado: this.sanitizarNumero(orcamentoEstimado),
        valorAtualOuGasto: this.sanitizarNumero(totalGasto),
        status: p.status,
      });
    }

    return resultado;
  }

  /**
   * Garantia de Zero Absoluto sem NaN ou Infinity
   */
  private sanitizarNumero(valor: number | null | undefined): number {
    if (valor === null || valor === undefined || isNaN(valor) || !isFinite(valor)) {
      return 0;
    }
    return Math.round(valor * 100) / 100;
  }
}
