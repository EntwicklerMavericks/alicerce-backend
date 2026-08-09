import { PrismaService } from '../../prisma/prisma.service';
export declare class DashboardFinanceiroReadModelService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    obterResumoDashboard(workspaceId: string, competenciaISO?: string): Promise<{
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
