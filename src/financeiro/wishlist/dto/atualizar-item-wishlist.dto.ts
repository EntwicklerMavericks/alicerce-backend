import { IsString, IsOptional, IsNumber, Min, IsEnum, IsInt, Max } from 'class-validator';
import { PrioridadeWishlist, StatusWishlist } from '@prisma/client';

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

  @IsNumber({}, { message: 'O preço estimado deve ser um número.' })
  @Min(0, { message: 'O preço estimado não pode ser negativo.' })
  @IsOptional()
  precoEstimado?: number;

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
  imagemUrl?: string;

  @IsString()
  @IsOptional()
  linkUrl?: string;

  @IsString()
  @IsOptional()
  metaId?: string;

  @IsString()
  @IsOptional()
  categoriaId?: string;

  @IsString()
  @IsOptional()
  produtoId?: string;

  @IsEnum(StatusWishlist, { message: 'Status inválido.' })
  @IsOptional()
  status?: StatusWishlist;
}
