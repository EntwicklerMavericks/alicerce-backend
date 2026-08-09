import { PrismaService } from '../../prisma/prisma.service';
export interface ResumoFluxoCaixa {
    mes: number;
    ano: number;
    saldoAtualLedger: number;
    totalReceitasLiquidadas: number;
    totalReceitasPendentes: number;
    totalDespesasLiquidadas: number;
    totalDespesasPendentes: number;
    saldoProjetado: number;
    fluxoDoPeriodo: number;
}
export declare class FluxoCaixaReadModelService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    obterResumoMensal(workspaceId: string, mes?: number, ano?: number): Promise<ResumoFluxoCaixa>;
}
