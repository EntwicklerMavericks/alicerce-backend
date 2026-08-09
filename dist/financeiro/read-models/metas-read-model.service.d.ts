import { PrismaService } from '../../prisma/prisma.service';
export interface MetaComEsforco {
    id: string;
    nome: string;
    descricao?: string | null;
    valorAlvo: number;
    valorAcumulado: number;
    progressoPercentual: number;
    status: string;
    prazo?: Date | null;
    prazoAnoMes?: string | null;
    icone?: string | null;
    cor?: string | null;
    prioridade: number;
    esforcoMensal: {
        mesesRestantes: number;
        valorMensalNecessario: number;
        noPrazo: boolean;
    };
    ritmo: 'EXCELENTE' | 'NO_RITMO' | 'ATRASADO' | 'CONCLUIDO';
    dataCriacao: Date;
    dataAtualizacao: Date;
}
export declare class MetasReadModelService {
    private readonly prisma;
    private readonly calculadoraEsforco;
    constructor(prisma: PrismaService);
    listarMetasComCalculos(workspaceId: string): Promise<MetaComEsforco[]>;
    obterMetaDetalhadaPorId(workspaceId: string, metaId: string): Promise<{
        historicoAportes: {
            id: string;
            valor: number;
            data: Date;
            descricao: string | null;
            tipo: import("@prisma/client").$Enums.TipoTransacao;
            dataCriacao: Date;
        }[];
        id: string;
        nome: string;
        descricao?: string | null;
        valorAlvo: number;
        valorAcumulado: number;
        progressoPercentual: number;
        status: string;
        prazo?: Date | null;
        prazoAnoMes?: string | null;
        icone?: string | null;
        cor?: string | null;
        prioridade: number;
        esforcoMensal: {
            mesesRestantes: number;
            valorMensalNecessario: number;
            noPrazo: boolean;
        };
        ritmo: "EXCELENTE" | "NO_RITMO" | "ATRASADO" | "CONCLUIDO";
        dataCriacao: Date;
        dataAtualizacao: Date;
    } | null>;
    private mapearParaMetaComCalculos;
}
