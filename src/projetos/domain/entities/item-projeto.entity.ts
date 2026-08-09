import { DomainException } from '../../../financeiro/domain/exceptions/domain.exception';

export interface CriarItemProjetoParams {
  id?: string;
  workspaceId: string;
  etapaId: string;
  itemWishlistId?: string | null;
  metaId?: string | null;
  observacoes?: string | null;
}

export interface ReconstituirItemProjetoParams {
  id: string;
  workspaceId: string;
  etapaId: string;
  itemWishlistId?: string | null;
  metaId?: string | null;
  wishlistVinculoAtivoKey?: string | null;
  metaVinculoAtivoKey?: string | null;
  observacoes?: string | null;
  versao?: number;
  ativo?: boolean;
  dataCriacao?: Date;
  dataAtualizacao?: Date;
}

export class ItemProjetoEntity {
  private _etapaId: string;
  private _itemWishlistId: string | null;
  private _metaId: string | null;
  private _wishlistVinculoAtivoKey: string | null;
  private _metaVinculoAtivoKey: string | null;
  private _observacoes: string | null;
  private _versao: number;
  private _ativo: boolean;
  private readonly _dataCriacao: Date;
  private _dataAtualizacao: Date;

  private constructor(
    readonly id: string,
    readonly workspaceId: string,
    etapaId: string,
    itemWishlistId: string | null,
    metaId: string | null,
    wishlistVinculoAtivoKey: string | null,
    metaVinculoAtivoKey: string | null,
    observacoes: string | null,
    versao = 0,
    ativo = true,
    dataCriacao = new Date(),
    dataAtualizacao = new Date(),
  ) {
    if (!id || id.trim() === '') {
      throw new DomainException('ID do item do projeto é obrigatório.');
    }
    if (!workspaceId || workspaceId.trim() === '') {
      throw new DomainException('Workspace ID do item do projeto é obrigatório.');
    }
    if (!etapaId || etapaId.trim() === '') {
      throw new DomainException('Etapa ID do item do projeto é obrigatório.');
    }

    this._etapaId = etapaId;
    this._itemWishlistId = itemWishlistId ?? null;
    this._metaId = metaId ?? null;
    this._observacoes = observacoes ?? null;
    this._versao = versao;
    this._ativo = ativo;
    this._dataCriacao = dataCriacao;
    this._dataAtualizacao = dataAtualizacao;

    // Enforce XOR invariant & compute keys
    this.validarEAtualizarInvarianteXOR(wishlistVinculoAtivoKey, metaVinculoAtivoKey);
  }

  private validarEAtualizarInvarianteXOR(
    explicitWishlistKey?: string | null,
    explicitMetaKey?: string | null,
  ): void {
    const possuiWishlist = !!this._itemWishlistId && this._itemWishlistId.trim() !== '';
    const possuiMeta = !!this._metaId && this._metaId.trim() !== '';

    // Invariante XOR: deve possuir EXCLUSIVAMENTE wishlist OU meta (nunca ambos, nunca nenhum)
    if (possuiWishlist === possuiMeta) {
      throw new DomainException(
        'O item do projeto deve estar vinculado EXCLUSIVAMENTE a um item de wishlist OU a uma meta.',
      );
    }

    if (this._ativo) {
      this._wishlistVinculoAtivoKey = possuiWishlist
        ? (explicitWishlistKey ?? this._itemWishlistId)
        : null;
      this._metaVinculoAtivoKey = possuiMeta
        ? (explicitMetaKey ?? this._metaId)
        : null;
    } else {
      this._wishlistVinculoAtivoKey = null;
      this._metaVinculoAtivoKey = null;
    }
  }

  static criar(params: CriarItemProjetoParams): ItemProjetoEntity {
    const id = params.id || crypto.randomUUID();
    const agora = new Date();

    return new ItemProjetoEntity(
      id,
      params.workspaceId,
      params.etapaId,
      params.itemWishlistId ?? null,
      params.metaId ?? null,
      null,
      null,
      params.observacoes ?? null,
      0,
      true,
      agora,
      agora,
    );
  }

  static reconstituir(params: ReconstituirItemProjetoParams): ItemProjetoEntity {
    return new ItemProjetoEntity(
      params.id,
      params.workspaceId,
      params.etapaId,
      params.itemWishlistId ?? null,
      params.metaId ?? null,
      params.wishlistVinculoAtivoKey ?? null,
      params.metaVinculoAtivoKey ?? null,
      params.observacoes ?? null,
      params.versao ?? 0,
      params.ativo ?? true,
      params.dataCriacao ?? new Date(),
      params.dataAtualizacao ?? new Date(),
    );
  }

  get etapaId(): string {
    return this._etapaId;
  }

  get itemWishlistId(): string | null {
    return this._itemWishlistId;
  }

  get metaId(): string | null {
    return this._metaId;
  }

  get wishlistVinculoAtivoKey(): string | null {
    return this._wishlistVinculoAtivoKey;
  }

  get metaVinculoAtivoKey(): string | null {
    return this._metaVinculoAtivoKey;
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

  vincularWishlist(itemWishlistId: string): void {
    if (!itemWishlistId || itemWishlistId.trim() === '') {
      throw new DomainException('ID da Wishlist é obrigatório para vínculo.');
    }
    this._itemWishlistId = itemWishlistId;
    this._metaId = null;
    this._dataAtualizacao = new Date();
    this.validarEAtualizarInvarianteXOR();
  }

  vincularMeta(metaId: string): void {
    if (!metaId || metaId.trim() === '') {
      throw new DomainException('ID da Meta é obrigatório para vínculo.');
    }
    this._metaId = metaId;
    this._itemWishlistId = null;
    this._dataAtualizacao = new Date();
    this.validarEAtualizarInvarianteXOR();
  }

  atualizarObservacoes(observacoes: string | null): void {
    this._observacoes = observacoes;
    this._dataAtualizacao = new Date();
  }

  desativar(): void {
    this._ativo = false;
    this._wishlistVinculoAtivoKey = null;
    this._metaVinculoAtivoKey = null;
    this._dataAtualizacao = new Date();
  }
}
