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
exports.RelatoriosReadModelService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const reconciliation_exception_1 = require("../exceptions/reconciliation.exception");
let RelatoriosReadModelService = class RelatoriosReadModelService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async obterRelatorio(workspaceId, dataInicioInput, dataFimInput, referenceDateInput) {
        const { dataInicio, dataFim } = this.calcularIntervaloDatas(dataInicioInput, dataFimInput, referenceDateInput);
        const [fluxoCaixa, categorias, cartoes, metasProjetos] = await Promise.all([
            this.calcularFluxoCaixa(workspaceId, dataInicio, dataFim),
            this.calcularCategorias(workspaceId, dataInicio, dataFim),
            this.calcularCartoes(workspaceId, dataInicio, dataFim),
            this.calcularMetasEProjetos(workspaceId),
        ]);
        return {
            periodo: { dataInicio, dataFim },
            fluxoCaixa,
            categorias,
            cartoes,
            metasProjetos,
        };
    }
    calcularIntervaloDatas(dataInicioInput, dataFimInput, referenceDateInput) {
        let referenceDate = referenceDateInput
            ? new Date(referenceDateInput)
            : new Date();
        if (isNaN(referenceDate.getTime())) {
            referenceDate = new Date();
        }
        let dataInicio;
        let dataFim;
        if (dataInicioInput && dataFimInput) {
            dataInicio = new Date(dataInicioInput);
            dataFim = new Date(dataFimInput);
        }
        else if (dataInicioInput) {
            dataInicio = new Date(dataInicioInput);
            dataFim = new Date(dataInicio);
            dataFim.setMonth(dataFim.getMonth() + 1);
        }
        else {
            const ano = referenceDate.getFullYear();
            const mes = referenceDate.getMonth();
            dataInicio = new Date(Date.UTC(ano, mes, 1));
            dataFim = new Date(Date.UTC(ano, mes + 1, 1));
        }
        if (isNaN(dataInicio.getTime())) {
            dataInicio = new Date(Date.UTC(referenceDate.getFullYear(), referenceDate.getMonth(), 1));
        }
        if (isNaN(dataFim.getTime())) {
            dataFim = new Date(Date.UTC(dataInicio.getFullYear(), dataInicio.getMonth() + 1, 1));
        }
        return { dataInicio, dataFim };
    }
    async calcularFluxoCaixa(workspaceId, dataInicio, dataFim) {
        const movimentacoesAnteriores = await this.prisma.movimentacaoFinanceira.findMany({
            where: {
                workspaceId,
                data: { lt: dataInicio },
            },
            select: { tipo: true, valor: true },
        });
        let saldoInicialDec = new client_1.Prisma.Decimal(0);
        for (const m of movimentacoesAnteriores) {
            const val = new client_1.Prisma.Decimal(m.valor || 0);
            if (m.tipo === client_1.TipoMovimentacao.RECEITA ||
                m.tipo === client_1.TipoMovimentacao.SALDO_INICIAL ||
                m.tipo === client_1.TipoMovimentacao.TRANSFERENCIA_ENTRADA ||
                m.tipo === client_1.TipoMovimentacao.RESGATE) {
                saldoInicialDec = saldoInicialDec.plus(val);
            }
            else if (m.tipo === client_1.TipoMovimentacao.DESPESA ||
                m.tipo === client_1.TipoMovimentacao.TRANSFERENCIA_SAIDA ||
                m.tipo === client_1.TipoMovimentacao.ESTORNO ||
                m.tipo === client_1.TipoMovimentacao.INVESTIMENTO) {
                saldoInicialDec = saldoInicialDec.minus(val);
            }
        }
        const movimentacoesPeriodo = await this.prisma.movimentacaoFinanceira.findMany({
            where: {
                workspaceId,
                data: {
                    gte: dataInicio,
                    lt: dataFim,
                },
            },
            select: { tipo: true, valor: true },
        });
        let entradasDec = new client_1.Prisma.Decimal(0);
        let saidasDec = new client_1.Prisma.Decimal(0);
        for (const m of movimentacoesPeriodo) {
            const val = new client_1.Prisma.Decimal(m.valor || 0);
            if (m.tipo === client_1.TipoMovimentacao.RECEITA ||
                m.tipo === client_1.TipoMovimentacao.SALDO_INICIAL ||
                m.tipo === client_1.TipoMovimentacao.TRANSFERENCIA_ENTRADA ||
                m.tipo === client_1.TipoMovimentacao.RESGATE) {
                entradasDec = entradasDec.plus(val);
            }
            else if (m.tipo === client_1.TipoMovimentacao.DESPESA ||
                m.tipo === client_1.TipoMovimentacao.TRANSFERENCIA_SAIDA ||
                m.tipo === client_1.TipoMovimentacao.ESTORNO ||
                m.tipo === client_1.TipoMovimentacao.INVESTIMENTO) {
                saidasDec = saidasDec.plus(val);
            }
        }
        const saldoFinalDec = saldoInicialDec.plus(entradasDec).minus(saidasDec);
        const reconciliado = saldoInicialDec.plus(entradasDec).minus(saidasDec);
        if (!reconciliado.equals(saldoFinalDec)) {
            throw new reconciliation_exception_1.ReconciliationException(`Divergência na reconciliação de saldo em Decimal: saldoInicial (${saldoInicialDec}) + entradas (${entradasDec}) - saidas (${saidasDec}) != saldoFinal (${saldoFinalDec})`);
        }
        const resultadoPeriodoDec = entradasDec.minus(saidasDec);
        return {
            saldoInicial: this.sanitizarNumero(saldoInicialDec.toNumber()),
            entradas: this.sanitizarNumero(entradasDec.toNumber()),
            saidas: this.sanitizarNumero(saidasDec.toNumber()),
            saldoFinal: this.sanitizarNumero(saldoFinalDec.toNumber()),
            resultadoPeriodo: this.sanitizarNumero(resultadoPeriodoDec.toNumber()),
        };
    }
    async calcularCategorias(workspaceId, dataInicio, dataFim) {
        const despesas = await this.prisma.despesa.findMany({
            where: {
                workspaceId,
                statusDocumento: 'ATIVO',
                dataExclusao: null,
                dataVencimento: {
                    gte: dataInicio,
                    lt: dataFim,
                },
            },
            include: {
                categoria: true,
            },
        });
        const mapaCategorias = new Map();
        let totalGeralDec = new client_1.Prisma.Decimal(0);
        for (const d of despesas) {
            const val = new client_1.Prisma.Decimal(d.valor || 0);
            totalGeralDec = totalGeralDec.plus(val);
            const catId = d.categoriaId || 'sem-categoria';
            const catNome = d.categoria?.nome || 'Outros';
            const catTipo = d.categoria?.tipo || 'DESPESA';
            if (!mapaCategorias.has(catId)) {
                mapaCategorias.set(catId, { nome: catNome, tipo: catTipo, valorDec: val });
            }
            else {
                const item = mapaCategorias.get(catId);
                item.valorDec = item.valorDec.plus(val);
            }
        }
        const totalGeral = totalGeralDec.toNumber();
        const resultado = [];
        for (const [categoriaId, item] of mapaCategorias.entries()) {
            const valor = item.valorDec.toNumber();
            const percentual = totalGeral > 0 ? (valor / totalGeral) * 100 : 0;
            resultado.push({
                categoriaId,
                nome: item.nome,
                tipo: item.tipo,
                valor: this.sanitizarNumero(valor),
                percentual: this.sanitizarNumero(percentual),
            });
        }
        return resultado.sort((a, b) => b.valor - a.valor);
    }
    async calcularCartoes(workspaceId, dataInicio, dataFim) {
        const cartoes = await this.prisma.cartaoCredito.findMany({
            where: { workspaceId, ativo: true },
        });
        const resultado = [];
        for (const cartao of cartoes) {
            const compras = await this.prisma.compraCartao.findMany({
                where: {
                    cartaoId: cartao.id,
                    dataCompra: {
                        gte: dataInicio,
                        lt: dataFim,
                    },
                },
                select: { valorTotal: true },
            });
            let valorTotalDec = new client_1.Prisma.Decimal(0);
            for (const c of compras) {
                valorTotalDec = valorTotalDec.plus(new client_1.Prisma.Decimal(c.valorTotal || 0));
            }
            resultado.push({
                cartaoId: cartao.id,
                nome: cartao.nome,
                bandeira: cartao.bandeira,
                valorTotal: this.sanitizarNumero(valorTotalDec.toNumber()),
                qtdTransacoes: compras.length,
            });
        }
        return resultado;
    }
    async calcularMetasEProjetos(workspaceId) {
        const [metas, projetos] = await Promise.all([
            this.prisma.meta.findMany({
                where: { workspaceId, dataExclusao: null },
                include: { aportes: true },
            }),
            this.prisma.projeto.findMany({
                where: { workspaceId, ativo: true },
                include: {
                    etapas: {
                        include: { itens: true },
                    },
                },
            }),
        ]);
        const resultado = [];
        for (const m of metas) {
            const valorAlvo = new client_1.Prisma.Decimal(m.valorAlvo || 0).toNumber();
            let valorAtualDec = new client_1.Prisma.Decimal(0);
            for (const ap of m.aportes) {
                valorAtualDec = valorAtualDec.plus(new client_1.Prisma.Decimal(ap.valor || 0));
            }
            const valorAtual = valorAtualDec.toNumber();
            const progresso = valorAlvo > 0 ? Math.min(100, (valorAtual / valorAlvo) * 100) : 0;
            resultado.push({
                id: m.id,
                tipo: 'META',
                nome: m.nome,
                progressoPercentual: this.sanitizarNumero(progresso),
                valorAlvoOuEstimado: this.sanitizarNumero(valorAlvo),
                valorAtualOuGasto: this.sanitizarNumero(valorAtual),
                status: m.status,
            });
        }
        for (const p of projetos) {
            const orcamentoEstimado = new client_1.Prisma.Decimal(p.orcamentoEstimado || 0).toNumber();
            let totalGasto = 0;
            const progresso = orcamentoEstimado > 0 ? Math.min(100, (totalGasto / orcamentoEstimado) * 100) : 0;
            resultado.push({
                id: p.id,
                tipo: 'PROJETO',
                nome: p.nome,
                progressoPercentual: this.sanitizarNumero(progresso),
                valorAlvoOuEstimado: this.sanitizarNumero(orcamentoEstimado),
                valorAtualOuGasto: this.sanitizarNumero(totalGasto),
                status: p.status,
            });
        }
        return resultado;
    }
    sanitizarNumero(valor) {
        if (valor === null || valor === undefined || isNaN(valor) || !isFinite(valor)) {
            return 0;
        }
        return Math.round(valor * 100) / 100;
    }
};
exports.RelatoriosReadModelService = RelatoriosReadModelService;
exports.RelatoriosReadModelService = RelatoriosReadModelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RelatoriosReadModelService);
//# sourceMappingURL=relatorios-read-model.service.js.map