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
exports.MetasController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const metas_service_1 = require("./metas.service");
const criar_meta_dto_1 = require("./dto/criar-meta.dto");
const atualizar_meta_dto_1 = require("./dto/atualizar-meta.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const current_workspace_decorator_1 = require("../../common/decorators/current-workspace.decorator");
let MetasController = class MetasController {
    metasService;
    constructor(metasService) {
        this.metasService = metasService;
    }
    async criar(workspaceId, dto) {
        return this.metasService.criar(workspaceId, dto);
    }
    async listar(workspaceId) {
        return this.metasService.listar(workspaceId);
    }
    async obterPorId(workspaceId, id) {
        return this.metasService.obterPorId(workspaceId, id);
    }
    async atualizar(workspaceId, id, dto) {
        return this.metasService.atualizar(workspaceId, id, dto);
    }
    async remover(workspaceId, id) {
        return this.metasService.remover(workspaceId, id);
    }
};
exports.MetasController = MetasController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Criar uma nova Meta de Economia' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Meta criada com sucesso' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, criar_meta_dto_1.CriarMetaDto]),
    __metadata("design:returntype", Promise)
], MetasController.prototype, "criar", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar metas com valorAcumulado derivado, progresso %, ritmo e esforço mensal' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MetasController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter detalhes da Meta por ID com histórico completo de aportes' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MetasController.prototype, "obterPorId", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar dados da Meta' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, atualizar_meta_dto_1.AtualizarMetaDto]),
    __metadata("design:returntype", Promise)
], MetasController.prototype, "atualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancelar ou remover uma Meta e seus aportes' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MetasController.prototype, "remover", null);
exports.MetasController = MetasController = __decorate([
    (0, swagger_1.ApiTags)('Metas Financial Goals'),
    (0, common_1.Controller)('metas'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [metas_service_1.MetasService])
], MetasController);
//# sourceMappingURL=metas.controller.js.map