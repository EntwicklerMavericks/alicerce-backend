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
exports.ProjecaoCronogramaReadModelService = void 0;
const common_1 = require("@nestjs/common");
const simulation_snapshot_builder_1 = require("../simulacao/simulation-snapshot.builder");
const simulador_cenarios_service_1 = require("../domain/services/simulador-cenarios.service");
let ProjecaoCronogramaReadModelService = class ProjecaoCronogramaReadModelService {
    snapshotBuilder;
    simuladorEngine;
    constructor(snapshotBuilder, simuladorEngine) {
        this.snapshotBuilder = snapshotBuilder;
        this.simuladorEngine = simuladorEngine;
    }
    async obterProjecaoCronograma(workspaceId, projetoId, parametros = {}, referenceDate = new Date()) {
        const snapshot = await this.snapshotBuilder.buildSnapshot(workspaceId, projetoId, referenceDate);
        const resultadoEngine = this.simuladorEngine.simular(snapshot, parametros);
        return this.formatarProjecaoCronograma(snapshot, resultadoEngine, parametros);
    }
    formatarProjecaoCronograma(snapshot, resultado, parametros = {}) {
        const dataInicioSimulada = parametros.dataInicioSimulada
            ? new Date(parametros.dataInicioSimulada)
            : snapshot.referenceDate
                ? new Date(snapshot.referenceDate)
                : new Date();
        const dataFim = resultado.simulado.dataConclusaoEstimadaReal;
        let diasTotaisEstimados = 0;
        let mesesTotaisEstimados = 0;
        if (dataFim !== null) {
            const diffMs = dataFim.getTime() - dataInicioSimulada.getTime();
            diasTotaisEstimados = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
            mesesTotaisEstimados = Math.round(diasTotaisEstimados / 30);
        }
        const etapasFormatadas = resultado.etapas.map((etapa) => {
            const readinessScore = etapa.totalItensWishlist > 0
                ? Number(((etapa.itensProntos / etapa.totalItensWishlist) * 100).toFixed(2))
                : 0;
            return {
                etapaId: etapa.etapaId,
                nome: etapa.nome,
                ordem: etapa.ordem,
                custoBase: Number(etapa.custoBase.toFixed(2)),
                custoSimulado: Number(etapa.custoSimulado.toFixed(2)),
                valorFinanciado: Number(etapa.valorFinanciado.toFixed(2)),
                deficitFinanceiro: Number(etapa.deficitFinanceiro.toFixed(2)),
                aporteMensalDisponivel: Number(etapa.aporteMensalDisponivel.toFixed(2)),
                mesesParaCobertura: etapa.mesesParaCobertura,
                dataCobertura100: etapa.dataCobertura100,
                dataReadiness100: etapa.dataReadiness100,
                dataConclusaoEstimada: etapa.dataConclusaoEstimada,
                readinessScore,
            };
        });
        return {
            projetoId: snapshot.projeto.id,
            nome: snapshot.projeto.nome,
            status: snapshot.projeto.status,
            versao: snapshot.projeto.versao,
            cronograma: {
                dataInicioSimulada,
                dataCobertura100: resultado.simulado.dataCobertura100,
                dataReadiness100: resultado.simulado.dataReadiness100,
                dataConclusaoEstimadaReal: resultado.simulado.dataConclusaoEstimadaReal,
                diasTotaisEstimados,
                mesesTotaisEstimados,
                diasAntecipados: resultado.deltas.diasAntecipados,
                mesesAntecipados: resultado.deltas.mesesAntecipados,
            },
            metricasFinanceiras: {
                custoTotal: Number(resultado.simulado.custoTotal.toFixed(2)),
                valorFinanciadoTotal: Number(resultado.simulado.valorFinanciadoTotal.toFixed(2)),
                coberturaPercentual: resultado.simulado.coberturaPercentual,
                readinessPercentual: resultado.simulado.readinessPercentual,
                deltaCobertura: resultado.deltas.deltaCobertura,
                deltaReadiness: resultado.deltas.deltaReadiness,
            },
            gargalo: resultado.gargalo,
            etapas: etapasFormatadas,
        };
    }
};
exports.ProjecaoCronogramaReadModelService = ProjecaoCronogramaReadModelService;
exports.ProjecaoCronogramaReadModelService = ProjecaoCronogramaReadModelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [simulation_snapshot_builder_1.SimulationSnapshotBuilder,
        simulador_cenarios_service_1.SimuladorCenariosService])
], ProjecaoCronogramaReadModelService);
//# sourceMappingURL=projecao-cronograma-read-model.service.js.map