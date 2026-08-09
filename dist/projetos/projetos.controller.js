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
exports.ProjetosController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_workspace_decorator_1 = require("../common/decorators/current-workspace.decorator");
const projetos_service_1 = require("./projetos.service");
const criar_projeto_dto_1 = require("./dto/criar-projeto.dto");
const atualizar_projeto_dto_1 = require("./dto/atualizar-projeto.dto");
const criar_etapa_projeto_dto_1 = require("./dto/criar-etapa-projeto.dto");
const reordenar_etapas_dto_1 = require("./dto/reordenar-etapas.dto");
const vincular_item_projeto_dto_1 = require("./dto/vincular-item-projeto.dto");
let ProjetosController = class ProjetosController {
    projetosService;
    constructor(projetosService) {
        this.projetosService = projetosService;
    }
    async criar(workspaceId, dto) {
        return this.projetosService.criar(workspaceId, dto);
    }
    async listar(workspaceId) {
        return this.projetosService.listar(workspaceId);
    }
    async obterPorId(workspaceId, id) {
        return this.projetosService.obterPorId(workspaceId, id);
    }
    async atualizar(workspaceId, id, dto) {
        return this.projetosService.atualizar(workspaceId, id, dto);
    }
    async criarEtapa(workspaceId, id, dto) {
        return this.projetosService.criarEtapa(workspaceId, id, dto);
    }
    async reordenarEtapas(workspaceId, id, dto) {
        return this.projetosService.reordenarEtapas(workspaceId, id, dto);
    }
    async vincularItemEtapa(workspaceId, id, etapaId, dto) {
        return this.projetosService.vincularItemEtapa(workspaceId, id, etapaId, dto);
    }
    async remover(workspaceId, id) {
        return this.projetosService.remover(workspaceId, id);
    }
    async simular(workspaceId, id, dto) {
        return this.projetosService.simular(workspaceId, id, dto);
    }
    async aplicarSimulacao(workspaceId, id, dto) {
        return this.projetosService.aplicarSimulacao(workspaceId, id, dto);
    }
};
exports.ProjetosController = ProjetosController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Criar um novo projeto de longo prazo' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Projeto criado com sucesso' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, criar_projeto_dto_1.CriarProjetoDto]),
    __metadata("design:returntype", Promise)
], ProjetosController.prototype, "criar", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todos os projetos consolidados do workspace' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjetosController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter detalhes consolidados de um projeto via Read Model' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProjetosController.prototype, "obterPorId", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar informações de um projeto com concorrência otimista' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, atualizar_projeto_dto_1.AtualizarProjetoDto]),
    __metadata("design:returntype", Promise)
], ProjetosController.prototype, "atualizar", null);
__decorate([
    (0, common_1.Post)(':id/etapas'),
    (0, swagger_1.ApiOperation)({ summary: 'Criar uma nova etapa no projeto' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, criar_etapa_projeto_dto_1.CriarEtapaProjetoDto]),
    __metadata("design:returntype", Promise)
], ProjetosController.prototype, "criarEtapa", null);
__decorate([
    (0, common_1.Patch)(':id/etapas/reordenar'),
    (0, swagger_1.ApiOperation)({
        summary: 'Reordenar etapas de um projeto com trava otimista no Agregado Pai Projeto (versao) e normalização contínua',
    }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, reordenar_etapas_dto_1.ReordenarEtapasDto]),
    __metadata("design:returntype", Promise)
], ProjetosController.prototype, "reordenarEtapas", null);
__decorate([
    (0, common_1.Post)(':id/etapas/:etapaId/vincular'),
    (0, swagger_1.ApiOperation)({
        summary: 'Vincular item de Wishlist OU Meta a uma etapa do projeto (Invariante XOR & unicidade no MySQL)',
    }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('etapaId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, vincular_item_projeto_dto_1.VincularItemProjetoDto]),
    __metadata("design:returntype", Promise)
], ProjetosController.prototype, "vincularItemEtapa", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Remover (soft delete) um projeto e todas as suas etapas' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProjetosController.prototype, "remover", null);
__decorate([
    (0, common_1.Post)(':id/simular'),
    (0, swagger_1.ApiOperation)({ summary: 'Simular cenários executivos What-If e cronograma readiness' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ProjetosController.prototype, "simular", null);
__decorate([
    (0, common_1.Post)(':id/simular/aplicar'),
    (0, swagger_1.ApiOperation)({ summary: 'Aplicar parâmetros do cenário simulado ao projeto real' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ProjetosController.prototype, "aplicarSimulacao", null);
exports.ProjetosController = ProjetosController = __decorate([
    (0, swagger_1.ApiTags)('Projetos'),
    (0, common_1.Controller)('projetos'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [projetos_service_1.ProjetosService])
], ProjetosController);
//# sourceMappingURL=projetos.controller.js.map