import { PrismaService } from '../../prisma/prisma.service';
import { CriarCompraCartaoDto } from './dto/criar-compra-cartao.dto';
import { Prisma } from '@prisma/client';
export declare class ComprasCartaoService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    registrarCompra(dto: CriarCompraCartaoDto): Promise<{
        compra: {
            id: string;
            dataCriacao: Date;
            descricao: string;
            categoriaId: string;
            observacoes: string | null;
            cartaoId: string;
            valorTotal: Prisma.Decimal;
            qtdParcelas: number;
            dataCompra: Date;
        };
        qtdParcelasCriadas: number;
        primeiraCompetencia: string;
    }>;
}
