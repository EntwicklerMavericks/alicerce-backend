import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CriarLojaDto {
  @ApiProperty({ example: 'Leroy Merlin', description: 'Nome da loja' })
  @IsString()
  @IsNotEmpty({ message: 'O nome da loja é obrigatório' })
  nome: string;

  @ApiPropertyOptional({ example: 'https://www.leroymerlin.com.br', description: 'URL do website da loja' })
  @IsOptional()
  @IsString()
  urlWebsite?: string;

  @ApiPropertyOptional({ example: 'https://www.leroymerlin.com.br/logo.png', description: 'URL da logo da loja' })
  @IsOptional()
  @IsString()
  urlLogo?: string;
}
