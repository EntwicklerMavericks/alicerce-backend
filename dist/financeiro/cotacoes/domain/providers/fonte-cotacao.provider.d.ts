export declare const FONTE_COTACAO_PROVIDER = "FONTE_COTACAO_PROVIDER";
export interface FonteCotacaoProvider {
    obterPreco(linkProduto: any): Promise<number>;
}
