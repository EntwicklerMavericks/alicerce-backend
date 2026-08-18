import { Injectable, Logger } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { SsrfGuardService } from '../domain/services/ssrf-guard.service';
import { FonteCotacaoProvider } from '../domain/providers/fonte-cotacao.provider';
import { CotacaoQuery, OfertaComparativo } from '../domain/interfaces/cotacao-query.interface';

@Injectable()
export class BuscapeCotacaoProvider implements FonteCotacaoProvider {
  private readonly logger = new Logger(BuscapeCotacaoProvider.name);

  constructor(private readonly ssrfGuard: SsrfGuardService) {}

  async buscarCotacoes(contexto: CotacaoQuery): Promise<OfertaComparativo[]> {
    if (!contexto.termo || contexto.termo.trim() === '') {
      return [];
    }

    const termoSimplificado = this.simplificarTermo(contexto.termo);
    const termoEncoded = encodeURIComponent(termoSimplificado);
    const targetUrl = `https://www.buscape.com.br/search?q=${termoEncoded}`;

    try {
      const urlSegura = await this.ssrfGuard.validarEObterUrlSegura(targetUrl);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

      const response = await fetch(urlSegura, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        this.logger.warn(`Buscapé retornou status HTTP ${response.status}`);
        return [];
      }

      const html = await response.text();
      return this.extrairOfertasDoHtml(html, contexto.termo);
    } catch (err: any) {
      this.logger.warn(`Falha na coleta de ofertas Buscapé: ${err.message}`);
      return [];
    }
  }

  private simplificarTermo(termo: string): string {
    // Preserva as palavras principais do item (marca + produto)
    return termo
      .replace(/Italiana/gi, '')
      .replace(/Elétrica/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private extrairOfertasDoHtml(html: string, termoOriginal: string): OfertaComparativo[] {
    const ofertas: OfertaComparativo[] = [];

    const scriptMatch = html.match(/<script[^>]*>(\{"props":[\s\S]*?\}<\/script>)/);
    if (!scriptMatch) return ofertas;

    try {
      const rawJson = scriptMatch[1].replace(/<\/script>$/, '');
      const data = JSON.parse(rawJson);

      const hits = data.props?.initialReduxState?.hits?.hits || [];

      for (const h of hits) {
        if (!h) continue;

        const rawPrice = h.price || h.bestOffer?.price || h.minPrice;
        const precoNum = Number(rawPrice);
        if (isNaN(precoNum) || precoNum <= 0) continue;

        const nomeLoja = h.bestOffer?.merchantName || h.merchantName || h.brand || 'Loja Parceira';
        const urlRelativa = h.bestOffer?.url || h.url || h.permalink;
        const urlLoja = urlRelativa ? (urlRelativa.startsWith('http') ? urlRelativa : `https://www.buscape.com.br${urlRelativa}`) : `https://www.google.com/search?q=${encodeURIComponent(termoOriginal + ' ' + nomeLoja)}`;

        const imagem = h.image?.url || h.image || null;

        ofertas.push({
          titulo: h.name || termoOriginal,
          preco: new Decimal(precoNum.toFixed(2)),
          moeda: 'BRL',
          url: urlLoja,
          fonte: 'WEB',
          vendedor: nomeLoja,
          imagemUrl: typeof imagem === 'string' ? imagem : null,
          coletadoEm: new Date(),
        });

        if (ofertas.length >= 7) break;
      }
    } catch (err: any) {
      this.logger.debug(`Erro ao fazer parse do JSON do Buscapé: ${err.message}`);
    }

    return ofertas;
  }
}
