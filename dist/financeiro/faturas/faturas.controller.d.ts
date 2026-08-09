import { FaturasService } from './faturas.service';
import { PagarFaturaDto } from './dto/pagar-fatura.dto';
export declare class FaturasController {
    private readonly faturasService;
    constructor(faturasService: FaturasService);
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
                valorTotal: import("@prisma/client/runtime/library").Decimal;
                qtdParcelas: number;
                dataCompra: Date;
            };
        } & {
            id: string;
            valor: import("@prisma/client/runtime/library").Decimal;
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
        valorPago: import("@prisma/client/runtime/library").Decimal | null;
    }[]>;
    obterFaturaPorId(id: string): Promise<{
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
            limiteTotal: import("@prisma/client/runtime/library").Decimal;
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
                valorTotal: import("@prisma/client/runtime/library").Decimal;
                qtdParcelas: number;
                dataCompra: Date;
            };
        } & {
            id: string;
            valor: import("@prisma/client/runtime/library").Decimal;
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
        valorPago: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    pagarFatura(id: string, dto: PagarFaturaDto, req: any): Promise<{
        id: string;
        status: string;
        valorPago: number;
        dataPagamento: Date;
    }>;
}
