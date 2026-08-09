import { ComprasCartaoService } from './compras-cartao.service';
import { CriarCompraCartaoDto } from './dto/criar-compra-cartao.dto';
export declare class ComprasCartaoController {
    private readonly comprasCartaoService;
    constructor(comprasCartaoService: ComprasCartaoService);
    registrarCompra(dto: CriarCompraCartaoDto): Promise<{
        compra: {
            id: string;
            dataCriacao: Date;
            descricao: string;
            categoriaId: string;
            observacoes: string | null;
            cartaoId: string;
            valorTotal: import("@prisma/client/runtime/library").Decimal;
            qtdParcelas: number;
            dataCompra: Date;
        };
        qtdParcelasCriadas: number;
        primeiraCompetencia: string;
    }>;
}
