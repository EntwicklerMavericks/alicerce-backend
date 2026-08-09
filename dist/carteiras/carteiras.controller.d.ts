import { CarteirasService } from './carteiras.service';
import { CriarCarteiraDto } from './dto/criar-carteira.dto';
import { TransferirFundosDto } from './dto/transferir-fundos.dto';
export declare class CarteirasController {
    private readonly carteirasService;
    constructor(carteirasService: CarteirasService);
    criar(workspaceId: string, usuarioId: string, dto: CriarCarteiraDto): Promise<{
        saldoCalculado: number;
        nome: string;
        id: string;
        dataCriacao: Date;
        dataAtualizacao: Date;
        tipo: import("@prisma/client").$Enums.TipoCarteira;
        saldo: import("@prisma/client/runtime/library").Decimal;
        permiteSaldoNegativo: boolean;
        icone: string | null;
        cor: string | null;
        ativo: boolean;
        padrao: boolean;
        pessoaId: string | null;
        workspaceId: string;
    }>;
    listarPorWorkspace(workspaceId: string): Promise<{
        carteiras: {
            saldoCalculado: number;
            saldoNegativoAlerta: boolean;
            pessoa: {
                nome: string;
                id: string;
            } | null;
            nome: string;
            id: string;
            dataCriacao: Date;
            dataAtualizacao: Date;
            tipo: import("@prisma/client").$Enums.TipoCarteira;
            saldo: import("@prisma/client/runtime/library").Decimal;
            permiteSaldoNegativo: boolean;
            icone: string | null;
            cor: string | null;
            ativo: boolean;
            padrao: boolean;
            pessoaId: string | null;
            workspaceId: string;
        }[];
        saldoTotalConsolidado: number;
    }>;
    obterPorId(workspaceId: string, id: string): Promise<{
        saldoCalculado: number;
        saldoNegativoAlerta: boolean;
        pessoa: {
            nome: string;
            id: string;
            dataCriacao: Date;
            dataAtualizacao: Date;
            ativo: boolean;
            workspaceId: string;
            parentesco: string;
        } | null;
        nome: string;
        id: string;
        dataCriacao: Date;
        dataAtualizacao: Date;
        tipo: import("@prisma/client").$Enums.TipoCarteira;
        saldo: import("@prisma/client/runtime/library").Decimal;
        permiteSaldoNegativo: boolean;
        icone: string | null;
        cor: string | null;
        ativo: boolean;
        padrao: boolean;
        pessoaId: string | null;
        workspaceId: string;
    }>;
    obterExtrato(workspaceId: string, id: string): Promise<{
        carteira: {
            saldoCalculado: number;
            saldoNegativoAlerta: boolean;
            pessoa: {
                nome: string;
                id: string;
                dataCriacao: Date;
                dataAtualizacao: Date;
                ativo: boolean;
                workspaceId: string;
                parentesco: string;
            } | null;
            nome: string;
            id: string;
            dataCriacao: Date;
            dataAtualizacao: Date;
            tipo: import("@prisma/client").$Enums.TipoCarteira;
            saldo: import("@prisma/client/runtime/library").Decimal;
            permiteSaldoNegativo: boolean;
            icone: string | null;
            cor: string | null;
            ativo: boolean;
            padrao: boolean;
            pessoaId: string | null;
            workspaceId: string;
        };
        movimentacoes: {
            valor: number;
            id: string;
            dataCriacao: Date;
            dataAtualizacao: Date;
            data: Date;
            tipo: import("@prisma/client").$Enums.TipoMovimentacao;
            workspaceId: string;
            descricao: string | null;
            carteiraId: string;
            criadoPorId: string | null;
            transferenciaId: string | null;
            referenciaId: string | null;
            referenciaTipo: import("@prisma/client").$Enums.ReferenciaTipoMovimentacao;
            origem: import("@prisma/client").$Enums.OrigemMovimentacao;
        }[];
    }>;
    transferirFundos(workspaceId: string, usuarioId: string, dto: TransferirFundosDto): Promise<{
        sucesso: boolean;
        transferencia: {
            id: string;
            dataCriacao: Date;
            data: Date;
            workspaceId: string;
            carteiraOrigemId: string;
            carteiraDestinoId: string;
            valor: import("@prisma/client/runtime/library").Decimal;
            descricao: string | null;
        };
        saldoOrigemAtual: number;
        saldoDestinoAtual: number;
        saldoNegativoAviso: boolean;
    }>;
    remover(workspaceId: string, id: string): Promise<void>;
}
