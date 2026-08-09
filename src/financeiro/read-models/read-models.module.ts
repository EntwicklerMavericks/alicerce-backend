import { Module } from '@nestjs/common';
import { FluxoCaixaReadModelService } from './fluxo-caixa-read-model.service';
import { DashboardFinanceiroReadModelService } from './dashboard-financeiro-read-model.service';
import { OrcamentosReadModelService } from './orcamentos-read-model.service';
import { MetasReadModelService } from './metas-read-model.service';
import { FluxoCaixaController } from './fluxo-caixa.controller';
import { DashboardFinanceiroController } from './dashboard-financeiro.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FluxoCaixaController, DashboardFinanceiroController],
  providers: [
    FluxoCaixaReadModelService,
    DashboardFinanceiroReadModelService,
    OrcamentosReadModelService,
    MetasReadModelService,
  ],
  exports: [
    FluxoCaixaReadModelService,
    DashboardFinanceiroReadModelService,
    OrcamentosReadModelService,
    MetasReadModelService,
  ],
})
export class ReadModelsModule {}
