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
exports.OrcamentosController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const orcamentos_service_1 = require("./orcamentos.service");
const criar_orcamento_dto_1 = require("./dto/criar-orcamento.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const current_workspace_decorator_1 = require("../../common/decorators/current-workspace.decorator");
let OrcamentosController = class OrcamentosController {
    orcamentosService;
    constructor(orcamentosService) {
        this.orcamentosService = orcamentosService;
    }
    async criarOuAtualizar(workspaceId, dto) {
        return this.orcamentosService.criarOuAtualizar(workspaceId, dto);
    }
    async listar(workspaceId, ano, mes) {
        const anoNum = ano ? parseInt(ano, 10) : undefined;
        const mesNum = mes ? parseInt(mes, 10) : undefined;
        return this.orcamentosService.listarComConsumo(workspaceId, mesNum, anoNum);
    }
    async remover(workspaceId, id) {
        return this.orcamentosService.remover(workspaceId, id);
    }
};
exports.OrcamentosController = OrcamentosController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Criar ou atualizar teto de orçamento para uma categoria no mês/ano' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Orçamento salvo com sucesso' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, criar_orcamento_dto_1.CriarOrcamentoDto]),
    __metadata("design:returntype", Promise)
], OrcamentosController.prototype, "criarOuAtualizar", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar orçamentos com consumo contábil e estados (NORMAL, ALERTA, ATENCAO, EXCEDIDO)' }),
    (0, swagger_1.ApiQuery)({ name: 'ano', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'mes', required: false, type: Number }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Query)('ano')),
    __param(2, (0, common_1.Query)('mes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], OrcamentosController.prototype, "listar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Remover um orçamento' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrcamentosController.prototype, "remover", null);
exports.OrcamentosController = OrcamentosController = __decorate([
    (0, swagger_1.ApiTags)('Orçamentos'),
    (0, common_1.Controller)('orcamentos'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [orcamentos_service_1.OrcamentosService])
], OrcamentosController);
//# sourceMappingURL=orcamentos.controller.js.map