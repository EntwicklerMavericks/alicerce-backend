import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { OrcamentosService } from './orcamentos.service';
import { OrcamentosController } from './orcamentos.controller';
import { OrcamentosReadModelService } from '../read-models/orcamentos-read-model.service';

@Module({
  imports: [PrismaModule],
  controllers: [OrcamentosController],
  providers: [OrcamentosService, OrcamentosReadModelService],
  exports: [OrcamentosService, OrcamentosReadModelService],
})
export class OrcamentosModule {}
