import { ItemWishlistAggregate } from './item-wishlist.aggregate';
import { DomainException } from '../../../domain/exceptions/domain.exception';

describe('ItemWishlistAggregate', () => {
  const workspaceId = 'ws-123';
  const agoraBase = new Date('2026-08-01T10:00:00.000Z');

  describe('Criação', () => {
    it('deve criar um item com esfriamento imutável (inicioEsfriamento e fimEsfriamento)', () => {
      const item = ItemWishlistAggregate.criar({
        workspaceId,
        nome: 'Monitor 4K',
        precoAlvo: 2000,
        diasEsfriamento: 7,
        agora: agoraBase,
      });

      expect(item.id).toBeDefined();
      expect(item.workspaceId).toBe(workspaceId);
      expect(item.nome).toBe('Monitor 4K');
      expect(item.precoAlvo).toBe(2000);
      expect(item.status).toBe('ANALISE');
      expect(item.inicioEsfriamento.toISOString()).toBe('2026-08-01T10:00:00.000Z');
      expect(item.fimEsfriamento.toISOString()).toBe('2026-08-08T10:00:00.000Z');
      expect(item.quebrouEsfriamento).toBe(false);
      expect(item.dataQuebraEsfriamento).toBeNull();
      expect(item.dataConclusao).toBeNull();
    });

    it('deve usar 7 dias por padrão quando diasEsfriamento não for informado', () => {
      const item = ItemWishlistAggregate.criar({
        workspaceId,
        nome: 'Headset Wireless',
        agora: agoraBase,
      });

      expect(item.diasEsfriamento).toBe(7);
      expect(item.fimEsfriamento.toISOString()).toBe('2026-08-08T10:00:00.000Z');
    });

    it('deve lançar DomainException se propriedades obrigatórias forem inválidas', () => {
      expect(() =>
        ItemWishlistAggregate.criar({
          workspaceId: '',
          nome: 'Teste',
        }),
      ).toThrow(DomainException);

      expect(() =>
        ItemWishlistAggregate.criar({
          workspaceId,
          nome: '',
        }),
      ).toThrow(DomainException);
    });
  });

  describe('iniciarCompra', () => {
    it('deve lançar DomainException se estiver em esfriamento e quebrarEsfriamento não for true com a mensagem exata', () => {
      const item = ItemWishlistAggregate.criar({
        workspaceId,
        nome: 'Cadeira Ergonômica',
        precoAlvo: 1500,
        diasEsfriamento: 7,
        agora: agoraBase,
      });

      const duranteEsfriamento = new Date('2026-08-04T10:00:00.000Z');

      expect(() =>
        item.iniciarCompra({
          agora: duranteEsfriamento,
          quebrarEsfriamento: false,
        }),
      ).toThrow(
        'Período de esfriamento ativo. É necessário declarar a quebra explícita do desafio de impulso.',
      );
    });

    it('deve permitir compra durante esfriamento quando quebrarEsfriamento = true e registrar quebra', () => {
      const item = ItemWishlistAggregate.criar({
        workspaceId,
        nome: 'Cadeira Ergonômica',
        precoAlvo: 1500,
        diasEsfriamento: 7,
        agora: agoraBase,
      });

      const duranteEsfriamento = new Date('2026-08-04T10:00:00.000Z');

      item.iniciarCompra({
        agora: duranteEsfriamento,
        quebrarEsfriamento: true,
      });

      expect(item.status).toBe('COMPRADO');
      expect(item.quebrouEsfriamento).toBe(true);
      expect(item.dataQuebraEsfriamento).toEqual(duranteEsfriamento);
      expect(item.dataConclusao).toEqual(duranteEsfriamento);
      expect(item.valorCompra).toBe(1500);
    });

    it('deve determinar valorCompra por precedência: valorCompraInformado -> menorCotacaoAtiva -> precoAlvo', () => {
      // 1. valorCompraInformado ganha
      const item1 = ItemWishlistAggregate.criar({
        workspaceId,
        nome: 'Teclado',
        precoAlvo: 500,
        agora: agoraBase,
      });
      item1.iniciarCompra({
        agora: new Date('2026-08-10T10:00:00.000Z'),
        valorCompraInformado: 450,
        menorCotacaoAtiva: 480,
      });
      expect(item1.valorCompra).toBe(450);

      // 2. menorCotacaoAtiva ganha se valorCompraInformado for undefined/null
      const item2 = ItemWishlistAggregate.criar({
        workspaceId,
        nome: 'Mouse',
        precoAlvo: 300,
        agora: agoraBase,
      });
      item2.iniciarCompra({
        agora: new Date('2026-08-10T10:00:00.000Z'),
        menorCotacaoAtiva: 250,
      });
      expect(item2.valorCompra).toBe(250);

      // 3. precoAlvo ganha se valorCompraInformado e menorCotacaoAtiva forem null/undefined
      const item3 = ItemWishlistAggregate.criar({
        workspaceId,
        nome: 'Webcam',
        precoAlvo: 350,
        agora: agoraBase,
      });
      item3.iniciarCompra({
        agora: new Date('2026-08-10T10:00:00.000Z'),
      });
      expect(item3.valorCompra).toBe(350);
    });

    it('deve lançar DomainException se nenhum valor de compra estiver disponível', () => {
      const item = ItemWishlistAggregate.criar({
        workspaceId,
        nome: 'Item sem preco',
        agora: agoraBase,
      });

      expect(() =>
        item.iniciarCompra({
          agora: new Date('2026-08-10T10:00:00.000Z'),
        }),
      ).toThrow('Nenhum valor de compra disponível para finalizar a compra.');
    });
  });

  describe('desistir', () => {
    it('deve permitir desistência a qualquer momento (durante esfriamento)', () => {
      const item = ItemWishlistAggregate.criar({
        workspaceId,
        nome: 'Smartphone',
        precoAlvo: 3000,
        diasEsfriamento: 14,
        agora: agoraBase,
      });

      const duranteEsfriamento = new Date('2026-08-05T10:00:00.000Z');
      item.desistir({ agora: duranteEsfriamento });

      expect(item.status).toBe('DESISTIDO');
      expect(item.valorEconomizado).toBe(3000);
      expect(item.dataConclusao).toEqual(duranteEsfriamento);
    });

    it('deve congelar snapshot de valorEconomizado por precedência: precoAlvo -> menorCotacaoAtiva -> null', () => {
      // 1. precoAlvo ganha
      const item1 = ItemWishlistAggregate.criar({
        workspaceId,
        nome: 'Tablet',
        precoAlvo: 2000,
        agora: agoraBase,
      });
      item1.desistir({ menorCotacaoAtiva: 1800 });
      expect(item1.valorEconomizado).toBe(2000);

      // 2. menorCotacaoAtiva se precoAlvo for null
      const item2 = ItemWishlistAggregate.criar({
        workspaceId,
        nome: 'Gadget',
        agora: agoraBase,
      });
      item2.desistir({ menorCotacaoAtiva: 150 });
      expect(item2.valorEconomizado).toBe(150);

      // 3. null se nenhum disponível
      const item3 = ItemWishlistAggregate.criar({
        workspaceId,
        nome: 'Serviço',
        agora: agoraBase,
      });
      item3.desistir();
      expect(item3.valorEconomizado).toBeNull();
    });
  });

  describe('Invariantes e Bloqueios em Estados Terminais', () => {
    it('deve transicionar para PLANEJADO com o método planejar()', () => {
      const item = ItemWishlistAggregate.criar({
        workspaceId,
        nome: 'Livro',
        agora: agoraBase,
      });
      item.planejar();
      expect(item.status).toBe('PLANEJADO');
    });

    it('deve permitir vincular e desvincular produto', () => {
      const item = ItemWishlistAggregate.criar({
        workspaceId,
        nome: 'Monitor',
        agora: agoraBase,
      });

      item.vincularProduto('prod-1');
      expect(item.produtoId).toBe('prod-1');

      item.desvincularProduto();
      expect(item.produtoId).toBeNull();
    });

    it('deve bloquear mutações a partir do estado terminal COMPRADO', () => {
      const item = ItemWishlistAggregate.criar({
        workspaceId,
        nome: 'Item',
        precoAlvo: 100,
        agora: agoraBase,
      });
      item.iniciarCompra({ agora: new Date('2026-08-10T10:00:00.000Z') });

      expect(() => item.planejar()).toThrow(DomainException);
      expect(() => item.desistir()).toThrow(DomainException);
      expect(() => item.vincularProduto('p-2')).toThrow(DomainException);
      expect(() => item.desvincularProduto()).toThrow(DomainException);
      expect(() => item.iniciarCompra()).toThrow(DomainException);
      expect(() => item.atualizarDados({ nome: 'Novo Nome' })).toThrow(DomainException);
    });

    it('deve bloquear mutações a partir do estado terminal DESISTIDO', () => {
      const item = ItemWishlistAggregate.criar({
        workspaceId,
        nome: 'Item Desistido',
        precoAlvo: 100,
        agora: agoraBase,
      });
      item.desistir();

      expect(() => item.planejar()).toThrow(DomainException);
      expect(() => item.desistir()).toThrow(DomainException);
      expect(() => item.vincularProduto('p-2')).toThrow(DomainException);
      expect(() => item.desvincularProduto()).toThrow(DomainException);
      expect(() => item.iniciarCompra()).toThrow(DomainException);
      expect(() => item.atualizarDados({ nome: 'Novo Nome' })).toThrow(DomainException);
    });
  });
});
