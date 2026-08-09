import { StatusWishlist, PrioridadeWishlist } from '@prisma/client';
import { DomainException } from '../../../domain/exceptions/domain.exception';
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

export class ItemWishlistAggregate {
  private _nome: string;
  private _descricao: string | null;
  private _precoAlvo: number | null;
  private _valorCompra: number | null;
  private _valorEconomizado: number | null;
  private _prioridade: PrioridadeWishlist;
  private _tempoEsfriamento: TempoEsfriamentoVO;
  private readonly _inicioEsfriamento: Date;
  private readonly _fimEsfriamento: Date;
  private _status: StatusWishlist;
  private _quebrouEsfriamento: boolean;
  private _dataQuebraEsfriamento: Date | null;
  private _dataConclusao: Date | null;
  private _produtoId: string | null;
  private _versao: number;
  private _ativo: boolean;
  private readonly _dataCriacao: Date;
  private _dataAtualizacao: Date;

  private constructor(
    readonly id: string,
    readonly workspaceId: string,
    nome: string,
    descricao: string | null,
    precoAlvo: number | null,
    valorCompra: number | null,
    valorEconomizado: number | null,
    prioridade: PrioridadeWishlist,
    tempoEsfriamento: TempoEsfriamentoVO,
    inicioEsfriamento: Date,
    fimEsfriamento: Date,
    status: StatusWishlist,
    quebrouEsfriamento: boolean,
    dataQuebraEsfriamento: Date | null,
    dataConclusao: Date | null,
    produtoId: string | null,
    versao = 0,
    ativo = true,
    dataCriacao = new Date(),
    dataAtualizacao = new Date(),
  ) {
    if (!id || id.trim() === '') {
      throw new DomainException('ID do item da wishlist é obrigatório.');
    }
    if (!workspaceId || workspaceId.trim() === '') {
      throw new DomainException('Workspace ID do item da wishlist é obrigatório.');
    }
    if (!nome || nome.trim() === '') {
      throw new DomainException('Nome do item da wishlist é obrigatório.');
    }

    this._nome = nome;
    this._descricao = descricao ?? null;
    this._precoAlvo = precoAlvo !== undefined && precoAlvo !== null ? Number(precoAlvo) : null;
    this._valorCompra = valorCompra !== undefined && valorCompra !== null ? Number(valorCompra) : null;
    this._valorEconomizado = valorEconomizado !== undefined && valorEconomizado !== null ? Number(valorEconomizado) : null;
    this._prioridade = prioridade;
    this._tempoEsfriamento = tempoEsfriamento;
    this._inicioEsfriamento = inicioEsfriamento;
    this._fimEsfriamento = fimEsfriamento;
    this._status = status;
    this._quebrouEsfriamento = quebrouEsfriamento;
    this._dataQuebraEsfriamento = dataQuebraEsfriamento ?? null;
    this._dataConclusao = dataConclusao ?? null;
    this._produtoId = produtoId ?? null;
    this._versao = versao;
    this._ativo = ativo;
    this._dataCriacao = dataCriacao;
    this._dataAtualizacao = dataAtualizacao;
  }

  static criar(params: CriarItemWishlistParams): ItemWishlistAggregate {
    const id = params.id || crypto.randomUUID();
    const agora = params.agora || new Date();
    const diasEsfriamento = params.diasEsfriamento ?? 7;
    const tempoEsfriamento = new TempoEsfriamentoVO(diasEsfriamento);

    const inicioEsfriamento = new Date(agora.getTime());
    const fimEsfriamento = tempoEsfriamento.calcularDataFim(inicioEsfriamento);

    return new ItemWishlistAggregate(
      id,
      params.workspaceId,
      params.nome,
      params.descricao ?? null,
      params.precoAlvo ?? null,
      null,
      null,
      params.prioridade || 'MEDIA',
      tempoEsfriamento,
      inicioEsfriamento,
      fimEsfriamento,
      'ANALISE',
      false,
      null,
      null,
      params.produtoId ?? null,
      0,
      true,
      agora,
      agora,
    );
  }

  static reconstituir(params: ReconstituirItemWishlistParams): ItemWishlistAggregate {
    const tempoEsfriamento = new TempoEsfriamentoVO(params.diasEsfriamento);
    return new ItemWishlistAggregate(
      params.id,
      params.workspaceId,
      params.nome,
      params.descricao ?? null,
      params.precoAlvo ?? null,
      params.valorCompra ?? null,
      params.valorEconomizado ?? null,
      params.prioridade,
      tempoEsfriamento,
      params.inicioEsfriamento,
      params.fimEsfriamento,
      params.status,
      params.quebrouEsfriamento,
      params.dataQuebraEsfriamento ?? null,
      params.dataConclusao ?? null,
      params.produtoId ?? null,
      params.versao ?? 0,
      params.ativo ?? true,
      params.dataCriacao ?? new Date(),
      params.dataAtualizacao ?? new Date(),
    );
  }

  // Getters
  get nome(): string {
    return this._nome;
  }

  get descricao(): string | null {
    return this._descricao;
  }

  get precoAlvo(): number | null {
    return this._precoAlvo;
  }

  get valorCompra(): number | null {
    return this._valorCompra;
  }

  get valorEconomizado(): number | null {
    return this._valorEconomizado;
  }

  get prioridade(): PrioridadeWishlist {
    return this._prioridade;
  }

  get tempoEsfriamento(): TempoEsfriamentoVO {
    return this._tempoEsfriamento;
  }

  get diasEsfriamento(): number {
    return this._tempoEsfriamento.dias;
  }

  get inicioEsfriamento(): Date {
    return this._inicioEsfriamento;
  }

  get fimEsfriamento(): Date {
    return this._fimEsfriamento;
  }

  get status(): StatusWishlist {
    return this._status;
  }

  get quebrouEsfriamento(): boolean {
    return this._quebrouEsfriamento;
  }

  get dataQuebraEsfriamento(): Date | null {
    return this._dataQuebraEsfriamento;
  }

  get dataConclusao(): Date | null {
    return this._dataConclusao;
  }

  get produtoId(): string | null {
    return this._produtoId;
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

  // Invariant validation for terminal state
  private validarNaoTerminal(): void {
    if (this._status === 'COMPRADO' || this._status === 'DESISTIDO') {
      throw new DomainException('Não é possível modificar um item da wishlist no estado terminal COMPRADO ou DESISTIDO.');
    }
  }

  // Domain behavior methods
  iniciarCompra({
    agora = new Date(),
    quebrarEsfriamento = false,
    valorCompraInformado,
    menorCotacaoAtiva,
  }: IniciarCompraParams = {}): void {
    this.validarNaoTerminal();

    const emEsfriamento = agora.getTime() < this._fimEsfriamento.getTime();

    if (emEsfriamento && quebrarEsfriamento !== true) {
      throw new DomainException(
        'Período de esfriamento ativo. É necessário declarar a quebra explícita do desafio de impulso.',
      );
    }

    if (quebrarEsfriamento === true) {
      this._quebrouEsfriamento = true;
      this._dataQuebraEsfriamento = agora;
    }

    // Determina valorCompra por precedência: valorCompraInformado -> menorCotacaoAtiva -> precoAlvo
    let valorFinal: number | null = null;

    if (valorCompraInformado !== undefined && valorCompraInformado !== null && valorCompraInformado > 0) {
      valorFinal = Number(valorCompraInformado);
    } else if (menorCotacaoAtiva !== undefined && menorCotacaoAtiva !== null && menorCotacaoAtiva > 0) {
      valorFinal = Number(menorCotacaoAtiva);
    } else if (this._precoAlvo !== null && this._precoAlvo > 0) {
      valorFinal = Number(this._precoAlvo);
    }

    if (valorFinal === null || valorFinal <= 0) {
      throw new DomainException('Nenhum valor de compra disponível para finalizar a compra.');
    }

    this._valorCompra = valorFinal;
    this._dataConclusao = agora;
    this._status = 'COMPRADO';
    this._dataAtualizacao = agora;
  }

  desistir({ agora = new Date(), menorCotacaoAtiva }: DesistirParams = {}): void {
    this.validarNaoTerminal();

    // Congela snapshot de valorEconomizado por precedência: precoAlvo -> menorCotacaoAtiva -> null
    let valorSnapshot: number | null = null;

    if (this._precoAlvo !== null && this._precoAlvo > 0) {
      valorSnapshot = Number(this._precoAlvo);
    } else if (menorCotacaoAtiva !== undefined && menorCotacaoAtiva !== null && menorCotacaoAtiva > 0) {
      valorSnapshot = Number(menorCotacaoAtiva);
    }

    this._valorEconomizado = valorSnapshot;
    this._dataConclusao = agora;
    this._status = 'DESISTIDO';
    this._dataAtualizacao = agora;
  }

  planejar(): void {
    this.validarNaoTerminal();
    this._status = 'PLANEJADO';
    this._dataAtualizacao = new Date();
  }

  vincularProduto(produtoId: string): void {
    this.validarNaoTerminal();
    if (!produtoId || produtoId.trim() === '') {
      throw new DomainException('ID do produto é obrigatório para vincular.');
    }
    this._produtoId = produtoId;
    this._dataAtualizacao = new Date();
  }

  desvincularProduto(): void {
    this.validarNaoTerminal();
    this._produtoId = null;
    this._dataAtualizacao = new Date();
  }

  atualizarDados(params: {
    nome?: string;
    descricao?: string | null;
    precoAlvo?: number | null;
    prioridade?: PrioridadeWishlist;
  }): void {
    this.validarNaoTerminal();

    if (params.nome !== undefined) {
      if (!params.nome || params.nome.trim() === '') {
        throw new DomainException('Nome do item da wishlist é obrigatório.');
      }
      this._nome = params.nome;
    }
    if (params.descricao !== undefined) {
      this._descricao = params.descricao;
    }
    if (params.precoAlvo !== undefined) {
      this._precoAlvo = params.precoAlvo !== null ? Number(params.precoAlvo) : null;
    }
    if (params.prioridade !== undefined) {
      this._prioridade = params.prioridade;
    }
    this._dataAtualizacao = new Date();
  }
}
