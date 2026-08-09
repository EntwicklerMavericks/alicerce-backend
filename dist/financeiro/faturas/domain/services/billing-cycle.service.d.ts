import { YearMonth } from '../../../domain/value-objects/year-month.vo';
export declare class BillingCycleService {
    static calcularCompetenciaFatura(dataCompra: Date, diaFechamento: number): YearMonth;
    static calcularDataFechamento(competencia: YearMonth, diaFechamento: number): Date;
    static calcularDataVencimento(competencia: YearMonth, diaVencimento: number): Date;
}
