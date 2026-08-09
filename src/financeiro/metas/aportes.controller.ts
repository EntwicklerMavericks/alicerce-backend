import { Controller, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MetasService } from './metas.service';
import { CriarAporteMetaDto } from './dto/criar-aporte-meta.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentWorkspace } from '../../common/decorators/current-workspace.decorator';

@ApiTags('Aportes de Meta')
@Controller('metas')
@UseGuards(JwtAuthGuard)
export class AportesController {
  constructor(private readonly metasService: MetasService) {}

  @Post(':id/aportes')
  @ApiOperation({ summary: 'Registrar um novo Aporte em uma Meta' })
  @ApiResponse({ status: 201, description: 'Aporte registrado com sucesso' })
  async registrarAporte(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') metaId: string,
    @Body() dto: CriarAporteMetaDto,
  ) {
    return this.metasService.registrarAporte(workspaceId, metaId, dto);
  }

  @Delete(':id/aportes/:aporteId')
  @ApiOperation({ summary: 'Remover um Aporte de uma Meta' })
  async removerAporte(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') metaId: string,
    @Param('aporteId') aporteId: string,
  ) {
    return this.metasService.removerAporte(workspaceId, metaId, aporteId);
  }
}
