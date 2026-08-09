import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { SimulationSnapshot } from '../domain/services/simulador-cenarios.service';

@Injectable()
export class SimulationSnapshotBuilder {
  constructor(private readonly prisma: PrismaService) {}

  async buildSnapshot(
    workspaceId: string,
    projetoId: string,
    referenceDate = new Date(),
  ): Promise<SimulationSnapshot> {
    const dbProjeto = await this.prisma.projeto.findFirst({
      where: {
        id: projetoId,
        workspaceId,
        ativo: true,
      },
      include: {
        etapas: {
          where: { ativo: true },
          orderBy: { ordem: 'asc' },
          include: {
            itens: {
              where: { ativo: true },
              include: {
                itemWishlist: {
                  include: {
                    cotacoes: true,
                    cotacoesAvulsas: { where: { ativo: true } },
                  },
                },
                meta: {
                  include: { aportes: true },
                },
              },
            },
          },
        },
      },
    });

    if (!dbProjeto) {
      throw new NotFoundException('Projeto não encontrado ou inativo.');
    }

    return {
      referenceDate,
      projeto: {
        id: dbProjeto.id,
        nome: dbProjeto.nome,
        versao: dbProjeto.versao,
        status: dbProjeto.status,
        orcamentoEstimado: dbProjeto.orcamentoEstimado
          ? new Decimal(dbProjeto.orcamentoEstimado.toString())
          : null,
        dataInicioPrevista: dbProjeto.dataInicioPrevista,
        dataFimPrevista: dbProjeto.dataFimPrevista,
      },
      etapas: dbProjeto.etapas.map((etapa) => ({
        id: etapa.id,
        nome: etapa.nome,
        ordem: etapa.ordem,
        status: etapa.status,
        versao: etapa.versao,
        dataInicio: etapa.dataInicio,
        dataConclusao: etapa.dataConclusao,
        itens: etapa.itens.map((item) => {
          let wish: any = null;
          if (item.itemWishlist && item.itemWishlist.ativo !== false) {
            const w = item.itemWishlist;
            const precoCalculado = this.determinarPrecoWishlist(w);
            wish = {
              id: w.id,
              nome: w.nome,
              status: w.status,
              preco: precoCalculado,
              diasEsfriamento: w.diasEsfriamento ?? 7,
              inicioEsfriamento: w.inicioEsfriamento ? new Date(w.inicioEsfriamento) : null,
              fimEsfriamento: w.fimEsfriamento ? new Date(w.fimEsfriamento) : null,
            };
          }

          let meta: any = null;
          if (item.meta && item.meta.dataExclusao === null) {
            const m = item.meta;
            const acum = (m.aportes || []).reduce(
              (acc: Decimal, ap: any) => acc.plus(new Decimal(ap.valor.toString())),
              new Decimal(0),
            );
            meta = {
              id: m.id,
              nome: m.nome,
              status: m.status,
              valorAlvo: new Decimal(m.valorAlvo.toString()),
              valorAcumulado: acum,
            };
          }

          return {
            id: item.id,
            itemWishlist: wish,
            meta,
          };
        }),
      })),
    };
  }

  private determinarPrecoWishlist(wishlist: any): Decimal {
    if (wishlist.precoAlvo && Number(wishlist.precoAlvo) > 0) {
      return new Decimal(wishlist.precoAlvo.toString());
    }

    const precosNormais = (wishlist.cotacoes || [])
      .map((c: any) => Number(c.preco))
      .filter((p: number) => !isNaN(p) && p > 0);

    const precosAvulsos = (wishlist.cotacoesAvulsas || [])
      .map((c: any) => Number(c.preco))
      .filter((p: number) => !isNaN(p) && p > 0);

    const todosPrecos = [...precosNormais, ...precosAvulsos];

    if (todosPrecos.length > 0) {
      const minPreco = Math.min(...todosPrecos);
      return new Decimal(minPreco.toString());
    }

    if (wishlist.valorCompra && Number(wishlist.valorCompra) > 0) {
      return new Decimal(wishlist.valorCompra.toString());
    }

    return new Decimal(0);
  }
}
