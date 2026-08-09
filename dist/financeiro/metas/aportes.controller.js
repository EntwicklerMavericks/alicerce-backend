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
exports.AportesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const metas_service_1 = require("./metas.service");
const criar_aporte_meta_dto_1 = require("./dto/criar-aporte-meta.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const current_workspace_decorator_1 = require("../../common/decorators/current-workspace.decorator");
let AportesController = class AportesController {
    metasService;
    constructor(metasService) {
        this.metasService = metasService;
    }
    async registrarAporte(workspaceId, metaId, dto) {
        return this.metasService.registrarAporte(workspaceId, metaId, dto);
    }
    async removerAporte(workspaceId, metaId, aporteId) {
        return this.metasService.removerAporte(workspaceId, metaId, aporteId);
    }
};
exports.AportesController = AportesController;
__decorate([
    (0, common_1.Post)(':id/aportes'),
    (0, swagger_1.ApiOperation)({ summary: 'Registrar um novo Aporte em uma Meta' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Aporte registrado com sucesso' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, criar_aporte_meta_dto_1.CriarAporteMetaDto]),
    __metadata("design:returntype", Promise)
], AportesController.prototype, "registrarAporte", null);
__decorate([
    (0, common_1.Delete)(':id/aportes/:aporteId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remover um Aporte de uma Meta' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('aporteId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AportesController.prototype, "removerAporte", null);
exports.AportesController = AportesController = __decorate([
    (0, swagger_1.ApiTags)('Aportes de Meta'),
    (0, common_1.Controller)('metas'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [metas_service_1.MetasService])
], AportesController);
//# sourceMappingURL=aportes.controller.js.map