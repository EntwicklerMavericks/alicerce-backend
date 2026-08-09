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
exports.CartoesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cartoes_service_1 = require("./cartoes.service");
const criar_cartao_dto_1 = require("./dto/criar-cartao.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
let CartoesController = class CartoesController {
    cartoesService;
    constructor(cartoesService) {
        this.cartoesService = cartoesService;
    }
    async criarCartao(dto, req) {
        const workspaceId = req.user?.workspaceId || 'workspace-demo-id';
        return this.cartoesService.criarCartao(workspaceId, dto);
    }
    async listarCartoes(req) {
        const workspaceId = req.user?.workspaceId || 'workspace-demo-id';
        return this.cartoesService.listarCartoes(workspaceId);
    }
    async obterPorId(id) {
        return this.cartoesService.obterPorId(id);
    }
};
exports.CartoesController = CartoesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Cadastrar um novo cartão de crédito' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Cartão de crédito criado com sucesso' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [criar_cartao_dto_1.CriarCartaoDto, Object]),
    __metadata("design:returntype", Promise)
], CartoesController.prototype, "criarCartao", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar cartões de crédito do workspace com limites projetados' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de cartões retornada com sucesso' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CartoesController.prototype, "listarCartoes", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter detalhes de um cartão de crédito por ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID do cartão' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cartão encontrado' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CartoesController.prototype, "obterPorId", null);
exports.CartoesController = CartoesController = __decorate([
    (0, swagger_1.ApiTags)('Cartões de Crédito'),
    (0, common_1.Controller)('api/v1/financeiro/cartoes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [cartoes_service_1.CartoesService])
], CartoesController);
//# sourceMappingURL=cartoes.controller.js.map