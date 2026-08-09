"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const workspaces_module_1 = require("./workspaces/workspaces.module");
const pessoas_module_1 = require("./pessoas/pessoas.module");
const carteiras_module_1 = require("./carteiras/carteiras.module");
const ledger_module_1 = require("./financeiro/ledger/ledger.module");
const receitas_module_1 = require("./financeiro/receitas/receitas.module");
const despesas_module_1 = require("./financeiro/despesas/despesas.module");
const read_models_module_1 = require("./financeiro/read-models/read-models.module");
const cartoes_module_1 = require("./financeiro/cartoes/cartoes.module");
const compras_cartao_module_1 = require("./financeiro/compras-cartao/compras-cartao.module");
const faturas_module_1 = require("./financeiro/faturas/faturas.module");
const recorrencias_module_1 = require("./financeiro/recorrencias/recorrencias.module");
const orcamentos_module_1 = require("./financeiro/orcamentos/orcamentos.module");
const metas_module_1 = require("./financeiro/metas/metas.module");
const lojas_module_1 = require("./financeiro/produtos/lojas/lojas.module");
const produtos_module_1 = require("./financeiro/produtos/catalogo/produtos.module");
const wishlist_module_1 = require("./financeiro/wishlist/wishlist.module");
const cotacoes_module_1 = require("./financeiro/cotacoes/cotacoes.module");
const projetos_module_1 = require("./projetos/projetos.module");
const planning_module_1 = require("./financeiro/planning/planning.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const alertas_module_1 = require("./alertas/alertas.module");
const relatorios_module_1 = require("./relatorios/relatorios.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            workspaces_module_1.WorkspacesModule,
            pessoas_module_1.PessoasModule,
            carteiras_module_1.CarteirasModule,
            ledger_module_1.LedgerModule,
            receitas_module_1.ReceitasModule,
            despesas_module_1.DespesasModule,
            read_models_module_1.ReadModelsModule,
            cartoes_module_1.CartoesModule,
            compras_cartao_module_1.ComprasCartaoModule,
            faturas_module_1.FaturasModule,
            recorrencias_module_1.RecorrenciasModule,
            orcamentos_module_1.OrcamentosModule,
            metas_module_1.MetasModule,
            lojas_module_1.LojasModule,
            produtos_module_1.ProdutosModule,
            wishlist_module_1.WishlistModule,
            cotacoes_module_1.CotacoesModule,
            projetos_module_1.ProjetosModule,
            planning_module_1.PlanningModule,
            dashboard_module_1.DashboardModule,
            alertas_module_1.AlertasModule,
            relatorios_module_1.RelatoriosModule,
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map