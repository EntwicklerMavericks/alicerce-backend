import { PessoasService } from './pessoas.service';
import { CriarPessoaDto } from './dto/criar-pessoa.dto';
import { AtualizarSalarioDto } from './dto/atualizar-salario.dto';
export declare class PessoasController {
    private readonly pessoasService;
    constructor(pessoasService: PessoasService);
    criar(workspaceId: string, dto: CriarPessoaDto): Promise<{
        configSalario: {
            id: string;
            dataCriacao: Date;
            dataAtualizacao: Date;
            tipo: import("@prisma/client").$Enums.TipoSalario;
            ativo: boolean;
            pessoaId: string;
            valorBase: import("@prisma/client/runtime/library").Decimal | null;
            valorHora: import("@prisma/client/runtime/library").Decimal | null;
            horasDiarias: import("@prisma/client/runtime/library").Decimal | null;
            diasTrabalho: import("@prisma/client/runtime/library").JsonValue | null;
        };
        rendaEstimadaMensal: number;
        nome: string;
        id: string;
        dataCriacao: Date;
        dataAtualizacao: Date;
        ativo: boolean;
        workspaceId: string;
        parentesco: string;
    }>;
    listarPorWorkspace(workspaceId: string): Promise<{
        rendaEstimadaMensal: number;
        configSalario: {
            id: string;
            dataCriacao: Date;
            dataAtualizacao: Date;
            tipo: import("@prisma/client").$Enums.TipoSalario;
            ativo: boolean;
            pessoaId: string;
            valorBase: import("@prisma/client/runtime/library").Decimal | null;
            valorHora: import("@prisma/client/runtime/library").Decimal | null;
            horasDiarias: import("@prisma/client/runtime/library").Decimal | null;
            diasTrabalho: import("@prisma/client/runtime/library").JsonValue | null;
        } | null;
        nome: string;
        id: string;
        dataCriacao: Date;
        dataAtualizacao: Date;
        ativo: boolean;
        workspaceId: string;
        parentesco: string;
    }[]>;
    obterPorId(workspaceId: string, id: string): Promise<{
        configSalario: {
            id: string;
            dataCriacao: Date;
            dataAtualizacao: Date;
            tipo: import("@prisma/client").$Enums.TipoSalario;
            ativo: boolean;
            pessoaId: string;
            valorBase: import("@prisma/client/runtime/library").Decimal | null;
            valorHora: import("@prisma/client/runtime/library").Decimal | null;
            horasDiarias: import("@prisma/client/runtime/library").Decimal | null;
            diasTrabalho: import("@prisma/client/runtime/library").JsonValue | null;
        } | null;
    } & {
        nome: string;
        id: string;
        dataCriacao: Date;
        dataAtualizacao: Date;
        ativo: boolean;
        workspaceId: string;
        parentesco: string;
    }>;
    atualizarSalario(workspaceId: string, id: string, dto: AtualizarSalarioDto): Promise<{
        configSalario: {
            id: string;
            dataCriacao: Date;
            dataAtualizacao: Date;
            tipo: import("@prisma/client").$Enums.TipoSalario;
            ativo: boolean;
            pessoaId: string;
            valorBase: import("@prisma/client/runtime/library").Decimal | null;
            valorHora: import("@prisma/client/runtime/library").Decimal | null;
            horasDiarias: import("@prisma/client/runtime/library").Decimal | null;
            diasTrabalho: import("@prisma/client/runtime/library").JsonValue | null;
        };
        rendaEstimadaMensal: number;
        nome: string;
        id: string;
        dataCriacao: Date;
        dataAtualizacao: Date;
        ativo: boolean;
        workspaceId: string;
        parentesco: string;
    }>;
    remover(workspaceId: string, id: string): Promise<void>;
}
