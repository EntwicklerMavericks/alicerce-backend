import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ComprasCartaoService } from './compras-cartao.service';
import { CriarCompraCartaoDto } from './dto/criar-compra-cartao.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Compras no Cartão de Crédito')
@Controller('api/v1/financeiro/compras-cartao')
@UseGuards(JwtAuthGuard)
export class ComprasCartaoController {
  constructor(private readonly comprasCartaoService: ComprasCartaoService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar nova compra em cartão de crédito (parcelamento atômico em faturas)' })
  @ApiResponse({ status: 201, description: 'Compra e parcelas registradas com sucesso' })
  @ApiResponse({ status: 409, description: 'Fatura fechada ou concorrência detectada' })
  async registrarCompra(@Body() dto: CriarCompraCartaoDto) {
    return this.comprasCartaoService.registrarCompra(dto);
  }
}
