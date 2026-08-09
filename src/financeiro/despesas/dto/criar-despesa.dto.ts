import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDateString, IsEnum, IsBoolean } from 'class-validator';
import { StatusLiquidacao } from '@prisma/client';

export class CriarDespesaDto {
  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsNumber()
  valor: number;

  @IsDateString()
  dataVencimento: string;

  @IsString()
  @IsNotEmpty()
  categoriaId: string;

  @IsString()
  @IsOptional()
  carteiraId?: string;

  @IsString()
  @IsOptional()
  cartaoId?: string;

  @IsString()
  @IsOptional()
  metaId?: string;

  @IsEnum(StatusLiquidacao)
  @IsOptional()
  statusLiquidacao?: StatusLiquidacao;

  @IsString()
  @IsOptional()
  observacoes?: string;

  @IsBoolean()
  @IsOptional()
  recorrente?: boolean;

  @IsString()
  @IsOptional()
  origemRecorrenciaId?: string;
}
