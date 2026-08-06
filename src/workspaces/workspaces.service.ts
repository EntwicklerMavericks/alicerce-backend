import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  async listarWorkspacesDoUsuario(usuarioId: string) {
    const membros = await this.prisma.membroWorkspace.findMany({
      where: { usuarioId },
      include: {
        workspace: true,
      },
      orderBy: { dataEntrada: 'asc' },
    });

    return membros.map((m) => ({
      id: m.workspace.id,
      nome: m.workspace.nome,
      tipo: m.workspace.tipo,
      papel: m.papel,
      dataCriacao: m.workspace.dataCriacao,
    }));
  }

  async obterPorId(workspaceId: string, usuarioId: string) {
    const membro = await this.prisma.membroWorkspace.findUnique({
      where: {
        workspaceId_usuarioId: {
          workspaceId,
          usuarioId,
        },
      },
      include: {
        workspace: {
          include: {
            carteiras: { where: { ativo: true } },
            cartoesCredito: { where: { ativo: true } },
          },
        },
      },
    });

    if (!membro) {
      throw new NotFoundException('Workspace não encontrado ou sem acesso.');
    }

    return {
      ...membro.workspace,
      papel: membro.papel,
    };
  }
}
