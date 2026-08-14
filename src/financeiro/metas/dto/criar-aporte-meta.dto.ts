import { IsNotEmpty, IsNumber, IsPositive, IsOptional, IsDateString, IsString } from 'class-validator';

export class CriarAporteMetaDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  valor: number;

  @IsOptional()
  @IsDateString()
  data?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsString()
  observacao?: string;
}
