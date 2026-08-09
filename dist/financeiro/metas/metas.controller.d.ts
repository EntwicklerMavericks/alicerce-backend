import { MetasService } from './metas.service';
import { CriarMetaDto } from './dto/criar-meta.dto';
import { AtualizarMetaDto } from './dto/atualizar-meta.dto';
export declare class MetasController {
    private readonly metasService;
    constructor(metasService: MetasService);
    criar(workspaceId: string, dto: CriarMetaDto): Promise<{
        nome: string;
        id: string;
        dataCriacao: Date;
        dataAtualizacao: Date;
        icone: string | null;
        cor: string | null;
        workspaceId: string;
        descricao: string | null;
        status: import("@prisma/client").$Enums.StatusMeta;
        valorAlvo: import("@prisma/client/runtime/library").Decimal;
        prazo: Date | null;
        prioridade: number;
        dataExclusao: Date | null;
    }>;
    listar(workspaceId: string): Promise<import("../read-models/metas-read-model.service").MetaComEsforco[]>;
    obterPorId(workspaceId: string, id: string): Promise<{
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
    }>;
    atualizar(workspaceId: string, id: string, dto: AtualizarMetaDto): Promise<{
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
    }>;
    remover(workspaceId: string, id: string): Promise<{
        id: string;
        mensagem: string;
    }>;
}
