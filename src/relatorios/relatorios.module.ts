import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RelatoriosController } from './relatorios.controller';
import { RelatoriosReadModelService } from './services/relatorios-read-model.service';
import { ExportadorRelatorioService } from './services/exportador-relatorio.service';

@Module({
  imports: [PrismaModule],
  controllers: [RelatoriosController],
  providers: [RelatoriosReadModelService, ExportadorRelatorioService],
  exports: [RelatoriosReadModelService, ExportadorRelatorioService],
})
export class RelatoriosModule {}
