import { LojasService } from './lojas.service';
import { CriarLojaDto } from './dto/criar-loja.dto';
export declare class LojasController {
    private readonly lojasService;
    constructor(lojasService: LojasService);
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
    listar(workspaceId: string): Promise<{
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
    atualizar(workspaceId: string, id: string, dto: CriarLojaDto): Promise<{
        nome: string;
        id: string;
        dataCriacao: Date;
        ativo: boolean;
        workspaceId: string | null;
        sistema: boolean;
        urlWebsite: string | null;
        urlLogo: string | null;
    }>;
    remover(workspaceId: string, id: string): Promise<void>;
}
