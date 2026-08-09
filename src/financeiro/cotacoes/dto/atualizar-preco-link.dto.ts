import { IsNumber, Min } from 'class-validator';

export class AtualizarPrecoLinkDto {
  @IsNumber({}, { message: 'O preço deve ser um número.' })
  @Min(0.01, { message: 'O preço deve ser maior que zero.' })
  preco: number;
}
