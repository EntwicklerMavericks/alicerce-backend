import { Module } from '@nestjs/common';
import { LojasController } from './lojas.controller';
import { LojasService } from './lojas.service';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LojasController],
  providers: [LojasService],
  exports: [LojasService],
})
export class LojasModule {}
