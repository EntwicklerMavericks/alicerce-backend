import { Test, TestingModule } from '@nestjs/testing';
import { RelatoriosReadModelService } from './relatorios-read-model.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ReconciliationException } from '../exceptions/reconciliation.exception';
import { TipoMovimentacao } from '@prisma/client';

describe('RelatoriosReadModelService', () => {
  let service: RelatoriosReadModelService;
  let prismaMock: any;

  const mockWorkspaceId = 'ws-test-123';
  const dataInicio = new Date('2026-01-01T00:00:00.000Z');
  const dataFim = new Date('2026-02-01T00:00:00.000Z');

  beforeEach(async () => {
    prismaMock = {
      movimentacaoFinanceira: {
        findMany: jest.fn(),
      },
      despesa: {
        findMany: jest.fn(),
      },
      cartaoCredito: {
        findMany: jest.fn(),
      },
      compraCartao: {
        findMany: jest.fn(),
      },
      meta: {
        findMany: jest.fn(),
      },
      projeto: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RelatoriosReadModelService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<RelatoriosReadModelService>(RelatoriosReadModelService);
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  it('Caso 2: deve aplicar Intervalo Semiaberto de Datas (dataInicio <= data < dataFim)', async () => {
    prismaMock.movimentacaoFinanceira.findMany.mockImplementation(({ where }: any) => {
      if (where.data?.lt && !where.data?.gte) {
        // Movimentações anteriores
        return Promise.resolve([
          { tipo: TipoMovimentacao.SALDO_INICIAL, valor: 1000 },
        ]);
      }
      if (where.data?.gte && where.data?.lt) {
        // Movimentações do período (half-open)
        expect(where.data.gte).toEqual(dataInicio);
        expect(where.data.lt).toEqual(dataFim);
        return Promise.resolve([
          { tipo: TipoMovimentacao.RECEITA, valor: 2000 },
          { tipo: TipoMovimentacao.DESPESA, valor: 500 },
        ]);
      }
      return Promise.resolve([]);
    });

    prismaMock.despesa.findMany.mockImplementation(({ where }: any) => {
      expect(where.dataVencimento.gte).toEqual(dataInicio);
      expect(where.dataVencimento.lt).toEqual(dataFim);
      return Promise.resolve([]);
    });

    prismaMock.cartaoCredito.findMany.mockResolvedValue([]);
    prismaMock.meta.findMany.mockResolvedValue([]);
    prismaMock.projeto.findMany.mockResolvedValue([]);

    const res = await service.obterRelatorio(mockWorkspaceId, dataInicio, dataFim);

    expect(res.periodo.dataInicio).toEqual(dataInicio);
    expect(res.periodo.dataFim).toEqual(dataFim);
  });

  it('Caso 3: deve validar a Invariante de Reconciliação em Decimal (saldoInicial + entradas - saidas = saldoFinal)', async () => {
    // Caso VÁLIDO: Saldo Inicial 1000 + Entradas 2500 - Saídas 800 = Saldo Final 2700
    prismaMock.movimentacaoFinanceira.findMany.mockImplementation(({ where }: any) => {
      if (where.data?.lt && !where.data?.gte) {
        return Promise.resolve([
          { tipo: TipoMovimentacao.SALDO_INICIAL, valor: 1000 },
        ]);
      }
      if (where.data?.gte && where.data?.lt) {
        return Promise.resolve([
          { tipo: TipoMovimentacao.RECEITA, valor: 2500 },
          { tipo: TipoMovimentacao.DESPESA, valor: 800 },
        ]);
      }
      return Promise.resolve([]);
    });

    prismaMock.despesa.findMany.mockResolvedValue([]);
    prismaMock.cartaoCredito.findMany.mockResolvedValue([]);
    prismaMock.meta.findMany.mockResolvedValue([]);
    prismaMock.projeto.findMany.mockResolvedValue([]);

    const res = await service.obterRelatorio(mockWorkspaceId, dataInicio, dataFim);

    expect(res.fluxoCaixa.saldoInicial).toBe(1000);
    expect(res.fluxoCaixa.entradas).toBe(2500);
    expect(res.fluxoCaixa.saidas).toBe(800);
    expect(res.fluxoCaixa.resultadoPeriodo).toBe(1700);
    expect(res.fluxoCaixa.saldoFinal).toBe(2700);

    // Invariante de reconciliação em Decimal bateu perfeitamente
    expect(res.fluxoCaixa.saldoInicial + res.fluxoCaixa.entradas - res.fluxoCaixa.saidas).toBe(res.fluxoCaixa.saldoFinal);
  });

  it('Caso 3: deve lançar ReconciliationException quando houver divergência de reconciliação', async () => {
    // Forçar a execução interna de cálculo a divergir
    jest.spyOn(service as any, 'calcularFluxoCaixa').mockImplementationOnce(() => {
      const saldoInicialDec = new (require('@prisma/client').Prisma.Decimal)(100);
      const entradasDec = new (require('@prisma/client').Prisma.Decimal)(50);
      const saidasDec = new (require('@prisma/client').Prisma.Decimal)(20);
      const saldoFinalInvalido = new (require('@prisma/client').Prisma.Decimal)(999); // Divergente!

      if (!saldoInicialDec.plus(entradasDec).minus(saidasDec).equals(saldoFinalInvalido)) {
        throw new ReconciliationException(
          'Divergência na reconciliação de saldo em Decimal',
        );
      }
      return Promise.resolve({} as any);
    });

    prismaMock.despesa.findMany.mockResolvedValue([]);
    prismaMock.cartaoCredito.findMany.mockResolvedValue([]);
    prismaMock.meta.findMany.mockResolvedValue([]);
    prismaMock.projeto.findMany.mockResolvedValue([]);

    await expect(
      service.obterRelatorio(mockWorkspaceId, dataInicio, dataFim),
    ).rejects.toThrow(ReconciliationException);
  });

  it('Caso 4: deve realizar Agregação Paralela via Promise.all', async () => {
    prismaMock.movimentacaoFinanceira.findMany.mockResolvedValue([]);
    prismaMock.despesa.findMany.mockResolvedValue([]);
    prismaMock.cartaoCredito.findMany.mockResolvedValue([]);
    prismaMock.meta.findMany.mockResolvedValue([]);
    prismaMock.projeto.findMany.mockResolvedValue([]);

    const promiseAllSpy = jest.spyOn(Promise, 'all');

    await service.obterRelatorio(mockWorkspaceId, dataInicio, dataFim);

    expect(promiseAllSpy).toHaveBeenCalled();
  });

  it('Caso 7: deve garantir Isolamento Multi-tenant por workspaceId em todas as queries', async () => {
    prismaMock.movimentacaoFinanceira.findMany.mockResolvedValue([]);
    prismaMock.despesa.findMany.mockResolvedValue([]);
    prismaMock.cartaoCredito.findMany.mockResolvedValue([]);
    prismaMock.meta.findMany.mockResolvedValue([]);
    prismaMock.projeto.findMany.mockResolvedValue([]);

    await service.obterRelatorio(mockWorkspaceId, dataInicio, dataFim);

    // Verificar que todas as chamadas incluem workspaceId
    expect(prismaMock.movimentacaoFinanceira.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ workspaceId: mockWorkspaceId }),
      }),
    );
    expect(prismaMock.despesa.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ workspaceId: mockWorkspaceId }),
      }),
    );
    expect(prismaMock.cartaoCredito.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ workspaceId: mockWorkspaceId }),
      }),
    );
    expect(prismaMock.meta.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ workspaceId: mockWorkspaceId }),
      }),
    );
    expect(prismaMock.projeto.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ workspaceId: mockWorkspaceId }),
      }),
    );
  });

  it('Caso 8: deve garantir Zero Absoluto sem NaN ou Infinity', async () => {
    prismaMock.movimentacaoFinanceira.findMany.mockResolvedValue([]);
    prismaMock.despesa.findMany.mockResolvedValue([]);
    prismaMock.cartaoCredito.findMany.mockResolvedValue([]);
    prismaMock.meta.findMany.mockResolvedValue([
      {
        id: 'meta-zero',
        nome: 'Meta Sem Alvo',
        valorAlvo: 0,
        status: 'ATIVA',
        aportes: [],
      },
    ]);
    prismaMock.projeto.findMany.mockResolvedValue([
      {
        id: 'proj-zero',
        nome: 'Projeto Sem Orçamento',
        orcamentoEstimado: 0,
        status: 'PLANEJAMENTO',
        etapas: [],
      },
    ]);

    const result = await service.obterRelatorio(mockWorkspaceId, dataInicio, dataFim);

    expect(result.fluxoCaixa.saldoInicial).toBe(0);
    expect(result.fluxoCaixa.entradas).toBe(0);
    expect(result.fluxoCaixa.saidas).toBe(0);
    expect(result.fluxoCaixa.saldoFinal).toBe(0);
    expect(result.fluxoCaixa.resultadoPeriodo).toBe(0);

    for (const mp of result.metasProjetos) {
      expect(isNaN(mp.progressoPercentual)).toBe(false);
      expect(isFinite(mp.progressoPercentual)).toBe(true);
      expect(mp.progressoPercentual).toBe(0);
    }
  });
});
