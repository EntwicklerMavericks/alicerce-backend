import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CriarCategoriaDto } from './dto/criar-categoria.dto';
import { AtualizarCategoriaDto } from './dto/atualizar-categoria.dto';
import { Categoria, TipoCategoria } from '@prisma/client';

@Injectable()
export class CategoriasService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper de normalização explícita para comparação de unicidade:
   * Remove espaços nas extremidades, converte para minúsculas e remove acentos/diacríticos.
   */
  private normalizarNome(nome: string): string {
    if (!nome) return '';
    return nome
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Valida unicidade normalizada dentro do workspace
   */
  private async validarUnicidadeNome(
    workspaceId: string,
    nome: string,
    idIgnorar?: string,
  ): Promise<void> {
    const nomeNormalizado = this.normalizarNome(nome);
    const categorias = await this.prisma.categoria.findMany({
      where: {
        OR: [{ workspaceId }, { sistema: true }],
        ...(idIgnorar ? { id: { not: idIgnorar } } : {}),
      },
    });

    const existeDuplicata = categorias.some(
      (c) => this.normalizarNome(c.nome) === nomeNormalizado,
    );

    if (existeDuplicata) {
      throw new ConflictException(
        `Já existe uma categoria com o nome "${nome.trim()}" no workspace ou nas categorias padrão do sistema.`,
      );
    }
  }

  /**
   * Criar categoria customizada no workspace
   */
  async criar(workspaceId: string, dto: CriarCategoriaDto): Promise<Categoria> {
    const nomeFormatado = dto.nome.trim();
    await this.validarUnicidadeNome(workspaceId, nomeFormatado);

    return this.prisma.categoria.create({
      data: {
        workspaceId,
        nome: nomeFormatado,
        tipo: dto.tipo,
        icone: dto.icone || 'category',
        cor: dto.cor || '#d8b87e',
        sistema: false,
      },
    });
  }

  /**
   * Listar categorias do workspace + categorias globais do sistema.
   * Ordenação: Sistema primeiro (alfabética), depois customizadas do workspace (alfabética).
   */
  async listarPorWorkspace(workspaceId: string): Promise<Categoria[]> {
    const categorias = await this.prisma.categoria.findMany({
      where: {
        OR: [{ workspaceId }, { sistema: true }],
      },
    });

    return categorias.sort((a, b) => {
      if (a.sistema && !b.sistema) return -1;
      if (!a.sistema && b.sistema) return 1;
      return a.nome.localeCompare(b.nome, 'pt-BR');
    });
  }

  /**
   * Atualizar categoria customizada
   */
  async atualizar(
    workspaceId: string,
    id: string,
    dto: AtualizarCategoriaDto,
  ): Promise<Categoria> {
    const categoria = await this.prisma.categoria.findFirst({
      where: { id, OR: [{ workspaceId }, { sistema: true }] },
    });

    if (!categoria) {
      throw new NotFoundException('Categoria não encontrada.');
    }

    if (categoria.sistema) {
      throw new ForbiddenException('Categorias padrão do sistema não podem ser alteradas.');
    }

    if (categoria.workspaceId !== workspaceId) {
      throw new ForbiddenException('Acesso negado a esta categoria.');
    }

    if (dto.nome && dto.nome.trim() !== categoria.nome) {
      const nomeFormatado = dto.nome.trim();
      await this.validarUnicidadeNome(workspaceId, nomeFormatado, id);
    }

    return this.prisma.categoria.update({
      where: { id },
      data: {
        ...(dto.nome ? { nome: dto.nome.trim() } : {}),
        ...(dto.tipo ? { tipo: dto.tipo } : {}),
        ...(dto.icone !== undefined ? { icone: dto.icone } : {}),
        ...(dto.cor !== undefined ? { cor: dto.cor } : {}),
      },
    });
  }

  /**
   * Remover categoria customizada (com validação estrita de integridade)
   */
  async remover(workspaceId: string, id: string): Promise<Categoria> {
    const categoria = await this.prisma.categoria.findFirst({
      where: { id, OR: [{ workspaceId }, { sistema: true }] },
      include: {
        despesas: { take: 1 },
        receitas: { take: 1 },
        transacoes: { take: 1 },
        subcategorias: { take: 1 },
        orcamentos: { take: 1 },
      },
    });

    if (!categoria) {
      throw new NotFoundException('Categoria não encontrada.');
    }

    if (categoria.sistema) {
      throw new ForbiddenException('Categorias padrão do sistema não podem ser excluídas.');
    }

    if (categoria.workspaceId !== workspaceId) {
      throw new ForbiddenException('Acesso negado a esta categoria.');
    }

    if (
      categoria.despesas.length > 0 ||
      categoria.receitas.length > 0 ||
      categoria.transacoes.length > 0 ||
      categoria.orcamentos.length > 0
    ) {
      throw new ConflictException(
        'Não é possível excluir esta categoria pois ela possui lançamentos ou orçamentos vinculados.',
      );
    }

    if (categoria.subcategorias.length > 0) {
      throw new ConflictException(
        'Não é possível excluir esta categoria pois ela possui subcategorias dependentes.',
      );
    }

    return this.prisma.categoria.delete({ where: { id } });
  }

  /**
   * Método centralizado de validação de Categoria para Despesas e Receitas.
   * Usado pelos serviços de Despesa e Receita para garantir regras de negócio unificadas.
   */
  async validarCategoriaParaLancamento(
    workspaceId: string,
    categoriaId: string,
    tipoLancamento: 'RECEITA' | 'DESPESA',
  ): Promise<Categoria> {
    if (!categoriaId) {
      throw new BadRequestException('A categoria é obrigatória.');
    }

    const categoria = await this.prisma.categoria.findFirst({
      where: {
        id: categoriaId,
        OR: [{ workspaceId }, { sistema: true }],
      },
    });

    if (!categoria) {
      throw new NotFoundException('Categoria não encontrada ou inválida para este workspace.');
    }

    // Validação de compatibilidade de Tipo:
    // DESPESA aceita apenas DESPESA ou AMBAS
    // RECEITA aceita apenas RECEITA ou AMBAS
    if (tipoLancamento === 'DESPESA' && categoria.tipo === TipoCategoria.RECEITA) {
      throw new BadRequestException(
        `A categoria "${categoria.nome}" é do tipo RECEITA e não pode ser usada para registrar uma Despesa.`,
      );
    }

    if (tipoLancamento === 'RECEITA' && categoria.tipo === TipoCategoria.DESPESA) {
      throw new BadRequestException(
        `A categoria "${categoria.nome}" é do tipo DESPESA e não pode ser usada para registrar uma Receita.`,
      );
    }

    return categoria;
  }
}
