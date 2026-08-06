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
exports.CarteirasService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let CarteirasService = class CarteirasService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async criar(workspaceId, usuarioId, dto) {
        return this.prisma.$transaction(async (tx) => {
            if (dto.padrao) {
                await tx.carteira.updateMany({
                    where: { workspaceId, padrao: true },
                    data: { padrao: false },
                });
            }
            const carteira = await tx.carteira.create({
                data: {
                    workspaceId,
                    pessoaId: dto.pessoaId || null,
                    nome: dto.nome.trim(),
                    tipo: dto.tipo,
                    permiteSaldoNegativo: dto.permiteSaldoNegativo ?? true,
                    cor: dto.cor || '#8A05BE',
                    icone: dto.icone || 'account_balance',
                    padrao: dto.padrao || false,
                    ativo: true,
                },
            });
            let saldoInicial = 0;
            if (dto.saldoInicial && dto.saldoInicial > 0) {
                saldoInicial = Number(dto.saldoInicial);
                await tx.movimentacaoFinanceira.create({
                    data: {
                        workspaceId,
                        carteiraId: carteira.id,
                        criadoPorId: usuarioId,
                        tipo: 'SALDO_INICIAL',
                        valor: new client_1.Prisma.Decimal(saldoInicial),
                        descricao: 'Saldo inicial de abertura de conta',
                        data: new Date(),
                    },
                });
            }
            return {
                ...carteira,
                saldoCalculado: saldoInicial,
            };
        });
    }
    async listarPorWorkspace(workspaceId) {
        const carteiras = await this.prisma.carteira.findMany({
            where: { workspaceId, ativo: true },
            include: {
                pessoa: { select: { id: true, nome: true } },
            },
            orderBy: [{ padrao: 'desc' }, { dataCriacao: 'asc' }],
        });
        const saldosProjetados = await this.calcularSaldosDoWorkspace(workspaceId);
        const carteirasComSaldo = carteiras.map((c) => {
            const saldo = saldosProjetados.get(c.id) || 0;
            return {
                ...c,
                saldoCalculado: saldo,
                saldoNegativoAlerta: saldo < 0,
            };
        });
        const saldoTotalConsolidado = carteirasComSaldo.reduce((acc, c) => acc + c.saldoCalculado, 0);
        return {
            carteiras: carteirasComSaldo,
            saldoTotalConsolidado,
        };
    }
    async obterPorId(workspaceId, id) {
        const carteira = await this.prisma.carteira.findFirst({
            where: { id, workspaceId, ativo: true },
            include: { pessoa: true },
        });
        if (!carteira) {
            throw new common_1.NotFoundException('Carteira não encontrada.');
        }
        const saldo = await this.calcularSaldoDeCarteira(id);
        return {
            ...carteira,
            saldoCalculado: saldo,
            saldoNegativoAlerta: saldo < 0,
        };
    }
    async obterExtrato(workspaceId, id) {
        const carteira = await this.obterPorId(workspaceId, id);
        const movimentacoes = await this.prisma.movimentacaoFinanceira.findMany({
            where: { carteiraId: id, workspaceId },
            orderBy: { data: 'desc' },
            take: 50,
        });
        return {
            carteira,
            movimentacoes: movimentacoes.map((m) => ({
                ...m,
                valor: Number(m.valor),
            })),
        };
    }
    async transferirFundos(workspaceId, usuarioId, dto) {
        if (dto.carteiraOrigemId === dto.carteiraDestinoId) {
            throw new common_1.BadRequestException('A conta de origem e destino devem ser diferentes.');
        }
        const valor = Number(dto.valor);
        if (valor <= 0) {
            throw new common_1.BadRequestException('O valor da transferência deve ser maior que zero.');
        }
        const origem = await this.obterPorId(workspaceId, dto.carteiraOrigemId);
        const destino = await this.obterPorId(workspaceId, dto.carteiraDestinoId);
        const saldoOrigemPosTransferencia = origem.saldoCalculado - valor;
        if (saldoOrigemPosTransferencia < 0 && !origem.permiteSaldoNegativo) {
            throw new common_1.BadRequestException(`Saldo insuficiente na conta "${origem.nome}". Esta conta não permite saldo negativo.`);
        }
        return this.prisma.$transaction(async (tx) => {
            const registroTransferencia = await tx.transferenciaCarteira.create({
                data: {
                    workspaceId,
                    carteiraOrigemId: origem.id,
                    carteiraDestinoId: destino.id,
                    valor: new client_1.Prisma.Decimal(valor),
                    descricao: dto.descricao || `Transferência para ${destino.nome}`,
                    data: new Date(),
                },
            });
            await tx.movimentacaoFinanceira.create({
                data: {
                    workspaceId,
                    carteiraId: origem.id,
                    criadoPorId: usuarioId,
                    tipo: 'TRANSFERENCIA_SAIDA',
                    valor: new client_1.Prisma.Decimal(-valor),
                    descricao: dto.descricao || `Transferência para ${destino.nome}`,
                    transferenciaId: registroTransferencia.id,
                    data: new Date(),
                },
            });
            await tx.movimentacaoFinanceira.create({
                data: {
                    workspaceId,
                    carteiraId: destino.id,
                    criadoPorId: usuarioId,
                    tipo: 'TRANSFERENCIA_ENTRADA',
                    valor: new client_1.Prisma.Decimal(valor),
                    descricao: dto.descricao || `Transferência de ${origem.nome}`,
                    transferenciaId: registroTransferencia.id,
                    data: new Date(),
                },
            });
            return {
                sucesso: true,
                transferencia: registroTransferencia,
                saldoOrigemAtual: saldoOrigemPosTransferencia,
                saldoDestinoAtual: destino.saldoCalculado + valor,
                saldoNegativoAviso: saldoOrigemPosTransferencia < 0,
            };
        });
    }
    async remover(workspaceId, id) {
        await this.obterPorId(workspaceId, id);
        await this.prisma.carteira.update({
            where: { id },
            data: { ativo: false },
        });
    }
    async calcularSaldoDeCarteira(carteiraId) {
        const agregacao = await this.prisma.movimentacaoFinanceira.aggregate({
            where: { carteiraId },
            _sum: { valor: true },
        });
        return Number(agregacao._sum.valor || 0);
    }
    async calcularSaldosDoWorkspace(workspaceId) {
        const agrupamento = await this.prisma.movimentacaoFinanceira.groupBy({
            by: ['carteiraId'],
            where: { workspaceId },
            _sum: { valor: true },
        });
        const mapa = new Map();
        agrupamento.forEach((g) => {
            mapa.set(g.carteiraId, Number(g._sum.valor || 0));
        });
        return mapa;
    }
};
exports.CarteirasService = CarteirasService;
exports.CarteirasService = CarteirasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CarteirasService);
//# sourceMappingURL=carteiras.service.js.map