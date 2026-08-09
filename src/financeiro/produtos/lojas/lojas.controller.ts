import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LojasService } from './lojas.service';
import { CriarLojaDto } from './dto/criar-loja.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { CurrentWorkspace } from '../../../common/decorators/current-workspace.decorator';

@ApiTags('Lojas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('lojas')
export class LojasController {
  constructor(private readonly lojasService: LojasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cadastra uma nova loja customizada no workspace' })
  async criar(
    @CurrentWorkspace() workspaceId: string,
    @Body() dto: CriarLojaDto,
  ) {
    return this.lojasService.criar(workspaceId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista lojas ativas do workspace e lojas globais do sistema' })
  async listar(@CurrentWorkspace() workspaceId: string) {
    return this.lojasService.listarPorWorkspace(workspaceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtém detalhes de uma loja específica' })
  async obterPorId(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.lojasService.obterPorId(workspaceId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza uma loja customizada do workspace' })
  async atualizar(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: CriarLojaDto,
  ) {
    return this.lojasService.atualizar(workspaceId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove (soft delete) uma loja do workspace' })
  async remover(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
  ) {
    await this.lojasService.remover(workspaceId, id);
  }
}
