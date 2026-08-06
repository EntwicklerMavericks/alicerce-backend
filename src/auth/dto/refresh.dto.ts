import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh Token recebido no login' })
  @IsString()
  @IsNotEmpty({ message: 'O refresh token é obrigatório' })
  refreshToken: string;
}
