import { PrismaService } from '../../../prisma/prisma.service';
export interface OfertaComparativo {
    id: string;
    nomeLoja: string;
    preco: number;
    url: string | null;
    tipo: 'LINK_PRODUTO' | 'COTACAO_AVULSA';
    observacoes?: string | null;
}
export interface ComparadorCotacoesPayload {
    itemWishlistId: string;
    nomeItem: string;
    precoAlvo: number | null;
    menorCotacao: number | null;
    maiorCotacao: number | null;
    alvoAtingido: boolean;
    economiaPotencial: number | null;
    totalOfertas: number;
    ofertas: OfertaComparativo[];
    apexChartData: {
        categories: string[];
        series: Array<{
            name: string;
            data: number[];
        }>;
    };
}
export declare class ComparadorCotacoesReadModelService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    obterComparativo(workspaceId: string, itemWishlistId: string): Promise<ComparadorCotacoesPayload>;
}
