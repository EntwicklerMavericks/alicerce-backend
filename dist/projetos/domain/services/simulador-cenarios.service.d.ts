import { Decimal } from '@prisma/client/runtime/library';
export interface SnapshotItemWishlist {
    id: string;
    nome: string;
    status: string;
    preco: Decimal;
    diasEsfriamento: number;
    inicioEsfriamento: Date | null;
    fimEsfriamento: Date | null;
}
export interface SnapshotMeta {
    id: string;
    nome: string;
    status: string;
    valorAlvo: Decimal;
    valorAcumulado: Decimal;
}
export interface SnapshotItemProjeto {
    id: string;
    itemWishlist: SnapshotItemWishlist | null;
    meta: SnapshotMeta | null;
}
export interface SnapshotEtapaProjeto {
    id: string;
    nome: string;
    ordem: number;
    status: string;
    versao: number;
    dataInicio: Date | null;
    dataConclusao: Date | null;
    itens: SnapshotItemProjeto[];
}
export interface SnapshotProjeto {
    id: string;
    nome: string;
    versao: number;
    status: string;
    orcamentoEstimado: Decimal | null;
    dataInicioPrevista: Date | null;
    dataFimPrevista: Date | null;
}
export interface SimulationSnapshot {
    referenceDate: Date;
    projeto: SnapshotProjeto;
    etapas: SnapshotEtapaProjeto[];
}
export interface AporteEtapaParam {
    etapaId: string;
    aporteMensal: Decimal | number | string;
}
export interface AjusteCustoEtapaParam {
    etapaId: string;
    multiplicadorCusto?: number;
    custoFixoAdicional?: Decimal | number | string;
}
export interface ParametrosSimulacao {
    aporteMensalGlobal?: Decimal | number | string;
    aportesMensaisEtapas?: Record<string, Decimal | number | string> | AporteEtapaParam[];
    multiplicadorEsfriamento?: number;
    ajustesCustoEtapas?: Record<string, Decimal | number | string> | AjusteCustoEtapaParam[];
    dataInicioSimulada?: Date | string;
}
export interface DetalheEtapaSimulada {
    etapaId: string;
    nome: string;
    ordem: number;
    custoBase: Decimal;
    custoSimulado: Decimal;
    valorFinanciado: Decimal;
    deficitFinanceiro: Decimal;
    aporteMensalDisponivel: Decimal;
    mesesParaCobertura: number | null;
    dataCobertura100: Date | null;
    dataReadiness100: Date | null;
    dataConclusaoEstimada: Date | null;
    totalItensWishlist: number;
    itensProntos: number;
}
export interface MetricasCenario {
    custoTotal: Decimal;
    valorFinanciadoTotal: Decimal;
    coberturaPercentual: number;
    readinessPercentual: number;
    dataCobertura100: Date | null;
    dataReadiness100: Date | null;
    dataConclusaoEstimada: Date | null;
}
export interface ResultadoSimulacao {
    referenceDate: Date;
    baseline: MetricasCenario;
    simulado: MetricasCenario & {
        dataConclusaoEstimadaReal: Date | null;
    };
    deltas: {
        deltaCobertura: number;
        deltaReadiness: number;
        diasAntecipados: number;
        mesesAntecipados: number;
    };
    gargalo: {
        criticalStageId: string | null;
        criticalStageReason: string | null;
    };
    etapas: DetalheEtapaSimulada[];
}
export declare function deepFreeze<T>(obj: T): T;
export declare class SimuladorCenariosService {
    simular(snapshot: SimulationSnapshot, parametros?: ParametrosSimulacao): ResultadoSimulacao;
    private calcularMetricasBaseline;
    private detectarGargaloCritico;
    private parseAportesEtapas;
    private parseAjustesCustos;
    private toDecimal;
}
