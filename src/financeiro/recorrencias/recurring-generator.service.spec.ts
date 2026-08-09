import { Test, TestingModule } from '@nestjs/testing';
import { RecurringGeneratorService } from './recurring-generator.service';
import { PrismaService } from '../../prisma/prisma.service';
import { YearMonth } from '../domain/value-objects/year-month.vo';
import { Prisma } from '@prisma/client';

describe('RecurringGeneratorService (Concurrency & Idempotency Test)', () => {
  let service: RecurringGeneratorService;
  let prismaService: PrismaService;

  const mockPrisma = {
    regraRecorrencia: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
    receita: {
      create: jest.fn(),
    },
    despesa: {
      create: jest.fn(),
    },
    execucaoRecorrencia: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecurringGeneratorService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<RecurringGeneratorService>(RecurringGeneratorService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('deve ser idempotente e imune a duplicações ao executar requisições concorrentes simultâneas (Promise.allSettled)', async () => {
    const target = YearMonth.deAnoMes(2026, 8);
    const regraMock = {
      id: 'regra-aluguel-123',
      workspaceId: 'ws-1',
      tipo: 'DESPESA',
      descricao: 'Aluguel',
      valor: new Prisma.Decimal(2500),
      diaVencimento: 10,
      categoriaId: 'cat-1',
      carteiraId: 'cart-1',
      status: 'ATIVA',
      dataInicio: new Date(2026, 0, 1),
      dataFim: null,
    };

    mockPrisma.regraRecorrencia.findMany.mockResolvedValue([regraMock]);

    let jaExecutado = false;
    mockPrisma.$transaction.mockImplementation(async (cb) => {
      if (jaExecutado) {
        // Simula o erro P2002 (Unique constraint failed) do Prisma no segundo thread concorrente
        const error = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: '6.19.3',
        });
        throw error;
      }
      jaExecutado = true;
      return cb(mockPrisma);
    });

    mockPrisma.despesa.create.mockResolvedValue({ id: 'desp-gerada-1' });
    mockPrisma.execucaoRecorrencia.create.mockResolvedValue({ id: 'exec-1' });

    // Dispara 2 chamadas simultâneas via Promise.allSettled (simulando race condition de CRON / Workers)
    const resultados = await Promise.allSettled([
      service.processarCompetencia(target, 'ws-1'),
      service.processarCompetencia(target, 'ws-1'),
    ]);

    expect(resultados[0].status).toBe('fulfilled');
    expect(resultados[1].status).toBe('fulfilled');

    // Apenas 1 lançamento foi contabilizado no total de gerados
    const geradosPrimeira = (resultados[0] as PromiseFulfilledResult<number>).value;
    const geradosSegunda = (resultados[1] as PromiseFulfilledResult<number>).value;

    expect(geradosPrimeira + geradosSegunda).toBe(1);
  });
});
