import { PrismaService } from '../../prisma/prisma.service';
import { CriarRegraRecorrenciaDto } from './dto/criar-regra-recorrencia.dto';
import { Prisma } from '@prisma/client';
export declare class RecorrenciasService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    criarRegra(workspaceId: string, dto: CriarRegraRecorrenciaDto): Promise<{
        id: string;
        dataCriacao: Date;
        dataAtualizacao: Date;
        tipo: import("@prisma/client").$Enums.TipoTransacao;
        workspaceId: string;
        diaVencimento: number;
        valor: Prisma.Decimal;
        descricao: string;
        carteiraId: string | null;
        categoriaId: string;
        status: import("@prisma/client").$Enums.StatusRecorrencia;
        dataInicio: Date;
        dataFim: Date | null;
    }>;
    listarRegras(workspaceId: string): Promise<({
        carteira: {
            nome: string;
            id: string;
            dataCriacao: Date;
            dataAtualizacao: Date;
            tipo: import("@prisma/client").$Enums.TipoCarteira;
            saldo: Prisma.Decimal;
            permiteSaldoNegativo: boolean;
            icone: string | null;
            cor: string | null;
            ativo: boolean;
            padrao: boolean;
            pessoaId: string | null;
            workspaceId: string;
        } | null;
        categoria: {
            nome: string;
            id: string;
            dataCriacao: Date;
            dataAtualizacao: Date;
            tipo: import("@prisma/client").$Enums.TipoCategoria;
            icone: string | null;
            cor: string | null;
            workspaceId: string | null;
            sistema: boolean;
            categoriaPaiId: string | null;
        };
    } & {
        id: string;
        dataCriacao: Date;
        dataAtualizacao: Date;
        tipo: import("@prisma/client").$Enums.TipoTransacao;
        workspaceId: string;
        diaVencimento: number;
        valor: Prisma.Decimal;
        descricao: string;
        carteiraId: string | null;
        categoriaId: string;
        status: import("@prisma/client").$Enums.StatusRecorrencia;
        dataInicio: Date;
        dataFim: Date | null;
    })[]>;
    alternarStatus(id: string, status: 'ATIVA' | 'PAUSADA' | 'CANCELADA'): Promise<{
        id: string;
        dataCriacao: Date;
        dataAtualizacao: Date;
        tipo: import("@prisma/client").$Enums.TipoTransacao;
        workspaceId: string;
        diaVencimento: number;
        valor: Prisma.Decimal;
        descricao: string;
        carteiraId: string | null;
        categoriaId: string;
        status: import("@prisma/client").$Enums.StatusRecorrencia;
        dataInicio: Date;
        dataFim: Date | null;
    }>;
}
