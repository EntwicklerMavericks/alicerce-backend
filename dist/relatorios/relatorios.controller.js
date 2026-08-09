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
exports.RelatoriosController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_workspace_decorator_1 = require("../common/decorators/current-workspace.decorator");
const relatorios_read_model_service_1 = require("./services/relatorios-read-model.service");
const exportador_relatorio_service_1 = require("./services/exportador-relatorio.service");
let RelatoriosController = class RelatoriosController {
    readModelService;
    exportadorService;
    constructor(readModelService, exportadorService) {
        this.readModelService = readModelService;
        this.exportadorService = exportadorService;
    }
    async obterRelatorio(workspaceId, dataInicio, dataFim, referenceDate) {
        return this.readModelService.obterRelatorio(workspaceId, dataInicio, dataFim, referenceDate);
    }
    async exportarPDF(workspaceId, res, dataInicio, dataFim, referenceDate) {
        const dados = await this.readModelService.obterRelatorio(workspaceId, dataInicio, dataFim, referenceDate);
        const pdfBuffer = await this.exportadorService.gerarPDF(dados);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="relatorio-analitico.pdf"');
        res.end(pdfBuffer);
    }
    async exportarExcel(workspaceId, res, dataInicio, dataFim, referenceDate) {
        const dados = await this.readModelService.obterRelatorio(workspaceId, dataInicio, dataFim, referenceDate);
        const excelBuffer = await this.exportadorService.gerarExcel(dados);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="relatorio-analitico.xlsx"');
        res.end(excelBuffer);
    }
    async exportarCSV(workspaceId, res, dataInicio, dataFim, referenceDate) {
        const dados = await this.readModelService.obterRelatorio(workspaceId, dataInicio, dataFim, referenceDate);
        const csvBuffer = await this.exportadorService.gerarCSV(dados);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="relatorio-analitico.csv"');
        res.end(csvBuffer);
    }
};
exports.RelatoriosController = RelatoriosController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Query)('dataInicio')),
    __param(2, (0, common_1.Query)('dataFim')),
    __param(3, (0, common_1.Query)('referenceDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], RelatoriosController.prototype, "obterRelatorio", null);
__decorate([
    (0, common_1.Get)('exportar/pdf'),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Query)('dataInicio')),
    __param(3, (0, common_1.Query)('dataFim')),
    __param(4, (0, common_1.Query)('referenceDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String, String]),
    __metadata("design:returntype", Promise)
], RelatoriosController.prototype, "exportarPDF", null);
__decorate([
    (0, common_1.Get)('exportar/excel'),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Query)('dataInicio')),
    __param(3, (0, common_1.Query)('dataFim')),
    __param(4, (0, common_1.Query)('referenceDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String, String]),
    __metadata("design:returntype", Promise)
], RelatoriosController.prototype, "exportarExcel", null);
__decorate([
    (0, common_1.Get)('exportar/csv'),
    __param(0, (0, current_workspace_decorator_1.CurrentWorkspace)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Query)('dataInicio')),
    __param(3, (0, common_1.Query)('dataFim')),
    __param(4, (0, common_1.Query)('referenceDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String, String]),
    __metadata("design:returntype", Promise)
], RelatoriosController.prototype, "exportarCSV", null);
exports.RelatoriosController = RelatoriosController = __decorate([
    (0, common_1.Controller)('relatorios'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [relatorios_read_model_service_1.RelatoriosReadModelService,
        exportador_relatorio_service_1.ExportadorRelatorioService])
], RelatoriosController);
//# sourceMappingURL=relatorios.controller.js.map