import { MetasService } from './metas.service';
import { CriarAporteMetaDto } from './dto/criar-aporte-meta.dto';
export declare class AportesController {
    private readonly metasService;
    constructor(metasService: MetasService);
    registrarAporte(workspaceId: string, metaId: string, dto: CriarAporteMetaDto): Promise<{
        id: string;
        dataCriacao: Date;
        data: Date;
        tipo: import("@prisma/client").$Enums.TipoTransacao;
        valor: import("@prisma/client/runtime/library").Decimal;
        descricao: string | null;
        metaId: string;
    }>;
    removerAporte(workspaceId: string, metaId: string, aporteId: string): Promise<{
        id: string;
        mensagem: string;
    }>;
}
