import { DomainException } from '../../../domain/exceptions/domain.exception';
import { PrecoObservado } from '../value-objects/preco-observado.vo';

export interface ImagemProdutoItem {
  id: string;
  produtoId: string;
  url: string;
  ordem: number;
  principal: boolean;
  ativo: boolean;
  dataCriacao?: Date;
}

export interface LinkProdutoItem {
  id: string;
  produtoId: string;
  lojaId: string;
  url: string;
  preco: PrecoObservado;
  versao: number;
  ativo: boolean;
  ultimaVerificacao?: Date | null;
}

export class ProdutoAggregate {
  private _nome: string;
  private _descricao: string | null;
  private _marca: string | null;
  private _categoriaId: string | null;
  private _observacoes: string | null;
  private _ativo: boolean;
  private _imagens: ImagemProdutoItem[];
  private _links: LinkProdutoItem[];

  constructor(
    readonly id: string,
    readonly workspaceId: string,
    nome: string,
    descricao: string | null = null,
    marca: string | null = null,
    categoriaId: string | null = null,
    observacoes: string | null = null,
    ativo: boolean = true,
    imagens: ImagemProdutoItem[] = [],
    links: LinkProdutoItem[] = [],
    readonly dataCriacao: Date = new Date(),
    readonly dataAtualizacao: Date = new Date(),
  ) {
    if (!id || id.trim().length === 0) {
      throw new DomainException('ID do produto é obrigatório.');
    }
    if (!workspaceId || workspaceId.trim().length === 0) {
      throw new DomainException('Workspace ID é obrigatório.');
    }
    if (!nome || nome.trim().length === 0) {
      throw new DomainException('Nome do produto é obrigatório.');
    }

    this._nome = nome.trim();
    this._descricao = descricao;
    this._marca = marca;
    this._categoriaId = categoriaId;
    this._observacoes = observacoes;
    this._ativo = ativo;
    this._imagens = [...imagens];
    this._links = [...links];

    this.validarInvarianteImagemPrincipal();
  }

  get nome(): string {
    return this._nome;
  }

  get descricao(): string | null {
    return this._descricao;
  }

  get marca(): string | null {
    return this._marca;
  }

  get categoriaId(): string | null {
    return this._categoriaId;
  }

  get observacoes(): string | null {
    return this._observacoes;
  }

  get ativo(): boolean {
    return this._ativo;
  }

  get imagens(): ReadonlyArray<ImagemProdutoItem> {
    return this._imagens;
  }

  get links(): ReadonlyArray<LinkProdutoItem> {
    return this._links;
  }

  get imagemPrincipal(): ImagemProdutoItem | undefined {
    return this._imagens.find((img) => img.ativo && img.principal);
  }

  /**
   * REGRA DE NEGÓCIO MANDATÓRIA:
   * No máximo uma imagem ativa pode ser marcada como principal = true.
   * Marca exclusivamente a imagem com ID selecionado como principal = true e desativa principal de todas as outras.
   */
  definirImagemPrincipal(imagemId: string): void {
    const imagemAlvo = this._imagens.find((img) => img.id === imagemId && img.ativo);
    if (!imagemAlvo) {
      throw new DomainException('Imagem não encontrada ou inativa no produto.');
    }

    this._imagens = this._imagens.map((img) => ({
      ...img,
      principal: img.id === imagemId && img.ativo,
    }));

    this.validarInvarianteImagemPrincipal();
  }

  adicionarImagem(imagem: ImagemProdutoItem): void {
    if (imagem.principal && imagem.ativo) {
      this._imagens = this._imagens.map((img) => ({
        ...img,
        principal: false,
      }));
    }
    this._imagens.push(imagem);
    this.validarInvarianteImagemPrincipal();
  }

  removerImagem(imagemId: string): void {
    const idx = this._imagens.findIndex((img) => img.id === imagemId);
    if (idx !== -1) {
      this._imagens[idx] = { ...this._imagens[idx], ativo: false, principal: false };
    }
  }

  atualizarDados(
    nome?: string,
    descricao?: string | null,
    marca?: string | null,
    categoriaId?: string | null,
    observacoes?: string | null,
  ): void {
    if (nome !== undefined) {
      if (!nome || nome.trim().length === 0) {
        throw new DomainException('Nome do produto é obrigatório.');
      }
      this._nome = nome.trim();
    }
    if (descricao !== undefined) this._descricao = descricao;
    if (marca !== undefined) this._marca = marca;
    if (categoriaId !== undefined) this._categoriaId = categoriaId;
    if (observacoes !== undefined) this._observacoes = observacoes;
  }

  inativar(): void {
    this._ativo = false;
  }

  private validarInvarianteImagemPrincipal(): void {
    const principaisAtivas = this._imagens.filter((img) => img.ativo && img.principal);
    if (principaisAtivas.length > 1) {
      throw new DomainException('O produto não pode ter mais de uma imagem principal ativa.');
    }
  }
}
