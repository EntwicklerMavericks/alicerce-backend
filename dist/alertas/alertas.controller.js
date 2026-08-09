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
exports.AlertasController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const alertas_service_1 = require("./alertas.service");
const listar_alertas_query_dto_1 = require("./dto/listar-alertas-query.dto");
const gerar_alertas_dto_1 = require("./dto/gerar-alertas.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const current_workspace_decorator_1 = require("../common/decorators/current-workspace.decorator");
let AlertasController = class AlertasController {
    alertasService;
    constructor(alertasService) {
        this.alertasService = alertasService;
    }
    async listar(usuarioId, workspaceId, query) {
        return this.alertasService.listarAlertas(usuarioId, workspaceId, query);
    }
    async contarNaoLidos(usuarioId, workspaceId) {
        return this.alertasService.contarNaoLidos(usuarioId, workspaceId);
    }
    async marcarTodosComoLidos(usuarioId, workspaceId) {
        return this.alertasService.marcarTodosComoLidos(usuarioId, workspaceId);
    }
    async marcarComoLido(usuarioId, workspaceId, id) {
        return this.alertasService.marcarComoLido(usuarioId, workspaceId, id);
    }
    async gerar(usuarioId, workspaceId, dto) {
        const contexto = {
            referenceDate: dto.referenceDate ? new Date(dto.referenceDate) : new Date(),
            despesas: dto.despesas,
            faturas: dto.faturas,
            orcamentos: dto.orcamentos,
            metas: dto.metas,
            salarios: dto.salarios,
            wishlist: dto.wishlist,
            sistemas: dto.sistemas,
        };
        return this.alertasService.gerarESalvarAlertas(usuarioId, workspaceId, contexto);
    }
};
exports.AlertasController = AlertasController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lista os alertas paginados com filtros de severidade e status de leitura' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, listar_alertas_query_dto_1.ListarAlertasQueryDto]),
    __metadata("design:returntype", Promise)
], AlertasController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)('nao-lidos/count'),
    (0, swagger_1.ApiOperation)({ summary: 'Retorna a quantidade total de alertas não lidos' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AlertasController.prototype, "contarNaoLidos", null);
__decorate([
    (0, common_1.Patch)('ler-todos'),
    (0, swagger_1.ApiOperation)({ summary: 'Marca todos os alertas não lidos do workspace como lidos' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AlertasController.prototype, "marcarTodosComoLidos", null);
__decorate([
    (0, common_1.Patch)(':id/ler'),
    (0, swagger_1.ApiOperation)({ summary: 'Marca um alerta específico como lido' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(2, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AlertasController.prototype, "marcarComoLido", null);
__decorate([
    (0, common_1.Post)('gerar'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Gera e persiste alertas com base no contexto fornecido e regras de idempotência' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, gerar_alertas_dto_1.GerarAlertasDto]),
    __metadata("design:returntype", Promise)
], AlertasController.prototype, "gerar", null);
exports.AlertasController = AlertasController = __decorate([
    (0, swagger_1.ApiTags)('Alertas'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('alertas'),
    __metadata("design:paramtypes", [alertas_service_1.AlertasService])
], AlertasController);
//# sourceMappingURL=alertas.controller.js.map