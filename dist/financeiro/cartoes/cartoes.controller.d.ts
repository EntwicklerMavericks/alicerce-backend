import { CartoesService } from './cartoes.service';
import { CriarCartaoDto } from './dto/criar-cartao.dto';
export declare class CartoesController {
    private readonly cartoesService;
    constructor(cartoesService: CartoesService);
    criarCartao(dto: CriarCartaoDto, req: any): Promise<{
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
    }>;
    listarCartoes(req: any): Promise<{
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
                valor: import("@prisma/client/runtime/library").Decimal;
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
            valorPago: import("@prisma/client/runtime/library").Decimal | null;
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
