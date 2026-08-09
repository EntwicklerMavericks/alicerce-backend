import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LedgerEntry } from './entities/ledger-entry';
import { Prisma } from '@prisma/client';

@Injectable()
export class LedgerService {
  constructor(private readonly defaultPrisma: PrismaService) {}

  /**
   * Registra uma movimentação contábil imutável no Financial Ledger.
   * Acepta um Prisma transaction client (db) ou utiliza o PrismaService default.
   */
  async registrar(db: any, entry: LedgerEntry): Promise<void> {
    const prismaClient = db || this.defaultPrisma;

    await prismaClient.movimentacaoFinanceira.create({
      data: {
        id: entry.id,
        workspaceId: entry.workspaceId,
        carteiraId: entry.carteiraId,
        criadoPorId: entry.criadoPorId,
        tipo: entry.tipo,
        valor: new Prisma.Decimal(entry.valor.paraReais()),
        data: entry.data,
        referenciaTipo: entry.referenciaTipo,
        referenciaId: entry.referenciaId,
        origem: entry.origem,
        descricao: entry.observacao,
      },
    });
  }

  /**
   * Obtém o saldo global consolidado de movimentações no Ledger para um workspace.
   * Se referenceDate for fornecida, calcula o saldo acumulado até essa data.
   */
  async obterSaldoGlobal(workspaceId: string, referenceDate?: Date): Promise<number> {
    const whereClause: Prisma.MovimentacaoFinanceiraWhereInput = { workspaceId };
    if (referenceDate) {
      whereClause.data = { lte: referenceDate };
    }

    const agregacao = await this.defaultPrisma.movimentacaoFinanceira.aggregate({
      where: whereClause,
      _sum: { valor: true },
    });

    const total = Number(agregacao._sum?.valor || 0);
    if (isNaN(total) || !isFinite(total)) {
      return 0;
    }
    return Math.round(total * 100) / 100;
  }
}
