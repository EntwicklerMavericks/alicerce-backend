import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { DashboardFinanceiroReadModelService } from './dashboard-financeiro-read-model.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Read Models Financeiros (CQRS)')
@Controller('financeiro/read-models')
@UseGuards(JwtAuthGuard)
export class DashboardFinanceiroController {
  constructor(private readonly dashboardReadModel: DashboardFinanceiroReadModelService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Obter resumo consolidado do Dashboard em 1 única chamada (CQRS)' })
  @ApiQuery({ name: 'competencia', description: 'Formato YYYY-MM (ex: 2026-08)', required: false })
  @ApiResponse({ status: 200, description: 'Resumo consolidado do dashboard retornado com sucesso' })
  async obterResumoDashboard(@Query('competencia') competenciaISO?: string, @Request() req?: any) {
    const workspaceId = req?.user?.workspaceId || 'workspace-demo-id';
    return this.dashboardReadModel.obterResumoDashboard(workspaceId, competenciaISO);
  }
}
