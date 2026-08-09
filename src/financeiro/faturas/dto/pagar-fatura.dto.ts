import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PagarFaturaDto {
  @ApiProperty({ description: 'ID da carteira pagadora no Alicerce', example: 'cart-123' })
  @IsNotEmpty()
  @IsString()
  carteiraId: string;

  @ApiProperty({ description: 'Data do pagamento (opcional, padrão hoje)', example: '2026-08-05T00:00:00.000Z', required: false })
  @IsOptional()
  @IsString()
  dataPagamento?: string;
}
