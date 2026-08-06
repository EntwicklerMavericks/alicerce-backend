import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TipoCarteiraEnum {
  CONTA_CORRENTE = 'CONTA_CORRENTE',
  DINHEIRO = 'DINHEIRO',
  CARTEIRA_DIGITAL = 'CARTEIRA_DIGITAL',
  POUPANCA = 'POUPANCA',
  INVESTIMENTO = 'INVESTIMENTO',
  CARTAO_CREDITO = 'CARTAO_CREDITO',
}

export class CriarCarteiraDto {
  @ApiProperty({ example: 'Nubank Principal', description: 'Nome da carteira ou conta bancária' })
  @IsString()
  @IsNotEmpty({ message: 'O nome da carteira é obrigatório' })
  nome: string;

  @ApiProperty({ enum: TipoCarteiraEnum, example: TipoCarteiraEnum.CONTA_CORRENTE })
  @IsEnum(TipoCarteiraEnum)
  tipo: TipoCarteiraEnum;

  @ApiPropertyOptional({ example: 'pessoa-uuid-123', description: 'ID da pessoa titular da conta' })
  @IsOptional()
  @IsString()
  pessoaId?: string;

  @ApiPropertyOptional({ example: 1500.0, description: 'Saldo inicial de abertura da conta' })
  @IsOptional()
  @IsNumber()
  saldoInicial?: number;

  @ApiPropertyOptional({ example: true, description: 'Permite saldo negativo nesta conta' })
  @IsOptional()
  @IsBoolean()
  permiteSaldoNegativo?: boolean;

  @ApiPropertyOptional({ example: '#8A05BE', description: 'Cor em formato HEX' })
  @IsOptional()
  @IsString()
  cor?: string;

  @ApiPropertyOptional({ example: 'account_balance', description: 'Nome do ícone Material Symbols' })
  @IsOptional()
  @IsString()
  icone?: string;

  @ApiPropertyOptional({ example: false, description: 'Marcar como carteira principal do workspace' })
  @IsOptional()
  @IsBoolean()
  padrao?: boolean;
}
