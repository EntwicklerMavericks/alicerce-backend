import { Controller, Get, Post, Param, Body, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CartoesService } from './cartoes.service';
import { CriarCartaoDto } from './dto/criar-cartao.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Cartões de Crédito')
@Controller('financeiro/cartoes')
@UseGuards(JwtAuthGuard)
export class CartoesController {
  constructor(private readonly cartoesService: CartoesService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar um novo cartão de crédito' })
  @ApiResponse({ status: 201, description: 'Cartão de crédito criado com sucesso' })
  async criarCartao(@Body() dto: CriarCartaoDto, @Request() req: any) {
    const workspaceId = req.user?.workspaceId || 'workspace-demo-id';
    return this.cartoesService.criarCartao(workspaceId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar cartões de crédito do workspace com limites projetados' })
  @ApiResponse({ status: 200, description: 'Lista de cartões retornada com sucesso' })
  async listarCartoes(@Request() req: any) {
    const workspaceId = req.user?.workspaceId || 'workspace-demo-id';
    return this.cartoesService.listarCartoes(workspaceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um cartão de crédito por ID' })
  @ApiParam({ name: 'id', description: 'ID do cartão' })
  @ApiResponse({ status: 200, description: 'Cartão encontrado' })
  async obterPorId(@Param('id') id: string) {
    return this.cartoesService.obterPorId(id);
  }
}
