import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { DespesasService } from './despesas.service';
import { CriarDespesaDto } from './dto/criar-despesa.dto';
import { EstornarLancamentoDto } from '../receitas/dto/estornar-lancamento.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentWorkspace } from '../../common/decorators/current-workspace.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('financeiro/despesas')
@UseGuards(JwtAuthGuard)
export class DespesasController {
  constructor(private readonly despesasService: DespesasService) {}

  @Post()
  criar(
    @CurrentWorkspace() workspaceId: string,
    @CurrentUser('id') usuarioId: string,
    @Body() dto: CriarDespesaDto,
  ) {
    return this.despesasService.criar(workspaceId, usuarioId, dto);
  }

  @Get()
  listar(
    @CurrentWorkspace() workspaceId: string,
    @Query('mes') mes?: string,
    @Query('ano') ano?: string,
  ) {
    return this.despesasService.listarPorWorkspace(
      workspaceId,
      mes ? parseInt(mes, 10) : undefined,
      ano ? parseInt(ano, 10) : undefined,
    );
  }

  @Patch(':id/baixa')
  darBaixa(
    @CurrentWorkspace() workspaceId: string,
    @CurrentUser('id') usuarioId: string,
    @Param('id') id: string,
    @Body('carteiraId') carteiraId?: string,
  ) {
    return this.despesasService.darBaixa(workspaceId, id, usuarioId, carteiraId);
  }

  @Post(':id/estorno')
  estornar(
    @CurrentWorkspace() workspaceId: string,
    @CurrentUser('id') usuarioId: string,
    @Param('id') id: string,
    @Body() dto: EstornarLancamentoDto,
  ) {
    return this.despesasService.estornar(workspaceId, id, usuarioId, dto);
  }

  @Delete(':id')
  remover(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.despesasService.remover(workspaceId, id);
  }
}
