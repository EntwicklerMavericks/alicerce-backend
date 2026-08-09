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
exports.DashboardReadModelService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const ledger_service_1 = require("../../financeiro/ledger/ledger.service");
const planning_overview_read_model_service_1 = require("../../financeiro/planning/read-models/planning-overview-read-model.service");
let DashboardReadModelService = class DashboardReadModelService {
    ledgerService;
    planningOverviewReadModelService;
    prisma;
    constructor(ledgerService, planningOverviewReadModelService, prisma) {
        this.ledgerService = ledgerService;
        this.planningOverviewReadModelService = planningOverviewReadModelService;
        this.prisma = prisma;
    }
    async obterDashboard(workspaceId, referenceDateInput) {
        const referenceDate = referenceDateInput
            ? new Date(referenceDateInput)
            : new Date();
        const [saldoGlobal, planningOverview, faturasAbertas, lancamentosAtrasados] = await Promise.all([
            this.ledgerService.obterSaldoGlobal(workspaceId, referenceDate),
            this.planningOverviewReadModelService.obterVisaoUnificada(workspaceId, referenceDate),
            this.buscarFaturasAbertas(workspaceId, referenceDate),
            this.buscarLancamentosAtrasados(workspaceId, referenceDate),
        ]);
        const metasAtivas = (planningOverview.metasDestaque || [])
            .filter((m) => m.status === 'ATIVA')
            .slice(0, 3);
        const alertasCriticos = this.mapearAlertasCriticos({
            referenceDate,
            resumoForecast: planningOverview.resumoForecast,
            orcamentosAlerta: planningOverview.orcamentosAlerta,
            faturasAbertas,
            lancamentosAtrasados,
        });
        return {
            referenceDate,
            saldoGlobal: this.sanitizarNumero(saldoGlobal),
            faturasAbertas,
            orcamentoMes: planningOverview.orcamentosAlerta || [],
            metasAtivas,
            alertasCriticos,
        };
    }
    async buscarFaturasAbertas(workspaceId, referenceDate) {
        const faturasDb = await this.prisma.faturaCartao.findMany({
            where: {
                cartao: { workspaceId, ativo: true },
                status: { in: ['ABERTA', 'FECHADA', 'ATRASADA'] },
            },
            include: {
                cartao: true,
                parcelas: true,
            },
            orderBy: [{ ano: 'asc' }, { mes: 'asc' }],
        });
        const resultado = [];
        for (const f of faturasDb) {
            let valorTotal = 0;
            if (f.valorPago && Number(f.valorPago) > 0) {
                valorTotal = Number(f.valorPago);
            }
            else if (f.parcelas && f.parcelas.length > 0) {
                valorTotal = f.parcelas
                    .filter((p) => p.status !== 'CANCELADA')
                    .reduce((acc, p) => acc + Number(p.valor || 0), 0);
            }
            valorTotal = this.sanitizarNumero(valorTotal);
            resultado.push({
                id: f.id,
                cartaoId: f.cartaoId,
                cartaoNome: f.cartao.nome,
                cartaoCor: f.cartao.cor,
                cartaoIcone: f.cartao.icone,
                mes: f.mes,
                ano: f.ano,
                valorTotal,
                dataVencimento: new Date(f.dataVencimento),
                status: f.status,
            });
        }
        return resultado;
    }
    async buscarLancamentosAtrasados(workspaceId, referenceDate) {
        const [despesasAtrasadas, receitasAtrasadas] = await Promise.all([
            this.prisma.despesa.findMany({
                where: {
                    workspaceId,
                    statusDocumento: 'ATIVO',
                    statusLiquidacao: 'PENDENTE',
                    dataExclusao: null,
                    dataVencimento: { lt: referenceDate },
                },
            }),
            this.prisma.receita.findMany({
                where: {
                    workspaceId,
                    statusDocumento: 'ATIVO',
                    statusLiquidacao: 'PENDENTE',
                    data: { lt: referenceDate },
                },
            }),
        ]);
        const itens = [];
        for (const d of despesasAtrasadas) {
            const dataVenc = new Date(d.dataVencimento);
            const diffTime = referenceDate.getTime() - dataVenc.getTime();
            const diasAtraso = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            itens.push({
                id: d.id,
                descricao: d.descricao,
                valor: this.sanitizarNumero(Number(d.valor)),
                tipo: 'DESPESA',
                dataVencimento: dataVenc,
                diasAtraso: Math.max(1, diasAtraso),
            });
        }
        for (const r of receitasAtrasadas) {
            const dataRec = new Date(r.data);
            const diffTime = referenceDate.getTime() - dataRec.getTime();
            const diasAtraso = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            itens.push({
                id: r.id,
                descricao: r.descricao,
                valor: this.sanitizarNumero(Number(r.valor)),
                tipo: 'RECEITA',
                dataVencimento: dataRec,
                diasAtraso: Math.max(1, diasAtraso),
            });
        }
        itens.sort((a, b) => b.diasAtraso - a.diasAtraso || a.id.localeCompare(b.id));
        return itens;
    }
    mapearAlertasCriticos(params) {
        const { referenceDate, resumoForecast, orcamentosAlerta, faturasAbertas, lancamentosAtrasados, } = params;
        const mapAlertas = new Map();
        const adicionarAlerta = (alerta) => {
            if (!mapAlertas.has(alerta.id)) {
                mapAlertas.set(alerta.id, alerta);
            }
        };
        if (resumoForecast && Array.isArray(resumoForecast.competencias)) {
            for (const comp of resumoForecast.competencias) {
                if (comp.zonaSaude === 'DEFICIT_PROJETADO' || comp.saldoProjetadoFinal < 0) {
                    adicionarAlerta({
                        id: `alert-deficit-${comp.competencia}`,
                        tipo: 'DEFICIT_PROJETADO',
                        severidade: 'CRITICO',
                        titulo: `Déficit Projetado (${comp.exibicao || comp.competencia})`,
                        mensagem: `Previsão de saldo negativo em ${comp.exibicao || comp.competencia}. Saldo projetado: R$ ${this.sanitizarNumero(comp.saldoProjetadoFinal).toFixed(2)}.`,
                        detalhes: {
                            competencia: comp.competencia,
                            saldoProjetadoFinal: comp.saldoProjetadoFinal,
                        },
                        dataIdentificacao: referenceDate,
                    });
                }
            }
        }
        for (const orc of orcamentosAlerta || []) {
            if (orc.estado === 'EXCEDIDO' || orc.percentualConsumido >= 100) {
                adicionarAlerta({
                    id: `alert-orcamento-${orc.id}`,
                    tipo: 'ORCAMENTO_EXCEDIDO',
                    severidade: 'CRITICO',
                    titulo: `Orçamento Excedido: ${orc.categoriaNome}`,
                    mensagem: `O orçamento para "${orc.categoriaNome}" excedeu o limite programado (${orc.percentualConsumido}% consumido).`,
                    detalhes: {
                        categoriaId: orc.categoriaId,
                        limite: orc.limite,
                        valorConsumido: orc.valorConsumido,
                    },
                    dataIdentificacao: referenceDate,
                });
            }
            else if (orc.estado === 'ATENCAO') {
                adicionarAlerta({
                    id: `alert-orcamento-${orc.id}`,
                    tipo: 'ORCAMENTO_EXCEDIDO',
                    severidade: 'ALTO',
                    titulo: `Orçamento Próximo do Limite: ${orc.categoriaNome}`,
                    mensagem: `A categoria "${orc.categoriaNome}" atingiu ${orc.percentualConsumido}% do orçamento estipulado.`,
                    detalhes: {
                        categoriaId: orc.categoriaId,
                        limite: orc.limite,
                        valorConsumido: orc.valorConsumido,
                    },
                    dataIdentificacao: referenceDate,
                });
            }
            else if (orc.estado === 'ALERTA') {
                adicionarAlerta({
                    id: `alert-orcamento-${orc.id}`,
                    tipo: 'ORCAMENTO_EXCEDIDO',
                    severidade: 'MEDIO',
                    titulo: `Alerta de Consumo: ${orc.categoriaNome}`,
                    mensagem: `A categoria "${orc.categoriaNome}" consumiu ${orc.percentualConsumido}% do orçamento estipulado.`,
                    detalhes: {
                        categoriaId: orc.categoriaId,
                        limite: orc.limite,
                        valorConsumido: orc.valorConsumido,
                    },
                    dataIdentificacao: referenceDate,
                });
            }
        }
        for (const fat of faturasAbertas) {
            if (fat.dataVencimento < referenceDate || fat.status === 'ATRASADA') {
                adicionarAlerta({
                    id: `alert-fatura-${fat.id}`,
                    tipo: 'FATURA_VENCIDA',
                    severidade: 'CRITICO',
                    titulo: `Fatura Vencida: ${fat.cartaoNome}`,
                    mensagem: `Fatura do cartão ${fat.cartaoNome} no valor de R$ ${fat.valorTotal.toFixed(2)} está vencida.`,
                    detalhes: {
                        faturaId: fat.id,
                        cartaoId: fat.cartaoId,
                        valorTotal: fat.valorTotal,
                        dataVencimento: fat.dataVencimento,
                    },
                    dataIdentificacao: referenceDate,
                });
            }
        }
        for (const item of lancamentosAtrasados) {
            const severidade = item.tipo === 'DESPESA' ? 'CRITICO' : 'ALTO';
            adicionarAlerta({
                id: `alert-lancamento-${item.id}`,
                tipo: 'LANCAMENTO_ATRASADO',
                severidade,
                titulo: `Lançamento Atrasado: ${item.descricao}`,
                mensagem: `${item.tipo === 'DESPESA' ? 'Despesa' : 'Receita'} "${item.descricao}" no valor de R$ ${item.valor.toFixed(2)} está atrasada há ${item.diasAtraso} dia(s).`,
                detalhes: {
                    lancamentoId: item.id,
                    tipo: item.tipo,
                    diasAtraso: item.diasAtraso,
                },
                dataIdentificacao: referenceDate,
            });
        }
        const ordemSeveridade = {
            CRITICO: 1,
            ALTO: 2,
            MEDIO: 3,
        };
        const listaAlertas = Array.from(mapAlertas.values());
        listaAlertas.sort((a, b) => {
            const pA = ordemSeveridade[a.severidade] || 4;
            const pB = ordemSeveridade[b.severidade] || 4;
            if (pA !== pB)
                return pA - pB;
            return a.id.localeCompare(b.id);
        });
        return listaAlertas;
    }
    sanitizarNumero(valor) {
        if (isNaN(valor) || !isFinite(valor)) {
            return 0;
        }
        return Math.round(valor * 100) / 100;
    }
};
exports.DashboardReadModelService = DashboardReadModelService;
exports.DashboardReadModelService = DashboardReadModelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ledger_service_1.LedgerService,
        planning_overview_read_model_service_1.PlanningOverviewReadModelService,
        prisma_service_1.PrismaService])
], DashboardReadModelService);
//# sourceMappingURL=dashboard-read-model.service.js.map