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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimulacaoService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const simulation_snapshot_builder_1 = require("./simulation-snapshot.builder");
const simulador_cenarios_service_1 = require("../domain/services/simulador-cenarios.service");
const projecao_cronograma_read_model_service_1 = require("../read-models/projecao-cronograma-read-model.service");
const scenario_baseline_conflict_exception_1 = require("./exceptions/scenario-baseline-conflict.exception");
let SimulacaoService = class SimulacaoService {
    prisma;
    snapshotBuilder;
    simuladorEngine;
    projecaoReadModel;
    constructor(prisma, snapshotBuilder, simuladorEngine, projecaoReadModel) {
        this.prisma = prisma;
        this.snapshotBuilder = snapshotBuilder;
        this.simuladorEngine = simuladorEngine;
        this.projecaoReadModel = projecaoReadModel;
    }
    async simular(workspaceId, projetoId, dto) {
        const snapshot = await this.snapshotBuilder.buildSnapshot(workspaceId, projetoId);
        const resultado = this.simuladorEngine.simular(snapshot, dto);
        return this.projecaoReadModel.formatarProjecaoCronograma(snapshot, resultado, dto);
    }
    async aplicar(workspaceId, projetoId, dto) {
        return this.prisma.$transaction(async (tx) => {
            const dbProjeto = await tx.projeto.findFirst({
                where: { id: projetoId, workspaceId, ativo: true },
                include: { etapas: { where: { ativo: true } } },
            });
            if (!dbProjeto) {
                throw new common_1.NotFoundException('Projeto não encontrado.');
            }
            if (dbProjeto.versao !== dto.versaoProjetoEsperada) {
                throw new scenario_baseline_conflict_exception_1.ScenarioBaselineConflictException(`Conflito de baseline detectado. Versão esperada do projeto: ${dto.versaoProjetoEsperada}, versão atual: ${dbProjeto.versao}.`);
            }
            if (dto.versoesEtapasEsperadas && dto.versoesEtapasEsperadas.length > 0) {
                const stageMap = new Map(dbProjeto.etapas.map((e) => [e.id, e.versao]));
                for (const ve of dto.versoesEtapasEsperadas) {
                    const currentVersao = stageMap.get(ve.etapaId);
                    if (currentVersao === undefined || currentVersao !== ve.versaoEsperada) {
                        throw new scenario_baseline_conflict_exception_1.ScenarioBaselineConflictException(`Conflito de baseline na etapa '${ve.etapaId}'. Versão esperada: ${ve.versaoEsperada}, versão atual: ${currentVersao}.`);
                    }
                }
            }
            const dataInicioPrevista = dto.parametrosSimulacao.dataInicioSimulada
                ? new Date(dto.parametrosSimulacao.dataInicioSimulada)
                : dbProjeto.dataInicioPrevista;
            const updatedParent = await tx.projeto.updateMany({
                where: {
                    id: projetoId,
                    workspaceId,
                    versao: dto.versaoProjetoEsperada,
                    ativo: true,
                },
                data: {
                    dataInicioPrevista,
                    versao: { increment: 1 },
                },
            });
            if (updatedParent.count === 0) {
                throw new scenario_baseline_conflict_exception_1.ScenarioBaselineConflictException('Conflito de concorrência detectado ao aplicar o cenário. Tente novamente.');
            }
            for (const etapa of dbProjeto.etapas) {
                await tx.etapaProjeto.updateMany({
                    where: { id: etapa.id, workspaceId, versao: etapa.versao, ativo: true },
                    data: {
                        versao: { increment: 1 },
                    },
                });
            }
            return this.projecaoReadModel.obterProjecaoCronograma(workspaceId, projetoId, dto.parametrosSimulacao);
        });
    }
};
exports.SimulacaoService = SimulacaoService;
exports.SimulacaoService = SimulacaoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        simulation_snapshot_builder_1.SimulationSnapshotBuilder,
        simulador_cenarios_service_1.SimuladorCenariosService,
        projecao_cronograma_read_model_service_1.ProjecaoCronogramaReadModelService])
], SimulacaoService);
//# sourceMappingURL=simulacao.service.js.map