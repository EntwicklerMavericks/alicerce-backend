import { Test, TestingModule } from '@nestjs/testing';
import { LojasService } from './lojas.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('LojasService', () => {
  let service: LojasService;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = {
      loja: {
        create: jest.fn().mockImplementation((args) =>
          Promise.resolve({ id: 'loja-1', ...args.data, dataCriacao: new Date() }),
        ),
        findMany: jest.fn().mockResolvedValue([
          { id: 'loja-1', workspaceId: 'ws-1', nome: 'Leroy Merlin', sistema: false, ativo: true },
          { id: 'loja-sys', workspaceId: null, nome: 'Amazon Global', sistema: true, ativo: true },
        ]),
        findFirst: jest.fn().mockImplementation(({ where }) => {
          if (where.id === 'loja-1') {
            return Promise.resolve({
              id: 'loja-1',
              workspaceId: 'ws-1',
              nome: 'Leroy Merlin',
              sistema: false,
              ativo: true,
              dataCriacao: new Date(),
            });
          }
          if (where.id === 'loja-sys') {
            return Promise.resolve({
              id: 'loja-sys',
              workspaceId: null,
              nome: 'Amazon Global',
              sistema: true,
              ativo: true,
              dataCriacao: new Date(),
            });
          }
          return Promise.resolve(null);
        }),
        update: jest.fn().mockImplementation((args) =>
          Promise.resolve({ id: args.where.id, ...args.data }),
        ),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LojasService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<LojasService>(LojasService);
  });

  it('deve criar uma loja associada ao workspace do usuário (sistema = false)', async () => {
    const res = await service.criar('ws-1', { nome: 'Kalunga' });

    expect(res).toBeDefined();
    expect(prismaMock.loja.create).toHaveBeenCalledWith({
      data: {
        workspaceId: 'ws-1',
        nome: 'Kalunga',
        urlWebsite: null,
        urlLogo: null,
        sistema: false,
        ativo: true,
      },
    });
  });

  it('deve listar lojas do workspace e lojas globais do sistema', async () => {
    const lojas = await service.listarPorWorkspace('ws-1');

    expect(lojas).toHaveLength(2);
    expect(prismaMock.loja.findMany).toHaveBeenCalledWith({
      where: {
        ativo: true,
        OR: [{ workspaceId: 'ws-1' }, { sistema: true }],
      },
      orderBy: { nome: 'asc' },
    });
  });

  it('deve obter loja por id com sucesso', async () => {
    const loja = await service.obterPorId('ws-1', 'loja-1');
    expect(loja.id).toBe('loja-1');
  });

  it('deve lançar NotFoundException se a loja não existir', async () => {
    await expect(service.obterPorId('ws-1', 'loja-inexistente')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('deve atualizar loja do workspace com sucesso', async () => {
    const res = await service.atualizar('ws-1', 'loja-1', { nome: 'Leroy Merlin Express' });
    expect(res.nome).toBe('Leroy Merlin Express');
  });

  it('deve lançar ForbiddenException ao tentar atualizar loja global do sistema', async () => {
    await expect(service.atualizar('ws-1', 'loja-sys', { nome: 'Nome Alterado' })).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('deve remover (soft delete) loja do workspace com sucesso', async () => {
    await service.remover('ws-1', 'loja-1');
    expect(prismaMock.loja.update).toHaveBeenCalledWith({
      where: { id: 'loja-1' },
      data: { ativo: false },
    });
  });

  it('deve lançar ForbiddenException ao tentar remover loja global do sistema', async () => {
    await expect(service.remover('ws-1', 'loja-sys')).rejects.toThrow(
      ForbiddenException,
    );
  });
});
