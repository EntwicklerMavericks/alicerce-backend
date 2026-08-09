import { FonteCotacaoProvider } from './domain/providers/fonte-cotacao.provider';
export declare class DefaultFonteCotacaoProvider implements FonteCotacaoProvider {
    obterPreco(linkProduto: any): Promise<number>;
}
export declare class CotacoesModule {
}
