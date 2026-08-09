import { Module } from '@nestjs/common';
import { PlanningController } from './planning.controller';
import { TimelineForecastReadModelService } from './read-models/timeline-forecast-read-model.service';
import { PlanningOverviewReadModelService } from './read-models/planning-overview-read-model.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { ProjetosModule } from '../../projetos/projetos.module';

@Module({
  imports: [PrismaModule, ProjetosModule],
  controllers: [PlanningController],
  providers: [
    TimelineForecastReadModelService,
    PlanningOverviewReadModelService,
  ],
  exports: [
    TimelineForecastReadModelService,
    PlanningOverviewReadModelService,
  ],
})
export class PlanningModule {}

