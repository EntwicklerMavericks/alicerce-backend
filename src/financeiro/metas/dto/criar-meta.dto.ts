import { IsNotEmpty, IsString, IsNumber, IsPositive, IsOptional, IsDateString, IsInt, Min } from 'class-validator';

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
  @IsNumber()
  @Min(0)
  valorInicial?: number;

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
