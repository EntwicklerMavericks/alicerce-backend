import { Controller, Get, Post, Patch, Param, Body, Request, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RecorrenciasService } from './recorrencias.service';
import { RecurringGeneratorService } from './recurring-generator.service';
import { CriarRegraRecorrenciaDto } from './dto/criar-regra-recorrencia.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { YearMonth } from '../domain/value-objects/year-month.vo';

@ApiTags('Recorrências Financeiras (Google Calendar Pattern)')
@Controller('financeiro/recorrencias')
@UseGuards(JwtAuthGuard)
export class RecorrenciasController {
  constructor(
    private readonly recorrenciasService: RecorrenciasService,
    private readonly generatorService: RecurringGeneratorService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar nova regra de lançamento recorrente' })
  @ApiResponse({ status: 201, description: 'Regra criada com sucesso' })
  async criarRegra(@Body() dto: CriarRegraRecorrenciaDto, @Request() req: any) {
    const workspaceId = req.user?.workspaceId || 'workspace-demo-id';
    return this.recorrenciasService.criarRegra(workspaceId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar regras de recorrência do workspace' })
  @ApiResponse({ status: 200, description: 'Lista de regras retornada com sucesso' })
  async listarRegras(@Request() req: any) {
    const workspaceId = req.user?.workspaceId || 'workspace-demo-id';
    return this.recorrenciasService.listarRegras(workspaceId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Alternar status da regra (ATIVA, PAUSADA, CANCELADA)' })
  @ApiResponse({ status: 200, description: 'Status atualizado com sucesso' })
  async alternarStatus(@Param('id') id: string, @Body('status') status: 'ATIVA' | 'PAUSADA' | 'CANCELADA') {
    return this.recorrenciasService.alternarStatus(id, status);
  }

  @Post('processar-competencia')
  @ApiOperation({ summary: 'Processar e gerar lançamentos para uma competência (Idempotente)' })
  @ApiQuery({ name: 'competencia', description: 'Formato YYYY-MM (ex: 2026-08)', required: false })
  @ApiResponse({ status: 200, description: 'Lançamentos gerados com sucesso' })
  async processarCompetencia(@Query('competencia') competenciaISO?: string, @Request() req?: any) {
    const workspaceId = req?.user?.workspaceId;
    const ym = competenciaISO ? YearMonth.deStringISO(competenciaISO) : YearMonth.daData(new Date());

    const totalGerados = await this.generatorService.processarCompetencia(ym, workspaceId);
    return {
      competencia: ym.formatarISO(),
      totalGerados,
    };
  }
}
