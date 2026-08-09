"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FluxoCaixaController = void 0;
const common_1 = require("@nestjs/common");
const fluxo_caixa_read_model_service_1 = require("./fluxo-caixa-read-model.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const current_workspace_decorator_1 = require("../../common/decorators/current-workspace.decorator");
let FluxoCaixaController = class FluxoCaixaController {
    readModelService;
    constructor(readModelService) {
        this.readModelService = readModelService;
    }
    obterResumo(workspaceId, mes, ano) {
        return this.readModelService.obterResumoMensal(workspaceId, mes ? parseInt(mes, 10) : undefined, ano ? parseInt(ano, 10) : undefined);
    }
};
exports.FluxoCaixaController = FluxoCaixaController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Query)('mes')),
    __param(2, (0, common_1.Query)('ano')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], FluxoCaixaController.prototype, "obterResumo", null);
exports.FluxoCaixaController = FluxoCaixaController = __decorate([
    (0, common_1.Controller)('financeiro/fluxo-caixa'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [fluxo_caixa_read_model_service_1.FluxoCaixaReadModelService])
], FluxoCaixaController);
//# sourceMappingURL=fluxo-caixa.controller.js.map