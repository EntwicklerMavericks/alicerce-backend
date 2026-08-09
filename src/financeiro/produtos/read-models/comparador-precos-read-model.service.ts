import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface ComparativoPrecosProduto {
  produtoId: string;
  nome: string;
  marca: string | null;
  categoria: string | null;
  imagemPrincipalUrl: string | null;
  menorPreco: number | null;
  maiorPreco: number | null;
  diferencaPreco: number | null;
  economiaPercentual: number | null;
  totalOfertas: number;
  ofertas: Array<{
    linkId: string;
    lojaId: string;
    lojaNome: string;
    lojaLogo: string | null;
    lojaSistema: boolean;
    url: string;
    preco: number;
    versao: number;
    ultimaVerificacao: Date | null;
    historicoPrecos: Array<{
      preco: number;
      data: Date;
    }>;
  }>;
}

@Injectable()
export class ComparadorPrecosReadModelService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retorna o comparativo de preços para todos os produtos ativos do workspace que possuem ofertas ativas em lojas ativas
   */
  async compararPrecosWorkspace(workspaceId: string): Promise<ComparativoPrecosProduto[]> {
    const produtos = await this.prisma.produto.findMany({
      where: {
        workspaceId,
        ativo: true,
      },
      include: {
        categoria: true,
        imagens: {
          where: { ativo: true },
          orderBy: { principal: 'desc' },
          take: 1,
        },
        links: {
          where: {
            ativo: true,
            loja: { ativo: true },
          },
          include: {
            loja: true,
            historicoPrecos: {
              orderBy: { data: 'desc' },
              take: 10,
            },
          },
          orderBy: {
            preco: 'asc',
          },
        },
      },
      orderBy: { nome: 'asc' },
    });

    return produtos.map((p) => this.mapearComparativoProduto(p));
  }

  /**
   * Retorna o comparativo de preços para um produto específico do workspace
   */
  async obterComparativoPorProduto(
    workspaceId: string,
    produtoId: string,
  ): Promise<ComparativoPrecosProduto> {
    const produto = await this.prisma.produto.findFirst({
      where: {
        id: produtoId,
        workspaceId,
        ativo: true,
      },
      include: {
        categoria: true,
        imagens: {
          where: { ativo: true },
          orderBy: { principal: 'desc' },
          take: 1,
        },
        links: {
          where: {
            ativo: true,
            loja: { ativo: true },
          },
          include: {
            loja: true,
            historicoPrecos: {
              orderBy: { data: 'desc' },
              take: 20,
            },
          },
          orderBy: {
            preco: 'asc',
          },
        },
      },
    });

    if (!produto) {
      throw new NotFoundException('Produto não encontrado ou inativo.');
    }

    return this.mapearComparativoProduto(produto);
  }

  private mapearComparativoProduto(produto: any): ComparativoPrecosProduto {
    const imagemPrincipalUrl = produto.imagens?.[0]?.url || null;
    const ofertas = produto.links.map((link: any) => ({
      linkId: link.id,
      lojaId: link.loja.id,
      lojaNome: link.loja.nome,
      lojaLogo: link.loja.urlLogo,
      lojaSistema: link.loja.sistema,
      url: link.url,
      preco: Number(link.preco),
      versao: link.versao,
      ultimaVerificacao: link.ultimaVerificacao,
      historicoPrecos: link.historicoPrecos.map((h: any) => ({
        preco: Number(h.preco),
        data: h.data,
      })),
    }));

    const precos = ofertas.map((o: any) => o.preco);
    const menorPreco = precos.length > 0 ? Math.min(...precos) : null;
    const maiorPreco = precos.length > 0 ? Math.max(...precos) : null;
    const diferencaPreco = menorPreco !== null && maiorPreco !== null ? maiorPreco - menorPreco : null;
    const economiaPercentual =
      maiorPreco && diferencaPreco !== null && maiorPreco > 0
        ? Number(((diferencaPreco / maiorPreco) * 100).toFixed(2))
        : null;

    return {
      produtoId: produto.id,
      nome: produto.nome,
      marca: produto.marca,
      categoria: produto.categoria?.nome || null,
      imagemPrincipalUrl,
      menorPreco,
      maiorPreco,
      diferencaPreco,
      economiaPercentual,
      totalOfertas: ofertas.length,
      ofertas,
    };
  }
}
