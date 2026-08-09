import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentWorkspace } from '../../common/decorators/current-workspace.decorator';
import { TimelineForecastReadModelService } from './read-models/timeline-forecast-read-model.service';
import { PlanningOverviewReadModelService } from './read-models/planning-overview-read-model.service';

@Controller('planning')
@UseGuards(JwtAuthGuard)
export class PlanningController {
  constructor(
    private readonly timelineForecastReadModelService: TimelineForecastReadModelService,
    private readonly planningOverviewReadModelService: PlanningOverviewReadModelService,
  ) {}

  @Get('forecast')
  async obterForecast(
    @CurrentWorkspace() workspaceId: string,
    @Query('referenceDate') referenceDateStr?: string,
    @Query('meses') mesesStr?: string,
  ) {
    const referenceDate = referenceDateStr
      ? new Date(referenceDateStr)
      : new Date();

    const qtdMeses = mesesStr ? parseInt(mesesStr, 10) : 12;

    return this.timelineForecastReadModelService.gerarProjecao(
      workspaceId,
      referenceDate,
      isNaN(qtdMeses) || qtdMeses <= 0 ? 12 : qtdMeses,
    );
  }

  @Get('overview')
  async obterOverview(
    @CurrentWorkspace() workspaceId: string,
    @Query('referenceDate') referenceDateStr?: string,
  ) {
    const referenceDate = referenceDateStr
      ? new Date(referenceDateStr)
      : new Date();

    return this.planningOverviewReadModelService.obterVisaoUnificada(
      workspaceId,
      referenceDate,
    );
  }
}

