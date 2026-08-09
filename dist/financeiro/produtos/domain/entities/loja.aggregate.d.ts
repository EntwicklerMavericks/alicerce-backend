export declare class LojaAggregate {
    readonly id: string;
    readonly workspaceId: string | null;
    readonly sistema: boolean;
    readonly dataCriacao: Date;
    private _nome;
    private _urlWebsite;
    private _urlLogo;
    private _ativo;
    constructor(id: string, workspaceId: string | null, nome: string, sistema?: boolean, urlWebsite?: string | null, urlLogo?: string | null, ativo?: boolean, dataCriacao?: Date);
    get nome(): string;
    get urlWebsite(): string | null;
    get urlLogo(): string | null;
    get ativo(): boolean;
    podeSerEditadaPor(workspaceId: string): boolean;
    atualizar(nome?: string, urlWebsite?: string | null, urlLogo?: string | null): void;
    inativar(): void;
    ativar(): void;
}
