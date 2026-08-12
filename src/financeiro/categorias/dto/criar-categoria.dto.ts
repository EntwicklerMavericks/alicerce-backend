import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { TipoCategoria } from '@prisma/client';

export class CriarCategoriaDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsEnum(TipoCategoria)
  tipo: TipoCategoria;

  @IsString()
  @IsOptional()
  icone?: string;

  @IsString()
  @IsOptional()
  cor?: string;
}
