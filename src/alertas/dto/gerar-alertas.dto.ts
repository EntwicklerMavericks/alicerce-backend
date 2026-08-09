import { IsOptional, IsDateString, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  DespesaContexto,
  FaturaContexto,
  OrcamentoContexto,
  MetaContexto,
  SalarioContexto,
  WishlistContexto,
  SistemaContexto,
} from '../domain/alertas-engine.service';

export class GerarAlertasDto {
  @ApiPropertyOptional({ example: '2026-08-08T00:00:00Z', description: 'Data determinística de referência' })
  @IsOptional()
  @IsDateString()
  referenceDate?: string;

  @ApiPropertyOptional({ description: 'Lista de despesas a analisar' })
  @IsOptional()
  @IsArray()
  despesas?: DespesaContexto[];

  @ApiPropertyOptional({ description: 'Lista de faturas a analisar' })
  @IsOptional()
  @IsArray()
  faturas?: FaturaContexto[];

  @ApiPropertyOptional({ description: 'Lista de orçamentos a analisar' })
  @IsOptional()
  @IsArray()
  orcamentos?: OrcamentoContexto[];

  @ApiPropertyOptional({ description: 'Lista de metas a analisar' })
  @IsOptional()
  @IsArray()
  metas?: MetaContexto[];

  @ApiPropertyOptional({ description: 'Lista de salários a analisar' })
  @IsOptional()
  @IsArray()
  salarios?: SalarioContexto[];

  @ApiPropertyOptional({ description: 'Lista de itens da wishlist a analisar' })
  @IsOptional()
  @IsArray()
  wishlist?: WishlistContexto[];

  @ApiPropertyOptional({ description: 'Lista de avisos do sistema a analisar' })
  @IsOptional()
  @IsArray()
  sistemas?: SistemaContexto[];
}
