import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CriarProdutoDto {
  @ApiProperty({ example: 'Torneira Monocomando Deca', description: 'Nome do produto' })
  @IsString()
  @IsNotEmpty({ message: 'O nome do produto é obrigatório' })
  nome: string;

  @ApiPropertyOptional({ example: 'Torneira de cozinha com misturador', description: 'Descrição detalhada' })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional({ example: 'Deca', description: 'Marca do produto' })
  @IsOptional()
  @IsString()
  marca?: string;

  @ApiPropertyOptional({ example: 'cat-uuid-123', description: 'ID da categoria no workspace' })
  @IsOptional()
  @IsString()
  categoriaId?: string;

  @ApiPropertyOptional({ example: 'Acabamento cromado', description: 'Observações adicionais' })
  @IsOptional()
  @IsString()
  observacoes?: string;
}
