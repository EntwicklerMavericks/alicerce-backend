import { WorkspacesService } from './workspaces.service';
export declare class WorkspacesController {
    private readonly workspacesService;
    constructor(workspacesService: WorkspacesService);
    listarMeusWorkspaces(usuarioId: string): Promise<{
        id: string;
        nome: string;
        tipo: import("@prisma/client").$Enums.TipoWorkspace;
        papel: import("@prisma/client").$Enums.PapelWorkspace;
        dataCriacao: Date;
    }[]>;
    obterWorkspace(workspaceId: string, usuarioId: string): Promise<{
        papel: import("@prisma/client").$Enums.PapelWorkspace;
        carteiras: {
            nome: string;
            id: string;
            dataCriacao: Date;
            dataAtualizacao: Date;
            tipo: import("@prisma/client").$Enums.TipoCarteira;
            saldo: import("@prisma/client/runtime/library").Decimal;
            permiteSaldoNegativo: boolean;
            icone: string | null;
            cor: string | null;
            ativo: boolean;
            padrao: boolean;
            pessoaId: string | null;
            workspaceId: string;
        }[];
        cartoesCredito: {
            nome: string;
            id: string;
            dataCriacao: Date;
            dataAtualizacao: Date;
            icone: string | null;
            cor: string | null;
            ativo: boolean;
            workspaceId: string;
            bandeira: import("@prisma/client").$Enums.BandeiraCartao;
            ultimosDigitos: string | null;
            limiteTotal: import("@prisma/client/runtime/library").Decimal;
            diaFechamento: number;
            diaVencimento: number;
        }[];
        nome: string;
        id: string;
        dataCriacao: Date;
        dataAtualizacao: Date;
        proprietarioId: string;
        tipo: import("@prisma/client").$Enums.TipoWorkspace;
    }>;
}
