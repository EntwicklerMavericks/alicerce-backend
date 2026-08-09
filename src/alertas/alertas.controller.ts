import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AlertasService } from './alertas.service';
import { ListarAlertasQueryDto } from './dto/listar-alertas-query.dto';
import { GerarAlertasDto } from './dto/gerar-alertas.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurrentWorkspace } from '../common/decorators/current-workspace.decorator';

@ApiTags('Alertas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('alertas')
export class AlertasController {
  constructor(private readonly alertasService: AlertasService) {}

  @Get()
  @ApiOperation({ summary: 'Lista os alertas paginados com filtros de severidade e status de leitura' })
  async listar(
    @CurrentUser('id') usuarioId: string,
    @CurrentWorkspace() workspaceId: string,
    @Query() query: ListarAlertasQueryDto,
  ) {
    return this.alertasService.listarAlertas(usuarioId, workspaceId, query);
  }

  @Get('nao-lidos/count')
  @ApiOperation({ summary: 'Retorna a quantidade total de alertas não lidos' })
  async contarNaoLidos(
    @CurrentUser('id') usuarioId: string,
    @CurrentWorkspace() workspaceId: string,
  ) {
    return this.alertasService.contarNaoLidos(usuarioId, workspaceId);
  }

  @Patch('ler-todos')
  @ApiOperation({ summary: 'Marca todos os alertas não lidos do workspace como lidos' })
  async marcarTodosComoLidos(
    @CurrentUser('id') usuarioId: string,
    @CurrentWorkspace() workspaceId: string,
  ) {
    return this.alertasService.marcarTodosComoLidos(usuarioId, workspaceId);
  }

  @Patch(':id/ler')
  @ApiOperation({ summary: 'Marca um alerta específico como lido' })
  async marcarComoLido(
    @CurrentUser('id') usuarioId: string,
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.alertasService.marcarComoLido(usuarioId, workspaceId, id);
  }

  @Post('gerar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gera e persiste alertas com base no contexto fornecido e regras de idempotência' })
  async gerar(
    @CurrentUser('id') usuarioId: string,
    @CurrentWorkspace() workspaceId: string,
    @Body() dto: GerarAlertasDto,
  ) {
    const contexto = {
      referenceDate: dto.referenceDate ? new Date(dto.referenceDate) : new Date(),
      despesas: dto.despesas,
      faturas: dto.faturas,
      orcamentos: dto.orcamentos,
      metas: dto.metas,
      salarios: dto.salarios,
      wishlist: dto.wishlist,
      sistemas: dto.sistemas,
    };

    return this.alertasService.gerarESalvarAlertas(usuarioId, workspaceId, contexto);
  }
}
