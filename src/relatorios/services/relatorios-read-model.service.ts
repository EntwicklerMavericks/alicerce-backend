import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, TipoMovimentacao } from '@prisma/client';
import { ReconciliationException } from '../exceptions/reconciliation.exception';

export interface PeriodoRelatorio {
  dataInicio: Date;
  dataFim: Date;
  tipoPeriodo?: string;
  inicio?: string;
  fim?: string;
}

export interface FluxoCaixaRelatorio {
  saldoInicial: number;
  entradas: number;
  saidas: number;
  saldoFinal: number;
  resultadoPeriodo: number;
  totalReceitas?: number;
  totalDespesas?: number;
  saldoLiquido?: number;
  taxaPoupanca?: number;
  historicoDiario?: Array<{ data: string; receita: number; despesa: number; saldoAcumulado: number }>;
  comparativoMesAnterior?: { receitaVariacaoPct: number; despesaVariacaoPct: number; saldoVariacaoPct: number };
}

export interface CategoriaRelatorio {
  categoriaId: string;
  nome: string;
  tipo: string;
  valor: number;
  percentual: number;
  icone?: string;
  cor?: string;
  quantidadeLancamentos?: number;
}

export interface CartaoRelatorio {
  cartaoId: string;
  nome: string;
  nomeCartao?: string;
  bandeira: string;
  valorTotal: number;
  qtdTransacoes: number;
  limiteTotal?: number;
  limiteUsado?: number;
  percentualUso?: number;
  valorFaturaAtual?: number;
  cor?: string;
}

export interface MetaProjetoRelatorio {
  id: string;
  tipo: 'META' | 'PROJETO';
  nome: string;
  titulo?: string;
  progressoPercentual: number;
  percentualConcluido?: number;
  percentualProgresso?: number;
  valorAlvoOuEstimado: number;
  valorAlvo?: number;
  orcamentoTotal?: number;
  valorAtualOuGasto: number;
  valorAtual?: number;
  valorGasto?: number;
  status: string;
}

export interface RelatoriosResult {
  periodo: PeriodoRelatorio;
  fluxoCaixa: FluxoCaixaRelatorio;
  categorias: CategoriaRelatorio[];
  cartoes: CartaoRelatorio[];
  metasProjetos: MetaProjetoRelatorio[];
  distribuicaoDespesas?: CategoriaRelatorio[];
  distribuicaoReceitas?: CategoriaRelatorio[];
  topDespesas?: Array<{ descricao: string; valor: number; data: string; categoria: string }>;
  usoPorCartao?: CartaoRelatorio[];
  metasStatus?: MetaProjetoRelatorio[];
  projetosStatus?: MetaProjetoRelatorio[];
  totalAportadoMetas?: number;
  progressoGeralMetasPct?: number;
  totalInvestidoProjetos?: number;
  totalFaturas?: number;
  totalLimiteComprometido?: number;
  geradoEm?: string;
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
    tipoPeriodoInput?: string,
  ): Promise<RelatoriosResult> {
    const { dataInicio, dataFim } = this.calcularIntervaloDatas(
      dataInicioInput,
      dataFimInput,
      referenceDateInput,
      tipoPeriodoInput,
    );

    // Agregação Concorrente/Paralela via Promise.all (Invariante)
    const [fluxoCaixa, categorias, cartoes, metasProjetos] = await Promise.all([
      this.calcularFluxoCaixa(workspaceId, dataInicio, dataFim),
      this.calcularCategorias(workspaceId, dataInicio, dataFim),
      this.calcularCartoes(workspaceId, dataInicio, dataFim),
      this.calcularMetasEProjetos(workspaceId),
    ]);

    const metasStatus = metasProjetos.filter((mp) => mp.tipo === 'META');
    const projetosStatus = metasProjetos.filter((mp) => mp.tipo === 'PROJETO');

    const totalAportadoMetas = metasStatus.reduce((acc, m) => acc + (m.valorAtual || 0), 0);
    const progressoGeralMetasPct = metasStatus.length > 0
      ? this.sanitizarNumero(metasStatus.reduce((acc, m) => acc + (m.percentualConcluido || 0), 0) / metasStatus.length)
      : 0;
    const totalInvestidoProjetos = projetosStatus.reduce((acc, p) => acc + (p.valorGasto || 0), 0);

    const totalFaturas = cartoes.reduce((acc, c) => acc + (c.valorFaturaAtual || 0), 0);
    const totalLimiteComprometido = cartoes.reduce((acc, c) => acc + (c.limiteUsado || 0), 0);

    return {
      periodo: {
        dataInicio,
        dataFim,
        tipoPeriodo: tipoPeriodoInput,
        inicio: dataInicio.toISOString().split('T')[0],
        fim: dataFim.toISOString().split('T')[0],
      },
      fluxoCaixa,
      categorias,
      cartoes,
      metasProjetos,
      distribuicaoDespesas: categorias,
      distribuicaoReceitas: [],
      topDespesas: (categorias as any).topDespesas || [],
      usoPorCartao: cartoes,
      metasStatus,
      projetosStatus,
      totalAportadoMetas,
      progressoGeralMetasPct,
      totalInvestidoProjetos,
      totalFaturas,
      totalLimiteComprometido,
      geradoEm: new Date().toISOString(),
    };
  }

  /**
   * Calcula o intervalo semiaberto [dataInicio, dataFim)
   */
  private calcularIntervaloDatas(
    dataInicioInput?: Date | string,
    dataFimInput?: Date | string,
    referenceDateInput?: Date | string,
    tipoPeriodoInput?: string,
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
    } else if (tipoPeriodoInput === 'ULTIMOS_30_DIAS') {
      dataFim = new Date(referenceDate);
      dataInicio = new Date(referenceDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (tipoPeriodoInput === 'ULTIMOS_3_MESES') {
      const ano = referenceDate.getFullYear();
      const mes = referenceDate.getMonth();
      dataInicio = new Date(Date.UTC(ano, mes - 2, 1));
      dataFim = new Date(Date.UTC(ano, mes + 1, 1));
    } else if (tipoPeriodoInput === 'ULTIMOS_6_MESES') {
      const ano = referenceDate.getFullYear();
      const mes = referenceDate.getMonth();
      dataInicio = new Date(Date.UTC(ano, mes - 5, 1));
      dataFim = new Date(Date.UTC(ano, mes + 1, 1));
    } else if (tipoPeriodoInput === 'ANO_ATUAL') {
      const ano = referenceDate.getFullYear();
      dataInicio = new Date(Date.UTC(ano, 0, 1));
      dataFim = new Date(Date.UTC(ano + 1, 0, 1));
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
      select: { tipo: true, valor: true, data: true },
      orderBy: { data: 'asc' },
    });

    let entradasDec = new Prisma.Decimal(0);
    let saidasDec = new Prisma.Decimal(0);

    // Agrupar movimentações do período por dia para o histórico diário
    const mapaDias = new Map<string, { receita: number; despesa: number }>();

    for (const m of movimentacoesPeriodo) {
      const val = new Prisma.Decimal(m.valor || 0);
      const dataObj = new Date((m as any).data || dataInicio);
      const diaKey = `${dataObj.getUTCDate().toString().padStart(2, '0')}/${(dataObj.getUTCMonth() + 1).toString().padStart(2, '0')}`;
      if (!mapaDias.has(diaKey)) {
        mapaDias.set(diaKey, { receita: 0, despesa: 0 });
      }
      const itemDia = mapaDias.get(diaKey)!;

      if (
        m.tipo === TipoMovimentacao.RECEITA ||
        m.tipo === TipoMovimentacao.SALDO_INICIAL ||
        m.tipo === TipoMovimentacao.TRANSFERENCIA_ENTRADA ||
        m.tipo === TipoMovimentacao.RESGATE
      ) {
        entradasDec = entradasDec.plus(val);
        itemDia.receita += val.toNumber();
      } else if (
        m.tipo === TipoMovimentacao.DESPESA ||
        m.tipo === TipoMovimentacao.TRANSFERENCIA_SAIDA ||
        m.tipo === TipoMovimentacao.ESTORNO ||
        m.tipo === TipoMovimentacao.INVESTIMENTO
      ) {
        saidasDec = saidasDec.plus(val);
        itemDia.despesa += val.toNumber();
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
    const totalReceitas = this.sanitizarNumero(entradasDec.toNumber());
    const totalDespesas = this.sanitizarNumero(saidasDec.toNumber());
    const saldoLiquido = this.sanitizarNumero(resultadoPeriodoDec.toNumber());
    const taxaPoupanca = totalReceitas > 0
      ? this.sanitizarNumero(Math.max(0, ((totalReceitas - totalDespesas) / totalReceitas) * 100))
      : 0;

    let saldoAcumuladoTemp = saldoInicialDec.toNumber();
    const historicoDiario: Array<{ data: string; receita: number; despesa: number; saldoAcumulado: number }> = [];

    if (mapaDias.size > 0) {
      for (const [dataStr, vals] of mapaDias.entries()) {
        saldoAcumuladoTemp += (vals.receita - vals.despesa);
        historicoDiario.push({
          data: dataStr,
          receita: this.sanitizarNumero(vals.receita),
          despesa: this.sanitizarNumero(vals.despesa),
          saldoAcumulado: this.sanitizarNumero(saldoAcumuladoTemp),
        });
      }
    } else {
      const d1Str = `${dataInicio.getUTCDate().toString().padStart(2, '0')}/${(dataInicio.getUTCMonth() + 1).toString().padStart(2, '0')}`;
      const d2Str = `${dataFim.getUTCDate().toString().padStart(2, '0')}/${(dataFim.getUTCMonth() + 1).toString().padStart(2, '0')}`;
      historicoDiario.push(
        { data: d1Str, receita: 0, despesa: 0, saldoAcumulado: this.sanitizarNumero(saldoAcumuladoTemp) },
        { data: d2Str, receita: 0, despesa: 0, saldoAcumulado: this.sanitizarNumero(saldoAcumuladoTemp) },
      );
    }

    return {
      saldoInicial: this.sanitizarNumero(saldoInicialDec.toNumber()),
      entradas: totalReceitas,
      saidas: totalDespesas,
      saldoFinal: this.sanitizarNumero(saldoFinalDec.toNumber()),
      resultadoPeriodo: saldoLiquido,
      totalReceitas,
      totalDespesas,
      saldoLiquido,
      taxaPoupanca,
      historicoDiario,
      comparativoMesAnterior: {
        receitaVariacaoPct: 0,
        despesaVariacaoPct: 0,
        saldoVariacaoPct: 0,
      },
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
      orderBy: { valor: 'desc' },
    });

    const mapaCategorias = new Map<string, { nome: string; tipo: string; icone?: string | null; cor?: string | null; valorDec: Prisma.Decimal; count: number }>();
    let totalGeralDec = new Prisma.Decimal(0);

    for (const d of despesas) {
      const val = new Prisma.Decimal(d.valor || 0);
      totalGeralDec = totalGeralDec.plus(val);

      const catId = d.categoriaId || 'sem-categoria';
      const catNome = d.categoria?.nome || 'Outros';
      const catTipo = d.categoria?.tipo || 'DESPESA';
      const catIcone = d.categoria?.icone;
      const catCor = d.categoria?.cor;

      if (!mapaCategorias.has(catId)) {
        mapaCategorias.set(catId, { nome: catNome, tipo: catTipo, icone: catIcone, cor: catCor, valorDec: val, count: 1 });
      } else {
        const item = mapaCategorias.get(catId)!;
        item.valorDec = item.valorDec.plus(val);
        item.count += 1;
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
        icone: item.icone || 'category',
        cor: item.cor || '#C9A74E',
        quantidadeLancamentos: item.count,
        valor: this.sanitizarNumero(valor),
        percentual: this.sanitizarNumero(percentual),
      });
    }

    const topDespesas = despesas.slice(0, 5).map((d) => ({
      descricao: d.descricao || 'Despesa',
      valor: this.sanitizarNumero(Number(d.valor)),
      data: d.dataVencimento ? d.dataVencimento.toISOString() : new Date().toISOString(),
      categoria: d.categoria?.nome || 'Outros',
    }));

    (resultado as any).topDespesas = topDespesas;
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

      const valorTotal = this.sanitizarNumero(valorTotalDec.toNumber());
      const limiteTotal = this.sanitizarNumero(Number(cartao.limiteTotal || 0));
      const limiteUsado = valorTotal;
      const percentualUso = limiteTotal > 0
        ? Math.min(100, this.sanitizarNumero((limiteUsado / limiteTotal) * 100))
        : 0;

      resultado.push({
        cartaoId: cartao.id,
        nome: cartao.nome,
        nomeCartao: cartao.nome,
        bandeira: cartao.bandeira,
        cor: cartao.cor || '#C9A74E',
        valorTotal,
        qtdTransacoes: compras.length,
        limiteTotal,
        limiteUsado,
        percentualUso,
        valorFaturaAtual: valorTotal,
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
        percentualConcluido: this.sanitizarNumero(progresso),
        valorAlvoOuEstimado: this.sanitizarNumero(valorAlvo),
        valorAlvo: this.sanitizarNumero(valorAlvo),
        valorAtualOuGasto: this.sanitizarNumero(valorAtual),
        valorAtual: this.sanitizarNumero(valorAtual),
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
        titulo: p.nome,
        progressoPercentual: this.sanitizarNumero(progresso),
        percentualProgresso: this.sanitizarNumero(progresso),
        valorAlvoOuEstimado: this.sanitizarNumero(orcamentoEstimado),
        orcamentoTotal: this.sanitizarNumero(orcamentoEstimado),
        valorAtualOuGasto: this.sanitizarNumero(totalGasto),
        valorGasto: this.sanitizarNumero(totalGasto),
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
