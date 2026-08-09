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
exports.WishlistAnalyticsReadModelService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let WishlistAnalyticsReadModelService = class WishlistAnalyticsReadModelService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async obterAnalytics(workspaceId) {
        const itens = await this.prisma.itemWishlist.findMany({
            where: { workspaceId, ativo: true },
        });
        const desistidos = itens.filter((i) => i.status === 'DESISTIDO');
        const comprados = itens.filter((i) => i.status === 'COMPRADO');
        const emAnalise = itens.filter((i) => i.status === 'ANALISE');
        const economiaEvitadaAcumulada = desistidos.reduce((acc, item) => {
            const val = item.valorEconomizado ? Number(item.valorEconomizado) : 0;
            return acc + val;
        }, 0);
        const desistidosConscientes = desistidos.filter((i) => {
            if (!i.dataConclusao || !i.fimEsfriamento)
                return false;
            return i.dataConclusao.getTime() >= i.fimEsfriamento.getTime();
        }).length;
        const totalFinalizados = desistidos.length + comprados.length;
        const taxaConclusaoConsciente = totalFinalizados > 0 ? desistidosConscientes / totalFinalizados : 0;
        const compradosImpulsivos = comprados.filter((i) => i.quebrouEsfriamento === true).length;
        const taxaCompraImpulsiva = comprados.length > 0 ? compradosImpulsivos / comprados.length : 0;
        return {
            economiaEvitadaAcumulada: Number(economiaEvitadaAcumulada.toFixed(2)),
            taxaConclusaoConsciente: Number(taxaConclusaoConsciente.toFixed(4)),
            taxaCompraImpulsiva: Number(taxaCompraImpulsiva.toFixed(4)),
            totalItensDesistidos: desistidos.length,
            totalItensComprados: comprados.length,
            totalItensEmAnalise: emAnalise.length,
            totalDesistidosConscientes: desistidosConscientes,
            totalCompradosImpulsivos: compradosImpulsivos,
        };
    }
};
exports.WishlistAnalyticsReadModelService = WishlistAnalyticsReadModelService;
exports.WishlistAnalyticsReadModelService = WishlistAnalyticsReadModelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WishlistAnalyticsReadModelService);
//# sourceMappingURL=wishlist-analytics-read-model.service.js.map