import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class VincularLinkDto {
  @ApiProperty({ example: 'loja-uuid-123', description: 'ID da loja (global ou do workspace)' })
  @IsString()
  @IsNotEmpty({ message: 'O ID da loja é obrigatório' })
  lojaId: string;

  @ApiProperty({ example: 'https://www.leroymerlin.com.br/torneira-deca-123', description: 'URL do anúncio do produto' })
  @IsString()
  @IsNotEmpty({ message: 'A URL do anúncio é obrigatória' })
  url: string;

  @ApiProperty({ example: 450.9, description: 'Preço observado em reais (> 0)' })
  @IsNumber()
  @Min(0.01, { message: 'O preço deve ser maior que zero' })
  preco: number;
}
