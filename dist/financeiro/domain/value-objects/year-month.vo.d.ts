export declare class YearMonth {
    readonly ano: number;
    readonly mes: number;
    constructor(ano: number, mes: number);
    static deAnoMes(ano: number, mes: number): YearMonth;
    static daData(data: Date): YearMonth;
    static deStringISO(iso: string): YearMonth;
    obterProxima(): YearMonth;
    obterAnterior(): YearMonth;
    adicionarMeses(qtd: number): YearMonth;
    equals(outro: YearMonth): boolean;
    formatarISO(): string;
    formatarExibicao(): string;
}
