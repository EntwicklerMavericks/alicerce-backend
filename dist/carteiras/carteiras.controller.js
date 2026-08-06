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
exports.CarteirasController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const carteiras_service_1 = require("./carteiras.service");
const criar_carteira_dto_1 = require("./dto/criar-carteira.dto");
const transferir_fundos_dto_1 = require("./dto/transferir-fundos.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_workspace_decorator_1 = require("../common/decorators/current-workspace.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let CarteirasController = class CarteirasController {
    carteirasService;
    constructor(carteirasService) {
        this.carteirasService = carteirasService;
    }
    async criar(workspaceId, usuarioId, dto) {
        return this.carteirasService.criar(workspaceId, usuarioId, dto);
    }
    async listarPorWorkspace(workspaceId) {
        return this.carteirasService.listarPorWorkspace(workspaceId);
    }
    async obterPorId(workspaceId, id) {
        return this.carteirasService.obterPorId(workspaceId, id);
    }
    async obterExtrato(workspaceId, id) {
        return this.carteirasService.obterExtrato(workspaceId, id);
    }
    async transferirFundos(workspaceId, usuarioId, dto) {
        return this.carteirasService.transferirFundos(workspaceId, usuarioId, dto);
    }
    async remover(workspaceId, id) {
        await this.carteirasService.remover(workspaceId, id);
    }
};
exports.CarteirasController = CarteirasController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Cadastra uma nova carteira/conta financeiras' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, criar_carteira_dto_1.CriarCarteiraDto]),
    __metadata("design:returntype", Promise)
], CarteirasController.prototype, "criar", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lista todas as carteiras e o saldo total do workspace' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CarteirasController.prototype, "listarPorWorkspace", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Retorna os detalhes de uma carteira específica com seu saldo' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CarteirasController.prototype, "obterPorId", null);
__decorate([
    (0, common_1.Get)(':id/extrato'),
    (0, swagger_1.ApiOperation)({ summary: 'Retorna o extrato recente de movimentações da carteira' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CarteirasController.prototype, "obterExtrato", null);
__decorate([
    (0, common_1.Post)('transferir'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Realiza uma transferência atômica de saldo entre duas carteiras' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, transferir_fundos_dto_1.TransferirFundosDto]),
    __metadata("design:returntype", Promise)
], CarteirasController.prototype, "transferirFundos", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Remove (soft delete) uma carteira' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CarteirasController.prototype, "remover", null);
exports.CarteirasController = CarteirasController = __decorate([
    (0, swagger_1.ApiTags)('Carteiras'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('carteiras'),
    __metadata("design:paramtypes", [carteiras_service_1.CarteirasService])
], CarteirasController);
//# sourceMappingURL=carteiras.controller.js.map