import { PrismaService } from '../../../prisma/prisma.service';
export interface WishlistAnalyticsResult {
    economiaEvitadaAcumulada: number;
    taxaConclusaoConsciente: number;
    taxaCompraImpulsiva: number;
    totalItensDesistidos: number;
    totalItensComprados: number;
    totalItensEmAnalise: number;
    totalDesistidosConscientes: number;
    totalCompradosImpulsivos: number;
}
export declare class WishlistAnalyticsReadModelService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    obterAnalytics(workspaceId: string): Promise<WishlistAnalyticsResult>;
}
