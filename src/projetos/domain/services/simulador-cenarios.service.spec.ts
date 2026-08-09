import { Decimal } from '@prisma/client/runtime/library';
import {
  SimuladorCenariosService,
  SimulationSnapshot,
  deepFreeze,
} from './simulador-cenarios.service';

describe('SimuladorCenariosService (Pure Domain Engine)', () => {
  let service: SimuladorCenariosService;
  let sampleSnapshot: SimulationSnapshot;

  beforeEach(() => {
    service = new SimuladorCenariosService();

    const refDate = new Date('2026-08-01T00:00:00.000Z');
    sampleSnapshot = {
      referenceDate: refDate,
      projeto: {
        id: 'proj-1',
        nome: 'Reforma da Cozinha',
        versao: 1,
        status: 'PLANEJAMENTO',
        orcamentoEstimado: new Decimal('10000.00'),
        dataInicioPrevista: new Date('2026-08-01T00:00:00.000Z'),
        dataFimPrevista: new Date('2026-12-31T00:00:00.000Z'),
      },
      etapas: [
        {
          id: 'etapa-1',
          nome: 'Demolição e Piso',
          ordem: 1,
          status: 'PENDENTE',
          versao: 1,
          dataInicio: new Date('2026-08-01T00:00:00.000Z'),
          dataConclusao: null,
          itens: [
            {
              id: 'item-1',
              itemWishlist: {
                id: 'wish-1',
                nome: 'Porcelanato',
                status: 'PLANEJADO',
                preco: new Decimal('3000.00'),
                diasEsfriamento: 10,
                inicioEsfriamento: new Date('2026-08-01T00:00:00.000Z'),
                fimEsfriamento: new Date('2026-08-11T00:00:00.000Z'),
              },
              meta: {
                id: 'meta-1',
                nome: 'Reserva Piso',
                status: 'ATIVA',
                valorAlvo: new Decimal('3000.00'),
                valorAcumulado: new Decimal('1000.00'),
              },
            },
          ],
        },
        {
          id: 'etapa-2',
          nome: 'Armários e Eletros',
          ordem: 2,
          status: 'PENDENTE',
          versao: 1,
          dataInicio: null,
          dataConclusao: null,
          itens: [
            {
              id: 'item-2',
              itemWishlist: {
                id: 'wish-2',
                nome: 'Geladeira Inox',
                status: 'PLANEJADO',
                preco: new Decimal('5000.00'),
                diasEsfriamento: 20,
                inicioEsfriamento: new Date('2026-08-01T00:00:00.000Z'),
                fimEsfriamento: new Date('2026-08-21T00:00:00.000Z'),
              },
              meta: {
                id: 'meta-2',
                nome: 'Reserva Eletros',
                status: 'ATIVA',
                valorAlvo: new Decimal('5000.00'),
                valorAcumulado: new Decimal('2000.00'),
              },
            },
          ],
        },
      ],
    };
  });

  it('1. Mutation Invariance: must apply deepFreeze and throw on snapshot mutation attempts', () => {
    service.simular(sampleSnapshot, { aporteMensalGlobal: 1000 });

    expect(Object.isFrozen(sampleSnapshot)).toBe(true);
    expect(Object.isFrozen(sampleSnapshot.etapas)).toBe(true);
    expect(Object.isFrozen(sampleSnapshot.etapas[0])).toBe(true);

    expect(() => {
      (sampleSnapshot.etapas[0] as any).nome = 'Nome Alterado';
    }).toThrow();
  });

  it('2. Structural Determinism: running simulation twice with same snapshot & params produces identical results', () => {
    const params = {
      aporteMensalGlobal: 2000,
      multiplicadorEsfriamento: 0.5,
      dataInicioSimulada: '2026-08-01T00:00:00.000Z',
    };

    const res1 = service.simular(sampleSnapshot, params);
    const res2 = service.simular(sampleSnapshot, params);

    expect(res1).toEqual(res2);
  });

  it('3. Neutral Scenario: parameters == baseline returns identical simulated metrics as baseline', () => {
    const res = service.simular(sampleSnapshot, {
      aporteMensalGlobal: 0,
      multiplicadorEsfriamento: 1.0,
    });

    expect(res.simulado.coberturaPercentual).toEqual(res.baseline.coberturaPercentual);
    expect(res.simulado.readinessPercentual).toEqual(res.baseline.readinessPercentual);
    expect(res.deltas.deltaCobertura).toBe(0);
    expect(res.deltas.deltaReadiness).toBe(0);
  });

  it('4. Dual-Max Rule: dataConclusaoEstimadaReal = MAX(dataCobertura100, dataReadiness100)', () => {
    // Stage 1: deficit = 3000 - 1000 = 2000. Aporte = 2000 => 1 month for coverage (2026-09-01).
    // Readiness: 10 days * 0.5 = 5 days (2026-08-06).
    // MAX(2026-09-01, 2026-08-06) => 2026-09-01 (Coverage driven).
    const res = service.simular(sampleSnapshot, {
      aporteMensalGlobal: 2000,
      multiplicadorEsfriamento: 0.5,
      dataInicioSimulada: '2026-08-01T00:00:00.000Z',
    });

    expect(res.simulado.dataCobertura100).not.toBeNull();
    expect(res.simulado.dataReadiness100).not.toBeNull();

    const cobTime = res.simulado.dataCobertura100!.getTime();
    const readTime = res.simulado.dataReadiness100!.getTime();
    const expectedMax = Math.max(cobTime, readTime);

    expect(res.simulado.dataConclusaoEstimadaReal!.getTime()).toBe(expectedMax);
  });

  it('5. Stage-Mapped Aportes: specific stage overrides global aporte', () => {
    const res = service.simular(sampleSnapshot, {
      aporteMensalGlobal: 500,
      aportesMensaisEtapas: {
        'etapa-1': 2000, // deficit 2000 / 2000 = 1 month
        'etapa-2': 1500, // deficit 3000 / 1500 = 2 months
      },
      dataInicioSimulada: '2026-08-01T00:00:00.000Z',
    });

    expect(res.etapas[0].aporteMensalDisponivel.toNumber()).toBe(2000);
    expect(res.etapas[0].mesesParaCobertura).toBe(1);

    expect(res.etapas[1].aporteMensalDisponivel.toNumber()).toBe(1500);
    expect(res.etapas[1].mesesParaCobertura).toBe(2);
  });

  it('6. Division by Zero Protection: 0 monthly contribution with positive deficit sets dataCobertura100 to null without crashing', () => {
    const res = service.simular(sampleSnapshot, {
      aporteMensalGlobal: 0,
      dataInicioSimulada: '2026-08-01T00:00:00.000Z',
    });

    expect(res.simulado.dataCobertura100).toBeNull();
    expect(res.simulado.dataConclusaoEstimadaReal).toBeNull();
    expect(res.gargalo.criticalStageId).toBe('etapa-1');
    expect(res.gargalo.criticalStageReason).toContain('Gargalo Financeiro Crítico');
  });

  it('7. Division by Zero Protection: project with 0 cost stages handles percentages gracefully', () => {
    const emptySnapshot: SimulationSnapshot = {
      referenceDate: new Date('2026-08-01T00:00:00.000Z'),
      projeto: {
        id: 'proj-empty',
        nome: 'Projeto Vazio',
        versao: 1,
        status: 'PLANEJAMENTO',
        orcamentoEstimado: new Decimal('0.00'),
        dataInicioPrevista: null,
        dataFimPrevista: null,
      },
      etapas: [],
    };

    const res = service.simular(emptySnapshot, { aporteMensalGlobal: 1000 });

    expect(res.simulado.coberturaPercentual).toBe(0);
    expect(res.simulado.readinessPercentual).toBe(0);
    expect(res.simulado.custoTotal.toNumber()).toBe(0);
    expect(res.gargalo.criticalStageId).toBeNull();
  });
});
