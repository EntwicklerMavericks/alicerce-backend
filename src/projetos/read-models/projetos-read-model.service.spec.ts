import { ProjetosReadModelService } from './projetos-read-model.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ProjetosReadModelService', () => {
  let service: ProjetosReadModelService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      projeto: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
    };
    service = new ProjetosReadModelService(mockPrisma as unknown as PrismaService);
  });

  describe('Zero Division Protection & Financial Calculations', () => {
    it('deve retornar CoberturaFinanceira = 0 quando custoEstimadoCalculado for 0 (protecao divisao por zero)', () => {
      const projetoMock = {
        id: 'proj-1',
        workspaceId: 'ws-1',
        nome: 'Projeto Sem Custo',
        orcamentoEstimado: 1000,
        status: 'PLANEJAMENTO',
        prioridade: 1,
        versao: 0,
        ativo: true,
        etapas: [],
      };

      const result = service.calcularConsolidadoProjeto(projetoMock);

      expect(result.custoEstimadoCalculado).toBe(0);
      expect(result.coberturaFinanceira).toBe(0);
      expect(result.readinessScore).toBe(0);
      expect(result.progressoFisico).toBe(0);
    });

    it('deve calcular custoEstimadoCalculado a partir do precoAlvo ou menorCotacao das Wishlists vinculadas', () => {
      const projetoMock = {
        id: 'proj-2',
        workspaceId: 'ws-1',
        nome: 'Projeto Reforma',
        orcamentoEstimado: 5000,
        status: 'EM_ANDAMENTO',
        prioridade: 1,
        versao: 0,
        ativo: true,
        etapas: [
          {
            id: 'etapa-1',
            projetoId: 'proj-2',
            nome: 'Etapa Banheiro',
            status: 'EM_ANDAMENTO',
            ordem: 1,
            ativo: true,
            itens: [
              {
                id: 'item-1',
                etapaId: 'etapa-1',
                ativo: true,
                itemWishlist: {
                  id: 'wish-1',
                  nome: 'Torneira',
                  precoAlvo: 300,
                  status: 'PLANEJADO',
                  ativo: true,
                },
              },
              {
                id: 'item-2',
                etapaId: 'etapa-1',
                ativo: true,
                itemWishlist: {
                  id: 'wish-2',
                  nome: 'Piso Porcelain',
                  precoAlvo: null,
                  cotacoes: [{ preco: 700 }, { preco: 850 }],
                  status: 'ANALISE',
                  ativo: true,
                },
              },
            ],
          },
        ],
      };

      const result = service.calcularConsolidadoProjeto(projetoMock);

      // wish-1 cost = 300 (precoAlvo)
      // wish-2 cost = 700 (menorCotacao)
      // total custoEstimadoCalculado = 1000
      expect(result.custoEstimadoCalculado).toBe(1000);
    });

    it('deve calcular valorFinanciado a partir da soma dos aportes das Metas vinculadas', () => {
      const projetoMock = {
        id: 'proj-3',
        workspaceId: 'ws-1',
        nome: 'Projeto Carro Novo',
        orcamentoEstimado: 20000,
        status: 'EM_ANDAMENTO',
        prioridade: 1,
        versao: 0,
        ativo: true,
        etapas: [
          {
            id: 'etapa-1',
            projetoId: 'proj-3',
            nome: 'Poupança de Entrada',
            status: 'EM_ANDAMENTO',
            ordem: 1,
            ativo: true,
            itens: [
              {
                id: 'item-meta-1',
                etapaId: 'etapa-1',
                ativo: true,
                meta: {
                  id: 'meta-1',
                  nome: 'Reserva Entrada',
                  valorAlvo: 10000,
                  status: 'ATIVA',
                  aportes: [{ valor: 2500 }, { valor: 2500 }],
                },
              },
            ],
          },
        ],
      };

      const result = service.calcularConsolidadoProjeto(projetoMock);

      expect(result.valorFinanciado).toBe(5000);
    });

    it('deve calcular CoberturaFinanceira limitando a no maximo 100%', () => {
      const projetoMock = {
        id: 'proj-4',
        workspaceId: 'ws-1',
        nome: 'Projeto Super Financiado',
        orcamentoEstimado: 1000,
        status: 'EM_ANDAMENTO',
        prioridade: 1,
        versao: 0,
        ativo: true,
        etapas: [
          {
            id: 'etapa-1',
            projetoId: 'proj-4',
            status: 'EM_ANDAMENTO',
            ordem: 1,
            ativo: true,
            itens: [
              {
                id: 'item-w',
                etapaId: 'etapa-1',
                ativo: true,
                itemWishlist: {
                  id: 'w-1',
                  precoAlvo: 500,
                  status: 'PLANEJADO',
                  ativo: true,
                },
              },
              {
                id: 'item-m',
                etapaId: 'etapa-1',
                ativo: true,
                meta: {
                  id: 'm-1',
                  status: 'ATIVA',
                  aportes: [{ valor: 2000 }],
                },
              },
            ],
          },
        ],
      };

      const result = service.calcularConsolidadoProjeto(projetoMock);

      expect(result.custoEstimadoCalculado).toBe(500);
      expect(result.valorFinanciado).toBe(2000);
      expect(result.coberturaFinanceira).toBe(100);
    });
  });

  describe('ReadinessScore e Progresso Fisico', () => {
    it('deve calcular ReadinessScore considerando status COMPRADO e PLANEJADO com esfriamento ok e etapa financiada', () => {
      const agora = new Date('2026-08-08T12:00:00Z');
      const passado = new Date('2026-08-01T12:00:00Z');

      const projetoMock = {
        id: 'proj-5',
        workspaceId: 'ws-1',
        nome: 'Projeto Readiness',
        status: 'EM_ANDAMENTO',
        prioridade: 1,
        versao: 0,
        ativo: true,
        etapas: [
          {
            id: 'etapa-1',
            projetoId: 'proj-5',
            status: 'EM_ANDAMENTO',
            ordem: 1,
            ativo: true,
            itens: [
              {
                id: 'item-1',
                etapaId: 'etapa-1',
                ativo: true,
                itemWishlist: {
                  id: 'w-1',
                  status: 'COMPRADO',
                  precoAlvo: 500,
                  ativo: true,
                },
              },
              {
                id: 'item-2',
                etapaId: 'etapa-1',
                ativo: true,
                itemWishlist: {
                  id: 'w-2',
                  status: 'PLANEJADO',
                  precoAlvo: 500,
                  fimEsfriamento: passado,
                  ativo: true,
                },
              },
              {
                id: 'item-meta',
                etapaId: 'etapa-1',
                ativo: true,
                meta: {
                  id: 'm-1',
                  status: 'ATIVA',
                  aportes: [{ valor: 1000 }], // Financiou os 1000 da etapa (500 + 500)
                },
              },
            ],
          },
        ],
      };

      const result = service.calcularConsolidadoProjeto(projetoMock, agora);

      // 2 de 2 itens wishlist estao prontos (1 COMPRADO, 1 PLANEJADO + esfriamento ok + financiado)
      expect(result.readinessScore).toBe(100);
    });

    it('deve calcular progressoFisico baseado na proporcao de etapas CONCLUIDA', () => {
      const projetoMock = {
        id: 'proj-6',
        workspaceId: 'ws-1',
        nome: 'Projeto Fisico',
        status: 'EM_ANDAMENTO',
        prioridade: 1,
        versao: 0,
        ativo: true,
        etapas: [
          { id: 'e1', projetoId: 'proj-6', status: 'CONCLUIDA', ordem: 1, ativo: true },
          { id: 'e2', projetoId: 'proj-6', status: 'CONCLUIDA', ordem: 2, ativo: true },
          { id: 'e3', projetoId: 'proj-6', status: 'EM_ANDAMENTO', ordem: 3, ativo: true },
          { id: 'e4', projetoId: 'proj-6', status: 'PENDENTE', ordem: 4, ativo: true },
        ],
      };

      const result = service.calcularConsolidadoProjeto(projetoMock);

      // 2 de 4 etapas concluidas = 50%
      expect(result.progressoFisico).toBe(50);
    });
  });

  describe('Consultas no Banco via Service', () => {
    it('deve buscar projeto consolidado via PrismaService e formatar resultados', async () => {
      const dbMock = {
        id: 'proj-db',
        workspaceId: 'ws-1',
        nome: 'Projeto do Banco',
        orcamentoEstimado: 2000,
        status: 'PLANEJAMENTO',
        prioridade: 1,
        versao: 0,
        ativo: true,
        etapas: [],
      };

      mockPrisma.projeto.findFirst.mockResolvedValue(dbMock);

      const res = await service.obterProjetoConsolidado('ws-1', 'proj-db');

      expect(mockPrisma.projeto.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'proj-db', workspaceId: 'ws-1', ativo: true },
        }),
      );
      expect(res.nome).toBe('Projeto do Banco');
    });

    it('deve lancar NotFoundException se o projeto nao for encontrado', async () => {
      mockPrisma.projeto.findFirst.mockResolvedValue(null);

      await expect(service.obterProjetoConsolidado('ws-1', 'invalido')).rejects.toThrow('Projeto não encontrado.');
    });
  });
});
