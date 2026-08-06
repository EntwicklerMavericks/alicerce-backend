import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TransferirFundosDto {
  @ApiProperty({ example: 'carteira-origem-uuid', description: 'ID da carteira de onde o dinheiro sairá' })
  @IsString()
  @IsNotEmpty({ message: 'A carteira de origem é obrigatória' })
  carteiraOrigemId: string;

  @ApiProperty({ example: 'carteira-destino-uuid', description: 'ID da carteira para onde o dinheiro irá' })
  @IsString()
  @IsNotEmpty({ message: 'A carteira de destino é obrigatória' })
  carteiraDestinoId: string;

  @ApiProperty({ example: 500.0, description: 'Valor positivo a transferir' })
  @IsNumber()
  @Min(0.01, { message: 'O valor da transferência deve ser maior que zero' })
  valor: number;

  @ApiPropertyOptional({ example: 'Reserva para viagem', description: 'Descrição ou nota opcional' })
  @IsOptional()
  @IsString()
  descricao?: string;
}
