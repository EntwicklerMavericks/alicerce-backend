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

  async atualizarCartao(id: string, workspaceId: string, dto: Partial<CriarCartaoDto>) {
    const cartao = await this.prisma.cartaoCredito.findFirst({
      where: { id, workspaceId, ativo: true },
    });
    if (!cartao) {
      throw new NotFoundException(`Cartão de crédito ${id} não encontrado.`);
    }

    const dataToUpdate: Prisma.CartaoCreditoUpdateInput = {};
    if (dto.nome !== undefined) dataToUpdate.nome = dto.nome;
    if (dto.bandeira !== undefined) dataToUpdate.bandeira = dto.bandeira as any;
    if (dto.ultimosDigitos !== undefined) dataToUpdate.ultimosDigitos = dto.ultimosDigitos;
    if (dto.limiteTotal !== undefined) dataToUpdate.limiteTotal = new Prisma.Decimal(dto.limiteTotal);
    if (dto.diaFechamento !== undefined) dataToUpdate.diaFechamento = dto.diaFechamento;
    if (dto.diaVencimento !== undefined) dataToUpdate.diaVencimento = dto.diaVencimento;
    if (dto.cor !== undefined) dataToUpdate.cor = dto.cor;
    if (dto.icone !== undefined) dataToUpdate.icone = dto.icone;

    return this.prisma.cartaoCredito.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async removerCartao(id: string, workspaceId: string) {
    const cartao = await this.prisma.cartaoCredito.findFirst({
      where: { id, workspaceId },
    });
    if (!cartao) {
      throw new NotFoundException(`Cartão de crédito ${id} não encontrado.`);
    }

    return this.prisma.cartaoCredito.update({
      where: { id },
      data: { ativo: false },
    });
  }
}
