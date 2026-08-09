import { Injectable, Inject, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  FONTE_COTACAO_PROVIDER,
  FonteCotacaoProvider,
} from '../providers/fonte-cotacao.provider';
import { ConcurrencyConflictException } from '../../../domain/exceptions/concurrency-conflict.exception';

export interface ResultadoMonitoramentoPrecos {
  processados: number;
  atualizados: number;
  erros: number;
}

@Injectable()
export class JobMonitoramentoPrecosService {
  private readonly logger = new Logger(JobMonitoramentoPrecosService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(FONTE_COTACAO_PROVIDER)
    private readonly fonteCotacaoProvider: any,
  ) {}

  async executarMonitoramentoPrecos(
    workspaceId?: string,
  ): Promise<ResultadoMonitoramentoPrecos> {
    const where: any = { ativo: true };
    if (workspaceId) {
      where.produto = { workspaceId };
    }

    const links = await this.prisma.linkProduto.findMany({ where });

    let processados = 0;
    let atualizados = 0;
    let erros = 0;

    for (const link of links) {
      processados++;

      let novoPreco: number;
      try {
        // Chamada ao provider FORA da transação MySQL
        novoPreco = await this.fonteCotacaoProvider.obterPreco(link);
      } catch (err: any) {
        erros++;
        this.logger.error(
          `Erro ao obter preço da fonte para o link ${link.id}: ${err.message}`,
          err.stack,
        );
        continue;
      }

      try {
        // Execução atômica por link com controle de concorrência
        const atualizou = await this.processarLinkAtomico(link.id, link.versao, novoPreco);
        if (atualizou) {
          atualizados++;
        }
      } catch (err: any) {
        erros++;
        this.logger.error(
          `Falha ao atualizar preço para o link ${link.id}: ${err.message}`,
          err.stack,
        );
      }
    }

    return { processados, atualizados, erros };
  }

  async processarLinkAtomico(
    linkId: string,
    versaoEsperada: number,
    novoPreco: number,
  ): Promise<boolean> {
    return await this.prisma.$transaction(async (tx) => {
      const linkAtual = await tx.linkProduto.findUnique({
        where: { id: linkId },
      });

      if (!linkAtual || !linkAtual.ativo) {
        return false;
      }

      // Revalida a versão do LinkProduto (Optimistic Locking)
      if (linkAtual.versao !== versaoEsperada) {
        throw new ConcurrencyConflictException(
          `Conflito de concorrência no link ${linkId}: versão esperada ${versaoEsperada}, versão atual ${linkAtual.versao}`,
        );
      }

      const precoAtualNum = Number(linkAtual.preco);
      const novoPrecoNum = Number(novoPreco);

      // Se novoPreco === linkProduto.preco ➔ NO-OP
      if (novoPrecoNum === precoAtualNum) {
        return false;
      }

      // Se novoPreco !== linkProduto.preco ➔ Atualiza LinkProduto e insere HistoricoPreco na mesma transação
      await tx.linkProduto.update({
        where: { id: linkId, versao: linkAtual.versao },
        data: {
          preco: novoPrecoNum,
          versao: { increment: 1 },
          ultimaVerificacao: new Date(),
        },
      });

      await tx.historicoPreco.create({
        data: {
          linkProdutoId: linkId,
          preco: novoPrecoNum,
          data: new Date(),
        },
      });

      return true;
    });
  }
}
