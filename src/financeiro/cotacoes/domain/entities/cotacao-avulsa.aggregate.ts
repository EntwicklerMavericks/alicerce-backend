import { DomainException } from '../../../domain/exceptions/domain.exception';

export interface CriarCotacaoAvulsaParams {
  id?: string;
  workspaceId: string;
  itemWishlistId: string;
  nomeLoja: string;
  preco: number;
  url?: string | null;
  observacoes?: string | null;
  agora?: Date;
}

export interface ReconstituirCotacaoAvulsaParams {
  id: string;
  workspaceId: string;
  itemWishlistId: string;
  nomeLoja: string;
  preco: number;
  url?: string | null;
  observacoes?: string | null;
  versao?: number;
  ativo?: boolean;
  dataCriacao?: Date;
  dataAtualizacao?: Date;
}

export class CotacaoAvulsaAggregate {
  private _nomeLoja: string;
  private _preco: number;
  private _url: string | null;
  private _observacoes: string | null;
  private _versao: number;
  private _ativo: boolean;
  private readonly _dataCriacao: Date;
  private _dataAtualizacao: Date;

  private constructor(
    readonly id: string,
    readonly workspaceId: string,
    readonly itemWishlistId: string,
    nomeLoja: string,
    preco: number,
    url: string | null,
    observacoes: string | null,
    versao = 0,
    ativo = true,
    dataCriacao = new Date(),
    dataAtualizacao = new Date(),
  ) {
    if (!id || id.trim() === '') {
      throw new DomainException('ID da cotação avulsa é obrigatório.');
    }
    if (!workspaceId || workspaceId.trim() === '') {
      throw new DomainException('Workspace ID da cotação avulsa é obrigatório.');
    }
    if (!itemWishlistId || itemWishlistId.trim() === '') {
      throw new DomainException('ID do item da wishlist é obrigatório.');
    }
    if (!nomeLoja || nomeLoja.trim() === '') {
      throw new DomainException('Nome da loja é obrigatório.');
    }

    const precoNum = Number(preco);
    if (isNaN(precoNum) || precoNum <= 0) {
      throw new DomainException('Preço da cotação avulsa deve ser maior que zero.');
    }

    this._nomeLoja = nomeLoja;
    this._preco = precoNum;
    this._url = url ?? null;
    this._observacoes = observacoes ?? null;
    this._versao = versao;
    this._ativo = ativo;
    this._dataCriacao = dataCriacao;
    this._dataAtualizacao = dataAtualizacao;
  }

  static criar(params: CriarCotacaoAvulsaParams): CotacaoAvulsaAggregate {
    const id = params.id || crypto.randomUUID();
    const agora = params.agora || new Date();

    return new CotacaoAvulsaAggregate(
      id,
      params.workspaceId,
      params.itemWishlistId,
      params.nomeLoja,
      params.preco,
      params.url ?? null,
      params.observacoes ?? null,
      0,
      true,
      agora,
      agora,
    );
  }

  static reconstituir(params: ReconstituirCotacaoAvulsaParams): CotacaoAvulsaAggregate {
    return new CotacaoAvulsaAggregate(
      params.id,
      params.workspaceId,
      params.itemWishlistId,
      params.nomeLoja,
      params.preco,
      params.url ?? null,
      params.observacoes ?? null,
      params.versao ?? 0,
      params.ativo ?? true,
      params.dataCriacao ?? new Date(),
      params.dataAtualizacao ?? new Date(),
    );
  }

  get nomeLoja(): string {
    return this._nomeLoja;
  }

  get preco(): number {
    return this._preco;
  }

  get url(): string | null {
    return this._url;
  }

  get observacoes(): string | null {
    return this._observacoes;
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

  atualizarPreco(novoPreco: number): void {
    const precoNum = Number(novoPreco);
    if (isNaN(precoNum) || precoNum <= 0) {
      throw new DomainException('Preço da cotação avulsa deve ser maior que zero.');
    }
    this._preco = precoNum;
    this._dataAtualizacao = new Date();
  }

  atualizarDados(params: { nomeLoja?: string; url?: string | null; observacoes?: string | null }): void {
    if (params.nomeLoja !== undefined) {
      if (!params.nomeLoja || params.nomeLoja.trim() === '') {
        throw new DomainException('Nome da loja é obrigatório.');
      }
      this._nomeLoja = params.nomeLoja;
    }
    if (params.url !== undefined) {
      this._url = params.url;
    }
    if (params.observacoes !== undefined) {
      this._observacoes = params.observacoes;
    }
    this._dataAtualizacao = new Date();
  }

  desativar(): void {
    this._ativo = false;
    this._dataAtualizacao = new Date();
  }
}
