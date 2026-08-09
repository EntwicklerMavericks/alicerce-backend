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
exports.PlanningOverviewReadModelService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const timeline_forecast_read_model_service_1 = require("./timeline-forecast-read-model.service");
const projetos_read_model_service_1 = require("../../../projetos/read-models/projetos-read-model.service");
function arredondar(valor) {
    if (isNaN(valor) || !isFinite(valor))
        return 0;
    return Math.round(valor * 100) / 100;
}
let PlanningOverviewReadModelService = class PlanningOverviewReadModelService {
    prisma;
    timelineForecastReadModelService;
    projetosReadModelService;
    constructor(prisma, timelineForecastReadModelService, projetosReadModelService) {
        this.prisma = prisma;
        this.timelineForecastReadModelService = timelineForecastReadModelService;
        this.projetosReadModelService = projetosReadModelService;
    }
    async obterVisaoUnificada(workspaceId, referenceDateInput) {
        const referenceDate = referenceDateInput
            ? new Date(referenceDateInput)
            : new Date();
        const fim30Dias = new Date(referenceDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        const [resumoForecast, projetosConsolidados, calendarioVencimentos, metasDestaque, orcamentosAlerta,] = await Promise.all([
            this.timelineForecastReadModelService.gerarProjecao(workspaceId, referenceDate),
            this.projetosReadModelService.listarProjetosConsolidados(workspaceId, referenceDate),
            this.buscarCalendarioVencimentos(workspaceId, referenceDate, fim30Dias),
            this.buscarMetasDestaque(workspaceId),
            this.buscarOrcamentosAlerta(workspaceId, referenceDate),
        ]);
        return {
            referenceDate,
            periodo: {
                inicio: referenceDate,
                fim: fim30Dias,
            },
            resumoForecast,
            calendarioVencimentos,
            projetosGargalo: projetosConsolidados,
            metasDestaque,
            orcamentosAlerta,
        };
    }
    async obterOverview(workspaceId, referenceDateInput) {
        return this.obterVisaoUnificada(workspaceId, referenceDateInput);
    }
    async buscarCalendarioVencimentos(workspaceId, referenceDate, fim30Dias) {
        const [despesas, receitas, parcelasCartao, regrasRecorrencia] = await Promise.all([
            this.prisma.despesa.findMany({
                where: {
                    workspaceId,
                    statusDocumento: 'ATIVO',
                    statusLiquidacao: 'PENDENTE',
                    dataExclusao: null,
                    dataVencimento: {
                        gt: referenceDate,
                        lte: fim30Dias,
                    },
                },
                include: { categoria: true },
            }),
            this.prisma.receita.findMany({
                where: {
                    workspaceId,
                    statusDocumento: 'ATIVO',
                    statusLiquidacao: 'PENDENTE',
                    data: {
                        gt: referenceDate,
                        lte: fim30Dias,
                    },
                },
                include: { categoria: true },
            }),
            this.prisma.parcelaCartao.findMany({
                where: {
                    status: { not: 'CANCELADA' },
                    compra: {
                        cartao: { workspaceId, ativo: true },
                    },
                },
                include: {
                    compra: {
                        include: { categoria: true, cartao: true },
                    },
                },
            }),
            this.prisma.regraRecorrencia.findMany({
                where: {
                    workspaceId,
                    status: 'ATIVA',
                },
                include: { categoria: true },
            }),
        ]);
        const itens = [];
        for (const d of despesas) {
            const dataVenc = new Date(d.dataVencimento);
            itens.push({
                id: d.id,
                descricao: d.descricao,
                valor: arredondar(Number(d.valor)),
                data: dataVenc,
                tipo: 'DESPESA',
                origem: d.recorrente ? 'RECORRENCIA' : 'DESPESA',
                status: this.determinarStatusCalendario(dataVenc, referenceDate, d.recorrente, d.recorrente ? 'RECORRENCIA' : 'DESPESA'),
                categoriaId: d.categoriaId,
                categoriaNome: d.categoria?.nome,
            });
        }
        for (const r of receitas) {
            const dataRec = new Date(r.data);
            itens.push({
                id: r.id,
                descricao: r.descricao,
                valor: arredondar(Number(r.valor)),
                data: dataRec,
                tipo: 'RECEITA',
                origem: r.recorrente ? 'RECORRENCIA' : 'RECEITA',
                status: this.determinarStatusCalendario(dataRec, referenceDate, r.recorrente, r.recorrente ? 'RECORRENCIA' : 'RECEITA'),
                categoriaId: r.categoriaId,
                categoriaNome: r.categoria?.nome,
            });
        }
        for (const p of parcelasCartao) {
            const diaVenc = Math.min(Math.max(1, p.compra.cartao.diaVencimento || 10), 28);
            const dataVenc = new Date(p.competenciaAno, p.competenciaMes - 1, diaVenc);
            if (dataVenc > referenceDate && dataVenc <= fim30Dias) {
                itens.push({
                    id: p.id,
                    descricao: `${p.compra.descricao} (${p.numero}/${p.compra.qtdParcelas || 1})`,
                    valor: arredondar(Number(p.valor)),
                    data: dataVenc,
                    tipo: 'DESPESA',
                    origem: 'CARTAO',
                    status: this.determinarStatusCalendario(dataVenc, referenceDate, false, 'CARTAO'),
                    categoriaId: p.compra.categoriaId,
                    categoriaNome: p.compra.categoria?.nome,
                });
            }
        }
        const mesesParaVerificar = [];
        let curr = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
        const end = new Date(fim30Dias.getFullYear(), fim30Dias.getMonth(), 1);
        while (curr <= end) {
            mesesParaVerificar.push({
                ano: curr.getFullYear(),
                mes: curr.getMonth() + 1,
            });
            curr.setMonth(curr.getMonth() + 1);
        }
        for (const r of regrasRecorrencia) {
            for (const m of mesesParaVerificar) {
                const diaVenc = Math.min(Math.max(1, r.diaVencimento || 1), 28);
                const dataVenc = new Date(m.ano, m.mes - 1, diaVenc);
                const inicioOk = r.dataInicio
                    ? new Date(r.dataInicio) <= dataVenc
                    : true;
                const fimOk = r.dataFim ? new Date(r.dataFim) >= dataVenc : true;
                if (inicioOk && fimOk && dataVenc > referenceDate && dataVenc <= fim30Dias) {
                    const jaExiste = itens.some((i) => i.descricao === r.descricao && i.data.getTime() === dataVenc.getTime());
                    if (!jaExiste) {
                        itens.push({
                            id: `reg-${r.id}-${m.ano}-${m.mes}`,
                            descricao: r.descricao,
                            valor: arredondar(Number(r.valor)),
                            data: dataVenc,
                            tipo: r.tipo === 'RECEITA' ? 'RECEITA' : 'DESPESA',
                            origem: 'RECORRENCIA',
                            status: this.determinarStatusCalendario(dataVenc, referenceDate, true, 'RECORRENCIA'),
                            categoriaId: r.categoriaId,
                            categoriaNome: r.categoria?.nome,
                        });
                    }
                }
            }
        }
        itens.sort((a, b) => {
            const timeDiff = a.data.getTime() - b.data.getTime();
            if (timeDiff !== 0)
                return timeDiff;
            return a.id.localeCompare(b.id);
        });
        return itens;
    }
    determinarStatusCalendario(dataItem, referenceDate, recorrente, origem) {
        if (dataItem < referenceDate) {
            return 'VENCIDO';
        }
        if (recorrente || origem === 'RECORRENCIA' || origem === 'CARTAO') {
            return 'PROGRAMADO';
        }
        return 'PENDENTE';
    }
    async buscarMetasDestaque(workspaceId) {
        const metas = await this.prisma.meta.findMany({
            where: {
                workspaceId,
                dataExclusao: null,
            },
            include: {
                aportes: true,
            },
        });
        const metasMapeadas = metas.map((meta) => {
            const valorAlvo = arredondar(Number(meta.valorAlvo));
            const valorAcumulado = arredondar((meta.aportes || []).reduce((sum, a) => sum + Number(a.valor), 0));
            const distancia = Math.max(0, arredondar(valorAlvo - valorAcumulado));
            const progressoRaw = valorAlvo > 0 ? (valorAcumulado / valorAlvo) * 100 : 0;
            const progressoPercentual = Math.min(100, arredondar(progressoRaw));
            return {
                id: meta.id,
                nome: meta.nome,
                descricao: meta.descricao,
                valorAlvo,
                valorAcumulado,
                distancia,
                progressoPercentual,
                status: meta.status,
                prioridade: meta.prioridade,
                prazo: meta.prazo,
                icone: meta.icone,
                cor: meta.cor,
                dataCriacao: meta.dataCriacao,
            };
        });
        metasMapeadas.sort((a, b) => {
            if (a.distancia !== b.distancia) {
                return a.distancia - b.distancia;
            }
            if (a.progressoPercentual !== b.progressoPercentual) {
                return b.progressoPercentual - a.progressoPercentual;
            }
            const timeA = new Date(a.dataCriacao).getTime();
            const timeB = new Date(b.dataCriacao).getTime();
            if (timeA !== timeB) {
                return timeA - timeB;
            }
            return a.id.localeCompare(b.id);
        });
        return metasMapeadas;
    }
    async buscarOrcamentosAlerta(workspaceId, referenceDate) {
        const ano = referenceDate.getFullYear();
        const mes = referenceDate.getMonth() + 1;
        const dataInicio = new Date(ano, mes - 1, 1);
        const dataFim = new Date(ano, mes, 0, 23, 59, 59, 999);
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
                tipo: { in: ['DESPESA', 'ESTORNO'] },
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
            if (mov.tipo === 'DESPESA') {
                consumoLedgerPorCategoria.set(categoriaId, atual + valor);
            }
            else if (mov.tipo === 'ESTORNO') {
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
        const resultado = orcamentos.map((orc) => {
            const limite = arredondar(Number(orc.valorPlanejado || 0));
            const consumoLedger = consumoLedgerPorCategoria.get(orc.categoriaId) || 0;
            const consumoCartao = consumoCartaoPorCategoria.get(orc.categoriaId) || 0;
            const valorConsumido = arredondar(Math.max(0, consumoLedger + consumoCartao));
            let percentualConsumido = 0;
            let estado = 'NORMAL';
            if (limite === 0) {
                if (valorConsumido > 0) {
                    percentualConsumido = 100;
                    estado = 'EXCEDIDO';
                }
                else {
                    percentualConsumido = 0;
                    estado = 'NORMAL';
                }
            }
            else {
                percentualConsumido = arredondar((valorConsumido / limite) * 100);
                if (percentualConsumido >= 100) {
                    estado = 'EXCEDIDO';
                }
                else if (percentualConsumido >= 90) {
                    estado = 'ATENCAO';
                }
                else if (percentualConsumido >= 70) {
                    estado = 'ALERTA';
                }
                else {
                    estado = 'NORMAL';
                }
            }
            return {
                id: orc.id,
                categoriaId: orc.categoriaId,
                categoriaNome: orc.categoria.nome,
                categoriaIcone: orc.categoria.icone,
                categoriaCor: orc.categoria.cor,
                mes: orc.mes,
                ano: orc.ano,
                limite,
                valorConsumido,
                valorDisponivel: arredondar(limite - valorConsumido),
                percentualConsumido,
                estado,
            };
        });
        resultado.sort((a, b) => {
            if (b.percentualConsumido !== a.percentualConsumido) {
                return b.percentualConsumido - a.percentualConsumido;
            }
            return a.id.localeCompare(b.id);
        });
        return resultado;
    }
};
exports.PlanningOverviewReadModelService = PlanningOverviewReadModelService;
exports.PlanningOverviewReadModelService = PlanningOverviewReadModelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        timeline_forecast_read_model_service_1.TimelineForecastReadModelService,
        projetos_read_model_service_1.ProjetosReadModelService])
], PlanningOverviewReadModelService);
//# sourceMappingURL=planning-overview-read-model.service.js.map