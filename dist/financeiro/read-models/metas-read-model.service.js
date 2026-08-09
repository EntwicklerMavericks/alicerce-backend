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
exports.MetasReadModelService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const meta_aggregate_1 = require("../domain/entities/meta.aggregate");
const money_vo_1 = require("../domain/value-objects/money.vo");
const year_month_vo_1 = require("../domain/value-objects/year-month.vo");
const calculadora_esforco_meta_service_1 = require("../domain/services/calculadora-esforco-meta.service");
let MetasReadModelService = class MetasReadModelService {
    prisma;
    calculadoraEsforco;
    constructor(prisma) {
        this.prisma = prisma;
        this.calculadoraEsforco = new calculadora_esforco_meta_service_1.CalculadoraEsforcoMetaService();
    }
    async listarMetasComCalculos(workspaceId) {
        const metasDb = await this.prisma.meta.findMany({
            where: {
                workspaceId,
                dataExclusao: null,
            },
            include: {
                aportes: {
                    orderBy: { data: 'desc' },
                },
            },
            orderBy: [{ prioridade: 'asc' }, { dataCriacao: 'desc' }],
        });
        const competenciaAtual = year_month_vo_1.YearMonth.daData(new Date());
        return metasDb.map((m) => this.mapearParaMetaComCalculos(m, competenciaAtual));
    }
    async obterMetaDetalhadaPorId(workspaceId, metaId) {
        const metaDb = await this.prisma.meta.findFirst({
            where: {
                id: metaId,
                workspaceId,
                dataExclusao: null,
            },
            include: {
                aportes: {
                    orderBy: { data: 'desc' },
                },
            },
        });
        if (!metaDb) {
            return null;
        }
        const competenciaAtual = year_month_vo_1.YearMonth.daData(new Date());
        const resumo = this.mapearParaMetaComCalculos(metaDb, competenciaAtual);
        return {
            ...resumo,
            historicoAportes: metaDb.aportes.map((a) => ({
                id: a.id,
                valor: Number(a.valor),
                data: a.data,
                descricao: a.descricao,
                tipo: a.tipo,
                dataCriacao: a.dataCriacao,
            })),
        };
    }
    mapearParaMetaComCalculos(metaDb, competenciaAtual) {
        const aportesDomain = metaDb.aportes.map((a) => ({
            id: a.id,
            metaId: a.metaId,
            valor: money_vo_1.Money.deReais(Number(a.valor)),
            data: a.data,
            descricao: a.descricao,
            dataCriacao: a.dataCriacao,
        }));
        const valorAlvoMoney = money_vo_1.Money.deReais(Number(metaDb.valorAlvo));
        const prazoYearMonth = metaDb.prazo ? year_month_vo_1.YearMonth.daData(metaDb.prazo) : undefined;
        const metaAggregate = new meta_aggregate_1.MetaAggregate(metaDb.id, metaDb.workspaceId, metaDb.nome, valorAlvoMoney, prazoYearMonth, metaDb.icone, metaDb.cor, metaDb.status, metaDb.descricao, metaDb.prioridade, aportesDomain);
        const valorAcumuladoMoney = metaAggregate.valorAcumulado;
        const valorAcumuladoNum = valorAcumuladoMoney.paraReais();
        const valorAlvoNum = valorAlvoMoney.paraReais();
        const progressoRaw = valorAlvoNum > 0 ? (valorAcumuladoNum / valorAlvoNum) * 100 : 0;
        const progressoPercentual = Number(Math.min(100, progressoRaw).toFixed(2));
        const esforco = this.calculadoraEsforco.calcularEsforcoMensal(valorAlvoMoney, valorAcumuladoMoney, prazoYearMonth, competenciaAtual);
        let ritmo = 'NO_RITMO';
        if (metaAggregate.status === 'CONCLUIDA' || progressoPercentual >= 100) {
            ritmo = 'CONCLUIDO';
        }
        else if (!esforco.noPrazo) {
            ritmo = 'ATRASADO';
        }
        else if (progressoPercentual >= 50 && esforco.mesesRestantes > 3) {
            ritmo = 'EXCELENTE';
        }
        return {
            id: metaDb.id,
            nome: metaDb.nome,
            descricao: metaDb.descricao,
            valorAlvo: valorAlvoNum,
            valorAcumulado: valorAcumuladoNum,
            progressoPercentual,
            status: metaAggregate.status,
            prazo: metaDb.prazo,
            prazoAnoMes: prazoYearMonth ? prazoYearMonth.formatarISO() : null,
            icone: metaDb.icone,
            cor: metaDb.cor,
            prioridade: metaDb.prioridade,
            esforcoMensal: {
                mesesRestantes: esforco.mesesRestantes,
                valorMensalNecessario: esforco.valorMensalNecessario.paraReais(),
                noPrazo: esforco.noPrazo,
            },
            ritmo,
            dataCriacao: metaDb.dataCriacao,
            dataAtualizacao: metaDb.dataAtualizacao,
        };
    }
};
exports.MetasReadModelService = MetasReadModelService;
exports.MetasReadModelService = MetasReadModelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MetasReadModelService);
//# sourceMappingURL=metas-read-model.service.js.map