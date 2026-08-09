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
exports.ComparadorPrecosReadModelService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let ComparadorPrecosReadModelService = class ComparadorPrecosReadModelService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async compararPrecosWorkspace(workspaceId) {
        const produtos = await this.prisma.produto.findMany({
            where: {
                workspaceId,
                ativo: true,
            },
            include: {
                categoria: true,
                imagens: {
                    where: { ativo: true },
                    orderBy: { principal: 'desc' },
                    take: 1,
                },
                links: {
                    where: {
                        ativo: true,
                        loja: { ativo: true },
                    },
                    include: {
                        loja: true,
                        historicoPrecos: {
                            orderBy: { data: 'desc' },
                            take: 10,
                        },
                    },
                    orderBy: {
                        preco: 'asc',
                    },
                },
            },
            orderBy: { nome: 'asc' },
        });
        return produtos.map((p) => this.mapearComparativoProduto(p));
    }
    async obterComparativoPorProduto(workspaceId, produtoId) {
        const produto = await this.prisma.produto.findFirst({
            where: {
                id: produtoId,
                workspaceId,
                ativo: true,
            },
            include: {
                categoria: true,
                imagens: {
                    where: { ativo: true },
                    orderBy: { principal: 'desc' },
                    take: 1,
                },
                links: {
                    where: {
                        ativo: true,
                        loja: { ativo: true },
                    },
                    include: {
                        loja: true,
                        historicoPrecos: {
                            orderBy: { data: 'desc' },
                            take: 20,
                        },
                    },
                    orderBy: {
                        preco: 'asc',
                    },
                },
            },
        });
        if (!produto) {
            throw new common_1.NotFoundException('Produto não encontrado ou inativo.');
        }
        return this.mapearComparativoProduto(produto);
    }
    mapearComparativoProduto(produto) {
        const imagemPrincipalUrl = produto.imagens?.[0]?.url || null;
        const ofertas = produto.links.map((link) => ({
            linkId: link.id,
            lojaId: link.loja.id,
            lojaNome: link.loja.nome,
            lojaLogo: link.loja.urlLogo,
            lojaSistema: link.loja.sistema,
            url: link.url,
            preco: Number(link.preco),
            versao: link.versao,
            ultimaVerificacao: link.ultimaVerificacao,
            historicoPrecos: link.historicoPrecos.map((h) => ({
                preco: Number(h.preco),
                data: h.data,
            })),
        }));
        const precos = ofertas.map((o) => o.preco);
        const menorPreco = precos.length > 0 ? Math.min(...precos) : null;
        const maiorPreco = precos.length > 0 ? Math.max(...precos) : null;
        const diferencaPreco = menorPreco !== null && maiorPreco !== null ? maiorPreco - menorPreco : null;
        const economiaPercentual = maiorPreco && diferencaPreco !== null && maiorPreco > 0
            ? Number(((diferencaPreco / maiorPreco) * 100).toFixed(2))
            : null;
        return {
            produtoId: produto.id,
            nome: produto.nome,
            marca: produto.marca,
            categoria: produto.categoria?.nome || null,
            imagemPrincipalUrl,
            menorPreco,
            maiorPreco,
            diferencaPreco,
            economiaPercentual,
            totalOfertas: ofertas.length,
            ofertas,
        };
    }
};
exports.ComparadorPrecosReadModelService = ComparadorPrecosReadModelService;
exports.ComparadorPrecosReadModelService = ComparadorPrecosReadModelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ComparadorPrecosReadModelService);
//# sourceMappingURL=comparador-precos-read-model.service.js.map