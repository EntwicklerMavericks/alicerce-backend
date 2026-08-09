import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CriarCompraCartaoDto } from './dto/criar-compra-cartao.dto';
import { BillingCycleService } from '../faturas/domain/services/billing-cycle.service';
import { Money } from '../domain/value-objects/money.vo';
import { Prisma } from '@prisma/client';

@Injectable()
export class ComprasCartaoService {
  private readonly logger = new Logger(ComprasCartaoService.name);

  constructor(private readonly prisma: PrismaService) {}

  async registrarCompra(dto: CriarCompraCartaoDto) {
    const cartao = await this.prisma.cartaoCredito.findUnique({
      where: { id: dto.cartaoId },
    });

    if (!cartao) {
      throw new NotFoundException(`Cartão de Crédito ${dto.cartaoId} não encontrado.`);
    }

    const dataCompra = new Date(dto.dataCompra);
    const moneyTotal = Money.deReais(dto.valorTotal);
    const qtdParcelas = dto.qtdParcelas || 1;

    // ALGORITMO DE CONGELAMENTO DE CENTAVOS NA DIVISÃO DE PARCELAS:
    // Ex: R$ 1.000,00 em 3x => R$ 333,33 / R$ 333,33 / R$ 333,34
    const totalCentavos = Math.round(dto.valorTotal * 100);
    const centavosPorParcelaBase = Math.floor(totalCentavos / qtdParcelas);
    const restoCentavos = totalCentavos % qtdParcelas;

    const valoresParcelasCentavos: number[] = [];
    for (let i = 0; i < qtdParcelas; i++) {
      // Adiciona o resto de centavos na última parcela
      const incremento = i === qtdParcelas - 1 ? restoCentavos : 0;
      valoresParcelasCentavos.push(centavosPorParcelaBase + incremento);
    }

    // Determina a primeira competência via BillingCycleService (Função Pura de Domínio)
    const primeiraCompetencia = BillingCycleService.calcularCompetenciaFatura(dataCompra, cartao.diaFechamento);

    return await this.prisma.$transaction(async (tx) => {
      // 1. Criar CompraCartao
      const compra = await tx.compraCartao.create({
        data: {
          cartaoId: cartao.id,
          categoriaId: dto.categoriaId,
          descricao: dto.descricao,
          valorTotal: new Prisma.Decimal(moneyTotal.paraReais()),
          qtdParcelas,
          dataCompra,
          observacoes: dto.observacoes,
        },
      });

      // 2. Gerar parcelas e associar às faturas correspondentes
      const parcelasCriadas: any[] = [];

      for (let i = 0; i < qtdParcelas; i++) {
        const competenciaParcela = primeiraCompetencia.adicionarMeses(i);
        const valorParcelaMoney = Money.deCentavos(BigInt(valoresParcelasCentavos[i]));

        // Encontrar ou Criar FaturaCartao para essa competência
        let fatura = await tx.faturaCartao.findUnique({
          where: {
            cartaoId_mes_ano: {
              cartaoId: cartao.id,
              mes: competenciaParcela.mes,
              ano: competenciaParcela.ano,
            },
          },
        });

        if (!fatura) {
          const dataVencimento = BillingCycleService.calcularDataVencimento(competenciaParcela, cartao.diaVencimento);
          fatura = await tx.faturaCartao.create({
            data: {
              cartaoId: cartao.id,
              mes: competenciaParcela.mes,
              ano: competenciaParcela.ano,
              dataVencimento,
              status: 'ABERTA',
            },
          });
        }

        if (fatura.status === 'FECHADA' || fatura.status === 'PAGA') {
          throw new ConflictException(
            `A fatura da competência ${competenciaParcela.formatarISO()} já se encontra ${fatura.status}. Novas compras não podem ser incluídas nesta fatura.`,
          );
        }

        // Criar a ParcelaCartao
        const parcela = await tx.parcelaCartao.create({
          data: {
            compraId: compra.id,
            faturaId: fatura.id,
            numero: i + 1,
            valor: new Prisma.Decimal(valorParcelaMoney.paraReais()),
            competenciaAno: competenciaParcela.ano,
            competenciaMes: competenciaParcela.mes,
            status: 'PENDENTE',
          },
        });

        parcelasCriadas.push(parcela);
      }

      this.logger.log(
        `Compra de R$ ${moneyTotal.paraReais()} em ${qtdParcelas}x registrada no cartão ${cartao.nome}. Zero efeito no Financial Ledger.`,
      );

      return {
        compra,
        qtdParcelasCriadas: parcelasCriadas.length,
        primeiraCompetencia: primeiraCompetencia.formatarISO(),
      };
    });
  }
}
