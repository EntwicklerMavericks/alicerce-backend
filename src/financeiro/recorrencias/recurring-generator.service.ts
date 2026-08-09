import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { YearMonth } from '../domain/value-objects/year-month.vo';
import { Prisma } from '@prisma/client';

@Injectable()
export class RecurringGeneratorService {
  private readonly logger = new Logger(RecurringGeneratorService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Processador de Recorrência por Competência (Ano, Mês).
   * Totalmente idempotente e imune a duplicações devido à chave de unicidade @@unique([regraRecorrenciaId, competenciaAno, competenciaMes]).
   */
  async processarCompetencia(target: YearMonth, workspaceId?: string): Promise<number> {
    const inicioDaCompetencia = new Date(target.ano, target.mes - 1, 1);
    const fimDaCompetencia = new Date(target.ano, target.mes, 0, 23, 59, 59, 999);

    const regras = await this.prisma.regraRecorrencia.findMany({
      where: {
        status: 'ATIVA',
        ...(workspaceId ? { workspaceId } : {}),
        dataInicio: { lte: fimDaCompetencia },
        OR: [{ dataFim: null }, { dataFim: { gte: inicioDaCompetencia } }],
      },
    });

    let totalGerados = 0;

    for (const regra of regras) {
      try {
        await this.prisma.$transaction(async (tx) => {
          // Calcula dia útil/efetivo de vencimento dentro do mês
          const ultimoDiaDoMes = fimDaCompetencia.getDate();
          const diaEfetivo = Math.min(regra.diaVencimento, ultimoDiaDoMes);
          const dataVencimento = new Date(target.ano, target.mes - 1, diaEfetivo);

          let referenciaId = '';

          if (regra.tipo === 'RECEITA') {
            const receita = await tx.receita.create({
              data: {
                workspaceId: regra.workspaceId,
                descricao: `${regra.descricao} (${target.formatarExibicao()})`,
                valor: regra.valor,
                data: dataVencimento,
                categoriaId: regra.categoriaId,
                carteiraId: regra.carteiraId,
                statusLiquidacao: 'PENDENTE',
                statusDocumento: 'ATIVO',
                origemRecorrenciaId: regra.id,
              },
            });
            referenciaId = receita.id;
          } else {
            const despesa = await tx.despesa.create({
              data: {
                workspaceId: regra.workspaceId,
                descricao: `${regra.descricao} (${target.formatarExibicao()})`,
                valor: regra.valor,
                dataVencimento: dataVencimento,
                categoriaId: regra.categoriaId,
                carteiraId: regra.carteiraId,
                statusLiquidacao: 'PENDENTE',
                statusDocumento: 'ATIVO',
                origemRecorrenciaId: regra.id,
              },
            });
            referenciaId = despesa.id;
          }

          // Grava a chave de execução idempotente
          await tx.execucaoRecorrencia.create({
            data: {
              regraRecorrenciaId: regra.id,
              competenciaAno: target.ano,
              competenciaMes: target.mes,
              referenciaId,
            },
          });

          totalGerados++;
          this.logger.log(
            `Recorrência ${regra.descricao} gerada para competência ${target.formatarISO()} (Ref: ${referenciaId})`,
          );
        });
      } catch (err: any) {
        // Se já foi gerado para esta competência (Prisma error P2002), ignora silenciosamente
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          this.logger.debug(
            `Regra ${regra.id} já possui execução para a competência ${target.formatarISO()}. Ignorando.`,
          );
          continue;
        }
        this.logger.error(`Erro ao processar regra de recorrência ${regra.id}: ${err.message}`, err.stack);
      }
    }

    return totalGerados;
  }
}
