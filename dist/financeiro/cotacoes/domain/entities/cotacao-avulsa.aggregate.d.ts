export interface CriarCotacaoAvulsaParams {
    id?: string;
    workspaceId: string;
    itemWishlistId: string;
    nomeLoja: string;
    preco: number;
    url?: string | null;
    observacoes?: string | null;
    agora?: Date;
}
export interface ReconstituirCotacaoAvulsaParams {
    id: string;
    workspaceId: string;
    itemWishlistId: string;
    nomeLoja: string;
    preco: number;
    url?: string | null;
    observacoes?: string | null;
    versao?: number;
    ativo?: boolean;
    dataCriacao?: Date;
    dataAtualizacao?: Date;
}
export declare class CotacaoAvulsaAggregate {
    readonly id: string;
    readonly workspaceId: string;
    readonly itemWishlistId: string;
    private _nomeLoja;
    private _preco;
    private _url;
    private _observacoes;
    private _versao;
    private _ativo;
    private readonly _dataCriacao;
    private _dataAtualizacao;
    private constructor();
    static criar(params: CriarCotacaoAvulsaParams): CotacaoAvulsaAggregate;
    static reconstituir(params: ReconstituirCotacaoAvulsaParams): CotacaoAvulsaAggregate;
    get nomeLoja(): string;
    get preco(): number;
    get url(): string | null;
    get observacoes(): string | null;
    get versao(): number;
    get ativo(): boolean;
    get dataCriacao(): Date;
    get dataAtualizacao(): Date;
    atualizarPreco(novoPreco: number): void;
    atualizarDados(params: {
        nomeLoja?: string;
        url?: string | null;
        observacoes?: string | null;
    }): void;
    desativar(): void;
}
