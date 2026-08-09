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
exports.ComparadorCotacoesReadModelService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let ComparadorCotacoesReadModelService = class ComparadorCotacoesReadModelService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async obterComparativo(workspaceId, itemWishlistId) {
        const item = await this.prisma.itemWishlist.findFirst({
            where: {
                id: itemWishlistId,
                workspaceId,
                ativo: true,
            },
            include: {
                cotacoesAvulsas: {
                    where: { ativo: true },
                },
                produto: {
                    include: {
                        links: {
                            where: {
                                ativo: true,
                                loja: { ativo: true },
                            },
                            include: {
                                loja: true,
                            },
                        },
                    },
                },
            },
        });
        if (!item) {
            throw new common_1.NotFoundException('Item da wishlist não encontrado.');
        }
        const ofertas = [];
        if (item.cotacoesAvulsas && item.cotacoesAvulsas.length > 0) {
            for (const cotAvulsa of item.cotacoesAvulsas) {
                ofertas.push({
                    id: cotAvulsa.id,
                    nomeLoja: cotAvulsa.nomeLoja,
                    preco: Number(cotAvulsa.preco),
                    url: cotAvulsa.url ?? null,
                    tipo: 'COTACAO_AVULSA',
                    observacoes: cotAvulsa.observacoes ?? null,
                });
            }
        }
        if (item.produto?.links && item.produto.links.length > 0) {
            for (const link of item.produto.links) {
                ofertas.push({
                    id: link.id,
                    nomeLoja: link.loja.nome,
                    preco: Number(link.preco),
                    url: link.url ?? null,
                    tipo: 'LINK_PRODUTO',
                    observacoes: null,
                });
            }
        }
        ofertas.sort((a, b) => a.preco - b.preco);
        const precoAlvo = item.precoAlvo !== null && item.precoAlvo !== undefined
            ? Number(item.precoAlvo)
            : null;
        const precos = ofertas.map((o) => o.preco);
        const menorCotacao = precos.length > 0 ? Math.min(...precos) : null;
        const maiorCotacao = precos.length > 0 ? Math.max(...precos) : null;
        let alvoAtingido = false;
        let economiaPotencial = null;
        if (precoAlvo === null) {
            alvoAtingido = false;
            economiaPotencial = null;
        }
        else {
            if (menorCotacao !== null) {
                alvoAtingido = menorCotacao <= precoAlvo;
                economiaPotencial = Math.max(precoAlvo - menorCotacao, 0);
            }
            else {
                alvoAtingido = false;
                economiaPotencial = null;
            }
        }
        const categories = ofertas.map((o) => o.nomeLoja);
        const seriesData = ofertas.map((o) => o.preco);
        const apexChartData = {
            categories,
            series: [
                {
                    name: 'Preço Cotação',
                    data: seriesData,
                },
            ],
        };
        return {
            itemWishlistId: item.id,
            nomeItem: item.nome,
            precoAlvo,
            menorCotacao,
            maiorCotacao,
            alvoAtingido,
            economiaPotencial,
            totalOfertas: ofertas.length,
            ofertas,
            apexChartData,
        };
    }
};
exports.ComparadorCotacoesReadModelService = ComparadorCotacoesReadModelService;
exports.ComparadorCotacoesReadModelService = ComparadorCotacoesReadModelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ComparadorCotacoesReadModelService);
//# sourceMappingURL=comparador-cotacoes-read-model.service.js.map