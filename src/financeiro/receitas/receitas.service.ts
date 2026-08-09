import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LedgerService } from '../ledger/ledger.service';
import { CriarReceitaDto } from './dto/criar-receita.dto';
import { EstornarLancamentoDto } from './dto/estornar-lancamento.dto';
import { Money } from '../domain/value-objects/money.vo';
import { LedgerEntry } from '../ledger/entities/ledger-entry';
import { StatusLiquidacao, StatusDocumento, TipoMovimentacao, ReferenciaTipoMovimentacao, OrigemMovimentacao, Prisma } from '@prisma/client';

@Injectable()
export class ReceitasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledgerService: LedgerService,
  ) {}

  async criar(workspaceId: string, usuarioId: string, dto: CriarReceitaDto) {
    const statusLiq = dto.statusLiquidacao || StatusLiquidacao.PENDENTE;

    if (statusLiq === StatusLiquidacao.LIQUIDADO && !dto.carteiraId) {
      throw new BadRequestException('Uma carteira é obrigatória para liquidar uma receita.');
    }

    // 1. Validação de Categoria (Workspace ou Sistema)
    if (dto.categoriaId) {
      const categoria = await this.prisma.categoria.findFirst({
        where: {
          id: dto.categoriaId,
          OR: [{ workspaceId }, { sistema: true }],
        },
      });
      if (!categoria) {
        throw new NotFoundException('Categoria não encontrada ou inválida para este workspace.');
      }
    }

    // 2. Validação de Carteira (Se informada)
    if (dto.carteiraId) {
      const carteira = await this.prisma.carteira.findFirst({
        where: { id: dto.carteiraId, workspaceId, ativo: true },
      });
      if (!carteira) {
        throw new NotFoundException('Carteira não encontrada ou pertence a outro workspace.');
      }
    }

    // 3. Validação de Pessoa (Se informada)
    if (dto.pessoaId) {
      const pessoa = await this.prisma.pessoa.findFirst({
        where: { id: dto.pessoaId, workspaceId, ativo: true },
      });
      if (!pessoa) {
        throw new NotFoundException('Pessoa não encontrada ou pertence a outro workspace.');
      }
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const receita = await tx.receita.create({
          data: {
            workspaceId,
            descricao: dto.descricao,
            valor: new Prisma.Decimal(dto.valor),
            data: new Date(dto.data),
            categoriaId: dto.categoriaId,
            carteiraId: dto.carteiraId,
            pessoaId: dto.pessoaId,
            statusDocumento: StatusDocumento.ATIVO,
            statusLiquidacao: statusLiq,
            dataLiquidacao: statusLiq === StatusLiquidacao.LIQUIDADO ? new Date() : null,
            observacoes: dto.observacoes,
            recorrente: dto.recorrente || false,
            origemRecorrenciaId: dto.origemRecorrenciaId,
          },
        });

        if (statusLiq === StatusLiquidacao.LIQUIDADO && dto.carteiraId) {
          const entry = LedgerEntry.criar({
            workspaceId,
            carteiraId: dto.carteiraId,
            criadoPorId: usuarioId,
            tipo: TipoMovimentacao.RECEITA,
            valor: Money.deReais(dto.valor),
            data: new Date(dto.data),
            referenciaTipo: ReferenciaTipoMovimentacao.RECEITA,
            referenciaId: receita.id,
            origem: OrigemMovimentacao.MANUAL,
            observacao: `Receita: ${dto.descricao}`,
          });

          await this.ledgerService.registrar(tx, entry);
        }

        return receita;
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException(
          'Violação de chave estrangeira: Categoria, carteira ou pessoa informada é inválida.',
        );
      }
      throw error;
    }
  }

  async darBaixa(workspaceId: string, receitaId: string, usuarioId: string, carteiraIdParam?: string) {
    return this.prisma.$transaction(async (tx) => {
      const receitaAtual = await tx.receita.findFirst({
        where: { id: receitaId, workspaceId },
      });

      if (!receitaAtual) {
        throw new NotFoundException('Receita não encontrada.');
      }

      const carteiraAlvoId = carteiraIdParam || receitaAtual.carteiraId;
      if (!carteiraAlvoId) {
        throw new BadRequestException('Informe a carteira recebedora para dar baixa.');
      }

      // CAS (Compare-And-Swap) Atômico Intencional contra Concorrência
      const resultado = await tx.receita.updateMany({
        where: {
          id: receitaId,
          workspaceId,
          statusLiquidacao: StatusLiquidacao.PENDENTE,
          statusDocumento: StatusDocumento.ATIVO,
        },
        data: {
          statusLiquidacao: StatusLiquidacao.LIQUIDADO,
          dataLiquidacao: new Date(),
          carteiraId: carteiraAlvoId,
        },
      });

      if (resultado.count === 0) {
        throw new ConflictException('Esta receita já foi liquidada ou cancelada por outra sessão.');
      }

      const entry = LedgerEntry.criar({
        workspaceId,
        carteiraId: carteiraAlvoId,
        criadoPorId: usuarioId,
        tipo: TipoMovimentacao.RECEITA,
        valor: Money.deReais(Number(receitaAtual.valor)),
        data: new Date(),
        referenciaTipo: ReferenciaTipoMovimentacao.RECEITA,
        referenciaId: receitaId,
        origem: OrigemMovimentacao.MANUAL,
        observacao: `Baixa da receita: ${receitaAtual.descricao}`,
      });

      await this.ledgerService.registrar(tx, entry);

      return tx.receita.findUnique({ where: { id: receitaId } });
    });
  }

  async estornar(workspaceId: string, receitaId: string, usuarioId: string, dto: EstornarLancamentoDto) {
    return this.prisma.$transaction(async (tx) => {
      const receita = await tx.receita.findFirst({
        where: { id: receitaId, workspaceId },
      });

      if (!receita) {
        throw new NotFoundException('Receita não encontrada.');
      }

      if (receita.statusLiquidacao !== StatusLiquidacao.LIQUIDADO) {
        throw new BadRequestException('Apenas receitas liquidadas podem sofrer estorno.');
      }

      if (receita.statusDocumento === StatusDocumento.CANCELADO) {
        throw new BadRequestException('Esta receita já está cancelada.');
      }

      if (!receita.carteiraId) {
        throw new BadRequestException('Receita sem carteira associada para estorno.');
      }

      await tx.receita.update({
        where: { id: receitaId },
        data: { statusDocumento: StatusDocumento.CANCELADO },
      });

      const entry = LedgerEntry.criar({
        workspaceId,
        carteiraId: receita.carteiraId,
        criadoPorId: usuarioId,
        tipo: TipoMovimentacao.ESTORNO,
        valor: Money.deReais(Number(receita.valor)),
        data: new Date(),
        referenciaTipo: ReferenciaTipoMovimentacao.ESTORNO,
        referenciaId: receitaId,
        origem: OrigemMovimentacao.MANUAL,
        observacao: `Estorno de receita: ${receita.descricao}. Motivo: ${dto.motivo}`,
      });

      await this.ledgerService.registrar(tx, entry);

      return tx.receita.findUnique({ where: { id: receitaId } });
    });
  }

  async remover(workspaceId: string, receitaId: string) {
    const receita = await this.prisma.receita.findFirst({
      where: { id: receitaId, workspaceId },
    });

    if (!receita) {
      throw new NotFoundException('Receita não encontrada.');
    }

    if (receita.statusLiquidacao === StatusLiquidacao.LIQUIDADO) {
      throw new BadRequestException('Não é possível excluir uma receita liquidada. Utilize o estorno.');
    }

    return this.prisma.receita.delete({ where: { id: receitaId } });
  }

  async listarPorWorkspace(workspaceId: string, mes?: number, ano?: number) {
    const dataFiltro: any = { workspaceId, statusDocumento: StatusDocumento.ATIVO };

    if (mes && ano) {
      const dataInicio = new Date(ano, mes - 1, 1);
      const dataFim = new Date(ano, mes, 0, 23, 59, 59);
      dataFiltro.data = { gte: dataInicio, lte: dataFim };
    }

    return this.prisma.receita.findMany({
      where: dataFiltro,
      include: { carteira: true, categoria: true, pessoa: true },
      orderBy: { data: 'desc' },
    });
  }
}
