import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  Min,
  IsArray,
  ValidateNested,
  IsString,
  IsNotEmpty,
} from 'class-validator';

export class EtapaOrdemItemDto {
  @ApiProperty({ description: 'ID da etapa do projeto' })
  @IsString()
  @IsNotEmpty({ message: 'ID da etapa é obrigatório.' })
  id: string;

  @ApiProperty({ description: 'Nova posição de ordem da etapa' })
  @IsInt()
  @Min(1, { message: 'A ordem deve ser maior ou igual a 1.' })
  ordem: number;
}

export class ReordenarEtapasDto {
  @ApiProperty({ description: 'Versão esperada do Agregado Pai Projeto para trava otimista' })
  @IsInt({ message: 'A versão esperada deve ser um número inteiro.' })
  @Min(0, { message: 'A versão esperada deve ser maior ou igual a 0.' })
  versaoProjetoEsperada: number;

  @ApiProperty({ description: 'Lista de etapas com suas respectivas novas ordens', type: [EtapaOrdemItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EtapaOrdemItemDto)
  etapas: EtapaOrdemItemDto[];
}
