import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface ProjetoConsolidadoResult {
  id: string;
  workspaceId: string;
  nome: string;
  descricao: string | null;
  status: string;
  prioridade: number;
  dataInicioPrevista: Date | null;
  dataFimPrevista: Date | null;
  dataConclusao: Date | null;
  versao: number;
  ativo: boolean;
  dataCriacao: Date;
  dataAtualizacao: Date;
  orcamentoEstimado: number;
  custoEstimadoCalculado: number;
  valorFinanciado: number;
  coberturaFinanceira: number;
  progressoFinanceiro: number;
  progressoFisico: number;
  readinessScore: number;
  etapas: any[];
}

@Injectable()
export class ProjetosReadModelService {
  constructor(private readonly prisma: PrismaService) {}

  async obterProjetoConsolidado(
    workspaceId: string,
    projetoId: string,
    agora = new Date(),
  ): Promise<ProjetoConsolidadoResult> {
    const projeto = await this.prisma.projeto.findFirst({
      where: { id: projetoId, workspaceId, ativo: true },
      include: {
        etapas: {
          where: { ativo: true },
          orderBy: { ordem: 'asc' },
          include: {
            itens: {
              where: { ativo: true },
              include: {
                itemWishlist: {
                  include: {
                    cotacoes: true,
                    cotacoesAvulsas: {
                      where: { ativo: true },
                    },
                  },
                },
                meta: {
                  include: {
                    aportes: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!projeto) {
      throw new NotFoundException('Projeto não encontrado.');
    }

    return this.calcularConsolidadoProjeto(projeto, agora);
  }

  async listarProjetosConsolidados(
    workspaceId: string,
    agora = new Date(),
  ): Promise<ProjetoConsolidadoResult[]> {
    const projetos = await this.prisma.projeto.findMany({
      where: { workspaceId, ativo: true },
      include: {
        etapas: {
          where: { ativo: true },
          orderBy: { ordem: 'asc' },
          include: {
            itens: {
              where: { ativo: true },
              include: {
                itemWishlist: {
                  include: {
                    cotacoes: true,
                    cotacoesAvulsas: {
                      where: { ativo: true },
                    },
                  },
                },
                meta: {
                  include: {
                    aportes: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { dataCriacao: 'desc' },
    });

    return projetos.map((p) => this.calcularConsolidadoProjeto(p, agora));
  }

  public calcularConsolidadoProjeto(projeto: any, agora = new Date()): ProjetoConsolidadoResult {
    const orcamentoEstimado = projeto.orcamentoEstimado
      ? Number(projeto.orcamentoEstimado)
      : 0;

    let custoEstimadoCalculado = 0;
    let valorFinanciado = 0;
    let totalEtapas = 0;
    let etapasConcluidas = 0;

    let totalItensWishlist = 0;
    let itensWishlistProntos = 0;

    const etapasFormatadas = (projeto.etapas || []).map((etapa: any) => {
      totalEtapas += 1;
      if (etapa.status === 'CONCLUIDA') {
        etapasConcluidas += 1;
      }

      let etapaCusto = 0;
      let etapaFinanciado = 0;

      const itensFormatados = (etapa.itens || []).map((item: any) => {
        let itemCusto = 0;
        let itemFinanciado = 0;

        if (item.itemWishlist && item.itemWishlist.ativo !== false) {
          totalItensWishlist += 1;
          const wishlist = item.itemWishlist;

          // 1. custoEstimadoCalculado: Σ (precoAlvo ou menorCotacao)
          itemCusto = this.calcularCustoItemWishlist(wishlist);
          etapaCusto += itemCusto;
        }

        if (item.meta && item.meta.status !== 'CANCELADA') {
          // 2. valorFinanciado: Σ (meta.valorAcumulado)
          itemFinanciado = this.calcularValorAcumuladoMeta(item.meta);
          etapaFinanciado += itemFinanciado;
        }

        return {
          id: item.id,
          etapaId: item.etapaId,
          itemWishlistId: item.itemWishlistId,
          metaId: item.metaId,
          observacoes: item.observacoes,
          versao: item.versao,
          ativo: item.ativo,
          custoEstimado: Number(itemCusto.toFixed(2)),
          valorFinanciado: Number(itemFinanciado.toFixed(2)),
          itemWishlist: item.itemWishlist ? item.itemWishlist : null,
          meta: item.meta ? item.meta : null,
        };
      });

      custoEstimadoCalculado += etapaCusto;
      valorFinanciado += etapaFinanciado;

      // Verifica Readiness dos itens da Wishlist da Etapa
      for (const item of etapa.itens || []) {
        if (item.itemWishlist && item.itemWishlist.ativo !== false) {
          const wishlist = item.itemWishlist;
          const isReady = this.verificarItemReadiness(
            wishlist,
            etapaCusto,
            etapaFinanciado,
            agora,
          );
          if (isReady) {
            itensWishlistProntos += 1;
          }
        }
      }

      return {
        id: etapa.id,
        projetoId: etapa.projetoId,
        nome: etapa.nome,
        descricao: etapa.descricao,
        ordem: etapa.ordem,
        status: etapa.status,
        dataInicio: etapa.dataInicio,
        dataConclusao: etapa.dataConclusao,
        versao: etapa.versao,
        ativo: etapa.ativo,
        custoEtapa: Number(etapaCusto.toFixed(2)),
        financiadoEtapa: Number(etapaFinanciado.toFixed(2)),
        itens: itensFormatados,
      };
    });

    // 3. CoberturaFinanceira (%) com proteção contra divisão por zero:
    // custoEstimadoCalculado > 0 ? Math.min((coberturaTotal / custoEstimadoCalculado) * 100, 100) : 0
    const coberturaFinanceira =
      custoEstimadoCalculado > 0
        ? Math.min(Number(((valorFinanciado / custoEstimadoCalculado) * 100).toFixed(2)), 100)
        : 0;

    // 4. Progresso Financeiro (%)
    const alvoFinanceiro =
      custoEstimadoCalculado > 0
        ? custoEstimadoCalculado
        : orcamentoEstimado > 0
        ? orcamentoEstimado
        : 0;

    const progressoFinanceiro =
      alvoFinanceiro > 0
        ? Math.min(Number(((valorFinanciado / alvoFinanceiro) * 100).toFixed(2)), 100)
        : 0;

    // 5. Progresso Físico (%) com proteção contra divisão por zero
    const progressoFisico =
      totalEtapas > 0
        ? Number(((etapasConcluidas / totalEtapas) * 100).toFixed(2))
        : 0;

    // 6. ReadinessScore (%) com proteção contra divisão por zero
    const readinessScore =
      totalItensWishlist > 0
        ? Math.min(Number(((itensWishlistProntos / totalItensWishlist) * 100).toFixed(2)), 100)
        : 0;

    return {
      id: projeto.id,
      workspaceId: projeto.workspaceId,
      nome: projeto.nome,
      descricao: projeto.descricao,
      status: projeto.status,
      prioridade: projeto.prioridade,
      dataInicioPrevista: projeto.dataInicioPrevista,
      dataFimPrevista: projeto.dataFimPrevista,
      dataConclusao: projeto.dataConclusao,
      versao: projeto.versao,
      ativo: projeto.ativo,
      dataCriacao: projeto.dataCriacao,
      dataAtualizacao: projeto.dataAtualizacao,
      orcamentoEstimado: Number(orcamentoEstimado.toFixed(2)),
      custoEstimadoCalculado: Number(custoEstimadoCalculado.toFixed(2)),
      valorFinanciado: Number(valorFinanciado.toFixed(2)),
      coberturaFinanceira,
      progressoFinanceiro,
      progressoFisico,
      readinessScore,
      etapas: etapasFormatadas,
    };
  }

  private calcularCustoItemWishlist(wishlist: any): number {
    if (wishlist.precoAlvo && Number(wishlist.precoAlvo) > 0) {
      return Number(wishlist.precoAlvo);
    }

    const menorCotacao = this.extrairMenorCotacao(wishlist);
    if (menorCotacao !== null && menorCotacao > 0) {
      return menorCotacao;
    }

    if (wishlist.valorCompra && Number(wishlist.valorCompra) > 0) {
      return Number(wishlist.valorCompra);
    }

    return 0;
  }

  private extrairMenorCotacao(wishlist: any): number | null {
    const cotacoesNormais = wishlist.cotacoes || [];
    const cotacoesAvulsas = wishlist.cotacoesAvulsas || [];

    const precosNormais = cotacoesNormais
      .map((c: any) => Number(c.preco))
      .filter((p: number) => !isNaN(p) && p > 0);

    const precosAvulsos = cotacoesAvulsas
      .map((c: any) => Number(c.preco))
      .filter((p: number) => !isNaN(p) && p > 0);

    const todosPrecos = [...precosNormais, ...precosAvulsos];
    if (todosPrecos.length === 0) return null;

    return Math.min(...todosPrecos);
  }

  private calcularValorAcumuladoMeta(meta: any): number {
    const aportes = meta.aportes || [];
    return aportes.reduce((acc: number, aporte: any) => {
      const v = aporte.valor ? Number(aporte.valor) : 0;
      return acc + v;
    }, 0);
  }

  private verificarItemReadiness(
    wishlist: any,
    etapaCusto: number,
    etapaFinanciado: number,
    agora: Date,
  ): boolean {
    if (wishlist.status === 'COMPRADO') {
      return true;
    }

    if (wishlist.status === 'PLANEJADO') {
      const fimEsfriamento = wishlist.fimEsfriamento
        ? new Date(wishlist.fimEsfriamento)
        : null;
      const esfriamentoConcluido = fimEsfriamento
        ? agora.getTime() >= fimEsfriamento.getTime()
        : true;

      const etapaFinanciada = etapaFinanciado >= etapaCusto && etapaCusto > 0;

      return esfriamentoConcluido && etapaFinanciada;
    }

    return false;
  }
}
