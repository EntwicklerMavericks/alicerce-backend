import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ConfigSalarioDto } from './criar-pessoa.dto';

export class AtualizarSalarioDto {
  @ApiProperty({ type: ConfigSalarioDto })
  @ValidateNested()
  @Type(() => ConfigSalarioDto)
  configSalario: ConfigSalarioDto;
}
