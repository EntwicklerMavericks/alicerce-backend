import { OrcamentosService } from './orcamentos.service';
import { CriarOrcamentoDto } from './dto/criar-orcamento.dto';
export declare class OrcamentosController {
    private readonly orcamentosService;
    constructor(orcamentosService: OrcamentosService);
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
        valorPlanejado: import("@prisma/client/runtime/library").Decimal;
        valorReal: import("@prisma/client/runtime/library").Decimal;
    }>;
    listar(workspaceId: string, ano?: string, mes?: string): Promise<import("../read-models/orcamentos-read-model.service").ItemOrcamentoConsumo[]>;
    remover(workspaceId: string, id: string): Promise<{
        id: string;
        mensagem: string;
    }>;
}
