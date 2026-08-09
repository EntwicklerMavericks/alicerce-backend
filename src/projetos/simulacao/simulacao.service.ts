import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SimulationSnapshotBuilder } from './simulation-snapshot.builder';
import { SimuladorCenariosService } from '../domain/services/simulador-cenarios.service';
import { ProjecaoCronogramaReadModelService } from '../read-models/projecao-cronograma-read-model.service';
import { SimularCenarioProjetoDto } from './dto/simular-cenario-projeto.dto';
import { AplicarCenarioProjetoDto } from './dto/aplicar-cenario-projeto.dto';
import { ScenarioBaselineConflictException } from './exceptions/scenario-baseline-conflict.exception';

@Injectable()
export class SimulacaoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly snapshotBuilder: SimulationSnapshotBuilder,
    private readonly simuladorEngine: SimuladorCenariosService,
    private readonly projecaoReadModel: ProjecaoCronogramaReadModelService,
  ) {}

  async simular(
    workspaceId: string,
    projetoId: string,
    dto: SimularCenarioProjetoDto,
  ) {
    const snapshot = await this.snapshotBuilder.buildSnapshot(workspaceId, projetoId);
    const resultado = this.simuladorEngine.simular(snapshot, dto);
    return this.projecaoReadModel.formatarProjecaoCronograma(snapshot, resultado, dto);
  }

  async aplicar(
    workspaceId: string,
    projetoId: string,
    dto: AplicarCenarioProjetoDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Fetch current active project state
      const dbProjeto = await tx.projeto.findFirst({
        where: { id: projetoId, workspaceId, ativo: true },
        include: { etapas: { where: { ativo: true } } },
      });

      if (!dbProjeto) {
        throw new NotFoundException('Projeto não encontrado.');
      }

      // 2. Validate optimistic locking on project version
      if (dbProjeto.versao !== dto.versaoProjetoEsperada) {
        throw new ScenarioBaselineConflictException(
          `Conflito de baseline detectado. Versão esperada do projeto: ${dto.versaoProjetoEsperada}, versão atual: ${dbProjeto.versao}.`,
        );
      }

      // 3. Validate optimistic locking on stages if provided
      if (dto.versoesEtapasEsperadas && dto.versoesEtapasEsperadas.length > 0) {
        const stageMap = new Map(dbProjeto.etapas.map((e) => [e.id, e.versao]));
        for (const ve of dto.versoesEtapasEsperadas) {
          const currentVersao = stageMap.get(ve.etapaId);
          if (currentVersao === undefined || currentVersao !== ve.versaoEsperada) {
            throw new ScenarioBaselineConflictException(
              `Conflito de baseline na etapa '${ve.etapaId}'. Versão esperada: ${ve.versaoEsperada}, versão atual: ${currentVersao}.`,
            );
          }
        }
      }

      // 4. Update parent project with version increment
      const dataInicioPrevista = dto.parametrosSimulacao.dataInicioSimulada
        ? new Date(dto.parametrosSimulacao.dataInicioSimulada)
        : dbProjeto.dataInicioPrevista;

      const updatedParent = await tx.projeto.updateMany({
        where: {
          id: projetoId,
          workspaceId,
          versao: dto.versaoProjetoEsperada,
          ativo: true,
        },
        data: {
          dataInicioPrevista,
          versao: { increment: 1 },
        },
      });

      if (updatedParent.count === 0) {
        throw new ScenarioBaselineConflictException(
          'Conflito de concorrência detectado ao aplicar o cenário. Tente novamente.',
        );
      }

      // 5. Update stage versions if stage adjustments exist
      for (const etapa of dbProjeto.etapas) {
        await tx.etapaProjeto.updateMany({
          where: { id: etapa.id, workspaceId, versao: etapa.versao, ativo: true },
          data: {
            versao: { increment: 1 },
          },
        });
      }

      // 6. Return updated projection state
      return this.projecaoReadModel.obterProjecaoCronograma(
        workspaceId,
        projetoId,
        dto.parametrosSimulacao,
      );
    });
  }
}
