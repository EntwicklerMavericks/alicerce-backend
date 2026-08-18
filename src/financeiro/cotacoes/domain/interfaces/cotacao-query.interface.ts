import { Decimal } from '@prisma/client/runtime/library';

export type FonteCotacaoEnum = 'MERCADO_LIVRE' | 'WEB' | 'MANUAL';
export type FontePrecoExtraidoEnum = 'JSON_LD' | 'OPEN_GRAPH' | 'TWITTER' | 'HTML';
export type StatusColetaCotacao = 'CONCLUIDA' | 'PARCIAL' | 'SEM_RESULTADOS';

export interface CotacaoQuery {
  termo?: string;
  url?: string;
  itemWishlistId?: string;
  limit?: number;
}

export interface PrecoExtraido {
  valor: Decimal;
  moeda: string;
  fonte: FontePrecoExtraidoEnum;
}

export interface OfertaComparativo {
  titulo: string;
  preco: Decimal;
  moeda: 'BRL';
  url: string;
  fonte: FonteCotacaoEnum;
  vendedor: string | null;
  imagemUrl: string | null;
  coletadoEm: Date;
}

export interface ResultadoColeta {
  ofertas: OfertaComparativo[];
  statusColeta: StatusColetaCotacao;
  erros?: string[];
}
