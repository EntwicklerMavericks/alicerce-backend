import { IsString, IsNotEmpty } from 'class-validator';

export class VincularProdutoWishlistDto {
  @IsString()
  @IsNotEmpty({ message: 'O ID do produto é obrigatório.' })
  produtoId: string;
}
