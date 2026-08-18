import { Injectable, Logger } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { SsrfGuardService } from '../domain/services/ssrf-guard.service';
import { FonteCotacaoProvider } from '../domain/providers/fonte-cotacao.provider';
import {
  CotacaoQuery,
  OfertaComparativo,
  PrecoExtraido,
  FontePrecoExtraidoEnum,
} from '../domain/interfaces/cotacao-query.interface';

@Injectable()
export class OpenWebScraperCotacaoProvider implements FonteCotacaoProvider {
  private readonly logger = new Logger(OpenWebScraperCotacaoProvider.name);

  constructor(private readonly ssrfGuard: SsrfGuardService) {}

  async buscarCotacoes(contexto: CotacaoQuery): Promise<OfertaComparativo[]> {
    if (!contexto.url || contexto.url.trim() === '') {
      return [];
    }

    let urlSegura: string;
    try {
      urlSegura = await this.ssrfGuard.validarEObterUrlSegura(contexto.url);
    } catch (err: any) {
      this.logger.warn(`SSRF Guard bloqueou URL ${contexto.url}: ${err.message}`);
      return [];
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

      const response = await fetch(urlSegura, {
        signal: controller.signal,
        redirect: 'follow', // Interceptado e acompanhado
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        this.logger.warn(`Scraper HTTP ${response.status} para ${urlSegura}`);
        return [];
      }

      // Validação final de SSRF na URL de destino do redirecionamento
      if (response.url && response.url !== urlSegura) {
        await this.ssrfGuard.validarEObterUrlSegura(response.url);
      }

      const html = await response.text();
      const precoExtraido = this.extrairPrecoComFallback(html);

      if (!precoExtraido) {
        this.logger.debug(`Nenhum preço extraído das meta-tags de ${urlSegura}`);
        return [];
      }

      let nomeLoja = 'Loja Web';
      try {
        const parsed = new URL(urlSegura);
        const host = parsed.hostname.replace(/^www\./, '');
        nomeLoja = host.charAt(0).toUpperCase() + host.slice(1);
      } catch (_) {}

      // Extrair título OpenGraph ou fallback
      const tituloMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
      const titulo = tituloMatch ? tituloMatch[1] : contexto.termo || nomeLoja;

      // Extrair imagem OpenGraph
      const imgMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
      const imagemUrl = imgMatch ? imgMatch[1] : null;

      return [
        {
          titulo,
          preco: precoExtraido.valor,
          moeda: 'BRL',
          url: urlSegura,
          fonte: 'WEB',
          vendedor: nomeLoja,
          imagemUrl,
          coletadoEm: new Date(),
        },
      ];
    } catch (err: any) {
      this.logger.error(`Falha no OpenWebScraper para ${contexto.url}: ${err.message}`);
      return [];
    }
  }

  /**
   * Extração determinística de preço com hierarquia estrita de fallbacks:
   * 1. JSON-LD Product.offers.price / lowPrice
   * 2. meta[property="product:price:amount"]
   * 3. meta[property="og:price:amount"]
   * 4. meta[name="twitter:data1"]
   * 5. Fallback HTML Regex
   */
  extrairPrecoComFallback(html: string): PrecoExtraido | null {
    if (!html || html.trim() === '') return null;

    // 1. Fallback JSON-LD Schema.org Product
    const jsonLdRegex = /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi;
    let match: RegExpExecArray | null;

    while ((match = jsonLdRegex.exec(html)) !== null) {
      try {
        const jsonContent = JSON.parse(match[1]);
        const precoJson = this.extrairPrecoFromJsonLd(jsonContent);
        if (precoJson) {
          return {
            valor: precoJson,
            moeda: 'BRL',
            fonte: 'JSON_LD',
          };
        }
      } catch (_) {
        // Ignorar scripts JSON-LD com sintaxe malformada
      }
    }

    // 2. meta product:price:amount
    const productPriceMatch = html.match(/<meta\s+property=["']product:price:amount["']\s+content=["']([^"']+)["']/i);
    if (productPriceMatch) {
      const val = this.parseStringParaDecimal(productPriceMatch[1]);
      if (val) return { valor: val, moeda: 'BRL', fonte: 'OPEN_GRAPH' };
    }

    // 3. meta og:price:amount
    const ogPriceMatch = html.match(/<meta\s+property=["']og:price:amount["']\s+content=["']([^"']+)["']/i);
    if (ogPriceMatch) {
      const val = this.parseStringParaDecimal(ogPriceMatch[1]);
      if (val) return { valor: val, moeda: 'BRL', fonte: 'OPEN_GRAPH' };
    }

    // 4. meta twitter:data1 / twitter:label1
    const twitterPriceMatch = html.match(/<meta\s+name=["']twitter:data1["']\s+content=["']([^"']+)["']/i);
    if (twitterPriceMatch) {
      const val = this.parseStringParaDecimal(twitterPriceMatch[1]);
      if (val) return { valor: val, moeda: 'BRL', fonte: 'TWITTER' };
    }

    // 5. Fallback Regex para R$ 0.000,00 no HTML
    const brlRegex = /R\$\s?(\d{1,3}(?:\.\d{3})*,\d{2})/i;
    const brlMatch = html.match(brlRegex);
    if (brlMatch) {
      const cleanVal = brlMatch[1].replace(/\./g, '').replace(',', '.');
      const val = this.parseStringParaDecimal(cleanVal);
      if (val) return { valor: val, moeda: 'BRL', fonte: 'HTML' };
    }

    return null;
  }

  private extrairPrecoFromJsonLd(obj: any): Decimal | null {
    if (!obj) return null;

    if (Array.isArray(obj)) {
      for (const item of obj) {
        const res = this.extrairPrecoFromJsonLd(item);
        if (res) return res;
      }
      return null;
    }

    if (typeof obj === 'object') {
      if (obj.offers) {
        const offers = Array.isArray(obj.offers) ? obj.offers[0] : obj.offers;
        const price = offers?.price ?? offers?.lowPrice;
        if (price !== undefined && price !== null) {
          return this.parseStringParaDecimal(String(price));
        }
      }
      if (obj.price !== undefined && obj.price !== null) {
        return this.parseStringParaDecimal(String(obj.price));
      }
    }

    return null;
  }

  private parseStringParaDecimal(str: string): Decimal | null {
    if (!str) return null;
    const sanitized = str.replace(/[^\d.,]/g, '').replace(',', '.');
    const num = Number(sanitized);
    if (isNaN(num) || num <= 0) return null;
    return new Decimal(num.toFixed(2));
  }
}
