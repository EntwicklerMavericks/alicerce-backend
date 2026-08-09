import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsDateString,
} from 'class-validator';

export class CriarEtapaProjetoDto {
  @ApiProperty({ description: 'Nome da etapa do projeto' })
  @IsString()
  @IsNotEmpty({ message: 'O nome da etapa é obrigatório.' })
  nome: string;

  @ApiPropertyOptional({ description: 'Descrição detalhada da etapa' })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional({ description: 'Ordem sequencial da etapa' })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'A ordem da etapa deve ser no mínimo 1.' })
  ordem?: number;

  @ApiPropertyOptional({ description: 'Data de início prevista da etapa (ISO 8601)' })
  @IsOptional()
  @IsDateString({}, { message: 'Data de início deve ser uma data ISO válida.' })
  dataInicio?: string;
}
