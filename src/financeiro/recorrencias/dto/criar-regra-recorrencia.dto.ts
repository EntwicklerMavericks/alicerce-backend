import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CriarRegraRecorrenciaDto {
  @ApiProperty({ description: 'Tipo de lançamento', enum: ['RECEITA', 'DESPESA'], example: 'DESPESA' })
  @IsNotEmpty()
  @IsEnum(['RECEITA', 'DESPESA'])
  tipo: 'RECEITA' | 'DESPESA';

  @ApiProperty({ description: 'Descrição da regra recorrente', example: 'Aluguel do Imóvel' })
  @IsNotEmpty()
  @IsString()
  descricao: string;

  @ApiProperty({ description: 'Valor fixo estimado em Reais', example: 2500.0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  valor: number;

  @ApiProperty({ description: 'Dia do mês de vencimento (1 a 31)', example: 10 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(31)
  diaVencimento: number;

  @ApiProperty({ description: 'ID da categoria financeira', example: 'cat-moradia' })
  @IsNotEmpty()
  @IsString()
  categoriaId: string;

  @ApiProperty({ description: 'ID da carteira de vinculação (opcional)', example: 'cart-123', required: false })
  @IsOptional()
  @IsString()
  carteiraId?: string;

  @ApiProperty({ description: 'Data de início da vigência do contrato', example: '2026-01-01T00:00:00.000Z' })
  @IsNotEmpty()
  @IsDateString()
  dataInicio: string;

  @ApiProperty({ description: 'Data de término da vigência do contrato (opcional)', example: '2026-12-31T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  dataFim?: string;
}
