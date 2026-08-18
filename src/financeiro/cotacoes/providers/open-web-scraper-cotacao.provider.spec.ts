import { OpenWebScraperCotacaoProvider } from './open-web-scraper-cotacao.provider';
import { SsrfGuardService } from '../domain/services/ssrf-guard.service';
import { Decimal } from '@prisma/client/runtime/library';

describe('OpenWebScraperCotacaoProvider', () => {
  let provider: OpenWebScraperCotacaoProvider;
  let ssrfGuard: SsrfGuardService;

  beforeEach(() => {
    ssrfGuard = new SsrfGuardService();
    provider = new OpenWebScraperCotacaoProvider(ssrfGuard);
  });

  it('deve ser definido', () => {
    expect(provider).toBeDefined();
  });

  describe('extrairPrecoComFallback', () => {
    it('deve extrair preço do JSON-LD em prioridade 1', () => {
      const html = `
        <html>
          <head>
            <script type="application/ld+json">
              {
                "@context": "https://schema.org/",
                "@type": "Product",
                "name": "PlayStation 5 Pro",
                "offers": {
                  "@type": "Offer",
                  "price": "6899.90",
                  "priceCurrency": "BRL"
                }
              }
            </script>
            <meta property="og:price:amount" content="7200.00" />
          </head>
        </html>
      `;

      const res = provider.extrairPrecoComFallback(html);
      expect(res).not.toBeNull();
      expect(res?.fonte).toBe('JSON_LD');
      expect(res?.valor.toNumber()).toBe(6899.9);
    });

    it('deve utilizar OpenGraph og:price:amount em prioridade 3 se não houver JSON-LD', () => {
      const html = `
        <html>
          <head>
            <meta property="og:price:amount" content="6999.00" />
          </head>
        </html>
      `;

      const res = provider.extrairPrecoComFallback(html);
      expect(res).not.toBeNull();
      expect(res?.fonte).toBe('OPEN_GRAPH');
      expect(res?.valor.toNumber()).toBe(6999.0);
    });

    it('deve utilizar fallback R$ do HTML se meta-tags não existirem', () => {
      const html = `
        <html>
          <body>
            <h1>Console PS5 Pro</h1>
            <span class="price">Por apenas R$ 6.499,00 à vista</span>
          </body>
        </html>
      `;

      const res = provider.extrairPrecoComFallback(html);
      expect(res).not.toBeNull();
      expect(res?.fonte).toBe('HTML');
      expect(res?.valor.toNumber()).toBe(6499.0);
    });

    it('deve retornar null se nenhum preço puder ser extraído', () => {
      const html = '<html><body><p>Sem preços disponíveis no momento</p></body></html>';
      const res = provider.extrairPrecoComFallback(html);
      expect(res).toBeNull();
    });
  });
});
