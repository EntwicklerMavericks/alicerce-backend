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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var JobMonitoramentoPrecosService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobMonitoramentoPrecosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../prisma/prisma.service");
const fonte_cotacao_provider_1 = require("../providers/fonte-cotacao.provider");
const concurrency_conflict_exception_1 = require("../../../domain/exceptions/concurrency-conflict.exception");
let JobMonitoramentoPrecosService = JobMonitoramentoPrecosService_1 = class JobMonitoramentoPrecosService {
    prisma;
    fonteCotacaoProvider;
    logger = new common_1.Logger(JobMonitoramentoPrecosService_1.name);
    constructor(prisma, fonteCotacaoProvider) {
        this.prisma = prisma;
        this.fonteCotacaoProvider = fonteCotacaoProvider;
    }
    async executarMonitoramentoPrecos(workspaceId) {
        const where = { ativo: true };
        if (workspaceId) {
            where.produto = { workspaceId };
        }
        const links = await this.prisma.linkProduto.findMany({ where });
        let processados = 0;
        let atualizados = 0;
        let erros = 0;
        for (const link of links) {
            processados++;
            let novoPreco;
            try {
                novoPreco = await this.fonteCotacaoProvider.obterPreco(link);
            }
            catch (err) {
                erros++;
                this.logger.error(`Erro ao obter preço da fonte para o link ${link.id}: ${err.message}`, err.stack);
                continue;
            }
            try {
                const atualizou = await this.processarLinkAtomico(link.id, link.versao, novoPreco);
                if (atualizou) {
                    atualizados++;
                }
            }
            catch (err) {
                erros++;
                this.logger.error(`Falha ao atualizar preço para o link ${link.id}: ${err.message}`, err.stack);
            }
        }
        return { processados, atualizados, erros };
    }
    async processarLinkAtomico(linkId, versaoEsperada, novoPreco) {
        return await this.prisma.$transaction(async (tx) => {
            const linkAtual = await tx.linkProduto.findUnique({
                where: { id: linkId },
            });
            if (!linkAtual || !linkAtual.ativo) {
                return false;
            }
            if (linkAtual.versao !== versaoEsperada) {
                throw new concurrency_conflict_exception_1.ConcurrencyConflictException(`Conflito de concorrência no link ${linkId}: versão esperada ${versaoEsperada}, versão atual ${linkAtual.versao}`);
            }
            const precoAtualNum = Number(linkAtual.preco);
            const novoPrecoNum = Number(novoPreco);
            if (novoPrecoNum === precoAtualNum) {
                return false;
            }
            await tx.linkProduto.update({
                where: { id: linkId, versao: linkAtual.versao },
                data: {
                    preco: novoPrecoNum,
                    versao: { increment: 1 },
                    ultimaVerificacao: new Date(),
                },
            });
            await tx.historicoPreco.create({
                data: {
                    linkProdutoId: linkId,
                    preco: novoPrecoNum,
                    data: new Date(),
                },
            });
            return true;
        });
    }
};
exports.JobMonitoramentoPrecosService = JobMonitoramentoPrecosService;
exports.JobMonitoramentoPrecosService = JobMonitoramentoPrecosService = JobMonitoramentoPrecosService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(fonte_cotacao_provider_1.FONTE_COTACAO_PROVIDER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], JobMonitoramentoPrecosService);
//# sourceMappingURL=job-monitoramento-precos.service.js.map