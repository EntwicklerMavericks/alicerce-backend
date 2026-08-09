import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDateString, IsEnum, IsBoolean } from 'class-validator';
import { StatusLiquidacao } from '@prisma/client';

export class CriarReceitaDto {
  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsNumber()
  valor: number;

  @IsDateString()
  data: string;

  @IsString()
  @IsNotEmpty()
  categoriaId: string;

  @IsString()
  @IsOptional()
  carteiraId?: string;

  @IsString()
  @IsOptional()
  pessoaId?: string;

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
