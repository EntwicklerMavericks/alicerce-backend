import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CriarPessoaDto } from './dto/criar-pessoa.dto';
import { AtualizarSalarioDto } from './dto/atualizar-salario.dto';
export declare class PessoasService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    criar(workspaceId: string, dto: CriarPessoaDto): Promise<{
        configSalario: {
            id: string;
            dataCriacao: Date;
            dataAtualizacao: Date;
            tipo: import("@prisma/client").$Enums.TipoSalario;
            ativo: boolean;
            pessoaId: string;
            valorBase: Prisma.Decimal | null;
            valorHora: Prisma.Decimal | null;
            horasDiarias: Prisma.Decimal | null;
            diasTrabalho: Prisma.JsonValue | null;
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
            valorBase: Prisma.Decimal | null;
            valorHora: Prisma.Decimal | null;
            horasDiarias: Prisma.Decimal | null;
            diasTrabalho: Prisma.JsonValue | null;
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
            valorBase: Prisma.Decimal | null;
            valorHora: Prisma.Decimal | null;
            horasDiarias: Prisma.Decimal | null;
            diasTrabalho: Prisma.JsonValue | null;
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
            valorBase: Prisma.Decimal | null;
            valorHora: Prisma.Decimal | null;
            horasDiarias: Prisma.Decimal | null;
            diasTrabalho: Prisma.JsonValue | null;
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
