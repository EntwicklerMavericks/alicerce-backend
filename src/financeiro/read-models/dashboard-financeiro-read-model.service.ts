import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { YearMonth } from '../domain/value-objects/year-month.vo';

@Injectable()
export class DashboardFinanceiroReadModelService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * READ MODEL CONSOLIDADO CQRS:
   * Retorna em 1 única chamada otimizada todos os indicadores do Dashboard:
   * saldoAtual, saldoProjetado, fluxoDoPeriodo, cartoes, faturas e limites.
   */
  async obterResumoDashboard(workspaceId: string, competenciaISO?: string) {
    const ym = competenciaISO ? YearMonth.deStringISO(competenciaISO) : YearMonth.daData(new Date());

    const inicioMes = new Date(ym.ano, ym.mes - 1, 1);
    const fimMes = new Date(ym.ano, ym.mes, 0, 23, 59, 59, 999);

    // 1. Saldo Real do Ledger
    const resultEntradas = await this.prisma.movimentacaoFinanceira.aggregate({
      where: { workspaceId, tipo: 'ENTRADA' as any },
      _sum: { valor: true },
    });

    const resultSaidas = await this.prisma.movimentacaoFinanceira.aggregate({
      where: { workspaceId, tipo: 'SAIDA' as any },
      _sum: { valor: true },
    });

    const totalEntradas = Number(resultEntradas?._sum?.valor || 0);
    const totalSaidas = Number(resultSaidas?._sum?.valor || 0);
    const saldoAtual = totalEntradas - totalSaidas;

    // 2. Receitas Pendentes e Despesas Pendentes do mês
    const resultReceitasPendentes = await this.prisma.receita.aggregate({
      where: { workspaceId, statusLiquidacao: 'PENDENTE', statusDocumento: 'ATIVO' },
      _sum: { valor: true },
    });

    const resultDespesasPendentes = await this.prisma.despesa.aggregate({
      where: { workspaceId, statusLiquidacao: 'PENDENTE', statusDocumento: 'ATIVO' },
      _sum: { valor: true },
    });

    const receitasPendentes = Number(resultReceitasPendentes._sum.valor || 0);
    const despesasPendentes = Number(resultDespesasPendentes._sum.valor || 0);
    const saldoProjetado = saldoAtual + receitasPendentes - despesasPendentes;

    // 3. Fluxo do Período (Liquidado no mês)
    const resultReceitasMês = await this.prisma.receita.aggregate({
      where: {
        workspaceId,
        statusLiquidacao: 'LIQUIDADO',
        statusDocumento: 'ATIVO',
        dataLiquidacao: { gte: inicioMes, lte: fimMes },
      },
      _sum: { valor: true },
    });

    const resultDespesasMês = await this.prisma.despesa.aggregate({
      where: {
        workspaceId,
        statusLiquidacao: 'LIQUIDADO',
        statusDocumento: 'ATIVO',
        dataLiquidacao: { gte: inicioMes, lte: fimMes },
      },
      _sum: { valor: true },
    });

    const receitasLiquidadasMes = Number(resultReceitasMês._sum.valor || 0);
    const despesasLiquidadasMes = Number(resultDespesasMês._sum.valor || 0);
    const fluxoDoPeriodo = receitasLiquidadasMes - despesasLiquidadasMes;

    // 4. Cartões de Crédito e Limites
    const cartoesDb = await this.prisma.cartaoCredito.findMany({
      where: { workspaceId, ativo: true },
      include: {
        faturas: {
          include: {
            parcelas: true,
          },
        },
      },
    });

    const cartoes = cartoesDb.map((c) => {
      let limiteComprometido = 0;
      for (const fatura of c.faturas) {
        for (const parcela of fatura.parcelas) {
          if (parcela.status !== 'CANCELADA' && parcela.status !== 'PAGA') {
            limiteComprometido += Number(parcela.valor);
          }
        }
      }
      const limiteTotal = Number(c.limiteTotal);
      const limiteDisponivel = Math.max(0, limiteTotal - limiteComprometido);

      return {
        id: c.id,
        nome: c.nome,
        bandeira: c.bandeira,
        cor: c.cor,
        limiteTotal,
        limiteComprometido,
        limiteDisponivel,
      };
    });

    return {
      competencia: ym.formatarISO(),
      saldoAtual,
      saldoProjetado,
      fluxoDoPeriodo,
      receitasPendentes,
      despesasPendentes,
      receitasLiquidadasMes,
      despesasLiquidadasMes,
      cartoes,
    };
  }
}
