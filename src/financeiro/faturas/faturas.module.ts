import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { LedgerModule } from '../ledger/ledger.module';
import { FaturasService } from './faturas.service';
import { FaturasController } from './faturas.controller';
import { BillingClosingService } from './application/billing-closing.service';

@Module({
  imports: [PrismaModule, LedgerModule],
  controllers: [FaturasController],
  providers: [FaturasService, BillingClosingService],
  exports: [FaturasService, BillingClosingService],
})
export class FaturasModule {}
