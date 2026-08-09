import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LedgerModule } from '../financeiro/ledger/ledger.module';
import { PlanningModule } from '../financeiro/planning/planning.module';
import { DashboardController } from './dashboard.controller';
import { DashboardReadModelService } from './read-models/dashboard-read-model.service';

@Module({
  imports: [PrismaModule, LedgerModule, PlanningModule],
  controllers: [DashboardController],
  providers: [DashboardReadModelService],
  exports: [DashboardReadModelService],
})
export class DashboardModule {}
