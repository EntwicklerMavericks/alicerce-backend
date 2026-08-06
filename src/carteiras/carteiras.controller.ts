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
import { CarteirasService } from './carteiras.service';
import { CriarCarteiraDto } from './dto/criar-carteira.dto';
import { TransferirFundosDto } from './dto/transferir-fundos.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentWorkspace } from '../common/decorators/current-workspace.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Carteiras')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('carteiras')
export class CarteirasController {
  constructor(private readonly carteirasService: CarteirasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cadastra uma nova carteira/conta financeiras' })
  async criar(
    @CurrentWorkspace() workspaceId: string,
    @CurrentUser('id') usuarioId: string,
    @Body() dto: CriarCarteiraDto,
  ) {
    return this.carteirasService.criar(workspaceId, usuarioId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as carteiras e o saldo total do workspace' })
  async listarPorWorkspace(@CurrentWorkspace() workspaceId: string) {
    return this.carteirasService.listarPorWorkspace(workspaceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retorna os detalhes de uma carteira específica com seu saldo' })
  async obterPorId(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.carteirasService.obterPorId(workspaceId, id);
  }

  @Get(':id/extrato')
  @ApiOperation({ summary: 'Retorna o extrato recente de movimentações da carteira' })
  async obterExtrato(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.carteirasService.obterExtrato(workspaceId, id);
  }

  @Post('transferir')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Realiza uma transferência atômica de saldo entre duas carteiras' })
  async transferirFundos(
    @CurrentWorkspace() workspaceId: string,
    @CurrentUser('id') usuarioId: string,
    @Body() dto: TransferirFundosDto,
  ) {
    return this.carteirasService.transferirFundos(workspaceId, usuarioId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove (soft delete) uma carteira' })
  async remover(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
  ) {
    await this.carteirasService.remover(workspaceId, id);
  }
}
