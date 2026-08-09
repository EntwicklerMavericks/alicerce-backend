import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { OrcamentosService } from './orcamentos.service';
import { CriarOrcamentoDto } from './dto/criar-orcamento.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentWorkspace } from '../../common/decorators/current-workspace.decorator';

@ApiTags('Orçamentos')
@Controller('orcamentos')
@UseGuards(JwtAuthGuard)
export class OrcamentosController {
  constructor(private readonly orcamentosService: OrcamentosService) {}

  @Post()
  @ApiOperation({ summary: 'Criar ou atualizar teto de orçamento para uma categoria no mês/ano' })
  @ApiResponse({ status: 201, description: 'Orçamento salvo com sucesso' })
  async criarOuAtualizar(
    @CurrentWorkspace() workspaceId: string,
    @Body() dto: CriarOrcamentoDto,
  ) {
    return this.orcamentosService.criarOuAtualizar(workspaceId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar orçamentos com consumo contábil e estados (NORMAL, ALERTA, ATENCAO, EXCEDIDO)' })
  @ApiQuery({ name: 'ano', required: false, type: Number })
  @ApiQuery({ name: 'mes', required: false, type: Number })
  async listar(
    @CurrentWorkspace() workspaceId: string,
    @Query('ano') ano?: string,
    @Query('mes') mes?: string,
  ) {
    const anoNum = ano ? parseInt(ano, 10) : undefined;
    const mesNum = mes ? parseInt(mes, 10) : undefined;
    return this.orcamentosService.listarComConsumo(workspaceId, mesNum, anoNum);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um orçamento' })
  async remover(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.orcamentosService.remover(workspaceId, id);
  }
}
