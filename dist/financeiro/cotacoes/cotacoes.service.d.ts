import { PrismaService } from '../../prisma/prisma.service';
import { RegistrarCotacaoAvulsaDto } from './dto/registrar-cotacao-avulsa.dto';
import { AtualizarPrecoLinkDto } from './dto/atualizar-preco-link.dto';
import { ComparadorCotacoesReadModelService } from './read-models/comparador-cotacoes-read-model.service';
import { JobMonitoramentoPrecosService } from './domain/services/job-monitoramento-precos.service';
export declare class CotacoesService {
    private readonly prisma;
    private readonly comparadorCotacoesReadModelService;
    private readonly jobMonitoramentoPrecosService;
    constructor(prisma: PrismaService, comparadorCotacoesReadModelService: ComparadorCotacoesReadModelService, jobMonitoramentoPrecosService: JobMonitoramentoPrecosService);
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
    obterComparadorItem(workspaceId: string, itemWishlistId: string): Promise<import("./read-models/comparador-cotacoes-read-model.service").ComparadorCotacoesPayload>;
    atualizarPrecoLink(workspaceId: string, linkId: string, dto: AtualizarPrecoLinkDto): Promise<{
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
    executarMonitoramentoPrecos(workspaceId: string): Promise<import("./domain/services/job-monitoramento-precos.service").ResultadoMonitoramentoPrecos>;
}
