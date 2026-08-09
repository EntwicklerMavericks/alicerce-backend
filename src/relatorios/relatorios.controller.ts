import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentWorkspace } from '../common/decorators/current-workspace.decorator';
import { RelatoriosReadModelService } from './services/relatorios-read-model.service';
import { ExportadorRelatorioService } from './services/exportador-relatorio.service';

@Controller('relatorios')
@UseGuards(JwtAuthGuard)
export class RelatoriosController {
  constructor(
    private readonly readModelService: RelatoriosReadModelService,
    private readonly exportadorService: ExportadorRelatorioService,
  ) {}

  @Get()
  async obterRelatorio(
    @CurrentWorkspace() workspaceId: string,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
    @Query('referenceDate') referenceDate?: string,
  ) {
    return this.readModelService.obterRelatorio(
      workspaceId,
      dataInicio,
      dataFim,
      referenceDate,
    );
  }

  @Get('exportar/pdf')
  async exportarPDF(
    @CurrentWorkspace() workspaceId: string,
    @Res() res: Response,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
    @Query('referenceDate') referenceDate?: string,
  ) {
    const dados = await this.readModelService.obterRelatorio(
      workspaceId,
      dataInicio,
      dataFim,
      referenceDate,
    );
    const pdfBuffer = await this.exportadorService.gerarPDF(dados);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="relatorio-analitico.pdf"',
    );
    res.end(pdfBuffer);
  }

  @Get('exportar/excel')
  async exportarExcel(
    @CurrentWorkspace() workspaceId: string,
    @Res() res: Response,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
    @Query('referenceDate') referenceDate?: string,
  ) {
    const dados = await this.readModelService.obterRelatorio(
      workspaceId,
      dataInicio,
      dataFim,
      referenceDate,
    );
    const excelBuffer = await this.exportadorService.gerarExcel(dados);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="relatorio-analitico.xlsx"',
    );
    res.end(excelBuffer);
  }

  @Get('exportar/csv')
  async exportarCSV(
    @CurrentWorkspace() workspaceId: string,
    @Res() res: Response,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
    @Query('referenceDate') referenceDate?: string,
  ) {
    const dados = await this.readModelService.obterRelatorio(
      workspaceId,
      dataInicio,
      dataFim,
      referenceDate,
    );
    const csvBuffer = await this.exportadorService.gerarCSV(dados);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="relatorio-analitico.csv"',
    );
    res.end(csvBuffer);
  }
}
