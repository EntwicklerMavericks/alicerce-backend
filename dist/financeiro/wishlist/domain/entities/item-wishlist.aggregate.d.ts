import { StatusWishlist, PrioridadeWishlist } from '@prisma/client';
import { TempoEsfriamentoVO } from '../value-objects/tempo-esfriamento.vo';
export interface CriarItemWishlistParams {
    id?: string;
    workspaceId: string;
    nome: string;
    descricao?: string | null;
    precoAlvo?: number | null;
    prioridade?: PrioridadeWishlist;
    diasEsfriamento?: number;
    produtoId?: string | null;
    agora?: Date;
}
export interface ReconstituirItemWishlistParams {
    id: string;
    workspaceId: string;
    nome: string;
    descricao?: string | null;
    precoAlvo?: number | null;
    valorCompra?: number | null;
    valorEconomizado?: number | null;
    prioridade: PrioridadeWishlist;
    diasEsfriamento: number;
    inicioEsfriamento: Date;
    fimEsfriamento: Date;
    status: StatusWishlist;
    quebrouEsfriamento: boolean;
    dataQuebraEsfriamento?: Date | null;
    dataConclusao?: Date | null;
    produtoId?: string | null;
    versao?: number;
    ativo?: boolean;
    dataCriacao?: Date;
    dataAtualizacao?: Date;
}
export interface IniciarCompraParams {
    agora?: Date;
    quebrarEsfriamento?: boolean;
    valorCompraInformado?: number | null;
    menorCotacaoAtiva?: number | null;
}
export interface DesistirParams {
    agora?: Date;
    menorCotacaoAtiva?: number | null;
}
export declare class ItemWishlistAggregate {
    readonly id: string;
    readonly workspaceId: string;
    private _nome;
    private _descricao;
    private _precoAlvo;
    private _valorCompra;
    private _valorEconomizado;
    private _prioridade;
    private _tempoEsfriamento;
    private readonly _inicioEsfriamento;
    private readonly _fimEsfriamento;
    private _status;
    private _quebrouEsfriamento;
    private _dataQuebraEsfriamento;
    private _dataConclusao;
    private _produtoId;
    private _versao;
    private _ativo;
    private readonly _dataCriacao;
    private _dataAtualizacao;
    private constructor();
    static criar(params: CriarItemWishlistParams): ItemWishlistAggregate;
    static reconstituir(params: ReconstituirItemWishlistParams): ItemWishlistAggregate;
    get nome(): string;
    get descricao(): string | null;
    get precoAlvo(): number | null;
    get valorCompra(): number | null;
    get valorEconomizado(): number | null;
    get prioridade(): PrioridadeWishlist;
    get tempoEsfriamento(): TempoEsfriamentoVO;
    get diasEsfriamento(): number;
    get inicioEsfriamento(): Date;
    get fimEsfriamento(): Date;
    get status(): StatusWishlist;
    get quebrouEsfriamento(): boolean;
    get dataQuebraEsfriamento(): Date | null;
    get dataConclusao(): Date | null;
    get produtoId(): string | null;
    get versao(): number;
    get ativo(): boolean;
    get dataCriacao(): Date;
    get dataAtualizacao(): Date;
    private validarNaoTerminal;
    iniciarCompra({ agora, quebrarEsfriamento, valorCompraInformado, menorCotacaoAtiva, }?: IniciarCompraParams): void;
    desistir({ agora, menorCotacaoAtiva }?: DesistirParams): void;
    planejar(): void;
    vincularProduto(produtoId: string): void;
    desvincularProduto(): void;
    atualizarDados(params: {
        nome?: string;
        descricao?: string | null;
        precoAlvo?: number | null;
        prioridade?: PrioridadeWishlist;
    }): void;
}
