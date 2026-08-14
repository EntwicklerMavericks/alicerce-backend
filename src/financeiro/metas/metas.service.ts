import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MetasReadModelService } from '../read-models/metas-read-model.service';
import { CriarMetaDto } from './dto/criar-meta.dto';
import { AtualizarMetaDto } from './dto/atualizar-meta.dto';
import { CriarAporteMetaDto } from './dto/criar-aporte-meta.dto';
import { MetaAggregate, AporteMetaItem } from '../domain/entities/meta.aggregate';
import { Money } from '../domain/value-objects/money.vo';
import { YearMonth } from '../domain/value-objects/year-month.vo';
import { Prisma } from '@prisma/client';

@Injectable()
export class MetasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly readModelService: MetasReadModelService,
  ) {}

  async criar(workspaceId: string, dto: CriarMetaDto) {
    if (!dto.valorAlvo || dto.valorAlvo <= 0) {
      throw new BadRequestException('O valor alvo da meta deve ser maior que zero.');
    }

    const prazoDate = dto.prazo ? new Date(dto.prazo) : null;
    const prazoYM = prazoDate ? YearMonth.daData(prazoDate) : undefined;

    // Validação DDD via MetaAggregate
    const domainMeta = new MetaAggregate(
      'temp-id',
      workspaceId,
      dto.nome,
      Money.deReais(dto.valorAlvo),
      prazoYM,
      dto.icone,
      dto.cor,
      'ATIVA',
      dto.descricao,
      dto.prioridade ?? 1,
    );

    const valorAlvoDecimal = new Prisma.Decimal(domainMeta.valorAlvo.paraReais());
    const valorInicial = dto.valorInicial ?? 0;

    const meta = await this.prisma.meta.create({
      data: {
        workspaceId,
        nome: domainMeta.nome,
        descricao: domainMeta.descricao,
        valorAlvo: valorAlvoDecimal,
        prazo: prazoDate,
        icone: domainMeta.icone,
        cor: domainMeta.cor,
        prioridade: domainMeta.prioridade,
        status: 'ATIVA',
      },
    });

    // Criar aporte inicial automático se valorInicial > 0
    if (valorInicial > 0) {
      await this.prisma.aporteMeta.create({
        data: {
          metaId: meta.id,
          valor: new Prisma.Decimal(valorInicial),
          descricao: 'Aporte inicial',
          data: new Date(),
        },
      });
    }

    return meta;
  }

  async listar(workspaceId: string) {
    return this.readModelService.listarMetasComCalculos(workspaceId);
  }

  async obterPorId(workspaceId: string, id: string) {
    const meta = await this.readModelService.obterMetaDetalhadaPorId(workspaceId, id);
    if (!meta) {
      throw new NotFoundException(`Meta com ID ${id} não encontrada.`);
    }
    return meta;
  }

  async atualizar(workspaceId: string, id: string, dto: AtualizarMetaDto) {
    const metaExistente = await this.prisma.meta.findFirst({
      where: { id, workspaceId, dataExclusao: null },
    });

    if (!metaExistente) {
      throw new NotFoundException(`Meta com ID ${id} não encontrada.`);
    }

    if (dto.valorAlvo !== undefined && dto.valorAlvo <= 0) {
      throw new BadRequestException('O valor alvo da meta deve ser maior que zero.');
    }

    const dataToUpdate: Prisma.MetaUpdateInput = {};

    if (dto.nome !== undefined) dataToUpdate.nome = dto.nome;
    if (dto.descricao !== undefined) dataToUpdate.descricao = dto.descricao;
    if (dto.valorAlvo !== undefined) dataToUpdate.valorAlvo = new Prisma.Decimal(dto.valorAlvo);
    if (dto.prazo !== undefined) dataToUpdate.prazo = dto.prazo ? new Date(dto.prazo) : null;
    if (dto.icone !== undefined) dataToUpdate.icone = dto.icone;
    if (dto.cor !== undefined) dataToUpdate.cor = dto.cor;
    if (dto.prioridade !== undefined) dataToUpdate.prioridade = dto.prioridade;

    await this.prisma.meta.update({
      where: { id },
      data: dataToUpdate,
    });

    // Reavaliar transição automática de status
    await this.sincronizarStatusDomain(id);

    return this.obterPorId(workspaceId, id);
  }

  async remover(workspaceId: string, id: string) {
    const metaExistente = await this.prisma.meta.findFirst({
      where: { id, workspaceId },
    });

    if (!metaExistente) {
      throw new NotFoundException(`Meta com ID ${id} não encontrada.`);
    }

    // Deletar aportes vinculados atômica e limpos, depois excluir a meta
    return this.prisma.$transaction(async (tx) => {
      await tx.aporteMeta.deleteMany({
        where: { metaId: id },
      });

      await tx.meta.delete({
        where: { id },
      });

      return { id, mensagem: 'Meta e histórico de aportes removidos com sucesso.' };
    });
  }

  async registrarAporte(workspaceId: string, metaId: string, dto: CriarAporteMetaDto) {
    const metaDb = await this.prisma.meta.findFirst({
      where: { id: metaId, workspaceId, dataExclusao: null },
      include: { aportes: true },
    });

    if (!metaDb) {
      throw new NotFoundException(`Meta com ID ${metaId} não encontrada.`);
    }

    if (!dto.valor || dto.valor <= 0) {
      throw new BadRequestException('O valor do aporte deve ser maior que zero.');
    }

    const aportesDomain: AporteMetaItem[] = metaDb.aportes.map((a) => ({
      id: a.id,
      metaId: a.metaId,
      valor: Money.deReais(Number(a.valor)),
      data: a.data,
      descricao: a.descricao ?? undefined,
    }));

    const prazoYM = metaDb.prazo ? YearMonth.daData(metaDb.prazo) : undefined;
    const aggregate = new MetaAggregate(
      metaDb.id,
      metaDb.workspaceId,
      metaDb.nome,
      Money.deReais(Number(metaDb.valorAlvo)),
      prazoYM,
      metaDb.icone ?? undefined,
      metaDb.cor ?? undefined,
      metaDb.status as any,
      metaDb.descricao ?? undefined,
      metaDb.prioridade,
      aportesDomain,
    );

    const dataAporte = dto.data ? new Date(dto.data) : new Date();

    // Invoca invariante e auto-transição DDD no aggregate
    aggregate.adicionarAporte('temp-id', Money.deReais(dto.valor), dataAporte, dto.descricao);

    return this.prisma.$transaction(async (tx) => {
      const aporte = await tx.aporteMeta.create({
        data: {
          metaId,
          valor: new Prisma.Decimal(dto.valor),
          data: dataAporte,
          descricao: dto.descricao,
        },
      });

      // Atualiza status se houve transição (ex: para CONCLUIDA)
      if (aggregate.status !== metaDb.status) {
        await tx.meta.update({
          where: { id: metaId },
          data: { status: aggregate.status },
        });
      }

      return aporte;
    });
  }

  async removerAporte(workspaceId: string, metaId: string, aporteId: string) {
    const metaDb = await this.prisma.meta.findFirst({
      where: { id: metaId, workspaceId, dataExclusao: null },
      include: { aportes: true },
    });

    if (!metaDb) {
      throw new NotFoundException(`Meta com ID ${metaId} não encontrada.`);
    }

    const aporteDb = metaDb.aportes.find((a) => a.id === aporteId);
    if (!aporteDb) {
      throw new NotFoundException(`Aporte com ID ${aporteId} não encontrado nesta meta.`);
    }

    await this.prisma.aporteMeta.delete({
      where: { id: aporteId },
    });

    // Reavaliar status após exclusão
    await this.sincronizarStatusDomain(metaId);

    return { id: aporteId, mensagem: 'Aporte removido com sucesso.' };
  }

  private async sincronizarStatusDomain(metaId: string): Promise<void> {
    const metaDb = await this.prisma.meta.findUnique({
      where: { id: metaId },
      include: { aportes: true },
    });

    if (!metaDb) return;

    const aportesDomain: AporteMetaItem[] = metaDb.aportes.map((a) => ({
      id: a.id,
      metaId: a.metaId,
      valor: Money.deReais(Number(a.valor)),
      data: a.data,
      descricao: a.descricao ?? undefined,
    }));

    const prazoYM = metaDb.prazo ? YearMonth.daData(metaDb.prazo) : undefined;
    const aggregate = new MetaAggregate(
      metaDb.id,
      metaDb.workspaceId,
      metaDb.nome,
      Money.deReais(Number(metaDb.valorAlvo)),
      prazoYM,
      metaDb.icone ?? undefined,
      metaDb.cor ?? undefined,
      metaDb.status as any,
      metaDb.descricao ?? undefined,
      metaDb.prioridade,
      aportesDomain,
    );

    if (aggregate.status !== metaDb.status) {
      await this.prisma.meta.update({
        where: { id: metaId },
        data: { status: aggregate.status },
      });
    }
  }
}
