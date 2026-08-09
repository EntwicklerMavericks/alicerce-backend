import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProjetosController } from './projetos.controller';
import { ProjetosService } from './projetos.service';
import { ProjetosReadModelService } from './read-models/projetos-read-model.service';
import { SimuladorCenariosService } from './domain/services/simulador-cenarios.service';
import { SimulationSnapshotBuilder } from './simulacao/simulation-snapshot.builder';
import { SimulacaoService } from './simulacao/simulacao.service';
import { SimulacaoController } from './simulacao/simulacao.controller';
import { ProjecaoCronogramaReadModelService } from './read-models/projecao-cronograma-read-model.service';

@Module({
  imports: [PrismaModule],
  controllers: [ProjetosController, SimulacaoController],
  providers: [
    ProjetosService,
    ProjetosReadModelService,
    SimuladorCenariosService,
    SimulationSnapshotBuilder,
    SimulacaoService,
    ProjecaoCronogramaReadModelService,
  ],
  exports: [
    ProjetosService,
    ProjetosReadModelService,
    SimuladorCenariosService,
    SimulationSnapshotBuilder,
    SimulacaoService,
    ProjecaoCronogramaReadModelService,
  ],
})
export class ProjetosModule {}
