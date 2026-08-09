import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentWorkspace } from '../common/decorators/current-workspace.decorator';
import { DashboardReadModelService } from './read-models/dashboard-read-model.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private readonly dashboardReadModelService: DashboardReadModelService,
  ) {}

  @Get()
  async obterDashboard(
    @CurrentWorkspace() workspaceId: string,
    @Query('referenceDate') referenceDateStr?: string,
  ) {
    const referenceDate = referenceDateStr
      ? new Date(referenceDateStr)
      : new Date();

    return this.dashboardReadModelService.obterDashboard(
      workspaceId,
      referenceDate,
    );
  }
}
