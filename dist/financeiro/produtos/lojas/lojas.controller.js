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
exports.LojasController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const lojas_service_1 = require("./lojas.service");
const criar_loja_dto_1 = require("./dto/criar-loja.dto");
const jwt_auth_guard_1 = require("../../../auth/guards/jwt-auth.guard");
const current_workspace_decorator_1 = require("../../../common/decorators/current-workspace.decorator");
let LojasController = class LojasController {
    lojasService;
    constructor(lojasService) {
        this.lojasService = lojasService;
    }
    async criar(workspaceId, dto) {
        return this.lojasService.criar(workspaceId, dto);
    }
    async listar(workspaceId) {
        return this.lojasService.listarPorWorkspace(workspaceId);
    }
    async obterPorId(workspaceId, id) {
        return this.lojasService.obterPorId(workspaceId, id);
    }
    async atualizar(workspaceId, id, dto) {
        return this.lojasService.atualizar(workspaceId, id, dto);
    }
    async remover(workspaceId, id) {
        await this.lojasService.remover(workspaceId, id);
    }
};
exports.LojasController = LojasController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Cadastra uma nova loja customizada no workspace' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, criar_loja_dto_1.CriarLojaDto]),
    __metadata("design:returntype", Promise)
], LojasController.prototype, "criar", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lista lojas ativas do workspace e lojas globais do sistema' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LojasController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtém detalhes de uma loja específica' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LojasController.prototype, "obterPorId", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualiza uma loja customizada do workspace' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, criar_loja_dto_1.CriarLojaDto]),
    __metadata("design:returntype", Promise)
], LojasController.prototype, "atualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Remove (soft delete) uma loja do workspace' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LojasController.prototype, "remover", null);
exports.LojasController = LojasController = __decorate([
    (0, swagger_1.ApiTags)('Lojas'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('lojas'),
    __metadata("design:paramtypes", [lojas_service_1.LojasService])
], LojasController);
//# sourceMappingURL=lojas.controller.js.map