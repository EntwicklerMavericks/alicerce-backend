"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LojaAggregate = void 0;
const domain_exception_1 = require("../../../domain/exceptions/domain.exception");
class LojaAggregate {
    id;
    workspaceId;
    sistema;
    dataCriacao;
    _nome;
    _urlWebsite;
    _urlLogo;
    _ativo;
    constructor(id, workspaceId, nome, sistema = false, urlWebsite = null, urlLogo = null, ativo = true, dataCriacao = new Date()) {
        this.id = id;
        this.workspaceId = workspaceId;
        this.sistema = sistema;
        this.dataCriacao = dataCriacao;
        if (!id) {
            throw new domain_exception_1.DomainException('ID da loja é obrigatório.');
        }
        if (!nome || nome.trim().length === 0) {
            throw new domain_exception_1.DomainException('Nome da loja é obrigatório.');
        }
        if (sistema && workspaceId !== null) {
            throw new domain_exception_1.DomainException('Uma loja do sistema (global) não pode pertencer a um workspace específico.');
        }
        if (!sistema && (!workspaceId || workspaceId.trim().length === 0)) {
            throw new domain_exception_1.DomainException('Uma loja de workspace deve possuir um workspaceId associado.');
        }
        this._nome = nome.trim();
        this._urlWebsite = urlWebsite;
        this._urlLogo = urlLogo;
        this._ativo = ativo;
    }
    get nome() {
        return this._nome;
    }
    get urlWebsite() {
        return this._urlWebsite;
    }
    get urlLogo() {
        return this._urlLogo;
    }
    get ativo() {
        return this._ativo;
    }
    podeSerEditadaPor(workspaceId) {
        if (this.sistema) {
            return false;
        }
        return this.workspaceId === workspaceId;
    }
    atualizar(nome, urlWebsite, urlLogo) {
        if (nome !== undefined) {
            if (!nome || nome.trim().length === 0) {
                throw new domain_exception_1.DomainException('Nome da loja é obrigatório.');
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
    inativar() {
        this._ativo = false;
    }
    ativar() {
        this._ativo = true;
    }
}
exports.LojaAggregate = LojaAggregate;
//# sourceMappingURL=loja.aggregate.js.map