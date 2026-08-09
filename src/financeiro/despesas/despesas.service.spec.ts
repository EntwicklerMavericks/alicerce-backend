import { Test, TestingModule } from '@nestjs/testing';
import { DespesasService } from './despesas.service';
import { PrismaService } from '../../prisma/prisma.service';
import { LedgerService } from '../ledger/ledger.service';
import { StatusLiquidacao, StatusDocumento } from '@prisma/client';

describe('DespesasService', () => {
  let service: DespesasService;
  let prismaMock: any;
  let ledgerServiceMock: any;

  beforeEach(async () => {
    prismaMock = {
      $transaction: jest.fn((callback) => callback(prismaMock)),
      despesa: {
        create: jest.fn().mockImplementation((args) => Promise.resolve({ id: 'desp-1', ...args.data })),
        findFirst: jest.fn().mockImplementation(() =>
          Promise.resolve({
            id: 'desp-1',
            workspaceId: 'ws-1',
            valor: 450,
            descricao: 'Mercado',
            carteiraId: 'cart-1',
            statusLiquidacao: StatusLiquidacao.PENDENTE,
            statusDocumento: StatusDocumento.ATIVO,
          }),
        ),
        findUnique: jest.fn().mockImplementation(() =>
          Promise.resolve({ id: 'desp-1', statusLiquidacao: StatusLiquidacao.LIQUIDADO }),
        ),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        update: jest.fn().mockResolvedValue({ id: 'desp-1', statusDocumento: StatusDocumento.CANCELADO }),
        delete: jest.fn().mockResolvedValue({ id: 'desp-1' }),
      },
    };

    ledgerServiceMock = {
      registrar: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DespesasService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: LedgerService, useValue: ledgerServiceMock },
      ],
    }).compile();

    service = module.get<DespesasService>(DespesasService);
  });

  it('deve dar baixa em uma despesa e registrar no Ledger', async () => {
    const res = await service.darBaixa('ws-1', 'desp-1', 'user-1', 'cart-1');
    expect(res).toBeDefined();
    expect(prismaMock.despesa.updateMany).toHaveBeenCalled();
    expect(ledgerServiceMock.registrar).toHaveBeenCalled();
  });
});
