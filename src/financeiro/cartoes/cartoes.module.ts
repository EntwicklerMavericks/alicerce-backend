import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CartoesService } from './cartoes.service';
import { CartoesController } from './cartoes.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CartoesController],
  providers: [CartoesService],
  exports: [CartoesService],
})
export class CartoesModule {}
