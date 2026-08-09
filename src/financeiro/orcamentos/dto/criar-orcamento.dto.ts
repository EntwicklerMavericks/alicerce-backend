import { IsNotEmpty, IsString, IsInt, Min, Max, IsNumber, IsPositive, IsOptional } from 'class-validator';

export class CriarOrcamentoDto {
  @IsNotEmpty()
  @IsString()
  categoriaId: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(12)
  mes: number;

  @IsNotEmpty()
  @IsInt()
  @Min(2000)
  @Max(2100)
  ano: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  teto?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  valorPlanejado?: number;
}
