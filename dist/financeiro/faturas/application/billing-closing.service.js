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
var BillingClosingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingClosingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const invoice_aggregate_1 = require("../domain/entities/invoice.aggregate");
const year_month_vo_1 = require("../../domain/value-objects/year-month.vo");
const money_vo_1 = require("../../domain/value-objects/money.vo");
let BillingClosingService = BillingClosingService_1 = class BillingClosingService {
    prisma;
    logger = new common_1.Logger(BillingClosingService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async processarFechamentos(dataAtual = new Date(), workspaceId) {
        const cartoes = await this.prisma.cartaoCredito.findMany({
            where: {
                ativo: true,
                ...(workspaceId ? { workspaceId } : {}),
            },
        });
        let totalFechadas = 0;
        for (const cartao of cartoes) {
            const diaFechamento = cartao.diaFechamento;
            const diaAtual = dataAtual.getDate();
            if (diaAtual >= diaFechamento) {
                const competenciaAtual = year_month_vo_1.YearMonth.daData(dataAtual);
                const faturaDb = await this.prisma.faturaCartao.findUnique({
                    where: {
                        cartaoId_mes_ano: {
                            cartaoId: cartao.id,
                            mes: competenciaAtual.mes,
                            ano: competenciaAtual.ano,
                        },
                    },
                    include: { parcelas: true },
                });
                if (faturaDb && faturaDb.status === 'ABERTA') {
                    const parcelasDomain = faturaDb.parcelas.map((p) => ({
                        id: p.id,
                        compraId: p.compraId,
                        numero: p.numero,
                        valor: money_vo_1.Money.deReais(Number(p.valor)),
                        competencia: year_month_vo_1.YearMonth.deAnoMes(p.competenciaAno, p.competenciaMes),
                        status: p.status,
                    }));
                    const fatura = new invoice_aggregate_1.InvoiceAggregate(faturaDb.id, faturaDb.cartaoId, competenciaAtual, faturaDb.dataVencimento, 'ABERTA', parcelasDomain, faturaDb.carteiraId ?? undefined, faturaDb.dataPagamento ?? undefined);
                    fatura.fechar();
                    await this.prisma.$transaction([
                        this.prisma.faturaCartao.update({
                            where: { id: fatura.id },
                            data: { status: 'FECHADA' },
                        }),
                        this.prisma.parcelaCartao.updateMany({
                            where: { faturaId: fatura.id, status: 'PENDENTE' },
                            data: { status: 'FATURADA' },
                        }),
                    ]);
                    totalFechadas++;
                    this.logger.log(`Fatura ${fatura.id} do cartão ${cartao.nome} fechada com sucesso para a competência ${competenciaAtual.formatarISO()}`);
                }
            }
        }
        return totalFechadas;
    }
};
exports.BillingClosingService = BillingClosingService;
exports.BillingClosingService = BillingClosingService = BillingClosingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BillingClosingService);
//# sourceMappingURL=billing-closing.service.js.map