import { Controller, Get, Post, Param, Body, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { FaturasService } from './faturas.service';
import { PagarFaturaDto } from './dto/pagar-fatura.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Faturas de Cartão de Crédito')
@Controller('financeiro/faturas')
@UseGuards(JwtAuthGuard)
export class FaturasController {
  constructor(private readonly faturasService: FaturasService) {}

  @Get('cartao/:cartaoId')
  @ApiOperation({ summary: 'Listar faturas de um cartão de crédito' })
  @ApiParam({ name: 'cartaoId', description: 'ID do cartão de crédito' })
  @ApiResponse({ status: 200, description: 'Lista de faturas retornada com sucesso' })
  async obterFaturasDoCartao(@Param('cartaoId') cartaoId: string) {
    return this.faturasService.obterFaturasDoCartao(cartaoId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de uma fatura por ID' })
  @ApiParam({ name: 'id', description: 'ID da fatura' })
  @ApiResponse({ status: 200, description: 'Fatura encontrada' })
  @ApiResponse({ status: 404, description: 'Fatura não encontrada' })
  async obterFaturaPorId(@Param('id') id: string) {
    return this.faturasService.obterFaturaPorId(id);
  }

  @Post(':id/pagar')
  @ApiOperation({ summary: 'Realizar pagamento integral da fatura (gera movimentação no Financial Ledger)' })
  @ApiParam({ name: 'id', description: 'ID da fatura' })
  @ApiResponse({ status: 200, description: 'Fatura quitada com sucesso' })
  @ApiResponse({ status: 409, description: 'Fatura já quitada ou concorrência detectada' })
  async pagarFatura(@Param('id') id: string, @Body() dto: PagarFaturaDto, @Request() req: any) {
    const usuarioId = req.user?.sub || req.user?.id;
    return this.faturasService.pagarFatura(id, dto, usuarioId);
  }
}
