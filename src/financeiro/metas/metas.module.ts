import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { MetasService } from './metas.service';
import { MetasController } from './metas.controller';
import { AportesController } from './aportes.controller';
import { MetasReadModelService } from '../read-models/metas-read-model.service';

@Module({
  imports: [PrismaModule],
  controllers: [MetasController, AportesController],
  providers: [MetasService, MetasReadModelService],
  exports: [MetasService, MetasReadModelService],
})
export class MetasModule {}
