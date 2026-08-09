export declare class Money {
    readonly valorEmCentavos: bigint;
    private constructor();
    static deReais(valor: number): Money;
    static deCentavos(centavos: bigint): Money;
    static zero(): Money;
    paraReais(): number;
    somar(outro: Money): Money;
    subtrair(outro: Money): Money;
    multiplicarPorPercentual(percentual: bigint): Money;
    multiplicarPorInteiro(fator: bigint): Money;
    isZero(): boolean;
    isNegative(): boolean;
    isPositive(): boolean;
    isZeroOrNegative(): boolean;
    equals(outro: Money): boolean;
    maiorQue(outro: Money): boolean;
    menorQue(outro: Money): boolean;
}
