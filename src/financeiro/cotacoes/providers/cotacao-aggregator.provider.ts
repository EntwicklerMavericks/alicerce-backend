import { Injectable, Logger } from '@nestjs/common';
import { MercadoLivreCotacaoProvider } from './mercado-livre-cotacao.provider';
import { OpenWebScraperCotacaoProvider } from './open-web-scraper-cotacao.provider';
import { GoogleShoppingCotacaoProvider } from './google-shopping-cotacao.provider';
import { BuscapeCotacaoProvider } from './buscape-cotacao.provider';
import {
  CotacaoQuery,
  OfertaComparativo,
  ResultadoColeta,
  StatusColetaCotacao,
} from '../domain/interfaces/cotacao-query.interface';

@Injectable()
export class CotacaoAggregatorProvider {
  private readonly logger = new Logger(CotacaoAggregatorProvider.name);

  constructor(
    private readonly mercadoLivreProvider: MercadoLivreCotacaoProvider,
    private readonly openWebScraperProvider: OpenWebScraperCotacaoProvider,
    private readonly googleShoppingProvider: GoogleShoppingCotacaoProvider,
    private readonly buscapeProvider: BuscapeCotacaoProvider,
  ) {}

  async buscarCotacoesComStatus(contexto: CotacaoQuery): Promise<ResultadoColeta> {
    const promises: Array<Promise<{ fonte: string; ofertas: OfertaComparativo[] }>> = [];

    // 1. Buscapé Multi-Store Search (se houver termo)
    if (contexto.termo && contexto.termo.trim() !== '') {
      promises.push(
        this.buscapeProvider
          .buscarCotacoes(contexto)
          .then((ofertas) => ({ fonte: 'BUSCAPE', ofertas })),
      );

      // 2. Google Shopping Multi-Store Search
      promises.push(
        this.googleShoppingProvider
          .buscarCotacoes(contexto)
          .then((ofertas) => ({ fonte: 'GOOGLE_SHOPPING', ofertas })),
      );

      // 3. Mercado Livre Search
      promises.push(
        this.mercadoLivreProvider
          .buscarCotacoes(contexto)
          .then((ofertas) => ({ fonte: 'MERCADO_LIVRE', ofertas })),
      );
    }

    // 4. Open Web Scraper para a URL cadastrada no item
    if (contexto.url && contexto.url.trim() !== '') {
      promises.push(
        this.openWebScraperProvider
          .buscarCotacoes(contexto)
          .then((ofertas) => ({ fonte: 'WEB', ofertas })),
      );
    }

    if (promises.length === 0) {
      return {
        ofertas: [],
        statusColeta: 'SEM_RESULTADOS',
      };
    }

    // Promise.allSettled para tolerância total a falhas parciais
    const results = await Promise.allSettled(promises);

    const ofertasAcumuladas: OfertaComparativo[] = [];
    const erros: string[] = [];
    let fontesFalha = 0;

    for (const res of results) {
      if (res.status === 'fulfilled') {
        ofertasAcumuladas.push(...res.value.ofertas);
      } else {
        fontesFalha++;
        const msg = res.reason?.message || 'Falha de comunicação com a fonte';
        erros.push(msg);
        this.logger.warn(`Falha em provedor de cotação: ${msg}`);
      }
    }

    let statusColeta: StatusColetaCotacao = 'CONCLUIDA';
    if (ofertasAcumuladas.length === 0) {
      statusColeta = 'SEM_RESULTADOS';
    } else if (fontesFalha > 0) {
      statusColeta = 'PARCIAL';
    }

    // Ordenar ofertas por menor preço
    ofertasAcumuladas.sort((a, b) => a.preco.toNumber() - b.preco.toNumber());

    return {
      ofertas: ofertasAcumuladas,
      statusColeta,
      ...(erros.length > 0 && { erros }),
    };
  }
}
