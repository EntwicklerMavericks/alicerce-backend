import { IsString, IsNotEmpty, IsNumber, Min, IsOptional } from 'class-validator';

export class RegistrarCotacaoAvulsaDto {
  @IsString()
  @IsNotEmpty({ message: 'O ID do item da wishlist é obrigatório.' })
  itemWishlistId: string;

  @IsString()
  @IsNotEmpty({ message: 'O nome da loja é obrigatório.' })
  nomeLoja: string;

  @IsNumber({}, { message: 'O preço deve ser um número.' })
  @Min(0.01, { message: 'O preço deve ser maior que zero.' })
  preco: number;

  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  observacoes?: string;
}
