"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrecoObservado = void 0;
const money_vo_1 = require("../../../domain/value-objects/money.vo");
const domain_exception_1 = require("../../../domain/exceptions/domain.exception");
class PrecoObservado {
    money;
    constructor(money) {
        this.money = money;
        if (!money || money.isZeroOrNegative()) {
            throw new domain_exception_1.DomainException('O valor do preço observado deve ser maior que zero.');
        }
    }
    static deReais(valor) {
        const money = money_vo_1.Money.deReais(valor);
        return new PrecoObservado(money);
    }
    static deMoney(money) {
        return new PrecoObservado(money);
    }
    paraReais() {
        return this.money.paraReais();
    }
    equals(outro) {
        return this.money.equals(outro.money);
    }
    maiorQue(outro) {
        return this.money.maiorQue(outro.money);
    }
    menorQue(outro) {
        return this.money.menorQue(outro.money);
    }
}
exports.PrecoObservado = PrecoObservado;
//# sourceMappingURL=preco-observado.vo.js.map