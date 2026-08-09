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
exports.DespesasController = void 0;
const common_1 = require("@nestjs/common");
const despesas_service_1 = require("./despesas.service");
const criar_despesa_dto_1 = require("./dto/criar-despesa.dto");
const estornar_lancamento_dto_1 = require("../receitas/dto/estornar-lancamento.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const current_workspace_decorator_1 = require("../../common/decorators/current-workspace.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let DespesasController = class DespesasController {
    despesasService;
    constructor(despesasService) {
        this.despesasService = despesasService;
    }
    criar(workspaceId, usuarioId, dto) {
        return this.despesasService.criar(workspaceId, usuarioId, dto);
    }
    listar(workspaceId, mes, ano) {
        return this.despesasService.listarPorWorkspace(workspaceId, mes ? parseInt(mes, 10) : undefined, ano ? parseInt(ano, 10) : undefined);
    }
    darBaixa(workspaceId, usuarioId, id, carteiraId) {
        return this.despesasService.darBaixa(workspaceId, id, usuarioId, carteiraId);
    }
    estornar(workspaceId, usuarioId, id, dto) {
        return this.despesasService.estornar(workspaceId, id, usuarioId, dto);
    }
    remover(workspaceId, id) {
        return this.despesasService.remover(workspaceId, id);
    }
};
exports.DespesasController = DespesasController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, criar_despesa_dto_1.CriarDespesaDto]),
    __metadata("design:returntype", void 0)
], DespesasController.prototype, "criar", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Query)('mes')),
    __param(2, (0, common_1.Query)('ano')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], DespesasController.prototype, "listar", null);
__decorate([
    (0, common_1.Patch)(':id/baixa'),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)('carteiraId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], DespesasController.prototype, "darBaixa", null);
__decorate([
    (0, common_1.Post)(':id/estorno'),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, estornar_lancamento_dto_1.EstornarLancamentoDto]),
    __metadata("design:returntype", void 0)
], DespesasController.prototype, "estornar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DespesasController.prototype, "remover", null);
exports.DespesasController = DespesasController = __decorate([
    (0, common_1.Controller)('financeiro/despesas'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [despesas_service_1.DespesasService])
], DespesasController);
//# sourceMappingURL=despesas.controller.js.map