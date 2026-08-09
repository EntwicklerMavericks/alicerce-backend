import { YearMonth } from '../../../domain/value-objects/year-month.vo';

export class BillingCycleService {
  /**
   * Função pura de domínio para determinar a competência da fatura
   * baseada na data da compra e no dia de fechamento do cartão.
   *
   * @param dataCompra Data em que a transação ocorreu
   * @param diaFechamento Dia do mês em que a fatura fecha (1 a 31)
   */
  static calcularCompetenciaFatura(dataCompra: Date, diaFechamento: number): YearMonth {
    if (!dataCompra || isNaN(dataCompra.getTime())) {
      throw new Error('Data de compra inválida fornecida para o BillingCycleService.');
    }
    if (!Number.isInteger(diaFechamento) || diaFechamento < 1 || diaFechamento > 31) {
      throw new Error(`Dia de fechamento inválido: ${diaFechamento}`);
    }

    const diaCompra = dataCompra.getDate();
    const competenciaBase = YearMonth.daData(dataCompra);

    if (diaCompra <= diaFechamento) {
      return competenciaBase;
    }

    return competenciaBase.obterProxima();
  }

  /**
   * Calcula a data limite de fechamento para uma determinada competência e dia de fechamento.
   */
  static calcularDataFechamento(competencia: YearMonth, diaFechamento: number): Date {
    const ultimoDiaDoMes = new Date(competencia.ano, competencia.mes, 0).getDate();
    const diaEfetivo = Math.min(diaFechamento, ultimoDiaDoMes);
    return new Date(competencia.ano, competencia.mes - 1, diaEfetivo, 23, 59, 59, 999);
  }

  /**
   * Calcula a data de vencimento padrão para uma competência e dia de vencimento.
   */
  static calcularDataVencimento(competencia: YearMonth, diaVencimento: number): Date {
    const ultimoDiaDoMes = new Date(competencia.ano, competencia.mes, 0).getDate();
    const diaEfetivo = Math.min(diaVencimento, ultimoDiaDoMes);
    return new Date(competencia.ano, competencia.mes - 1, diaEfetivo, 23, 59, 59, 999);
  }
}
