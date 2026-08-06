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
exports.PessoasController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const pessoas_service_1 = require("./pessoas.service");
const criar_pessoa_dto_1 = require("./dto/criar-pessoa.dto");
const atualizar_salario_dto_1 = require("./dto/atualizar-salario.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_workspace_decorator_1 = require("../common/decorators/current-workspace.decorator");
let PessoasController = class PessoasController {
    pessoasService;
    constructor(pessoasService) {
        this.pessoasService = pessoasService;
    }
    async criar(workspaceId, dto) {
        return this.pessoasService.criar(workspaceId, dto);
    }
    async listarPorWorkspace(workspaceId) {
        return this.pessoasService.listarPorWorkspace(workspaceId);
    }
    async obterPorId(workspaceId, id) {
        return this.pessoasService.obterPorId(workspaceId, id);
    }
    async atualizarSalario(workspaceId, id, dto) {
        return this.pessoasService.atualizarSalario(workspaceId, id, dto);
    }
    async remover(workspaceId, id) {
        await this.pessoasService.remover(workspaceId, id);
    }
};
exports.PessoasController = PessoasController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Cadastra um membro da família e sua configuração salarial' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, criar_pessoa_dto_1.CriarPessoaDto]),
    __metadata("design:returntype", Promise)
], PessoasController.prototype, "criar", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lista todas as pessoas ativas do workspace' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PessoasController.prototype, "listarPorWorkspace", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Retorna os detalhes de uma pessoa específica' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PessoasController.prototype, "obterPorId", null);
__decorate([
    (0, common_1.Patch)(':id/salario'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualiza o salário ativo de um membro da família' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, atualizar_salario_dto_1.AtualizarSalarioDto]),
    __metadata("design:returntype", Promise)
], PessoasController.prototype, "atualizarSalario", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Remove (soft delete) um membro da família' }),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PessoasController.prototype, "remover", null);
exports.PessoasController = PessoasController = __decorate([
    (0, swagger_1.ApiTags)('Pessoas'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('pessoas'),
    __metadata("design:paramtypes", [pessoas_service_1.PessoasService])
], PessoasController);
//# sourceMappingURL=pessoas.controller.js.map