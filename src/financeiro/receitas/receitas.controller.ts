import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ReceitasService } from './receitas.service';
import { CriarReceitaDto } from './dto/criar-receita.dto';
import { EstornarLancamentoDto } from './dto/estornar-lancamento.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentWorkspace } from '../../common/decorators/current-workspace.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('financeiro/receitas')
@UseGuards(JwtAuthGuard)
export class ReceitasController {
  constructor(private readonly receitasService: ReceitasService) {}

  @Post()
  criar(
    @CurrentWorkspace() workspaceId: string,
    @CurrentUser('id') usuarioId: string,
    @Body() dto: CriarReceitaDto,
  ) {
    return this.receitasService.criar(workspaceId, usuarioId, dto);
  }

  @Get()
  listar(
    @CurrentWorkspace() workspaceId: string,
    @Query('mes') mes?: string,
    @Query('ano') ano?: string,
  ) {
    return this.receitasService.listarPorWorkspace(
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
    return this.receitasService.darBaixa(workspaceId, id, usuarioId, carteiraId);
  }

  @Post(':id/estorno')
  estornar(
    @CurrentWorkspace() workspaceId: string,
    @CurrentUser('id') usuarioId: string,
    @Param('id') id: string,
    @Body() dto: EstornarLancamentoDto,
  ) {
    return this.receitasService.estornar(workspaceId, id, usuarioId, dto);
  }

  @Delete(':id')
  remover(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.receitasService.remover(workspaceId, id);
  }
}
