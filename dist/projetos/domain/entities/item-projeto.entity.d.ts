export interface CriarItemProjetoParams {
    id?: string;
    workspaceId: string;
    etapaId: string;
    itemWishlistId?: string | null;
    metaId?: string | null;
    observacoes?: string | null;
}
export interface ReconstituirItemProjetoParams {
    id: string;
    workspaceId: string;
    etapaId: string;
    itemWishlistId?: string | null;
    metaId?: string | null;
    wishlistVinculoAtivoKey?: string | null;
    metaVinculoAtivoKey?: string | null;
    observacoes?: string | null;
    versao?: number;
    ativo?: boolean;
    dataCriacao?: Date;
    dataAtualizacao?: Date;
}
export declare class ItemProjetoEntity {
    readonly id: string;
    readonly workspaceId: string;
    private _etapaId;
    private _itemWishlistId;
    private _metaId;
    private _wishlistVinculoAtivoKey;
    private _metaVinculoAtivoKey;
    private _observacoes;
    private _versao;
    private _ativo;
    private readonly _dataCriacao;
    private _dataAtualizacao;
    private constructor();
    private validarEAtualizarInvarianteXOR;
    static criar(params: CriarItemProjetoParams): ItemProjetoEntity;
    static reconstituir(params: ReconstituirItemProjetoParams): ItemProjetoEntity;
    get etapaId(): string;
    get itemWishlistId(): string | null;
    get metaId(): string | null;
    get wishlistVinculoAtivoKey(): string | null;
    get metaVinculoAtivoKey(): string | null;
    get observacoes(): string | null;
    get versao(): number;
    get ativo(): boolean;
    get dataCriacao(): Date;
    get dataAtualizacao(): Date;
    vincularWishlist(itemWishlistId: string): void;
    vincularMeta(metaId: string): void;
    atualizarObservacoes(observacoes: string | null): void;
    desativar(): void;
}
