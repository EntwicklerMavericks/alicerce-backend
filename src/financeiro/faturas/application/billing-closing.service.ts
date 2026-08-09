import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BillingCycleService } from '../domain/services/billing-cycle.service';
import { InvoiceAggregate } from '../domain/entities/invoice.aggregate';
import { YearMonth } from '../../domain/value-objects/year-month.vo';
import { Money } from '../../domain/value-objects/money.vo';

@Injectable()
export class BillingClosingService {
  private readonly logger = new Logger(BillingClosingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Application Service: Orquestra o fechamento automático de faturas vencidas.
   * Varre os cartões de crédito e fecha faturas ABERTAS caso dataAtual >= diaFechamento.
   */
  async processarFechamentos(dataAtual: Date = new Date(), workspaceId?: string): Promise<number> {
    const cartoes = await this.prisma.cartaoCredito.findMany({
      where: {
        ativo: true,
        ...(workspaceId ? { workspaceId } : {}),
      },
    });

    let totalFechadas = 0;

    for (const cartao of cartoes) {
      const diaFechamento = cartao.diaFechamento;
      const diaAtual = dataAtual.getDate();

      // Se a data atual alcançou/ultrapassou o dia de fechamento
      if (diaAtual >= diaFechamento) {
        const competenciaAtual = YearMonth.daData(dataAtual);

        const faturaDb = await this.prisma.faturaCartao.findUnique({
          where: {
            cartaoId_mes_ano: {
              cartaoId: cartao.id,
              mes: competenciaAtual.mes,
              ano: competenciaAtual.ano,
            },
          },
          include: { parcelas: true },
        });

        if (faturaDb && faturaDb.status === 'ABERTA') {
          // Reconstruir o Agregado de Domínio
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
            competenciaAtual,
            faturaDb.dataVencimento,
            'ABERTA',
            parcelasDomain,
            faturaDb.carteiraId ?? undefined,
            faturaDb.dataPagamento ?? undefined,
          );

          // Invocação pura do domínio
          fatura.fechar();

          // Persistência das alterações
          await this.prisma.$transaction([
            this.prisma.faturaCartao.update({
              where: { id: fatura.id },
              data: { status: 'FECHADA' },
            }),
            this.prisma.parcelaCartao.updateMany({
              where: { faturaId: fatura.id, status: 'PENDENTE' },
              data: { status: 'FATURADA' },
            }),
          ]);

          totalFechadas++;
          this.logger.log(
            `Fatura ${fatura.id} do cartão ${cartao.nome} fechada com sucesso para a competência ${competenciaAtual.formatarISO()}`,
          );
        }
      }
    }

    return totalFechadas;
  }
}
