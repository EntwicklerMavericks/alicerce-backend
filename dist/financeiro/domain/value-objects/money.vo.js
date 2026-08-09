"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Money = void 0;
const invalid_money_exception_1 = require("../exceptions/invalid-money.exception");
class Money {
    valorEmCentavos;
    constructor(valorEmCentavos) {
        this.valorEmCentavos = valorEmCentavos;
    }
    static deReais(valor) {
        if (isNaN(valor) || !isFinite(valor)) {
            throw new invalid_money_exception_1.InvalidMoneyException('O valor numérico informado para Money é inválido.');
        }
        const centavos = BigInt(Math.round(valor * 100));
        return new Money(centavos);
    }
    static deCentavos(centavos) {
        return new Money(centavos);
    }
    static zero() {
        return new Money(0n);
    }
    paraReais() {
        return Number(this.valorEmCentavos) / 100;
    }
    somar(outro) {
        return new Money(this.valorEmCentavos + outro.valorEmCentavos);
    }
    subtrair(outro) {
        return new Money(this.valorEmCentavos - outro.valorEmCentavos);
    }
    multiplicarPorPercentual(percentual) {
        return new Money((this.valorEmCentavos * percentual) / 100n);
    }
    multiplicarPorInteiro(fator) {
        return new Money(this.valorEmCentavos * fator);
    }
    isZero() {
        return this.valorEmCentavos === 0n;
    }
    isNegative() {
        return this.valorEmCentavos < 0n;
    }
    isPositive() {
        return this.valorEmCentavos > 0n;
    }
    isZeroOrNegative() {
        return this.valorEmCentavos <= 0n;
    }
    equals(outro) {
        return this.valorEmCentavos === outro.valorEmCentavos;
    }
    maiorQue(outro) {
        return this.valorEmCentavos > outro.valorEmCentavos;
    }
    menorQue(outro) {
        return this.valorEmCentavos < outro.valorEmCentavos;
    }
}
exports.Money = Money;
//# sourceMappingURL=money.vo.js.map