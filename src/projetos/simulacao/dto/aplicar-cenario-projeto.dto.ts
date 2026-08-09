import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SimularCenarioProjetoDto } from './simular-cenario-projeto.dto';

export class VersaoEtapaEsperadaDto {
  etapaId: string;
  versaoEsperada: number;
}

export class AplicarCenarioProjetoDto {
  @ApiProperty({ description: 'Versão esperada do projeto pai para trava otimista' })
  @IsNotEmpty()
  @IsNumber()
  versaoProjetoEsperada: number;

  @ApiPropertyOptional({ description: 'Versões esperadas das etapas do projeto' })
  @IsOptional()
  versoesEtapasEsperadas?: VersaoEtapaEsperadaDto[];

  @ApiProperty({ description: 'Parâmetros do cenário a serem aplicados no projeto' })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => SimularCenarioProjetoDto)
  parametrosSimulacao: SimularCenarioProjetoDto;
}
