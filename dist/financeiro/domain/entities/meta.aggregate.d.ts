import { Money } from '../value-objects/money.vo';
import { YearMonth } from '../value-objects/year-month.vo';
export type StatusMetaDomain = 'ATIVA' | 'CONCLUIDA' | 'PAUSADA' | 'CANCELADA';
export interface AporteMetaItem {
    id: string;
    metaId: string;
    valor: Money;
    data: Date;
    descricao?: string;
    dataCriacao?: Date;
}
export declare class MetaAggregate {
    readonly id: string;
    readonly workspaceId: string;
    private _status;
    private _aportes;
    private _nome;
    private _descricao?;
    private _valorAlvo;
    private _prazo?;
    private _icone?;
    private _cor?;
    private _prioridade;
    constructor(id: string, workspaceId: string, nome: string, valorAlvo: Money, prazo?: YearMonth, icone?: string, cor?: string, status?: StatusMetaDomain, descricao?: string, prioridade?: number, aportes?: AporteMetaItem[]);
    get nome(): string;
    get descricao(): string | undefined;
    get valorAlvo(): Money;
    get prazo(): YearMonth | undefined;
    get icone(): string | undefined;
    get cor(): string | undefined;
    get status(): StatusMetaDomain;
    get prioridade(): number;
    get aportes(): ReadonlyArray<AporteMetaItem>;
    get valorAcumulado(): Money;
    adicionarAporte(id: string, valor: Money, data?: Date, descricao?: string): AporteMetaItem;
    removerAporte(aporteId: string): void;
    atualizarDados(nome?: string, valorAlvo?: Money, prazo?: YearMonth, icone?: string, cor?: string, descricao?: string, prioridade?: number): void;
    cancelar(): void;
    private verificarEAtualizarStatus;
}
