import { PrismaService } from '../../prisma/prisma.service';
import { LedgerService } from '../../financeiro/ledger/ledger.service';
import { PlanningOverviewReadModelService, MetaDestaque, OrcamentoAlerta } from '../../financeiro/planning/read-models/planning-overview-read-model.service';
export type SeveridadeAlerta = 'CRITICO' | 'ALTO' | 'MEDIO';
export type TipoAlertaDashboard = 'DEFICIT_PROJETADO' | 'ORCAMENTO_EXCEDIDO' | 'FATURA_VENCIDA' | 'LANCAMENTO_ATRASADO';
export interface AlertaCritico {
    id: string;
    tipo: TipoAlertaDashboard;
    severidade: SeveridadeAlerta;
    titulo: string;
    mensagem: string;
    detalhes?: Record<string, any>;
    dataIdentificacao: Date;
}
export interface FaturaAberta {
    id: string;
    cartaoId: string;
    cartaoNome: string;
    cartaoCor?: string | null;
    cartaoIcone?: string | null;
    mes: number;
    ano: number;
    valorTotal: number;
    dataVencimento: Date;
    status: string;
}
export interface LancamentoAtrasadoItem {
    id: string;
    descricao: string;
    valor: number;
    tipo: 'RECEITA' | 'DESPESA';
    dataVencimento: Date;
    diasAtraso: number;
}
export interface DashboardResult {
    referenceDate: Date;
    saldoGlobal: number;
    faturasAbertas: FaturaAberta[];
    orcamentoMes: OrcamentoAlerta[];
    metasAtivas: MetaDestaque[];
    alertasCriticos: AlertaCritico[];
}
export declare class DashboardReadModelService {
    private readonly ledgerService;
    private readonly planningOverviewReadModelService;
    private readonly prisma;
    constructor(ledgerService: LedgerService, planningOverviewReadModelService: PlanningOverviewReadModelService, prisma: PrismaService);
    obterDashboard(workspaceId: string, referenceDateInput?: Date | string): Promise<DashboardResult>;
    private buscarFaturasAbertas;
    private buscarLancamentosAtrasados;
    private mapearAlertasCriticos;
    private sanitizarNumero;
}
