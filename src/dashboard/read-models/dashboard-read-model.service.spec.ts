import { Test, TestingModule } from '@nestjs/testing';
import { DashboardReadModelService } from './dashboard-read-model.service';
import { LedgerService } from '../../financeiro/ledger/ledger.service';
import { PlanningOverviewReadModelService } from '../../financeiro/planning/read-models/planning-overview-read-model.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('DashboardReadModelService', () => {
  let service: DashboardReadModelService;
  let ledgerServiceMock: jest.Mocked<Partial<LedgerService>>;
  let planningOverviewServiceMock: jest.Mocked<Partial<PlanningOverviewReadModelService>>;
  let prismaMock: any;

  const mockReferenceDate = new Date('2026-08-01T10:00:00.000Z');
  const mockWorkspaceId = 'ws-test-123';

  const mockMetas = [
    { id: 'meta-1', nome: 'Reserva', valorAlvo: 1000, valorAcumulado: 500, distancia: 500, progressoPercentual: 50, status: 'ATIVA', prioridade: 1, dataCriacao: new Date() },
    { id: 'meta-2', nome: 'Viagem', valorAlvo: 2000, valorAcumulado: 1500, distancia: 500, progressoPercentual: 75, status: 'ATIVA', prioridade: 2, dataCriacao: new Date() },
    { id: 'meta-3', nome: 'Carro', valorAlvo: 5000, valorAcumulado: 1000, distancia: 4000, progressoPercentual: 20, status: 'ATIVA', prioridade: 3, dataCriacao: new Date() },
    { id: 'meta-4', nome: 'Casa', valorAlvo: 10000, valorAcumulado: 1000, distancia: 9000, progressoPercentual: 10, status: 'ATIVA', prioridade: 4, dataCriacao: new Date() },
    { id: 'meta-5', nome: 'Curso', valorAlvo: 500, valorAcumulado: 100, distancia: 400, progressoPercentual: 20, status: 'ATIVA', prioridade: 5, dataCriacao: new Date() },
  ];

  const mockOrcamentos = [
    { id: 'orc-1', categoriaId: 'cat-1', categoriaNome: 'Alimentação', mes: 8, ano: 2026, limite: 1000, valorConsumido: 1200, valorDisponivel: -200, percentualConsumido: 120, estado: 'EXCEDIDO' as const },
    { id: 'orc-2', categoriaId: 'cat-2', categoriaNome: 'Lazer', mes: 8, ano: 2026, limite: 500, valorConsumido: 460, valorDisponivel: 40, percentualConsumido: 92, estado: 'ATENCAO' as const },
  ];

  const mockOverviewResult = {
    referenceDate: mockReferenceDate,
    periodo: { inicio: mockReferenceDate, fim: new Date('2026-08-31') },
    resumoForecast: {
      referenceDate: mockReferenceDate.toISOString(),
      saldoInicial: 5000,
      reservaSeguranca: 2000,
      despesaMediaMensal: 2000,
      competencias: [
        {
          competencia: '2026-08',
          exibicao: '08/2026',
          saldoInicialPeriodo: 5000,
          totalReceitas: 3000,
          totalDespesas: 4000,
          fluxoLiquidoMensal: -1000,
          saldoProjetadoFinal: -500,
          alocacaoPatrimonial: 0,
          zonaSaude: 'DEFICIT_PROJETADO' as const,
          eventos: [],
          breakdown: { porCategoria: [], porFonte: [] },
        },
      ],
    },
    calendarioVencimentos: [],
    projetosGargalo: [],
    metasDestaque: mockMetas,
    orcamentosAlerta: mockOrcamentos,
  };

  beforeEach(async () => {
    ledgerServiceMock = {
      obterSaldoGlobal: jest.fn().mockResolvedValue(3500.50),
    };

    planningOverviewServiceMock = {
      obterVisaoUnificada: jest.fn().mockResolvedValue(mockOverviewResult as any),
    };

    prismaMock = {
      faturaCartao: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'fat-1',
            cartaoId: 'cartao-1',
            mes: 8,
            ano: 2026,
            dataVencimento: new Date('2026-07-25'),
            status: 'ATRASADA',
            valorPago: null,
            cartao: { nome: 'Visa Platinum', cor: '#FF0000', icone: 'credit_card' },
            parcelas: [{ id: 'p1', valor: 450, status: 'FATURADA' }],
          },
        ]),
      },
      despesa: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'desp-atrasada-1',
            descricao: 'Luz',
            valor: 150,
            dataVencimento: new Date('2026-07-20'),
          },
        ]),
      },
      receita: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardReadModelService,
        { provide: LedgerService, useValue: ledgerServiceMock },
        { provide: PlanningOverviewReadModelService, useValue: planningOverviewServiceMock },
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<DashboardReadModelService>(DashboardReadModelService);
  });

  // 1. referenceDate determinística
  it('1. deve utilizar a referenceDate de forma determinística quando informada', async () => {
    const inputDate = '2026-09-15T00:00:00.000Z';
    const result = await service.obterDashboard(mockWorkspaceId, inputDate);

    expect(result.referenceDate.toISOString()).toBe(new Date(inputDate).toISOString());
    expect(ledgerServiceMock.obterSaldoGlobal).toHaveBeenCalledWith(
      mockWorkspaceId,
      new Date(inputDate),
    );
    expect(planningOverviewServiceMock.obterVisaoUnificada).toHaveBeenCalledWith(
      mockWorkspaceId,
      new Date(inputDate),
    );
  });

  // 2. Agregação Paralela Concorrente via Promise.all
  it('2. deve executar consultas agregadas de forma concorrente sem N+1', async () => {
    const result = await service.obterDashboard(mockWorkspaceId, mockReferenceDate);

    expect(ledgerServiceMock.obterSaldoGlobal).toHaveBeenCalledTimes(1);
    expect(planningOverviewServiceMock.obterVisaoUnificada).toHaveBeenCalledTimes(1);
    expect(prismaMock.faturaCartao.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.despesa.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.receita.findMany).toHaveBeenCalledTimes(1);
    expect(result).toBeDefined();
  });

  // 3. Não-duplicação de Regras Canônicas
  it('3. deve garantir a não-duplicação de alertas canônicos em alertasCriticos', async () => {
    const result = await service.obterDashboard(mockWorkspaceId, mockReferenceDate);

    const alertIds = result.alertasCriticos.map((a) => a.id);
    const uniqueIds = new Set(alertIds);
    expect(alertIds.length).toBe(uniqueIds.size);

    const tipos = result.alertasCriticos.map((a) => a.tipo);
    expect(tipos).toContain('DEFICIT_PROJETADO');
    expect(tipos).toContain('ORCAMENTO_EXCEDIDO');
    expect(tipos).toContain('FATURA_VENCIDA');
    expect(tipos).toContain('LANCAMENTO_ATRASADO');
  });

  // 4. Determinismo (mesmo payload para mesma referência)
  it('4. deve ser totalmente determinístico retornando o mesmo payload para a mesma referência', async () => {
    const res1 = await service.obterDashboard(mockWorkspaceId, mockReferenceDate);
    const res2 = await service.obterDashboard(mockWorkspaceId, mockReferenceDate);

    expect(res1).toEqual(res2);
  });

  // 5. Limite Estrito de 3 Metas Prioritárias
  it('5. deve respeitar o limite estrito de no máximo 3 metas prioritárias ativas', async () => {
    const result = await service.obterDashboard(mockWorkspaceId, mockReferenceDate);

    expect(result.metasAtivas.length).toBe(3);
    expect(result.metasAtivas.map((m) => m.id)).toEqual(['meta-1', 'meta-2', 'meta-3']);
  });

  // 6. Zero Absoluto sem NaN/Infinity
  it('6. deve tratar cenários de zero absoluto e valores nulos sem gerar NaN ou Infinity', async () => {
    ledgerServiceMock.obterSaldoGlobal.mockResolvedValue(NaN);
    planningOverviewServiceMock.obterVisaoUnificada.mockResolvedValue({
      ...mockOverviewResult,
      metasDestaque: [],
      orcamentosAlerta: [
        {
          id: 'orc-zero',
          categoriaId: 'cat-z',
          categoriaNome: 'Teste Zero',
          mes: 8,
          ano: 2026,
          limite: 0,
          valorConsumido: 0,
          valorDisponivel: 0,
          percentualConsumido: NaN,
          estado: 'NORMAL',
        },
      ],
    } as any);

    prismaMock.faturaCartao.findMany.mockResolvedValue([
      {
        id: 'fat-zero',
        cartaoId: 'c-0',
        mes: 8,
        ano: 2026,
        dataVencimento: new Date('2026-09-01'),
        status: 'ABERTA',
        valorPago: 0,
        cartao: { nome: 'Cartao Zero', cor: null, icone: null },
        parcelas: [],
      },
    ]);

    const result = await service.obterDashboard(mockWorkspaceId, mockReferenceDate);

    expect(result.saldoGlobal).toBe(0);
    expect(isNaN(result.saldoGlobal)).toBe(false);
    expect(isFinite(result.saldoGlobal)).toBe(true);
    expect(result.faturasAbertas[0].valorTotal).toBe(0);
    expect(isNaN(result.faturasAbertas[0].valorTotal)).toBe(false);
  });

  // 7. Isolamento de Responsabilidades (Arquitetural) com mocks
  it('7. deve manter o isolamento de responsabilidades arquiteturais delegando saldos e overview aos serviços correspondentes', async () => {
    await service.obterDashboard(mockWorkspaceId, mockReferenceDate);

    expect(ledgerServiceMock.obterSaldoGlobal).toHaveBeenCalledWith(
      mockWorkspaceId,
      expect.any(Date),
    );
    expect(planningOverviewServiceMock.obterVisaoUnificada).toHaveBeenCalledWith(
      mockWorkspaceId,
      expect.any(Date),
    );
  });
});
