import { ApiPropertyOptional } from '@nestjs/swagger';
import { StatusProjeto } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsInt,
  IsEnum,
  IsDateString,
} from 'class-validator';

export class AtualizarProjetoDto {
  @ApiPropertyOptional({ description: 'Nome do projeto' })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'O nome do projeto não pode ser vazio.' })
  nome?: string;

  @ApiPropertyOptional({ description: 'Descrição detalhada do projeto' })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional({ description: 'Ícone representativo (Material Symbol)' })
  @IsOptional()
  @IsString()
  icone?: string;

  @ApiPropertyOptional({ description: 'Cor hex de destaque' })
  @IsOptional()
  @IsString()
  cor?: string;

  @ApiPropertyOptional({ description: 'Prazo estimado de conclusão' })
  @IsOptional()
  @IsString()
  prazoEstimado?: string;

  @ApiPropertyOptional({ description: 'Orçamento estimado manual' })
  @IsOptional()
  @IsNumber({}, { message: 'O orçamento estimado deve ser um número.' })
  @Min(0, { message: 'O orçamento estimado não pode ser negativo.' })
  orcamentoEstimado?: number;

  @ApiPropertyOptional({ description: 'Status do projeto', enum: StatusProjeto })
  @IsOptional()
  @IsEnum(StatusProjeto, { message: 'Status do projeto inválido.' })
  status?: StatusProjeto;

  @ApiPropertyOptional({ description: 'Prioridade do projeto' })
  @IsOptional()
  @IsInt()
  @Min(1)
  prioridade?: number;

  @ApiPropertyOptional({ description: 'Data de início prevista (ISO 8601)' })
  @IsOptional()
  @IsDateString({}, { message: 'Data de início prevista deve ser uma data ISO válida.' })
  dataInicioPrevista?: string;

  @ApiPropertyOptional({ description: 'Data de fim prevista (ISO 8601)' })
  @IsOptional()
  @IsDateString({}, { message: 'Data de fim prevista deve ser uma data ISO válida.' })
  dataFimPrevista?: string;
}
