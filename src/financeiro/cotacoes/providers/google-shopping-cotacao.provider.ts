import { Injectable, Logger } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime/library';
import { SsrfGuardService } from '../domain/services/ssrf-guard.service';
import { FonteCotacaoProvider } from '../domain/providers/fonte-cotacao.provider';
import { CotacaoQuery, OfertaComparativo } from '../domain/interfaces/cotacao-query.interface';

@Injectable()
export class GoogleShoppingCotacaoProvider implements FonteCotacaoProvider {
  private readonly logger = new Logger(GoogleShoppingCotacaoProvider.name);

  constructor(private readonly ssrfGuard: SsrfGuardService) {}

  async buscarCotacoes(contexto: CotacaoQuery): Promise<OfertaComparativo[]> {
    if (!contexto.termo || contexto.termo.trim() === '') {
      return [];
    }

    const termoSimplificado = this.simplificarTermo(contexto.termo);
    const termoEncoded = encodeURIComponent(termoSimplificado);
    const targetUrl = `https://www.google.com/search?tbm=shop&q=${termoEncoded}&hl=pt-BR&gl=br`;

    try {
      const urlSegura = await this.ssrfGuard.validarEObterUrlSegura(targetUrl);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(urlSegura, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return [];
      }

      const html = await response.text();
      return this.parseHtmlShopping(html, contexto.termo);
    } catch (err: any) {
      this.logger.debug(`Google Shopping search omitido ou indisponível: ${err.message}`);
      return [];
    }
  }

  private simplificarTermo(termo: string): string {
    // Remover termos muito específicos que reduzem a precisão no e-commerce
    return termo
      .replace(/Italiana/gi, '')
      .replace(/Elétrica/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private parseHtmlShopping(html: string, termoOriginal: string): OfertaComparativo[] {
    const ofertas: OfertaComparativo[] = [];

    // Regex para blocos de ofertas de shopping
    // Ex: "R$ 4.799,00" de "Amazon.com.br" ou "Magazine Luiza" ou "Fast Shop"
    const blockRegex = /(?:R\$\s?(\d{1,3}(?:\.\d{3})*,\d{2}))[\s\S]{1,200}?(?:de|em)\s+([A-Za-z0-9\.\-\s]+?)(?:<|\n|"|;)/gi;
    let match: RegExpExecArray | null;

    const lojasVistas = new Set<string>();

    while ((match = blockRegex.exec(html)) !== null && ofertas.length < 5) {
      try {
        const precoStr = match[1].replace(/\./g, '').replace(',', '.');
        const precoNum = Number(precoStr);
        let nomeLoja = match[2].trim();

        if (isNaN(precoNum) || precoNum <= 0 || nomeLoja.length < 3 || nomeLoja.length > 30) {
          continue;
        }

        // Sanitizar nome da loja
        nomeLoja = nomeLoja.replace(/^(de|em|no|na)\s+/i, '').trim();
        if (lojasVistas.has(nomeLoja.toLowerCase())) continue;
        lojasVistas.add(nomeLoja.toLowerCase());

        ofertas.push({
          titulo: `${termoOriginal} em ${nomeLoja}`,
          preco: new Decimal(precoNum.toFixed(2)),
          moeda: 'BRL',
          url: `https://www.google.com/search?q=${encodeURIComponent(termoOriginal + ' ' + nomeLoja)}`,
          fonte: 'WEB',
          vendedor: nomeLoja,
          imagemUrl: null,
          coletadoEm: new Date(),
        });
      } catch (_) {}
    }

    return ofertas;
  }
}
