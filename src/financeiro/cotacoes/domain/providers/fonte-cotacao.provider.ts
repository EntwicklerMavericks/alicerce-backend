import { CotacaoQuery, OfertaComparativo } from '../interfaces/cotacao-query.interface';

export const FONTE_COTACAO_PROVIDER = 'FONTE_COTACAO_PROVIDER';

export interface FonteCotacaoProvider {
  buscarCotacoes(contexto: CotacaoQuery): Promise<OfertaComparativo[]>;
}
