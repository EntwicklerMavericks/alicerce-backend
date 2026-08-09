import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CriarCartaoDto {
  @ApiProperty({ description: 'Nome de identificação do cartão', example: 'Nubank UV' })
  @IsNotEmpty()
  @IsString()
  nome: string;

  @ApiProperty({ description: 'Bandeira do cartão', example: 'MASTERCARD', required: false })
  @IsOptional()
  @IsString()
  bandeira?: string;

  @ApiProperty({ description: 'Últimos 4 dígitos do cartão físico/virtual', example: '4321', required: false })
  @IsOptional()
  @IsString()
  ultimosDigitos?: string;

  @ApiProperty({ description: 'Limite total concedido em Reais', example: 10000.0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  limiteTotal: number;

  @ApiProperty({ description: 'Dia do mês de fechamento da fatura (1 a 31)', example: 25 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(31)
  diaFechamento: number;

  @ApiProperty({ description: 'Dia do mês de vencimento da fatura (1 a 31)', example: 5 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(31)
  diaVencimento: number;

  @ApiProperty({ description: 'Cor em formato Hex para o card UI', example: '#820ad1', required: false })
  @IsOptional()
  @IsString()
  cor?: string;

  @ApiProperty({ description: 'Ícone Material Icon', example: 'credit_card', required: false })
  @IsOptional()
  @IsString()
  icone?: string;
}
