import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsDateString,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { StatusEtapa } from '@prisma/client';

export class AtualizarEtapaProjetoDto {
  @ApiPropertyOptional({ description: 'Nome da etapa do projeto' })
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional({ description: 'Descrição detalhada da etapa' })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional({ description: 'Ordem sequencial da etapa' })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'A ordem da etapa deve ser no mínimo 1.' })
  ordem?: number;

  @ApiPropertyOptional({ description: 'Status da etapa', enum: StatusEtapa })
  @IsOptional()
  @IsEnum(StatusEtapa, { message: 'Status da etapa inválido.' })
  status?: StatusEtapa;

  @ApiPropertyOptional({ description: 'Data de início prevista da etapa (ISO 8601)' })
  @IsOptional()
  @IsDateString({}, { message: 'Data de início deve ser uma data ISO válida.' })
  dataInicio?: string;

  @ApiPropertyOptional({ description: 'Data de conclusão da etapa (ISO 8601)' })
  @IsOptional()
  @IsDateString({}, { message: 'Data de conclusão deve ser uma data ISO válida.' })
  dataConclusao?: string;

  @ApiPropertyOptional({ description: 'Custo estimado da etapa (R$)' })
  @IsOptional()
  @IsNumber({}, { message: 'O custo estimado deve ser um número válido.' })
  @Min(0, { message: 'O custo estimado deve ser no mínimo 0.' })
  custoEstimado?: number;
}
