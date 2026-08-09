"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConcurrencyConflictException = void 0;
const common_1 = require("@nestjs/common");
class ConcurrencyConflictException extends common_1.ConflictException {
    constructor(message = 'Conflito de concorrência ao atualizar o recurso. Tente novamente.') {
        super(message);
        this.name = 'ConcurrencyConflictException';
    }
}
exports.ConcurrencyConflictException = ConcurrencyConflictException;
//# sourceMappingURL=concurrency-conflict.exception.js.map