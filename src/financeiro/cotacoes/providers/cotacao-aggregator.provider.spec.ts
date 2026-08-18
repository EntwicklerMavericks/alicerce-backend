import { CotacaoAggregatorProvider } from './cotacao-aggregator.provider';
import { MercadoLivreCotacaoProvider } from './mercado-livre-cotacao.provider';
import { OpenWebScraperCotacaoProvider } from './open-web-scraper-cotacao.provider';
import { GoogleShoppingCotacaoProvider } from './google-shopping-cotacao.provider';
import { BuscapeCotacaoProvider } from './buscape-cotacao.provider';
import { Decimal } from '@prisma/client/runtime/library';

describe('CotacaoAggregatorProvider', () => {
  let aggregator: CotacaoAggregatorProvider;
  let mlProvider: MercadoLivreCotacaoProvider;
  let webProvider: OpenWebScraperCotacaoProvider;
  let googleProvider: GoogleShoppingCotacaoProvider;
  let buscapeProvider: BuscapeCotacaoProvider;

  beforeEach(() => {
    mlProvider = new MercadoLivreCotacaoProvider();
    webProvider = new OpenWebScraperCotacaoProvider({} as any);
    googleProvider = new GoogleShoppingCotacaoProvider({} as any);
    buscapeProvider = new BuscapeCotacaoProvider({} as any);
    aggregator = new CotacaoAggregatorProvider(mlProvider, webProvider, googleProvider, buscapeProvider);
  });

  it('deve ser definido', () => {
    expect(aggregator).toBeDefined();
  });

  it('deve retornar status PARCIAL se Buscapé funcionar e Scraper falhar', async () => {
    jest.spyOn(buscapeProvider, 'buscarCotacoes').mockResolvedValue([
      {
        titulo: 'Cafeteira Breville Magalu',
        preco: new Decimal(4223.37),
        moeda: 'BRL',
        url: 'https://buscape.com.br/lead',
        fonte: 'WEB',
        vendedor: 'Magazine Luiza',
        imagemUrl: null,
        coletadoEm: new Date(),
      },
    ]);

    jest.spyOn(mlProvider, 'buscarCotacoes').mockResolvedValue([]);
    jest.spyOn(googleProvider, 'buscarCotacoes').mockResolvedValue([]);
    jest.spyOn(webProvider, 'buscarCotacoes').mockRejectedValue(new Error('Timeout de 6s excedido'));

    const res = await aggregator.buscarCotacoesComStatus({
      termo: 'cafeteira breville',
      url: 'https://kabum.com.br/produto/123',
    });

    expect(res.statusColeta).toBe('PARCIAL');
    expect(res.ofertas.length).toBe(1);
    expect(res.ofertas[0].vendedor).toBe('Magazine Luiza');
    expect(res.erros).toContain('Timeout de 6s excedido');
  });
});
