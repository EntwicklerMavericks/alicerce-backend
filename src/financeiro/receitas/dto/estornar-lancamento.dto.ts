import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class EstornarLancamentoDto {
  @IsString()
  @IsNotEmpty()
  motivo: string;

  @IsString()
  @IsOptional()
  observacao?: string;
}
