import { StatusEtapa } from '@prisma/client';
import { DomainException } from '../../../financeiro/domain/exceptions/domain.exception';
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

export class EtapaProjetoEntity {
  private _nome: string;
  private _descricao: string | null;
  private _ordem: number;
  private _status: StatusEtapa;
  private _dataInicio: Date | null;
  private _dataConclusao: Date | null;
  private _versao: number;
  private _ativo: boolean;
  private readonly _dataCriacao: Date;
  private _dataAtualizacao: Date;
  private _itens: ItemProjetoEntity[];

  private constructor(
    readonly id: string,
    readonly workspaceId: string,
    readonly projetoId: string,
    nome: string,
    descricao: string | null,
    ordem: number,
    status: StatusEtapa,
    dataInicio: Date | null,
    dataConclusao: Date | null,
    versao = 0,
    ativo = true,
    dataCriacao = new Date(),
    dataAtualizacao = new Date(),
    itens: ItemProjetoEntity[] = [],
  ) {
    if (!id || id.trim() === '') {
      throw new DomainException('ID da etapa do projeto é obrigatório.');
    }
    if (!workspaceId || workspaceId.trim() === '') {
      throw new DomainException('Workspace ID da etapa do projeto é obrigatório.');
    }
    if (!projetoId || projetoId.trim() === '') {
      throw new DomainException('Projeto ID da etapa é obrigatório.');
    }
    if (!nome || nome.trim() === '') {
      throw new DomainException('Nome da etapa do projeto é obrigatório.');
    }
    if (ordem < 1) {
      throw new DomainException('A ordem da etapa deve ser um número inteiro maior ou igual a 1.');
    }

    this._nome = nome;
    this._descricao = descricao ?? null;
    this._ordem = ordem;
    this._status = status;
    this._dataInicio = dataInicio ?? null;
    this._dataConclusao = dataConclusao ?? null;
    this._versao = versao;
    this._ativo = ativo;
    this._dataCriacao = dataCriacao;
    this._dataAtualizacao = dataAtualizacao;

    // Garantia de integridade hierárquica em nível de entidade
    this._itens = [...itens];
    for (const item of this._itens) {
      if (item.etapaId !== this.id || item.workspaceId !== this.workspaceId) {
        throw new DomainException(
          'Integridade Hierárquica violada: Item não pertence a esta Etapa/Workspace.',
        );
      }
    }
  }

  static criar(params: CriarEtapaProjetoParams): EtapaProjetoEntity {
    const id = params.id || crypto.randomUUID();
    const agora = new Date();

    return new EtapaProjetoEntity(
      id,
      params.workspaceId,
      params.projetoId,
      params.nome,
      params.descricao ?? null,
      params.ordem ?? 1,
      'PENDENTE',
      params.dataInicio ?? null,
      null,
      0,
      true,
      agora,
      agora,
      [],
    );
  }

  static reconstituir(params: ReconstituirEtapaProjetoParams): EtapaProjetoEntity {
    return new EtapaProjetoEntity(
      params.id,
      params.workspaceId,
      params.projetoId,
      params.nome,
      params.descricao ?? null,
      params.ordem,
      params.status,
      params.dataInicio ?? null,
      params.dataConclusao ?? null,
      params.versao ?? 0,
      params.ativo ?? true,
      params.dataCriacao ?? new Date(),
      params.dataAtualizacao ?? new Date(),
      params.itens ?? [],
    );
  }

  get nome(): string {
    return this._nome;
  }

  get descricao(): string | null {
    return this._descricao;
  }

  get ordem(): number {
    return this._ordem;
  }

  get status(): StatusEtapa {
    return this._status;
  }

  get dataInicio(): Date | null {
    return this._dataInicio;
  }

  get dataConclusao(): Date | null {
    return this._dataConclusao;
  }

  get versao(): number {
    return this._versao;
  }

  get ativo(): boolean {
    return this._ativo;
  }

  get dataCriacao(): Date {
    return this._dataCriacao;
  }

  get dataAtualizacao(): Date {
    return this._dataAtualizacao;
  }

  get itens(): ReadonlyArray<ItemProjetoEntity> {
    return this._itens;
  }

  definirOrdem(novaOrdem: number): void {
    if (novaOrdem < 1) {
      throw new DomainException('A ordem da etapa deve ser um número inteiro maior ou igual a 1.');
    }
    this._ordem = novaOrdem;
    this._dataAtualizacao = new Date();
  }

  iniciar(agora = new Date()): void {
    this._status = 'EM_ANDAMENTO';
    if (!this._dataInicio) {
      this._dataInicio = agora;
    }
    this._dataAtualizacao = agora;
  }

  concluir(agora = new Date()): void {
    this._status = 'CONCLUIDA';
    this._dataConclusao = agora;
    this._dataAtualizacao = agora;
  }

  atualizarDados(params: { nome?: string; descricao?: string | null; ordem?: number }): void {
    if (params.nome !== undefined) {
      if (!params.nome || params.nome.trim() === '') {
        throw new DomainException('Nome da etapa do projeto é obrigatório.');
      }
      this._nome = params.nome;
    }
    if (params.descricao !== undefined) {
      this._descricao = params.descricao;
    }
    if (params.ordem !== undefined) {
      this.definirOrdem(params.ordem);
    }
    this._dataAtualizacao = new Date();
  }

  adicionarItem(item: ItemProjetoEntity): void {
    if (item.etapaId !== this.id || item.workspaceId !== this.workspaceId) {
      throw new DomainException(
        'Integridade Hierárquica violada: Item não pertence a esta Etapa/Workspace.',
      );
    }
    this._itens.push(item);
    this._dataAtualizacao = new Date();
  }
}
