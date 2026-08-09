import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrcamentosReadModelService } from '../read-models/orcamentos-read-model.service';
import { CriarOrcamentoDto } from './dto/criar-orcamento.dto';
import { OrcamentoAggregate } from '../domain/entities/orcamento.aggregate';
import { Money } from '../domain/value-objects/money.vo';
import { YearMonth } from '../domain/value-objects/year-month.vo';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrcamentosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly readModelService: OrcamentosReadModelService,
  ) {}

  async criarOuAtualizar(workspaceId: string, dto: CriarOrcamentoDto) {
    const valorTeto = dto.teto ?? dto.valorPlanejado;
    if (!valorTeto || valorTeto <= 0) {
      throw new BadRequestException('O teto do orçamento deve ser maior que zero.');
    }

    const competencia = YearMonth.deAnoMes(dto.ano, dto.mes);

    // Validação de regras invariantes de domínio via OrcamentoAggregate
    const aggregate = new OrcamentoAggregate(
      'temp-id',
      workspaceId,
      dto.categoriaId,
      competencia,
      Money.deReais(valorTeto),
    );

    // Verificar se categoria existe
    const categoria = await this.prisma.categoria.findUnique({
      where: { id: dto.categoriaId },
    });

    if (!categoria) {
      throw new NotFoundException(`Categoria com ID ${dto.categoriaId} não encontrada.`);
    }

    const tetoDecimal = new Prisma.Decimal(aggregate.teto.paraReais());

    return this.prisma.orcamento.upsert({
      where: {
        workspaceId_mes_ano_categoriaId: {
          workspaceId,
          mes: dto.mes,
          ano: dto.ano,
          categoriaId: dto.categoriaId,
        },
      },
      create: {
        workspaceId,
        categoriaId: dto.categoriaId,
        mes: dto.mes,
        ano: dto.ano,
        valorPlanejado: tetoDecimal,
      },
      update: {
        valorPlanejado: tetoDecimal,
      },
      include: {
        categoria: true,
      },
    });
  }

  async listarComConsumo(workspaceId: string, mes?: number, ano?: number) {
    const agora = new Date();
    const targetMes = mes || agora.getMonth() + 1;
    const targetAno = ano || agora.getFullYear();

    return this.readModelService.obterOrcamentosComConsumo(workspaceId, targetAno, targetMes);
  }

  async remover(workspaceId: string, id: string) {
    const orcamento = await this.prisma.orcamento.findFirst({
      where: { id, workspaceId },
    });

    if (!orcamento) {
      throw new NotFoundException(`Orçamento com ID ${id} não encontrado.`);
    }

    await this.prisma.orcamento.delete({
      where: { id },
    });

    return { id, mensagem: 'Orçamento removido com sucesso.' };
  }
}
