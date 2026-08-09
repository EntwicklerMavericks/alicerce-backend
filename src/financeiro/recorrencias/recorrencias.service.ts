import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CriarRegraRecorrenciaDto } from './dto/criar-regra-recorrencia.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class RecorrenciasService {
  constructor(private readonly prisma: PrismaService) {}

  async criarRegra(workspaceId: string, dto: CriarRegraRecorrenciaDto) {
    return this.prisma.regraRecorrencia.create({
      data: {
        workspaceId,
        tipo: dto.tipo,
        descricao: dto.descricao,
        valor: new Prisma.Decimal(dto.valor),
        diaVencimento: dto.diaVencimento,
        categoriaId: dto.categoriaId,
        carteiraId: dto.carteiraId,
        status: 'ATIVA',
        dataInicio: new Date(dto.dataInicio),
        dataFim: dto.dataFim ? new Date(dto.dataFim) : null,
      },
    });
  }

  async listarRegras(workspaceId: string) {
    return this.prisma.regraRecorrencia.findMany({
      where: { workspaceId },
      include: {
        categoria: true,
        carteira: true,
      },
      orderBy: { dataCriacao: 'desc' },
    });
  }

  async alternarStatus(id: string, status: 'ATIVA' | 'PAUSADA' | 'CANCELADA') {
    const regra = await this.prisma.regraRecorrencia.findUnique({
      where: { id },
    });

    if (!regra) {
      throw new NotFoundException(`Regra recorrente ${id} não encontrada.`);
    }

    return this.prisma.regraRecorrencia.update({
      where: { id },
      data: { status },
    });
  }
}
