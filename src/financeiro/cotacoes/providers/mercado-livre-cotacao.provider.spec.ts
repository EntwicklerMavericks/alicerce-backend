import { MercadoLivreCotacaoProvider } from './mercado-livre-cotacao.provider';
import { Decimal } from '@prisma/client/runtime/library';

describe('MercadoLivreCotacaoProvider', () => {
  let provider: MercadoLivreCotacaoProvider;

  beforeEach(() => {
    provider = new MercadoLivreCotacaoProvider();
  });

  it('deve ser definido', () => {
    expect(provider).toBeDefined();
  });

  it('deve retornar array vazio se o termo não for informado', async () => {
    const res = await provider.buscarCotacoes({ termo: '' });
    expect(res).toEqual([]);
  });

  it('deve formatar ofertas retornadas pela API fictícia com Decimal e BRL', async () => {
    const mockResponse = {
      results: [
        {
          id: 'MLB123456',
          title: 'Console PS5 Pro 2TB',
          price: 6499.99,
          permalink: 'https://produto.mercadolivre.com.br/MLB-123456',
          seller: { nickname: 'LOJA_OFICIAL_PLAYSTATION' },
          thumbnail: 'https://http2.mlstatic.com/D_123.jpg',
        },
      ],
    };

    jest.spyOn(global, 'fetch').mockImplementationOnce(
      () =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        }) as any,
    );

    const ofertas = await provider.buscarCotacoes({ termo: 'ps5 pro' });
    expect(ofertas.length).toBe(1);
    expect(ofertas[0].fonte).toBe('MERCADO_LIVRE');
    expect(ofertas[0].moeda).toBe('BRL');
    expect(ofertas[0].vendedor).toBe('LOJA_OFICIAL_PLAYSTATION');
    expect(ofertas[0].preco).toBeInstanceOf(Decimal);
    expect(ofertas[0].preco.toNumber()).toBe(6499.99);
  });
});
