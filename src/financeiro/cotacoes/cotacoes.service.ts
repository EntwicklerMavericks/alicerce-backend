import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CotacaoAvulsaAggregate } from './domain/entities/cotacao-avulsa.aggregate';
import { RegistrarCotacaoAvulsaDto } from './dto/registrar-cotacao-avulsa.dto';
import { AtualizarPrecoLinkDto } from './dto/atualizar-preco-link.dto';
import { ComparadorCotacoesReadModelService } from './read-models/comparador-cotacoes-read-model.service';
import { JobMonitoramentoPrecosService } from './domain/services/job-monitoramento-precos.service';
import { CotacaoAggregatorProvider } from './providers/cotacao-aggregator.provider';

@Injectable()
export class CotacoesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly comparadorCotacoesReadModelService: ComparadorCotacoesReadModelService,
    private readonly jobMonitoramentoPrecosService: JobMonitoramentoPrecosService,
    private readonly cotacaoAggregatorProvider: CotacaoAggregatorProvider,
  ) {}

  async registrarCotacaoAvulsa(
    workspaceId: string,
    dto: RegistrarCotacaoAvulsaDto,
  ) {
    const itemWishlist = await this.prisma.itemWishlist.findFirst({
      where: {
        id: dto.itemWishlistId,
        workspaceId,
        ativo: true,
      },
    });

    if (!itemWishlist) {
      throw new NotFoundException(
        'Item da wishlist não encontrado para este workspace.',
      );
    }

    if (itemWishlist.workspaceId !== workspaceId) {
      throw new ForbiddenException(
        'Acesso negado: o item da wishlist pertence a outro workspace.',
      );
    }

    const aggregate = CotacaoAvulsaAggregate.criar({
      workspaceId,
      itemWishlistId: dto.itemWishlistId,
      nomeLoja: dto.nomeLoja,
      preco: dto.preco,
      url: dto.url,
      observacoes: dto.observacoes,
    });

    // Invariante estrita cross-tenant
    if (aggregate.workspaceId !== workspaceId) {
      throw new ForbiddenException(
        'Aviso de segurança: inconsistência no workspace ID da cotação.',
      );
    }

    return await this.prisma.cotacaoAvulsa.create({
      data: {
        id: aggregate.id,
        workspaceId: aggregate.workspaceId,
        itemWishlistId: aggregate.itemWishlistId,
        nomeLoja: aggregate.nomeLoja,
        preco: aggregate.preco,
        url: aggregate.url,
        observacoes: aggregate.observacoes,
        versao: aggregate.versao,
        ativo: aggregate.ativo,
        dataCriacao: aggregate.dataCriacao,
        dataAtualizacao: aggregate.dataAtualizacao,
      },
    });
  }

  async buscarEGravarCotacoesSobDemanda(workspaceId: string, itemWishlistId: string) {
    const item = await this.prisma.itemWishlist.findFirst({
      where: { id: itemWishlistId, workspaceId, ativo: true },
    });

    if (!item) {
      throw new NotFoundException('Item da wishlist não encontrado para este workspace.');
    }

    const resultado = await this.cotacaoAggregatorProvider.buscarCotacoesComStatus({
      termo: item.nome,
      url: item.linkUrl ?? undefined,
      itemWishlistId: item.id,
    });

    // Deduplicação idempotente por chave (workspaceId + itemWishlistId + nomeLoja + url + preco)
    for (const oferta of resultado.ofertas) {
      const nomeLoja = oferta.vendedor || (oferta.fonte === 'MERCADO_LIVRE' ? 'Mercado Livre' : 'Loja Web');

      const jaExiste = await this.prisma.cotacaoAvulsa.findFirst({
        where: {
          workspaceId,
          itemWishlistId: item.id,
          nomeLoja,
          preco: oferta.preco,
          url: oferta.url,
          ativo: true,
        },
      });

      if (!jaExiste) {
        const aggregate = CotacaoAvulsaAggregate.criar({
          workspaceId,
          itemWishlistId: item.id,
          nomeLoja,
          preco: oferta.preco.toNumber(),
          url: oferta.url,
          observacoes: `Encontrado via ${oferta.fonte} (${oferta.titulo})`,
        });

        await this.prisma.cotacaoAvulsa.create({
          data: {
            id: aggregate.id,
            workspaceId: aggregate.workspaceId,
            itemWishlistId: aggregate.itemWishlistId,
            nomeLoja: aggregate.nomeLoja,
            preco: aggregate.preco,
            url: aggregate.url,
            observacoes: aggregate.observacoes,
            versao: aggregate.versao,
            ativo: aggregate.ativo,
            dataCriacao: aggregate.dataCriacao,
            dataAtualizacao: aggregate.dataAtualizacao,
          },
        });
      }
    }

    const comparativo = await this.obterComparadorItem(workspaceId, itemWishlistId);

    return {
      ...comparativo,
      statusColeta: resultado.statusColeta,
      errosColeta: resultado.erros || [],
    };
  }

  async removerCotacaoAvulsa(workspaceId: string, id: string) {
    const cotacaoDb = await this.prisma.cotacaoAvulsa.findFirst({
      where: {
        id,
        workspaceId,
        ativo: true,
      },
    });

    if (!cotacaoDb) {
      throw new NotFoundException('Cotação avulsa não encontrada.');
    }

    const aggregate = CotacaoAvulsaAggregate.reconstituir({
      id: cotacaoDb.id,
      workspaceId: cotacaoDb.workspaceId,
      itemWishlistId: cotacaoDb.itemWishlistId,
      nomeLoja: cotacaoDb.nomeLoja,
      preco: Number(cotacaoDb.preco),
      url: cotacaoDb.url,
      observacoes: cotacaoDb.observacoes,
      versao: cotacaoDb.versao,
      ativo: cotacaoDb.ativo,
      dataCriacao: cotacaoDb.dataCriacao,
      dataAtualizacao: cotacaoDb.dataAtualizacao,
    });

    aggregate.desativar();

    return await this.prisma.cotacaoAvulsa.update({
      where: { id },
      data: {
        ativo: aggregate.ativo,
        dataAtualizacao: aggregate.dataAtualizacao,
      },
    });
  }

  async obterComparadorItem(workspaceId: string, itemWishlistId: string) {
    return await this.comparadorCotacoesReadModelService.obterComparativo(
      workspaceId,
      itemWishlistId,
    );
  }

  async atualizarPrecoLink(
    workspaceId: string,
    linkId: string,
    dto: AtualizarPrecoLinkDto,
  ) {
    const link = await this.prisma.linkProduto.findFirst({
      where: {
        id: linkId,
        ativo: true,
        produto: { workspaceId },
      },
    });

    if (!link) {
      throw new NotFoundException(
        'Link de produto não encontrado para este workspace.',
      );
    }

    await this.jobMonitoramentoPrecosService.processarLinkAtomico(
      link.id,
      link.versao,
      dto.preco,
    );

    return await this.prisma.linkProduto.findUnique({
      where: { id: linkId },
    });
  }

  async executarMonitoramentoPrecos(workspaceId: string) {
    return await this.jobMonitoramentoPrecosService.executarMonitoramentoPrecos(
      workspaceId,
    );
  }
}
