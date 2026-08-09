import { Test, TestingModule } from '@nestjs/testing';
import { PlanningOverviewReadModelService } from './planning-overview-read-model.service';
import { TimelineForecastReadModelService } from './timeline-forecast-read-model.service';
import { ProjetosReadModelService } from '../../../projetos/read-models/projetos-read-model.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('PlanningOverviewReadModelService', () => {
  let service: PlanningOverviewReadModelService;
  let prismaMock: any;
  let timelineForecastMock: any;
  let projetosMock: any;

  beforeEach(async () => {
    prismaMock = {
      despesa: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      receita: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      parcelaCartao: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      regraRecorrencia: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      meta: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      orcamento: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      movimentacaoFinanceira: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      faturaCartao: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    timelineForecastMock = {
      gerarProjecao: jest.fn().mockResolvedValue({
        referenceDate: '2026-06-01T00:00:00.000Z',
        saldoInicial: 5000,
        reservaSeguranca: 2000,
        despesaMediaMensal: 2000,
        competencias: [],
      }),
    };

    projetosMock = {
      listarProjetosConsolidados: jest.fn().mockResolvedValue([
        {
          id: 'proj-1',
          workspaceId: 'ws-1',
          nome: 'Projeto Reforma',
          status: 'EM_ANDAMENTO',
          readinessScore: 75,
          coberturaFinanceira: 50,
          progressoFisico: 40,
        },
      ]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanningOverviewReadModelService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: TimelineForecastReadModelService, useValue: timelineForecastMock },
        { provide: ProjetosReadModelService, useValue: projetosMock },
      ],
    }).compile();

    service = module.get<PlanningOverviewReadModelService>(
      PlanningOverviewReadModelService,
    );
  });

  it('1. Deve usar referenceDate determinística e definir período exato de 30 dias', async () => {
    const referenceDateStr = '2026-05-15T10:00:00.000Z';
    const referenceDate = new Date(referenceDateStr);
    const expectedFim = new Date(referenceDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    const res = await service.obterVisaoUnificada('ws-1', referenceDateStr);

    expect(res.referenceDate.toISOString()).toBe(referenceDate.toISOString());
    expect(res.periodo.inicio.toISOString()).toBe(referenceDate.toISOString());
    expect(res.periodo.fim.toISOString()).toBe(expectedFim.toISOString());
  });

  it('2. Deve consumir Read Model Canônico de Forecast e Projetos sem os meandros de re-cálculo', async () => {
    const refDate = new Date('2026-06-01T00:00:00.000Z');

    const res = await service.obterVisaoUnificada('ws-1', refDate);

    expect(timelineForecastMock.gerarProjecao).toHaveBeenCalledWith('ws-1', refDate);
    expect(projetosMock.listarProjetosConsolidados).toHaveBeenCalledWith('ws-1', refDate);
    expect(res.resumoForecast.saldoInicial).toBe(5000);
    expect(res.projetosGargalo).toHaveLength(1);
    expect(res.projetosGargalo[0].id).toBe('proj-1');
  });

  it('3. Deve limitar o calendário de vencimentos a exatamente 30 dias (referenceDate < data <= referenceDate + 30)', async () => {
    const referenceDate = new Date('2026-06-01T00:00:00.000Z');

    prismaMock.despesa.findMany.mockImplementation(({ where }: any) => {
      // Mock do Prisma verificando a query de filtro
      expect(where.dataVencimento.gt).toEqual(referenceDate);
      expect(where.dataVencimento.lte).toEqual(
        new Date(referenceDate.getTime() + 30 * 24 * 60 * 60 * 1000),
      );

      return Promise.resolve([
        {
          id: 'desp-dentro',
          descricao: 'Internet 15/06',
          valor: 150,
          dataVencimento: new Date('2026-06-15T00:00:00.000Z'),
          recorrente: false,
          categoriaId: 'cat-1',
          categoria: { nome: 'Tecnologia' },
        },
        {
          id: 'desp-limite',
          descricao: 'Aluguel 01/07',
          valor: 1200,
          dataVencimento: new Date('2026-07-01T00:00:00.000Z'),
          recorrente: false,
          categoriaId: 'cat-2',
          categoria: { nome: 'Moradia' },
        },
      ]);
    });

    const res = await service.obterVisaoUnificada('ws-1', referenceDate);

    expect(res.calendarioVencimentos).toHaveLength(2);
    expect(res.calendarioVencimentos[0].id).toBe('desp-dentro');
    expect(res.calendarioVencimentos[1].id).toBe('desp-limite');
  });

  it('4. Deve avaliar o status de vencimento baseado em referenceDate', async () => {
    const referenceDate = new Date('2026-06-01T00:00:00.000Z');

    prismaMock.despesa.findMany.mockResolvedValue([
      {
        id: 'desp-futura-pontual',
        descricao: 'Consulta Médica',
        valor: 300,
        dataVencimento: new Date('2026-06-10T00:00:00.000Z'),
        recorrente: false,
        categoriaId: 'cat-saude',
        categoria: { nome: 'Saúde' },
      },
      {
        id: 'desp-recorrente',
        descricao: 'Assinatura Software',
        valor: 50,
        dataVencimento: new Date('2026-06-20T00:00:00.000Z'),
        recorrente: true,
        categoriaId: 'cat-tech',
        categoria: { nome: 'Tech' },
      },
    ]);

    prismaMock.parcelaCartao.findMany.mockResolvedValue([
      {
        id: 'parc-cartao-1',
        numero: 1,
        valor: 100,
        competenciaAno: 2026,
        competenciaMes: 6,
        compra: {
          descricao: 'Teclado Novo',
          qtdParcelas: 3,
          categoriaId: 'cat-tech',
          categoria: { nome: 'Tech' },
          cartao: { diaVencimento: 15, workspaceId: 'ws-1', ativo: true },
        },
      },
    ]);

    const res = await service.obterVisaoUnificada('ws-1', referenceDate);

    const pontual = res.calendarioVencimentos.find((i) => i.id === 'desp-futura-pontual');
    const recorrente = res.calendarioVencimentos.find((i) => i.id === 'desp-recorrente');
    const cartao = res.calendarioVencimentos.find((i) => i.id === 'parc-cartao-1');

    expect(pontual?.status).toBe('PENDENTE');
    expect(recorrente?.status).toBe('PROGRAMADO');
    expect(cartao?.status).toBe('PROGRAMADO');
  });

  it('5. Deve excluir estritamente eventos ocorridos em data <= referenceDate', async () => {
    const referenceDate = new Date('2026-06-01T12:00:00.000Z');

    // Nenhuma despesa ou receita com data <= referenceDate deve ser retornada pela busca de 30 dias
    prismaMock.despesa.findMany.mockImplementation(({ where }: any) => {
      expect(where.dataVencimento.gt).toEqual(referenceDate);
      return Promise.resolve([]);
    });
    prismaMock.receita.findMany.mockImplementation(({ where }: any) => {
      expect(where.data.gt).toEqual(referenceDate);
      return Promise.resolve([]);
    });

    const res = await service.obterVisaoUnificada('ws-1', referenceDate);

    expect(res.calendarioVencimentos).toHaveLength(0);
  });

  it('6. Deve aplicar ordenação determinística de Metas: distancia ASC -> progresso DESC -> dataCriacao ASC -> id ASC', async () => {
    const date1 = new Date('2026-01-01T00:00:00.000Z');
    const date2 = new Date('2026-02-01T00:00:00.000Z');

    prismaMock.meta.findMany.mockResolvedValue([
      {
        id: 'meta-c',
        nome: 'Meta C (Distância maior 200)',
        valorAlvo: 1000,
        status: 'ATIVA',
        prioridade: 1,
        dataCriacao: date1,
        aportes: [{ valor: 800 }], // distancia = 200
      },
      {
        id: 'meta-a',
        nome: 'Meta A (Distância 100, Progresso 90%, Mais recente)',
        valorAlvo: 1000,
        status: 'ATIVA',
        prioridade: 1,
        dataCriacao: date2,
        aportes: [{ valor: 900 }], // distancia = 100, progresso = 90%
      },
      {
        id: 'meta-b',
        nome: 'Meta B (Distância 100, Progresso 80%)',
        valorAlvo: 500,
        status: 'ATIVA',
        prioridade: 1,
        dataCriacao: date1,
        aportes: [{ valor: 400 }], // distancia = 100, progresso = 80%
      },
      {
        id: 'meta-d',
        nome: 'Meta D (Distância 100, Progresso 90%, Mais antiga)',
        valorAlvo: 1000,
        status: 'ATIVA',
        prioridade: 1,
        dataCriacao: date1,
        aportes: [{ valor: 900 }], // distancia = 100, progresso = 90%
      },
    ]);

    const res = await service.obterVisaoUnificada('ws-1', new Date('2026-06-01'));
    const ids = res.metasDestaque.map((m) => m.id);

    // Ordem Esperada:
    // 1. meta-d (distancia 100, progresso 90%, dataCriacao Jan)
    // 2. meta-a (distancia 100, progresso 90%, dataCriacao Feb)
    // 3. meta-b (distancia 100, progresso 80%)
    // 4. meta-c (distancia 200)
    expect(ids).toEqual(['meta-d', 'meta-a', 'meta-b', 'meta-c']);
    expect(res.metasDestaque[0].distancia).toBe(100);
    expect(res.metasDestaque[3].distancia).toBe(200);
  });

  it('7. Deve calcular thresholds exatos e tratar limite zero de orçamentos sem NaN/Infinity', async () => {
    const referenceDate = new Date('2026-06-01T00:00:00.000Z');

    prismaMock.orcamento.findMany.mockResolvedValue([
      {
        id: 'orc-zero-normal',
        categoriaId: 'cat-01',
        valorPlanejado: 0,
        mes: 6,
        ano: 2026,
        categoria: { id: 'cat-01', nome: 'Cat Zero' },
      },
      {
        id: 'orc-zero-excedido',
        categoriaId: 'cat-02',
        valorPlanejado: 0,
        mes: 6,
        ano: 2026,
        categoria: { id: 'cat-02', nome: 'Cat Excedido Zero' },
      },
      {
        id: 'orc-normal',
        categoriaId: 'cat-03',
        valorPlanejado: 1000,
        mes: 6,
        ano: 2026,
        categoria: { id: 'cat-03', nome: 'Cat Normal' },
      },
      {
        id: 'orc-alerta',
        categoriaId: 'cat-04',
        valorPlanejado: 1000,
        mes: 6,
        ano: 2026,
        categoria: { id: 'cat-04', nome: 'Cat Alerta' },
      },
      {
        id: 'orc-atencao',
        categoriaId: 'cat-05',
        valorPlanejado: 1000,
        mes: 6,
        ano: 2026,
        categoria: { id: 'cat-05', nome: 'Cat Atenção' },
      },
      {
        id: 'orc-excedido',
        categoriaId: 'cat-06',
        valorPlanejado: 1000,
        mes: 6,
        ano: 2026,
        categoria: { id: 'cat-06', nome: 'Cat Excedido' },
      },
    ]);

    prismaMock.movimentacaoFinanceira.findMany.mockResolvedValue([
      { referenciaId: 'd-2', referenciaTipo: 'DESPESA', tipo: 'DESPESA', valor: 50 },
      { referenciaId: 'd-3', referenciaTipo: 'DESPESA', tipo: 'DESPESA', valor: 500 },
      { referenciaId: 'd-4', referenciaTipo: 'DESPESA', tipo: 'DESPESA', valor: 750 },
      { referenciaId: 'd-5', referenciaTipo: 'DESPESA', tipo: 'DESPESA', valor: 920 },
      { referenciaId: 'd-6', referenciaTipo: 'DESPESA', tipo: 'DESPESA', valor: 1100 },
    ]);

    prismaMock.despesa.findMany.mockResolvedValue([
      { id: 'd-2', categoriaId: 'cat-02' },
      { id: 'd-3', categoriaId: 'cat-03' },
      { id: 'd-4', categoriaId: 'cat-04' },
      { id: 'd-5', categoriaId: 'cat-05' },
      { id: 'd-6', categoriaId: 'cat-06' },
    ]);

    const res = await service.obterVisaoUnificada('ws-1', referenceDate);

    const zeroNormal = res.orcamentosAlerta.find((o) => o.id === 'orc-zero-normal');
    const zeroExcedido = res.orcamentosAlerta.find((o) => o.id === 'orc-zero-excedido');
    const normal = res.orcamentosAlerta.find((o) => o.id === 'orc-normal');
    const alerta = res.orcamentosAlerta.find((o) => o.id === 'orc-alerta');
    const atencao = res.orcamentosAlerta.find((o) => o.id === 'orc-atencao');
    const excedido = res.orcamentosAlerta.find((o) => o.id === 'orc-excedido');

    expect(zeroNormal?.estado).toBe('NORMAL');
    expect(zeroNormal?.percentualConsumido).toBe(0);

    expect(zeroExcedido?.estado).toBe('EXCEDIDO');
    expect(zeroExcedido?.percentualConsumido).toBe(100);

    expect(normal?.estado).toBe('NORMAL');
    expect(normal?.percentualConsumido).toBe(50);

    expect(alerta?.estado).toBe('ALERTA');
    expect(alerta?.percentualConsumido).toBe(75);

    expect(atencao?.estado).toBe('ATENCAO');
    expect(atencao?.percentualConsumido).toBe(92);

    expect(excedido?.estado).toBe('EXCEDIDO');
    expect(excedido?.percentualConsumido).toBe(110);
  });

  it('8. Deve garantir isolamento multi-tenant e respeitar soft-delete', async () => {
    const referenceDate = new Date('2026-06-01T00:00:00.000Z');

    prismaMock.despesa.findMany.mockImplementation(({ where }: any) => {
      expect(where.workspaceId).toBe('ws-alvo');
      expect(where.dataExclusao).toBeNull();
      return Promise.resolve([]);
    });

    prismaMock.meta.findMany.mockImplementation(({ where }: any) => {
      expect(where.workspaceId).toBe('ws-alvo');
      expect(where.dataExclusao).toBeNull();
      return Promise.resolve([]);
    });

    await service.obterVisaoUnificada('ws-alvo', referenceDate);

    expect(prismaMock.despesa.findMany).toHaveBeenCalled();
    expect(prismaMock.meta.findMany).toHaveBeenCalled();
  });

  it('9. Deve manter isolamento arquitetural e não duplicar regras dos Read Models canônicos', async () => {
    const refDate = new Date('2026-06-01T00:00:00.000Z');

    await service.obterVisaoUnificada('ws-1', refDate);

    // Garante delegacão completa para os serviços sem re-calcular internamente no Overview
    expect(timelineForecastMock.gerarProjecao).toHaveBeenCalledTimes(1);
    expect(projetosMock.listarProjetosConsolidados).toHaveBeenCalledTimes(1);
  });
});
