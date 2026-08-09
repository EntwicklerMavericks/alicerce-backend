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
exports.ComprasCartaoController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const compras_cartao_service_1 = require("./compras-cartao.service");
const criar_compra_cartao_dto_1 = require("./dto/criar-compra-cartao.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
let ComprasCartaoController = class ComprasCartaoController {
    comprasCartaoService;
    constructor(comprasCartaoService) {
        this.comprasCartaoService = comprasCartaoService;
    }
    async registrarCompra(dto) {
        return this.comprasCartaoService.registrarCompra(dto);
    }
};
exports.ComprasCartaoController = ComprasCartaoController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Registrar nova compra em cartão de crédito (parcelamento atômico em faturas)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Compra e parcelas registradas com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Fatura fechada ou concorrência detectada' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [criar_compra_cartao_dto_1.CriarCompraCartaoDto]),
    __metadata("design:returntype", Promise)
], ComprasCartaoController.prototype, "registrarCompra", null);
exports.ComprasCartaoController = ComprasCartaoController = __decorate([
    (0, swagger_1.ApiTags)('Compras no Cartão de Crédito'),
    (0, common_1.Controller)('api/v1/financeiro/compras-cartao'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [compras_cartao_service_1.ComprasCartaoService])
], ComprasCartaoController);
//# sourceMappingURL=compras-cartao.controller.js.map