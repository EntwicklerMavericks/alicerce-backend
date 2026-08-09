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
exports.ProjetosReadModelService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ProjetosReadModelService = class ProjetosReadModelService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async obterProjetoConsolidado(workspaceId, projetoId, agora = new Date()) {
        const projeto = await this.prisma.projeto.findFirst({
            where: { id: projetoId, workspaceId, ativo: true },
            include: {
                etapas: {
                    where: { ativo: true },
                    orderBy: { ordem: 'asc' },
                    include: {
                        itens: {
                            where: { ativo: true },
                            include: {
                                itemWishlist: {
                                    include: {
                                        cotacoes: true,
                                        cotacoesAvulsas: {
                                            where: { ativo: true },
                                        },
                                    },
                                },
                                meta: {
                                    include: {
                                        aportes: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!projeto) {
            throw new common_1.NotFoundException('Projeto não encontrado.');
        }
        return this.calcularConsolidadoProjeto(projeto, agora);
    }
    async listarProjetosConsolidados(workspaceId, agora = new Date()) {
        const projetos = await this.prisma.projeto.findMany({
            where: { workspaceId, ativo: true },
            include: {
                etapas: {
                    where: { ativo: true },
                    orderBy: { ordem: 'asc' },
                    include: {
                        itens: {
                            where: { ativo: true },
                            include: {
                                itemWishlist: {
                                    include: {
                                        cotacoes: true,
                                        cotacoesAvulsas: {
                                            where: { ativo: true },
                                        },
                                    },
                                },
                                meta: {
                                    include: {
                                        aportes: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { dataCriacao: 'desc' },
        });
        return projetos.map((p) => this.calcularConsolidadoProjeto(p, agora));
    }
    calcularConsolidadoProjeto(projeto, agora = new Date()) {
        const orcamentoEstimado = projeto.orcamentoEstimado
            ? Number(projeto.orcamentoEstimado)
            : 0;
        let custoEstimadoCalculado = 0;
        let valorFinanciado = 0;
        let totalEtapas = 0;
        let etapasConcluidas = 0;
        let totalItensWishlist = 0;
        let itensWishlistProntos = 0;
        const etapasFormatadas = (projeto.etapas || []).map((etapa) => {
            totalEtapas += 1;
            if (etapa.status === 'CONCLUIDA') {
                etapasConcluidas += 1;
            }
            let etapaCusto = 0;
            let etapaFinanciado = 0;
            const itensFormatados = (etapa.itens || []).map((item) => {
                let itemCusto = 0;
                let itemFinanciado = 0;
                if (item.itemWishlist && item.itemWishlist.ativo !== false) {
                    totalItensWishlist += 1;
                    const wishlist = item.itemWishlist;
                    itemCusto = this.calcularCustoItemWishlist(wishlist);
                    etapaCusto += itemCusto;
                }
                if (item.meta && item.meta.status !== 'CANCELADA') {
                    itemFinanciado = this.calcularValorAcumuladoMeta(item.meta);
                    etapaFinanciado += itemFinanciado;
                }
                return {
                    id: item.id,
                    etapaId: item.etapaId,
                    itemWishlistId: item.itemWishlistId,
                    metaId: item.metaId,
                    observacoes: item.observacoes,
                    versao: item.versao,
                    ativo: item.ativo,
                    custoEstimado: Number(itemCusto.toFixed(2)),
                    valorFinanciado: Number(itemFinanciado.toFixed(2)),
                    itemWishlist: item.itemWishlist ? item.itemWishlist : null,
                    meta: item.meta ? item.meta : null,
                };
            });
            custoEstimadoCalculado += etapaCusto;
            valorFinanciado += etapaFinanciado;
            for (const item of etapa.itens || []) {
                if (item.itemWishlist && item.itemWishlist.ativo !== false) {
                    const wishlist = item.itemWishlist;
                    const isReady = this.verificarItemReadiness(wishlist, etapaCusto, etapaFinanciado, agora);
                    if (isReady) {
                        itensWishlistProntos += 1;
                    }
                }
            }
            return {
                id: etapa.id,
                projetoId: etapa.projetoId,
                nome: etapa.nome,
                descricao: etapa.descricao,
                ordem: etapa.ordem,
                status: etapa.status,
                dataInicio: etapa.dataInicio,
                dataConclusao: etapa.dataConclusao,
                versao: etapa.versao,
                ativo: etapa.ativo,
                custoEtapa: Number(etapaCusto.toFixed(2)),
                financiadoEtapa: Number(etapaFinanciado.toFixed(2)),
                itens: itensFormatados,
            };
        });
        const coberturaFinanceira = custoEstimadoCalculado > 0
            ? Math.min(Number(((valorFinanciado / custoEstimadoCalculado) * 100).toFixed(2)), 100)
            : 0;
        const alvoFinanceiro = custoEstimadoCalculado > 0
            ? custoEstimadoCalculado
            : orcamentoEstimado > 0
                ? orcamentoEstimado
                : 0;
        const progressoFinanceiro = alvoFinanceiro > 0
            ? Math.min(Number(((valorFinanciado / alvoFinanceiro) * 100).toFixed(2)), 100)
            : 0;
        const progressoFisico = totalEtapas > 0
            ? Number(((etapasConcluidas / totalEtapas) * 100).toFixed(2))
            : 0;
        const readinessScore = totalItensWishlist > 0
            ? Math.min(Number(((itensWishlistProntos / totalItensWishlist) * 100).toFixed(2)), 100)
            : 0;
        return {
            id: projeto.id,
            workspaceId: projeto.workspaceId,
            nome: projeto.nome,
            descricao: projeto.descricao,
            status: projeto.status,
            prioridade: projeto.prioridade,
            dataInicioPrevista: projeto.dataInicioPrevista,
            dataFimPrevista: projeto.dataFimPrevista,
            dataConclusao: projeto.dataConclusao,
            versao: projeto.versao,
            ativo: projeto.ativo,
            dataCriacao: projeto.dataCriacao,
            dataAtualizacao: projeto.dataAtualizacao,
            orcamentoEstimado: Number(orcamentoEstimado.toFixed(2)),
            custoEstimadoCalculado: Number(custoEstimadoCalculado.toFixed(2)),
            valorFinanciado: Number(valorFinanciado.toFixed(2)),
            coberturaFinanceira,
            progressoFinanceiro,
            progressoFisico,
            readinessScore,
            etapas: etapasFormatadas,
        };
    }
    calcularCustoItemWishlist(wishlist) {
        if (wishlist.precoAlvo && Number(wishlist.precoAlvo) > 0) {
            return Number(wishlist.precoAlvo);
        }
        const menorCotacao = this.extrairMenorCotacao(wishlist);
        if (menorCotacao !== null && menorCotacao > 0) {
            return menorCotacao;
        }
        if (wishlist.valorCompra && Number(wishlist.valorCompra) > 0) {
            return Number(wishlist.valorCompra);
        }
        return 0;
    }
    extrairMenorCotacao(wishlist) {
        const cotacoesNormais = wishlist.cotacoes || [];
        const cotacoesAvulsas = wishlist.cotacoesAvulsas || [];
        const precosNormais = cotacoesNormais
            .map((c) => Number(c.preco))
            .filter((p) => !isNaN(p) && p > 0);
        const precosAvulsos = cotacoesAvulsas
            .map((c) => Number(c.preco))
            .filter((p) => !isNaN(p) && p > 0);
        const todosPrecos = [...precosNormais, ...precosAvulsos];
        if (todosPrecos.length === 0)
            return null;
        return Math.min(...todosPrecos);
    }
    calcularValorAcumuladoMeta(meta) {
        const aportes = meta.aportes || [];
        return aportes.reduce((acc, aporte) => {
            const v = aporte.valor ? Number(aporte.valor) : 0;
            return acc + v;
        }, 0);
    }
    verificarItemReadiness(wishlist, etapaCusto, etapaFinanciado, agora) {
        if (wishlist.status === 'COMPRADO') {
            return true;
        }
        if (wishlist.status === 'PLANEJADO') {
            const fimEsfriamento = wishlist.fimEsfriamento
                ? new Date(wishlist.fimEsfriamento)
                : null;
            const esfriamentoConcluido = fimEsfriamento
                ? agora.getTime() >= fimEsfriamento.getTime()
                : true;
            const etapaFinanciada = etapaFinanciado >= etapaCusto && etapaCusto > 0;
            return esfriamentoConcluido && etapaFinanciada;
        }
        return false;
    }
};
exports.ProjetosReadModelService = ProjetosReadModelService;
exports.ProjetosReadModelService = ProjetosReadModelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjetosReadModelService);
//# sourceMappingURL=projetos-read-model.service.js.map