import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProdutosService } from './produtos.service';
import { CriarProdutoDto } from './dto/criar-produto.dto';
import { AtualizarProdutoDto } from './dto/atualizar-produto.dto';
import { VincularLinkDto } from './dto/vincular-link.dto';
import { AtualizarPrecoLinkDto } from './dto/atualizar-preco-link.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { CurrentWorkspace } from '../../../common/decorators/current-workspace.decorator';

@ApiTags('Produtos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('produtos')
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cadastra um novo produto no catálogo do workspace' })
  async criar(
    @CurrentWorkspace() workspaceId: string,
    @Body() dto: CriarProdutoDto,
  ) {
    return this.produtosService.criar(workspaceId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista os produtos ativos do catálogo do workspace' })
  @ApiQuery({ name: 'categoriaId', required: false, type: String })
  async listar(
    @CurrentWorkspace() workspaceId: string,
    @Query('categoriaId') categoriaId?: string,
  ) {
    return this.produtosService.listarPorWorkspace(workspaceId, categoriaId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtém os detalhes de um produto específico com ofertas e imagens' })
  async obterPorId(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.produtosService.obterPorId(workspaceId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza as informações cadastrais de um produto' })
  async atualizar(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: AtualizarProdutoDto,
  ) {
    return this.produtosService.atualizar(workspaceId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove (soft delete) um produto do catálogo' })
  async remover(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
  ) {
    await this.produtosService.remover(workspaceId, id);
  }

  @Post(':id/links')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Vincular oferta/link de loja ao produto' })
  async vincularLink(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') produtoId: string,
    @Body() dto: VincularLinkDto,
  ) {
    return this.produtosService.vincularLink(workspaceId, produtoId, dto);
  }

  @Put(':id/links/:linkId')
  @ApiOperation({ summary: 'Atualiza o preço observado do link com concorrência otimista' })
  async atualizarPrecoLink(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') produtoId: string,
    @Param('linkId') linkId: string,
    @Body() dto: AtualizarPrecoLinkDto,
  ) {
    return this.produtosService.atualizarPrecoLink(workspaceId, produtoId, linkId, dto);
  }

  @Delete(':id/links/:linkId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove (soft delete) o vínculo de link de um produto' })
  async removerLink(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') produtoId: string,
    @Param('linkId') linkId: string,
  ) {
    await this.produtosService.removerLink(workspaceId, produtoId, linkId);
  }

  @Post(':id/imagens')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Adiciona uma imagem ao produto' })
  async adicionarImagem(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') produtoId: string,
    @Body() dto: { url: string; ordem?: number; principal?: boolean },
  ) {
    return this.produtosService.adicionarImagem(workspaceId, produtoId, dto);
  }

  @Post(':id/imagens/:imagemId/principal')
  @ApiOperation({ summary: 'Define a imagem selecionada como a principal do produto' })
  async definirImagemPrincipal(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') produtoId: string,
    @Param('imagemId') imagemId: string,
  ) {
    return this.produtosService.definirImagemPrincipal(workspaceId, produtoId, imagemId);
  }

  @Delete(':id/imagens/:imagemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove (soft delete) uma imagem do produto' })
  async removerImagem(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') produtoId: string,
    @Param('imagemId') imagemId: string,
  ) {
    await this.produtosService.removerImagem(workspaceId, produtoId, imagemId);
  }
}
