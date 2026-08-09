"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CotacoesModule = exports.DefaultFonteCotacaoProvider = void 0;
const common_1 = require("@nestjs/common");
const cotacoes_controller_1 = require("./cotacoes.controller");
const cotacoes_service_1 = require("./cotacoes.service");
const comparador_cotacoes_read_model_service_1 = require("./read-models/comparador-cotacoes-read-model.service");
const job_monitoramento_precos_service_1 = require("./domain/services/job-monitoramento-precos.service");
const fonte_cotacao_provider_1 = require("./domain/providers/fonte-cotacao.provider");
const prisma_module_1 = require("../../prisma/prisma.module");
let DefaultFonteCotacaoProvider = class DefaultFonteCotacaoProvider {
    async obterPreco(linkProduto) {
        return Number(linkProduto.preco);
    }
};
exports.DefaultFonteCotacaoProvider = DefaultFonteCotacaoProvider;
exports.DefaultFonteCotacaoProvider = DefaultFonteCotacaoProvider = __decorate([
    (0, common_1.Injectable)()
], DefaultFonteCotacaoProvider);
let CotacoesModule = class CotacoesModule {
};
exports.CotacoesModule = CotacoesModule;
exports.CotacoesModule = CotacoesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [cotacoes_controller_1.CotacoesController],
        providers: [
            cotacoes_service_1.CotacoesService,
            comparador_cotacoes_read_model_service_1.ComparadorCotacoesReadModelService,
            job_monitoramento_precos_service_1.JobMonitoramentoPrecosService,
            DefaultFonteCotacaoProvider,
            {
                provide: fonte_cotacao_provider_1.FONTE_COTACAO_PROVIDER,
                useClass: DefaultFonteCotacaoProvider,
            },
        ],
        exports: [
            cotacoes_service_1.CotacoesService,
            comparador_cotacoes_read_model_service_1.ComparadorCotacoesReadModelService,
            job_monitoramento_precos_service_1.JobMonitoramentoPrecosService,
            fonte_cotacao_provider_1.FONTE_COTACAO_PROVIDER,
        ],
    })
], CotacoesModule);
//# sourceMappingURL=cotacoes.module.js.map