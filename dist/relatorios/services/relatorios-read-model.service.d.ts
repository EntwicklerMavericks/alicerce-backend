import { PrismaService } from '../../prisma/prisma.service';
export interface PeriodoRelatorio {
    dataInicio: Date;
    dataFim: Date;
}
export interface FluxoCaixaRelatorio {
    saldoInicial: number;
    entradas: number;
    saidas: number;
    saldoFinal: number;
    resultadoPeriodo: number;
}
export interface CategoriaRelatorio {
    categoriaId: string;
    nome: string;
    tipo: string;
    valor: number;
    percentual: number;
}
export interface CartaoRelatorio {
    cartaoId: string;
    nome: string;
    bandeira: string;
    valorTotal: number;
    qtdTransacoes: number;
}
export interface MetaProjetoRelatorio {
    id: string;
    tipo: 'META' | 'PROJETO';
    nome: string;
    progressoPercentual: number;
    valorAlvoOuEstimado: number;
    valorAtualOuGasto: number;
    status: string;
}
export interface RelatoriosResult {
    periodo: PeriodoRelatorio;
    fluxoCaixa: FluxoCaixaRelatorio;
    categorias: CategoriaRelatorio[];
    cartoes: CartaoRelatorio[];
    metasProjetos: MetaProjetoRelatorio[];
}
export declare class RelatoriosReadModelService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    obterRelatorio(workspaceId: string, dataInicioInput?: Date | string, dataFimInput?: Date | string, referenceDateInput?: Date | string): Promise<RelatoriosResult>;
    private calcularIntervaloDatas;
    private calcularFluxoCaixa;
    private calcularCategorias;
    private calcularCartoes;
    private calcularMetasEProjetos;
    private sanitizarNumero;
}
