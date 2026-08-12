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
import { CategoriasService } from './categorias.service';
import { CriarCategoriaDto } from './dto/criar-categoria.dto';
import { AtualizarCategoriaDto } from './dto/atualizar-categoria.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentWorkspace } from '../../common/decorators/current-workspace.decorator';

@ApiTags('Categorias Financeiras')
@Controller('financeiro/categorias')
@UseGuards(JwtAuthGuard)
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova categoria customizada no workspace' })
  @ApiResponse({ status: 201, description: 'Categoria criada com sucesso' })
  criar(
    @CurrentWorkspace() workspaceId: string,
    @Body() dto: CriarCategoriaDto,
  ) {
    return this.categoriasService.criar(workspaceId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar categorias do workspace (inclui categorias padrão do sistema)' })
  @ApiResponse({ status: 200, description: 'Lista de categorias retornada com sucesso' })
  listar(@CurrentWorkspace() workspaceId: string) {
    return this.categoriasService.listarPorWorkspace(workspaceId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar categoria customizada do workspace' })
  @ApiResponse({ status: 200, description: 'Categoria atualizada com sucesso' })
  atualizar(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: AtualizarCategoriaDto,
  ) {
    return this.categoriasService.atualizar(workspaceId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir categoria customizada sem lançamentos vinculados' })
  @ApiResponse({ status: 200, description: 'Categoria removida com sucesso' })
  remover(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.categoriasService.remover(workspaceId, id);
  }
}
