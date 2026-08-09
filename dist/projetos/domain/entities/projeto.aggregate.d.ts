import { StatusProjeto } from '@prisma/client';
import { EtapaProjetoEntity } from './etapa-projeto.entity';
export interface CriarProjetoParams {
    id?: string;
    workspaceId: string;
    nome: string;
    descricao?: string | null;
    orcamentoEstimado?: number | null;
    prioridade?: number;
    dataInicioPrevista?: Date | null;
    dataFimPrevista?: Date | null;
}
export interface ReconstituirProjetoParams {
    id: string;
    workspaceId: string;
    nome: string;
    descricao?: string | null;
    orcamentoEstimado?: number | null;
    status: StatusProjeto;
    prioridade: number;
    dataInicioPrevista?: Date | null;
    dataFimPrevista?: Date | null;
    dataConclusao?: Date | null;
    versao?: number;
    ativo?: boolean;
    dataCriacao?: Date;
    dataAtualizacao?: Date;
    etapas?: EtapaProjetoEntity[];
}
export declare class ProjetoAggregate {
    readonly id: string;
    readonly workspaceId: string;
    private _nome;
    private _descricao;
    private _orcamentoEstimado;
    private _status;
    private _prioridade;
    private _dataInicioPrevista;
    private _dataFimPrevista;
    private _dataConclusao;
    private _versao;
    private _ativo;
    private readonly _dataCriacao;
    private _dataAtualizacao;
    private _etapas;
    private constructor();
    private validarDatasTemporais;
    static criar(params: CriarProjetoParams): ProjetoAggregate;
    static reconstituir(params: ReconstituirProjetoParams): ProjetoAggregate;
    get nome(): string;
    get descricao(): string | null;
    get orcamentoEstimado(): number | null;
    get status(): StatusProjeto;
    get prioridade(): number;
    get dataInicioPrevista(): Date | null;
    get dataFimPrevista(): Date | null;
    get dataConclusao(): Date | null;
    get versao(): number;
    get ativo(): boolean;
    get dataCriacao(): Date;
    get dataAtualizacao(): Date;
    get etapas(): ReadonlyArray<EtapaProjetoEntity>;
    incrementarVersao(): void;
    alterarStatus(novoStatus: StatusProjeto, agora?: Date): void;
    iniciar(agora?: Date): void;
    pausar(agora?: Date): void;
    concluir(agora?: Date): void;
    cancelar(agora?: Date): void;
    atualizarDados(params: {
        nome?: string;
        descricao?: string | null;
        orcamentoEstimado?: number | null;
        prioridade?: number;
        dataInicioPrevista?: Date | null;
        dataFimPrevista?: Date | null;
        status?: StatusProjeto;
    }): void;
    adicionarEtapa(etapa: EtapaProjetoEntity): void;
    reordenarEtapas(etapasOrdenadas: {
        id: string;
        ordem: number;
    }[]): void;
    desativar(): void;
}
