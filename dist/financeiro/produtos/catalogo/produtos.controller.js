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
exports.ProdutosController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const produtos_service_1 = require("./produtos.service");
const criar_produto_dto_1 = require("./dto/criar-produto.dto");
const atualizar_produto_dto_1 = require("./dto/atualizar-produto.dto");
const vincular_link_dto_1 = require("./dto/vincular-link.dto");
const atualizar_preco_link_dto_1 = require("./dto/atualizar-preco-link.dto");
const jwt_auth_guard_1 = require("../../../auth/guards/jwt-auth.guard");
const current_workspace_decorator_1 = require("../../../common/decorators/current-workspace.decorator");
let ProdutosController = class ProdutosController {
    produtosService;
    constructor(produtosService) {
        this.produtosService = produtosService;
    }
    async criar(workspaceId, dto) {
        return this.produtosService.criar(workspaceId, dto);
    }
    async listar(workspaceId, categoriaId) {
        return this.produtosService.listarPorWorkspace(workspaceId, categoriaId);
    }
    async obterPorId(workspaceId, id) {
        return this.produtosService.obterPorId(workspaceId, id);
    }
    async atualizar(workspaceId, id, dto) {
        return this.produtosService.atualizar(workspaceId, id, dto);
    }
    async remover(workspaceId, id) {
        await this.produtosService.remover(workspaceId, id);
    }
    async vincularLink(workspaceId, produtoId, dto) {
        return this.produtosService.vincularLink(workspaceId, produtoId, dto);
    }
    async atualizarPrecoLink(workspaceId, produtoId, linkId, dto) {
        return this.produtosService.atualizarPrecoLink(workspaceId, produtoId, linkId, dto);
    }
    async removerLink(workspaceId, produtoId, linkId) {
        await this.produtosService.removerLink(workspaceId, produtoId, linkId);
    }
    async adicionarImagem(workspaceId, produtoId, dto) {
        return this.produtosService.adicionarImagem(workspaceId, produtoId, dto);
    }
    async definirImagemPrincipal(workspaceId, produtoId, imagemId) {
        return this.produtosService.definirImagemPrincipal(workspaceId, produtoId, imagemId);
    }
    async removerImagem(workspaceId, produtoId, imagemId) {
        await this.produtosService.removerImagem(workspaceId, produtoId, imagemId);
    }
};
exports.ProdutosController = ProdutosController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Cadastra um novo produto no catálogo do workspace' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, criar_produto_dto_1.CriarProdutoDto]),
    __metadata("design:returntype", Promise)
], ProdutosController.prototype, "criar", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lista os produtos ativos do catálogo do workspace' }),
    (0, swagger_1.ApiQuery)({ name: 'categoriaId', required: false, type: String }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Query)('categoriaId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProdutosController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtém os detalhes de um produto específico com ofertas e imagens' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProdutosController.prototype, "obterPorId", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualiza as informações cadastrais de um produto' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, atualizar_produto_dto_1.AtualizarProdutoDto]),
    __metadata("design:returntype", Promise)
], ProdutosController.prototype, "atualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Remove (soft delete) um produto do catálogo' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProdutosController.prototype, "remover", null);
__decorate([
    (0, common_1.Post)(':id/links'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Vincular oferta/link de loja ao produto' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, vincular_link_dto_1.VincularLinkDto]),
    __metadata("design:returntype", Promise)
], ProdutosController.prototype, "vincularLink", null);
__decorate([
    (0, common_1.Put)(':id/links/:linkId'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualiza o preço observado do link com concorrência otimista' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('linkId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, atualizar_preco_link_dto_1.AtualizarPrecoLinkDto]),
    __metadata("design:returntype", Promise)
], ProdutosController.prototype, "atualizarPrecoLink", null);
__decorate([
    (0, common_1.Delete)(':id/links/:linkId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Remove (soft delete) o vínculo de link de um produto' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('linkId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ProdutosController.prototype, "removerLink", null);
__decorate([
    (0, common_1.Post)(':id/imagens'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Adiciona uma imagem ao produto' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ProdutosController.prototype, "adicionarImagem", null);
__decorate([
    (0, common_1.Post)(':id/imagens/:imagemId/principal'),
    (0, swagger_1.ApiOperation)({ summary: 'Define a imagem selecionada como a principal do produto' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('imagemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ProdutosController.prototype, "definirImagemPrincipal", null);
__decorate([
    (0, common_1.Delete)(':id/imagens/:imagemId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Remove (soft delete) uma imagem do produto' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('imagemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ProdutosController.prototype, "removerImagem", null);
exports.ProdutosController = ProdutosController = __decorate([
    (0, swagger_1.ApiTags)('Produtos'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('produtos'),
    __metadata("design:paramtypes", [produtos_service_1.ProdutosService])
], ProdutosController);
//# sourceMappingURL=produtos.controller.js.map