"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProdutoAggregate = void 0;
const domain_exception_1 = require("../../../domain/exceptions/domain.exception");
class ProdutoAggregate {
    id;
    workspaceId;
    dataCriacao;
    dataAtualizacao;
    _nome;
    _descricao;
    _marca;
    _categoriaId;
    _observacoes;
    _ativo;
    _imagens;
    _links;
    constructor(id, workspaceId, nome, descricao = null, marca = null, categoriaId = null, observacoes = null, ativo = true, imagens = [], links = [], dataCriacao = new Date(), dataAtualizacao = new Date()) {
        this.id = id;
        this.workspaceId = workspaceId;
        this.dataCriacao = dataCriacao;
        this.dataAtualizacao = dataAtualizacao;
        if (!id || id.trim().length === 0) {
            throw new domain_exception_1.DomainException('ID do produto é obrigatório.');
        }
        if (!workspaceId || workspaceId.trim().length === 0) {
            throw new domain_exception_1.DomainException('Workspace ID é obrigatório.');
        }
        if (!nome || nome.trim().length === 0) {
            throw new domain_exception_1.DomainException('Nome do produto é obrigatório.');
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
    get nome() {
        return this._nome;
    }
    get descricao() {
        return this._descricao;
    }
    get marca() {
        return this._marca;
    }
    get categoriaId() {
        return this._categoriaId;
    }
    get observacoes() {
        return this._observacoes;
    }
    get ativo() {
        return this._ativo;
    }
    get imagens() {
        return this._imagens;
    }
    get links() {
        return this._links;
    }
    get imagemPrincipal() {
        return this._imagens.find((img) => img.ativo && img.principal);
    }
    definirImagemPrincipal(imagemId) {
        const imagemAlvo = this._imagens.find((img) => img.id === imagemId && img.ativo);
        if (!imagemAlvo) {
            throw new domain_exception_1.DomainException('Imagem não encontrada ou inativa no produto.');
        }
        this._imagens = this._imagens.map((img) => ({
            ...img,
            principal: img.id === imagemId && img.ativo,
        }));
        this.validarInvarianteImagemPrincipal();
    }
    adicionarImagem(imagem) {
        if (imagem.principal && imagem.ativo) {
            this._imagens = this._imagens.map((img) => ({
                ...img,
                principal: false,
            }));
        }
        this._imagens.push(imagem);
        this.validarInvarianteImagemPrincipal();
    }
    removerImagem(imagemId) {
        const idx = this._imagens.findIndex((img) => img.id === imagemId);
        if (idx !== -1) {
            this._imagens[idx] = { ...this._imagens[idx], ativo: false, principal: false };
        }
    }
    atualizarDados(nome, descricao, marca, categoriaId, observacoes) {
        if (nome !== undefined) {
            if (!nome || nome.trim().length === 0) {
                throw new domain_exception_1.DomainException('Nome do produto é obrigatório.');
            }
            this._nome = nome.trim();
        }
        if (descricao !== undefined)
            this._descricao = descricao;
        if (marca !== undefined)
            this._marca = marca;
        if (categoriaId !== undefined)
            this._categoriaId = categoriaId;
        if (observacoes !== undefined)
            this._observacoes = observacoes;
    }
    inativar() {
        this._ativo = false;
    }
    validarInvarianteImagemPrincipal() {
        const principaisAtivas = this._imagens.filter((img) => img.ativo && img.principal);
        if (principaisAtivas.length > 1) {
            throw new domain_exception_1.DomainException('O produto não pode ter mais de uma imagem principal ativa.');
        }
    }
}
exports.ProdutoAggregate = ProdutoAggregate;
//# sourceMappingURL=produto.aggregate.js.map