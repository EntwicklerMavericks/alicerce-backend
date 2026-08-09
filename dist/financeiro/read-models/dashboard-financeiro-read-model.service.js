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
exports.DashboardFinanceiroReadModelService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const year_month_vo_1 = require("../domain/value-objects/year-month.vo");
let DashboardFinanceiroReadModelService = class DashboardFinanceiroReadModelService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async obterResumoDashboard(workspaceId, competenciaISO) {
        const ym = competenciaISO ? year_month_vo_1.YearMonth.deStringISO(competenciaISO) : year_month_vo_1.YearMonth.daData(new Date());
        const inicioMes = new Date(ym.ano, ym.mes - 1, 1);
        const fimMes = new Date(ym.ano, ym.mes, 0, 23, 59, 59, 999);
        const resultEntradas = await this.prisma.movimentacaoFinanceira.aggregate({
            where: { workspaceId, tipo: 'ENTRADA' },
            _sum: { valor: true },
        });
        const resultSaidas = await this.prisma.movimentacaoFinanceira.aggregate({
            where: { workspaceId, tipo: 'SAIDA' },
            _sum: { valor: true },
        });
        const totalEntradas = Number(resultEntradas?._sum?.valor || 0);
        const totalSaidas = Number(resultSaidas?._sum?.valor || 0);
        const saldoAtual = totalEntradas - totalSaidas;
        const resultReceitasPendentes = await this.prisma.receita.aggregate({
            where: { workspaceId, statusLiquidacao: 'PENDENTE', statusDocumento: 'ATIVO' },
            _sum: { valor: true },
        });
        const resultDespesasPendentes = await this.prisma.despesa.aggregate({
            where: { workspaceId, statusLiquidacao: 'PENDENTE', statusDocumento: 'ATIVO' },
            _sum: { valor: true },
        });
        const receitasPendentes = Number(resultReceitasPendentes._sum.valor || 0);
        const despesasPendentes = Number(resultDespesasPendentes._sum.valor || 0);
        const saldoProjetado = saldoAtual + receitasPendentes - despesasPendentes;
        const resultReceitasMês = await this.prisma.receita.aggregate({
            where: {
                workspaceId,
                statusLiquidacao: 'LIQUIDADO',
                statusDocumento: 'ATIVO',
                dataLiquidacao: { gte: inicioMes, lte: fimMes },
            },
            _sum: { valor: true },
        });
        const resultDespesasMês = await this.prisma.despesa.aggregate({
            where: {
                workspaceId,
                statusLiquidacao: 'LIQUIDADO',
                statusDocumento: 'ATIVO',
                dataLiquidacao: { gte: inicioMes, lte: fimMes },
            },
            _sum: { valor: true },
        });
        const receitasLiquidadasMes = Number(resultReceitasMês._sum.valor || 0);
        const despesasLiquidadasMes = Number(resultDespesasMês._sum.valor || 0);
        const fluxoDoPeriodo = receitasLiquidadasMes - despesasLiquidadasMes;
        const cartoesDb = await this.prisma.cartaoCredito.findMany({
            where: { workspaceId, ativo: true },
            include: {
                faturas: {
                    include: {
                        parcelas: true,
                    },
                },
            },
        });
        const cartoes = cartoesDb.map((c) => {
            let limiteComprometido = 0;
            for (const fatura of c.faturas) {
                for (const parcela of fatura.parcelas) {
                    if (parcela.status !== 'CANCELADA' && parcela.status !== 'PAGA') {
                        limiteComprometido += Number(parcela.valor);
                    }
                }
            }
            const limiteTotal = Number(c.limiteTotal);
            const limiteDisponivel = Math.max(0, limiteTotal - limiteComprometido);
            return {
                id: c.id,
                nome: c.nome,
                bandeira: c.bandeira,
                cor: c.cor,
                limiteTotal,
                limiteComprometido,
                limiteDisponivel,
            };
        });
        return {
            competencia: ym.formatarISO(),
            saldoAtual,
            saldoProjetado,
            fluxoDoPeriodo,
            receitasPendentes,
            despesasPendentes,
            receitasLiquidadasMes,
            despesasLiquidadasMes,
            cartoes,
        };
    }
};
exports.DashboardFinanceiroReadModelService = DashboardFinanceiroReadModelService;
exports.DashboardFinanceiroReadModelService = DashboardFinanceiroReadModelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardFinanceiroReadModelService);
//# sourceMappingURL=dashboard-financeiro-read-model.service.js.map