import { PrismaService } from '../../prisma/prisma.service';
export interface ProjetoConsolidadoResult {
    id: string;
    workspaceId: string;
    nome: string;
    descricao: string | null;
    status: string;
    prioridade: number;
    dataInicioPrevista: Date | null;
    dataFimPrevista: Date | null;
    dataConclusao: Date | null;
    versao: number;
    ativo: boolean;
    dataCriacao: Date;
    dataAtualizacao: Date;
    orcamentoEstimado: number;
    custoEstimadoCalculado: number;
    valorFinanciado: number;
    coberturaFinanceira: number;
    progressoFinanceiro: number;
    progressoFisico: number;
    readinessScore: number;
    etapas: any[];
}
export declare class ProjetosReadModelService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    obterProjetoConsolidado(workspaceId: string, projetoId: string, agora?: Date): Promise<ProjetoConsolidadoResult>;
    listarProjetosConsolidados(workspaceId: string, agora?: Date): Promise<ProjetoConsolidadoResult[]>;
    calcularConsolidadoProjeto(projeto: any, agora?: Date): ProjetoConsolidadoResult;
    private calcularCustoItemWishlist;
    private extrairMenorCotacao;
    private calcularValorAcumuladoMeta;
    private verificarItemReadiness;
}
