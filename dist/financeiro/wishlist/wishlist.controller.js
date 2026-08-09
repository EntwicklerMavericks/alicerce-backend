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
exports.WishlistController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const current_workspace_decorator_1 = require("../../common/decorators/current-workspace.decorator");
const wishlist_service_1 = require("./wishlist.service");
const wishlist_analytics_read_model_service_1 = require("./read-models/wishlist-analytics-read-model.service");
const criar_item_wishlist_dto_1 = require("./dto/criar-item-wishlist.dto");
const atualizar_item_wishlist_dto_1 = require("./dto/atualizar-item-wishlist.dto");
const vincular_produto_wishlist_dto_1 = require("./dto/vincular-produto-wishlist.dto");
const concluir_compra_wishlist_dto_1 = require("./dto/concluir-compra-wishlist.dto");
let WishlistController = class WishlistController {
    wishlistService;
    analyticsReadModelService;
    constructor(wishlistService, analyticsReadModelService) {
        this.wishlistService = wishlistService;
        this.analyticsReadModelService = analyticsReadModelService;
    }
    async criar(workspaceId, dto) {
        return this.wishlistService.criar(workspaceId, dto);
    }
    async listar(workspaceId, status, prioridade) {
        return this.wishlistService.listar(workspaceId, status, prioridade);
    }
    async obterAnalytics(workspaceId) {
        return this.analyticsReadModelService.obterAnalytics(workspaceId);
    }
    async obterPorId(workspaceId, id) {
        return this.wishlistService.obterPorId(workspaceId, id);
    }
    async vincularProduto(workspaceId, id, dto) {
        return this.wishlistService.vincularProduto(workspaceId, id, dto);
    }
    async desvincularProduto(workspaceId, id) {
        return this.wishlistService.desvincularProduto(workspaceId, id);
    }
    async desistir(workspaceId, id) {
        return this.wishlistService.desistir(workspaceId, id);
    }
    async concluirCompra(workspaceId, id, dto) {
        return this.wishlistService.concluirCompra(workspaceId, id, dto);
    }
    async planejar(workspaceId, id) {
        return this.wishlistService.planejar(workspaceId, id);
    }
    async atualizar(workspaceId, id, dto) {
        return this.wishlistService.atualizar(workspaceId, id, dto);
    }
    async remover(workspaceId, id) {
        return this.wishlistService.remover(workspaceId, id);
    }
};
exports.WishlistController = WishlistController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Criar um novo item na wishlist com período de esfriamento' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Item criado com sucesso' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, criar_item_wishlist_dto_1.CriarItemWishlistDto]),
    __metadata("design:returntype", Promise)
], WishlistController.prototype, "criar", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar itens da wishlist com cálculo do tempo restante de esfriamento' }),
    (0, swagger_1.ApiQuery)({ name: 'status', enum: client_1.StatusWishlist, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'prioridade', enum: client_1.PrioridadeWishlist, required: false }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('prioridade')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], WishlistController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)('analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter métricas de economia evitada e consumo consciente' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WishlistController.prototype, "obterAnalytics", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter detalhes de um item da wishlist por ID' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WishlistController.prototype, "obterPorId", null);
__decorate([
    (0, common_1.Post)(':id/vincular-produto'),
    (0, swagger_1.ApiOperation)({ summary: 'Vincular um produto do catálogo a um item da wishlist (valida isolamento multi-tenant)' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, vincular_produto_wishlist_dto_1.VincularProdutoWishlistDto]),
    __metadata("design:returntype", Promise)
], WishlistController.prototype, "vincularProduto", null);
__decorate([
    (0, common_1.Post)(':id/desvincular-produto'),
    (0, swagger_1.ApiOperation)({ summary: 'Desvincular o produto do catálogo do item da wishlist' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WishlistController.prototype, "desvincularProduto", null);
__decorate([
    (0, common_1.Post)(':id/desistir'),
    (0, swagger_1.ApiOperation)({ summary: 'Desistir da compra e congelar snapshot de valor economizado' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WishlistController.prototype, "desistir", null);
__decorate([
    (0, common_1.Post)(':id/comprar'),
    (0, swagger_1.ApiOperation)({ summary: 'Concluir compra, gerar Despesa no Ledger (idempotente) e atualizar item' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, concluir_compra_wishlist_dto_1.ConcluirCompraWishlistDto]),
    __metadata("design:returntype", Promise)
], WishlistController.prototype, "concluirCompra", null);
__decorate([
    (0, common_1.Post)(':id/planejar'),
    (0, swagger_1.ApiOperation)({ summary: 'Mudar status do item para PLANEJADO' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WishlistController.prototype, "planejar", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar informações de um item da wishlist' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, atualizar_item_wishlist_dto_1.AtualizarItemWishlistDto]),
    __metadata("design:returntype", Promise)
], WishlistController.prototype, "atualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Remover (soft delete) um item da wishlist' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WishlistController.prototype, "remover", null);
exports.WishlistController = WishlistController = __decorate([
    (0, swagger_1.ApiTags)('Wishlist'),
    (0, common_1.Controller)('wishlist'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [wishlist_service_1.WishlistService,
        wishlist_analytics_read_model_service_1.WishlistAnalyticsReadModelService])
], WishlistController);
//# sourceMappingURL=wishlist.controller.js.map