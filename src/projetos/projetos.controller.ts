import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentWorkspace } from '../common/decorators/current-workspace.decorator';
import { ProjetosService } from './projetos.service';
import { CriarProjetoDto } from './dto/criar-projeto.dto';
import { AtualizarProjetoDto } from './dto/atualizar-projeto.dto';
import { CriarEtapaProjetoDto } from './dto/criar-etapa-projeto.dto';
import { ReordenarEtapasDto } from './dto/reordenar-etapas.dto';
import { VincularItemProjetoDto } from './dto/vincular-item-projeto.dto';

@ApiTags('Projetos')
@Controller('projetos')
@UseGuards(JwtAuthGuard)
export class ProjetosController {
  constructor(private readonly projetosService: ProjetosService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo projeto de longo prazo' })
  @ApiResponse({ status: 201, description: 'Projeto criado com sucesso' })
  async criar(
    @CurrentWorkspace() workspaceId: string,
    @Body() dto: CriarProjetoDto,
  ) {
    return this.projetosService.criar(workspaceId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os projetos consolidados do workspace' })
  async listar(@CurrentWorkspace() workspaceId: string) {
    return this.projetosService.listar(workspaceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes consolidados de um projeto via Read Model' })
  async obterPorId(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.projetosService.obterPorId(workspaceId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar informações de um projeto com concorrência otimista' })
  async atualizar(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: AtualizarProjetoDto,
  ) {
    return this.projetosService.atualizar(workspaceId, id, dto);
  }

  @Post(':id/etapas')
  @ApiOperation({ summary: 'Criar uma nova etapa no projeto' })
  async criarEtapa(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: CriarEtapaProjetoDto,
  ) {
    return this.projetosService.criarEtapa(workspaceId, id, dto);
  }

  @Patch(':id/etapas/reordenar')
  @ApiOperation({
    summary:
      'Reordenar etapas de um projeto com trava otimista no Agregado Pai Projeto (versao) e normalização contínua',
  })
  async reordenarEtapas(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: ReordenarEtapasDto,
  ) {
    return this.projetosService.reordenarEtapas(workspaceId, id, dto);
  }

  @Post(':id/etapas/:etapaId/vincular')
  @ApiOperation({
    summary:
      'Vincular item de Wishlist OU Meta a uma etapa do projeto (Invariante XOR & unicidade no MySQL)',
  })
  async vincularItemEtapa(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
    @Param('etapaId') etapaId: string,
    @Body() dto: VincularItemProjetoDto,
  ) {
    return this.projetosService.vincularItemEtapa(workspaceId, id, etapaId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover (soft delete) um projeto e todas as suas etapas' })
  async remover(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.projetosService.remover(workspaceId, id);
  }

  @Post(':id/simular')
  @ApiOperation({ summary: 'Simular cenários executivos What-If e cronograma readiness' })
  async simular(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.projetosService.simular(workspaceId, id, dto);
  }

  @Post(':id/simular/aplicar')
  @ApiOperation({ summary: 'Aplicar parâmetros do cenário simulado ao projeto real' })
  async aplicarSimulacao(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.projetosService.aplicarSimulacao(workspaceId, id, dto);
  }
}
