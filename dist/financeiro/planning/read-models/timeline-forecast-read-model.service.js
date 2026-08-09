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
exports.TimelineForecastReadModelService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const year_month_vo_1 = require("../../domain/value-objects/year-month.vo");
const salary_calculators_1 = require("../../../pessoas/calculators/salary-calculators");
function arredondar(valor) {
    if (isNaN(valor) || !isFinite(valor))
        return 0;
    return Math.round(valor * 100) / 100;
}
let TimelineForecastReadModelService = class TimelineForecastReadModelService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async gerarProjecao(workspaceId, referenceDateInput, qtdMeses = 12) {
        const referenceDate = referenceDateInput
            ? new Date(referenceDateInput)
            : new Date();
        const startYM = year_month_vo_1.YearMonth.daData(referenceDate);
        const competenciasYM = Array.from({ length: qtdMeses }, (_, i) => startYM.adicionarMeses(i));
        const carteirasAtivas = await this.prisma.carteira.findMany({
            where: { workspaceId, ativo: true },
            select: { id: true },
        });
        const idsCarteirasAtivas = carteirasAtivas.map((c) => c.id);
        let saldoInicialLedger = 0;
        if (idsCarteirasAtivas.length > 0) {
            const ledgerSum = await this.prisma.movimentacaoFinanceira.aggregate({
                where: {
                    workspaceId,
                    carteiraId: { in: idsCarteirasAtivas },
                    data: { lte: referenceDate },
                },
                _sum: { valor: true },
            });
            saldoInicialLedger = arredondar(Number(ledgerSum._sum.valor || 0));
        }
        const [pessoas, regrasRecorrencia, receitasPendentes, despesasPendentes, parcelasCartao, orcamentos,] = await Promise.all([
            this.prisma.pessoa.findMany({
                where: { workspaceId, ativo: true },
                include: { configSalario: true, salariosMensais: true },
            }),
            this.prisma.regraRecorrencia.findMany({
                where: { workspaceId, status: 'ATIVA' },
                include: { categoria: true },
            }),
            this.prisma.receita.findMany({
                where: {
                    workspaceId,
                    statusDocumento: 'ATIVO',
                    statusLiquidacao: 'PENDENTE',
                },
                include: { categoria: true },
            }),
            this.prisma.despesa.findMany({
                where: {
                    workspaceId,
                    statusDocumento: 'ATIVO',
                    statusLiquidacao: 'PENDENTE',
                    dataExclusao: null,
                },
                include: { categoria: true, meta: true },
            }),
            this.prisma.parcelaCartao.findMany({
                where: {
                    status: { not: 'CANCELADA' },
                    compra: { cartao: { workspaceId, ativo: true } },
                },
                include: {
                    compra: { include: { categoria: true, cartao: true } },
                },
            }),
            this.prisma.orcamento.findMany({
                where: {
                    workspaceId,
                    OR: competenciasYM.map((ym) => ({ ano: ym.ano, mes: ym.mes })),
                },
                include: { categoria: true },
            }),
        ]);
        const resultadoCompetenciasTemp = [];
        for (const ym of competenciasYM) {
            const competenciaIso = ym.formatarISO();
            const ano = ym.ano;
            const mes = ym.mes;
            const eventosDoMes = [];
            for (const pessoa of pessoas) {
                const sm = pessoa.salariosMensais?.find((s) => s.ano === ano && s.mes === mes && s.status !== 'CANCELADA');
                if (sm) {
                    const valorSal = Number(sm.valorPrevisto || sm.valorReal || 0);
                    const dataRealizacao = new Date(ano, mes - 1, 5);
                    if (dataRealizacao > referenceDate && valorSal > 0) {
                        eventosDoMes.push({
                            id: `sal-sm-${sm.id}`,
                            descricao: `Salário - ${pessoa.nome}`,
                            valor: arredondar(valorSal),
                            tipo: 'INCOME',
                            fonte: 'SALARIO',
                            competencia: competenciaIso,
                            dataRealizacaoProjetada: dataRealizacao,
                        });
                    }
                }
                else if (pessoa.configSalario) {
                    const dias = pessoa.configSalario.diasTrabalho?.dias || 22;
                    const calc = salary_calculators_1.SalaryCalculatorFactory.obterCalculadora(pessoa.configSalario.tipo);
                    const valorSal = calc.calcularRendaMensal({
                        tipo: pessoa.configSalario.tipo,
                        valorBase: Number(pessoa.configSalario.valorBase || 0),
                        valorHora: Number(pessoa.configSalario.valorHora || 0),
                        horasDiarias: Number(pessoa.configSalario.horasDiarias || 8),
                        diasTrabalhoMes: dias,
                    });
                    const dataRealizacao = new Date(ano, mes - 1, 5);
                    if (dataRealizacao > referenceDate && valorSal > 0) {
                        eventosDoMes.push({
                            id: `sal-cfg-${pessoa.id}-${competenciaIso}`,
                            descricao: `Salário - ${pessoa.nome}`,
                            valor: arredondar(valorSal),
                            tipo: 'INCOME',
                            fonte: 'SALARIO',
                            competencia: competenciaIso,
                            dataRealizacaoProjetada: dataRealizacao,
                        });
                    }
                }
            }
            for (const regra of regrasRecorrencia) {
                const diaVenc = Math.min(Math.max(1, regra.diaVencimento || 1), 28);
                const dataVenc = new Date(ano, mes - 1, diaVenc);
                const dataInicioValida = regra.dataInicio
                    ? new Date(regra.dataInicio) <= dataVenc
                    : true;
                const dataFimValida = regra.dataFim
                    ? new Date(regra.dataFim) >= dataVenc
                    : true;
                if (dataInicioValida && dataFimValida && dataVenc > referenceDate) {
                    const valor = arredondar(Number(regra.valor));
                    if (regra.tipo === 'RECEITA') {
                        eventosDoMes.push({
                            id: `rec-reg-${regra.id}-${competenciaIso}`,
                            descricao: regra.descricao,
                            valor,
                            tipo: 'INCOME',
                            fonte: 'RECEITA_RECORRENTE',
                            categoriaId: regra.categoriaId,
                            categoriaNome: regra.categoria?.nome,
                            competencia: competenciaIso,
                            dataRealizacaoProjetada: dataVenc,
                        });
                    }
                    else if (regra.tipo === 'DESPESA') {
                        eventosDoMes.push({
                            id: `desp-reg-${regra.id}-${competenciaIso}`,
                            descricao: regra.descricao,
                            valor,
                            tipo: 'EXPENSE',
                            fonte: 'DESPESA_RECORRENTE',
                            categoriaId: regra.categoriaId,
                            categoriaNome: regra.categoria?.nome,
                            competencia: competenciaIso,
                            dataRealizacaoProjetada: dataVenc,
                        });
                    }
                }
            }
            for (const rec of receitasPendentes) {
                const recDate = new Date(rec.data);
                if (recDate.getFullYear() === ano &&
                    recDate.getMonth() + 1 === mes &&
                    recDate > referenceDate) {
                    const jaExisteRecorrencia = eventosDoMes.some((e) => e.fonte === 'RECEITA_RECORRENTE' && e.descricao === rec.descricao);
                    if (!jaExisteRecorrencia) {
                        eventosDoMes.push({
                            id: rec.id,
                            descricao: rec.descricao,
                            valor: arredondar(Number(rec.valor)),
                            tipo: 'INCOME',
                            fonte: rec.recorrente ? 'RECEITA_RECORRENTE' : 'RECEITA_PONTUAL',
                            categoriaId: rec.categoriaId,
                            categoriaNome: rec.categoria?.nome,
                            competencia: competenciaIso,
                            dataRealizacaoProjetada: recDate,
                        });
                    }
                }
            }
            for (const desp of despesasPendentes) {
                const despDate = new Date(desp.dataVencimento);
                if (despDate.getFullYear() === ano &&
                    despDate.getMonth() + 1 === mes &&
                    despDate > referenceDate) {
                    if (desp.cartaoId)
                        continue;
                    const valor = arredondar(Number(desp.valor));
                    if (desp.metaId) {
                        eventosDoMes.push({
                            id: desp.id,
                            descricao: desp.descricao,
                            valor,
                            tipo: 'ALOCACAO_PATRIMONIAL',
                            fonte: 'DESPESA_PONTUAL',
                            categoriaId: desp.categoriaId,
                            categoriaNome: desp.categoria?.nome,
                            competencia: competenciaIso,
                            dataRealizacaoProjetada: despDate,
                            metaId: desp.metaId,
                        });
                    }
                    else {
                        const jaExisteRecorrencia = eventosDoMes.some((e) => e.fonte === 'DESPESA_RECORRENTE' &&
                            e.descricao === desp.descricao);
                        if (!jaExisteRecorrencia) {
                            eventosDoMes.push({
                                id: desp.id,
                                descricao: desp.descricao,
                                valor,
                                tipo: 'EXPENSE',
                                fonte: desp.recorrente
                                    ? 'DESPESA_RECORRENTE'
                                    : 'DESPESA_PONTUAL',
                                categoriaId: desp.categoriaId,
                                categoriaNome: desp.categoria?.nome,
                                competencia: competenciaIso,
                                dataRealizacaoProjetada: despDate,
                            });
                        }
                    }
                }
            }
            for (const parc of parcelasCartao) {
                if (parc.competenciaAno === ano && parc.competenciaMes === mes) {
                    const diaVenc = Math.min(Math.max(1, parc.compra.cartao.diaVencimento || 10), 28);
                    const parcDate = new Date(ano, mes - 1, diaVenc);
                    if (parcDate > referenceDate) {
                        eventosDoMes.push({
                            id: parc.id,
                            descricao: `${parc.compra.descricao} (Parcela ${parc.numero})`,
                            valor: arredondar(Number(parc.valor)),
                            tipo: 'EXPENSE',
                            fonte: 'CARTAO_PARCELA',
                            categoriaId: parc.compra.categoriaId,
                            categoriaNome: parc.compra.categoria?.nome,
                            competencia: competenciaIso,
                            dataRealizacaoProjetada: parcDate,
                        });
                    }
                }
            }
            const orcamentosDoMes = orcamentos.filter((o) => o.ano === ano && o.mes === mes);
            for (const orc of orcamentosDoMes) {
                const catId = orc.categoriaId;
                const eventosConhecidos = eventosDoMes
                    .filter((e) => e.tipo === 'EXPENSE' &&
                    e.categoriaId === catId &&
                    ['CARTAO_PARCELA', 'DESPESA_RECORRENTE', 'DESPESA_PONTUAL'].includes(e.fonte))
                    .reduce((acc, e) => acc + e.valor, 0);
                const orcamentoTeto = Number(orc.valorPlanejado || 0);
                const fallbackValor = Math.max(0, orcamentoTeto - eventosConhecidos);
                if (fallbackValor > 0) {
                    const fallbackDate = new Date(ano, mes - 1, 28);
                    if (fallbackDate > referenceDate) {
                        eventosDoMes.push({
                            id: `fallback-${catId}-${competenciaIso}`,
                            descricao: `Orçamento Fallback - ${orc.categoria.nome}`,
                            valor: arredondar(fallbackValor),
                            tipo: 'EXPENSE',
                            fonte: 'ORCAMENTO_FALLBACK',
                            categoriaId: catId,
                            categoriaNome: orc.categoria.nome,
                            competencia: competenciaIso,
                            dataRealizacaoProjetada: fallbackDate,
                        });
                    }
                }
            }
            const totalReceitas = arredondar(eventosDoMes
                .filter((e) => e.tipo === 'INCOME')
                .reduce((acc, e) => acc + e.valor, 0));
            const totalDespesas = arredondar(eventosDoMes
                .filter((e) => e.tipo === 'EXPENSE')
                .reduce((acc, e) => acc + e.valor, 0));
            const alocacaoPatrimonial = arredondar(eventosDoMes
                .filter((e) => e.tipo === 'ALOCACAO_PATRIMONIAL')
                .reduce((acc, e) => acc + e.valor, 0));
            const fluxoLiquidoMensal = arredondar(totalReceitas - totalDespesas);
            resultadoCompetenciasTemp.push({
                ym,
                eventos: eventosDoMes,
                totalReceitas,
                totalDespesas,
                alocacaoPatrimonial,
                fluxoLiquidoMensal,
            });
        }
        const somaDespesas12Meses = resultadoCompetenciasTemp.reduce((acc, c) => acc + c.totalDespesas, 0);
        const despesaMediaMensal = arredondar(qtdMeses > 0 ? somaDespesas12Meses / qtdMeses : 0);
        const reservaSeguranca = arredondar(despesaMediaMensal * 1.0);
        let saldoAcumulado = saldoInicialLedger;
        const competenciasFinal = [];
        for (const c of resultadoCompetenciasTemp) {
            const saldoInicialPeriodo = arredondar(saldoAcumulado);
            const saldoProjetadoFinal = arredondar(saldoInicialPeriodo + c.fluxoLiquidoMensal);
            saldoAcumulado = saldoProjetadoFinal;
            let zonaSaude;
            if (saldoProjetadoFinal < 0) {
                zonaSaude = 'DEFICIT_PROJETADO';
            }
            else if (saldoProjetadoFinal < reservaSeguranca) {
                zonaSaude = 'ALERTA_APERTO';
            }
            else if (c.fluxoLiquidoMensal >= 0) {
                zonaSaude = 'SUPERAVIT';
            }
            else {
                zonaSaude = 'FOLGA_ESTAVEL';
            }
            const mapCategoria = new Map();
            for (const evt of c.eventos) {
                if (evt.tipo !== 'EXPENSE')
                    continue;
                const catKey = evt.categoriaId || 'outros';
                const catNome = evt.categoriaNome || 'Outras Despesas';
                const atual = mapCategoria.get(catKey) || {
                    categoriaNome: catNome,
                    total: 0,
                    eventosConhecidos: 0,
                    fallbackOrcamento: 0,
                };
                atual.total += evt.valor;
                if (evt.fonte === 'ORCAMENTO_FALLBACK') {
                    atual.fallbackOrcamento += evt.valor;
                }
                else {
                    atual.eventosConhecidos += evt.valor;
                }
                mapCategoria.set(catKey, atual);
            }
            const porCategoria = Array.from(mapCategoria.entries()).map(([catId, item]) => {
                const total = arredondar(item.total);
                const percentualDoTotal = c.totalDespesas > 0 ? arredondar((total / c.totalDespesas) * 100) : 0;
                return {
                    categoriaId: catId === 'outros' ? null : catId,
                    categoriaNome: item.categoriaNome,
                    total,
                    eventosConhecidos: arredondar(item.eventosConhecidos),
                    fallbackOrcamento: arredondar(item.fallbackOrcamento),
                    percentualDoTotal,
                };
            });
            const mapFonte = new Map();
            for (const evt of c.eventos) {
                const valorAtual = mapFonte.get(evt.fonte) || 0;
                mapFonte.set(evt.fonte, valorAtual + evt.valor);
            }
            const porFonte = Array.from(mapFonte.entries()).map(([fonte, valor]) => {
                const val = arredondar(valor);
                const isIncome = [
                    'SALARIO',
                    'RECEITA_RECORRENTE',
                    'RECEITA_PONTUAL',
                ].includes(fonte);
                const baseTotal = isIncome ? c.totalReceitas : c.totalDespesas;
                const percentualDoTotal = baseTotal > 0 ? arredondar((val / baseTotal) * 100) : 0;
                return {
                    fonte,
                    valor: val,
                    percentualDoTotal,
                };
            });
            competenciasFinal.push({
                competencia: c.ym.formatarISO(),
                exibicao: c.ym.formatarExibicao(),
                saldoInicialPeriodo,
                totalReceitas: c.totalReceitas,
                totalDespesas: c.totalDespesas,
                fluxoLiquidoMensal: c.fluxoLiquidoMensal,
                saldoProjetadoFinal,
                alocacaoPatrimonial: c.alocacaoPatrimonial,
                zonaSaude,
                eventos: c.eventos,
                breakdown: {
                    porCategoria,
                    porFonte,
                },
            });
        }
        return {
            referenceDate: referenceDate.toISOString(),
            saldoInicial: saldoInicialLedger,
            reservaSeguranca,
            despesaMediaMensal,
            competencias: competenciasFinal,
        };
    }
};
exports.TimelineForecastReadModelService = TimelineForecastReadModelService;
exports.TimelineForecastReadModelService = TimelineForecastReadModelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TimelineForecastReadModelService);
//# sourceMappingURL=timeline-forecast-read-model.service.js.map