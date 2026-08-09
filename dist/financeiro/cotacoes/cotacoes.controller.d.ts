import { CotacoesService } from './cotacoes.service';
import { RegistrarCotacaoAvulsaDto } from './dto/registrar-cotacao-avulsa.dto';
import { AtualizarPrecoLinkDto } from './dto/atualizar-preco-link.dto';
export declare class CotacoesController {
    private readonly cotacoesService;
    constructor(cotacoesService: CotacoesService);
    registrarCotacaoAvulsa(workspaceId: string, dto: RegistrarCotacaoAvulsaDto): Promise<{
        id: string;
        dataCriacao: Date;
        dataAtualizacao: Date;
        ativo: boolean;
        workspaceId: string;
        observacoes: string | null;
        url: string | null;
        preco: import("@prisma/client/runtime/library").Decimal;
        versao: number;
        itemWishlistId: string;
        nomeLoja: string;
    }>;
    obterComparador(workspaceId: string, itemWishlistId: string): Promise<import("./read-models/comparador-cotacoes-read-model.service").ComparadorCotacoesPayload>;
    removerCotacaoAvulsa(workspaceId: string, id: string): Promise<{
        id: string;
        dataCriacao: Date;
        dataAtualizacao: Date;
        ativo: boolean;
        workspaceId: string;
        observacoes: string | null;
        url: string | null;
        preco: import("@prisma/client/runtime/library").Decimal;
        versao: number;
        itemWishlistId: string;
        nomeLoja: string;
    }>;
    atualizarPrecoLink(workspaceId: string, id: string, dto: AtualizarPrecoLinkDto): Promise<{
        id: string;
        dataCriacao: Date;
        dataAtualizacao: Date;
        ativo: boolean;
        lojaId: string;
        url: string;
        preco: import("@prisma/client/runtime/library").Decimal;
        versao: number;
        produtoId: string;
        ultimaVerificacao: Date | null;
    } | null>;
    executarMonitoramento(workspaceId: string): Promise<import("./domain/services/job-monitoramento-precos.service").ResultadoMonitoramentoPrecos>;
}
