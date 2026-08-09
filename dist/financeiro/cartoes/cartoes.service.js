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
exports.CartoesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let CartoesService = class CartoesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async criarCartao(workspaceId, dto) {
        return this.prisma.cartaoCredito.create({
            data: {
                workspaceId,
                nome: dto.nome,
                bandeira: dto.bandeira || 'MASTERCARD',
                ultimosDigitos: dto.ultimosDigitos,
                limiteTotal: new client_1.Prisma.Decimal(dto.limiteTotal),
                diaFechamento: dto.diaFechamento,
                diaVencimento: dto.diaVencimento,
                cor: dto.cor || '#820ad1',
                icone: dto.icone || 'credit_card',
            },
        });
    }
    async listarCartoes(workspaceId) {
        const cartoes = await this.prisma.cartaoCredito.findMany({
            where: { workspaceId, ativo: true },
            include: {
                faturas: {
                    include: {
                        parcelas: true,
                    },
                },
            },
        });
        return cartoes.map((cartao) => {
            let limiteComprometido = 0;
            for (const fatura of cartao.faturas) {
                for (const parcela of fatura.parcelas) {
                    if (parcela.status !== 'CANCELADA' && parcela.status !== 'PAGA') {
                        limiteComprometido += Number(parcela.valor);
                    }
                }
            }
            const limiteTotal = Number(cartao.limiteTotal);
            const limiteDisponivel = Math.max(0, limiteTotal - limiteComprometido);
            const { faturas, ...dadosCartao } = cartao;
            return {
                ...dadosCartao,
                limiteTotal,
                limiteComprometido,
                limiteDisponivel,
            };
        });
    }
    async obterPorId(id) {
        const cartao = await this.prisma.cartaoCredito.findUnique({
            where: { id },
            include: {
                faturas: {
                    include: {
                        parcelas: true,
                    },
                },
            },
        });
        if (!cartao) {
            throw new common_1.NotFoundException(`Cartão de Crédito ${id} não encontrado.`);
        }
        let limiteComprometido = 0;
        for (const fatura of cartao.faturas) {
            for (const parcela of fatura.parcelas) {
                if (parcela.status !== 'CANCELADA' && parcela.status !== 'PAGA') {
                    limiteComprometido += Number(parcela.valor);
                }
            }
        }
        const limiteTotal = Number(cartao.limiteTotal);
        const limiteDisponivel = Math.max(0, limiteTotal - limiteComprometido);
        return {
            ...cartao,
            limiteTotal,
            limiteComprometido,
            limiteDisponivel,
        };
    }
};
exports.CartoesService = CartoesService;
exports.CartoesService = CartoesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CartoesService);
//# sourceMappingURL=cartoes.service.js.map