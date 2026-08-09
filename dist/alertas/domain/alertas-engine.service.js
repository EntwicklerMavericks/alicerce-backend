"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertasEngineService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let AlertasEngineService = class AlertasEngineService {
    detectarAlertas(contexto) {
        const candidatos = [];
        const refDate = new Date(contexto.referenceDate);
        if (contexto.despesas && contexto.despesas.length > 0) {
            for (const despesa of contexto.despesas) {
                if (despesa.status === 'CANCELADA' || despesa.status === 'PAGA') {
                    continue;
                }
                const vencimento = new Date(despesa.dataVencimento);
                const diffMs = vencimento.getTime() - refDate.getTime();
                const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                const competencia = vencimento.toISOString().substring(0, 10);
                if (diffDias < 0) {
                    candidatos.push({
                        tipo: client_1.TipoAlerta.CONTA_VENCENDO,
                        titulo: `Conta Vencida: ${despesa.descricao}`,
                        mensagem: `A despesa "${despesa.descricao}" no valor de R$ ${despesa.valor.toFixed(2)} está vencida desde ${vencimento.toLocaleDateString('pt-BR')}.`,
                        tipoReferencia: 'DESPESA',
                        referenciaId: despesa.id,
                        competenciaConcreta: competencia,
                        severidade: 'CRITICO',
                    });
                }
                else if (diffDias <= 3) {
                    candidatos.push({
                        tipo: client_1.TipoAlerta.CONTA_VENCENDO,
                        titulo: `Conta a Vencer: ${despesa.descricao}`,
                        mensagem: `A despesa "${despesa.descricao}" no valor de R$ ${despesa.valor.toFixed(2)} vence em breve (${vencimento.toLocaleDateString('pt-BR')}).`,
                        tipoReferencia: 'DESPESA',
                        referenciaId: despesa.id,
                        competenciaConcreta: competencia,
                        severidade: 'ALTO',
                    });
                }
            }
        }
        if (contexto.faturas && contexto.faturas.length > 0) {
            for (const fatura of contexto.faturas) {
                if (fatura.status === 'PAGA') {
                    continue;
                }
                const vencimento = new Date(fatura.dataVencimento);
                const diffMs = vencimento.getTime() - refDate.getTime();
                const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                const competencia = vencimento.toISOString().substring(0, 10);
                const nomeCartao = fatura.cartaoNome || 'Cartão de Crédito';
                if (diffDias < 0 || fatura.status === 'ATRASADA') {
                    candidatos.push({
                        tipo: client_1.TipoAlerta.CONTA_VENCENDO,
                        titulo: `Fatura Atrasada: ${nomeCartao}`,
                        mensagem: `A fatura do ${nomeCartao} no valor de R$ ${fatura.valorTotal.toFixed(2)} está vencida desde ${vencimento.toLocaleDateString('pt-BR')}.`,
                        tipoReferencia: 'FATURA',
                        referenciaId: fatura.id,
                        competenciaConcreta: competencia,
                        severidade: 'CRITICO',
                    });
                }
                else if (diffDias <= 3) {
                    candidatos.push({
                        tipo: client_1.TipoAlerta.CONTA_VENCENDO,
                        titulo: `Fatura a Vencer: ${nomeCartao}`,
                        mensagem: `A fatura do ${nomeCartao} no valor de R$ ${fatura.valorTotal.toFixed(2)} vence em breve (${vencimento.toLocaleDateString('pt-BR')}).`,
                        tipoReferencia: 'FATURA',
                        referenciaId: fatura.id,
                        competenciaConcreta: competencia,
                        severidade: 'ALTO',
                    });
                }
            }
        }
        if (contexto.orcamentos && contexto.orcamentos.length > 0) {
            for (const orcamento of contexto.orcamentos) {
                if (orcamento.valorReal > orcamento.valorPlanejado) {
                    const catNome = orcamento.categoriaNome || 'Categoria';
                    const competencia = `${orcamento.ano}-${String(orcamento.mes).padStart(2, '0')}`;
                    candidatos.push({
                        tipo: client_1.TipoAlerta.ORCAMENTO_EXCEDIDO,
                        titulo: `Orçamento Excedido: ${catNome}`,
                        mensagem: `O orçamento da categoria "${catNome}" foi excedido! Planejado: R$ ${orcamento.valorPlanejado.toFixed(2)}, Realizado: R$ ${orcamento.valorReal.toFixed(2)}.`,
                        tipoReferencia: 'ORCAMENTO',
                        referenciaId: orcamento.id,
                        competenciaConcreta: competencia,
                        severidade: 'CRITICO',
                    });
                }
            }
        }
        if (contexto.metas && contexto.metas.length > 0) {
            for (const meta of contexto.metas) {
                if (meta.valorAtual >= meta.valorAlvo) {
                    const competencia = `${refDate.getFullYear()}-${String(refDate.getMonth() + 1).padStart(2, '0')}`;
                    candidatos.push({
                        tipo: client_1.TipoAlerta.META_ATINGIDA,
                        titulo: `Meta Atingida: ${meta.nome}`,
                        mensagem: `Parabéns! Você alcançou a meta "${meta.nome}" (Alvo: R$ ${meta.valorAlvo.toFixed(2)}, Atual: R$ ${meta.valorAtual.toFixed(2)}).`,
                        tipoReferencia: 'META',
                        referenciaId: meta.id,
                        competenciaConcreta: competencia,
                        severidade: 'MEDIO',
                    });
                }
            }
        }
        if (contexto.salarios && contexto.salarios.length > 0) {
            for (const salario of contexto.salarios) {
                if (salario.status === 'RECEBIDA' ||
                    (salario.valorReal !== null && salario.valorReal !== undefined && salario.valorReal > 0)) {
                    const pessoa = salario.pessoaNome || 'Titular';
                    const competencia = `${salario.ano}-${String(salario.mes).padStart(2, '0')}`;
                    const valor = salario.valorReal ? salario.valorReal.toFixed(2) : '0.00';
                    candidatos.push({
                        tipo: client_1.TipoAlerta.SALARIO_RECEBIDO,
                        titulo: `Salário Recebido: ${pessoa}`,
                        mensagem: `O pagamento do salário de ${pessoa} no valor de R$ ${valor} foi confirmado para a competência ${competencia}.`,
                        tipoReferencia: 'SALARIO',
                        referenciaId: salario.id,
                        competenciaConcreta: competencia,
                        severidade: 'MEDIO',
                    });
                }
            }
        }
        if (contexto.wishlist && contexto.wishlist.length > 0) {
            for (const item of contexto.wishlist) {
                if (item.precoAlvo !== null &&
                    item.precoAlvo !== undefined &&
                    item.menorPrecoCotacao !== null &&
                    item.menorPrecoCotacao !== undefined &&
                    item.menorPrecoCotacao <= item.precoAlvo) {
                    candidatos.push({
                        tipo: client_1.TipoAlerta.QUEDA_PRECO,
                        titulo: `Queda de Preço: ${item.nome}`,
                        mensagem: `O item "${item.nome}" atingiu o preço desejado! Preço alvo: R$ ${item.precoAlvo.toFixed(2)}, Preço encontrado: R$ ${item.menorPrecoCotacao.toFixed(2)}.`,
                        tipoReferencia: 'WISHLIST',
                        referenciaId: item.id,
                        competenciaConcreta: 'ATUAL',
                        severidade: 'ALTO',
                    });
                }
            }
        }
        if (contexto.sistemas && contexto.sistemas.length > 0) {
            for (const sys of contexto.sistemas) {
                candidatos.push({
                    tipo: client_1.TipoAlerta.SISTEMA,
                    titulo: `Aviso do Sistema: ${sys.titulo}`,
                    mensagem: sys.mensagem,
                    tipoReferencia: 'SISTEMA',
                    referenciaId: sys.id,
                    competenciaConcreta: 'ATUAL',
                    severidade: 'MEDIO',
                });
            }
        }
        return candidatos;
    }
};
exports.AlertasEngineService = AlertasEngineService;
exports.AlertasEngineService = AlertasEngineService = __decorate([
    (0, common_1.Injectable)()
], AlertasEngineService);
//# sourceMappingURL=alertas-engine.service.js.map