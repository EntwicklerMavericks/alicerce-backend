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
var FaturasService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FaturasService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const ledger_service_1 = require("../ledger/ledger.service");
const ledger_entry_1 = require("../ledger/entities/ledger-entry");
const money_vo_1 = require("../domain/value-objects/money.vo");
const invoice_aggregate_1 = require("./domain/entities/invoice.aggregate");
const year_month_vo_1 = require("../domain/value-objects/year-month.vo");
const client_1 = require("@prisma/client");
let FaturasService = FaturasService_1 = class FaturasService {
    prisma;
    ledgerService;
    logger = new common_1.Logger(FaturasService_1.name);
    constructor(prisma, ledgerService) {
        this.prisma = prisma;
        this.ledgerService = ledgerService;
    }
    async obterFaturasDoCartao(cartaoId) {
        const faturas = await this.prisma.faturaCartao.findMany({
            where: { cartaoId },
            include: {
                parcelas: {
                    include: {
                        compra: true,
                    },
                },
            },
            orderBy: [{ ano: 'desc' }, { mes: 'desc' }],
        });
        return faturas.map((f) => {
            const valorTotal = f.parcelas
                .filter((p) => p.status === 'FATURADA' || p.status === 'PENDENTE')
                .reduce((acc, p) => acc + Number(p.valor), 0);
            return {
                ...f,
                valorTotal,
            };
        });
    }
    async obterFaturaPorId(faturaId) {
        const fatura = await this.prisma.faturaCartao.findUnique({
            where: { id: faturaId },
            include: {
                cartao: true,
                parcelas: {
                    include: {
                        compra: true,
                    },
                },
            },
        });
        if (!fatura) {
            throw new common_1.NotFoundException(`Fatura com ID ${faturaId} não encontrada.`);
        }
        const valorTotal = fatura.parcelas
            .filter((p) => p.status === 'FATURADA' || p.status === 'PENDENTE')
            .reduce((acc, p) => acc + Number(p.valor), 0);
        return {
            ...fatura,
            valorTotal,
        };
    }
    async pagarFatura(faturaId, dto, criadoPorId) {
        const faturaDb = await this.prisma.faturaCartao.findUnique({
            where: { id: faturaId },
            include: {
                cartao: true,
                parcelas: true,
            },
        });
        if (!faturaDb) {
            throw new common_1.NotFoundException(`Fatura ${faturaId} não encontrada.`);
        }
        if (faturaDb.status === 'PAGA') {
            throw new common_1.ConflictException('Esta fatura já se encontra PAGA.');
        }
        const parcelasDomain = faturaDb.parcelas.map((p) => ({
            id: p.id,
            compraId: p.compraId,
            numero: p.numero,
            valor: money_vo_1.Money.deReais(Number(p.valor)),
            competencia: year_month_vo_1.YearMonth.deAnoMes(p.competenciaAno, p.competenciaMes),
            status: p.status,
        }));
        const fatura = new invoice_aggregate_1.InvoiceAggregate(faturaDb.id, faturaDb.cartaoId, year_month_vo_1.YearMonth.deAnoMes(faturaDb.mes, faturaDb.ano), faturaDb.dataVencimento, faturaDb.status, parcelasDomain);
        const dataPagamento = dto.dataPagamento ? new Date(dto.dataPagamento) : new Date();
        fatura.pagar(dto.carteiraId, dataPagamento);
        const totalMoney = fatura.valorTotal;
        if (totalMoney.isZero()) {
            throw new common_1.ConflictException('Não é possível pagar uma fatura com valor zerado.');
        }
        return await this.prisma.$transaction(async (tx) => {
            const updateResult = await tx.faturaCartao.updateMany({
                where: {
                    id: faturaId,
                    status: { in: ['ABERTA', 'FECHADA'] },
                },
                data: {
                    status: 'PAGA',
                    carteiraId: dto.carteiraId,
                    dataPagamento,
                    valorPago: new client_1.Prisma.Decimal(totalMoney.paraReais()),
                },
            });
            if (updateResult.count === 0) {
                throw new common_1.ConflictException('Concorrência detectada: a fatura já foi quitada por outra sessão.');
            }
            await tx.parcelaCartao.updateMany({
                where: { faturaId },
                data: { status: 'PAGA' },
            });
            const ledgerEntry = ledger_entry_1.LedgerEntry.criar({
                workspaceId: faturaDb.cartao.workspaceId,
                carteiraId: dto.carteiraId,
                tipo: 'SAIDA',
                valor: totalMoney,
                data: dataPagamento,
                observacao: `Pagamento Fatura Cartão ${faturaDb.cartao.nome} (${fatura.competencia.formatarExibicao()})`,
                referenciaId: faturaId,
                referenciaTipo: 'DESPESA',
                origem: 'SISTEMA',
                criadoPorId,
            });
            await this.ledgerService.registrar(tx, ledgerEntry);
            this.logger.log(`Fatura ${faturaId} quitada com sucesso via carteira ${dto.carteiraId}. Ledger registrado.`);
            return {
                id: faturaId,
                status: 'PAGA',
                valorPago: totalMoney.paraReais(),
                dataPagamento,
            };
        });
    }
};
exports.FaturasService = FaturasService;
exports.FaturasService = FaturasService = FaturasService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ledger_service_1.LedgerService])
], FaturasService);
//# sourceMappingURL=faturas.service.js.map