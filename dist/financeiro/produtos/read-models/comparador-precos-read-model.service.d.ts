import { PrismaService } from '../../../prisma/prisma.service';
export interface ComparativoPrecosProduto {
    produtoId: string;
    nome: string;
    marca: string | null;
    categoria: string | null;
    imagemPrincipalUrl: string | null;
    menorPreco: number | null;
    maiorPreco: number | null;
    diferencaPreco: number | null;
    economiaPercentual: number | null;
    totalOfertas: number;
    ofertas: Array<{
        linkId: string;
        lojaId: string;
        lojaNome: string;
        lojaLogo: string | null;
        lojaSistema: boolean;
        url: string;
        preco: number;
        versao: number;
        ultimaVerificacao: Date | null;
        historicoPrecos: Array<{
            preco: number;
            data: Date;
        }>;
    }>;
}
export declare class ComparadorPrecosReadModelService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    compararPrecosWorkspace(workspaceId: string): Promise<ComparativoPrecosProduto[]>;
    obterComparativoPorProduto(workspaceId: string, produtoId: string): Promise<ComparativoPrecosProduto>;
    private mapearComparativoProduto;
}
