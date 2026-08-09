import { Test, TestingModule } from '@nestjs/testing';
import { ComparadorCotacoesReadModelService } from './comparador-cotacoes-read-model.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ComparadorCotacoesReadModelService', () => {
  let service: ComparadorCotacoesReadModelService;
  let prismaService: any;

  beforeEach(async () => {
    prismaService = {
      itemWishlist: {
        findFirst: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComparadorCotacoesReadModelService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get<ComparadorCotacoesReadModelService>(
      ComparadorCotacoesReadModelService,
    );
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  it('deve lançar NotFoundException se o item da wishlist não for encontrado', async () => {
    prismaService.itemWishlist.findFirst.mockResolvedValue(null);

    await expect(
      service.obterComparativo('ws-1', 'item-inexistente'),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve retornar alvoAtingido = false e economiaPotencial = null quando precoAlvo === null', async () => {
    prismaService.itemWishlist.findFirst.mockResolvedValue({
      id: 'item-1',
      nome: 'Geladeira',
      precoAlvo: null,
      cotacoesAvulsas: [
        {
          id: 'cot-1',
          nomeLoja: 'Loja A',
          preco: 3000.0,
          url: 'https://lojaa.com',
          observacoes: null,
          ativo: true,
        },
      ],
      produto: null,
    });

    const resultado = await service.obterComparativo('ws-1', 'item-1');

    expect(resultado.itemWishlistId).toBe('item-1');
    expect(resultado.precoAlvo).toBeNull();
    expect(resultado.menorCotacao).toBe(3000.0);
    expect(resultado.alvoAtingido).toBe(false);
    expect(resultado.economiaPotencial).toBeNull();
    expect(resultado.totalOfertas).toBe(1);
    expect(resultado.apexChartData.categories).toEqual(['Loja A']);
    expect(resultado.apexChartData.series[0].data).toEqual([3000.0]);
  });

  it('deve calcular economiaPotencial = precoAlvo - menorCotacao e alvoAtingido = true quando a menor cotação for menor que o preço alvo', async () => {
    prismaService.itemWishlist.findFirst.mockResolvedValue({
      id: 'item-2',
      nome: 'TV 55 polegadas',
      precoAlvo: 2500.0,
      cotacoesAvulsas: [
        {
          id: 'cot-1',
          nomeLoja: 'Loja Avulsa B',
          preco: 2200.0,
          url: null,
          observacoes: 'Oferta relâmpago',
          ativo: true,
        },
      ],
      produto: {
        links: [
          {
            id: 'link-1',
            preco: 2400.0,
            url: 'https://lojac.com',
            ativo: true,
            loja: { id: 'loja-c', nome: 'Loja C', ativo: true },
          },
        ],
      },
    });

    const resultado = await service.obterComparativo('ws-1', 'item-2');

    expect(resultado.precoAlvo).toBe(2500.0);
    expect(resultado.menorCotacao).toBe(2200.0);
    expect(resultado.maiorCotacao).toBe(2400.0);
    expect(resultado.alvoAtingido).toBe(true);
    expect(resultado.economiaPotencial).toBe(300.0); // 2500 - 2200 = 300
    expect(resultado.totalOfertas).toBe(2);
    expect(resultado.ofertas[0].nomeLoja).toBe('Loja Avulsa B');
    expect(resultado.ofertas[0].tipo).toBe('COTACAO_AVULSA');
    expect(resultado.ofertas[1].nomeLoja).toBe('Loja C');
    expect(resultado.ofertas[1].tipo).toBe('LINK_PRODUTO');
  });

  it('deve retornar economiaPotencial = 0 e alvoAtingido = false quando menorCotacao for maior que precoAlvo', async () => {
    prismaService.itemWishlist.findFirst.mockResolvedValue({
      id: 'item-3',
      nome: 'Celular',
      precoAlvo: 1000.0,
      cotacoesAvulsas: [
        {
          id: 'cot-1',
          nomeLoja: 'Loja X',
          preco: 1200.0,
          ativo: true,
        },
      ],
      produto: null,
    });

    const resultado = await service.obterComparativo('ws-1', 'item-3');

    expect(resultado.precoAlvo).toBe(1000.0);
    expect(resultado.menorCotacao).toBe(1200.0);
    expect(resultado.alvoAtingido).toBe(false);
    expect(resultado.economiaPotencial).toBe(0); // Math.max(1000 - 1200, 0)
  });

  it('deve retornar alvoAtingido = false e economiaPotencial = null se não houver ofertas', async () => {
    prismaService.itemWishlist.findFirst.mockResolvedValue({
      id: 'item-4',
      nome: 'Cadeira Gamer',
      precoAlvo: 800.0,
      cotacoesAvulsas: [],
      produto: { links: [] },
    });

    const resultado = await service.obterComparativo('ws-1', 'item-4');

    expect(resultado.precoAlvo).toBe(800.0);
    expect(resultado.menorCotacao).toBeNull();
    expect(resultado.maiorCotacao).toBeNull();
    expect(resultado.alvoAtingido).toBe(false);
    expect(resultado.economiaPotencial).toBeNull();
    expect(resultado.totalOfertas).toBe(0);
    expect(resultado.apexChartData.categories).toEqual([]);
    expect(resultado.apexChartData.series[0].data).toEqual([]);
  });
});
