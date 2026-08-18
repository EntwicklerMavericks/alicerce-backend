import { Injectable, Logger } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { FonteCotacaoProvider } from '../domain/providers/fonte-cotacao.provider';
import { CotacaoQuery, OfertaComparativo } from '../domain/interfaces/cotacao-query.interface';

@Injectable()
export class MercadoLivreCotacaoProvider implements FonteCotacaoProvider {
  private readonly logger = new Logger(MercadoLivreCotacaoProvider.name);

  async buscarCotacoes(contexto: CotacaoQuery): Promise<OfertaComparativo[]> {
    if (!contexto.termo || contexto.termo.trim() === '') {
      return [];
    }

    const limit = contexto.limit && contexto.limit > 0 ? Math.min(contexto.limit, 10) : 5;

    // 1. Tentar busca exata com o termo original
    let ofertas = await this.executarBuscaML(contexto.termo, limit);

    // 2. Se a busca exata retornar 0 resultados, aplicar fallback com busca simplificada
    if (ofertas.length === 0) {
      const termoSimplificado = this.simplificarTermo(contexto.termo);
      if (termoSimplificado !== contexto.termo) {
        this.logger.debug(`Busca exata ML vazia. Tentando termo simplificado: "${termoSimplificado}"`);
        ofertas = await this.executarBuscaML(termoSimplificado, limit);
      }
    }

    return ofertas;
  }

  private async executarBuscaML(termo: string, limit: number): Promise<OfertaComparativo[]> {
    const termoEncoded = encodeURIComponent(termo.trim());
    const apiUrl = `https://api.mercadolibre.com/sites/MLB/search?q=${termoEncoded}&limit=${limit}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

      const response = await fetch(apiUrl, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'User-Agent': 'AlicerceFinance/1.0',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return [];
      }

      const data: any = await response.json();
      if (!data || !Array.isArray(data.results)) {
        return [];
      }

      const ofertas: OfertaComparativo[] = [];

      for (const item of data.results) {
        if (!item || item.price === undefined || item.price === null) continue;

        const precoVal = Number(item.price);
        if (isNaN(precoVal) || precoVal <= 0) continue;

        const urlMercadoLivre = item.permalink || `https://produto.mercadolivre.com.br/MLB-${item.id}`;
        const vendedorNome = item.seller?.nickname || item.official_store_name || 'Vendedor Mercado Livre';

        ofertas.push({
          titulo: item.title || termo,
          preco: new Decimal(precoVal.toFixed(2)),
          moeda: 'BRL',
          url: urlMercadoLivre,
          fonte: 'MERCADO_LIVRE',
          vendedor: vendedorNome,
          imagemUrl: item.thumbnail || item.secure_thumbnail || null,
          coletadoEm: new Date(),
        });
      }

      return ofertas;
    } catch (err: any) {
      this.logger.error(`Falha ao buscar cotações no Mercado Livre: ${err.message}`);
      return [];
    }
  }

  private simplificarTermo(termo: string): string {
    // Remove palavras adjetivas ou redundantes que afunilam em excesso a busca do Mercado Livre
    const palasChave = termo
      .replace(/Italiana/gi, '')
      .replace(/Elétrica/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    return palasChave.length > 3 ? palasChave : termo;
  }
}
