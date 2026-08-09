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
exports.CotacoesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const current_workspace_decorator_1 = require("../../common/decorators/current-workspace.decorator");
const cotacoes_service_1 = require("./cotacoes.service");
const registrar_cotacao_avulsa_dto_1 = require("./dto/registrar-cotacao-avulsa.dto");
const atualizar_preco_link_dto_1 = require("./dto/atualizar-preco-link.dto");
let CotacoesController = class CotacoesController {
    cotacoesService;
    constructor(cotacoesService) {
        this.cotacoesService = cotacoesService;
    }
    async registrarCotacaoAvulsa(workspaceId, dto) {
        return await this.cotacoesService.registrarCotacaoAvulsa(workspaceId, dto);
    }
    async obterComparador(workspaceId, itemWishlistId) {
        return await this.cotacoesService.obterComparadorItem(workspaceId, itemWishlistId);
    }
    async removerCotacaoAvulsa(workspaceId, id) {
        return await this.cotacoesService.removerCotacaoAvulsa(workspaceId, id);
    }
    async atualizarPrecoLink(workspaceId, id, dto) {
        return await this.cotacoesService.atualizarPrecoLink(workspaceId, id, dto);
    }
    async executarMonitoramento(workspaceId) {
        return await this.cotacoesService.executarMonitoramentoPrecos(workspaceId);
    }
};
exports.CotacoesController = CotacoesController;
__decorate([
    (0, common_1.Post)('avulsa'),
    (0, swagger_1.ApiOperation)({
        summary: 'Registrar cotação avulsa manual para um item da wishlist com validação cross-tenant',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Cotação avulsa registrada com sucesso' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, registrar_cotacao_avulsa_dto_1.RegistrarCotacaoAvulsaDto]),
    __metadata("design:returntype", Promise)
], CotacoesController.prototype, "registrarCotacaoAvulsa", null);
__decorate([
    (0, common_1.Get)('item/:itemWishlistId/comparador'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obter comparativo de cotações e ofertas consolidadas para um item da wishlist (ApexCharts format)',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payload do comparador obtido com sucesso' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('itemWishlistId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CotacoesController.prototype, "obterComparador", null);
__decorate([
    (0, common_1.Delete)('avulsa/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Remover (soft delete) uma cotação avulsa' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cotação avulsa desativada com sucesso' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CotacoesController.prototype, "removerCotacaoAvulsa", null);
__decorate([
    (0, common_1.Patch)('link/:id/preco'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar preço de um link de produto com controle de concorrência' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Preço do link atualizado' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, atualizar_preco_link_dto_1.AtualizarPrecoLinkDto]),
    __metadata("design:returntype", Promise)
], CotacoesController.prototype, "atualizarPrecoLink", null);
__decorate([
    (0, common_1.Post)('monitoramento'),
    (0, swagger_1.ApiOperation)({ summary: 'Executar job de monitoramento de preços para links do workspace' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Resumo da execução do monitoramento' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CotacoesController.prototype, "executarMonitoramento", null);
exports.CotacoesController = CotacoesController = __decorate([
    (0, swagger_1.ApiTags)('Cotações & Comparador'),
    (0, common_1.Controller)('cotacoes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [cotacoes_service_1.CotacoesService])
], CotacoesController);
//# sourceMappingURL=cotacoes.controller.js.map