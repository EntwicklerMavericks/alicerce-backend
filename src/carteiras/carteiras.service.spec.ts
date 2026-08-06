import { Test, TestingModule } from '@nestjs/testing';
import { CarteirasService } from './carteiras.service';
import { PrismaService } from '../prisma/prisma.service';
import { TipoCarteiraEnum } from './dto/criar-carteira.dto';
import { BadRequestException } from '@nestjs/common';

describe('CarteirasService', () => {
  let service: CarteirasService;

  const mockPrisma = {
    $transaction: jest.fn((cb) => cb(mockPrisma)),
    carteira: {
      create: jest.fn(),
      updateMany: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    movimentacaoFinanceira: {
      create: jest.fn(),
      findMany: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    },
    transferenciaCarteira: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarteirasService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CarteirasService>(CarteirasService);
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  it('deve bloquear transferência para a mesma carteira', async () => {
    await expect(
      service.transferirFundos('ws1', 'u1', {
        carteiraOrigemId: 'c1',
        carteiraDestinoId: 'c1',
        valor: 100,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve bloquear transferência com valor negativo ou zero', async () => {
    await expect(
      service.transferirFundos('ws1', 'u1', {
        carteiraOrigemId: 'c1',
        carteiraDestinoId: 'c2',
        valor: -50,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve bloquear transferência que resulte em saldo negativo se permiteSaldoNegativo for false', async () => {
    mockPrisma.carteira.findFirst.mockImplementation(({ where }) => {
      if (where.id === 'c1') {
        return Promise.resolve({
          id: 'c1',
          nome: 'Conta Poupança',
          permiteSaldoNegativo: false,
        });
      }
      return Promise.resolve({ id: 'c2', nome: 'Conta Itaú' });
    });

    mockPrisma.movimentacaoFinanceira.aggregate.mockResolvedValue({
      _sum: { valor: 200 },
    });

    await expect(
      service.transferirFundos('ws1', 'u1', {
        carteiraOrigemId: 'c1',
        carteiraDestinoId: 'c2',
        valor: 500,
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
