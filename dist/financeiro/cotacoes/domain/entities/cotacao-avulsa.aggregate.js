"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CotacaoAvulsaAggregate = void 0;
const domain_exception_1 = require("../../../domain/exceptions/domain.exception");
class CotacaoAvulsaAggregate {
    id;
    workspaceId;
    itemWishlistId;
    _nomeLoja;
    _preco;
    _url;
    _observacoes;
    _versao;
    _ativo;
    _dataCriacao;
    _dataAtualizacao;
    constructor(id, workspaceId, itemWishlistId, nomeLoja, preco, url, observacoes, versao = 0, ativo = true, dataCriacao = new Date(), dataAtualizacao = new Date()) {
        this.id = id;
        this.workspaceId = workspaceId;
        this.itemWishlistId = itemWishlistId;
        if (!id || id.trim() === '') {
            throw new domain_exception_1.DomainException('ID da cotação avulsa é obrigatório.');
        }
        if (!workspaceId || workspaceId.trim() === '') {
            throw new domain_exception_1.DomainException('Workspace ID da cotação avulsa é obrigatório.');
        }
        if (!itemWishlistId || itemWishlistId.trim() === '') {
            throw new domain_exception_1.DomainException('ID do item da wishlist é obrigatório.');
        }
        if (!nomeLoja || nomeLoja.trim() === '') {
            throw new domain_exception_1.DomainException('Nome da loja é obrigatório.');
        }
        const precoNum = Number(preco);
        if (isNaN(precoNum) || precoNum <= 0) {
            throw new domain_exception_1.DomainException('Preço da cotação avulsa deve ser maior que zero.');
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
    static criar(params) {
        const id = params.id || crypto.randomUUID();
        const agora = params.agora || new Date();
        return new CotacaoAvulsaAggregate(id, params.workspaceId, params.itemWishlistId, params.nomeLoja, params.preco, params.url ?? null, params.observacoes ?? null, 0, true, agora, agora);
    }
    static reconstituir(params) {
        return new CotacaoAvulsaAggregate(params.id, params.workspaceId, params.itemWishlistId, params.nomeLoja, params.preco, params.url ?? null, params.observacoes ?? null, params.versao ?? 0, params.ativo ?? true, params.dataCriacao ?? new Date(), params.dataAtualizacao ?? new Date());
    }
    get nomeLoja() {
        return this._nomeLoja;
    }
    get preco() {
        return this._preco;
    }
    get url() {
        return this._url;
    }
    get observacoes() {
        return this._observacoes;
    }
    get versao() {
        return this._versao;
    }
    get ativo() {
        return this._ativo;
    }
    get dataCriacao() {
        return this._dataCriacao;
    }
    get dataAtualizacao() {
        return this._dataAtualizacao;
    }
    atualizarPreco(novoPreco) {
        const precoNum = Number(novoPreco);
        if (isNaN(precoNum) || precoNum <= 0) {
            throw new domain_exception_1.DomainException('Preço da cotação avulsa deve ser maior que zero.');
        }
        this._preco = precoNum;
        this._dataAtualizacao = new Date();
    }
    atualizarDados(params) {
        if (params.nomeLoja !== undefined) {
            if (!params.nomeLoja || params.nomeLoja.trim() === '') {
                throw new domain_exception_1.DomainException('Nome da loja é obrigatório.');
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
    desativar() {
        this._ativo = false;
        this._dataAtualizacao = new Date();
    }
}
exports.CotacaoAvulsaAggregate = CotacaoAvulsaAggregate;
//# sourceMappingURL=cotacao-avulsa.aggregate.js.map