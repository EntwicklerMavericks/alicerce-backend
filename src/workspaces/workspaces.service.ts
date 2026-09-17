import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  async listarWorkspacesDoUsuario(usuarioId: string) {
    const membros = await this.prisma.membroWorkspace.findMany({
      where: { usuarioId },
      include: {
        workspace: true,
      },
      orderBy: { dataEntrada: 'asc' },
    });

    return membros.map((m) => ({
      id: m.workspace.id,
      nome: m.workspace.nome,
      tipo: m.workspace.tipo,
      papel: m.papel,
      dataCriacao: m.workspace.dataCriacao,
    }));
  }

  async obterPorId(workspaceId: string, usuarioId: string) {
    const membro = await this.prisma.membroWorkspace.findUnique({
      where: {
        workspaceId_usuarioId: {
          workspaceId,
          usuarioId,
        },
      },
      include: {
        workspace: {
          include: {
            carteiras: { where: { ativo: true } },
            cartoesCredito: { where: { ativo: true } },
          },
        },
      },
    });

    if (!membro) {
      throw new NotFoundException('Workspace não encontrado ou sem acesso.');
    }

    return {
      ...membro.workspace,
      papel: membro.papel,
    };
  }

  /**
   * Zera e limpa com segurança todos os dados financeiros do workspace,
   * retornando-o ao estado padrão inicial limpo (R$ 0,00).
   */
  async resetarDadosWorkspace(workspaceId: string, usuarioId: string) {
    const membro = await this.prisma.membroWorkspace.findUnique({
      where: {
        workspaceId_usuarioId: {
          workspaceId,
          usuarioId,
        },
      },
    });

    if (!membro) {
      throw new NotFoundException('Workspace não encontrado ou sem acesso.');
    }

    if (membro.papel !== 'PROPRIETARIO' && membro.papel !== 'ADMINISTRADOR') {
      throw new ForbiddenException(
        'Apenas proprietários ou administradores podem zerar os dados do workspace.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Wishlist, Cotações e Projetos
      await tx.itemProjeto.deleteMany({ where: { workspaceId } });
      await tx.etapaProjeto.deleteMany({ where: { workspaceId } });
      await tx.projeto.deleteMany({ where: { workspaceId } });
      await tx.cotacao.deleteMany({ where: { itemWishlist: { workspaceId } } });
      await tx.cotacaoAvulsa.deleteMany({ where: { workspaceId } });
      await tx.historicoPreco.deleteMany({
        where: { linkProduto: { produto: { workspaceId } } },
      });
      await tx.linkProduto.deleteMany({
        where: { produto: { workspaceId } },
      });
      await tx.imagemProduto.deleteMany({
        where: { produto: { workspaceId } },
      });
      await tx.itemWishlist.deleteMany({ where: { workspaceId } });
      await tx.produto.deleteMany({ where: { workspaceId } });
      await tx.loja.deleteMany({ where: { workspaceId, sistema: false } });

      // 2. Metas e Aportes
      await tx.aporteMeta.deleteMany({ where: { meta: { workspaceId } } });
      await tx.meta.deleteMany({ where: { workspaceId } });

      // 3. Cartões, Parcelamentos e Faturas
      await tx.parcela.deleteMany({ where: { parcelamento: { workspaceId } } });
      await tx.parcelamento.deleteMany({ where: { workspaceId } });
      await tx.parcelaCartao.deleteMany({
        where: { compra: { cartao: { workspaceId } } },
      });
      await tx.compraCartao.deleteMany({
        where: { cartao: { workspaceId } },
      });
      await tx.faturaCartao.deleteMany({
        where: { cartao: { workspaceId } },
      });
      await tx.cartaoCredito.deleteMany({ where: { workspaceId } });

      // 4. Lançamentos, Movimentações e Transações
      await tx.movimentacaoFinanceira.deleteMany({ where: { workspaceId } });
      await tx.receita.deleteMany({ where: { workspaceId } });
      await tx.despesa.deleteMany({ where: { workspaceId } });
      await tx.transferenciaCarteira.deleteMany({ where: { workspaceId } });
      await tx.transacao.deleteMany({ where: { workspaceId } });
      await tx.execucaoRecorrencia.deleteMany({
        where: { regra: { workspaceId } },
      });
      await tx.regraRecorrencia.deleteMany({ where: { workspaceId } });
      await tx.orcamento.deleteMany({ where: { workspaceId } });
      await tx.projecao.deleteMany({ where: { workspaceId } });

      // 5. Salários e Pessoas
      await tx.ajusteSalario.deleteMany({
        where: { configSalario: { pessoa: { workspaceId } } },
      });
      await tx.salarioMensal.deleteMany({ where: { pessoa: { workspaceId } } });
      await tx.configSalario.deleteMany({ where: { pessoa: { workspaceId } } });
      await tx.pessoa.deleteMany({ where: { workspaceId } });

      // 6. Alertas
      await tx.alerta.deleteMany({ where: { workspaceId } });

      // 7. Carteiras: Garantir 1 carteira padrão zerada
      const carteiraPadrao = await tx.carteira.findFirst({
        where: { workspaceId, padrao: true },
      });

      if (carteiraPadrao) {
        await tx.carteira.update({
          where: { id: carteiraPadrao.id },
          data: { saldo: 0 },
        });
        await tx.carteira.deleteMany({
          where: { workspaceId, id: { not: carteiraPadrao.id } },
        });
      } else {
        await tx.carteira.deleteMany({ where: { workspaceId } });
        await tx.carteira.create({
          data: {
            workspaceId,
            nome: 'Conta Corrente',
            tipo: 'CONTA_CORRENTE',
            saldo: 0,
            padrao: true,
            icone: 'account_balance_wallet',
            cor: '#d8b87e',
          },
        });
      }

      return {
        sucesso: true,
        mensagem: 'Todos os dados financeiros do workspace foram zerados com sucesso.',
      };
    });
  }
}
