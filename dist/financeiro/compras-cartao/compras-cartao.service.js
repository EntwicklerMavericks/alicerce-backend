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
var ComprasCartaoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComprasCartaoService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const billing_cycle_service_1 = require("../faturas/domain/services/billing-cycle.service");
const money_vo_1 = require("../domain/value-objects/money.vo");
const client_1 = require("@prisma/client");
let ComprasCartaoService = ComprasCartaoService_1 = class ComprasCartaoService {
    prisma;
    logger = new common_1.Logger(ComprasCartaoService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async registrarCompra(dto) {
        const cartao = await this.prisma.cartaoCredito.findUnique({
            where: { id: dto.cartaoId },
        });
        if (!cartao) {
            throw new common_1.NotFoundException(`Cartão de Crédito ${dto.cartaoId} não encontrado.`);
        }
        const dataCompra = new Date(dto.dataCompra);
        const moneyTotal = money_vo_1.Money.deReais(dto.valorTotal);
        const qtdParcelas = dto.qtdParcelas || 1;
        const totalCentavos = Math.round(dto.valorTotal * 100);
        const centavosPorParcelaBase = Math.floor(totalCentavos / qtdParcelas);
        const restoCentavos = totalCentavos % qtdParcelas;
        const valoresParcelasCentavos = [];
        for (let i = 0; i < qtdParcelas; i++) {
            const incremento = i === qtdParcelas - 1 ? restoCentavos : 0;
            valoresParcelasCentavos.push(centavosPorParcelaBase + incremento);
        }
        const primeiraCompetencia = billing_cycle_service_1.BillingCycleService.calcularCompetenciaFatura(dataCompra, cartao.diaFechamento);
        return await this.prisma.$transaction(async (tx) => {
            const compra = await tx.compraCartao.create({
                data: {
                    cartaoId: cartao.id,
                    categoriaId: dto.categoriaId,
                    descricao: dto.descricao,
                    valorTotal: new client_1.Prisma.Decimal(moneyTotal.paraReais()),
                    qtdParcelas,
                    dataCompra,
                    observacoes: dto.observacoes,
                },
            });
            const parcelasCriadas = [];
            for (let i = 0; i < qtdParcelas; i++) {
                const competenciaParcela = primeiraCompetencia.adicionarMeses(i);
                const valorParcelaMoney = money_vo_1.Money.deCentavos(BigInt(valoresParcelasCentavos[i]));
                let fatura = await tx.faturaCartao.findUnique({
                    where: {
                        cartaoId_mes_ano: {
                            cartaoId: cartao.id,
                            mes: competenciaParcela.mes,
                            ano: competenciaParcela.ano,
                        },
                    },
                });
                if (!fatura) {
                    const dataVencimento = billing_cycle_service_1.BillingCycleService.calcularDataVencimento(competenciaParcela, cartao.diaVencimento);
                    fatura = await tx.faturaCartao.create({
                        data: {
                            cartaoId: cartao.id,
                            mes: competenciaParcela.mes,
                            ano: competenciaParcela.ano,
                            dataVencimento,
                            status: 'ABERTA',
                        },
                    });
                }
                if (fatura.status === 'FECHADA' || fatura.status === 'PAGA') {
                    throw new common_1.ConflictException(`A fatura da competência ${competenciaParcela.formatarISO()} já se encontra ${fatura.status}. Novas compras não podem ser incluídas nesta fatura.`);
                }
                const parcela = await tx.parcelaCartao.create({
                    data: {
                        compraId: compra.id,
                        faturaId: fatura.id,
                        numero: i + 1,
                        valor: new client_1.Prisma.Decimal(valorParcelaMoney.paraReais()),
                        competenciaAno: competenciaParcela.ano,
                        competenciaMes: competenciaParcela.mes,
                        status: 'PENDENTE',
                    },
                });
                parcelasCriadas.push(parcela);
            }
            this.logger.log(`Compra de R$ ${moneyTotal.paraReais()} em ${qtdParcelas}x registrada no cartão ${cartao.nome}. Zero efeito no Financial Ledger.`);
            return {
                compra,
                qtdParcelasCriadas: parcelasCriadas.length,
                primeiraCompetencia: primeiraCompetencia.formatarISO(),
            };
        });
    }
};
exports.ComprasCartaoService = ComprasCartaoService;
exports.ComprasCartaoService = ComprasCartaoService = ComprasCartaoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ComprasCartaoService);
//# sourceMappingURL=compras-cartao.service.js.map