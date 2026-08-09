"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CotacoesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const cotacao_avulsa_aggregate_1 = require("./domain/entities/cotacao-avulsa.aggregate");
const comparador_cotacoes_read_model_service_1 = require("./read-models/comparador-cotacoes-read-model.service");
const job_monitoramento_precos_service_1 = require("./domain/services/job-monitoramento-precos.service");
let CotacoesService = class CotacoesService {
    prisma;
    comparadorCotacoesReadModelService;
    jobMonitoramentoPrecosService;
    constructor(prisma, comparadorCotacoesReadModelService, jobMonitoramentoPrecosService) {
        this.prisma = prisma;
        this.comparadorCotacoesReadModelService = comparadorCotacoesReadModelService;
        this.jobMonitoramentoPrecosService = jobMonitoramentoPrecosService;
    }
    async registrarCotacaoAvulsa(workspaceId, dto) {
        const itemWishlist = await this.prisma.itemWishlist.findFirst({
            where: {
                id: dto.itemWishlistId,
                workspaceId,
                ativo: true,
            },
        });
        if (!itemWishlist) {
            throw new common_1.NotFoundException('Item da wishlist não encontrado para este workspace.');
        }
        if (itemWishlist.workspaceId !== workspaceId) {
            throw new common_1.ForbiddenException('Acesso negado: o item da wishlist pertence a outro workspace.');
        }
        const aggregate = cotacao_avulsa_aggregate_1.CotacaoAvulsaAggregate.criar({
            workspaceId,
            itemWishlistId: dto.itemWishlistId,
            nomeLoja: dto.nomeLoja,
            preco: dto.preco,
            url: dto.url,
            observacoes: dto.observacoes,
        });
        if (aggregate.workspaceId !== workspaceId) {
            throw new common_1.ForbiddenException('Aviso de segurança: inconsistência no workspace ID da cotação.');
        }
        return await this.prisma.cotacaoAvulsa.create({
            data: {
                id: aggregate.id,
                workspaceId: aggregate.workspaceId,
                itemWishlistId: aggregate.itemWishlistId,
                nomeLoja: aggregate.nomeLoja,
                preco: aggregate.preco,
                url: aggregate.url,
                observacoes: aggregate.observacoes,
                versao: aggregate.versao,
                ativo: aggregate.ativo,
                dataCriacao: aggregate.dataCriacao,
                dataAtualizacao: aggregate.dataAtualizacao,
            },
        });
    }
    async removerCotacaoAvulsa(workspaceId, id) {
        const cotacaoDb = await this.prisma.cotacaoAvulsa.findFirst({
            where: {
                id,
                workspaceId,
                ativo: true,
            },
        });
        if (!cotacaoDb) {
            throw new common_1.NotFoundException('Cotação avulsa não encontrada.');
        }
        const aggregate = cotacao_avulsa_aggregate_1.CotacaoAvulsaAggregate.reconstituir({
            id: cotacaoDb.id,
            workspaceId: cotacaoDb.workspaceId,
            itemWishlistId: cotacaoDb.itemWishlistId,
            nomeLoja: cotacaoDb.nomeLoja,
            preco: Number(cotacaoDb.preco),
            url: cotacaoDb.url,
            observacoes: cotacaoDb.observacoes,
            versao: cotacaoDb.versao,
            ativo: cotacaoDb.ativo,
            dataCriacao: cotacaoDb.dataCriacao,
            dataAtualizacao: cotacaoDb.dataAtualizacao,
        });
        aggregate.desativar();
        return await this.prisma.cotacaoAvulsa.update({
            where: { id },
            data: {
                ativo: aggregate.ativo,
                dataAtualizacao: aggregate.dataAtualizacao,
            },
        });
    }
    async obterComparadorItem(workspaceId, itemWishlistId) {
        return await this.comparadorCotacoesReadModelService.obterComparativo(workspaceId, itemWishlistId);
    }
    async atualizarPrecoLink(workspaceId, linkId, dto) {
        const link = await this.prisma.linkProduto.findFirst({
            where: {
                id: linkId,
                ativo: true,
                produto: { workspaceId },
            },
        });
        if (!link) {
            throw new common_1.NotFoundException('Link de produto não encontrado para este workspace.');
        }
        await this.jobMonitoramentoPrecosService.processarLinkAtomico(link.id, link.versao, dto.preco);
        return await this.prisma.linkProduto.findUnique({
            where: { id: linkId },
        });
    }
    async executarMonitoramentoPrecos(workspaceId) {
        return await this.jobMonitoramentoPrecosService.executarMonitoramentoPrecos(workspaceId);
    }
};
exports.CotacoesService = CotacoesService;
exports.CotacoesService = CotacoesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        comparador_cotacoes_read_model_service_1.ComparadorCotacoesReadModelService,
        job_monitoramento_precos_service_1.JobMonitoramentoPrecosService])
], CotacoesService);
//# sourceMappingURL=cotacoes.service.js.map