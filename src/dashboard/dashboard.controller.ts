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
    @Query('competencia') competenciaStr?: string,
  ) {
    let referenceDate: Date;
    const dateInput = referenceDateStr || competenciaStr;
    if (dateInput) {
      if (/^\d{4}-\d{2}$/.test(dateInput)) {
        const hoje = new Date();
        const ano = parseInt(dateInput.slice(0, 4), 10);
        const mes = parseInt(dateInput.slice(5, 7), 10);
        if (ano === hoje.getFullYear() && mes === hoje.getMonth() + 1) {
          referenceDate = hoje;
        } else {
          referenceDate = new Date(ano, mes, 0, 23, 59, 59, 999);
        }
      } else {
        referenceDate = new Date(dateInput);
      }
    } else {
      referenceDate = new Date();
    }

    return this.dashboardReadModelService.obterDashboard(
      workspaceId,
      referenceDate,
    );
  }
}
