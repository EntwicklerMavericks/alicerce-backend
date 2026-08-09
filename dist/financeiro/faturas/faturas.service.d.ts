import { PrismaService } from '../../prisma/prisma.service';
import { LedgerService } from '../ledger/ledger.service';
import { PagarFaturaDto } from './dto/pagar-fatura.dto';
import { Prisma } from '@prisma/client';
export declare class FaturasService {
    private readonly prisma;
    private readonly ledgerService;
    private readonly logger;
    constructor(prisma: PrismaService, ledgerService: LedgerService);
    obterFaturasDoCartao(cartaoId: string): Promise<{
        valorTotal: number;
        parcelas: ({
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
        } & {
            id: string;
            valor: Prisma.Decimal;
            status: import("@prisma/client").$Enums.StatusParcela;
            compraId: string;
            faturaId: string | null;
            numero: number;
            competenciaAno: number;
            competenciaMes: number;
        })[];
        id: string;
        carteiraId: string | null;
        status: import("@prisma/client").$Enums.StatusFatura;
        mes: number;
        ano: number;
        dataVencimento: Date;
        cartaoId: string;
        dataPagamento: Date | null;
        valorPago: Prisma.Decimal | null;
    }[]>;
    obterFaturaPorId(faturaId: string): Promise<{
        valorTotal: number;
        cartao: {
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
        };
        parcelas: ({
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
        } & {
            id: string;
            valor: Prisma.Decimal;
            status: import("@prisma/client").$Enums.StatusParcela;
            compraId: string;
            faturaId: string | null;
            numero: number;
            competenciaAno: number;
            competenciaMes: number;
        })[];
        id: string;
        carteiraId: string | null;
        status: import("@prisma/client").$Enums.StatusFatura;
        mes: number;
        ano: number;
        dataVencimento: Date;
        cartaoId: string;
        dataPagamento: Date | null;
        valorPago: Prisma.Decimal | null;
    }>;
    pagarFatura(faturaId: string, dto: PagarFaturaDto, criadoPorId?: string): Promise<{
        id: string;
        status: string;
        valorPago: number;
        dataPagamento: Date;
    }>;
}
