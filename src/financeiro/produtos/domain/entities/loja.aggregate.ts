import { DomainException } from '../../../domain/exceptions/domain.exception';

export class LojaAggregate {
  private _nome: string;
  private _urlWebsite: string | null;
  private _urlLogo: string | null;
  private _ativo: boolean;

  constructor(
    readonly id: string,
    readonly workspaceId: string | null,
    nome: string,
    readonly sistema: boolean = false,
    urlWebsite: string | null = null,
    urlLogo: string | null = null,
    ativo: boolean = true,
    readonly dataCriacao: Date = new Date(),
  ) {
    if (!id) {
      throw new DomainException('ID da loja é obrigatório.');
    }

    if (!nome || nome.trim().length === 0) {
      throw new DomainException('Nome da loja é obrigatório.');
    }

    // Invariante 1: sistema === true -> workspaceId === null
    if (sistema && workspaceId !== null) {
      throw new DomainException('Uma loja do sistema (global) não pode pertencer a um workspace específico.');
    }

    // Invariante 2: sistema === false -> workspaceId !== null
    if (!sistema && (!workspaceId || workspaceId.trim().length === 0)) {
      throw new DomainException('Uma loja de workspace deve possuir um workspaceId associado.');
    }

    this._nome = nome.trim();
    this._urlWebsite = urlWebsite;
    this._urlLogo = urlLogo;
    this._ativo = ativo;
  }

  get nome(): string {
    return this._nome;
  }

  get urlWebsite(): string | null {
    return this._urlWebsite;
  }

  get urlLogo(): string | null {
    return this._urlLogo;
  }

  get ativo(): boolean {
    return this._ativo;
  }

  /**
   * Determina se a loja pode ser editada ou removida pelo workspace especificado.
   * Lojas do sistema (sistema === true) NUNCA podem ser editadas por nenhum workspace.
   */
  podeSerEditadaPor(workspaceId: string): boolean {
    if (this.sistema) {
      return false;
    }
    return this.workspaceId === workspaceId;
  }

  atualizar(nome?: string, urlWebsite?: string | null, urlLogo?: string | null): void {
    if (nome !== undefined) {
      if (!nome || nome.trim().length === 0) {
        throw new DomainException('Nome da loja é obrigatório.');
      }
      this._nome = nome.trim();
    }
    if (urlWebsite !== undefined) {
      this._urlWebsite = urlWebsite;
    }
    if (urlLogo !== undefined) {
      this._urlLogo = urlLogo;
    }
  }

  inativar(): void {
    this._ativo = false;
  }

  ativar(): void {
    this._ativo = true;
  }
}
