import { Decimal } from '@prisma/client/runtime/library';
import { ProjecaoCronogramaReadModelService } from './projecao-cronograma-read-model.service';
import { SimuladorCenariosService } from '../domain/services/simulador-cenarios.service';

describe('ProjecaoCronogramaReadModelService', () => {
  let readModelService: ProjecaoCronogramaReadModelService;
  let mockSnapshotBuilder: any;
  let simuladorEngine: SimuladorCenariosService;

  beforeEach(() => {
    mockSnapshotBuilder = {
      buildSnapshot: jest.fn(),
    };
    simuladorEngine = new SimuladorCenariosService();
    readModelService = new ProjecaoCronogramaReadModelService(
      mockSnapshotBuilder,
      simuladorEngine,
    );
  });

  it('should format schedule projection correctly with simulated parameters', async () => {
    const refDate = new Date('2026-08-01T00:00:00.000Z');
    const snapshot = {
      referenceDate: refDate,
      projeto: {
        id: 'proj-100',
        nome: 'Projeto Teste Projeção',
        versao: 2,
        status: 'PLANEJAMENTO',
        orcamentoEstimado: new Decimal('5000.00'),
        dataInicioPrevista: null,
        dataFimPrevista: null,
      },
      etapas: [
        {
          id: 'etapa-1',
          nome: 'Etapa 1',
          ordem: 1,
          status: 'PENDENTE',
          versao: 1,
          dataInicio: null,
          dataConclusao: null,
          itens: [
            {
              id: 'item-1',
              itemWishlist: {
                id: 'w-1',
                nome: 'Item 1',
                status: 'PLANEJADO',
                preco: new Decimal('2000.00'),
                diasEsfriamento: 14,
                inicioEsfriamento: new Date('2026-08-01T00:00:00.000Z'),
                fimEsfriamento: new Date('2026-08-15T00:00:00.000Z'),
              },
              meta: {
                id: 'm-1',
                nome: 'Meta 1',
                status: 'ATIVA',
                valorAlvo: new Decimal('2000.00'),
                valorAcumulado: new Decimal('500.00'),
              },
            },
          ],
        },
      ],
    };

    mockSnapshotBuilder.buildSnapshot.mockResolvedValue(snapshot);

    const result = await readModelService.obterProjecaoCronograma(
      'ws-1',
      'proj-100',
      {
        aporteMensalGlobal: 1500, // Deficit = 1500. 1500 / 1500 = 1 month for coverage
        dataInicioSimulada: '2026-08-01T00:00:00.000Z',
      },
      refDate,
    );

    expect(result.projetoId).toBe('proj-100');
    expect(result.nome).toBe('Projeto Teste Projeção');
    expect(result.versao).toBe(2);
    expect(result.metricasFinanceiras.custoTotal).toBe(2000);
    expect(result.metricasFinanceiras.valorFinanciadoTotal).toBe(500);
    expect(result.metricasFinanceiras.coberturaPercentual).toBe(25);
    expect(result.etapas[0].mesesParaCobertura).toBe(1);
    expect(result.cronograma.dataConclusaoEstimadaReal).not.toBeNull();
  });
});
