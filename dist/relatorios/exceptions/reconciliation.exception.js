"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReconciliationException = void 0;
const domain_exception_1 = require("../../financeiro/domain/exceptions/domain.exception");
class ReconciliationException extends domain_exception_1.DomainException {
    constructor(message) {
        super(message || 'Divergência detectada na reconciliação do saldo contábil em Decimal.');
        this.name = 'ReconciliationException';
    }
}
exports.ReconciliationException = ReconciliationException;
//# sourceMappingURL=reconciliation.exception.js.map