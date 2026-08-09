import { Test, TestingModule } from '@nestjs/testing';
import { OrcamentosService } from './orcamentos.service';
import { PrismaService } from '../../prisma/prisma.service';
import { OrcamentosReadModelService } from '../read-models/orcamentos-read-model.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('OrcamentosService', () => {
  let service: OrcamentosService;
  let prismaService: any;
  let readModelService: any;

  beforeEach(async () => {
    prismaService = {
      categoria: {
        findUnique: jest.fn(),
      },
      orcamento: {
        upsert: jest.fn(),
        findFirst: jest.fn(),
        delete: jest.fn(),
      },
    };

    readModelService = {
      obterOrcamentosComConsumo: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrcamentosService,
        { provide: PrismaService, useValue: prismaService },
        { provide: OrcamentosReadModelService, useValue: readModelService },
      ],
    }).compile();

    service = module.get<OrcamentosService>(OrcamentosService);
  });

  it('deve criar ou atualizar um orçamento válido', async () => {
    prismaService.categoria.findUnique.mockResolvedValue({ id: 'cat-1', nome: 'Alimentação' });
    prismaService.orcamento.upsert.mockResolvedValue({
      id: 'orc-1',
      workspaceId: 'ws-1',
      categoriaId: 'cat-1',
      mes: 8,
      ano: 2026,
      valorPlanejado: 1500,
    });

    const result = await service.criarOuAtualizar('ws-1', {
      categoriaId: 'cat-1',
      mes: 8,
      ano: 2026,
      teto: 1500,
    });

    expect(result.id).toBe('orc-1');
    expect(prismaService.orcamento.upsert).toHaveBeenCalled();
  });

  it('deve lançar BadRequestException se teto for <= 0', async () => {
    await expect(
      service.criarOuAtualizar('ws-1', {
        categoriaId: 'cat-1',
        mes: 8,
        ano: 2026,
        teto: 0,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve lançar NotFoundException se a categoria não existir', async () => {
    prismaService.categoria.findUnique.mockResolvedValue(null);

    await expect(
      service.criarOuAtualizar('ws-1', {
        categoriaId: 'cat-inexistente',
        mes: 8,
        ano: 2026,
        teto: 1000,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve remover um orçamento existente', async () => {
    prismaService.orcamento.findFirst.mockResolvedValue({ id: 'orc-1', workspaceId: 'ws-1' });
    prismaService.orcamento.delete.mockResolvedValue({ id: 'orc-1' });

    const res = await service.remover('ws-1', 'orc-1');

    expect(res.id).toBe('orc-1');
    expect(prismaService.orcamento.delete).toHaveBeenCalledWith({ where: { id: 'orc-1' } });
  });
});
