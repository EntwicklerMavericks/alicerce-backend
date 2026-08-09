import { PrecoObservado } from '../value-objects/preco-observado.vo';
export interface ImagemProdutoItem {
    id: string;
    produtoId: string;
    url: string;
    ordem: number;
    principal: boolean;
    ativo: boolean;
    dataCriacao?: Date;
}
export interface LinkProdutoItem {
    id: string;
    produtoId: string;
    lojaId: string;
    url: string;
    preco: PrecoObservado;
    versao: number;
    ativo: boolean;
    ultimaVerificacao?: Date | null;
}
export declare class ProdutoAggregate {
    readonly id: string;
    readonly workspaceId: string;
    readonly dataCriacao: Date;
    readonly dataAtualizacao: Date;
    private _nome;
    private _descricao;
    private _marca;
    private _categoriaId;
    private _observacoes;
    private _ativo;
    private _imagens;
    private _links;
    constructor(id: string, workspaceId: string, nome: string, descricao?: string | null, marca?: string | null, categoriaId?: string | null, observacoes?: string | null, ativo?: boolean, imagens?: ImagemProdutoItem[], links?: LinkProdutoItem[], dataCriacao?: Date, dataAtualizacao?: Date);
    get nome(): string;
    get descricao(): string | null;
    get marca(): string | null;
    get categoriaId(): string | null;
    get observacoes(): string | null;
    get ativo(): boolean;
    get imagens(): ReadonlyArray<ImagemProdutoItem>;
    get links(): ReadonlyArray<LinkProdutoItem>;
    get imagemPrincipal(): ImagemProdutoItem | undefined;
    definirImagemPrincipal(imagemId: string): void;
    adicionarImagem(imagem: ImagemProdutoItem): void;
    removerImagem(imagemId: string): void;
    atualizarDados(nome?: string, descricao?: string | null, marca?: string | null, categoriaId?: string | null, observacoes?: string | null): void;
    inativar(): void;
    private validarInvarianteImagemPrincipal;
}
