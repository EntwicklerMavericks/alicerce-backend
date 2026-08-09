"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjetosModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const projetos_controller_1 = require("./projetos.controller");
const projetos_service_1 = require("./projetos.service");
const projetos_read_model_service_1 = require("./read-models/projetos-read-model.service");
const simulador_cenarios_service_1 = require("./domain/services/simulador-cenarios.service");
const simulation_snapshot_builder_1 = require("./simulacao/simulation-snapshot.builder");
const simulacao_service_1 = require("./simulacao/simulacao.service");
const simulacao_controller_1 = require("./simulacao/simulacao.controller");
const projecao_cronograma_read_model_service_1 = require("./read-models/projecao-cronograma-read-model.service");
let ProjetosModule = class ProjetosModule {
};
exports.ProjetosModule = ProjetosModule;
exports.ProjetosModule = ProjetosModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [projetos_controller_1.ProjetosController, simulacao_controller_1.SimulacaoController],
        providers: [
            projetos_service_1.ProjetosService,
            projetos_read_model_service_1.ProjetosReadModelService,
            simulador_cenarios_service_1.SimuladorCenariosService,
            simulation_snapshot_builder_1.SimulationSnapshotBuilder,
            simulacao_service_1.SimulacaoService,
            projecao_cronograma_read_model_service_1.ProjecaoCronogramaReadModelService,
        ],
        exports: [
            projetos_service_1.ProjetosService,
            projetos_read_model_service_1.ProjetosReadModelService,
            simulador_cenarios_service_1.SimuladorCenariosService,
            simulation_snapshot_builder_1.SimulationSnapshotBuilder,
            simulacao_service_1.SimulacaoService,
            projecao_cronograma_read_model_service_1.ProjecaoCronogramaReadModelService,
        ],
    })
], ProjetosModule);
//# sourceMappingURL=projetos.module.js.map