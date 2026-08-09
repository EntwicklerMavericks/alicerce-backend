import { PrismaService } from '../../../prisma/prisma.service';
import { ProjectedCashFlowEvent, OrigemProjecao } from './projected-cash-flow-event';
export type ZonaSaudeFinanceira = 'SUPERAVIT' | 'FOLGA_ESTAVEL' | 'ALERTA_APERTO' | 'DEFICIT_PROJETADO';
export interface BreakdownCategoria {
    categoriaId: string | null;
    categoriaNome: string;
    total: number;
    eventosConhecidos: number;
    fallbackOrcamento: number;
    percentualDoTotal: number;
}
export interface BreakdownFonte {
    fonte: OrigemProjecao;
    valor: number;
    percentualDoTotal: number;
}
export interface CompetenciaForecast {
    competencia: string;
    exibicao: string;
    saldoInicialPeriodo: number;
    totalReceitas: number;
    totalDespesas: number;
    fluxoLiquidoMensal: number;
    saldoProjetadoFinal: number;
    alocacaoPatrimonial: number;
    zonaSaude: ZonaSaudeFinanceira;
    eventos: ProjectedCashFlowEvent[];
    breakdown: {
        porCategoria: BreakdownCategoria[];
        porFonte: BreakdownFonte[];
    };
}
export interface TimelineForecastResult {
    referenceDate: string;
    saldoInicial: number;
    reservaSeguranca: number;
    despesaMediaMensal: number;
    competencias: CompetenciaForecast[];
}
export declare class TimelineForecastReadModelService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    gerarProjecao(workspaceId: string, referenceDateInput?: Date | string, qtdMeses?: number): Promise<TimelineForecastResult>;
}
