import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsInt,
  IsDateString,
} from 'class-validator';

export class CriarProjetoDto {
  @ApiProperty({ description: 'Nome do projeto de longo prazo' })
  @IsString()
  @IsNotEmpty({ message: 'O nome do projeto é obrigatório.' })
  nome: string;

  @ApiPropertyOptional({ description: 'Descrição detalhada do projeto' })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional({ description: 'Orçamento estimado manual definido pelo usuário' })
  @IsOptional()
  @IsNumber({}, { message: 'O orçamento estimado deve ser um número.' })
  @Min(0, { message: 'O orçamento estimado não pode ser negativo.' })
  orcamentoEstimado?: number;

  @ApiPropertyOptional({ description: 'Nível de prioridade do projeto (1 = Normal, 2 = Alta, etc.)' })
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
