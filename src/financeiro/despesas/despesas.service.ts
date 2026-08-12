import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LedgerService } from '../ledger/ledger.service';
import { CriarDespesaDto } from './dto/criar-despesa.dto';
import { EstornarLancamentoDto } from '../receitas/dto/estornar-lancamento.dto';
import { Money } from '../domain/value-objects/money.vo';
import { LedgerEntry } from '../ledger/entities/ledger-entry';
import { StatusLiquidacao, StatusDocumento, TipoMovimentacao, ReferenciaTipoMovimentacao, OrigemMovimentacao, Prisma } from '@prisma/client';

import { CategoriasService } from '../categorias/categorias.service';

@Injectable()
export class DespesasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledgerService: LedgerService,
    private readonly categoriasService: CategoriasService,
  ) {}

  async criar(workspaceId: string, usuarioId: string, dto: CriarDespesaDto) {
    const statusLiq = dto.statusLiquidacao || StatusLiquidacao.PENDENTE;

    if (statusLiq === StatusLiquidacao.LIQUIDADO && !dto.carteiraId) {
      throw new BadRequestException('Uma carteira é obrigatória para liquidar uma despesa.');
    }

    // 1. Validação de Categoria (Centralizada e Unificada via CategoriasService)
    await this.categoriasService.validarCategoriaParaLancamento(
      workspaceId,
      dto.categoriaId,
      'DESPESA',
    );

    // 2. Validação de Carteira (Se informada)
    if (dto.carteiraId) {
      const carteira = await this.prisma.carteira.findFirst({
        where: { id: dto.carteiraId, workspaceId, ativo: true },
      });
      if (!carteira) {
        throw new NotFoundException('Carteira não encontrada ou pertence a outro workspace.');
      }
    }

    // 3. Validação de Cartão (Se informado)
    if (dto.cartaoId) {
      const cartao = await this.prisma.cartaoCredito.findFirst({
        where: { id: dto.cartaoId, workspaceId, ativo: true },
      });
      if (!cartao) {
        throw new NotFoundException('Cartão de crédito não encontrado ou pertence a outro workspace.');
      }
    }

    // 4. Validação de Meta (Se informada)
    if (dto.metaId) {
      const meta = await this.prisma.meta.findFirst({
        where: { id: dto.metaId, workspaceId, dataExclusao: null },
      });
      if (!meta) {
        throw new NotFoundException('Meta não encontrada ou pertence a outro workspace.');
      }
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const despesa = await tx.despesa.create({
          data: {
            workspaceId,
            descricao: dto.descricao,
            valor: new Prisma.Decimal(dto.valor),
            dataVencimento: new Date(dto.dataVencimento),
            categoriaId: dto.categoriaId,
            carteiraId: dto.carteiraId,
            cartaoId: dto.cartaoId,
            metaId: dto.metaId,
            statusDocumento: StatusDocumento.ATIVO,
            statusLiquidacao: statusLiq,
            dataLiquidacao: statusLiq === StatusLiquidacao.LIQUIDADO ? new Date() : null,
            dataPagamento: statusLiq === StatusLiquidacao.LIQUIDADO ? new Date() : null,
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
            tipo: TipoMovimentacao.DESPESA,
            valor: Money.deReais(dto.valor),
            data: new Date(dto.dataVencimento),
            referenciaTipo: ReferenciaTipoMovimentacao.DESPESA,
            referenciaId: despesa.id,
            origem: OrigemMovimentacao.MANUAL,
            observacao: `Despesa: ${dto.descricao}`,
          });

          await this.ledgerService.registrar(tx, entry);
        }

        return despesa;
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException(
          'Violação de chave estrangeira: Categoria, carteira, cartão ou meta informada é inválida.',
        );
      }
      throw error;
    }
  }

  async darBaixa(workspaceId: string, despesaId: string, usuarioId: string, carteiraIdParam?: string) {
    return this.prisma.$transaction(async (tx) => {
      const despesaAtual = await tx.despesa.findFirst({
        where: { id: despesaId, workspaceId },
      });

      if (!despesaAtual) {
        throw new NotFoundException('Despesa não encontrada.');
      }

      const carteiraAlvoId = carteiraIdParam || despesaAtual.carteiraId;
      if (!carteiraAlvoId) {
        throw new BadRequestException('Informe a carteira pagadora para dar baixa.');
      }

      // CAS (Compare-And-Swap) Atômico Intencional contra Concorrência
      const resultado = await tx.despesa.updateMany({
        where: {
          id: despesaId,
          workspaceId,
          statusLiquidacao: StatusLiquidacao.PENDENTE,
          statusDocumento: StatusDocumento.ATIVO,
        },
        data: {
          statusLiquidacao: StatusLiquidacao.LIQUIDADO,
          dataLiquidacao: new Date(),
          dataPagamento: new Date(),
          carteiraId: carteiraAlvoId,
        },
      });

      if (resultado.count === 0) {
        throw new ConflictException('Esta despesa já foi liquidada ou cancelada por outra sessão.');
      }

      const entry = LedgerEntry.criar({
        workspaceId,
        carteiraId: carteiraAlvoId,
        criadoPorId: usuarioId,
        tipo: TipoMovimentacao.DESPESA,
        valor: Money.deReais(Number(despesaAtual.valor)),
        data: new Date(),
        referenciaTipo: ReferenciaTipoMovimentacao.DESPESA,
        referenciaId: despesaId,
        origem: OrigemMovimentacao.MANUAL,
        observacao: `Baixa da despesa: ${despesaAtual.descricao}`,
      });

      await this.ledgerService.registrar(tx, entry);

      return tx.despesa.findUnique({ where: { id: despesaId } });
    });
  }

  async estornar(workspaceId: string, despesaId: string, usuarioId: string, dto: EstornarLancamentoDto) {
    return this.prisma.$transaction(async (tx) => {
      const despesa = await tx.despesa.findFirst({
        where: { id: despesaId, workspaceId },
      });

      if (!despesa) {
        throw new NotFoundException('Despesa não encontrada.');
      }

      if (despesa.statusLiquidacao !== StatusLiquidacao.LIQUIDADO) {
        throw new BadRequestException('Apenas despesas liquidadas podem sofrer estorno.');
      }

      if (despesa.statusDocumento === StatusDocumento.CANCELADO) {
        throw new BadRequestException('Esta despesa já está cancelada.');
      }

      if (!despesa.carteiraId) {
        throw new BadRequestException('Despesa sem carteira associada para estorno.');
      }

      await tx.despesa.update({
        where: { id: despesaId },
        data: { statusDocumento: StatusDocumento.CANCELADO },
      });

      const entry = LedgerEntry.criar({
        workspaceId,
        carteiraId: despesa.carteiraId,
        criadoPorId: usuarioId,
        tipo: TipoMovimentacao.ESTORNO,
        valor: Money.deReais(Number(despesa.valor)),
        data: new Date(),
        referenciaTipo: ReferenciaTipoMovimentacao.ESTORNO,
        referenciaId: despesaId,
        origem: OrigemMovimentacao.MANUAL,
        observacao: `Estorno de despesa: ${despesa.descricao}. Motivo: ${dto.motivo}`,
      });

      await this.ledgerService.registrar(tx, entry);

      return tx.despesa.findUnique({ where: { id: despesaId } });
    });
  }

  async remover(workspaceId: string, despesaId: string) {
    const despesa = await this.prisma.despesa.findFirst({
      where: { id: despesaId, workspaceId },
    });

    if (!despesa) {
      throw new NotFoundException('Despesa não encontrada.');
    }

    if (despesa.statusLiquidacao === StatusLiquidacao.LIQUIDADO) {
      throw new BadRequestException('Não é possível excluir uma despesa liquidada. Utilize o estorno.');
    }

    return this.prisma.despesa.delete({ where: { id: despesaId } });
  }

  async listarPorWorkspace(workspaceId: string, mes?: number, ano?: number) {
    const dataFiltro: any = { workspaceId, statusDocumento: StatusDocumento.ATIVO, dataExclusao: null };

    if (mes && ano) {
      const dataInicio = new Date(ano, mes - 1, 1);
      const dataFim = new Date(ano, mes, 0, 23, 59, 59);
      dataFiltro.dataVencimento = { gte: dataInicio, lte: dataFim };
    }

    return this.prisma.despesa.findMany({
      where: dataFiltro,
      include: { carteira: true, categoria: true, cartao: true, meta: true },
      orderBy: { dataVencimento: 'desc' },
    });
  }
}
