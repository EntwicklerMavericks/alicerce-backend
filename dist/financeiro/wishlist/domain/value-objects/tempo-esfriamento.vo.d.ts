export declare class TempoEsfriamentoVO {
    private readonly _dias;
    constructor(diasEsfriamento: number);
    get dias(): number;
    calcularDataFim(inicio: Date): Date;
    equals(other?: TempoEsfriamentoVO): boolean;
}
