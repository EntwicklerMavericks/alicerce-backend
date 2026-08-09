import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface WishlistAnalyticsResult {
  economiaEvitadaAcumulada: number;
  taxaConclusaoConsciente: number;
  taxaCompraImpulsiva: number;
  totalItensDesistidos: number;
  totalItensComprados: number;
  totalItensEmAnalise: number;
  totalDesistidosConscientes: number;
  totalCompradosImpulsivos: number;
}

@Injectable()
export class WishlistAnalyticsReadModelService {
  constructor(private readonly prisma: PrismaService) {}

  async obterAnalytics(workspaceId: string): Promise<WishlistAnalyticsResult> {
    const itens = await this.prisma.itemWishlist.findMany({
      where: { workspaceId, ativo: true },
    });

    const desistidos = itens.filter((i) => i.status === 'DESISTIDO');
    const comprados = itens.filter((i) => i.status === 'COMPRADO');
    const emAnalise = itens.filter((i) => i.status === 'ANALISE');

    // 1. Economia Evitada Acumulada: Σ valorEconomizado dos itens DESISTIDO
    const economiaEvitadaAcumulada = desistidos.reduce((acc, item) => {
      const val = item.valorEconomizado ? Number(item.valorEconomizado) : 0;
      return acc + val;
    }, 0);

    // 2. Taxa de Conclusão Consciente: (Total DESISTIDOS com dataConclusao >= fimEsfriamento) / (Total DESISTIDOS + Total COMPRADOS)
    const desistidosConscientes = desistidos.filter((i) => {
      if (!i.dataConclusao || !i.fimEsfriamento) return false;
      return i.dataConclusao.getTime() >= i.fimEsfriamento.getTime();
    }).length;

    const totalFinalizados = desistidos.length + comprados.length;
    const taxaConclusaoConsciente =
      totalFinalizados > 0 ? desistidosConscientes / totalFinalizados : 0;

    // 3. Taxa de Compra Impulsiva: (Total COMPRADOS com quebrouEsfriamento = true) / (Total COMPRADOS originados de ANALISE)
    // Como todos os itens iniciam em ANALISE, Total COMPRADOS = Total COMPRADOS originados de ANALISE.
    const compradosImpulsivos = comprados.filter((i) => i.quebrouEsfriamento === true).length;
    const taxaCompraImpulsiva =
      comprados.length > 0 ? compradosImpulsivos / comprados.length : 0;

    return {
      economiaEvitadaAcumulada: Number(economiaEvitadaAcumulada.toFixed(2)),
      taxaConclusaoConsciente: Number(taxaConclusaoConsciente.toFixed(4)),
      taxaCompraImpulsiva: Number(taxaCompraImpulsiva.toFixed(4)),
      totalItensDesistidos: desistidos.length,
      totalItensComprados: comprados.length,
      totalItensEmAnalise: emAnalise.length,
      totalDesistidosConscientes: desistidosConscientes,
      totalCompradosImpulsivos: compradosImpulsivos,
    };
  }
}
