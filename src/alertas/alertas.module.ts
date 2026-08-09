import { Module } from '@nestjs/common';
import { AlertasController } from './alertas.controller';
import { AlertasService } from './alertas.service';
import { AlertasEngineService } from './domain/alertas-engine.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AlertasController],
  providers: [AlertasService, AlertasEngineService],
  exports: [AlertasService, AlertasEngineService],
})
export class AlertasModule {}
