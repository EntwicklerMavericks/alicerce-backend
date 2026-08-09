import { RecorrenciasService } from './recorrencias.service';
import { RecurringGeneratorService } from './recurring-generator.service';
import { CriarRegraRecorrenciaDto } from './dto/criar-regra-recorrencia.dto';
export declare class RecorrenciasController {
    private readonly recorrenciasService;
    private readonly generatorService;
    constructor(recorrenciasService: RecorrenciasService, generatorService: RecurringGeneratorService);
    criarRegra(dto: CriarRegraRecorrenciaDto, req: any): Promise<{
        id: string;
        dataCriacao: Date;
        dataAtualizacao: Date;
        tipo: import("@prisma/client").$Enums.TipoTransacao;
        workspaceId: string;
        diaVencimento: number;
        valor: import("@prisma/client/runtime/library").Decimal;
        descricao: string;
        carteiraId: string | null;
        categoriaId: string;
        status: import("@prisma/client").$Enums.StatusRecorrencia;
        dataInicio: Date;
        dataFim: Date | null;
    }>;
    listarRegras(req: any): Promise<({
        carteira: {
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
        } | null;
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
        tipo: import("@prisma/client").$Enums.TipoTransacao;
        workspaceId: string;
        diaVencimento: number;
        valor: import("@prisma/client/runtime/library").Decimal;
        descricao: string;
        carteiraId: string | null;
        categoriaId: string;
        status: import("@prisma/client").$Enums.StatusRecorrencia;
        dataInicio: Date;
        dataFim: Date | null;
    })[]>;
    alternarStatus(id: string, status: 'ATIVA' | 'PAUSADA' | 'CANCELADA'): Promise<{
        id: string;
        dataCriacao: Date;
        dataAtualizacao: Date;
        tipo: import("@prisma/client").$Enums.TipoTransacao;
        workspaceId: string;
        diaVencimento: number;
        valor: import("@prisma/client/runtime/library").Decimal;
        descricao: string;
        carteiraId: string | null;
        categoriaId: string;
        status: import("@prisma/client").$Enums.StatusRecorrencia;
        dataInicio: Date;
        dataFim: Date | null;
    }>;
    processarCompetencia(competenciaISO?: string, req?: any): Promise<{
        competencia: string;
        totalGerados: number;
    }>;
}
