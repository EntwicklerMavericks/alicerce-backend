"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TempoEsfriamentoVO = void 0;
const domain_exception_1 = require("../../../domain/exceptions/domain.exception");
class TempoEsfriamentoVO {
    _dias;
    constructor(diasEsfriamento) {
        if (typeof diasEsfriamento !== 'number' ||
            !Number.isInteger(diasEsfriamento) ||
            diasEsfriamento < 1 ||
            diasEsfriamento > 365) {
            throw new domain_exception_1.DomainException('O tempo de esfriamento deve ser um número inteiro entre 1 e 365 dias.');
        }
        this._dias = diasEsfriamento;
    }
    get dias() {
        return this._dias;
    }
    calcularDataFim(inicio) {
        if (!(inicio instanceof Date) || isNaN(inicio.getTime())) {
            throw new domain_exception_1.DomainException('Data de início inválida para cálculo de esfriamento.');
        }
        const fim = new Date(inicio.getTime());
        fim.setDate(fim.getDate() + this._dias);
        return fim;
    }
    equals(other) {
        if (!other || !(other instanceof TempoEsfriamentoVO)) {
            return false;
        }
        return this._dias === other._dias;
    }
}
exports.TempoEsfriamentoVO = TempoEsfriamentoVO;
//# sourceMappingURL=tempo-esfriamento.vo.js.map