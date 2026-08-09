import { Money } from '../value-objects/money.vo';
import { YearMonth } from '../value-objects/year-month.vo';

export interface ResultadoEsforcoMeta {
  mesesRestantes: number;
  valorMensalNecessario: Money;
  noPrazo: boolean;
}

export class CalculadoraEsforcoMetaService {
  /**
   * Calcula o esforço mensal necessário para atingir uma meta financeira.
   * Serviço de Domínio Puro sem dependências de framework ou persistência.
   */
  calcularEsforcoMensal(
    valorAlvo: Money,
    valorAcumulado: Money,
    prazo: YearMonth | null | undefined,
    competenciaAtual: YearMonth,
  ): ResultadoEsforcoMeta {
    // 1. Se valor acumulado já atingiu ou superou o alvo
    if (valorAcumulado.maiorQue(valorAlvo) || valorAcumulado.equals(valorAlvo)) {
      const mesesRestantes = prazo ? this.calcularDiferencaMeses(competenciaAtual, prazo) : 0;
      return {
        mesesRestantes: Math.max(0, mesesRestantes),
        valorMensalNecessario: Money.zero(),
        noPrazo: true,
      };
    }

    const valorRestante = valorAlvo.subtrair(valorAcumulado);

    // 2. Se não houver prazo especificado
    if (!prazo) {
      return {
        mesesRestantes: 0,
        valorMensalNecessario: valorRestante,
        noPrazo: true,
      };
    }

    // 3. Calcular meses restantes inclusive o mês atual
    const mesesRestantes = this.calcularDiferencaMeses(competenciaAtual, prazo);

    // 4. Se o prazo já venceu (mesesRestantes <= 0)
    if (mesesRestantes <= 0) {
      return {
        mesesRestantes: 0,
        valorMensalNecessario: valorRestante,
        noPrazo: false,
      };
    }

    // 5. Mês(es) suficiente(s) no prazo: calcular valor mensal arredondando pra cima em centavos
    const centavosRestantes = valorRestante.valorEmCentavos;
    const centavosMensais = (centavosRestantes + BigInt(mesesRestantes) - 1n) / BigInt(mesesRestantes);

    return {
      mesesRestantes,
      valorMensalNecessario: Money.deCentavos(centavosMensais),
      noPrazo: true,
    };
  }

  private calcularDiferencaMeses(inicio: YearMonth, fim: YearMonth): number {
    return (fim.ano - inicio.ano) * 12 + (fim.mes - inicio.mes) + 1;
  }
}
