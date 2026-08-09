import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsEnum, IsInt, Max } from 'class-validator';
import { PrioridadeWishlist } from '@prisma/client';

export class CriarItemWishlistDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome do desejo é obrigatório.' })
  nome: string;

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

  @IsInt({ message: 'Os dias de esfriamento devem ser um número inteiro.' })
  @Min(1, { message: 'O tempo de esfriamento mínimo é de 1 dia.' })
  @Max(365, { message: 'O tempo de esfriamento máximo é de 365 dias.' })
  @IsOptional()
  diasEsfriamento?: number;

  @IsString()
  @IsOptional()
  produtoId?: string;
}
