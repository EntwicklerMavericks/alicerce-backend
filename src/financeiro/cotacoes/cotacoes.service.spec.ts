import { Test, TestingModule } from '@nestjs/testing';
import { CotacoesService } from './cotacoes.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ComparadorCotacoesReadModelService } from './read-models/comparador-cotacoes-read-model.service';
import { JobMonitoramentoPrecosService } from './domain/services/job-monitoramento-precos.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { DomainException } from '../domain/exceptions/domain.exception';

import { CotacaoAggregatorProvider } from './providers/cotacao-aggregator.provider';

describe('CotacoesService', () => {
  let service: CotacoesService;
  let prismaService: any;
  let comparadorReadModelService: any;
  let jobMonitoramentoService: any;
  let cotacaoAggregator: any;

  beforeEach(async () => {
    prismaService = {
      itemWishlist: {
        findFirst: jest.fn(),
      },
      cotacaoAvulsa: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      linkProduto: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    comparadorReadModelService = {
      obterComparativo: jest.fn(),
    };

    jobMonitoramentoService = {
      processarLinkAtomico: jest.fn(),
      executarMonitoramentoPrecos: jest.fn(),
    };

    cotacaoAggregator = {
      buscarCotacoesComStatus: jest.fn().mockResolvedValue({
        ofertas: [],
        statusColeta: 'CONCLUIDA',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CotacoesService,
        { provide: PrismaService, useValue: prismaService },
        {
          provide: ComparadorCotacoesReadModelService,
          useValue: comparadorReadModelService,
        },
        {
          provide: JobMonitoramentoPrecosService,
          useValue: jobMonitoramentoService,
        },
        {
          provide: CotacaoAggregatorProvider,
          useValue: cotacaoAggregator,
        },
      ],
    }).compile();

    service = module.get<CotacoesService>(CotacoesService);
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('registrarCotacaoAvulsa', () => {
    it('deve registrar cotação avulsa com sucesso para workspace autorizada', async () => {
      prismaService.itemWishlist.findFirst.mockResolvedValue({
        id: 'item-1',
        workspaceId: 'ws-1',
        ativo: true,
      });

      prismaService.cotacaoAvulsa.create.mockImplementation(({ data }: any) =>
        Promise.resolve(data),
      );

      const dto = {
        itemWishlistId: 'item-1',
        nomeLoja: 'Loja Exemplo',
        preco: 199.9,
        url: 'https://exemplo.com',
        observacoes: 'Preço promocional',
      };

      const resultado = await service.registrarCotacaoAvulsa('ws-1', dto);

      expect(resultado.workspaceId).toBe('ws-1');
      expect(resultado.itemWishlistId).toBe('item-1');
      expect(resultado.nomeLoja).toBe('Loja Exemplo');
      expect(resultado.preco).toBe(199.9);
      expect(resultado.ativo).toBe(true);
    });

    it('deve lançar NotFoundException se o item da wishlist não for encontrado no workspace', async () => {
      prismaService.itemWishlist.findFirst.mockResolvedValue(null);

      const dto = {
        itemWishlistId: 'item-outro-workspace',
        nomeLoja: 'Loja',
        preco: 100,
      };

      await expect(
        service.registrarCotacaoAvulsa('ws-1', dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar DomainException se o preço for menor ou igual a zero', async () => {
      prismaService.itemWishlist.findFirst.mockResolvedValue({
        id: 'item-1',
        workspaceId: 'ws-1',
        ativo: true,
      });

      const dto = {
        itemWishlistId: 'item-1',
        nomeLoja: 'Loja',
        preco: -10,
      };

      await expect(
        service.registrarCotacaoAvulsa('ws-1', dto),
      ).rejects.toThrow(DomainException);
    });
  });

  describe('removerCotacaoAvulsa', () => {
    it('deve desativar cotação avulsa (soft delete) se pertencer ao mesmo workspace', async () => {
      prismaService.cotacaoAvulsa.findFirst.mockResolvedValue({
        id: 'cot-1',
        workspaceId: 'ws-1',
        itemWishlistId: 'item-1',
        nomeLoja: 'Loja A',
        preco: 50.0,
        url: null,
        observacoes: null,
        versao: 0,
        ativo: true,
        dataCriacao: new Date(),
        dataAtualizacao: new Date(),
      });

      prismaService.cotacaoAvulsa.update.mockResolvedValue({
        id: 'cot-1',
        ativo: false,
      });

      const res = await service.removerCotacaoAvulsa('ws-1', 'cot-1');

      expect(res.ativo).toBe(false);
      expect(prismaService.cotacaoAvulsa.update).toHaveBeenCalledWith({
        where: { id: 'cot-1' },
        data: expect.objectContaining({ ativo: false }),
      });
    });

    it('deve lançar NotFoundException se a cotação não existir ou pertencer a outro workspace', async () => {
      prismaService.cotacaoAvulsa.findFirst.mockResolvedValue(null);

      await expect(
        service.removerCotacaoAvulsa('ws-1', 'cot-outro-ws'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('obterComparadorItem', () => {
    it('deve delegar a busca para ComparadorCotacoesReadModelService', async () => {
      const mockPayload = {
        itemWishlistId: 'item-1',
        nomeItem: 'Produto X',
        precoAlvo: 100,
        menorCotacao: 90,
        maiorCotacao: 110,
        alvoAtingido: true,
        economiaPotencial: 10,
        totalOfertas: 2,
        ofertas: [],
        apexChartData: { categories: [], series: [] },
      };

      comparadorReadModelService.obterComparativo.mockResolvedValue(mockPayload);

      const res = await service.obterComparadorItem('ws-1', 'item-1');

      expect(res).toBe(mockPayload);
      expect(
        comparadorReadModelService.obterComparativo,
      ).toHaveBeenCalledWith('ws-1', 'item-1');
    });
  });

  describe('atualizarPrecoLink', () => {
    it('deve atualizar o preço do link chamando o serviço de monitoramento', async () => {
      prismaService.linkProduto.findFirst.mockResolvedValue({
        id: 'link-1',
        versao: 1,
        ativo: true,
      });

      jobMonitoramentoService.processarLinkAtomico.mockResolvedValue(true);
      prismaService.linkProduto.findUnique.mockResolvedValue({
        id: 'link-1',
        preco: 80.0,
      });

      const res = await service.atualizarPrecoLink('ws-1', 'link-1', {
        preco: 80.0,
      });

      expect(res).toEqual({ id: 'link-1', preco: 80.0 });
      expect(
        jobMonitoramentoService.processarLinkAtomico,
      ).toHaveBeenCalledWith('link-1', 1, 80.0);
    });

    it('deve lançar NotFoundException se o link não pertencer ao workspace', async () => {
      prismaService.linkProduto.findFirst.mockResolvedValue(null);

      await expect(
        service.atualizarPrecoLink('ws-1', 'link-inexistente', { preco: 50 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('executarMonitoramentoPrecos', () => {
    it('deve delegar execução para o JobMonitoramentoPrecosService', async () => {
      jobMonitoramentoService.executarMonitoramentoPrecos.mockResolvedValue({
        processados: 5,
        atualizados: 2,
        erros: 0,
      });

      const res = await service.executarMonitoramentoPrecos('ws-1');

      expect(res).toEqual({ processados: 5, atualizados: 2, erros: 0 });
      expect(
        jobMonitoramentoService.executarMonitoramentoPrecos,
      ).toHaveBeenCalledWith('ws-1');
    });
  });
});
