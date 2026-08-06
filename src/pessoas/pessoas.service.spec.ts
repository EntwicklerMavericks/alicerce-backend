import { Test, TestingModule } from '@nestjs/testing';
import { PessoasService } from './pessoas.service';
import { PrismaService } from '../prisma/prisma.service';
import { TipoSalarioEnum } from './dto/criar-pessoa.dto';

describe('PessoasService', () => {
  let service: PessoasService;
  let prisma: PrismaService;

  const mockPrisma = {
    $transaction: jest.fn((cb) => cb(mockPrisma)),
    pessoa: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    configSalario: {
      create: jest.fn(),
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PessoasService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PessoasService>(PessoasService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  it('deve criar uma pessoa com salário FIXO e calcular a renda mensal estimada', async () => {
    mockPrisma.pessoa.create.mockResolvedValue({ id: 'p1', nome: 'Eduardo', parentesco: 'Titular' });
    mockPrisma.configSalario.create.mockResolvedValue({ id: 'cs1', tipo: 'FIXO', valorBase: 8500 });

    const res = await service.criar('ws1', {
      nome: 'Eduardo',
      parentesco: 'Titular',
      configSalario: {
        tipo: TipoSalarioEnum.FIXO,
        valorBase: 8500,
      },
    });

    expect(res.rendaEstimadaMensal).toBe(8500);
  });

  it('deve calcular a renda estimada para salário POR_HORA (R$ 50/h x 8h x 22 dias = R$ 8.800)', async () => {
    mockPrisma.pessoa.create.mockResolvedValue({ id: 'p2', nome: 'Carla', parentesco: 'Cônjuge' });
    mockPrisma.configSalario.create.mockResolvedValue({ id: 'cs2', tipo: 'POR_HORA', valorHora: 50, horasDiarias: 8 });

    const res = await service.criar('ws1', {
      nome: 'Carla',
      parentesco: 'Cônjuge',
      configSalario: {
        tipo: TipoSalarioEnum.POR_HORA,
        valorHora: 50,
        horasDiarias: 8,
        diasTrabalhoMes: 22,
      },
    });

    expect(res.rendaEstimadaMensal).toBe(8800);
  });
});
