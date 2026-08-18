import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { CotacoesService } from '../cotacoes/cotacoes.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConcurrencyConflictException } from '../domain/exceptions/concurrency-conflict.exception';
import { DomainException } from '../domain/exceptions/domain.exception';

describe('WishlistService', () => {
  let service: WishlistService;
  let prismaService: any;

  const workspaceId = 'workspace-alpha';
  const outroWorkspaceId = 'workspace-beta';

  const itemMockBase = {
    id: 'item-1',
    workspaceId,
    produtoId: null,
    nome: 'Notebook Gamer',
    descricao: 'High performance',
    precoAlvo: 5000,
    valorCompra: null,
    valorEconomizado: null,
    prioridade: 'ALTA',
    diasEsfriamento: 7,
    inicioEsfriamento: new Date('2026-08-01T10:00:00.000Z'),
    fimEsfriamento: new Date('2026-08-08T10:00:00.000Z'),
    status: 'ANALISE',
    quebrouEsfriamento: false,
    dataQuebraEsfriamento: null,
    dataConclusao: null,
    versao: 0,
    ativo: true,
    dataCriacao: new Date('2026-08-01T10:00:00.000Z'),
    dataAtualizacao: new Date('2026-08-01T10:00:00.000Z'),
    produto: null,
    cotacoes: [],
  };

  const produtoMock = {
    id: 'prod-100',
    workspaceId,
    nome: 'Notebook Asus',
    categoriaId: 'cat-tech',
    ativo: true,
  };

  const produtoOutroWorkspace = {
    id: 'prod-999',
    workspaceId: outroWorkspaceId,
    nome: 'Notebook Alienware',
    categoriaId: 'cat-tech',
    ativo: true,
  };

  beforeEach(async () => {
    const mockPrisma = {
      itemWishlist: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        updateMany: jest.fn(),
      },
      produto: {
        findFirst: jest.fn(),
      },
      despesa: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      categoria: {
        findFirst: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(mockPrisma)),
    };

    const mockCotacoesService = {
      buscarEGravarCotacoesSobDemanda: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WishlistService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: CotacoesService,
          useValue: mockCotacoesService,
        },
      ],
    }).compile();

    service = module.get<WishlistService>(WishlistService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('criar', () => {
    it('deve criar um item na wishlist com inicioEsfriamento e fimEsfriamento calculados', async () => {
      prismaService.itemWishlist.create.mockResolvedValue(itemMockBase);

      const res = await service.criar(workspaceId, {
        nome: 'Notebook Gamer',
        precoAlvo: 5000,
        diasEsfriamento: 7,
      });

      expect(prismaService.itemWishlist.create).toHaveBeenCalled();
      expect(res.id).toBe('item-1');
      expect(res.tempoRestanteEsfriamento).toBeDefined();
    });
  });

  describe('Isolamento Multi-Tenant em vincularProduto', () => {
    it('deve recusar vínculo de produto pertencente a outro workspace', async () => {
      prismaService.produto.findFirst.mockResolvedValue(produtoOutroWorkspace);

      await expect(
        service.vincularProduto(workspaceId, 'item-1', { produtoId: 'prod-999' }),
      ).rejects.toThrow(DomainException);

      expect(prismaService.itemWishlist.updateMany).not.toHaveBeenCalled();
    });

    it('deve vincular produto com sucesso quando pertence ao mesmo workspace', async () => {
      prismaService.produto.findFirst.mockResolvedValue(produtoMock);
      prismaService.itemWishlist.findFirst.mockResolvedValue(itemMockBase);
      prismaService.itemWishlist.updateMany.mockResolvedValue({ count: 1 });

      const itemAtualizado = { ...itemMockBase, produtoId: 'prod-100', produto: produtoMock };
      prismaService.itemWishlist.findFirst.mockResolvedValueOnce(itemMockBase).mockResolvedValueOnce(itemAtualizado);

      const res = await service.vincularProduto(workspaceId, 'item-1', { produtoId: 'prod-100' });

      expect(prismaService.itemWishlist.updateMany).toHaveBeenCalledWith({
        where: { id: 'item-1', workspaceId, versao: 0, ativo: true },
        data: { produtoId: 'prod-100', versao: { increment: 1 } },
      });
      expect(res.produtoId).toBe('prod-100');
    });
  });

  describe('concluirCompra e Idempotência no Ledger', () => {
    it('deve concluir a compra, criar Despesa no Ledger com origemWishlistId e atualizar item em transação', async () => {
      const itemSemEsfriamento = {
        ...itemMockBase,
        inicioEsfriamento: new Date('2026-07-01T10:00:00.000Z'),
        fimEsfriamento: new Date('2026-07-08T10:00:00.000Z'),
      };

      prismaService.despesa.findUnique.mockResolvedValue(null);
      prismaService.itemWishlist.findFirst.mockResolvedValue(itemSemEsfriamento);
      prismaService.categoria.findFirst.mockResolvedValue({ id: 'cat-geral' });
      prismaService.despesa.create.mockResolvedValue({ id: 'desp-1' });
      prismaService.itemWishlist.updateMany.mockResolvedValue({ count: 1 });

      const itemComprado = {
        ...itemSemEsfriamento,
        status: 'COMPRADO',
        valorCompra: 5000,
        versao: 1,
      };
      prismaService.itemWishlist.findFirst
        .mockResolvedValueOnce(itemSemEsfriamento)
        .mockResolvedValueOnce(itemComprado);

      const res = await service.concluirCompra(workspaceId, 'item-1', {
        valorCompraInformado: 5000,
      });

      expect(prismaService.despesa.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          workspaceId,
          origemWishlistId: 'item-1',
          valor: 5000,
          status: 'PAGA',
        }),
      });

      expect(prismaService.itemWishlist.updateMany).toHaveBeenCalledWith({
        where: { id: 'item-1', workspaceId, versao: 0, ativo: true },
        data: expect.objectContaining({
          status: 'COMPRADO',
          valorCompra: 5000,
          versao: { increment: 1 },
        }),
      });

      expect(res.status).toBe('COMPRADO');
    });

    it('deve garantir idempotência sem duplicar despesa se despesa com origemWishlistId já existir', async () => {
      const despesaExistente = { id: 'desp-1', origemWishlistId: 'item-1' };
      prismaService.despesa.findUnique.mockResolvedValue(despesaExistente);
      prismaService.itemWishlist.findFirst.mockResolvedValue({
        ...itemMockBase,
        status: 'COMPRADO',
      });

      await service.concluirCompra(workspaceId, 'item-1', {});

      expect(prismaService.despesa.create).not.toHaveBeenCalled();
    });
  });

  describe('Concorrência Otimista (Optimistic Locking)', () => {
    it('deve lançar ConcurrencyConflictException se updated.count === 0', async () => {
      prismaService.itemWishlist.findFirst.mockResolvedValue(itemMockBase);
      prismaService.itemWishlist.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.desistir(workspaceId, 'item-1')).rejects.toThrow(
        ConcurrencyConflictException,
      );
    });
  });

  describe('desistir', () => {
    it('deve transicionar status para DESISTIDO e congelar snapshot de valorEconomizado', async () => {
      prismaService.itemWishlist.findFirst.mockResolvedValue(itemMockBase);
      prismaService.itemWishlist.updateMany.mockResolvedValue({ count: 1 });

      const itemDesistido = {
        ...itemMockBase,
        status: 'DESISTIDO',
        valorEconomizado: 5000,
        dataConclusao: new Date(),
        versao: 1,
      };
      prismaService.itemWishlist.findFirst
        .mockResolvedValueOnce(itemMockBase)
        .mockResolvedValueOnce(itemDesistido);

      const res = await service.desistir(workspaceId, 'item-1');

      expect(res.status).toBe('DESISTIDO');
      expect(res.valorEconomizado).toBe(5000);
    });
  });

  describe('remover (Soft Delete)', () => {
    it('deve marcar ativo = false no banco de dados', async () => {
      prismaService.itemWishlist.findFirst.mockResolvedValue(itemMockBase);
      prismaService.itemWishlist.updateMany.mockResolvedValue({ count: 1 });

      const res = await service.remover(workspaceId, 'item-1');

      expect(prismaService.itemWishlist.updateMany).toHaveBeenCalledWith({
        where: { id: 'item-1', workspaceId, ativo: true },
        data: { ativo: false, versao: { increment: 1 } },
      });
      expect(res.sucesso).toBe(true);
    });
  });
});
