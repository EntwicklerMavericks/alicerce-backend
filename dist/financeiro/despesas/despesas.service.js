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
exports.DespesasService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const ledger_service_1 = require("../ledger/ledger.service");
const money_vo_1 = require("../domain/value-objects/money.vo");
const ledger_entry_1 = require("../ledger/entities/ledger-entry");
const client_1 = require("@prisma/client");
let DespesasService = class DespesasService {
    prisma;
    ledgerService;
    constructor(prisma, ledgerService) {
        this.prisma = prisma;
        this.ledgerService = ledgerService;
    }
    async criar(workspaceId, usuarioId, dto) {
        const statusLiq = dto.statusLiquidacao || client_1.StatusLiquidacao.PENDENTE;
        if (statusLiq === client_1.StatusLiquidacao.LIQUIDADO && !dto.carteiraId) {
            throw new common_1.BadRequestException('Uma carteira é obrigatória para liquidar uma despesa.');
        }
        if (dto.categoriaId) {
            const categoria = await this.prisma.categoria.findFirst({
                where: {
                    id: dto.categoriaId,
                    OR: [{ workspaceId }, { sistema: true }],
                },
            });
            if (!categoria) {
                throw new common_1.NotFoundException('Categoria não encontrada ou inválida para este workspace.');
            }
        }
        if (dto.carteiraId) {
            const carteira = await this.prisma.carteira.findFirst({
                where: { id: dto.carteiraId, workspaceId, ativo: true },
            });
            if (!carteira) {
                throw new common_1.NotFoundException('Carteira não encontrada ou pertence a outro workspace.');
            }
        }
        if (dto.cartaoId) {
            const cartao = await this.prisma.cartaoCredito.findFirst({
                where: { id: dto.cartaoId, workspaceId, ativo: true },
            });
            if (!cartao) {
                throw new common_1.NotFoundException('Cartão de crédito não encontrado ou pertence a outro workspace.');
            }
        }
        if (dto.metaId) {
            const meta = await this.prisma.meta.findFirst({
                where: { id: dto.metaId, workspaceId, dataExclusao: null },
            });
            if (!meta) {
                throw new common_1.NotFoundException('Meta não encontrada ou pertence a outro workspace.');
            }
        }
        try {
            return await this.prisma.$transaction(async (tx) => {
                const despesa = await tx.despesa.create({
                    data: {
                        workspaceId,
                        descricao: dto.descricao,
                        valor: new client_1.Prisma.Decimal(dto.valor),
                        dataVencimento: new Date(dto.dataVencimento),
                        categoriaId: dto.categoriaId,
                        carteiraId: dto.carteiraId,
                        cartaoId: dto.cartaoId,
                        metaId: dto.metaId,
                        statusDocumento: client_1.StatusDocumento.ATIVO,
                        statusLiquidacao: statusLiq,
                        dataLiquidacao: statusLiq === client_1.StatusLiquidacao.LIQUIDADO ? new Date() : null,
                        dataPagamento: statusLiq === client_1.StatusLiquidacao.LIQUIDADO ? new Date() : null,
                        observacoes: dto.observacoes,
                        recorrente: dto.recorrente || false,
                        origemRecorrenciaId: dto.origemRecorrenciaId,
                    },
                });
                if (statusLiq === client_1.StatusLiquidacao.LIQUIDADO && dto.carteiraId) {
                    const entry = ledger_entry_1.LedgerEntry.criar({
                        workspaceId,
                        carteiraId: dto.carteiraId,
                        criadoPorId: usuarioId,
                        tipo: client_1.TipoMovimentacao.DESPESA,
                        valor: money_vo_1.Money.deReais(dto.valor),
                        data: new Date(dto.dataVencimento),
                        referenciaTipo: client_1.ReferenciaTipoMovimentacao.DESPESA,
                        referenciaId: despesa.id,
                        origem: client_1.OrigemMovimentacao.MANUAL,
                        observacao: `Despesa: ${dto.descricao}`,
                    });
                    await this.ledgerService.registrar(tx, entry);
                }
                return despesa;
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2003') {
                throw new common_1.BadRequestException('Violação de chave estrangeira: Categoria, carteira, cartão ou meta informada é inválida.');
            }
            throw error;
        }
    }
    async darBaixa(workspaceId, despesaId, usuarioId, carteiraIdParam) {
        return this.prisma.$transaction(async (tx) => {
            const despesaAtual = await tx.despesa.findFirst({
                where: { id: despesaId, workspaceId },
            });
            if (!despesaAtual) {
                throw new common_1.NotFoundException('Despesa não encontrada.');
            }
            const carteiraAlvoId = carteiraIdParam || despesaAtual.carteiraId;
            if (!carteiraAlvoId) {
                throw new common_1.BadRequestException('Informe a carteira pagadora para dar baixa.');
            }
            const resultado = await tx.despesa.updateMany({
                where: {
                    id: despesaId,
                    workspaceId,
                    statusLiquidacao: client_1.StatusLiquidacao.PENDENTE,
                    statusDocumento: client_1.StatusDocumento.ATIVO,
                },
                data: {
                    statusLiquidacao: client_1.StatusLiquidacao.LIQUIDADO,
                    dataLiquidacao: new Date(),
                    dataPagamento: new Date(),
                    carteiraId: carteiraAlvoId,
                },
            });
            if (resultado.count === 0) {
                throw new common_1.ConflictException('Esta despesa já foi liquidada ou cancelada por outra sessão.');
            }
            const entry = ledger_entry_1.LedgerEntry.criar({
                workspaceId,
                carteiraId: carteiraAlvoId,
                criadoPorId: usuarioId,
                tipo: client_1.TipoMovimentacao.DESPESA,
                valor: money_vo_1.Money.deReais(Number(despesaAtual.valor)),
                data: new Date(),
                referenciaTipo: client_1.ReferenciaTipoMovimentacao.DESPESA,
                referenciaId: despesaId,
                origem: client_1.OrigemMovimentacao.MANUAL,
                observacao: `Baixa da despesa: ${despesaAtual.descricao}`,
            });
            await this.ledgerService.registrar(tx, entry);
            return tx.despesa.findUnique({ where: { id: despesaId } });
        });
    }
    async estornar(workspaceId, despesaId, usuarioId, dto) {
        return this.prisma.$transaction(async (tx) => {
            const despesa = await tx.despesa.findFirst({
                where: { id: despesaId, workspaceId },
            });
            if (!despesa) {
                throw new common_1.NotFoundException('Despesa não encontrada.');
            }
            if (despesa.statusLiquidacao !== client_1.StatusLiquidacao.LIQUIDADO) {
                throw new common_1.BadRequestException('Apenas despesas liquidadas podem sofrer estorno.');
            }
            if (despesa.statusDocumento === client_1.StatusDocumento.CANCELADO) {
                throw new common_1.BadRequestException('Esta despesa já está cancelada.');
            }
            if (!despesa.carteiraId) {
                throw new common_1.BadRequestException('Despesa sem carteira associada para estorno.');
            }
            await tx.despesa.update({
                where: { id: despesaId },
                data: { statusDocumento: client_1.StatusDocumento.CANCELADO },
            });
            const entry = ledger_entry_1.LedgerEntry.criar({
                workspaceId,
                carteiraId: despesa.carteiraId,
                criadoPorId: usuarioId,
                tipo: client_1.TipoMovimentacao.ESTORNO,
                valor: money_vo_1.Money.deReais(Number(despesa.valor)),
                data: new Date(),
                referenciaTipo: client_1.ReferenciaTipoMovimentacao.ESTORNO,
                referenciaId: despesaId,
                origem: client_1.OrigemMovimentacao.MANUAL,
                observacao: `Estorno de despesa: ${despesa.descricao}. Motivo: ${dto.motivo}`,
            });
            await this.ledgerService.registrar(tx, entry);
            return tx.despesa.findUnique({ where: { id: despesaId } });
        });
    }
    async remover(workspaceId, despesaId) {
        const despesa = await this.prisma.despesa.findFirst({
            where: { id: despesaId, workspaceId },
        });
        if (!despesa) {
            throw new common_1.NotFoundException('Despesa não encontrada.');
        }
        if (despesa.statusLiquidacao === client_1.StatusLiquidacao.LIQUIDADO) {
            throw new common_1.BadRequestException('Não é possível excluir uma despesa liquidada. Utilize o estorno.');
        }
        return this.prisma.despesa.delete({ where: { id: despesaId } });
    }
    async listarPorWorkspace(workspaceId, mes, ano) {
        const dataFiltro = { workspaceId, statusDocumento: client_1.StatusDocumento.ATIVO, dataExclusao: null };
        if (mes && ano) {
            const dataInicio = new Date(ano, mes - 1, 1);
            const dataFim = new Date(ano, mes, 0, 23, 59, 59);
            dataFiltro.dataVencimento = { gte: dataInicio, lte: dataFim };
        }
        return this.prisma.despesa.findMany({
            where: dataFiltro,
            include: { carteira: true, categoria: true, cartao: true, meta: true },
            orderBy: { dataVencimento: 'desc' },
        });
    }
};
exports.DespesasService = DespesasService;
exports.DespesasService = DespesasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ledger_service_1.LedgerService])
], DespesasService);
//# sourceMappingURL=despesas.service.js.map