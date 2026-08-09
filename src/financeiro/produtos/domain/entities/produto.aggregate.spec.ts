import { ProdutoAggregate, ImagemProdutoItem } from './produto.aggregate';
import { DomainException } from '../../../domain/exceptions/domain.exception';

describe('ProdutoAggregate', () => {
  const mockImagens: ImagemProdutoItem[] = [
    { id: 'img-1', produtoId: 'prod-1', url: 'http://img1.png', ordem: 0, principal: true, ativo: true },
    { id: 'img-2', produtoId: 'prod-1', url: 'http://img2.png', ordem: 1, principal: false, ativo: true },
    { id: 'img-3', produtoId: 'prod-1', url: 'http://img3.png', ordem: 2, principal: false, ativo: true },
  ];

  it('deve criar um produto válido com imagem principal única', () => {
    const produto = new ProdutoAggregate('prod-1', 'ws-1', 'Torneira Deca', null, null, null, null, true, mockImagens);
    expect(produto.id).toBe('prod-1');
    expect(produto.nome).toBe('Torneira Deca');
    expect(produto.imagemPrincipal?.id).toBe('img-1');
  });

  it('deve alternar a imagem principal exclusivamente para a nova imagem selecionada', () => {
    const produto = new ProdutoAggregate('prod-1', 'ws-1', 'Torneira Deca', null, null, null, null, true, [
      ...mockImagens,
    ]);

    produto.definirImagemPrincipal('img-2');

    expect(produto.imagemPrincipal?.id).toBe('img-2');
    const img1 = produto.imagens.find((i) => i.id === 'img-1');
    const img2 = produto.imagens.find((i) => i.id === 'img-2');
    const img3 = produto.imagens.find((i) => i.id === 'img-3');

    expect(img1?.principal).toBe(false);
    expect(img2?.principal).toBe(true);
    expect(img3?.principal).toBe(false);
  });

  it('deve lançar DomainException se tentar definir imagem principal inexistente ou inativa', () => {
    const produto = new ProdutoAggregate('prod-1', 'ws-1', 'Torneira Deca', null, null, null, null, true, mockImagens);

    expect(() => produto.definirImagemPrincipal('img-invalida')).toThrow(DomainException);
  });

  it('deve lançar DomainException se inicializado com mais de uma imagem principal ativa', () => {
    const imagensInvalidas: ImagemProdutoItem[] = [
      { id: 'img-1', produtoId: 'prod-1', url: 'http://img1.png', ordem: 0, principal: true, ativo: true },
      { id: 'img-2', produtoId: 'prod-1', url: 'http://img2.png', ordem: 1, principal: true, ativo: true },
    ];

    expect(
      () => new ProdutoAggregate('prod-1', 'ws-1', 'Torneira Deca', null, null, null, null, true, imagensInvalidas),
    ).toThrow(DomainException);
  });

  it('deve lançar DomainException se nome for vazio', () => {
    expect(() => new ProdutoAggregate('prod-1', 'ws-1', '   ')).toThrow(DomainException);
  });
});
