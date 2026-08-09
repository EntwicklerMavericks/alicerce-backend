import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MetasService } from './metas.service';
import { CriarMetaDto } from './dto/criar-meta.dto';
import { AtualizarMetaDto } from './dto/atualizar-meta.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentWorkspace } from '../../common/decorators/current-workspace.decorator';

@ApiTags('Metas Financial Goals')
@Controller('metas')
@UseGuards(JwtAuthGuard)
export class MetasController {
  constructor(private readonly metasService: MetasService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova Meta de Economia' })
  @ApiResponse({ status: 201, description: 'Meta criada com sucesso' })
  async criar(
    @CurrentWorkspace() workspaceId: string,
    @Body() dto: CriarMetaDto,
  ) {
    return this.metasService.criar(workspaceId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar metas com valorAcumulado derivado, progresso %, ritmo e esforço mensal' })
  async listar(@CurrentWorkspace() workspaceId: string) {
    return this.metasService.listar(workspaceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes da Meta por ID com histórico completo de aportes' })
  async obterPorId(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.metasService.obterPorId(workspaceId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar dados da Meta' })
  async atualizar(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: AtualizarMetaDto,
  ) {
    return this.metasService.atualizar(workspaceId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancelar ou remover uma Meta e seus aportes' })
  async remover(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.metasService.remover(workspaceId, id);
  }
}
