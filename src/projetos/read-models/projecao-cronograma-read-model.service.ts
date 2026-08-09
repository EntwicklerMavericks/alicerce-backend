import { Injectable, NotFoundException } from '@nestjs/common';
import { SimulationSnapshotBuilder } from '../simulacao/simulation-snapshot.builder';
import {
  SimuladorCenariosService,
  ParametrosSimulacao,
  ResultadoSimulacao,
} from '../domain/services/simulador-cenarios.service';

export interface ProjecaoCronogramaPayload {
  projetoId: string;
  nome: string;
  status: string;
  versao: number;
  cronograma: {
    dataInicioSimulada: Date;
    dataCobertura100: Date | null;
    dataReadiness100: Date | null;
    dataConclusaoEstimadaReal: Date | null;
    diasTotaisEstimados: number;
    mesesTotaisEstimados: number;
    diasAntecipados: number;
    mesesAntecipados: number;
  };
  metricasFinanceiras: {
    custoTotal: number;
    valorFinanciadoTotal: number;
    coberturaPercentual: number;
    readinessPercentual: number;
    deltaCobertura: number;
    deltaReadiness: number;
  };
  gargalo: {
    criticalStageId: string | null;
    criticalStageReason: string | null;
  };
  etapas: Array<{
    etapaId: string;
    nome: string;
    ordem: number;
    custoBase: number;
    custoSimulado: number;
    valorFinanciado: number;
    deficitFinanceiro: number;
    aporteMensalDisponivel: number;
    mesesParaCobertura: number | null;
    dataCobertura100: Date | null;
    dataReadiness100: Date | null;
    dataConclusaoEstimada: Date | null;
    readinessScore: number;
  }>;
}

@Injectable()
export class ProjecaoCronogramaReadModelService {
  constructor(
    private readonly snapshotBuilder: SimulationSnapshotBuilder,
    private readonly simuladorEngine: SimuladorCenariosService,
  ) {}

  async obterProjecaoCronograma(
    workspaceId: string,
    projetoId: string,
    parametros: ParametrosSimulacao = {},
    referenceDate = new Date(),
  ): Promise<ProjecaoCronogramaPayload> {
    const snapshot = await this.snapshotBuilder.buildSnapshot(
      workspaceId,
      projetoId,
      referenceDate,
    );

    const resultadoEngine: ResultadoSimulacao = this.simuladorEngine.simular(
      snapshot,
      parametros,
    );

    return this.formatarProjecaoCronograma(snapshot, resultadoEngine, parametros);
  }

  public formatarProjecaoCronograma(
    snapshot: any,
    resultado: ResultadoSimulacao,
    parametros: ParametrosSimulacao = {},
  ): ProjecaoCronogramaPayload {
    const dataInicioSimulada = parametros.dataInicioSimulada
      ? new Date(parametros.dataInicioSimulada)
      : snapshot.referenceDate
      ? new Date(snapshot.referenceDate)
      : new Date();

    const dataFim = resultado.simulado.dataConclusaoEstimadaReal;
    let diasTotaisEstimados = 0;
    let mesesTotaisEstimados = 0;

    if (dataFim !== null) {
      const diffMs = dataFim.getTime() - dataInicioSimulada.getTime();
      diasTotaisEstimados = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
      mesesTotaisEstimados = Math.round(diasTotaisEstimados / 30);
    }

    const etapasFormatadas = resultado.etapas.map((etapa) => {
      const readinessScore =
        etapa.totalItensWishlist > 0
          ? Number(((etapa.itensProntos / etapa.totalItensWishlist) * 100).toFixed(2))
          : 0;

      return {
        etapaId: etapa.etapaId,
        nome: etapa.nome,
        ordem: etapa.ordem,
        custoBase: Number(etapa.custoBase.toFixed(2)),
        custoSimulado: Number(etapa.custoSimulado.toFixed(2)),
        valorFinanciado: Number(etapa.valorFinanciado.toFixed(2)),
        deficitFinanceiro: Number(etapa.deficitFinanceiro.toFixed(2)),
        aporteMensalDisponivel: Number(etapa.aporteMensalDisponivel.toFixed(2)),
        mesesParaCobertura: etapa.mesesParaCobertura,
        dataCobertura100: etapa.dataCobertura100,
        dataReadiness100: etapa.dataReadiness100,
        dataConclusaoEstimada: etapa.dataConclusaoEstimada,
        readinessScore,
      };
    });

    return {
      projetoId: snapshot.projeto.id,
      nome: snapshot.projeto.nome,
      status: snapshot.projeto.status,
      versao: snapshot.projeto.versao,
      cronograma: {
        dataInicioSimulada,
        dataCobertura100: resultado.simulado.dataCobertura100,
        dataReadiness100: resultado.simulado.dataReadiness100,
        dataConclusaoEstimadaReal: resultado.simulado.dataConclusaoEstimadaReal,
        diasTotaisEstimados,
        mesesTotaisEstimados,
        diasAntecipados: resultado.deltas.diasAntecipados,
        mesesAntecipados: resultado.deltas.mesesAntecipados,
      },
      metricasFinanceiras: {
        custoTotal: Number(resultado.simulado.custoTotal.toFixed(2)),
        valorFinanciadoTotal: Number(resultado.simulado.valorFinanciadoTotal.toFixed(2)),
        coberturaPercentual: resultado.simulado.coberturaPercentual,
        readinessPercentual: resultado.simulado.readinessPercentual,
        deltaCobertura: resultado.deltas.deltaCobertura,
        deltaReadiness: resultado.deltas.deltaReadiness,
      },
      gargalo: resultado.gargalo,
      etapas: etapasFormatadas,
    };
  }
}
