import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { StatusWishlist, PrioridadeWishlist } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ItemWishlistAggregate } from './domain/entities/item-wishlist.aggregate';
import { ConcurrencyConflictException } from '../domain/exceptions/concurrency-conflict.exception';
import { DomainException } from '../domain/exceptions/domain.exception';
import { CriarItemWishlistDto } from './dto/criar-item-wishlist.dto';
import { AtualizarItemWishlistDto } from './dto/atualizar-item-wishlist.dto';
import { VincularProdutoWishlistDto } from './dto/vincular-produto-wishlist.dto';
import { ConcluirCompraWishlistDto } from './dto/concluir-compra-wishlist.dto';

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  async criar(workspaceId: string, dto: CriarItemWishlistDto) {
    if (dto.produtoId) {
      await this.validarProdutoWorkspace(workspaceId, dto.produtoId);
    }

    const aggregate = ItemWishlistAggregate.criar({
      workspaceId,
      nome: dto.nome,
      descricao: dto.descricao,
      precoAlvo: dto.precoAlvo,
      prioridade: dto.prioridade,
      diasEsfriamento: dto.diasEsfriamento,
      produtoId: dto.produtoId,
    });

    const item = await this.prisma.itemWishlist.create({
      data: {
        id: aggregate.id,
        workspaceId: aggregate.workspaceId,
        produtoId: aggregate.produtoId,
        nome: aggregate.nome,
        descricao: aggregate.descricao,
        precoAlvo: aggregate.precoAlvo,
        prioridade: aggregate.prioridade,
        diasEsfriamento: aggregate.diasEsfriamento,
        inicioEsfriamento: aggregate.inicioEsfriamento,
        fimEsfriamento: aggregate.fimEsfriamento,
        status: aggregate.status,
        quebrouEsfriamento: aggregate.quebrouEsfriamento,
        versao: aggregate.versao,
        ativo: aggregate.ativo,
      },
      include: {
        produto: true,
        cotacoes: true,
      },
    });

    return this.formatarItem(item);
  }

  async listar(workspaceId: string, status?: StatusWishlist, prioridade?: PrioridadeWishlist) {
    const itens = await this.prisma.itemWishlist.findMany({
      where: {
        workspaceId,
        ativo: true,
        ...(status && { status }),
        ...(prioridade && { prioridade }),
      },
      include: {
        produto: true,
        cotacoes: true,
      },
      orderBy: { dataCriacao: 'desc' },
    });

    return itens.map((item) => this.formatarItem(item));
  }

  async obterPorId(workspaceId: string, id: string) {
    const item = await this.prisma.itemWishlist.findFirst({
      where: { id, workspaceId, ativo: true },
      include: {
        produto: true,
        cotacoes: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Item da wishlist não encontrado.');
    }

    return this.formatarItem(item);
  }

  async vincularProduto(workspaceId: string, id: string, dto: VincularProdutoWishlistDto) {
    await this.validarProdutoWorkspace(workspaceId, dto.produtoId);

    const dbItem = await this.buscarItemAtivo(workspaceId, id);
    const aggregate = this.mapToAggregate(dbItem);

    aggregate.vincularProduto(dto.produtoId);

    const updated = await this.prisma.itemWishlist.updateMany({
      where: {
        id,
        workspaceId,
        versao: dbItem.versao,
        ativo: true,
      },
      data: {
        produtoId: aggregate.produtoId,
        versao: { increment: 1 },
      },
    });

    if (updated.count === 0) {
      throw new ConcurrencyConflictException(
        'O item da wishlist foi modificado por outra transação. Tente novamente.',
      );
    }

    return this.obterPorId(workspaceId, id);
  }

  async desvincularProduto(workspaceId: string, id: string) {
    const dbItem = await this.buscarItemAtivo(workspaceId, id);
    const aggregate = this.mapToAggregate(dbItem);

    aggregate.desvincularProduto();

    const updated = await this.prisma.itemWishlist.updateMany({
      where: {
        id,
        workspaceId,
        versao: dbItem.versao,
        ativo: true,
      },
      data: {
        produtoId: aggregate.produtoId,
        versao: { increment: 1 },
      },
    });

    if (updated.count === 0) {
      throw new ConcurrencyConflictException(
        'O item da wishlist foi modificado por outra transação. Tente novamente.',
      );
    }

    return this.obterPorId(workspaceId, id);
  }

  async desistir(workspaceId: string, id: string) {
    const dbItem = await this.buscarItemAtivo(workspaceId, id);
    const aggregate = this.mapToAggregate(dbItem);
    const menorCotacaoAtiva = this.calcularMenorCotacao(dbItem.cotacoes);

    aggregate.desistir({ agora: new Date(), menorCotacaoAtiva });

    const updated = await this.prisma.itemWishlist.updateMany({
      where: {
        id,
        workspaceId,
        versao: dbItem.versao,
        ativo: true,
      },
      data: {
        status: aggregate.status,
        valorEconomizado: aggregate.valorEconomizado,
        dataConclusao: aggregate.dataConclusao,
        versao: { increment: 1 },
      },
    });

    if (updated.count === 0) {
      throw new ConcurrencyConflictException(
        'O item da wishlist foi modificado por outra transação. Tente novamente.',
      );
    }

    return this.obterPorId(workspaceId, id);
  }

  async concluirCompra(workspaceId: string, id: string, dto: ConcluirCompraWishlistDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Checa idempotência no Ledger (origemWishlistId = item.id)
      const despesaExistente = await tx.despesa.findUnique({
        where: { origemWishlistId: id },
      });

      const dbItem = await tx.itemWishlist.findFirst({
        where: { id, workspaceId, ativo: true },
        include: { produto: true, cotacoes: true },
      });

      if (!dbItem) {
        throw new NotFoundException('Item da wishlist não encontrado.');
      }

      if (despesaExistente) {
        if (dbItem.status === 'COMPRADO') {
          return this.formatarItem(dbItem);
        }
      }

      const aggregate = this.mapToAggregate(dbItem);
      const menorCotacaoAtiva = this.calcularMenorCotacao(dbItem.cotacoes);

      // 2. Executa iniciarCompra no aggregate (valida regras de negócio & lança DomainException se violadas)
      aggregate.iniciarCompra({
        agora: new Date(),
        quebrarEsfriamento: dto.quebrarEsfriamento,
        valorCompraInformado: dto.valorCompraInformado,
        menorCotacaoAtiva,
      });

      // 3. Determina Categoria para a Despesa
      const categoriaId = await this.resolverCategoriaId(tx, workspaceId, dto.categoriaId, dbItem.produto?.categoriaId);

      // 4. Cria registro de Despesa no Ledger (idempotência garantida pelo campo único origemWishlistId)
      if (!despesaExistente) {
        await tx.despesa.create({
          data: {
            workspaceId,
            descricao: `Compra Wishlist: ${aggregate.nome}`,
            valor: aggregate.valorCompra!,
            dataVencimento: aggregate.dataConclusao || new Date(),
            dataPagamento: aggregate.dataConclusao || new Date(),
            categoriaId,
            carteiraId: dto.carteiraId || null,
            cartaoId: dto.cartaoId || null,
            origemWishlistId: id,
            status: 'PAGA',
            statusLiquidacao: 'LIQUIDADO',
            observacoes: dto.observacoes || `Despesa gerada pela conclusão do item Wishlist: ${id}`,
          },
        });
      }

      // 5. Atualiza ItemWishlist com Concorrência Otimista
      const updated = await tx.itemWishlist.updateMany({
        where: {
          id,
          workspaceId,
          versao: dbItem.versao,
          ativo: true,
        },
        data: {
          status: aggregate.status,
          valorCompra: aggregate.valorCompra,
          quebrouEsfriamento: aggregate.quebrouEsfriamento,
          dataQuebraEsfriamento: aggregate.dataQuebraEsfriamento,
          dataConclusao: aggregate.dataConclusao,
          versao: { increment: 1 },
        },
      });

      if (updated.count === 0) {
        throw new ConcurrencyConflictException(
          'O item da wishlist foi modificado por outra transação. Tente novamente.',
        );
      }

      const finalItem = await tx.itemWishlist.findFirst({
        where: { id, workspaceId },
        include: { produto: true, cotacoes: true },
      });

      return this.formatarItem(finalItem!);
    });
  }

  async planejar(workspaceId: string, id: string) {
    const dbItem = await this.buscarItemAtivo(workspaceId, id);
    const aggregate = this.mapToAggregate(dbItem);

    aggregate.planejar();

    const updated = await this.prisma.itemWishlist.updateMany({
      where: {
        id,
        workspaceId,
        versao: dbItem.versao,
        ativo: true,
      },
      data: {
        status: aggregate.status,
        versao: { increment: 1 },
      },
    });

    if (updated.count === 0) {
      throw new ConcurrencyConflictException(
        'O item da wishlist foi modificado por outra transação. Tente novamente.',
      );
    }

    return this.obterPorId(workspaceId, id);
  }

  async atualizar(workspaceId: string, id: string, dto: AtualizarItemWishlistDto) {
    const dbItem = await this.buscarItemAtivo(workspaceId, id);
    const aggregate = this.mapToAggregate(dbItem);

    aggregate.atualizarDados(dto);

    const updated = await this.prisma.itemWishlist.updateMany({
      where: {
        id,
        workspaceId,
        versao: dbItem.versao,
        ativo: true,
      },
      data: {
        nome: aggregate.nome,
        descricao: aggregate.descricao,
        precoAlvo: aggregate.precoAlvo,
        prioridade: aggregate.prioridade,
        versao: { increment: 1 },
      },
    });

    if (updated.count === 0) {
      throw new ConcurrencyConflictException(
        'O item da wishlist foi modificado por outra transação. Tente novamente.',
      );
    }

    return this.obterPorId(workspaceId, id);
  }

  async remover(workspaceId: string, id: string) {
    await this.buscarItemAtivo(workspaceId, id);

    const updated = await this.prisma.itemWishlist.updateMany({
      where: { id, workspaceId, ativo: true },
      data: {
        ativo: false,
        versao: { increment: 1 },
      },
    });

    if (updated.count === 0) {
      throw new NotFoundException('Item da wishlist não encontrado.');
    }

    return { sucesso: true, mensagem: 'Item removido da wishlist com sucesso.' };
  }

  // Métodos Auxiliares
  private async buscarItemAtivo(workspaceId: string, id: string) {
    const dbItem = await this.prisma.itemWishlist.findFirst({
      where: { id, workspaceId, ativo: true },
      include: { produto: true, cotacoes: true },
    });

    if (!dbItem) {
      throw new NotFoundException('Item da wishlist não encontrado.');
    }

    return dbItem;
  }

  private async validarProdutoWorkspace(workspaceId: string, produtoId: string) {
    const produto = await this.prisma.produto.findFirst({
      where: { id: produtoId, ativo: true },
    });

    if (!produto || produto.workspaceId !== workspaceId) {
      throw new DomainException(
        'Produto não encontrado ou pertence a outro workspace (Isolamento Multi-Tenant).',
      );
    }
  }

  private mapToAggregate(dbItem: any): ItemWishlistAggregate {
    return ItemWishlistAggregate.reconstituir({
      id: dbItem.id,
      workspaceId: dbItem.workspaceId,
      nome: dbItem.nome,
      descricao: dbItem.descricao,
      precoAlvo: dbItem.precoAlvo ? Number(dbItem.precoAlvo) : null,
      valorCompra: dbItem.valorCompra ? Number(dbItem.valorCompra) : null,
      valorEconomizado: dbItem.valorEconomizado ? Number(dbItem.valorEconomizado) : null,
      prioridade: dbItem.prioridade,
      diasEsfriamento: dbItem.diasEsfriamento,
      inicioEsfriamento: new Date(dbItem.inicioEsfriamento),
      fimEsfriamento: new Date(dbItem.fimEsfriamento),
      status: dbItem.status,
      quebrouEsfriamento: dbItem.quebrouEsfriamento,
      dataQuebraEsfriamento: dbItem.dataQuebraEsfriamento ? new Date(dbItem.dataQuebraEsfriamento) : null,
      dataConclusao: dbItem.dataConclusao ? new Date(dbItem.dataConclusao) : null,
      produtoId: dbItem.produtoId,
      versao: dbItem.versao,
      ativo: dbItem.ativo,
      dataCriacao: new Date(dbItem.dataCriacao),
      dataAtualizacao: new Date(dbItem.dataAtualizacao),
    });
  }

  private calcularMenorCotacao(cotacoes?: any[]): number | undefined {
    if (!cotacoes || cotacoes.length === 0) return undefined;
    const valores = cotacoes.map((c) => Number(c.preco)).filter((v) => !isNaN(v) && v > 0);
    if (valores.length === 0) return undefined;
    return Math.min(...valores);
  }

  private async resolverCategoriaId(
    tx: any,
    workspaceId: string,
    categoriaDtoId?: string,
    produtoCategoriaId?: string | null,
  ): Promise<string> {
    if (categoriaDtoId) {
      return categoriaDtoId;
    }
    if (produtoCategoriaId) {
      return produtoCategoriaId;
    }
    const categoriaPadrao = await tx.categoria.findFirst({
      where: {
        OR: [{ workspaceId }, { sistema: true }],
        tipo: { in: ['DESPESA', 'AMBAS'] },
      },
    });
    if (categoriaPadrao) {
      return categoriaPadrao.id;
    }
    const qualquerCategoria = await tx.categoria.findFirst();
    if (qualquerCategoria) {
      return qualquerCategoria.id;
    }
    throw new BadRequestException('Nenhuma categoria encontrada para associar à despesa.');
  }

  private formatarItem(item: any, agora = new Date()) {
    const fim = item.fimEsfriamento instanceof Date ? item.fimEsfriamento : new Date(item.fimEsfriamento);
    const msRestantes = Math.max(0, fim.getTime() - agora.getTime());
    const emEsfriamento = item.status === 'ANALISE' && agora.getTime() < fim.getTime();
    const diasRestantes = emEsfriamento ? Math.ceil(msRestantes / (1000 * 60 * 60 * 24)) : 0;
    const horasRestantes = emEsfriamento ? Math.ceil(msRestantes / (1000 * 60 * 60)) : 0;

    return {
      id: item.id,
      workspaceId: item.workspaceId,
      produtoId: item.produtoId,
      nome: item.nome,
      descricao: item.descricao,
      precoAlvo: item.precoAlvo !== null && item.precoAlvo !== undefined ? Number(item.precoAlvo) : null,
      valorCompra: item.valorCompra !== null && item.valorCompra !== undefined ? Number(item.valorCompra) : null,
      valorEconomizado: item.valorEconomizado !== null && item.valorEconomizado !== undefined ? Number(item.valorEconomizado) : null,
      prioridade: item.prioridade,
      diasEsfriamento: item.diasEsfriamento,
      inicioEsfriamento: item.inicioEsfriamento,
      fimEsfriamento: item.fimEsfriamento,
      status: item.status,
      quebrouEsfriamento: item.quebrouEsfriamento,
      dataQuebraEsfriamento: item.dataQuebraEsfriamento,
      dataConclusao: item.dataConclusao,
      versao: item.versao,
      ativo: item.ativo,
      dataCriacao: item.dataCriacao,
      dataAtualizacao: item.dataAtualizacao,
      produto: item.produto ? item.produto : null,
      cotacoes: item.cotacoes ? item.cotacoes : [],
      tempoRestanteEsfriamento: {
        emEsfriamento,
        diasRestantes,
        horasRestantes,
        msRestantes,
      },
    };
  }
}
