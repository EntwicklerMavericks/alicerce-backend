import { StatusProjeto } from '@prisma/client';
import { DomainException } from '../../../financeiro/domain/exceptions/domain.exception';
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

export class ProjetoAggregate {
  private _nome: string;
  private _descricao: string | null;
  private _orcamentoEstimado: number | null;
  private _status: StatusProjeto;
  private _prioridade: number;
  private _dataInicioPrevista: Date | null;
  private _dataFimPrevista: Date | null;
  private _dataConclusao: Date | null;
  private _versao: number;
  private _ativo: boolean;
  private readonly _dataCriacao: Date;
  private _dataAtualizacao: Date;
  private _etapas: EtapaProjetoEntity[];

  private constructor(
    readonly id: string,
    readonly workspaceId: string,
    nome: string,
    descricao: string | null,
    orcamentoEstimado: number | null,
    status: StatusProjeto,
    prioridade: number,
    dataInicioPrevista: Date | null,
    dataFimPrevista: Date | null,
    dataConclusao: Date | null,
    versao = 0,
    ativo = true,
    dataCriacao = new Date(),
    dataAtualizacao = new Date(),
    etapas: EtapaProjetoEntity[] = [],
  ) {
    if (!id || id.trim() === '') {
      throw new DomainException('ID do projeto é obrigatório.');
    }
    if (!workspaceId || workspaceId.trim() === '') {
      throw new DomainException('Workspace ID do projeto é obrigatório.');
    }
    if (!nome || nome.trim() === '') {
      throw new DomainException('Nome do projeto é obrigatório.');
    }

    this._nome = nome;
    this._descricao = descricao ?? null;
    this._orcamentoEstimado =
      orcamentoEstimado !== undefined && orcamentoEstimado !== null
        ? Number(orcamentoEstimado)
        : null;
    this._status = status;
    this._prioridade = prioridade;
    this._dataInicioPrevista = dataInicioPrevista ?? null;
    this._dataFimPrevista = dataFimPrevista ?? null;
    this._dataConclusao = dataConclusao ?? null;
    this._versao = versao;
    this._ativo = ativo;
    this._dataCriacao = dataCriacao;
    this._dataAtualizacao = dataAtualizacao;

    // Validar invariante de datas temporais
    this.validarDatasTemporais(this._dataInicioPrevista, this._dataFimPrevista);

    // Validar integridade hierárquica das etapas
    this._etapas = [...etapas];
    for (const etapa of this._etapas) {
      if (etapa.projetoId !== this.id || etapa.workspaceId !== this.workspaceId) {
        throw new DomainException(
          'Integridade Hierárquica violada: Etapa não pertence a este Projeto/Workspace.',
        );
      }
    }
  }

  private validarDatasTemporais(inicio: Date | null, fim: Date | null): void {
    if (inicio && fim && fim.getTime() < inicio.getTime()) {
      throw new DomainException(
        'A data de fim prevista não pode ser anterior à data de início prevista.',
      );
    }
  }

  static criar(params: CriarProjetoParams): ProjetoAggregate {
    const id = params.id || crypto.randomUUID();
    const agora = new Date();

    return new ProjetoAggregate(
      id,
      params.workspaceId,
      params.nome,
      params.descricao ?? null,
      params.orcamentoEstimado ?? null,
      'PLANEJAMENTO',
      params.prioridade ?? 1,
      params.dataInicioPrevista ?? null,
      params.dataFimPrevista ?? null,
      null,
      0,
      true,
      agora,
      agora,
      [],
    );
  }

  static reconstituir(params: ReconstituirProjetoParams): ProjetoAggregate {
    return new ProjetoAggregate(
      params.id,
      params.workspaceId,
      params.nome,
      params.descricao ?? null,
      params.orcamentoEstimado ?? null,
      params.status,
      params.prioridade,
      params.dataInicioPrevista ?? null,
      params.dataFimPrevista ?? null,
      params.dataConclusao ?? null,
      params.versao ?? 0,
      params.ativo ?? true,
      params.dataCriacao ?? new Date(),
      params.dataAtualizacao ?? new Date(),
      params.etapas ?? [],
    );
  }

  get nome(): string {
    return this._nome;
  }

  get descricao(): string | null {
    return this._descricao;
  }

  get orcamentoEstimado(): number | null {
    return this._orcamentoEstimado;
  }

  get status(): StatusProjeto {
    return this._status;
  }

  get prioridade(): number {
    return this._prioridade;
  }

  get dataInicioPrevista(): Date | null {
    return this._dataInicioPrevista;
  }

  get dataFimPrevista(): Date | null {
    return this._dataFimPrevista;
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

  get etapas(): ReadonlyArray<EtapaProjetoEntity> {
    return this._etapas;
  }

  incrementarVersao(): void {
    this._versao += 1;
    this._dataAtualizacao = new Date();
  }

  // State machine transition methods
  alterarStatus(novoStatus: StatusProjeto, agora = new Date()): void {
    if (this._status === novoStatus) {
      return;
    }

    if (this._status === 'CONCLUIDO' || this._status === 'CANCELADO') {
      throw new DomainException(
        `Não é possível alterar o status de um projeto finalizado (${this._status}).`,
      );
    }

    switch (this._status) {
      case 'PLANEJAMENTO':
        if (novoStatus !== 'EM_ANDAMENTO' && novoStatus !== 'CANCELADO') {
          throw new DomainException(
            `Transição de status inválida: de ${this._status} para ${novoStatus}.`,
          );
        }
        break;
      case 'EM_ANDAMENTO':
        if (
          novoStatus !== 'CONCLUIDO' &&
          novoStatus !== 'PAUSADO' &&
          novoStatus !== 'CANCELADO'
        ) {
          throw new DomainException(
            `Transição de status inválida: de ${this._status} para ${novoStatus}.`,
          );
        }
        break;
      case 'PAUSADO':
        if (novoStatus !== 'EM_ANDAMENTO' && novoStatus !== 'CANCELADO') {
          throw new DomainException(
            `Transição de status inválida: de ${this._status} para ${novoStatus}.`,
          );
        }
        break;
    }

    this._status = novoStatus;
    if (novoStatus === 'CONCLUIDO') {
      this._dataConclusao = agora;
    }
    this._dataAtualizacao = agora;
  }

  iniciar(agora = new Date()): void {
    this.alterarStatus('EM_ANDAMENTO', agora);
  }

  pausar(agora = new Date()): void {
    this.alterarStatus('PAUSADO', agora);
  }

  concluir(agora = new Date()): void {
    this.alterarStatus('CONCLUIDO', agora);
  }

  cancelar(agora = new Date()): void {
    this.alterarStatus('CANCELADO', agora);
  }

  atualizarDados(params: {
    nome?: string;
    descricao?: string | null;
    orcamentoEstimado?: number | null;
    prioridade?: number;
    dataInicioPrevista?: Date | null;
    dataFimPrevista?: Date | null;
    status?: StatusProjeto;
  }): void {
    const inicio =
      params.dataInicioPrevista !== undefined
        ? params.dataInicioPrevista
        : this._dataInicioPrevista;
    const fim =
      params.dataFimPrevista !== undefined
        ? params.dataFimPrevista
        : this._dataFimPrevista;

    this.validarDatasTemporais(inicio, fim);

    if (params.nome !== undefined) {
      if (!params.nome || params.nome.trim() === '') {
        throw new DomainException('Nome do projeto é obrigatório.');
      }
      this._nome = params.nome;
    }
    if (params.descricao !== undefined) {
      this._descricao = params.descricao;
    }
    if (params.orcamentoEstimado !== undefined) {
      this._orcamentoEstimado =
        params.orcamentoEstimado !== null ? Number(params.orcamentoEstimado) : null;
    }
    if (params.prioridade !== undefined) {
      this._prioridade = params.prioridade;
    }

    this._dataInicioPrevista = inicio;
    this._dataFimPrevista = fim;

    if (params.status !== undefined && params.status !== this._status) {
      this.alterarStatus(params.status);
    }

    this._dataAtualizacao = new Date();
  }

  adicionarEtapa(etapa: EtapaProjetoEntity): void {
    if (etapa.projetoId !== this.id || etapa.workspaceId !== this.workspaceId) {
      throw new DomainException(
        'Integridade Hierárquica violada: Etapa não pertence a este Projeto/Workspace.',
      );
    }
    this._etapas.push(etapa);
    this._dataAtualizacao = new Date();
  }

  reordenarEtapas(etapasOrdenadas: { id: string; ordem: number }[]): void {
    const mapOrdens = new Map(etapasOrdenadas.map((e) => [e.id, e.ordem]));

    for (const etapa of this._etapas) {
      if (mapOrdens.has(etapa.id)) {
        etapa.definirOrdem(mapOrdens.get(etapa.id)!);
      }
    }

    this._etapas.sort((a, b) => a.ordem - b.ordem);
    this._dataAtualizacao = new Date();
  }

  desativar(): void {
    this._ativo = false;
    this._dataAtualizacao = new Date();
  }
}
