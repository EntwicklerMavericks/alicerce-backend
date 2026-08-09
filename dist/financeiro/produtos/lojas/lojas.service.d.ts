import { PrismaService } from '../../../prisma/prisma.service';
import { CriarLojaDto } from './dto/criar-loja.dto';
export declare class LojasService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    criar(workspaceId: string, dto: CriarLojaDto): Promise<{
        nome: string;
        id: string;
        dataCriacao: Date;
        ativo: boolean;
        workspaceId: string | null;
        sistema: boolean;
        urlWebsite: string | null;
        urlLogo: string | null;
    }>;
    listarPorWorkspace(workspaceId: string): Promise<{
        nome: string;
        id: string;
        dataCriacao: Date;
        ativo: boolean;
        workspaceId: string | null;
        sistema: boolean;
        urlWebsite: string | null;
        urlLogo: string | null;
    }[]>;
    obterPorId(workspaceId: string, id: string): Promise<{
        nome: string;
        id: string;
        dataCriacao: Date;
        ativo: boolean;
        workspaceId: string | null;
        sistema: boolean;
        urlWebsite: string | null;
        urlLogo: string | null;
    }>;
    atualizar(workspaceId: string, id: string, dto: Partial<CriarLojaDto>): Promise<{
        nome: string;
        id: string;
        dataCriacao: Date;
        ativo: boolean;
        workspaceId: string | null;
        sistema: boolean;
        urlWebsite: string | null;
        urlLogo: string | null;
    }>;
    remover(workspaceId: string, id: string): Promise<{
        nome: string;
        id: string;
        dataCriacao: Date;
        ativo: boolean;
        workspaceId: string | null;
        sistema: boolean;
        urlWebsite: string | null;
        urlLogo: string | null;
    }>;
}
