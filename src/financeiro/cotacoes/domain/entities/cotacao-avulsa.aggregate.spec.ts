import { CotacaoAvulsaAggregate } from './cotacao-avulsa.aggregate';
import { DomainException } from '../../../domain/exceptions/domain.exception';

describe('CotacaoAvulsaAggregate', () => {
  const defaultParams = {
    workspaceId: 'ws-123',
    itemWishlistId: 'item-456',
    nomeLoja: 'Loja Teste',
    preco: 150.5,
    url: 'https://loja.com/produto',
    observacoes: 'Promoção de fim de ano',
  };

  it('deve criar uma cotação avulsa com sucesso', () => {
    const cotacao = CotacaoAvulsaAggregate.criar(defaultParams);

    expect(cotacao.id).toBeDefined();
    expect(cotacao.workspaceId).toBe(defaultParams.workspaceId);
    expect(cotacao.itemWishlistId).toBe(defaultParams.itemWishlistId);
    expect(cotacao.nomeLoja).toBe(defaultParams.nomeLoja);
    expect(cotacao.preco).toBe(150.5);
    expect(cotacao.url).toBe(defaultParams.url);
    expect(cotacao.observacoes).toBe(defaultParams.observacoes);
    expect(cotacao.versao).toBe(0);
    expect(cotacao.ativo).toBe(true);
    expect(cotacao.dataCriacao).toBeInstanceOf(Date);
    expect(cotacao.dataAtualizacao).toBeInstanceOf(Date);
  });

  it('deve lançar DomainException se o preço for menor ou igual a zero', () => {
    expect(() =>
      CotacaoAvulsaAggregate.criar({
        ...defaultParams,
        preco: 0,
      }),
    ).toThrow(DomainException);

    expect(() =>
      CotacaoAvulsaAggregate.criar({
        ...defaultParams,
        preco: -10,
      }),
    ).toThrow(DomainException);
  });

  it('deve lançar DomainException se o preço for NaN', () => {
    expect(() =>
      CotacaoAvulsaAggregate.criar({
        ...defaultParams,
        preco: NaN,
      }),
    ).toThrow(DomainException);
  });

  it('deve lançar DomainException se workspaceId for vazio', () => {
    expect(() =>
      CotacaoAvulsaAggregate.criar({
        ...defaultParams,
        workspaceId: '',
      }),
    ).toThrow(DomainException);
  });

  it('deve lançar DomainException se itemWishlistId for vazio', () => {
    expect(() =>
      CotacaoAvulsaAggregate.criar({
        ...defaultParams,
        itemWishlistId: '   ',
      }),
    ).toThrow(DomainException);
  });

  it('deve lançar DomainException se nomeLoja for vazio', () => {
    expect(() =>
      CotacaoAvulsaAggregate.criar({
        ...defaultParams,
        nomeLoja: '',
      }),
    ).toThrow(DomainException);
  });

  it('deve reconstituir um aggregate existente corretamente', () => {
    const dataCriacao = new Date('2026-01-01');
    const dataAtualizacao = new Date('2026-01-02');

    const cotacao = CotacaoAvulsaAggregate.reconstituir({
      id: 'cot-999',
      workspaceId: 'ws-123',
      itemWishlistId: 'item-456',
      nomeLoja: 'Loja Reconstituida',
      preco: 299.99,
      url: null,
      observacoes: null,
      versao: 2,
      ativo: true,
      dataCriacao,
      dataAtualizacao,
    });

    expect(cotacao.id).toBe('cot-999');
    expect(cotacao.nomeLoja).toBe('Loja Reconstituida');
    expect(cotacao.preco).toBe(299.99);
    expect(cotacao.url).toBeNull();
    expect(cotacao.observacoes).toBeNull();
    expect(cotacao.versao).toBe(2);
    expect(cotacao.dataCriacao).toEqual(dataCriacao);
    expect(cotacao.dataAtualizacao).toEqual(dataAtualizacao);
  });

  it('deve atualizar preço validando a invariante de preço > 0', () => {
    const cotacao = CotacaoAvulsaAggregate.criar(defaultParams);
    cotacao.atualizarPreco(120.0);
    expect(cotacao.preco).toBe(120.0);

    expect(() => cotacao.atualizarPreco(0)).toThrow(DomainException);
    expect(() => cotacao.atualizarPreco(-50)).toThrow(DomainException);
  });

  it('deve atualizar dados da loja e observações', () => {
    const cotacao = CotacaoAvulsaAggregate.criar(defaultParams);
    cotacao.atualizarDados({
      nomeLoja: 'Nova Loja',
      url: 'https://novaloja.com',
      observacoes: 'Novas obs',
    });

    expect(cotacao.nomeLoja).toBe('Nova Loja');
    expect(cotacao.url).toBe('https://novaloja.com');
    expect(cotacao.observacoes).toBe('Novas obs');

    expect(() => cotacao.atualizarDados({ nomeLoja: '' })).toThrow(DomainException);
  });

  it('deve desativar a cotação avulsa (soft delete)', () => {
    const cotacao = CotacaoAvulsaAggregate.criar(defaultParams);
    expect(cotacao.ativo).toBe(true);

    cotacao.desativar();
    expect(cotacao.ativo).toBe(false);
  });
});
