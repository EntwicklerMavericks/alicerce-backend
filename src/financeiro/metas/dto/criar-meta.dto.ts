import { IsNotEmpty, IsString, IsNumber, IsPositive, IsOptional, IsDateString, IsInt } from 'class-validator';

export class CriarMetaDto {
  @IsNotEmpty()
  @IsString()
  nome: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  valorAlvo: number;

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
