import { IsString, IsOptional, IsNumber, Min, IsEnum } from 'class-validator';
import { PrioridadeWishlist } from '@prisma/client';

export class AtualizarItemWishlistDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsNumber({}, { message: 'O preço alvo deve ser um número.' })
  @Min(0, { message: 'O preço alvo não pode ser negativo.' })
  @IsOptional()
  precoAlvo?: number;

  @IsEnum(PrioridadeWishlist, { message: 'Prioridade inválida.' })
  @IsOptional()
  prioridade?: PrioridadeWishlist;
}
