import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TipoSalarioEnum {
  FIXO = 'FIXO',
  POR_HORA = 'POR_HORA',
  COMISSAO = 'COMISSAO',
  DIARIO = 'DIARIO',
}

export class ConfigSalarioDto {
  @ApiProperty({ enum: TipoSalarioEnum, example: TipoSalarioEnum.FIXO })
  @IsEnum(TipoSalarioEnum)
  tipo: TipoSalarioEnum;

  @ApiPropertyOptional({ example: 8500.0, description: 'Valor base bruto mensal' })
  @IsOptional()
  @IsNumber()
  valorBase?: number;

  @ApiPropertyOptional({ example: 65.0, description: 'Valor por hora (para tipo POR_HORA)' })
  @IsOptional()
  @IsNumber()
  valorHora?: number;

  @ApiPropertyOptional({ example: 8.0, description: 'Horas trabalhadas por dia' })
  @IsOptional()
  @IsNumber()
  horasDiarias?: number;

  @ApiPropertyOptional({ example: 22, description: 'Dias de trabalho por mês' })
  @IsOptional()
  @IsNumber()
  diasTrabalhoMes?: number;
}

export class CriarPessoaDto {
  @ApiProperty({ example: 'Carla Oliveira', description: 'Nome do membro da família' })
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  nome: string;

  @ApiProperty({ example: 'Cônjuge', description: 'Grau de parentesco (Titular, Cônjuge, Filho)' })
  @IsString()
  @IsNotEmpty({ message: 'O parentesco é obrigatório' })
  parentesco: string;

  @ApiProperty({ type: ConfigSalarioDto })
  @ValidateNested()
  @Type(() => ConfigSalarioDto)
  configSalario: ConfigSalarioDto;
}
