import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { RecorrenciasService } from './recorrencias.service';
import { RecurringGeneratorService } from './recurring-generator.service';
import { RecorrenciasController } from './recorrencias.controller';

@Module({
  imports: [PrismaModule],
  controllers: [RecorrenciasController],
  providers: [RecorrenciasService, RecurringGeneratorService],
  exports: [RecorrenciasService, RecurringGeneratorService],
})
export class RecorrenciasModule {}
