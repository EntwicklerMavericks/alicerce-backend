import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CriarCartaoDto } from './dto/criar-cartao.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CartoesService {
  constructor(private readonly prisma: PrismaService) {}

  async criarCartao(workspaceId: string, dto: CriarCartaoDto) {
    return this.prisma.cartaoCredito.create({
      data: {
        workspaceId,
        nome: dto.nome,
        bandeira: (dto.bandeira as any) || 'MASTERCARD',
        ultimosDigitos: dto.ultimosDigitos,
        limiteTotal: new Prisma.Decimal(dto.limiteTotal),
        diaFechamento: dto.diaFechamento,
        diaVencimento: dto.diaVencimento,
        cor: dto.cor || '#820ad1',
        icone: dto.icone || 'credit_card',
      },
    });
  }

  async listarCartoes(workspaceId: string) {
    const cartoes = await this.prisma.cartaoCredito.findMany({
      where: { workspaceId, ativo: true },
      include: {
        faturas: {
          include: {
            parcelas: true,
          },
        },
      },
    });

    return cartoes.map((cartao) => {
      // PROJEÇÃO DE LIMITE CALCULADO:
      // limiteComprometido = soma das parcelas que NÃO estão CANCELADAS e NÃO estão PAGAS
      let limiteComprometido = 0;
      for (const fatura of cartao.faturas) {
        for (const parcela of fatura.parcelas) {
          if (parcela.status !== 'CANCELADA' && parcela.status !== 'PAGA') {
            limiteComprometido += Number(parcela.valor);
          }
        }
      }

      const limiteTotal = Number(cartao.limiteTotal);
      const limiteDisponivel = Math.max(0, limiteTotal - limiteComprometido);

      const { faturas, ...dadosCartao } = cartao;

      return {
        ...dadosCartao,
        limiteTotal,
        limiteComprometido,
        limiteDisponivel,
      };
    });
  }

  async obterPorId(id: string) {
    const cartao = await this.prisma.cartaoCredito.findUnique({
      where: { id },
      include: {
        faturas: {
          include: {
            parcelas: true,
          },
        },
      },
    });

    if (!cartao) {
      throw new NotFoundException(`Cartão de Crédito ${id} não encontrado.`);
    }

    let limiteComprometido = 0;
    for (const fatura of cartao.faturas) {
      for (const parcela of fatura.parcelas) {
        if (parcela.status !== 'CANCELADA' && parcela.status !== 'PAGA') {
          limiteComprometido += Number(parcela.valor);
        }
      }
    }

    const limiteTotal = Number(cartao.limiteTotal);
    const limiteDisponivel = Math.max(0, limiteTotal - limiteComprometido);

    return {
      ...cartao,
      limiteTotal,
      limiteComprometido,
      limiteDisponivel,
    };
  }
}
