import { Module } from '@nestjs/common';
import { CotacoesController } from './cotacoes.controller';
import { CotacoesService } from './cotacoes.service';
import { ComparadorCotacoesReadModelService } from './read-models/comparador-cotacoes-read-model.service';
import { JobMonitoramentoPrecosService } from './domain/services/job-monitoramento-precos.service';
import { SsrfGuardService } from './domain/services/ssrf-guard.service';
import { MercadoLivreCotacaoProvider } from './providers/mercado-livre-cotacao.provider';
import { OpenWebScraperCotacaoProvider } from './providers/open-web-scraper-cotacao.provider';
import { GoogleShoppingCotacaoProvider } from './providers/google-shopping-cotacao.provider';
import { BuscapeCotacaoProvider } from './providers/buscape-cotacao.provider';
import { CotacaoAggregatorProvider } from './providers/cotacao-aggregator.provider';
import { FONTE_COTACAO_PROVIDER } from './domain/providers/fonte-cotacao.provider';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CotacoesController],
  providers: [
    CotacoesService,
    ComparadorCotacoesReadModelService,
    JobMonitoramentoPrecosService,
    SsrfGuardService,
    MercadoLivreCotacaoProvider,
    OpenWebScraperCotacaoProvider,
    GoogleShoppingCotacaoProvider,
    BuscapeCotacaoProvider,
    CotacaoAggregatorProvider,
    {
      provide: FONTE_COTACAO_PROVIDER,
      useClass: MercadoLivreCotacaoProvider,
    },
  ],
  exports: [
    CotacoesService,
    ComparadorCotacoesReadModelService,
    JobMonitoramentoPrecosService,
    SsrfGuardService,
    MercadoLivreCotacaoProvider,
    OpenWebScraperCotacaoProvider,
    GoogleShoppingCotacaoProvider,
    BuscapeCotacaoProvider,
    CotacaoAggregatorProvider,
    FONTE_COTACAO_PROVIDER,
  ],
})
export class CotacoesModule {}
