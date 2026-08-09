"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingCycleService = void 0;
const year_month_vo_1 = require("../../../domain/value-objects/year-month.vo");
class BillingCycleService {
    static calcularCompetenciaFatura(dataCompra, diaFechamento) {
        if (!dataCompra || isNaN(dataCompra.getTime())) {
            throw new Error('Data de compra inválida fornecida para o BillingCycleService.');
        }
        if (!Number.isInteger(diaFechamento) || diaFechamento < 1 || diaFechamento > 31) {
            throw new Error(`Dia de fechamento inválido: ${diaFechamento}`);
        }
        const diaCompra = dataCompra.getDate();
        const competenciaBase = year_month_vo_1.YearMonth.daData(dataCompra);
        if (diaCompra <= diaFechamento) {
            return competenciaBase;
        }
        return competenciaBase.obterProxima();
    }
    static calcularDataFechamento(competencia, diaFechamento) {
        const ultimoDiaDoMes = new Date(competencia.ano, competencia.mes, 0).getDate();
        const diaEfetivo = Math.min(diaFechamento, ultimoDiaDoMes);
        return new Date(competencia.ano, competencia.mes - 1, diaEfetivo, 23, 59, 59, 999);
    }
    static calcularDataVencimento(competencia, diaVencimento) {
        const ultimoDiaDoMes = new Date(competencia.ano, competencia.mes, 0).getDate();
        const diaEfetivo = Math.min(diaVencimento, ultimoDiaDoMes);
        return new Date(competencia.ano, competencia.mes - 1, diaEfetivo, 23, 59, 59, 999);
    }
}
exports.BillingCycleService = BillingCycleService;
//# sourceMappingURL=billing-cycle.service.js.map