import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsNumber,
  IsDateString,
  Min,
  Max,
} from 'class-validator';

export class AporteEtapaDto {
  etapaId: string;
  aporteMensal: number;
}

export class AjusteCustoEtapaDto {
  etapaId: string;
  multiplicadorCusto?: number;
  custoFixoAdicional?: number;
}

export class SimularCenarioProjetoDto {
  @ApiPropertyOptional({ description: 'Aporte mensal global aplicado ao projeto' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  aporteMensalGlobal?: number;

  @ApiPropertyOptional({
    description: 'Aportes mensais específicos por etapa (Record ou Array)',
  })
  @IsOptional()
  aportesMensaisEtapas?: Record<string, number> | AporteEtapaDto[];

  @ApiPropertyOptional({
    description: 'Multiplicador do período de esfriamento (0.0 a 2.0)',
    default: 1.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.0)
  @Max(2.0)
  multiplicadorEsfriamento?: number;

  @ApiPropertyOptional({ description: 'Ajustes de custo específicos por etapa' })
  @IsOptional()
  ajustesCustoEtapas?: Record<string, number> | AjusteCustoEtapaDto[];

  @ApiPropertyOptional({ description: 'Data de início simulada para o cronograma' })
  @IsOptional()
  @IsDateString()
  dataInicioSimulada?: string;
}
