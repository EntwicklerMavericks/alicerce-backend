import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { StatusWishlist, PrioridadeWishlist } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentWorkspace } from '../../common/decorators/current-workspace.decorator';
import { WishlistService } from './wishlist.service';
import { WishlistAnalyticsReadModelService } from './read-models/wishlist-analytics-read-model.service';
import { CriarItemWishlistDto } from './dto/criar-item-wishlist.dto';
import { AtualizarItemWishlistDto } from './dto/atualizar-item-wishlist.dto';
import { VincularProdutoWishlistDto } from './dto/vincular-produto-wishlist.dto';
import { ConcluirCompraWishlistDto } from './dto/concluir-compra-wishlist.dto';

@ApiTags('Wishlist')
@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(
    private readonly wishlistService: WishlistService,
    private readonly analyticsReadModelService: WishlistAnalyticsReadModelService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo item na wishlist com período de esfriamento' })
  @ApiResponse({ status: 201, description: 'Item criado com sucesso' })
  async criar(
    @CurrentWorkspace() workspaceId: string,
    @Body() dto: CriarItemWishlistDto,
  ) {
    return this.wishlistService.criar(workspaceId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar itens da wishlist com cálculo do tempo restante de esfriamento' })
  @ApiQuery({ name: 'status', enum: StatusWishlist, required: false })
  @ApiQuery({ name: 'prioridade', enum: PrioridadeWishlist, required: false })
  async listar(
    @CurrentWorkspace() workspaceId: string,
    @Query('status') status?: StatusWishlist,
    @Query('prioridade') prioridade?: PrioridadeWishlist,
  ) {
    return this.wishlistService.listar(workspaceId, status, prioridade);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Obter métricas de economia evitada e consumo consciente' })
  async obterAnalytics(@CurrentWorkspace() workspaceId: string) {
    return this.analyticsReadModelService.obterAnalytics(workspaceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um item da wishlist por ID' })
  async obterPorId(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.wishlistService.obterPorId(workspaceId, id);
  }

  @Post(':id/vincular-produto')
  @ApiOperation({ summary: 'Vincular um produto do catálogo a um item da wishlist (valida isolamento multi-tenant)' })
  async vincularProduto(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: VincularProdutoWishlistDto,
  ) {
    return this.wishlistService.vincularProduto(workspaceId, id, dto);
  }

  @Post(':id/desvincular-produto')
  @ApiOperation({ summary: 'Desvincular o produto do catálogo do item da wishlist' })
  async desvincularProduto(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.wishlistService.desvincularProduto(workspaceId, id);
  }

  @Post(':id/desistir')
  @ApiOperation({ summary: 'Desistir da compra e congelar snapshot de valor economizado' })
  async desistir(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.wishlistService.desistir(workspaceId, id);
  }

  @Post(':id/comprar')
  @ApiOperation({ summary: 'Concluir compra, gerar Despesa no Ledger (idempotente) e atualizar item' })
  async concluirCompra(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: ConcluirCompraWishlistDto,
  ) {
    return this.wishlistService.concluirCompra(workspaceId, id, dto);
  }

  @Post(':id/planejar')
  @ApiOperation({ summary: 'Mudar status do item para PLANEJADO' })
  async planejar(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.wishlistService.planejar(workspaceId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar informações de um item da wishlist (PUT)' })
  async atualizarPut(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: AtualizarItemWishlistDto,
  ) {
    return this.wishlistService.atualizar(workspaceId, id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar informações de um item da wishlist (PATCH)' })
  async atualizarPatch(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: AtualizarItemWishlistDto,
  ) {
    return this.wishlistService.atualizar(workspaceId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover (soft delete) um item da wishlist' })
  async remover(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.wishlistService.remover(workspaceId, id);
  }
}
