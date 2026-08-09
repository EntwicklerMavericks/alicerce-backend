"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemProjetoEntity = void 0;
const domain_exception_1 = require("../../../financeiro/domain/exceptions/domain.exception");
class ItemProjetoEntity {
    id;
    workspaceId;
    _etapaId;
    _itemWishlistId;
    _metaId;
    _wishlistVinculoAtivoKey;
    _metaVinculoAtivoKey;
    _observacoes;
    _versao;
    _ativo;
    _dataCriacao;
    _dataAtualizacao;
    constructor(id, workspaceId, etapaId, itemWishlistId, metaId, wishlistVinculoAtivoKey, metaVinculoAtivoKey, observacoes, versao = 0, ativo = true, dataCriacao = new Date(), dataAtualizacao = new Date()) {
        this.id = id;
        this.workspaceId = workspaceId;
        if (!id || id.trim() === '') {
            throw new domain_exception_1.DomainException('ID do item do projeto é obrigatório.');
        }
        if (!workspaceId || workspaceId.trim() === '') {
            throw new domain_exception_1.DomainException('Workspace ID do item do projeto é obrigatório.');
        }
        if (!etapaId || etapaId.trim() === '') {
            throw new domain_exception_1.DomainException('Etapa ID do item do projeto é obrigatório.');
        }
        this._etapaId = etapaId;
        this._itemWishlistId = itemWishlistId ?? null;
        this._metaId = metaId ?? null;
        this._observacoes = observacoes ?? null;
        this._versao = versao;
        this._ativo = ativo;
        this._dataCriacao = dataCriacao;
        this._dataAtualizacao = dataAtualizacao;
        this.validarEAtualizarInvarianteXOR(wishlistVinculoAtivoKey, metaVinculoAtivoKey);
    }
    validarEAtualizarInvarianteXOR(explicitWishlistKey, explicitMetaKey) {
        const possuiWishlist = !!this._itemWishlistId && this._itemWishlistId.trim() !== '';
        const possuiMeta = !!this._metaId && this._metaId.trim() !== '';
        if (possuiWishlist === possuiMeta) {
            throw new domain_exception_1.DomainException('O item do projeto deve estar vinculado EXCLUSIVAMENTE a um item de wishlist OU a uma meta.');
        }
        if (this._ativo) {
            this._wishlistVinculoAtivoKey = possuiWishlist
                ? (explicitWishlistKey ?? this._itemWishlistId)
                : null;
            this._metaVinculoAtivoKey = possuiMeta
                ? (explicitMetaKey ?? this._metaId)
                : null;
        }
        else {
            this._wishlistVinculoAtivoKey = null;
            this._metaVinculoAtivoKey = null;
        }
    }
    static criar(params) {
        const id = params.id || crypto.randomUUID();
        const agora = new Date();
        return new ItemProjetoEntity(id, params.workspaceId, params.etapaId, params.itemWishlistId ?? null, params.metaId ?? null, null, null, params.observacoes ?? null, 0, true, agora, agora);
    }
    static reconstituir(params) {
        return new ItemProjetoEntity(params.id, params.workspaceId, params.etapaId, params.itemWishlistId ?? null, params.metaId ?? null, params.wishlistVinculoAtivoKey ?? null, params.metaVinculoAtivoKey ?? null, params.observacoes ?? null, params.versao ?? 0, params.ativo ?? true, params.dataCriacao ?? new Date(), params.dataAtualizacao ?? new Date());
    }
    get etapaId() {
        return this._etapaId;
    }
    get itemWishlistId() {
        return this._itemWishlistId;
    }
    get metaId() {
        return this._metaId;
    }
    get wishlistVinculoAtivoKey() {
        return this._wishlistVinculoAtivoKey;
    }
    get metaVinculoAtivoKey() {
        return this._metaVinculoAtivoKey;
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
    vincularWishlist(itemWishlistId) {
        if (!itemWishlistId || itemWishlistId.trim() === '') {
            throw new domain_exception_1.DomainException('ID da Wishlist é obrigatório para vínculo.');
        }
        this._itemWishlistId = itemWishlistId;
        this._metaId = null;
        this._dataAtualizacao = new Date();
        this.validarEAtualizarInvarianteXOR();
    }
    vincularMeta(metaId) {
        if (!metaId || metaId.trim() === '') {
            throw new domain_exception_1.DomainException('ID da Meta é obrigatório para vínculo.');
        }
        this._metaId = metaId;
        this._itemWishlistId = null;
        this._dataAtualizacao = new Date();
        this.validarEAtualizarInvarianteXOR();
    }
    atualizarObservacoes(observacoes) {
        this._observacoes = observacoes;
        this._dataAtualizacao = new Date();
    }
    desativar() {
        this._ativo = false;
        this._wishlistVinculoAtivoKey = null;
        this._metaVinculoAtivoKey = null;
        this._dataAtualizacao = new Date();
    }
}
exports.ItemProjetoEntity = ItemProjetoEntity;
//# sourceMappingURL=item-projeto.entity.js.map