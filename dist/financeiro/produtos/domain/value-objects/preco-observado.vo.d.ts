import { Money } from '../../../domain/value-objects/money.vo';
export declare class PrecoObservado {
    readonly money: Money;
    private constructor();
    static deReais(valor: number): PrecoObservado;
    static deMoney(money: Money): PrecoObservado;
    paraReais(): number;
    equals(outro: PrecoObservado): boolean;
    maiorQue(outro: PrecoObservado): boolean;
    menorQue(outro: PrecoObservado): boolean;
}
