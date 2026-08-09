import { Module } from '@nestjs/common';
import { ProdutosController } from './produtos.controller';
import { ProdutosService } from './produtos.service';
import { ComparadorPrecosReadModelService } from '../read-models/comparador-precos-read-model.service';
import { PrismaModule } from '../../../prisma/prisma.module';
import { LojasModule } from '../lojas/lojas.module';

@Module({
  imports: [PrismaModule, LojasModule],
  controllers: [ProdutosController],
  providers: [ProdutosService, ComparadorPrecosReadModelService],
  exports: [ProdutosService, ComparadorPrecosReadModelService],
})
export class ProdutosModule {}
