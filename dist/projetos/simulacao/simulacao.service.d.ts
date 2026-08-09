import { PrismaService } from '../../prisma/prisma.service';
import { SimulationSnapshotBuilder } from './simulation-snapshot.builder';
import { SimuladorCenariosService } from '../domain/services/simulador-cenarios.service';
import { ProjecaoCronogramaReadModelService } from '../read-models/projecao-cronograma-read-model.service';
import { SimularCenarioProjetoDto } from './dto/simular-cenario-projeto.dto';
import { AplicarCenarioProjetoDto } from './dto/aplicar-cenario-projeto.dto';
export declare class SimulacaoService {
    private readonly prisma;
    private readonly snapshotBuilder;
    private readonly simuladorEngine;
    private readonly projecaoReadModel;
    constructor(prisma: PrismaService, snapshotBuilder: SimulationSnapshotBuilder, simuladorEngine: SimuladorCenariosService, projecaoReadModel: ProjecaoCronogramaReadModelService);
    simular(workspaceId: string, projetoId: string, dto: SimularCenarioProjetoDto): Promise<import("../read-models/projecao-cronograma-read-model.service").ProjecaoCronogramaPayload>;
    aplicar(workspaceId: string, projetoId: string, dto: AplicarCenarioProjetoDto): Promise<import("../read-models/projecao-cronograma-read-model.service").ProjecaoCronogramaPayload>;
}
