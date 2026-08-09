import { Test, TestingModule } from '@nestjs/testing';
import { MetasService } from './metas.service';
import { PrismaService } from '../../prisma/prisma.service';
import { MetasReadModelService } from '../read-models/metas-read-model.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('MetasService', () => {
  let service: MetasService;
  let prismaService: any;
  let readModelService: any;

  beforeEach(async () => {
    prismaService = {
      meta: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      aporteMeta: {
        create: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prismaService)),
    };

    readModelService = {
      listarMetasComCalculos: jest.fn(),
      obterMetaDetalhadaPorId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetasService,
        { provide: PrismaService, useValue: prismaService },
        { provide: MetasReadModelService, useValue: readModelService },
      ],
    }).compile();

    service = module.get<MetasService>(MetasService);
  });

  it('deve criar uma meta com sucesso', async () => {
    prismaService.meta.create.mockResolvedValue({
      id: 'meta-1',
      workspaceId: 'ws-1',
      nome: 'Reserva de Emergência',
      valorAlvo: 10000,
      status: 'ATIVA',
    });

    const result = await service.criar('ws-1', {
      nome: 'Reserva de Emergência',
      valorAlvo: 10000,
      prazo: '2026-12-31',
    });

    expect(result.id).toBe('meta-1');
    expect(prismaService.meta.create).toHaveBeenCalled();
  });

  it('deve recusar criação de meta com valorAlvo <= 0', async () => {
    await expect(
      service.criar('ws-1', {
        nome: 'Meta Inválida',
        valorAlvo: 0,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve registrar aporte e transicionar status para CONCLUIDA se atingir o alvo', async () => {
    const metaExistente = {
      id: 'meta-1',
      workspaceId: 'ws-1',
      nome: 'Viagem',
      valorAlvo: 1000,
      status: 'ATIVA',
      prazo: null,
      aportes: [],
    };

    prismaService.meta.findFirst.mockResolvedValue(metaExistente);
    prismaService.aporteMeta.create.mockResolvedValue({
      id: 'ap-1',
      metaId: 'meta-1',
      valor: 1000,
      data: new Date(),
    });

    const aporteResult = await service.registrarAporte('ws-1', 'meta-1', {
      valor: 1000,
      descricao: 'Aporte único total',
    });

    expect(aporteResult.id).toBe('ap-1');
    expect(prismaService.meta.update).toHaveBeenCalledWith({
      where: { id: 'meta-1' },
      data: { status: 'CONCLUIDA' },
    });
  });

  it('deve lançar NotFoundException se a meta não existir ao registrar aporte', async () => {
    prismaService.meta.findFirst.mockResolvedValue(null);

    await expect(
      service.registrarAporte('ws-1', 'meta-inexistente', { valor: 500 }),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve remover meta e seus aportes vinculados', async () => {
    prismaService.meta.findFirst.mockResolvedValue({ id: 'meta-1', workspaceId: 'ws-1' });

    const res = await service.remover('ws-1', 'meta-1');

    expect(res.id).toBe('meta-1');
    expect(prismaService.aporteMeta.deleteMany).toHaveBeenCalledWith({ where: { metaId: 'meta-1' } });
    expect(prismaService.meta.delete).toHaveBeenCalledWith({ where: { id: 'meta-1' } });
  });
});
