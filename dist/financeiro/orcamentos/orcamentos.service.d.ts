import { PrismaService } from '../../prisma/prisma.service';
import { OrcamentosReadModelService } from '../read-models/orcamentos-read-model.service';
import { CriarOrcamentoDto } from './dto/criar-orcamento.dto';
import { Prisma } from '@prisma/client';
export declare class OrcamentosService {
    private readonly prisma;
    private readonly readModelService;
    constructor(prisma: PrismaService, readModelService: OrcamentosReadModelService);
    criarOuAtualizar(workspaceId: string, dto: CriarOrcamentoDto): Promise<{
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
        workspaceId: string;
        categoriaId: string;
        mes: number;
        ano: number;
        valorPlanejado: Prisma.Decimal;
        valorReal: Prisma.Decimal;
    }>;
    listarComConsumo(workspaceId: string, mes?: number, ano?: number): Promise<import("../read-models/orcamentos-read-model.service").ItemOrcamentoConsumo[]>;
    remover(workspaceId: string, id: string): Promise<{
        id: string;
        mensagem: string;
    }>;
}
