import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CriarProdutoDto } from './dto/criar-produto.dto';
import { AtualizarProdutoDto } from './dto/atualizar-produto.dto';
import { VincularLinkDto } from './dto/vincular-link.dto';
import { AtualizarPrecoLinkDto } from './dto/atualizar-preco-link.dto';
import { ProdutoAggregate } from '../domain/entities/produto.aggregate';
import { PrecoObservado } from '../domain/value-objects/preco-observado.vo';
import { ConcurrencyConflictException } from '../../domain/exceptions/concurrency-conflict.exception';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProdutosService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Valida autorização cross-tenant para produto
   */
  async obterProdutoDoWorkspace(workspaceId: string, produtoId: string) {
    const produto = await this.prisma.produto.findFirst({
      where: {
        id: produtoId,
        workspaceId,
        ativo: true,
      },
      include: {
        categoria: true,
        imagens: { where: { ativo: true }, orderBy: { ordem: 'asc' } },
        links: {
          where: { ativo: true },
          include: {
            loja: true,
            historicoPrecos: { orderBy: { data: 'desc' }, take: 10 },
          },
        },
      },
    });

    if (!produto) {
      throw new NotFoundException('Produto não encontrado ou não pertence ao workspace.');
    }

    return produto;
  }

  /**
   * Valida autorização cross-tenant para categoria
   */
  private async validarCategoriaDoWorkspace(workspaceId: string, categoriaId: string) {
    const categoria = await this.prisma.categoria.findFirst({
      where: {
        id: categoriaId,
        workspaceId,
      },
    });

    if (!categoria) {
      throw new ForbiddenException('A categoria informada não pertence ao workspace.');
    }
  }

  /**
   * Valida autorização cross-tenant para loja
   */
  private async validarLojaAcessivel(workspaceId: string, lojaId: string) {
    const loja = await this.prisma.loja.findFirst({
      where: {
        id: lojaId,
        ativo: true,
        OR: [{ workspaceId }, { sistema: true }],
      },
    });

    if (!loja) {
      throw new ForbiddenException('A loja informada não pertence ao workspace nem é global do sistema.');
    }

    return loja;
  }

  async criar(workspaceId: string, dto: CriarProdutoDto) {
    if (dto.categoriaId) {
      await this.validarCategoriaDoWorkspace(workspaceId, dto.categoriaId);
    }

    const produtoAggregate = new ProdutoAggregate(
      'temp-id',
      workspaceId,
      dto.nome,
      dto.descricao || null,
      dto.marca || null,
      dto.categoriaId || null,
      dto.observacoes || null,
    );

    return this.prisma.produto.create({
      data: {
        workspaceId: produtoAggregate.workspaceId,
        nome: produtoAggregate.nome,
        descricao: produtoAggregate.descricao,
        marca: produtoAggregate.marca,
        categoriaId: produtoAggregate.categoriaId,
        observacoes: produtoAggregate.observacoes,
        ativo: true,
      },
      include: {
        categoria: true,
        imagens: true,
        links: { include: { loja: true } },
      },
    });
  }

  async listarPorWorkspace(workspaceId: string, categoriaId?: string) {
    return this.prisma.produto.findMany({
      where: {
        workspaceId,
        ativo: true,
        ...(categoriaId ? { categoriaId } : {}),
      },
      include: {
        categoria: true,
        imagens: { where: { ativo: true }, orderBy: { ordem: 'asc' } },
        links: {
          where: { ativo: true },
          include: {
            loja: true,
            historicoPrecos: { orderBy: { data: 'desc' }, take: 5 },
          },
        },
      },
      orderBy: { nome: 'asc' },
    });
  }

  async obterPorId(workspaceId: string, id: string) {
    return this.obterProdutoDoWorkspace(workspaceId, id);
  }

  async atualizar(workspaceId: string, id: string, dto: AtualizarProdutoDto) {
    const produto = await this.obterProdutoDoWorkspace(workspaceId, id);

    if (dto.categoriaId) {
      await this.validarCategoriaDoWorkspace(workspaceId, dto.categoriaId);
    }

    const aggregate = new ProdutoAggregate(
      produto.id,
      produto.workspaceId,
      produto.nome,
      produto.descricao,
      produto.marca,
      produto.categoriaId,
      produto.observacoes,
      produto.ativo,
    );

    aggregate.atualizarDados(dto.nome, dto.descricao, dto.marca, dto.categoriaId, dto.observacoes);

    return this.prisma.produto.update({
      where: { id },
      data: {
        nome: aggregate.nome,
        descricao: aggregate.descricao,
        marca: aggregate.marca,
        categoriaId: aggregate.categoriaId,
        observacoes: aggregate.observacoes,
      },
      include: {
        categoria: true,
        imagens: { where: { ativo: true } },
        links: { where: { ativo: true }, include: { loja: true } },
      },
    });
  }

  async remover(workspaceId: string, id: string) {
    await this.obterProdutoDoWorkspace(workspaceId, id);

    return this.prisma.produto.update({
      where: { id },
      data: { ativo: false },
    });
  }

  /**
   * Vincular Link do Produto em uma Loja (POST /produtos/:id/links)
   * Trata P2002 e reativação atômica via prisma.$transaction
   */
  async vincularLink(workspaceId: string, produtoId: string, dto: VincularLinkDto) {
    await this.obterProdutoDoWorkspace(workspaceId, produtoId);
    await this.validarLojaAcessivel(workspaceId, dto.lojaId);

    // Valida invariant PrecoObservado > 0
    PrecoObservado.deReais(dto.preco);

    const linkExistente = await this.prisma.linkProduto.findUnique({
      where: {
        produtoId_lojaId: {
          produtoId,
          lojaId: dto.lojaId,
        },
      },
    });

    if (linkExistente) {
      if (linkExistente.ativo) {
        throw new ConflictException('Oferta já cadastrada para esta loja');
      }

      // Reativação atômica (linkExistente.ativo === false)
      const agora = new Date();
      return this.prisma.$transaction(async (tx) => {
        const reativado = await tx.linkProduto.update({
          where: { id: linkExistente.id },
          data: {
            ativo: true,
            url: dto.url,
            preco: dto.preco,
            versao: { increment: 1 },
            ultimaVerificacao: agora,
          },
          include: { loja: true },
        });

        await tx.historicoPreco.create({
          data: {
            linkProdutoId: reativado.id,
            preco: dto.preco,
            data: agora,
          },
        });

        return reativado;
      });
    }

    // Vínculo inédito
    const agora = new Date();
    try {
      return await this.prisma.$transaction(async (tx) => {
        const link = await tx.linkProduto.create({
          data: {
            produtoId,
            lojaId: dto.lojaId,
            url: dto.url,
            preco: dto.preco,
            versao: 0,
            ativo: true,
            ultimaVerificacao: agora,
          },
          include: { loja: true },
        });

        await tx.historicoPreco.create({
          data: {
            linkProdutoId: link.id,
            preco: dto.preco,
            data: agora,
          },
        });

        return link;
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        // Trata P2002 caso ocorra por corrida
        const recheck = await this.prisma.linkProduto.findUnique({
          where: {
            produtoId_lojaId: { produtoId, lojaId: dto.lojaId },
          },
        });
        if (recheck?.ativo) {
          throw new ConflictException('Oferta já cadastrada para esta loja');
        } else if (recheck) {
          return this.prisma.$transaction(async (tx) => {
            const reativado = await tx.linkProduto.update({
              where: { id: recheck.id },
              data: {
                ativo: true,
                url: dto.url,
                preco: dto.preco,
                versao: { increment: 1 },
                ultimaVerificacao: agora,
              },
              include: { loja: true },
            });
            await tx.historicoPreco.create({
              data: {
                linkProdutoId: reativado.id,
                preco: dto.preco,
                data: agora,
              },
            });
            return reativado;
          });
        }
      }
      throw error;
    }
  }

  /**
   * Atualizar Preço do Link (PUT /produtos/:id/links/:linkId)
   * Optimistic Locking com versaoEsperada e Idempotência de Histórico
   */
  async atualizarPrecoLink(
    workspaceId: string,
    produtoId: string,
    linkId: string,
    dto: AtualizarPrecoLinkDto,
  ) {
    await this.obterProdutoDoWorkspace(workspaceId, produtoId);

    const link = await this.prisma.linkProduto.findFirst({
      where: {
        id: linkId,
        produtoId,
        ativo: true,
      },
    });

    if (!link) {
      throw new NotFoundException('Link de produto não encontrado.');
    }

    // Valida invariant PrecoObservado > 0
    const novoPrecoVO = PrecoObservado.deReais(dto.preco);
    const precoAtualNum = Number(link.preco);
    const novoPrecoNum = novoPrecoVO.paraReais();

    const agora = new Date();

    // Se o preço for idêntico ao atual: Apenas atualiza a última verificação (Idempotência)
    if (precoAtualNum === novoPrecoNum) {
      return this.prisma.linkProduto.update({
        where: { id: linkId },
        data: {
          ultimaVerificacao: agora,
          ...(dto.url ? { url: dto.url } : {}),
        },
        include: { loja: true },
      });
    }

    // Se o preço mudou: Aplica Optimistic Locking com versao
    const result = await this.prisma.linkProduto.updateMany({
      where: {
        id: linkId,
        versao: dto.versao,
      },
      data: {
        preco: novoPrecoNum,
        versao: { increment: 1 },
        ultimaVerificacao: agora,
        ...(dto.url ? { url: dto.url } : {}),
      },
    });

    if (result.count === 0) {
      throw new ConcurrencyConflictException(
        'Conflito de concorrência ao atualizar o preço do link. O registro foi alterado por outra requisição.',
      );
    }

    // Registra o ponto no Histórico de Preços
    await this.prisma.historicoPreco.create({
      data: {
        linkProdutoId: linkId,
        preco: novoPrecoNum,
        data: agora,
      },
    });

    return this.prisma.linkProduto.findUnique({
      where: { id: linkId },
      include: { loja: true, historicoPrecos: { orderBy: { data: 'desc' }, take: 10 } },
    });
  }

  /**
   * Remover Link (Soft Delete: DELETE /produtos/:id/links/:linkId)
   */
  async removerLink(workspaceId: string, produtoId: string, linkId: string) {
    await this.obterProdutoDoWorkspace(workspaceId, produtoId);

    const link = await this.prisma.linkProduto.findFirst({
      where: { id: linkId, produtoId, ativo: true },
    });

    if (!link) {
      throw new NotFoundException('Link de produto não encontrado.');
    }

    return this.prisma.linkProduto.update({
      where: { id: linkId },
      data: { ativo: false },
    });
  }

  /**
   * Adicionar Imagem ao Produto (POST /produtos/:id/imagens)
   */
  async adicionarImagem(
    workspaceId: string,
    produtoId: string,
    dto: { url: string; ordem?: number; principal?: boolean },
  ) {
    const produto = await this.obterProdutoDoWorkspace(workspaceId, produtoId);

    const imagensAtivas = produto.imagens.map((img) => ({
      id: img.id,
      produtoId: img.produtoId,
      url: img.url,
      ordem: img.ordem,
      principal: img.principal,
      ativo: img.ativo,
      dataCriacao: img.dataCriacao,
    }));

    const novaImagem: any = {
      id: 'temp',
      produtoId,
      url: dto.url,
      ordem: dto.ordem ?? imagensAtivas.length,
      principal: dto.principal ?? false,
      ativo: true,
    };

    const aggregate = new ProdutoAggregate(
      produto.id,
      produto.workspaceId,
      produto.nome,
      produto.descricao,
      produto.marca,
      produto.categoriaId,
      produto.observacoes,
      produto.ativo,
      imagensAtivas,
    );

    aggregate.adicionarImagem(novaImagem);

    if (dto.principal) {
      return this.prisma.$transaction(async (tx) => {
        await tx.imagemProduto.updateMany({
          where: { produtoId, ativo: true },
          data: { principal: false },
        });

        return tx.imagemProduto.create({
          data: {
            produtoId,
            url: dto.url,
            ordem: dto.ordem ?? imagensAtivas.length,
            principal: true,
            ativo: true,
          },
        });
      });
    }

    return this.prisma.imagemProduto.create({
      data: {
        produtoId,
        url: dto.url,
        ordem: dto.ordem ?? imagensAtivas.length,
        principal: false,
        ativo: true,
      },
    });
  }

  /**
   * Definir Imagem Principal (POST /produtos/:id/imagens/:imagemId/principal)
   * Executa definirImagemPrincipal() atômico via prisma.$transaction
   */
  async definirImagemPrincipal(workspaceId: string, produtoId: string, imagemId: string) {
    const produto = await this.obterProdutoDoWorkspace(workspaceId, produtoId);

    const imagensDomain = produto.imagens.map((img) => ({
      id: img.id,
      produtoId: img.produtoId,
      url: img.url,
      ordem: img.ordem,
      principal: img.principal,
      ativo: img.ativo,
    }));

    const aggregate = new ProdutoAggregate(
      produto.id,
      produto.workspaceId,
      produto.nome,
      produto.descricao,
      produto.marca,
      produto.categoriaId,
      produto.observacoes,
      produto.ativo,
      imagensDomain,
    );

    // Lança DomainException caso a imagemId não exista ou esteja inativa
    aggregate.definirImagemPrincipal(imagemId);

    // Executa transação atômica no banco de dados
    return this.prisma.$transaction(async (tx) => {
      await tx.imagemProduto.updateMany({
        where: { produtoId, ativo: true },
        data: { principal: false },
      });

      return tx.imagemProduto.update({
        where: { id: imagemId },
        data: { principal: true },
      });
    });
  }

  /**
   * Remover Imagem (Soft Delete: DELETE /produtos/:id/imagens/:imagemId)
   */
  async removerImagem(workspaceId: string, produtoId: string, imagemId: string) {
    await this.obterProdutoDoWorkspace(workspaceId, produtoId);

    const imagem = await this.prisma.imagemProduto.findFirst({
      where: { id: imagemId, produtoId, ativo: true },
    });

    if (!imagem) {
      throw new NotFoundException('Imagem do produto não encontrada.');
    }

    return this.prisma.imagemProduto.update({
      where: { id: imagemId },
      data: { ativo: false, principal: false },
    });
  }
}
