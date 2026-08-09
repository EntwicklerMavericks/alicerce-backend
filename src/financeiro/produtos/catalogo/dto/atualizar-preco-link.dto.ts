import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class AtualizarPrecoLinkDto {
  @ApiProperty({ example: 399.9, description: 'Novo preço observado em reais (> 0)' })
  @IsNumber()
  @Min(0.01, { message: 'O preço deve ser maior que zero' })
  preco: number;

  @ApiProperty({ example: 0, description: 'Versão atual do link para trava de concorrência otimista' })
  @IsInt()
  @Min(0, { message: 'A versão deve ser maior ou igual a 0' })
  versao: number;

  @ApiPropertyOptional({ example: 'https://www.leroymerlin.com.br/torneira-deca-123', description: 'Atualização opcional da URL' })
  @IsOptional()
  @IsString()
  url?: string;
}
