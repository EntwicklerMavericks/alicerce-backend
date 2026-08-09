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
exports.RecorrenciasController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const recorrencias_service_1 = require("./recorrencias.service");
const recurring_generator_service_1 = require("./recurring-generator.service");
const criar_regra_recorrencia_dto_1 = require("./dto/criar-regra-recorrencia.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const year_month_vo_1 = require("../domain/value-objects/year-month.vo");
let RecorrenciasController = class RecorrenciasController {
    recorrenciasService;
    generatorService;
    constructor(recorrenciasService, generatorService) {
        this.recorrenciasService = recorrenciasService;
        this.generatorService = generatorService;
    }
    async criarRegra(dto, req) {
        const workspaceId = req.user?.workspaceId || 'workspace-demo-id';
        return this.recorrenciasService.criarRegra(workspaceId, dto);
    }
    async listarRegras(req) {
        const workspaceId = req.user?.workspaceId || 'workspace-demo-id';
        return this.recorrenciasService.listarRegras(workspaceId);
    }
    async alternarStatus(id, status) {
        return this.recorrenciasService.alternarStatus(id, status);
    }
    async processarCompetencia(competenciaISO, req) {
        const workspaceId = req?.user?.workspaceId;
        const ym = competenciaISO ? year_month_vo_1.YearMonth.deStringISO(competenciaISO) : year_month_vo_1.YearMonth.daData(new Date());
        const totalGerados = await this.generatorService.processarCompetencia(ym, workspaceId);
        return {
            competencia: ym.formatarISO(),
            totalGerados,
        };
    }
};
exports.RecorrenciasController = RecorrenciasController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Cadastrar nova regra de lançamento recorrente' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Regra criada com sucesso' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [criar_regra_recorrencia_dto_1.CriarRegraRecorrenciaDto, Object]),
    __metadata("design:returntype", Promise)
], RecorrenciasController.prototype, "criarRegra", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar regras de recorrência do workspace' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de regras retornada com sucesso' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecorrenciasController.prototype, "listarRegras", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Alternar status da regra (ATIVA, PAUSADA, CANCELADA)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Status atualizado com sucesso' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RecorrenciasController.prototype, "alternarStatus", null);
__decorate([
    (0, common_1.Post)('processar-competencia'),
    (0, swagger_1.ApiOperation)({ summary: 'Processar e gerar lançamentos para uma competência (Idempotente)' }),
    (0, swagger_1.ApiQuery)({ name: 'competencia', description: 'Formato YYYY-MM (ex: 2026-08)', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lançamentos gerados com sucesso' }),
    __param(0, (0, common_1.Query)('competencia')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RecorrenciasController.prototype, "processarCompetencia", null);
exports.RecorrenciasController = RecorrenciasController = __decorate([
    (0, swagger_1.ApiTags)('Recorrências Financeiras (Google Calendar Pattern)'),
    (0, common_1.Controller)('api/v1/financeiro/recorrencias'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [recorrencias_service_1.RecorrenciasService,
        recurring_generator_service_1.RecurringGeneratorService])
], RecorrenciasController);
//# sourceMappingURL=recorrencias.controller.js.map