import { IsOptional, IsInt, IsBoolean, IsEnum, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SeveridadeAlertaEnum } from '../alertas.service';

export class ListarAlertasQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1, description: 'Número da página' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10, description: 'Quantidade por página' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 10;

  @ApiPropertyOptional({ example: true, description: 'Filtrar apenas alertas não lidos' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  apenasNaoLidos?: boolean;

  @ApiPropertyOptional({ enum: SeveridadeAlertaEnum, description: 'Filtrar por nível de severidade' })
  @IsOptional()
  @IsEnum(SeveridadeAlertaEnum)
  severidade?: SeveridadeAlertaEnum;
}
