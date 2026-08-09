import { PrismaService } from '../../prisma/prisma.service';
import { CriarCartaoDto } from './dto/criar-cartao.dto';
import { Prisma } from '@prisma/client';
export declare class CartoesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    criarCartao(workspaceId: string, dto: CriarCartaoDto): Promise<{
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
        limiteTotal: Prisma.Decimal;
        diaFechamento: number;
        diaVencimento: number;
    }>;
    listarCartoes(workspaceId: string): Promise<{
        limiteTotal: number;
        limiteComprometido: number;
        limiteDisponivel: number;
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
        diaFechamento: number;
        diaVencimento: number;
    }[]>;
    obterPorId(id: string): Promise<{
        limiteTotal: number;
        limiteComprometido: number;
        limiteDisponivel: number;
        faturas: ({
            parcelas: {
                id: string;
                valor: Prisma.Decimal;
                status: import("@prisma/client").$Enums.StatusParcela;
                compraId: string;
                faturaId: string | null;
                numero: number;
                competenciaAno: number;
                competenciaMes: number;
            }[];
        } & {
            id: string;
            carteiraId: string | null;
            status: import("@prisma/client").$Enums.StatusFatura;
            mes: number;
            ano: number;
            dataVencimento: Date;
            cartaoId: string;
            dataPagamento: Date | null;
            valorPago: Prisma.Decimal | null;
        })[];
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
        diaFechamento: number;
        diaVencimento: number;
    }>;
}
