import { StatusEtapa } from '@prisma/client';
import { ItemProjetoEntity } from './item-projeto.entity';
export interface CriarEtapaProjetoParams {
    id?: string;
    workspaceId: string;
    projetoId: string;
    nome: string;
    descricao?: string | null;
    ordem?: number;
    dataInicio?: Date | null;
}
export interface ReconstituirEtapaProjetoParams {
    id: string;
    workspaceId: string;
    projetoId: string;
    nome: string;
    descricao?: string | null;
    ordem: number;
    status: StatusEtapa;
    dataInicio?: Date | null;
    dataConclusao?: Date | null;
    versao?: number;
    ativo?: boolean;
    dataCriacao?: Date;
    dataAtualizacao?: Date;
    itens?: ItemProjetoEntity[];
}
export declare class EtapaProjetoEntity {
    readonly id: string;
    readonly workspaceId: string;
    readonly projetoId: string;
    private _nome;
    private _descricao;
    private _ordem;
    private _status;
    private _dataInicio;
    private _dataConclusao;
    private _versao;
    private _ativo;
    private readonly _dataCriacao;
    private _dataAtualizacao;
    private _itens;
    private constructor();
    static criar(params: CriarEtapaProjetoParams): EtapaProjetoEntity;
    static reconstituir(params: ReconstituirEtapaProjetoParams): EtapaProjetoEntity;
    get nome(): string;
    get descricao(): string | null;
    get ordem(): number;
    get status(): StatusEtapa;
    get dataInicio(): Date | null;
    get dataConclusao(): Date | null;
    get versao(): number;
    get ativo(): boolean;
    get dataCriacao(): Date;
    get dataAtualizacao(): Date;
    get itens(): ReadonlyArray<ItemProjetoEntity>;
    definirOrdem(novaOrdem: number): void;
    iniciar(agora?: Date): void;
    concluir(agora?: Date): void;
    atualizarDados(params: {
        nome?: string;
        descricao?: string | null;
        ordem?: number;
    }): void;
    adicionarItem(item: ItemProjetoEntity): void;
}
