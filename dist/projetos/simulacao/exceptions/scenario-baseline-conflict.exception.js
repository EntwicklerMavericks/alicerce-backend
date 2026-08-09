"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScenarioBaselineConflictException = void 0;
const common_1 = require("@nestjs/common");
class ScenarioBaselineConflictException extends common_1.ConflictException {
    constructor(message = 'Conflito de baseline detectado. O projeto ou suas etapas foram modificados após a geração da simulação.') {
        super(message);
        this.name = 'ScenarioBaselineConflictException';
    }
}
exports.ScenarioBaselineConflictException = ScenarioBaselineConflictException;
//# sourceMappingURL=scenario-baseline-conflict.exception.js.map