import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PessoasService } from './pessoas.service';
import { CriarPessoaDto } from './dto/criar-pessoa.dto';
import { AtualizarSalarioDto } from './dto/atualizar-salario.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentWorkspace } from '../common/decorators/current-workspace.decorator';

@ApiTags('Pessoas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pessoas')
export class PessoasController {
  constructor(private readonly pessoasService: PessoasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cadastra um membro da família e sua configuração salarial' })
  async criar(
    @CurrentWorkspace() workspaceId: string,
    @Body() dto: CriarPessoaDto,
  ) {
    return this.pessoasService.criar(workspaceId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as pessoas ativas do workspace' })
  async listarPorWorkspace(@CurrentWorkspace() workspaceId: string) {
    return this.pessoasService.listarPorWorkspace(workspaceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retorna os detalhes de uma pessoa específica' })
  async obterPorId(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.pessoasService.obterPorId(workspaceId, id);
  }

  @Patch(':id/salario')
  @ApiOperation({ summary: 'Atualiza o salário ativo de um membro da família' })
  async atualizarSalario(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: AtualizarSalarioDto,
  ) {
    return this.pessoasService.atualizarSalario(workspaceId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove (soft delete) um membro da família' })
  async remover(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
  ) {
    await this.pessoasService.remover(workspaceId, id);
  }
}
