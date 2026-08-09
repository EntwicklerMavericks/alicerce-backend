import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StatusDocumento, StatusLiquidacao, TipoMovimentacao } from '@prisma/client';

export interface ResumoFluxoCaixa {
  mes: number;
  ano: number;
  saldoAtualLedger: number;
  totalReceitasLiquidadas: number;
  totalReceitasPendentes: number;
  totalDespesasLiquidadas: number;
  totalDespesasPendentes: number;
  saldoProjetado: number;
  fluxoDoPeriodo: number;
}

@Injectable()
export class FluxoCaixaReadModelService {
  constructor(private readonly prisma: PrismaService) {}

  async obterResumoMensal(workspaceId: string, mes?: number, ano?: number): Promise<ResumoFluxoCaixa> {
    const agora = new Date();
    const targetMes = mes || agora.getMonth() + 1;
    const targetAno = ano || agora.getFullYear();

    const dataInicio = new Date(targetAno, targetMes - 1, 1);
    const dataFim = new Date(targetAno, targetMes, 0, 23, 59, 59);

    // 1. Saldo Atual baseado no Financial Ledger (apenas movimentações liquidadas)
    const movimentacoesLedger = await this.prisma.movimentacaoFinanceira.findMany({
      where: { workspaceId },
      select: { tipo: true, valor: true },
    });

    let saldoAtualLedger = 0;
    for (const mov of movimentacoesLedger) {
      const val = Number(mov.valor);
      if (mov.tipo === TipoMovimentacao.RECEITA || mov.tipo === TipoMovimentacao.SALDO_INICIAL || mov.tipo === TipoMovimentacao.TRANSFERENCIA_ENTRADA) {
        saldoAtualLedger += val;
      } else if (mov.tipo === TipoMovimentacao.DESPESA || mov.tipo === TipoMovimentacao.TRANSFERENCIA_SAIDA) {
        saldoAtualLedger -= val;
      } else if (mov.tipo === TipoMovimentacao.ESTORNO) {
        // Estorno subtrai em receitas e soma em despesas, o valor contábil ajusta
        saldoAtualLedger -= val;
      }
    }

    // 2. Receitas do mês
    const receitasMes = await this.prisma.receita.findMany({
      where: {
        workspaceId,
        statusDocumento: StatusDocumento.ATIVO,
        data: { gte: dataInicio, lte: dataFim },
      },
    });

    let totalReceitasLiquidadas = 0;
    let totalReceitasPendentes = 0;
    for (const r of receitasMes) {
      const val = Number(r.valor);
      if (r.statusLiquidacao === StatusLiquidacao.LIQUIDADO) {
        totalReceitasLiquidadas += val;
      } else {
        totalReceitasPendentes += val;
      }
    }

    // 3. Despesas do mês
    const despesasMes = await this.prisma.despesa.findMany({
      where: {
        workspaceId,
        statusDocumento: StatusDocumento.ATIVO,
        dataExclusao: null,
        dataVencimento: { gte: dataInicio, lte: dataFim },
      },
    });

    let totalDespesasLiquidadas = 0;
    let totalDespesasPendentes = 0;
    for (const d of despesasMes) {
      const val = Number(d.valor);
      if (d.statusLiquidacao === StatusLiquidacao.LIQUIDADO) {
        totalDespesasLiquidadas += val;
      } else {
        totalDespesasPendentes += val;
      }
    }

    const fluxoDoPeriodo = totalReceitasLiquidadas - totalDespesasLiquidadas;
    const saldoProjetado = saldoAtualLedger + totalReceitasPendentes - totalDespesasPendentes;

    return {
      mes: targetMes,
      ano: targetAno,
      saldoAtualLedger,
      totalReceitasLiquidadas,
      totalReceitasPendentes,
      totalDespesasLiquidadas,
      totalDespesasPendentes,
      saldoProjetado,
      fluxoDoPeriodo,
    };
  }
}
