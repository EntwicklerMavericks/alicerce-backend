import { Test, TestingModule } from '@nestjs/testing';
import { ProdutosService } from './produtos.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { ConcurrencyConflictException } from '../../domain/exceptions/concurrency-conflict.exception';
import { DomainException } from '../../domain/exceptions/domain.exception';
import { Prisma } from '@prisma/client';

describe('ProdutosService', () => {
  let service: ProdutosService;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = {
      $transaction: jest.fn((callback) => callback(prismaMock)),
      produto: {
        create: jest.fn().mockImplementation((args) =>
          Promise.resolve({ id: 'prod-1', ...args.data, dataCriacao: new Date() }),
        ),
        findFirst: jest.fn().mockImplementation(({ where }) => {
          if (where.id === 'prod-1' && where.workspaceId === 'ws-1' && where.ativo !== false) {
            return Promise.resolve({
              id: 'prod-1',
              workspaceId: 'ws-1',
              nome: 'Torneira Deca',
              descricao: 'Torneira cozinha',
              marca: 'Deca',
              categoriaId: 'cat-1',
              observacoes: null,
              ativo: true,
              categoria: { id: 'cat-1', workspaceId: 'ws-1', nome: 'Metais' },
              imagens: [
                { id: 'img-1', produtoId: 'prod-1', url: 'http://img1.png', ordem: 0, principal: true, ativo: true },
                { id: 'img-2', produtoId: 'prod-1', url: 'http://img2.png', ordem: 1, principal: false, ativo: true },
              ],
              links: [
                {
                  id: 'link-1',
                  produtoId: 'prod-1',
                  lojaId: 'loja-1',
                  url: 'http://loja1.com/torneira',
                  preco: 300,
                  versao: 0,
                  ativo: true,
                  loja: { id: 'loja-1', nome: 'Loja 1', sistema: false, workspaceId: 'ws-1' },
                },
              ],
            });
          }
          return Promise.resolve(null);
        }),
        findMany: jest.fn().mockResolvedValue([]),
        update: jest.fn().mockImplementation((args) =>
          Promise.resolve({ id: args.where.id, ...args.data }),
        ),
      },
      categoria: {
        findFirst: jest.fn().mockImplementation(({ where }) => {
          if (where.id === 'cat-1' && where.workspaceId === 'ws-1') {
            return Promise.resolve({ id: 'cat-1', workspaceId: 'ws-1', nome: 'Metais' });
          }
          return Promise.resolve(null);
        }),
      },
      loja: {
        findFirst: jest.fn().mockImplementation(({ where }) => {
          if (where.id === 'loja-1') {
            return Promise.resolve({ id: 'loja-1', workspaceId: 'ws-1', sistema: false, ativo: true });
          }
          if (where.id === 'loja-sys') {
            return Promise.resolve({ id: 'loja-sys', workspaceId: null, sistema: true, ativo: true });
          }
          return Promise.resolve(null);
        }),
      },
      linkProduto: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where.produtoId_lojaId?.lojaId === 'loja-existente') {
            return Promise.resolve({
              id: 'link-existente',
              produtoId: 'prod-1',
              lojaId: 'loja-existente',
              preco: 250,
              versao: 0,
              ativo: true,
            });
          }
          if (where.produtoId_lojaId?.lojaId === 'loja-inativa') {
            return Promise.resolve({
              id: 'link-inativo',
              produtoId: 'prod-1',
              lojaId: 'loja-inativa',
              preco: 200,
              versao: 1,
              ativo: false,
            });
          }
          return Promise.resolve(null);
        }),
        findFirst: jest.fn().mockImplementation(({ where }) => {
          if (where.id === 'link-1' && where.produtoId === 'prod-1' && where.ativo) {
            return Promise.resolve({
              id: 'link-1',
              produtoId: 'prod-1',
              lojaId: 'loja-1',
              url: 'http://loja1.com/torneira',
              preco: 300,
              versao: 0,
              ativo: true,
            });
          }
          return Promise.resolve(null);
        }),
        create: jest.fn().mockImplementation((args) =>
          Promise.resolve({ id: 'link-novo', ...args.data }),
        ),
        update: jest.fn().mockImplementation((args) =>
          Promise.resolve({ id: args.where.id, ...args.data }),
        ),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      historicoPreco: {
        create: jest.fn().mockResolvedValue({ id: 'hist-1' }),
      },
      imagemProduto: {
        findFirst: jest.fn().mockImplementation(({ where }) => {
          if (where.id === 'img-1' && where.produtoId === 'prod-1') {
            return Promise.resolve({ id: 'img-1', produtoId: 'prod-1', principal: true, ativo: true });
          }
          return Promise.resolve(null);
        }),
        create: jest.fn().mockImplementation((args) =>
          Promise.resolve({ id: 'img-nova', ...args.data }),
        ),
        update: jest.fn().mockImplementation((args) =>
          Promise.resolve({ id: args.where.id, ...args.data }),
        ),
        updateMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProdutosService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ProdutosService>(ProdutosService);
  });

  describe('Matriz de Autorização Cross-Tenant', () => {
    it('deve recusar produto pertencente a outro workspace (NotFoundException)', async () => {
      await expect(service.obterPorId('ws-outro', 'prod-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve recusar categoria pertencente a outro workspace (ForbiddenException)', async () => {
      await expect(
        service.criar('ws-1', { nome: 'Produto', categoriaId: 'cat-invalida' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve recusar vincular loja pertencente a outro workspace (ForbiddenException)', async () => {
      await expect(
        service.vincularLink('ws-1', 'prod-1', {
          lojaId: 'loja-outro-tenant',
          url: 'http://link.com',
          preco: 100,
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Vínculo de Link e Tratamento P2002', () => {
    it('deve lançar ConflictException se o link já existir e estiver ativo', async () => {
      prismaMock.loja.findFirst.mockResolvedValueOnce({
        id: 'loja-existente',
        workspaceId: 'ws-1',
        sistema: false,
        ativo: true,
      });

      await expect(
        service.vincularLink('ws-1', 'prod-1', {
          lojaId: 'loja-existente',
          url: 'http://loja.com',
          preco: 250,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('deve reativar o link e registrar ponto de histórico se o link existia mas estava inativo', async () => {
      prismaMock.loja.findFirst.mockResolvedValueOnce({
        id: 'loja-inativa',
        workspaceId: 'ws-1',
        sistema: false,
        ativo: true,
      });

      const res = await service.vincularLink('ws-1', 'prod-1', {
        lojaId: 'loja-inativa',
        url: 'http://loja.com/reativado',
        preco: 220,
      });

      expect(res).toBeDefined();
      expect(prismaMock.linkProduto.update).toHaveBeenCalled();
      expect(prismaMock.historicoPreco.create).toHaveBeenCalled();
    });

    it('deve criar novo vínculo inédito e gravar HistoricoPreco na mesma transação', async () => {
      prismaMock.loja.findFirst.mockResolvedValueOnce({
        id: 'loja-nova',
        workspaceId: 'ws-1',
        sistema: false,
        ativo: true,
      });

      const res = await service.vincularLink('ws-1', 'prod-1', {
        lojaId: 'loja-nova',
        url: 'http://loja.com/novo',
        preco: 500,
      });

      expect(res).toBeDefined();
      expect(prismaMock.linkProduto.create).toHaveBeenCalled();
      expect(prismaMock.historicoPreco.create).toHaveBeenCalled();
    });

    it('deve reativar atômico caso ocorra P2002 durante o create', async () => {
      prismaMock.loja.findFirst.mockResolvedValueOnce({
        id: 'loja-p2002',
        workspaceId: 'ws-1',
        sistema: false,
        ativo: true,
      });
      // Simula findUnique retornando null primeiro, mas create lançando P2002
      prismaMock.linkProduto.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'link-p2002', ativo: false });

      const errorP2002 = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '5.0.0',
      });
      prismaMock.linkProduto.create.mockRejectedValueOnce(errorP2002);

      const res = await service.vincularLink('ws-1', 'prod-1', {
        lojaId: 'loja-p2002',
        url: 'http://loja.com/p2002',
        preco: 300,
      });

      expect(res).toBeDefined();
      expect(prismaMock.linkProduto.update).toHaveBeenCalled();
    });

    it('deve lançar DomainException se o preço for menor ou igual a zero', async () => {
      await expect(
        service.vincularLink('ws-1', 'prod-1', {
          lojaId: 'loja-1',
          url: 'http://loja.com',
          preco: 0,
        }),
      ).rejects.toThrow(DomainException);
    });
  });

  describe('Atualização de Preço, Optimistic Locking e Idempotência', () => {
    it('deve apenas atualizar ultimaVerificacao sem criar HistoricoPreco se o preço for idêntico ao atual', async () => {
      await service.atualizarPrecoLink('ws-1', 'prod-1', 'link-1', {
        preco: 300, // Mesmo preço atual (300)
        versao: 0,
      });

      expect(prismaMock.linkProduto.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'link-1' },
          data: expect.objectContaining({ ultimaVerificacao: expect.any(Date) }),
        }),
      );
      expect(prismaMock.historicoPreco.create).not.toHaveBeenCalled();
    });

    it('deve aplicar trava de concorrência otimista e gerar histórico se o preço for diferente', async () => {
      await service.atualizarPrecoLink('ws-1', 'prod-1', 'link-1', {
        preco: 280, // Novo preço diferente de 300
        versao: 0,
      });

      expect(prismaMock.linkProduto.updateMany).toHaveBeenCalledWith({
        where: { id: 'link-1', versao: 0 },
        data: expect.objectContaining({
          preco: 280,
          versao: { increment: 1 },
          ultimaVerificacao: expect.any(Date),
        }),
      });
      expect(prismaMock.historicoPreco.create).toHaveBeenCalled();
    });

    it('deve lançar ConcurrencyConflictException se count === 0 na atualização por versao (concorrência)', async () => {
      prismaMock.linkProduto.updateMany.mockResolvedValueOnce({ count: 0 });

      await expect(
        service.atualizarPrecoLink('ws-1', 'prod-1', 'link-1', {
          preco: 280,
          versao: 99, // Versão desatualizada
        }),
      ).rejects.toThrow(ConcurrencyConflictException);
    });
  });

  describe('Definição de Imagem Principal', () => {
    it('deve executar definirImagemPrincipal atômico via prisma.$transaction', async () => {
      await service.definirImagemPrincipal('ws-1', 'prod-1', 'img-2');

      expect(prismaMock.$transaction).toHaveBeenCalled();
      expect(prismaMock.imagemProduto.updateMany).toHaveBeenCalledWith({
        where: { produtoId: 'prod-1', ativo: true },
        data: { principal: false },
      });
      expect(prismaMock.imagemProduto.update).toHaveBeenCalledWith({
        where: { id: 'img-2' },
        data: { principal: true },
      });
    });

    it('deve lançar DomainException se a imagemId for inválida', async () => {
      await expect(
        service.definirImagemPrincipal('ws-1', 'prod-1', 'img-invalida'),
      ).rejects.toThrow(DomainException);
    });
  });

  describe('Soft Delete', () => {
    it('deve inativar produto via soft delete', async () => {
      await service.remover('ws-1', 'prod-1');
      expect(prismaMock.produto.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: { ativo: false },
      });
    });

    it('deve inativar link via soft delete', async () => {
      await service.removerLink('ws-1', 'prod-1', 'link-1');
      expect(prismaMock.linkProduto.update).toHaveBeenCalledWith({
        where: { id: 'link-1' },
        data: { ativo: false },
      });
    });
  });
});
