import { DashboardFinanceiroReadModelService } from './dashboard-financeiro-read-model.service';
export declare class DashboardFinanceiroController {
    private readonly dashboardReadModel;
    constructor(dashboardReadModel: DashboardFinanceiroReadModelService);
    obterResumoDashboard(competenciaISO?: string, req?: any): Promise<{
        competencia: string;
        saldoAtual: number;
        saldoProjetado: number;
        fluxoDoPeriodo: number;
        receitasPendentes: number;
        despesasPendentes: number;
        receitasLiquidadasMes: number;
        despesasLiquidadasMes: number;
        cartoes: {
            id: string;
            nome: string;
            bandeira: import("@prisma/client").$Enums.BandeiraCartao;
            cor: string | null;
            limiteTotal: number;
            limiteComprometido: number;
            limiteDisponivel: number;
        }[];
    }>;
}
