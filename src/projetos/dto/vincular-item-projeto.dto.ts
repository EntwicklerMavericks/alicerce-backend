import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class VincularItemProjetoDto {
  @ApiPropertyOptional({ description: 'ID do item da wishlist a vincular (Invariante XOR: wishlist OU meta)' })
  @IsOptional()
  @IsString()
  itemWishlistId?: string;

  @ApiPropertyOptional({ description: 'ID da meta financeira a vincular (Invariante XOR: wishlist OU meta)' })
  @IsOptional()
  @IsString()
  metaId?: string;

  @ApiPropertyOptional({ description: 'Observações adicionais do vínculo no projeto' })
  @IsOptional()
  @IsString()
  observacoes?: string;
}
