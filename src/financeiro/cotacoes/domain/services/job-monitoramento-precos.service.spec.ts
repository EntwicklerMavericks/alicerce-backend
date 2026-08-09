import { Test, TestingModule } from '@nestjs/testing';
import { JobMonitoramentoPrecosService } from './job-monitoramento-precos.service';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  FONTE_COTACAO_PROVIDER,
  FonteCotacaoProvider,
} from '../providers/fonte-cotacao.provider';
import { ConcurrencyConflictException } from '../../../domain/exceptions/concurrency-conflict.exception';

describe('JobMonitoramentoPrecosService', () => {
  let service: JobMonitoramentoPrecosService;
  let prismaService: any;
  let fonteCotacaoProvider: jest.Mocked<FonteCotacaoProvider>;

  beforeEach(async () => {
    const mockPrismaTx = {
      linkProduto: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      historicoPreco: {
        create: jest.fn(),
      },
    };

    prismaService = {
      linkProduto: {
        findMany: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(mockPrismaTx)),
      _tx: mockPrismaTx,
    };

    fonteCotacaoProvider = {
      obterPreco: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobMonitoramentoPrecosService,
        { provide: PrismaService, useValue: prismaService },
        { provide: FONTE_COTACAO_PROVIDER, useValue: fonteCotacaoProvider },
      ],
    }).compile();

    service = module.get<JobMonitoramentoPrecosService>(
      JobMonitoramentoPrecosService,
    );
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('processarLinkAtomico', () => {
    it('deve realizar NO-OP se o preço novo for igual ao preço atual', async () => {
      prismaService._tx.linkProduto.findUnique.mockResolvedValue({
        id: 'link-1',
        preco: 100.0,
        versao: 1,
        ativo: true,
      });

      const resultado = await service.processarLinkAtomico('link-1', 1, 100.0);

      expect(resultado).toBe(false);
      expect(prismaService._tx.linkProduto.update).not.toHaveBeenCalled();
      expect(prismaService._tx.historicoPreco.create).not.toHaveBeenCalled();
    });

    it('deve atualizar LinkProduto e inserir HistoricoPreco se o preço for diferente', async () => {
      prismaService._tx.linkProduto.findUnique.mockResolvedValue({
        id: 'link-1',
        preco: 100.0,
        versao: 1,
        ativo: true,
      });

      prismaService._tx.linkProduto.update.mockResolvedValue({
        id: 'link-1',
        preco: 80.0,
        versao: 2,
      });

      prismaService._tx.historicoPreco.create.mockResolvedValue({
        id: 'hist-1',
        linkProdutoId: 'link-1',
        preco: 80.0,
      });

      const resultado = await service.processarLinkAtomico('link-1', 1, 80.0);

      expect(resultado).toBe(true);
      expect(prismaService._tx.linkProduto.update).toHaveBeenCalledWith({
        where: { id: 'link-1', versao: 1 },
        data: expect.objectContaining({
          preco: 80.0,
          versao: { increment: 1 },
        }),
      });
      expect(prismaService._tx.historicoPreco.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          linkProdutoId: 'link-1',
          preco: 80.0,
        }),
      });
    });

    it('deve lançar ConcurrencyConflictException se a versão for incompatível', async () => {
      prismaService._tx.linkProduto.findUnique.mockResolvedValue({
        id: 'link-1',
        preco: 100.0,
        versao: 2, // versão no banco mudou para 2
        ativo: true,
      });

      await expect(
        service.processarLinkAtomico('link-1', 1, 80.0), // versao esperada 1
      ).rejects.toThrow(ConcurrencyConflictException);
    });

    it('deve retornar false se o link não for encontrado ou estiver inativo', async () => {
      prismaService._tx.linkProduto.findUnique.mockResolvedValue(null);

      const resultado = await service.processarLinkAtomico('link-1', 1, 80.0);
      expect(resultado).toBe(false);
    });
  });

  describe('executarMonitoramentoPrecos', () => {
    it('deve chamar o provider fora da transação e processar links isoladamente', async () => {
      const links = [
        { id: 'link-1', versao: 0, preco: 100 },
        { id: 'link-2', versao: 1, preco: 200 },
      ];
      prismaService.linkProduto.findMany.mockResolvedValue(links);

      fonteCotacaoProvider.obterPreco
        .mockResolvedValueOnce(90.0) // link-1 preco alterado
        .mockResolvedValueOnce(200.0); // link-2 preco mantido

      prismaService._tx.linkProduto.findUnique
        .mockResolvedValueOnce({ id: 'link-1', preco: 100.0, versao: 0, ativo: true })
        .mockResolvedValueOnce({ id: 'link-2', preco: 200.0, versao: 1, ativo: true });

      const res = await service.executarMonitoramentoPrecos('ws-1');

      expect(res).toEqual({ processados: 2, atualizados: 1, erros: 0 });
      expect(fonteCotacaoProvider.obterPreco).toHaveBeenCalledTimes(2);
    });

    it('deve isolar erros do provider e continuar o lote sem parar', async () => {
      const links = [
        { id: 'link-1', versao: 0, preco: 100 },
        { id: 'link-2', versao: 1, preco: 200 },
      ];
      prismaService.linkProduto.findMany.mockResolvedValue(links);

      fonteCotacaoProvider.obterPreco
        .mockRejectedValueOnce(new Error('Site fora do ar')) // erro no link 1
        .mockResolvedValueOnce(180.0); // link 2 atualizado

      prismaService._tx.linkProduto.findUnique.mockResolvedValueOnce({
        id: 'link-2',
        preco: 200.0,
        versao: 1,
        ativo: true,
      });

      const res = await service.executarMonitoramentoPrecos();

      expect(res).toEqual({ processados: 2, atualizados: 1, erros: 1 });
    });

    it('deve isolar exceções de concorrência no banco e continuar o lote', async () => {
      const links = [
        { id: 'link-1', versao: 0, preco: 100 },
        { id: 'link-2', versao: 1, preco: 200 },
      ];
      prismaService.linkProduto.findMany.mockResolvedValue(links);

      fonteCotacaoProvider.obterPreco
        .mockResolvedValueOnce(90.0)
        .mockResolvedValueOnce(180.0);

      // link 1 gera conflito de versão
      prismaService._tx.linkProduto.findUnique
        .mockResolvedValueOnce({ id: 'link-1', preco: 100.0, versao: 99, ativo: true })
        .mockResolvedValueOnce({ id: 'link-2', preco: 200.0, versao: 1, ativo: true });

      const res = await service.executarMonitoramentoPrecos();

      expect(res).toEqual({ processados: 2, atualizados: 1, erros: 1 });
    });
  });
});
