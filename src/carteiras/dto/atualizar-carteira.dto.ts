import { PartialType } from '@nestjs/swagger';
import { CriarCarteiraDto } from './criar-carteira.dto';

export class AtualizarCarteiraDto extends PartialType(CriarCarteiraDto) {}
