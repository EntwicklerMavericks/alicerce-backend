import { Money } from '../value-objects/money.vo';
import { YearMonth } from '../value-objects/year-month.vo';
export interface ResultadoEsforcoMeta {
    mesesRestantes: number;
    valorMensalNecessario: Money;
    noPrazo: boolean;
}
export declare class CalculadoraEsforcoMetaService {
    calcularEsforcoMensal(valorAlvo: Money, valorAcumulado: Money, prazo: YearMonth | null | undefined, competenciaAtual: YearMonth): ResultadoEsforcoMeta;
    private calcularDiferencaMeses;
}
