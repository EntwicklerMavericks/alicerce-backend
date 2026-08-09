import { Test, TestingModule } from '@nestjs/testing';
import { TimelineForecastReadModelService } from './timeline-forecast-read-model.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('TimelineForecastReadModelService', () => {
  let service: TimelineForecastReadModelService;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = {
      carteira: {
        findMany: jest.fn().mockResolvedValue([{ id: 'cart-1' }]),
      },
      movimentacaoFinanceira: {
        aggregate: jest.fn().mockResolvedValue({ _sum: { valor: 1500 } }),
      },
      pessoa: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      regraRecorrencia: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      receita: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      despesa: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      parcelaCartao: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      orcamento: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimelineForecastReadModelService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<TimelineForecastReadModelService>(
      TimelineForecastReadModelService,
    );
  });

  it('1. Deve filtrar eventos da competência atual anteriores ou iguais a referenceDate', async () => {
    const referenceDate = new Date(2026, 7, 15, 12, 0, 0);

    // Despesa pendente em 10/08 (anterior à referenceDate) -> deve ser ignorada no Forecast
    // Despesa pendente em 20/08 (posterior à referenceDate) -> deve ser incluída no Forecast
    prismaMock.despesa.findMany.mockResolvedValue([
      {
        id: 'desp-passada',
        descricao: 'Conta Água Antiga',
        valor: 100,
        dataVencimento: new Date(2026, 7, 10, 10, 0, 0),
        statusDocumento: 'ATIVO',
        statusLiquidacao: 'PENDENTE',
        categoriaId: 'cat-1',
        categoria: { id: 'cat-1', nome: 'Contas da Casa' },
      },
      {
        id: 'desp-futura',
        descricao: 'Conta Luz Futura',
        valor: 200,
        dataVencimento: new Date(2026, 7, 20, 10, 0, 0),
        statusDocumento: 'ATIVO',
        statusLiquidacao: 'PENDENTE',
        categoriaId: 'cat-1',
        categoria: { id: 'cat-1', nome: 'Contas da Casa' },
      },
    ]);

    const res = await service.gerarProjecao('ws-1', referenceDate, 1);
    const eventosMesAtual = res.competencias[0].eventos;

    expect(eventosMesAtual.some((e) => e.id === 'desp-passada')).toBe(false);
    expect(eventosMesAtual.some((e) => e.id === 'desp-futura')).toBe(true);
    expect(res.competencias[0].totalDespesas).toBe(200);
  });

  it('2. Deve decompor Cartão + Recorrência + Fallback de Orçamento corretamente', async () => {
    const referenceDate = new Date(2026, 7, 1, 0, 0, 0);

    // 1. Parcela de Cartão = 200 em Alimentação (Competência 2026-08)
    prismaMock.parcelaCartao.findMany.mockResolvedValue([
      {
        id: 'parc-1',
        competenciaAno: 2026,
        competenciaMes: 8,
        numero: 1,
        valor: 200,
        compra: {
          descricao: 'Supermercado Parcelado',
          categoriaId: 'cat-alimentacao',
          categoria: { id: 'cat-alimentacao', nome: 'Alimentação' },
          cartao: { diaVencimento: 10, workspaceId: 'ws-1', ativo: true },
        },
      },
    ]);

    // 2. Regra de Recorrência = 300 em Alimentação
    prismaMock.regraRecorrencia.findMany.mockResolvedValue([
      {
        id: 'reg-1',
        descricao: 'Feira Mensal',
        valor: 300,
        tipo: 'DESPESA',
        diaVencimento: 15,
        categoriaId: 'cat-alimentacao',
        categoria: { id: 'cat-alimentacao', nome: 'Alimentação' },
        dataInicio: new Date(2026, 0, 1),
      },
    ]);

    // 3. Orçamento = 800 para Alimentação
    prismaMock.orcamento.findMany.mockResolvedValue([
      {
        workspaceId: 'ws-1',
        ano: 2026,
        mes: 8,
        categoriaId: 'cat-alimentacao',
        valorPlanejado: 800,
        categoria: { id: 'cat-alimentacao', nome: 'Alimentação' },
      },
    ]);

    const res = await service.gerarProjecao('ws-1', referenceDate, 1);
    const mesAtual = res.competencias[0];

    // Conhecidos = Cartão (200) + Recorrência (300) = 500
    // Fallback = max(0, 800 - 500) = 300
    const eventFallback = mesAtual.eventos.find(
      (e) => e.fonte === 'ORCAMENTO_FALLBACK',
    );
    expect(eventFallback).toBeDefined();
    expect(eventFallback?.valor).toBe(300);

    // Total despesas = 200 + 300 + 300 = 800
    expect(mesAtual.totalDespesas).toBe(800);

    // Breakdown da Categoria Alimentação
    const bdCat = mesAtual.breakdown.porCategoria.find(
      (c) => c.categoriaId === 'cat-alimentacao',
    );
    expect(bdCat?.total).toBe(800);
    expect(bdCat?.eventosConhecidos).toBe(500);
    expect(bdCat?.fallbackOrcamento).toBe(300);
  });

  it('3. Deve zerar o Fallback quando eventos conhecidos superarem o orçamento', async () => {
    const referenceDate = new Date(2026, 7, 1, 0, 0, 0);

    // Conhecidos = 1100 (600 cartão + 500 recorrência)
    prismaMock.parcelaCartao.findMany.mockResolvedValue([
      {
        id: 'parc-2',
        competenciaAno: 2026,
        competenciaMes: 8,
        numero: 1,
        valor: 600,
        compra: {
          descricao: 'Restaurantes',
          categoriaId: 'cat-alimentacao',
          categoria: { id: 'cat-alimentacao', nome: 'Alimentação' },
          cartao: { diaVencimento: 10, workspaceId: 'ws-1', ativo: true },
        },
      },
    ]);

    prismaMock.regraRecorrencia.findMany.mockResolvedValue([
      {
        id: 'reg-2',
        descricao: 'Mercado Semanal',
        valor: 500,
        tipo: 'DESPESA',
        diaVencimento: 15,
        categoriaId: 'cat-alimentacao',
        categoria: { id: 'cat-alimentacao', nome: 'Alimentação' },
        dataInicio: new Date(2026, 0, 1),
      },
    ]);

    // Orçamento = 800 (menor que os 1100 conhecidos)
    prismaMock.orcamento.findMany.mockResolvedValue([
      {
        workspaceId: 'ws-1',
        ano: 2026,
        mes: 8,
        categoriaId: 'cat-alimentacao',
        valorPlanejado: 800,
        categoria: { id: 'cat-alimentacao', nome: 'Alimentação' },
      },
    ]);

    const res = await service.gerarProjecao('ws-1', referenceDate, 1);
    const mesAtual = res.competencias[0];

    const eventFallback = mesAtual.eventos.find(
      (e) => e.fonte === 'ORCAMENTO_FALLBACK',
    );
    expect(eventFallback).toBeUndefined(); // Fallback = max(0, 800 - 1100) = 0 (nenhum evento fallback gerado)
    expect(mesAtual.totalDespesas).toBe(1100);

    const bdCat = mesAtual.breakdown.porCategoria.find(
      (c) => c.categoriaId === 'cat-alimentacao',
    );
    expect(bdCat?.total).toBe(1100);
    expect(bdCat?.eventosConhecidos).toBe(1100);
    expect(bdCat?.fallbackOrcamento).toBe(0);
  });

  it('4. Deve tratar Aporte/Despesa de Meta como alocação de liquidez (não como EXPENSE)', async () => {
    const referenceDate = new Date(2026, 7, 1, 0, 0, 0);

    prismaMock.despesa.findMany.mockResolvedValue([
      {
        id: 'desp-meta-1',
        descricao: 'Aporte Meta Viagem',
        valor: 500,
        dataVencimento: new Date(2026, 7, 10, 10, 0, 0),
        statusDocumento: 'ATIVO',
        statusLiquidacao: 'PENDENTE',
        categoriaId: 'cat-investimentos',
        categoria: { id: 'cat-investimentos', nome: 'Investimentos' },
        metaId: 'meta-viagem-id',
        meta: { id: 'meta-viagem-id', nome: 'Viagem 2027' },
      },
    ]);

    const res = await service.gerarProjecao('ws-1', referenceDate, 1);
    const mesAtual = res.competencias[0];

    // O valor não deve entrar em totalDespesas (fluxo primário)
    expect(mesAtual.totalDespesas).toBe(0);
    expect(mesAtual.fluxoLiquidoMensal).toBe(0);

    // O valor deve ser computado em alocacaoPatrimonial
    expect(mesAtual.alocacaoPatrimonial).toBe(500);

    const evtMeta = mesAtual.eventos.find((e) => e.metaId === 'meta-viagem-id');
    expect(evtMeta).toBeDefined();
    expect(evtMeta?.tipo).toBe('ALOCACAO_PATRIMONIAL');
  });

  it('5. Deve manter intacto o saldo inicial do Ledger até referenceDate', async () => {
    const referenceDate = new Date(2026, 7, 8, 12, 0, 0);
    prismaMock.movimentacaoFinanceira.aggregate.mockResolvedValue({
      _sum: { valor: 5432.1 },
    });

    const res = await service.gerarProjecao('ws-1', referenceDate, 12);

    // Saldo inicial do relatório deve ser exatamente o retornado pelo Ledger até a referenceDate
    expect(res.saldoInicial).toBe(5432.1);
    expect(res.competencias[0].saldoInicialPeriodo).toBe(5432.1);
    expect(prismaMock.movimentacaoFinanceira.aggregate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          data: { lte: referenceDate },
        }),
      }),
    );
  });

  it('6. Deve processar zero absoluto sem gerar NaN ou Infinity', async () => {
    const referenceDate = new Date(2026, 7, 8, 12, 0, 0);
    prismaMock.movimentacaoFinanceira.aggregate.mockResolvedValue({
      _sum: { valor: null },
    });

    const res = await service.gerarProjecao('ws-1', referenceDate, 12);

    expect(res.saldoInicial).toBe(0);
    expect(res.despesaMediaMensal).toBe(0);
    expect(res.reservaSeguranca).toBe(0);

    res.competencias.forEach((c) => {
      expect(isNaN(c.saldoInicialPeriodo)).toBe(false);
      expect(isNaN(c.totalReceitas)).toBe(false);
      expect(isNaN(c.totalDespesas)).toBe(false);
      expect(isNaN(c.fluxoLiquidoMensal)).toBe(false);
      expect(isNaN(c.saldoProjetadoFinal)).toBe(false);
      expect(isFinite(c.saldoProjetadoFinal)).toBe(true);

      c.breakdown.porCategoria.forEach((bc) => {
        expect(isNaN(bc.percentualDoTotal)).toBe(false);
        expect(isFinite(bc.percentualDoTotal)).toBe(true);
      });

      c.breakdown.porFonte.forEach((bf) => {
        expect(isNaN(bf.percentualDoTotal)).toBe(false);
        expect(isFinite(bf.percentualDoTotal)).toBe(true);
      });

      expect(['SUPERAVIT', 'FOLGA_ESTAVEL', 'ALERTA_APERTO', 'DEFICIT_PROJETADO']).toContain(
        c.zonaSaude,
      );
    });
  });
});
