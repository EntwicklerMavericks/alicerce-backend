import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CriarLojaDto } from './dto/criar-loja.dto';
import { LojaAggregate } from '../domain/entities/loja.aggregate';

@Injectable()
export class LojasService {
  constructor(private readonly prisma: PrismaService) {}

  async criar(workspaceId: string, dto: CriarLojaDto) {
    // Usuários normais sempre criam lojas do próprio workspace (sistema = false)
    const lojaAggregate = new LojaAggregate(
      'temp-id',
      workspaceId,
      dto.nome,
      false,
      dto.urlWebsite || null,
      dto.urlLogo || null,
      true,
    );

    return this.prisma.loja.create({
      data: {
        workspaceId: lojaAggregate.workspaceId,
        nome: lojaAggregate.nome,
        urlWebsite: lojaAggregate.urlWebsite,
        urlLogo: lojaAggregate.urlLogo,
        sistema: false,
        ativo: true,
      },
    });
  }

  async listarPorWorkspace(workspaceId: string) {
    return this.prisma.loja.findMany({
      where: {
        ativo: true,
        OR: [
          { workspaceId },
          { sistema: true },
        ],
      },
      orderBy: { nome: 'asc' },
    });
  }

  async obterPorId(workspaceId: string, id: string) {
    const loja = await this.prisma.loja.findFirst({
      where: {
        id,
        ativo: true,
        OR: [
          { workspaceId },
          { sistema: true },
        ],
      },
    });

    if (!loja) {
      throw new NotFoundException('Loja não encontrada.');
    }

    return loja;
  }

  async atualizar(workspaceId: string, id: string, dto: Partial<CriarLojaDto>) {
    const lojaRaw = await this.obterPorId(workspaceId, id);

    const aggregate = new LojaAggregate(
      lojaRaw.id,
      lojaRaw.workspaceId,
      lojaRaw.nome,
      lojaRaw.sistema,
      lojaRaw.urlWebsite,
      lojaRaw.urlLogo,
      lojaRaw.ativo,
      lojaRaw.dataCriacao,
    );

    if (!aggregate.podeSerEditadaPor(workspaceId)) {
      throw new ForbiddenException('Lojas globais do sistema não podem ser alteradas.');
    }

    aggregate.atualizar(dto.nome, dto.urlWebsite, dto.urlLogo);

    return this.prisma.loja.update({
      where: { id },
      data: {
        nome: aggregate.nome,
        urlWebsite: aggregate.urlWebsite,
        urlLogo: aggregate.urlLogo,
      },
    });
  }

  async remover(workspaceId: string, id: string) {
    const lojaRaw = await this.obterPorId(workspaceId, id);

    const aggregate = new LojaAggregate(
      lojaRaw.id,
      lojaRaw.workspaceId,
      lojaRaw.nome,
      lojaRaw.sistema,
      lojaRaw.urlWebsite,
      lojaRaw.urlLogo,
      lojaRaw.ativo,
      lojaRaw.dataCriacao,
    );

    if (!aggregate.podeSerEditadaPor(workspaceId)) {
      throw new ForbiddenException('Lojas globais do sistema não podem ser excluídas.');
    }

    return this.prisma.loja.update({
      where: { id },
      data: { ativo: false },
    });
  }
}
