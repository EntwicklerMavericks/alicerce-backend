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
exports.SimulationSnapshotBuilder = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const library_1 = require("@prisma/client/runtime/library");
let SimulationSnapshotBuilder = class SimulationSnapshotBuilder {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async buildSnapshot(workspaceId, projetoId, referenceDate = new Date()) {
        const dbProjeto = await this.prisma.projeto.findFirst({
            where: {
                id: projetoId,
                workspaceId,
                ativo: true,
            },
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
                                        cotacoesAvulsas: { where: { ativo: true } },
                                    },
                                },
                                meta: {
                                    include: { aportes: true },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!dbProjeto) {
            throw new common_1.NotFoundException('Projeto não encontrado ou inativo.');
        }
        return {
            referenceDate,
            projeto: {
                id: dbProjeto.id,
                nome: dbProjeto.nome,
                versao: dbProjeto.versao,
                status: dbProjeto.status,
                orcamentoEstimado: dbProjeto.orcamentoEstimado
                    ? new library_1.Decimal(dbProjeto.orcamentoEstimado.toString())
                    : null,
                dataInicioPrevista: dbProjeto.dataInicioPrevista,
                dataFimPrevista: dbProjeto.dataFimPrevista,
            },
            etapas: dbProjeto.etapas.map((etapa) => ({
                id: etapa.id,
                nome: etapa.nome,
                ordem: etapa.ordem,
                status: etapa.status,
                versao: etapa.versao,
                dataInicio: etapa.dataInicio,
                dataConclusao: etapa.dataConclusao,
                itens: etapa.itens.map((item) => {
                    let wish = null;
                    if (item.itemWishlist && item.itemWishlist.ativo !== false) {
                        const w = item.itemWishlist;
                        const precoCalculado = this.determinarPrecoWishlist(w);
                        wish = {
                            id: w.id,
                            nome: w.nome,
                            status: w.status,
                            preco: precoCalculado,
                            diasEsfriamento: w.diasEsfriamento ?? 7,
                            inicioEsfriamento: w.inicioEsfriamento ? new Date(w.inicioEsfriamento) : null,
                            fimEsfriamento: w.fimEsfriamento ? new Date(w.fimEsfriamento) : null,
                        };
                    }
                    let meta = null;
                    if (item.meta && item.meta.dataExclusao === null) {
                        const m = item.meta;
                        const acum = (m.aportes || []).reduce((acc, ap) => acc.plus(new library_1.Decimal(ap.valor.toString())), new library_1.Decimal(0));
                        meta = {
                            id: m.id,
                            nome: m.nome,
                            status: m.status,
                            valorAlvo: new library_1.Decimal(m.valorAlvo.toString()),
                            valorAcumulado: acum,
                        };
                    }
                    return {
                        id: item.id,
                        itemWishlist: wish,
                        meta,
                    };
                }),
            })),
        };
    }
    determinarPrecoWishlist(wishlist) {
        if (wishlist.precoAlvo && Number(wishlist.precoAlvo) > 0) {
            return new library_1.Decimal(wishlist.precoAlvo.toString());
        }
        const precosNormais = (wishlist.cotacoes || [])
            .map((c) => Number(c.preco))
            .filter((p) => !isNaN(p) && p > 0);
        const precosAvulsos = (wishlist.cotacoesAvulsas || [])
            .map((c) => Number(c.preco))
            .filter((p) => !isNaN(p) && p > 0);
        const todosPrecos = [...precosNormais, ...precosAvulsos];
        if (todosPrecos.length > 0) {
            const minPreco = Math.min(...todosPrecos);
            return new library_1.Decimal(minPreco.toString());
        }
        if (wishlist.valorCompra && Number(wishlist.valorCompra) > 0) {
            return new library_1.Decimal(wishlist.valorCompra.toString());
        }
        return new library_1.Decimal(0);
    }
};
exports.SimulationSnapshotBuilder = SimulationSnapshotBuilder;
exports.SimulationSnapshotBuilder = SimulationSnapshotBuilder = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SimulationSnapshotBuilder);
//# sourceMappingURL=simulation-snapshot.builder.js.map