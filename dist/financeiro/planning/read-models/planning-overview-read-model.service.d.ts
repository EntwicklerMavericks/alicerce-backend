import { PrismaService } from '../../../prisma/prisma.service';
import { TimelineForecastReadModelService, TimelineForecastResult } from './timeline-forecast-read-model.service';
import { ProjetosReadModelService, ProjetoConsolidadoResult } from '../../../projetos/read-models/projetos-read-model.service';
export type StatusVencimentoCalendario = 'PENDENTE' | 'VENCIDO' | 'PROGRAMADO';
export type TipoTransacaoCalendario = 'RECEITA' | 'DESPESA';
export type OrigemCalendario = 'DESPESA' | 'RECEITA' | 'CARTAO' | 'RECORRENCIA';
export interface ItemCalendarioVencimento {
    id: string;
    descricao: string;
    valor: number;
    data: Date;
    tipo: TipoTransacaoCalendario;
    origem: OrigemCalendario;
    status: StatusVencimentoCalendario;
    categoriaId?: string | null;
    categoriaNome?: string | null;
}
export interface MetaDestaque {
    id: string;
    nome: string;
    descricao?: string | null;
    valorAlvo: number;
    valorAcumulado: number;
    distancia: number;
    progressoPercentual: number;
    status: string;
    prioridade: number;
    prazo?: Date | null;
    icone?: string | null;
    cor?: string | null;
    dataCriacao: Date;
}
export type EstadoOrcamentoOverview = 'NORMAL' | 'ALERTA' | 'ATENCAO' | 'EXCEDIDO';
export interface OrcamentoAlerta {
    id: string;
    categoriaId: string;
    categoriaNome: string;
    categoriaIcone?: string | null;
    categoriaCor?: string | null;
    mes: number;
    ano: number;
    limite: number;
    valorConsumido: number;
    valorDisponivel: number;
    percentualConsumido: number;
    estado: EstadoOrcamentoOverview;
}
export interface PeriodoOverview {
    inicio: Date;
    fim: Date;
}
export interface PlanningOverviewResult {
    referenceDate: Date;
    periodo: PeriodoOverview;
    resumoForecast: TimelineForecastResult;
    calendarioVencimentos: ItemCalendarioVencimento[];
    projetosGargalo: ProjetoConsolidadoResult[];
    metasDestaque: MetaDestaque[];
    orcamentosAlerta: OrcamentoAlerta[];
}
export declare class PlanningOverviewReadModelService {
    private readonly prisma;
    private readonly timelineForecastReadModelService;
    private readonly projetosReadModelService;
    constructor(prisma: PrismaService, timelineForecastReadModelService: TimelineForecastReadModelService, projetosReadModelService: ProjetosReadModelService);
    obterVisaoUnificada(workspaceId: string, referenceDateInput?: Date | string): Promise<PlanningOverviewResult>;
    obterOverview(workspaceId: string, referenceDateInput?: Date | string): Promise<PlanningOverviewResult>;
    private buscarCalendarioVencimentos;
    private determinarStatusCalendario;
    private buscarMetasDestaque;
    private buscarOrcamentosAlerta;
}
