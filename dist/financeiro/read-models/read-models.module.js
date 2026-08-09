"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadModelsModule = void 0;
const common_1 = require("@nestjs/common");
const fluxo_caixa_read_model_service_1 = require("./fluxo-caixa-read-model.service");
const dashboard_financeiro_read_model_service_1 = require("./dashboard-financeiro-read-model.service");
const orcamentos_read_model_service_1 = require("./orcamentos-read-model.service");
const metas_read_model_service_1 = require("./metas-read-model.service");
const fluxo_caixa_controller_1 = require("./fluxo-caixa.controller");
const dashboard_financeiro_controller_1 = require("./dashboard-financeiro.controller");
const prisma_module_1 = require("../../prisma/prisma.module");
let ReadModelsModule = class ReadModelsModule {
};
exports.ReadModelsModule = ReadModelsModule;
exports.ReadModelsModule = ReadModelsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [fluxo_caixa_controller_1.FluxoCaixaController, dashboard_financeiro_controller_1.DashboardFinanceiroController],
        providers: [
            fluxo_caixa_read_model_service_1.FluxoCaixaReadModelService,
            dashboard_financeiro_read_model_service_1.DashboardFinanceiroReadModelService,
            orcamentos_read_model_service_1.OrcamentosReadModelService,
            metas_read_model_service_1.MetasReadModelService,
        ],
        exports: [
            fluxo_caixa_read_model_service_1.FluxoCaixaReadModelService,
            dashboard_financeiro_read_model_service_1.DashboardFinanceiroReadModelService,
            orcamentos_read_model_service_1.OrcamentosReadModelService,
            metas_read_model_service_1.MetasReadModelService,
        ],
    })
], ReadModelsModule);
//# sourceMappingURL=read-models.module.js.map