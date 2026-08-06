import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CriarCarteiraDto } from './dto/criar-carteira.dto';
import { AtualizarCarteiraDto } from './dto/atualizar-carteira.dto';
import { TransferirFundosDto } from './dto/transferir-fundos.dto';

@Injectable()
export class CarteirasService {
  constructor(private readonly prisma: PrismaService) {}

  async criar(workspaceId: string, usuarioId: string, dto: CriarCarteiraDto) {
    return this.prisma.$transaction(async (tx) => {
      if (dto.padrao) {
        await tx.carteira.updateMany({
          where: { workspaceId, padrao: true },
          data: { padrao: false },
        });
      }

      const carteira = await tx.carteira.create({
        data: {
          workspaceId,
          pessoaId: dto.pessoaId || null,
          nome: dto.nome.trim(),
          tipo: dto.tipo,
          permiteSaldoNegativo: dto.permiteSaldoNegativo ?? true,
          cor: dto.cor || '#8A05BE',
          icone: dto.icone || 'account_balance',
          padrao: dto.padrao || false,
          ativo: true,
        },
      });

      let saldoInicial = 0;
      if (dto.saldoInicial && dto.saldoInicial > 0) {
        saldoInicial = Number(dto.saldoInicial);
        await tx.movimentacaoFinanceira.create({
          data: {
            workspaceId,
            carteiraId: carteira.id,
            criadoPorId: usuarioId,
            tipo: 'SALDO_INICIAL',
            valor: new Prisma.Decimal(saldoInicial),
            descricao: 'Saldo inicial de abertura de conta',
            data: new Date(),
          },
        });
      }

      return {
        ...carteira,
        saldoCalculado: saldoInicial,
      };
    });
  }

  async listarPorWorkspace(workspaceId: string) {
    const carteiras = await this.prisma.carteira.findMany({
      where: { workspaceId, ativo: true },
      include: {
        pessoa: { select: { id: true, nome: true } },
      },
      orderBy: [{ padrao: 'desc' }, { dataCriacao: 'asc' }],
    });

    const saldosProjetados = await this.calcularSaldosDoWorkspace(workspaceId);

    const carteirasComSaldo = carteiras.map((c) => {
      const saldo = saldosProjetados.get(c.id) || 0;
      return {
        ...c,
        saldoCalculado: saldo,
        saldoNegativoAlerta: saldo < 0,
      };
    });

    const saldoTotalConsolidado = carteirasComSaldo.reduce(
      (acc, c) => acc + c.saldoCalculado,
      0,
    );

    return {
      carteiras: carteirasComSaldo,
      saldoTotalConsolidado,
    };
  }

  async obterPorId(workspaceId: string, id: string) {
    const carteira = await this.prisma.carteira.findFirst({
      where: { id, workspaceId, ativo: true },
      include: { pessoa: true },
    });

    if (!carteira) {
      throw new NotFoundException('Carteira não encontrada.');
    }

    const saldo = await this.calcularSaldoDeCarteira(id);
    return {
      ...carteira,
      saldoCalculado: saldo,
      saldoNegativoAlerta: saldo < 0,
    };
  }

  async obterExtrato(workspaceId: string, id: string) {
    const carteira = await this.obterPorId(workspaceId, id);

    const movimentacoes = await this.prisma.movimentacaoFinanceira.findMany({
      where: { carteiraId: id, workspaceId },
      orderBy: { data: 'desc' },
      take: 50,
    });

    return {
      carteira,
      movimentacoes: movimentacoes.map((m) => ({
        ...m,
        valor: Number(m.valor),
      })),
    };
  }

  async transferirFundos(workspaceId: string, usuarioId: string, dto: TransferirFundosDto) {
    if (dto.carteiraOrigemId === dto.carteiraDestinoId) {
      throw new BadRequestException('A conta de origem e destino devem ser diferentes.');
    }

    const valor = Number(dto.valor);
    if (valor <= 0) {
      throw new BadRequestException('O valor da transferência deve ser maior que zero.');
    }

    const origem = await this.obterPorId(workspaceId, dto.carteiraOrigemId);
    const destino = await this.obterPorId(workspaceId, dto.carteiraDestinoId);

    const saldoOrigemPosTransferencia = origem.saldoCalculado - valor;

    if (saldoOrigemPosTransferencia < 0 && !origem.permiteSaldoNegativo) {
      throw new BadRequestException(
        `Saldo insuficiente na conta "${origem.nome}". Esta conta não permite saldo negativo.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const registroTransferencia = await tx.transferenciaCarteira.create({
        data: {
          workspaceId,
          carteiraOrigemId: origem.id,
          carteiraDestinoId: destino.id,
          valor: new Prisma.Decimal(valor),
          descricao: dto.descricao || `Transferência para ${destino.nome}`,
          data: new Date(),
        },
      });

      // Lançamento no Ledger: Saída na Origem
      await tx.movimentacaoFinanceira.create({
        data: {
          workspaceId,
          carteiraId: origem.id,
          criadoPorId: usuarioId,
          tipo: 'TRANSFERENCIA_SAIDA',
          valor: new Prisma.Decimal(-valor),
          descricao: dto.descricao || `Transferência para ${destino.nome}`,
          transferenciaId: registroTransferencia.id,
          data: new Date(),
        },
      });

      // Lançamento no Ledger: Entrada no Destino
      await tx.movimentacaoFinanceira.create({
        data: {
          workspaceId,
          carteiraId: destino.id,
          criadoPorId: usuarioId,
          tipo: 'TRANSFERENCIA_ENTRADA',
          valor: new Prisma.Decimal(valor),
          descricao: dto.descricao || `Transferência de ${origem.nome}`,
          transferenciaId: registroTransferencia.id,
          data: new Date(),
        },
      });

      return {
        sucesso: true,
        transferencia: registroTransferencia,
        saldoOrigemAtual: saldoOrigemPosTransferencia,
        saldoDestinoAtual: destino.saldoCalculado + valor,
        saldoNegativoAviso: saldoOrigemPosTransferencia < 0,
      };
    });
  }

  async remover(workspaceId: string, id: string) {
    await this.obterPorId(workspaceId, id);
    await this.prisma.carteira.update({
      where: { id },
      data: { ativo: false },
    });
  }

  private async calcularSaldoDeCarteira(carteiraId: string): Promise<number> {
    const agregacao = await this.prisma.movimentacaoFinanceira.aggregate({
      where: { carteiraId },
      _sum: { valor: true },
    });

    return Number(agregacao._sum.valor || 0);
  }

  private async calcularSaldosDoWorkspace(workspaceId: string): Promise<Map<string, number>> {
    const agrupamento = await this.prisma.movimentacaoFinanceira.groupBy({
      by: ['carteiraId'],
      where: { workspaceId },
      _sum: { valor: true },
    });

    const mapa = new Map<string, number>();
    agrupamento.forEach((g) => {
      mapa.set(g.carteiraId, Number(g._sum.valor || 0));
    });

    return mapa;
  }
}
