import { AlertasEngineService } from './alertas-engine.service';
import { TipoAlerta } from '@prisma/client';

describe('AlertasEngineService', () => {
  let engineService: AlertasEngineService;

  beforeEach(() => {
    // Pure Engine instantiation without NestJS/Prisma dependency
    engineService = new AlertasEngineService();
  });

  it('1. Pure Engine Test (SEM Prisma): deve instanciar e detectar candidatos em memória', () => {
    const contexto = {
      referenceDate: new Date('2026-08-08T12:00:00Z'),
      despesas: [
        {
          id: 'desp-1',
          descricao: 'Aluguel',
          valor: 1500,
          dataVencimento: '2026-08-09T00:00:00Z',
          status: 'PENDENTE',
        },
      ],
      orcamentos: [
        {
          id: 'orc-1',
          categoriaId: 'cat-1',
          categoriaNome: 'Alimentação',
          mes: 8,
          ano: 2026,
          valorPlanejado: 500,
          valorReal: 650,
        },
      ],
    };

    const candidatos = engineService.detectarAlertas(contexto);

    expect(candidatos).toHaveLength(2);
    expect(candidatos).toContainEqual(
      expect.objectContaining({
        tipo: TipoAlerta.CONTA_VENCENDO,
        referenciaId: 'desp-1',
        severidade: 'ALTO',
      }),
    );
    expect(candidatos).toContainEqual(
      expect.objectContaining({
        tipo: TipoAlerta.ORCAMENTO_EXCEDIDO,
        referenciaId: 'orc-1',
        severidade: 'CRITICO',
      }),
    );
  });

  it('2. referenceDate determinística: deve classificar severidade baseada estritamente na data de referência', () => {
    const despesa = {
      id: 'desp-2',
      descricao: 'Internet',
      valor: 120,
      dataVencimento: '2026-08-10T00:00:00Z',
      status: 'PENDENTE',
    };

    // Caso A: referência é 08/08/2026 (vence em 2 dias -> ALTO)
    const contextoNormal = {
      referenceDate: new Date('2026-08-08T12:00:00Z'),
      despesas: [despesa],
    };
    const candNormal = engineService.detectarAlertas(contextoNormal);
    expect(candNormal).toHaveLength(1);
    expect(candNormal[0].severidade).toBe('ALTO');

    // Caso B: referência é 12/08/2026 (já venceu há 2 dias -> CRITICO)
    const contextoAtrasado = {
      referenceDate: new Date('2026-08-12T12:00:00Z'),
      despesas: [despesa],
    };
    const candAtrasado = engineService.detectarAlertas(contextoAtrasado);
    expect(candAtrasado).toHaveLength(1);
    expect(candAtrasado[0].severidade).toBe('CRITICO');
  });

  it('3. Separação Candidato vs Persistência: o engine deve retornar apenas candidatos em memória', () => {
    const contexto = {
      referenceDate: new Date('2026-08-08T12:00:00Z'),
      metas: [
        {
          id: 'meta-1',
          nome: 'Viagem',
          valorAlvo: 5000,
          valorAtual: 5000,
        },
      ],
      wishlist: [
        {
          id: 'wish-1',
          nome: 'Monitor 4K',
          precoAlvo: 2000,
          menorPrecoCotacao: 1800,
        },
      ],
    };

    const candidatos = engineService.detectarAlertas(contexto);

    expect(candidatos).toHaveLength(2);
    expect(candidatos[0]).toHaveProperty('tipo');
    expect(candidatos[0]).toHaveProperty('titulo');
    expect(candidatos[0]).toHaveProperty('mensagem');
    expect(candidatos[0]).toHaveProperty('severidade');
  });
});
