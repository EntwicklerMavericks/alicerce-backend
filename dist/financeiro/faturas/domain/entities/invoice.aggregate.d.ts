import { Money } from '../../../domain/value-objects/money.vo';
import { YearMonth } from '../../../domain/value-objects/year-month.vo';
export type StatusFaturaDomain = 'ABERTA' | 'FECHADA' | 'PAGA';
export type StatusParcelaDomain = 'PENDENTE' | 'FATURADA' | 'PAGA' | 'CANCELADA';
export interface ParcelaCartaoItem {
    id: string;
    compraId: string;
    numero: number;
    valor: Money;
    competencia: YearMonth;
    status: StatusParcelaDomain;
}
export declare class InvoiceAggregate {
    readonly id: string;
    readonly cartaoId: string;
    readonly competencia: YearMonth;
    readonly dataVencimento: Date;
    private _status;
    private _parcelas;
    private _carteiraId?;
    private _dataPagamento?;
    constructor(id: string, cartaoId: string, competencia: YearMonth, dataVencimento: Date, status?: StatusFaturaDomain, parcelas?: ParcelaCartaoItem[], carteiraId?: string, dataPagamento?: Date);
    get status(): StatusFaturaDomain;
    get parcelas(): ReadonlyArray<ParcelaCartaoItem>;
    get carteiraId(): string | undefined;
    get dataPagamento(): Date | undefined;
    get valorTotal(): Money;
    fechar(): void;
    pagar(carteiraId: string, dataPagamento?: Date): void;
    adicionarParcela(parcela: ParcelaCartaoItem): void;
    cancelarParcela(parcelaId: string): void;
}
