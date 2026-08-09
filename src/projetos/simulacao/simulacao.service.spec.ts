import { Test, TestingModule } from '@nestjs/testing';
import { SimulacaoService } from './simulacao.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SimulationSnapshotBuilder } from './simulation-snapshot.builder';
import { SimuladorCenariosService } from '../domain/services/simulador-cenarios.service';
import { ProjecaoCronogramaReadModelService } from '../read-models/projecao-cronograma-read-model.service';
import { ScenarioBaselineConflictException } from './exceptions/scenario-baseline-conflict.exception';
import { Decimal } from '@prisma/client/runtime/library';

describe('SimulacaoService', () => {
  let service: SimulacaoService;
  let prismaMock: any;
  let snapshotBuilderMock: any;
  let simuladorEngineMock: any;
  let projecaoReadModelMock: any;

  beforeEach(async () => {
    prismaMock = {
      $transaction: jest.fn((cb) => cb(prismaMock)),
      projeto: {
        findFirst: jest.fn(),
        updateMany: jest.fn(),
      },
      etapaProjeto: {
        updateMany: jest.fn(),
      },
    };

    snapshotBuilderMock = {
      buildSnapshot: jest.fn(),
    };

    simuladorEngineMock = {
      simular: jest.fn(),
    };

    projecaoReadModelMock = {
      formatarProjecaoCronograma: jest.fn(),
      obterProjecaoCronograma: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SimulacaoService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: SimulationSnapshotBuilder, useValue: snapshotBuilderMock },
        { provide: SimuladorCenariosService, useValue: simuladorEngineMock },
        { provide: ProjecaoCronogramaReadModelService, useValue: projecaoReadModelMock },
      ],
    }).compile();

    service = module.get<SimulacaoService>(SimulacaoService);
  });

  it('should run simulation successfully', async () => {
    const mockSnapshot = { referenceDate: new Date(), projeto: { id: 'p1' }, etapas: [] };
    const mockResultadoEngine = { simulado: {}, deltas: {}, gargalo: {} };
    const mockFormatted = { projetoId: 'p1', cronograma: {} };

    snapshotBuilderMock.buildSnapshot.mockResolvedValue(mockSnapshot);
    simuladorEngineMock.simular.mockReturnValue(mockResultadoEngine);
    projecaoReadModelMock.formatarProjecaoCronograma.mockReturnValue(mockFormatted);

    const result = await service.simular('ws-1', 'p1', { aporteMensalGlobal: 1000 });

    expect(snapshotBuilderMock.buildSnapshot).toHaveBeenCalledWith('ws-1', 'p1');
    expect(simuladorEngineMock.simular).toHaveBeenCalledWith(mockSnapshot, { aporteMensalGlobal: 1000 });
    expect(result).toBe(mockFormatted);
  });

  it('should throw ScenarioBaselineConflictException when project version diverges on apply', async () => {
    prismaMock.projeto.findFirst.mockResolvedValue({
      id: 'p1',
      versao: 5, // DB version is 5
      etapas: [],
    });

    await expect(
      service.aplicar('ws-1', 'p1', {
        versaoProjetoEsperada: 4, // Expected version 4 (divergent!)
        parametrosSimulacao: { aporteMensalGlobal: 1000 },
      }),
    ).rejects.toThrow(ScenarioBaselineConflictException);
  });

  it('should throw ScenarioBaselineConflictException when stage version diverges on apply', async () => {
    prismaMock.projeto.findFirst.mockResolvedValue({
      id: 'p1',
      versao: 1,
      etapas: [{ id: 'e1', versao: 3 }],
    });

    await expect(
      service.aplicar('ws-1', 'p1', {
        versaoProjetoEsperada: 1,
        versoesEtapasEsperadas: [{ etapaId: 'e1', versaoEsperada: 2 }], // Expected version 2 vs DB version 3
        parametrosSimulacao: { aporteMensalGlobal: 1000 },
      }),
    ).rejects.toThrow(ScenarioBaselineConflictException);
  });

  it('should apply scenario cleanly when baseline versions match', async () => {
    prismaMock.projeto.findFirst.mockResolvedValue({
      id: 'p1',
      versao: 1,
      etapas: [{ id: 'e1', versao: 2 }],
    });

    prismaMock.projeto.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.etapaProjeto.updateMany.mockResolvedValue({ count: 1 });
    projecaoReadModelMock.obterProjecaoCronograma.mockResolvedValue({ projetoId: 'p1', versao: 2 });

    const result = await service.aplicar('ws-1', 'p1', {
      versaoProjetoEsperada: 1,
      versoesEtapasEsperadas: [{ etapaId: 'e1', versaoEsperada: 2 }],
      parametrosSimulacao: { aporteMensalGlobal: 1000 },
    });

    expect(prismaMock.projeto.updateMany).toHaveBeenCalledWith({
      where: { id: 'p1', workspaceId: 'ws-1', versao: 1, ativo: true },
      data: expect.objectContaining({ versao: { increment: 1 } }),
    });

    expect(result).toEqual({ projetoId: 'p1', versao: 2 });
  });
});
