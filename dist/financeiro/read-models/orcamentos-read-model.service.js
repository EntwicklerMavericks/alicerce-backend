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
exports.OrcamentosReadModelService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let OrcamentosReadModelService = class OrcamentosReadModelService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async obterOrcamentosComConsumo(workspaceId, ano, mes) {
        const dataInicio = new Date(ano, mes - 1, 1);
        const dataFim = new Date(ano, mes, 0, 23, 59, 59);
        const orcamentos = await this.prisma.orcamento.findMany({
            where: { workspaceId, mes, ano },
            include: { categoria: true },
        });
        if (orcamentos.length === 0) {
            return [];
        }
        const movimentacoesLedger = await this.prisma.movimentacaoFinanceira.findMany({
            where: {
                workspaceId,
                tipo: { in: [client_1.TipoMovimentacao.DESPESA, client_1.TipoMovimentacao.ESTORNO] },
                data: { gte: dataInicio, lte: dataFim },
            },
        });
        const despesaIds = movimentacoesLedger
            .filter((m) => m.referenciaId && m.referenciaTipo === 'DESPESA')
            .map((m) => m.referenciaId);
        const faturasPagamento = despesaIds.length > 0
            ? await this.prisma.faturaCartao.findMany({
                where: { id: { in: despesaIds } },
                select: { id: true },
            })
            : [];
        const faturaIdsSet = new Set(faturasPagamento.map((f) => f.id));
        const despesasReferenciadas = despesaIds.length > 0
            ? await this.prisma.despesa.findMany({
                where: { id: { in: despesaIds } },
                select: { id: true, categoriaId: true },
            })
            : [];
        const mapDespesaCategoria = new Map();
        for (const d of despesasReferenciadas) {
            mapDespesaCategoria.set(d.id, d.categoriaId);
        }
        const consumoLedgerPorCategoria = new Map();
        for (const mov of movimentacoesLedger) {
            if (!mov.referenciaId)
                continue;
            if (faturaIdsSet.has(mov.referenciaId))
                continue;
            const categoriaId = mapDespesaCategoria.get(mov.referenciaId);
            if (!categoriaId)
                continue;
            const valor = Number(mov.valor);
            const atual = consumoLedgerPorCategoria.get(categoriaId) || 0;
            if (mov.tipo === client_1.TipoMovimentacao.DESPESA) {
                consumoLedgerPorCategoria.set(categoriaId, atual + valor);
            }
            else if (mov.tipo === client_1.TipoMovimentacao.ESTORNO) {
                consumoLedgerPorCategoria.set(categoriaId, atual - valor);
            }
        }
        const parcelasCartao = await this.prisma.parcelaCartao.findMany({
            where: {
                competenciaAno: ano,
                competenciaMes: mes,
                status: { not: 'CANCELADA' },
                compra: {
                    cartao: { workspaceId },
                },
            },
            include: {
                compra: { select: { categoriaId: true } },
            },
        });
        const consumoCartaoPorCategoria = new Map();
        for (const p of parcelasCartao) {
            const catId = p.compra.categoriaId;
            const valor = Number(p.valor);
            const atual = consumoCartaoPorCategoria.get(catId) || 0;
            consumoCartaoPorCategoria.set(catId, atual + valor);
        }
        return orcamentos.map((orc) => {
            const consumoLedger = consumoLedgerPorCategoria.get(orc.categoriaId) || 0;
            const consumoCartao = consumoCartaoPorCategoria.get(orc.categoriaId) || 0;
            const valorConsumido = Math.max(0, consumoLedger + consumoCartao);
            const teto = Number(orc.valorPlanejado);
            const percentualConsumido = teto > 0 ? (valorConsumido / teto) * 100 : 0;
            const percentualFormatado = Number(percentualConsumido.toFixed(2));
            let estado = 'NORMAL';
            if (percentualFormatado >= 100) {
                estado = 'EXCEDIDO';
            }
            else if (percentualFormatado >= 90) {
                estado = 'ATENCAO';
            }
            else if (percentualFormatado >= 70) {
                estado = 'ALERTA';
            }
            return {
                id: orc.id,
                categoriaId: orc.categoriaId,
                categoriaNome: orc.categoria.nome,
                categoriaIcone: orc.categoria.icone,
                categoriaCor: orc.categoria.cor,
                mes: orc.mes,
                ano: orc.ano,
                teto,
                valorConsumido,
                valorDisponivel: teto - valorConsumido,
                percentualConsumido: percentualFormatado,
                estado,
            };
        });
    }
};
exports.OrcamentosReadModelService = OrcamentosReadModelService;
exports.OrcamentosReadModelService = OrcamentosReadModelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrcamentosReadModelService);
//# sourceMappingURL=orcamentos-read-model.service.js.map