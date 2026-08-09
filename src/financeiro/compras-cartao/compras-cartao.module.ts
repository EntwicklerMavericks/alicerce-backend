import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ComprasCartaoService } from './compras-cartao.service';
import { ComprasCartaoController } from './compras-cartao.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ComprasCartaoController],
  providers: [ComprasCartaoService],
  exports: [ComprasCartaoService],
})
export class ComprasCartaoModule {}
