import { Module, Injectable } from '@nestjs/common';
import { CotacoesController } from './cotacoes.controller';
import { CotacoesService } from './cotacoes.service';
import { ComparadorCotacoesReadModelService } from './read-models/comparador-cotacoes-read-model.service';
import { JobMonitoramentoPrecosService } from './domain/services/job-monitoramento-precos.service';
import {
  FONTE_COTACAO_PROVIDER,
  FonteCotacaoProvider,
} from './domain/providers/fonte-cotacao.provider';
import { PrismaModule } from '../../prisma/prisma.module';

@Injectable()
export class DefaultFonteCotacaoProvider implements FonteCotacaoProvider {
  async obterPreco(linkProduto: any): Promise<number> {
    return Number(linkProduto.preco);
  }
}

@Module({
  imports: [PrismaModule],
  controllers: [CotacoesController],
  providers: [
    CotacoesService,
    ComparadorCotacoesReadModelService,
    JobMonitoramentoPrecosService,
    DefaultFonteCotacaoProvider,
    {
      provide: FONTE_COTACAO_PROVIDER,
      useClass: DefaultFonteCotacaoProvider,
    },
  ],
  exports: [
    CotacoesService,
    ComparadorCotacoesReadModelService,
    JobMonitoramentoPrecosService,
    FONTE_COTACAO_PROVIDER,
  ],
})
export class CotacoesModule {}
