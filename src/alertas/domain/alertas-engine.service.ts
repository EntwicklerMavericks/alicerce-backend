import { Injectable } from '@nestjs/common';
import { TipoAlerta } from '@prisma/client';

export type SeveridadeAlerta = 'CRITICO' | 'ALTO' | 'MEDIO';

export interface AlertaCandidate {
  tipo: TipoAlerta;
  titulo: string;
  mensagem: string;
  tipoReferencia?: string;
  referenciaId?: string;
  competenciaConcreta?: string;
  severidade: SeveridadeAlerta;
}

export interface DespesaContexto {
  id: string;
  descricao: string;
  valor: number;
  dataVencimento: Date | string;
  status?: string;
}

export interface FaturaContexto {
  id: string;
  cartaoId?: string;
  cartaoNome?: string;
  valorTotal: number;
  dataVencimento: Date | string;
  status?: string;
}

export interface OrcamentoContexto {
  id: string;
  categoriaId: string;
  categoriaNome?: string;
  mes: number;
  ano: number;
  valorPlanejado: number;
  valorReal: number;
}

export interface MetaContexto {
  id: string;
  nome: string;
  valorAlvo: number;
  valorAtual: number;
  status?: string;
}

export interface SalarioContexto {
  id: string;
  pessoaId: string;
  pessoaNome?: string;
  mes: number;
  ano: number;
  valorReal?: number | null;
  status?: string;
}

export interface WishlistContexto {
  id: string;
  nome: string;
  precoAlvo?: number | null;
  menorPrecoCotacao?: number | null;
}

export interface SistemaContexto {
  id: string;
  titulo: string;
  mensagem: string;
  data?: Date | string;
}

export interface AlertasDetectionContext {
  referenceDate: Date;
  despesas?: DespesaContexto[];
  faturas?: FaturaContexto[];
  orcamentos?: OrcamentoContexto[];
  metas?: MetaContexto[];
  salarios?: SalarioContexto[];
  wishlist?: WishlistContexto[];
  sistemas?: SistemaContexto[];
}

@Injectable()
export class AlertasEngineService {
  /**
   * Função pura de domínio para detectar alertas em memória.
   * Não possui dependência com o PrismaService.
   */
  detectarAlertas(contexto: AlertasDetectionContext): AlertaCandidate[] {
    const candidatos: AlertaCandidate[] = [];
    const refDate = new Date(contexto.referenceDate);

    // 1. CONTA_VENCENDO (Despesas PENDENTES perto do vencimento ou vencidas)
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
            tipo: TipoAlerta.CONTA_VENCENDO,
            titulo: `Conta Vencida: ${despesa.descricao}`,
            mensagem: `A despesa "${despesa.descricao}" no valor de R$ ${despesa.valor.toFixed(2)} está vencida desde ${vencimento.toLocaleDateString('pt-BR')}.`,
            tipoReferencia: 'DESPESA',
            referenciaId: despesa.id,
            competenciaConcreta: competencia,
            severidade: 'CRITICO',
          });
        } else if (diffDias <= 3) {
          candidatos.push({
            tipo: TipoAlerta.CONTA_VENCENDO,
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

    // 2. CONTA_VENCENDO (Faturas de Cartão PENDENTES/ABERTAS/ATRASADAS)
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
            tipo: TipoAlerta.CONTA_VENCENDO,
            titulo: `Fatura Atrasada: ${nomeCartao}`,
            mensagem: `A fatura do ${nomeCartao} no valor de R$ ${fatura.valorTotal.toFixed(2)} está vencida desde ${vencimento.toLocaleDateString('pt-BR')}.`,
            tipoReferencia: 'FATURA',
            referenciaId: fatura.id,
            competenciaConcreta: competencia,
            severidade: 'CRITICO',
          });
        } else if (diffDias <= 3) {
          candidatos.push({
            tipo: TipoAlerta.CONTA_VENCENDO,
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

    // 3. ORCAMENTO_EXCEDIDO
    if (contexto.orcamentos && contexto.orcamentos.length > 0) {
      for (const orcamento of contexto.orcamentos) {
        if (orcamento.valorReal > orcamento.valorPlanejado) {
          const catNome = orcamento.categoriaNome || 'Categoria';
          const competencia = `${orcamento.ano}-${String(orcamento.mes).padStart(2, '0')}`;
          candidatos.push({
            tipo: TipoAlerta.ORCAMENTO_EXCEDIDO,
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

    // 4. META_ATINGIDA
    if (contexto.metas && contexto.metas.length > 0) {
      for (const meta of contexto.metas) {
        if (meta.valorAtual >= meta.valorAlvo) {
          const competencia = `${refDate.getFullYear()}-${String(refDate.getMonth() + 1).padStart(2, '0')}`;
          candidatos.push({
            tipo: TipoAlerta.META_ATINGIDA,
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

    // 5. SALARIO_RECEBIDO
    if (contexto.salarios && contexto.salarios.length > 0) {
      for (const salario of contexto.salarios) {
        if (
          salario.status === 'RECEBIDA' ||
          (salario.valorReal !== null && salario.valorReal !== undefined && salario.valorReal > 0)
        ) {
          const pessoa = salario.pessoaNome || 'Titular';
          const competencia = `${salario.ano}-${String(salario.mes).padStart(2, '0')}`;
          const valor = salario.valorReal ? salario.valorReal.toFixed(2) : '0.00';
          candidatos.push({
            tipo: TipoAlerta.SALARIO_RECEBIDO,
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

    // 6. QUEDA_PRECO
    if (contexto.wishlist && contexto.wishlist.length > 0) {
      for (const item of contexto.wishlist) {
        if (
          item.precoAlvo !== null &&
          item.precoAlvo !== undefined &&
          item.menorPrecoCotacao !== null &&
          item.menorPrecoCotacao !== undefined &&
          item.menorPrecoCotacao <= item.precoAlvo
        ) {
          candidatos.push({
            tipo: TipoAlerta.QUEDA_PRECO,
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

    // 7. SISTEMA
    if (contexto.sistemas && contexto.sistemas.length > 0) {
      for (const sys of contexto.sistemas) {
        candidatos.push({
          tipo: TipoAlerta.SISTEMA,
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
}
