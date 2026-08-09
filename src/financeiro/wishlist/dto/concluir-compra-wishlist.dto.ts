import { IsBoolean, IsOptional, IsNumber, Min, IsString } from 'class-validator';

export class ConcluirCompraWishlistDto {
  @IsBoolean()
  @IsOptional()
  quebrarEsfriamento?: boolean;

  @IsNumber({}, { message: 'O valor da compra informado deve ser um número.' })
  @Min(0, { message: 'O valor da compra não pode ser negativo.' })
  @IsOptional()
  valorCompraInformado?: number;

  @IsString()
  @IsOptional()
  categoriaId?: string;

  @IsString()
  @IsOptional()
  carteiraId?: string;

  @IsString()
  @IsOptional()
  cartaoId?: string;

  @IsString()
  @IsOptional()
  observacoes?: string;
}
