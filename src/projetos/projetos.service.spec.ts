import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProjetosService } from './projetos.service';
import { ProjetosReadModelService } from './read-models/projetos-read-model.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConcurrencyConflictException } from '../financeiro/domain/exceptions/concurrency-conflict.exception';
import { DomainException } from '../financeiro/domain/exceptions/domain.exception';

describe('ProjetosService', () => {
  let service: ProjetosService;
  let prismaMock: any;
  let readModelMock: any;

  const workspaceId = 'ws-test-123';
  const projetoId = 'proj-test-123';
  const etapaId = 'etapa-test-123';

  beforeEach(async () => {
    prismaMock = {
      projeto: {
        create: jest.fn(),
        findFirst: jest.fn(),
        updateMany: jest.fn(),
      },
      etapaProjeto: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      itemWishlist: {
        findFirst: jest.fn(),
      },
      meta: {
        findFirst: jest.fn(),
      },
      itemProjeto: {
        create: jest.fn(),
        updateMany: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prismaMock)),
    };

    readModelMock = {
      obterProjetoConsolidado: jest.fn(),
      listarProjetosConsolidados: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjetosService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ProjetosReadModelService, useValue: readModelMock },
      ],
    }).compile();

    service = module.get<ProjetosService>(ProjetosService);
  });

  describe('Criacao e Listagem de Projetos', () => {
    it('deve criar um projeto com dados validos', async () => {
      readModelMock.obterProjetoConsolidado.mockResolvedValue({
        id: projetoId,
        nome: 'Projeto Reforma Nova',
      });

      const res = await service.criar(workspaceId, {
        nome: 'Projeto Reforma Nova',
        orcamentoEstimado: 5000,
      });

      expect(prismaMock.projeto.create).toHaveBeenCalled();
      expect(readModelMock.obterProjetoConsolidado).toHaveBeenCalledWith(
        workspaceId,
        expect.any(String),
      );
      expect(res.nome).toBe('Projeto Reforma Nova');
    });

    it('deve listar projetos do workspace via Read Model', async () => {
      readModelMock.listarProjetosConsolidados.mockResolvedValue([
        { id: projetoId, nome: 'Projeto 1' },
      ]);

      const res = await service.listar(workspaceId);

      expect(readModelMock.listarProjetosConsolidados).toHaveBeenCalledWith(workspaceId);
      expect(res.length).toBe(1);
    });
  });

  describe('Reordenamento Sequencial e Trava Otimista de Concorrencia', () => {
    it('deve lancar ConcurrencyConflictException quando a versao do Agregado Pai Projeto for diferente da esperada', async () => {
      prismaMock.projeto.updateMany.mockResolvedValue({ count: 0 });

      await expect(
        service.reordenarEtapas(workspaceId, projetoId, {
          versaoProjetoEsperada: 5,
          etapas: [{ id: etapaId, ordem: 1 }],
        }),
      ).rejects.toThrow(ConcurrencyConflictException);

      expect(prismaMock.projeto.updateMany).toHaveBeenCalledWith({
        where: {
          id: projetoId,
          workspaceId,
          versao: 5,
          ativo: true,
        },
        data: {
          versao: { increment: 1 },
        },
      });
    });

    it('deve reordenar etapas aplicando normalizacao continua (1, 2, 3...) dentro da transacao', async () => {
      prismaMock.projeto.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.etapaProjeto.findMany.mockResolvedValue([
        { id: 'e1', ordem: 1 },
        { id: 'e2', ordem: 2 },
      ]);
      readModelMock.obterProjetoConsolidado.mockResolvedValue({ id: projetoId });

      await service.reordenarEtapas(workspaceId, projetoId, {
        versaoProjetoEsperada: 0,
        etapas: [
          { id: 'e2', ordem: 1 },
          { id: 'e1', ordem: 2 },
        ],
      });

      expect(prismaMock.etapaProjeto.update).toHaveBeenNthCalledWith(1, {
        where: { id: 'e2' },
        data: { ordem: 1, versao: { increment: 1 } },
      });
      expect(prismaMock.etapaProjeto.update).toHaveBeenNthCalledWith(2, {
        where: { id: 'e1' },
        data: { ordem: 2, versao: { increment: 1 } },
      });
    });
  });

  describe('Vinculo XOR e Unicidade Materializada de Itens', () => {
    it('deve validar integridade hierarquica de 3 niveis ao vincular item', async () => {
      prismaMock.projeto.findFirst.mockResolvedValue(null);

      await expect(
        service.vincularItemEtapa(workspaceId, projetoId, etapaId, {
          itemWishlistId: 'w-1',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve vincular item de wishlist gerando chave de vinculo ativo no MySQL', async () => {
      prismaMock.projeto.findFirst.mockResolvedValue({ id: projetoId, workspaceId, ativo: true });
      prismaMock.etapaProjeto.findFirst.mockResolvedValue({ id: etapaId, projetoId, workspaceId, ativo: true });
      prismaMock.itemWishlist.findFirst.mockResolvedValue({ id: 'w-1', workspaceId, ativo: true });
      prismaMock.itemProjeto.create.mockResolvedValue({});
      readModelMock.obterProjetoConsolidado.mockResolvedValue({ id: projetoId });

      await service.vincularItemEtapa(workspaceId, projetoId, etapaId, {
        itemWishlistId: 'w-1',
      });

      expect(prismaMock.itemProjeto.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            etapaId,
            itemWishlistId: 'w-1',
            wishlistVinculoAtivoKey: 'w-1',
            metaVinculoAtivoKey: null,
          }),
        }),
      );
    });

    it('deve capturar erro P2002 do Prisma e lancar DomainException de vinculo duplicado', async () => {
      prismaMock.projeto.findFirst.mockResolvedValue({ id: projetoId, workspaceId, ativo: true });
      prismaMock.etapaProjeto.findFirst.mockResolvedValue({ id: etapaId, projetoId, workspaceId, ativo: true });
      prismaMock.itemWishlist.findFirst.mockResolvedValue({ id: 'w-1', workspaceId, ativo: true });

      const p2002Error: any = new Error('Unique constraint failed');
      p2002Error.code = 'P2002';
      prismaMock.itemProjeto.create.mockRejectedValue(p2002Error);

      await expect(
        service.vincularItemEtapa(workspaceId, projetoId, etapaId, {
          itemWishlistId: 'w-1',
        }),
      ).rejects.toThrow(DomainException);
    });
  });

  describe('Soft Delete de Projeto', () => {
    it('deve desativar o projeto, etapas e itens limpando chaves de vinculo ativo', async () => {
      prismaMock.projeto.findFirst.mockResolvedValue({ id: projetoId, workspaceId, ativo: true });
      prismaMock.etapaProjeto.findMany.mockResolvedValue([{ id: etapaId }]);

      const res = await service.remover(workspaceId, projetoId);

      expect(prismaMock.projeto.updateMany).toHaveBeenCalledWith({
        where: { id: projetoId, workspaceId, ativo: true },
        data: { ativo: false, versao: { increment: 1 } },
      });

      expect(prismaMock.itemProjeto.updateMany).toHaveBeenCalledWith({
        where: { etapaId: { in: [etapaId] }, workspaceId, ativo: true },
        data: {
          ativo: false,
          wishlistVinculoAtivoKey: null,
          metaVinculoAtivoKey: null,
          versao: { increment: 1 },
        },
      });

      expect(res.sucesso).toBe(true);
    });
  });
});
