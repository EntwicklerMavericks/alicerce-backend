import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CriarCompraCartaoDto {
  @ApiProperty({ description: 'ID do cartão de crédito', example: 'cartao-123' })
  @IsNotEmpty()
  @IsString()
  cartaoId: string;

  @ApiProperty({ description: 'ID da categoria financeira', example: 'cat-mercado' })
  @IsNotEmpty()
  @IsString()
  categoriaId: string;

  @ApiProperty({ description: 'Descrição da compra', example: 'Supermercado Mensal' })
  @IsNotEmpty()
  @IsString()
  descricao: string;

  @ApiProperty({ description: 'Valor total da compra em Reais', example: 1000.0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  valorTotal: number;

  @ApiProperty({ description: 'Quantidade de parcelas (1x até Nx)', example: 3, default: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  qtdParcelas: number;

  @ApiProperty({ description: 'Data em que a compra foi realizada', example: '2026-08-20T14:30:00.000Z' })
  @IsNotEmpty()
  @IsString()
  dataCompra: string;

  @ApiProperty({ description: 'Observações adicionais', example: 'Compra de suprimentos no Atacadão', required: false })
  @IsOptional()
  @IsString()
  observacoes?: string;
}
