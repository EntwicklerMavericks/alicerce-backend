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
exports.FluxoCaixaReadModelService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let FluxoCaixaReadModelService = class FluxoCaixaReadModelService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async obterResumoMensal(workspaceId, mes, ano) {
        const agora = new Date();
        const targetMes = mes || agora.getMonth() + 1;
        const targetAno = ano || agora.getFullYear();
        const dataInicio = new Date(targetAno, targetMes - 1, 1);
        const dataFim = new Date(targetAno, targetMes, 0, 23, 59, 59);
        const movimentacoesLedger = await this.prisma.movimentacaoFinanceira.findMany({
            where: { workspaceId },
            select: { tipo: true, valor: true },
        });
        let saldoAtualLedger = 0;
        for (const mov of movimentacoesLedger) {
            const val = Number(mov.valor);
            if (mov.tipo === client_1.TipoMovimentacao.RECEITA || mov.tipo === client_1.TipoMovimentacao.SALDO_INICIAL || mov.tipo === client_1.TipoMovimentacao.TRANSFERENCIA_ENTRADA) {
                saldoAtualLedger += val;
            }
            else if (mov.tipo === client_1.TipoMovimentacao.DESPESA || mov.tipo === client_1.TipoMovimentacao.TRANSFERENCIA_SAIDA) {
                saldoAtualLedger -= val;
            }
            else if (mov.tipo === client_1.TipoMovimentacao.ESTORNO) {
                saldoAtualLedger -= val;
            }
        }
        const receitasMes = await this.prisma.receita.findMany({
            where: {
                workspaceId,
                statusDocumento: client_1.StatusDocumento.ATIVO,
                data: { gte: dataInicio, lte: dataFim },
            },
        });
        let totalReceitasLiquidadas = 0;
        let totalReceitasPendentes = 0;
        for (const r of receitasMes) {
            const val = Number(r.valor);
            if (r.statusLiquidacao === client_1.StatusLiquidacao.LIQUIDADO) {
                totalReceitasLiquidadas += val;
            }
            else {
                totalReceitasPendentes += val;
            }
        }
        const despesasMes = await this.prisma.despesa.findMany({
            where: {
                workspaceId,
                statusDocumento: client_1.StatusDocumento.ATIVO,
                dataExclusao: null,
                dataVencimento: { gte: dataInicio, lte: dataFim },
            },
        });
        let totalDespesasLiquidadas = 0;
        let totalDespesasPendentes = 0;
        for (const d of despesasMes) {
            const val = Number(d.valor);
            if (d.statusLiquidacao === client_1.StatusLiquidacao.LIQUIDADO) {
                totalDespesasLiquidadas += val;
            }
            else {
                totalDespesasPendentes += val;
            }
        }
        const fluxoDoPeriodo = totalReceitasLiquidadas - totalDespesasLiquidadas;
        const saldoProjetado = saldoAtualLedger + totalReceitasPendentes - totalDespesasPendentes;
        return {
            mes: targetMes,
            ano: targetAno,
            saldoAtualLedger,
            totalReceitasLiquidadas,
            totalReceitasPendentes,
            totalDespesasLiquidadas,
            totalDespesasPendentes,
            saldoProjetado,
            fluxoDoPeriodo,
        };
    }
};
exports.FluxoCaixaReadModelService = FluxoCaixaReadModelService;
exports.FluxoCaixaReadModelService = FluxoCaixaReadModelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FluxoCaixaReadModelService);
//# sourceMappingURL=fluxo-caixa-read-model.service.js.map