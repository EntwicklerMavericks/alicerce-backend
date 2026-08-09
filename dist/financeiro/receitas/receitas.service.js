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
exports.ReceitasService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const ledger_service_1 = require("../ledger/ledger.service");
const money_vo_1 = require("../domain/value-objects/money.vo");
const ledger_entry_1 = require("../ledger/entities/ledger-entry");
const client_1 = require("@prisma/client");
let ReceitasService = class ReceitasService {
    prisma;
    ledgerService;
    constructor(prisma, ledgerService) {
        this.prisma = prisma;
        this.ledgerService = ledgerService;
    }
    async criar(workspaceId, usuarioId, dto) {
        const statusLiq = dto.statusLiquidacao || client_1.StatusLiquidacao.PENDENTE;
        if (statusLiq === client_1.StatusLiquidacao.LIQUIDADO && !dto.carteiraId) {
            throw new common_1.BadRequestException('Uma carteira é obrigatória para liquidar uma receita.');
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
        if (dto.pessoaId) {
            const pessoa = await this.prisma.pessoa.findFirst({
                where: { id: dto.pessoaId, workspaceId, ativo: true },
            });
            if (!pessoa) {
                throw new common_1.NotFoundException('Pessoa não encontrada ou pertence a outro workspace.');
            }
        }
        try {
            return await this.prisma.$transaction(async (tx) => {
                const receita = await tx.receita.create({
                    data: {
                        workspaceId,
                        descricao: dto.descricao,
                        valor: new client_1.Prisma.Decimal(dto.valor),
                        data: new Date(dto.data),
                        categoriaId: dto.categoriaId,
                        carteiraId: dto.carteiraId,
                        pessoaId: dto.pessoaId,
                        statusDocumento: client_1.StatusDocumento.ATIVO,
                        statusLiquidacao: statusLiq,
                        dataLiquidacao: statusLiq === client_1.StatusLiquidacao.LIQUIDADO ? new Date() : null,
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
                        tipo: client_1.TipoMovimentacao.RECEITA,
                        valor: money_vo_1.Money.deReais(dto.valor),
                        data: new Date(dto.data),
                        referenciaTipo: client_1.ReferenciaTipoMovimentacao.RECEITA,
                        referenciaId: receita.id,
                        origem: client_1.OrigemMovimentacao.MANUAL,
                        observacao: `Receita: ${dto.descricao}`,
                    });
                    await this.ledgerService.registrar(tx, entry);
                }
                return receita;
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2003') {
                throw new common_1.BadRequestException('Violação de chave estrangeira: Categoria, carteira ou pessoa informada é inválida.');
            }
            throw error;
        }
    }
    async darBaixa(workspaceId, receitaId, usuarioId, carteiraIdParam) {
        return this.prisma.$transaction(async (tx) => {
            const receitaAtual = await tx.receita.findFirst({
                where: { id: receitaId, workspaceId },
            });
            if (!receitaAtual) {
                throw new common_1.NotFoundException('Receita não encontrada.');
            }
            const carteiraAlvoId = carteiraIdParam || receitaAtual.carteiraId;
            if (!carteiraAlvoId) {
                throw new common_1.BadRequestException('Informe a carteira recebedora para dar baixa.');
            }
            const resultado = await tx.receita.updateMany({
                where: {
                    id: receitaId,
                    workspaceId,
                    statusLiquidacao: client_1.StatusLiquidacao.PENDENTE,
                    statusDocumento: client_1.StatusDocumento.ATIVO,
                },
                data: {
                    statusLiquidacao: client_1.StatusLiquidacao.LIQUIDADO,
                    dataLiquidacao: new Date(),
                    carteiraId: carteiraAlvoId,
                },
            });
            if (resultado.count === 0) {
                throw new common_1.ConflictException('Esta receita já foi liquidada ou cancelada por outra sessão.');
            }
            const entry = ledger_entry_1.LedgerEntry.criar({
                workspaceId,
                carteiraId: carteiraAlvoId,
                criadoPorId: usuarioId,
                tipo: client_1.TipoMovimentacao.RECEITA,
                valor: money_vo_1.Money.deReais(Number(receitaAtual.valor)),
                data: new Date(),
                referenciaTipo: client_1.ReferenciaTipoMovimentacao.RECEITA,
                referenciaId: receitaId,
                origem: client_1.OrigemMovimentacao.MANUAL,
                observacao: `Baixa da receita: ${receitaAtual.descricao}`,
            });
            await this.ledgerService.registrar(tx, entry);
            return tx.receita.findUnique({ where: { id: receitaId } });
        });
    }
    async estornar(workspaceId, receitaId, usuarioId, dto) {
        return this.prisma.$transaction(async (tx) => {
            const receita = await tx.receita.findFirst({
                where: { id: receitaId, workspaceId },
            });
            if (!receita) {
                throw new common_1.NotFoundException('Receita não encontrada.');
            }
            if (receita.statusLiquidacao !== client_1.StatusLiquidacao.LIQUIDADO) {
                throw new common_1.BadRequestException('Apenas receitas liquidadas podem sofrer estorno.');
            }
            if (receita.statusDocumento === client_1.StatusDocumento.CANCELADO) {
                throw new common_1.BadRequestException('Esta receita já está cancelada.');
            }
            if (!receita.carteiraId) {
                throw new common_1.BadRequestException('Receita sem carteira associada para estorno.');
            }
            await tx.receita.update({
                where: { id: receitaId },
                data: { statusDocumento: client_1.StatusDocumento.CANCELADO },
            });
            const entry = ledger_entry_1.LedgerEntry.criar({
                workspaceId,
                carteiraId: receita.carteiraId,
                criadoPorId: usuarioId,
                tipo: client_1.TipoMovimentacao.ESTORNO,
                valor: money_vo_1.Money.deReais(Number(receita.valor)),
                data: new Date(),
                referenciaTipo: client_1.ReferenciaTipoMovimentacao.ESTORNO,
                referenciaId: receitaId,
                origem: client_1.OrigemMovimentacao.MANUAL,
                observacao: `Estorno de receita: ${receita.descricao}. Motivo: ${dto.motivo}`,
            });
            await this.ledgerService.registrar(tx, entry);
            return tx.receita.findUnique({ where: { id: receitaId } });
        });
    }
    async remover(workspaceId, receitaId) {
        const receita = await this.prisma.receita.findFirst({
            where: { id: receitaId, workspaceId },
        });
        if (!receita) {
            throw new common_1.NotFoundException('Receita não encontrada.');
        }
        if (receita.statusLiquidacao === client_1.StatusLiquidacao.LIQUIDADO) {
            throw new common_1.BadRequestException('Não é possível excluir uma receita liquidada. Utilize o estorno.');
        }
        return this.prisma.receita.delete({ where: { id: receitaId } });
    }
    async listarPorWorkspace(workspaceId, mes, ano) {
        const dataFiltro = { workspaceId, statusDocumento: client_1.StatusDocumento.ATIVO };
        if (mes && ano) {
            const dataInicio = new Date(ano, mes - 1, 1);
            const dataFim = new Date(ano, mes, 0, 23, 59, 59);
            dataFiltro.data = { gte: dataInicio, lte: dataFim };
        }
        return this.prisma.receita.findMany({
            where: dataFiltro,
            include: { carteira: true, categoria: true, pessoa: true },
            orderBy: { data: 'desc' },
        });
    }
};
exports.ReceitasService = ReceitasService;
exports.ReceitasService = ReceitasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ledger_service_1.LedgerService])
], ReceitasService);
//# sourceMappingURL=receitas.service.js.map