import { Module } from '@nestjs/common';
import { DespesasService } from './despesas.service';
import { DespesasController } from './despesas.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { LedgerModule } from '../ledger/ledger.module';
import { CategoriasModule } from '../categorias/categorias.module';

@Module({
  imports: [PrismaModule, LedgerModule, CategoriasModule],
  controllers: [DespesasController],
  providers: [DespesasService],
  exports: [DespesasService],
})
export class DespesasModule {}
