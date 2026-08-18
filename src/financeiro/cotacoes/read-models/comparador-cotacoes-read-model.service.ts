import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface OfertaComparativo {
  id: string;
  nomeLoja: string;
  preco: number;
  url: string | null;
  tipo: 'LINK_PRODUTO' | 'COTACAO_AVULSA';
  observacoes?: string | null;
}

export interface ComparadorCotacoesPayload {
  itemWishlistId: string;
  nomeItem: string;
  precoAlvo: number | null;
  menorCotacao: number | null;
  maiorCotacao: number | null;
  alvoAtingido: boolean;
  economiaPotencial: number | null;
  totalOfertas: number;
  ofertas: OfertaComparativo[];
  apexChartData: {
    categories: string[];
    series: Array<{
      name: string;
      data: number[];
    }>;
  };
}

@Injectable()
export class ComparadorCotacoesReadModelService {
  constructor(private readonly prisma: PrismaService) {}

  async obterComparativo(
    workspaceId: string,
    itemWishlistId: string,
  ): Promise<ComparadorCotacoesPayload> {
    const item = await this.prisma.itemWishlist.findFirst({
      where: {
        id: itemWishlistId,
        workspaceId,
        ativo: true,
      },
      include: {
        cotacoesAvulsas: {
          where: { ativo: true },
        },
        produto: {
          include: {
            links: {
              where: {
                ativo: true,
                loja: { ativo: true },
              },
              include: {
                loja: true,
              },
            },
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Item da wishlist não encontrado.');
    }

    const ofertas: OfertaComparativo[] = [];

    // 1. Cotações Avulsas (consulta exclusivamente CotacaoAvulsa.preco)
    if (item.cotacoesAvulsas && item.cotacoesAvulsas.length > 0) {
      for (const cotAvulsa of item.cotacoesAvulsas) {
        ofertas.push({
          id: cotAvulsa.id,
          nomeLoja: cotAvulsa.nomeLoja,
          preco: Number(cotAvulsa.preco),
          url: cotAvulsa.url ?? null,
          tipo: 'COTACAO_AVULSA',
          observacoes: cotAvulsa.observacoes ?? null,
        });
      }
    }

    // 2. Links de Produtos (consulta exclusivamente LinkProduto.preco)
    if (item.produto?.links && item.produto.links.length > 0) {
      for (const link of item.produto.links) {
        ofertas.push({
          id: link.id,
          nomeLoja: link.loja.nome,
          preco: Number(link.preco),
          url: link.url ?? null,
          tipo: 'LINK_PRODUTO',
          observacoes: null,
        });
      }
    }

    // 3. Link direto cadastrado no ItemWishlist
    if (item.linkUrl && item.linkUrl.trim() !== '') {
      const urlNormalizada = item.linkUrl.trim();
      const jaExisteMesmaUrl = ofertas.some(
        (o) => o.url && o.url.toLowerCase() === urlNormalizada.toLowerCase(),
      );
      if (!jaExisteMesmaUrl) {
        let nomeLoja = 'Oferta Cadastrada';
        try {
          const parsed = new URL(
            urlNormalizada.startsWith('http')
              ? urlNormalizada
              : `https://${urlNormalizada}`,
          );
          const hostname = parsed.hostname.replace(/^www\./, '');
          nomeLoja = hostname.charAt(0).toUpperCase() + hostname.slice(1);
        } catch (_) {}

        ofertas.push({
          id: `link-direct-${item.id}`,
          nomeLoja,
          preco: item.precoAlvo !== null ? Number(item.precoAlvo) : 0,
          url: urlNormalizada,
          tipo: 'COTACAO_AVULSA',
          observacoes: 'Link direto do item da wishlist',
        });
      }
    }

    // Ordena as ofertas por menor preço
    ofertas.sort((a, b) => a.preco - b.preco);

    const precoAlvo = item.precoAlvo !== null && item.precoAlvo !== undefined
      ? Number(item.precoAlvo)
      : null;

    const precos = ofertas.map((o) => o.preco);
    const menorCotacao = precos.length > 0 ? Math.min(...precos) : null;
    const maiorCotacao = precos.length > 0 ? Math.max(...precos) : null;

    let alvoAtingido = false;
    let economiaPotencial: number | null = null;

    if (precoAlvo === null) {
      alvoAtingido = false;
      economiaPotencial = null;
    } else {
      if (menorCotacao !== null) {
        alvoAtingido = menorCotacao <= precoAlvo;
        economiaPotencial = Math.max(precoAlvo - menorCotacao, 0);
      } else {
        alvoAtingido = false;
        economiaPotencial = null;
      }
    }

    const categories = ofertas.map((o) => o.nomeLoja);
    const seriesData = ofertas.map((o) => o.preco);

    const apexChartData = {
      categories,
      series: [
        {
          name: 'Preço Cotação',
          data: seriesData,
        },
      ],
    };

    return {
      itemWishlistId: item.id,
      nomeItem: item.nome,
      precoAlvo,
      menorCotacao,
      maiorCotacao,
      alvoAtingido,
      economiaPotencial,
      totalOfertas: ofertas.length,
      ofertas,
      apexChartData,
    };
  }
}
