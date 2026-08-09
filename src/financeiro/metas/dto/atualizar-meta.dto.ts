import { IsOptional, IsString, IsNumber, IsPositive, IsDateString, IsInt } from 'class-validator';

export class AtualizarMetaDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  valorAlvo?: number;

  @IsOptional()
  @IsDateString()
  prazo?: string;

  @IsOptional()
  @IsString()
  icone?: string;

  @IsOptional()
  @IsString()
  cor?: string;

  @IsOptional()
  @IsInt()
  prioridade?: number;
}
