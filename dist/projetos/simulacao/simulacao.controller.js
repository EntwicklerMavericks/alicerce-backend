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
exports.SimulacaoController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const current_workspace_decorator_1 = require("../../common/decorators/current-workspace.decorator");
const simulacao_service_1 = require("./simulacao.service");
const simular_cenario_projeto_dto_1 = require("./dto/simular-cenario-projeto.dto");
const aplicar_cenario_projeto_dto_1 = require("./dto/aplicar-cenario-projeto.dto");
let SimulacaoController = class SimulacaoController {
    simulacaoService;
    constructor(simulacaoService) {
        this.simulacaoService = simulacaoService;
    }
    async simular(workspaceId, id, dto) {
        return this.simulacaoService.simular(workspaceId, id, dto);
    }
    async aplicar(workspaceId, id, dto) {
        return this.simulacaoService.aplicar(workspaceId, id, dto);
    }
};
exports.SimulacaoController = SimulacaoController;
__decorate([
    (0, common_1.Post)(':id/simular'),
    (0, swagger_1.ApiOperation)({
        summary: 'Simular cenario executivo What-If (cobertura financeira, readiness e cronograma) em um projeto',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Projeção simulada gerada com sucesso sem alteração do estado base',
    }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, simular_cenario_projeto_dto_1.SimularCenarioProjetoDto]),
    __metadata("design:returntype", Promise)
], SimulacaoController.prototype, "simular", null);
__decorate([
    (0, common_1.Post)(':id/simular/aplicar'),
    (0, swagger_1.ApiOperation)({
        summary: 'Aplicar um cenário simulado no projeto com verificação de conflito de baseline e trava otimista (versao)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Cenário aplicado com sucesso no banco de dados',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Conflito de baseline detectado (versão do projeto alterada)',
    }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, aplicar_cenario_projeto_dto_1.AplicarCenarioProjetoDto]),
    __metadata("design:returntype", Promise)
], SimulacaoController.prototype, "aplicar", null);
exports.SimulacaoController = SimulacaoController = __decorate([
    (0, swagger_1.ApiTags)('Projetos - Simulação de Cenários Executivos'),
    (0, common_1.Controller)('projetos'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [simulacao_service_1.SimulacaoService])
], SimulacaoController);
//# sourceMappingURL=simulacao.controller.js.map