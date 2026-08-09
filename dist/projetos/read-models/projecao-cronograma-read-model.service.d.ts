import { SimulationSnapshotBuilder } from '../simulacao/simulation-snapshot.builder';
import { SimuladorCenariosService, ParametrosSimulacao, ResultadoSimulacao } from '../domain/services/simulador-cenarios.service';
export interface ProjecaoCronogramaPayload {
    projetoId: string;
    nome: string;
    status: string;
    versao: number;
    cronograma: {
        dataInicioSimulada: Date;
        dataCobertura100: Date | null;
        dataReadiness100: Date | null;
        dataConclusaoEstimadaReal: Date | null;
        diasTotaisEstimados: number;
        mesesTotaisEstimados: number;
        diasAntecipados: number;
        mesesAntecipados: number;
    };
    metricasFinanceiras: {
        custoTotal: number;
        valorFinanciadoTotal: number;
        coberturaPercentual: number;
        readinessPercentual: number;
        deltaCobertura: number;
        deltaReadiness: number;
    };
    gargalo: {
        criticalStageId: string | null;
        criticalStageReason: string | null;
    };
    etapas: Array<{
        etapaId: string;
        nome: string;
        ordem: number;
        custoBase: number;
        custoSimulado: number;
        valorFinanciado: number;
        deficitFinanceiro: number;
        aporteMensalDisponivel: number;
        mesesParaCobertura: number | null;
        dataCobertura100: Date | null;
        dataReadiness100: Date | null;
        dataConclusaoEstimada: Date | null;
        readinessScore: number;
    }>;
}
export declare class ProjecaoCronogramaReadModelService {
    private readonly snapshotBuilder;
    private readonly simuladorEngine;
    constructor(snapshotBuilder: SimulationSnapshotBuilder, simuladorEngine: SimuladorCenariosService);
    obterProjecaoCronograma(workspaceId: string, projetoId: string, parametros?: ParametrosSimulacao, referenceDate?: Date): Promise<ProjecaoCronogramaPayload>;
    formatarProjecaoCronograma(snapshot: any, resultado: ResultadoSimulacao, parametros?: ParametrosSimulacao): ProjecaoCronogramaPayload;
}
