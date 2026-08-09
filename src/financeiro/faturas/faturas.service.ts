import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LedgerService } from '../ledger/ledger.service';
import { LedgerEntry } from '../ledger/entities/ledger-entry';
import { PagarFaturaDto } from './dto/pagar-fatura.dto';
import { Money } from '../domain/value-objects/money.vo';
import { InvoiceAggregate } from './domain/entities/invoice.aggregate';
import { YearMonth } from '../domain/value-objects/year-month.vo';
import { Prisma } from '@prisma/client';

@Injectable()
export class FaturasService {
  private readonly logger = new Logger(FaturasService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ledgerService: LedgerService,
  ) {}

  async obterFaturasDoCartao(cartaoId: string) {
    const faturas = await this.prisma.faturaCartao.findMany({
      where: { cartaoId },
      include: {
        parcelas: {
          include: {
            compra: true,
          },
        },
      },
      orderBy: [{ ano: 'desc' }, { mes: 'desc' }],
    });

    return faturas.map((f) => {
      const valorTotal = f.parcelas
        .filter((p) => p.status === 'FATURADA' || p.status === 'PENDENTE')
        .reduce((acc, p) => acc + Number(p.valor), 0);

      return {
        ...f,
        valorTotal,
      };
    });
  }

  async obterFaturaPorId(faturaId: string) {
    const fatura = await this.prisma.faturaCartao.findUnique({
      where: { id: faturaId },
      include: {
        cartao: true,
        parcelas: {
          include: {
            compra: true,
          },
        },
      },
    });

    if (!fatura) {
      throw new NotFoundException(`Fatura com ID ${faturaId} não encontrada.`);
    }

    const valorTotal = fatura.parcelas
      .filter((p) => p.status === 'FATURADA' || p.status === 'PENDENTE')
      .reduce((acc, p) => acc + Number(p.valor), 0);

    return {
      ...fatura,
      valorTotal,
    };
  }

  /**
   * REGRA DE OURO DO FINANCIAL LEDGER:
   * O pagamento da fatura é a ÚNICA operação em cartão que altera o Ledger!
   * Baixa atômica CAS (Compare-and-swap) + Registro no Financial Ledger.
   */
  async pagarFatura(faturaId: string, dto: PagarFaturaDto, criadoPorId?: string) {
    const faturaDb = await this.prisma.faturaCartao.findUnique({
      where: { id: faturaId },
      include: {
        cartao: true,
        parcelas: true,
      },
    });

    if (!faturaDb) {
      throw new NotFoundException(`Fatura ${faturaId} não encontrada.`);
    }

    if (faturaDb.status === 'PAGA') {
      throw new ConflictException('Esta fatura já se encontra PAGA.');
    }

    // Reconstruir InvoiceAggregate para recalcular valorTotal derivado de parcelas
    const parcelasDomain = faturaDb.parcelas.map((p) => ({
      id: p.id,
      compraId: p.compraId,
      numero: p.numero,
      valor: Money.deReais(Number(p.valor)),
      competencia: YearMonth.deAnoMes(p.competenciaAno, p.competenciaMes),
      status: p.status as any,
    }));

    const fatura = new InvoiceAggregate(
      faturaDb.id,
      faturaDb.cartaoId,
      YearMonth.deAnoMes(faturaDb.mes, faturaDb.ano),
      faturaDb.dataVencimento,
      faturaDb.status as any,
      parcelasDomain,
    );

    const dataPagamento = dto.dataPagamento ? new Date(dto.dataPagamento) : new Date();

    // Invoca regra pura de domínio
    fatura.pagar(dto.carteiraId, dataPagamento);

    const totalMoney = fatura.valorTotal;

    if (totalMoney.isZero()) {
      throw new ConflictException('Não é possível pagar uma fatura com valor zerado.');
    }

    // Execução atômica no banco com CAS updateMany count check
    return await this.prisma.$transaction(async (tx) => {
      const updateResult = await tx.faturaCartao.updateMany({
        where: {
          id: faturaId,
          status: { in: ['ABERTA', 'FECHADA'] },
        },
        data: {
          status: 'PAGA',
          carteiraId: dto.carteiraId,
          dataPagamento,
          valorPago: new Prisma.Decimal(totalMoney.paraReais()),
        },
      });

      if (updateResult.count === 0) {
        throw new ConflictException('Concorrência detectada: a fatura já foi quitada por outra sessão.');
      }

      // Atualiza parcelas para PAGA
      await tx.parcelaCartao.updateMany({
        where: { faturaId },
        data: { status: 'PAGA' },
      });

      // REGRA DE OURO: Registrar 1 único lançamento no Financial Ledger (DESPESA)
      const ledgerEntry = LedgerEntry.criar({
        workspaceId: faturaDb.cartao.workspaceId,
        carteiraId: dto.carteiraId,
        tipo: 'SAIDA' as any,
        valor: totalMoney,
        data: dataPagamento,
        observacao: `Pagamento Fatura Cartão ${faturaDb.cartao.nome} (${fatura.competencia.formatarExibicao()})`,
        referenciaId: faturaId,
        referenciaTipo: 'DESPESA' as any,
        origem: 'SISTEMA' as any,
        criadoPorId,
      });

      await this.ledgerService.registrar(tx, ledgerEntry);

      this.logger.log(`Fatura ${faturaId} quitada com sucesso via carteira ${dto.carteiraId}. Ledger registrado.`);

      return {
        id: faturaId,
        status: 'PAGA',
        valorPago: totalMoney.paraReais(),
        dataPagamento,
      };
    });
  }
}
