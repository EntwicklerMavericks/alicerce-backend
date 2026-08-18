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
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentWorkspace } from '../../common/decorators/current-workspace.decorator';
import { CotacoesService } from './cotacoes.service';
import { RegistrarCotacaoAvulsaDto } from './dto/registrar-cotacao-avulsa.dto';
import { AtualizarPrecoLinkDto } from './dto/atualizar-preco-link.dto';

@ApiTags('Cotações & Comparador')
@Controller('cotacoes')
@UseGuards(JwtAuthGuard)
export class CotacoesController {
  constructor(private readonly cotacoesService: CotacoesService) {}

  @Post('avulsa')
  @ApiOperation({
    summary: 'Registrar cotação avulsa manual para um item da wishlist com validação cross-tenant',
  })
  @ApiResponse({ status: 201, description: 'Cotação avulsa registrada com sucesso' })
  async registrarCotacaoAvulsa(
    @CurrentWorkspace() workspaceId: string,
    @Body() dto: RegistrarCotacaoAvulsaDto,
  ) {
    return await this.cotacoesService.registrarCotacaoAvulsa(workspaceId, dto);
  }

  @Get('item/:itemWishlistId/comparador')
  @ApiOperation({
    summary: 'Obter comparativo de cotações e ofertas consolidadas para um item da wishlist (ApexCharts format)',
  })
  @ApiResponse({ status: 200, description: 'Payload do comparador obtido com sucesso' })
  async obterComparador(
    @CurrentWorkspace() workspaceId: string,
    @Param('itemWishlistId') itemWishlistId: string,
  ) {
    return await this.cotacoesService.obterComparadorItem(
      workspaceId,
      itemWishlistId,
    );
  }

  @Post('item/:itemWishlistId/buscar-automatico')
  @ApiOperation({
    summary: 'Executar busca sob demanda de cotações de mercado (Mercado Livre + Scraper Web) com SSRF Guard',
  })
  @ApiResponse({ status: 200, description: 'Busca de cotações concluída' })
  async buscarCotacoesSobDemanda(
    @CurrentWorkspace() workspaceId: string,
    @Param('itemWishlistId') itemWishlistId: string,
  ) {
    return await this.cotacoesService.buscarEGravarCotacoesSobDemanda(
      workspaceId,
      itemWishlistId,
    );
  }

  @Delete('avulsa/:id')
  @ApiOperation({ summary: 'Remover (soft delete) uma cotação avulsa' })
  @ApiResponse({ status: 200, description: 'Cotação avulsa desativada com sucesso' })
  async removerCotacaoAvulsa(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
  ) {
    return await this.cotacoesService.removerCotacaoAvulsa(workspaceId, id);
  }

  @Patch('link/:id/preco')
  @ApiOperation({ summary: 'Atualizar preço de um link de produto com controle de concorrência' })
  @ApiResponse({ status: 200, description: 'Preço do link atualizado' })
  async atualizarPrecoLink(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: AtualizarPrecoLinkDto,
  ) {
    return await this.cotacoesService.atualizarPrecoLink(workspaceId, id, dto);
  }

  @Post('monitoramento')
  @ApiOperation({ summary: 'Executar job de monitoramento de preços para links do workspace' })
  @ApiResponse({ status: 200, description: 'Resumo da execução do monitoramento' })
  async executarMonitoramento(@CurrentWorkspace() workspaceId: string) {
    return await this.cotacoesService.executarMonitoramentoPrecos(workspaceId);
  }
}
