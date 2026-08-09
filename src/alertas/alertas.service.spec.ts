import { Test, TestingModule } from '@nestjs/testing';
import { AlertasService } from './alertas.service';
import { AlertasEngineService } from './domain/alertas-engine.service';
import { PrismaService } from '../prisma/prisma.service';
import { TipoAlerta, Prisma } from '@prisma/client';

describe('AlertasService', () => {
  let service: AlertasService;
  let engineService: AlertasEngineService;

  const mockPrisma = {
    configAlerta: {
      findMany: jest.fn(),
    },
    alerta: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertasService,
        AlertasEngineService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AlertasService>(AlertasService);
    engineService = module.get<AlertasEngineService>(AlertasEngineService);
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
    expect(engineService).toBeDefined();
  });

  it('4. Idempotência por Chave Formatada: deve formatar a chave de idempotência e ignorar erro P2002', async () => {
    mockPrisma.configAlerta.findMany.mockResolvedValue([]);

    // Simula o Prisma lançando P2002 (erro de restrição de chave única duplicada)
    const p2002Error = new Prisma.PrismaClientKnownRequestError('Duplicate key', {
      code: 'P2002',
      clientVersion: '5.0.0',
    });
    mockPrisma.alerta.create.mockRejectedValue(p2002Error);

    const contexto = {
      referenceDate: new Date('2026-08-08T12:00:00Z'),
      despesas: [
        {
          id: 'desp-100',
          descricao: 'Conta Luz',
          valor: 200,
          dataVencimento: '2026-08-09T00:00:00Z',
          status: 'PENDENTE',
        },
      ],
    };

    const resultado = await service.gerarESalvarAlertas('usr-1', 'ws-1', contexto);

    expect(mockPrisma.alerta.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        usuarioId: 'usr-1',
        workspaceId: 'ws-1',
        chaveIdempotencia: 'usr-1:ws-1:CONTA_VENCENDO:DESPESA:desp-100:2026-08-09',
      }),
    });
    expect(resultado.gerados).toBe(0); // P2002 foi capturado e ignorado
  });

  it('5. Teste de Concorrência Dupla (Paralela Promise.all): deve executar requisições paralelas sem falhar por P2002', async () => {
    mockPrisma.configAlerta.findMany.mockResolvedValue([]);

    // Primeira chamada cria com sucesso, segunda sofre conflito de chave P2002
    let chamadas = 0;
    mockPrisma.alerta.create.mockImplementation(() => {
      chamadas++;
      if (chamadas === 1) {
        return Promise.resolve({
          id: 'alerta-1',
          usuarioId: 'usr-1',
          workspaceId: 'ws-1',
          tipo: TipoAlerta.CONTA_VENCENDO,
        });
      }
      return Promise.reject(
        new Prisma.PrismaClientKnownRequestError('Duplicate key', {
          code: 'P2002',
          clientVersion: '5.0.0',
        }),
      );
    });

    const contexto = {
      referenceDate: new Date('2026-08-08T12:00:00Z'),
      despesas: [
        {
          id: 'desp-concorrencia',
          descricao: 'Internet Fibra',
          valor: 100,
          dataVencimento: '2026-08-09T00:00:00Z',
          status: 'PENDENTE',
        },
      ],
    };

    // Executa duas geracoes paralelas em paralelo com Promise.all
    const [res1, res2] = await Promise.all([
      service.gerarESalvarAlertas('usr-1', 'ws-1', contexto),
      service.gerarESalvarAlertas('usr-1', 'ws-1', contexto),
    ]);

    expect(res1.processados).toBe(1);
    expect(res2.processados).toBe(1);
    expect(res1.gerados + res2.gerados).toBe(1);
  });

  it('6. Opt-In Default: deve gerar alertas se não houver registro em ConfigAlerta', async () => {
    mockPrisma.configAlerta.findMany.mockResolvedValue([]); // Sem nenhuma config
    mockPrisma.alerta.create.mockResolvedValue({
      id: 'alerta-opt-in',
      usuarioId: 'usr-1',
      workspaceId: 'ws-1',
      tipo: TipoAlerta.ORCAMENTO_EXCEDIDO,
    });

    const contexto = {
      referenceDate: new Date('2026-08-08T12:00:00Z'),
      orcamentos: [
        {
          id: 'orc-1',
          categoriaId: 'cat-1',
          categoriaNome: 'Lazer',
          mes: 8,
          ano: 2026,
          valorPlanejado: 300,
          valorReal: 450,
        },
      ],
    };

    const resultado = await service.gerarESalvarAlertas('usr-1', 'ws-1', contexto);

    expect(resultado.filtrados).toBe(1);
    expect(resultado.gerados).toBe(1);
    expect(mockPrisma.alerta.create).toHaveBeenCalled();
  });

  it('7. Respeito a Preferences Desativadas: não deve gerar alertas se ativo = false na ConfigAlerta', async () => {
    mockPrisma.configAlerta.findMany.mockResolvedValue([
      {
        id: 'cfg-1',
        usuarioId: 'usr-1',
        tipo: TipoAlerta.CONTA_VENCENDO,
        ativo: false,
      },
    ]);

    const contexto = {
      referenceDate: new Date('2026-08-08T12:00:00Z'),
      despesas: [
        {
          id: 'desp-desativada',
          descricao: 'Conta Luz',
          valor: 150,
          dataVencimento: '2026-08-09T00:00:00Z',
          status: 'PENDENTE',
        },
      ],
    };

    const resultado = await service.gerarESalvarAlertas('usr-1', 'ws-1', contexto);

    expect(resultado.processados).toBe(1);
    expect(resultado.filtrados).toBe(0);
    expect(resultado.gerados).toBe(0);
    expect(mockPrisma.alerta.create).not.toHaveBeenCalled();
  });

  it('8. Contexto Duplo usuarioId + workspaceId: deve aplicar filtro duplo em todas as operações de banco', async () => {
    mockPrisma.alerta.findMany.mockResolvedValue([]);
    await service.listarAlertas('usr-123', 'ws-456', {});

    expect(mockPrisma.alerta.findMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        usuarioId: 'usr-123',
        workspaceId: 'ws-456',
      }),
    });

    mockPrisma.alerta.findFirst.mockResolvedValue({
      id: 'alt-1',
      usuarioId: 'usr-123',
      workspaceId: 'ws-456',
    });
    mockPrisma.alerta.update.mockResolvedValue({ id: 'alt-1', lido: true });

    await service.marcarComoLido('usr-123', 'ws-456', 'alt-1');

    expect(mockPrisma.alerta.findFirst).toHaveBeenCalledWith({
      where: expect.objectContaining({
        id: 'alt-1',
        usuarioId: 'usr-123',
        workspaceId: 'ws-456',
      }),
    });
  });

  it('9. Contagem de Não Lidos: deve retornar a contagem correta com isolamento de tenant', async () => {
    mockPrisma.alerta.count.mockResolvedValue(7);

    const res = await service.contarNaoLidos('usr-777', 'ws-888');

    expect(res).toEqual({ count: 7 });
    expect(mockPrisma.alerta.count).toHaveBeenCalledWith({
      where: {
        usuarioId: 'usr-777',
        workspaceId: 'ws-888',
        lido: false,
      },
    });
  });

  it('10. Operação Atômica ler-todos: deve atualizar todos os alertas não lidos do workspace com updateMany', async () => {
    mockPrisma.alerta.updateMany.mockResolvedValue({ count: 4 });

    const res = await service.marcarTodosComoLidos('usr-1', 'ws-1');

    expect(res).toEqual({ count: 4 });
    expect(mockPrisma.alerta.updateMany).toHaveBeenCalledWith({
      where: {
        usuarioId: 'usr-1',
        workspaceId: 'ws-1',
        lido: false,
      },
      data: {
        lido: true,
        dataLeitura: expect.any(Date),
      },
    });
  });

  it('deve listar e ordenar alertas deterministicamente (severidade DESC, dataDisparo DESC, id ASC)', async () => {
    const dataRef1 = new Date('2026-08-08T10:00:00Z');
    const dataRef2 = new Date('2026-08-08T12:00:00Z');

    mockPrisma.alerta.findMany.mockResolvedValue([
      {
        id: 'b-alerta',
        tipo: TipoAlerta.META_ATINGIDA, // MEDIO
        dataDisparo: dataRef2,
      },
      {
        id: 'a-alerta',
        tipo: TipoAlerta.ORCAMENTO_EXCEDIDO, // CRITICO
        dataDisparo: dataRef1,
      },
      {
        id: 'c-alerta',
        tipo: TipoAlerta.CONTA_VENCENDO, // CRITICO
        dataDisparo: dataRef2,
      },
    ]);

    const res = await service.listarAlertas('usr-1', 'ws-1', {});

    expect(res.data).toHaveLength(3);
    // 1º: c-alerta (CRITICO, dataDisparo 12:00)
    // 2º: a-alerta (CRITICO, dataDisparo 10:00)
    // 3º: b-alerta (MEDIO)
    expect(res.data[0].id).toBe('c-alerta');
    expect(res.data[1].id).toBe('a-alerta');
    expect(res.data[2].id).toBe('b-alerta');
  });
});
