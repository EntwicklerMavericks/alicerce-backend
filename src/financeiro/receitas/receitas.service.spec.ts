import { Test, TestingModule } from '@nestjs/testing';
import { ReceitasService } from './receitas.service';
import { PrismaService } from '../../prisma/prisma.service';
import { LedgerService } from '../ledger/ledger.service';
import { StatusLiquidacao, StatusDocumento } from '@prisma/client';
import { ConflictException } from '@nestjs/common';

describe('ReceitasService', () => {
  let service: ReceitasService;
  let prismaMock: any;
  let ledgerServiceMock: any;

  beforeEach(async () => {
    prismaMock = {
      $transaction: jest.fn((callback) => callback(prismaMock)),
      receita: {
        create: jest.fn().mockImplementation((args) => Promise.resolve({ id: 'rec-1', ...args.data })),
        findFirst: jest.fn().mockImplementation(() =>
          Promise.resolve({
            id: 'rec-1',
            workspaceId: 'ws-1',
            valor: 1000,
            descricao: 'Salário',
            carteiraId: 'cart-1',
            statusLiquidacao: StatusLiquidacao.PENDENTE,
            statusDocumento: StatusDocumento.ATIVO,
          }),
        ),
        findUnique: jest.fn().mockImplementation(() =>
          Promise.resolve({ id: 'rec-1', statusLiquidacao: StatusLiquidacao.LIQUIDADO }),
        ),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        update: jest.fn().mockResolvedValue({ id: 'rec-1', statusDocumento: StatusDocumento.CANCELADO }),
        delete: jest.fn().mockResolvedValue({ id: 'rec-1' }),
      },
    };

    ledgerServiceMock = {
      registrar: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReceitasService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: LedgerService, useValue: ledgerServiceMock },
      ],
    }).compile();

    service = module.get<ReceitasService>(ReceitasService);
  });

  it('deve dar baixa em uma receita e gravar lançamento no Ledger', async () => {
    const res = await service.darBaixa('ws-1', 'rec-1', 'user-1', 'cart-1');
    expect(res).toBeDefined();
    expect(prismaMock.receita.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'rec-1',
        workspaceId: 'ws-1',
        statusLiquidacao: StatusLiquidacao.PENDENTE,
        statusDocumento: StatusDocumento.ATIVO,
      },
      data: expect.objectContaining({
        statusLiquidacao: StatusLiquidacao.LIQUIDADO,
        carteiraId: 'cart-1',
      }),
    });
    expect(ledgerServiceMock.registrar).toHaveBeenCalled();
  });

  it('deve falhar e lançar ConflictException em concorrência se count === 0 (CAS)', async () => {
    let callCount = 0;
    prismaMock.receita.updateMany.mockImplementation(() => {
      callCount++;
      return Promise.resolve({ count: callCount === 1 ? 1 : 0 });
    });

    const [r1, r2] = await Promise.allSettled([
      service.darBaixa('ws-1', 'rec-1', 'user-1', 'cart-1'),
      service.darBaixa('ws-1', 'rec-1', 'user-1', 'cart-1'),
    ]);

    expect(r1.status === 'fulfilled' || r2.status === 'fulfilled').toBe(true);
    expect(r1.status === 'rejected' || r2.status === 'rejected').toBe(true);
  });
});
