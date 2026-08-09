"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EtapaProjetoEntity = void 0;
const domain_exception_1 = require("../../../financeiro/domain/exceptions/domain.exception");
class EtapaProjetoEntity {
    id;
    workspaceId;
    projetoId;
    _nome;
    _descricao;
    _ordem;
    _status;
    _dataInicio;
    _dataConclusao;
    _versao;
    _ativo;
    _dataCriacao;
    _dataAtualizacao;
    _itens;
    constructor(id, workspaceId, projetoId, nome, descricao, ordem, status, dataInicio, dataConclusao, versao = 0, ativo = true, dataCriacao = new Date(), dataAtualizacao = new Date(), itens = []) {
        this.id = id;
        this.workspaceId = workspaceId;
        this.projetoId = projetoId;
        if (!id || id.trim() === '') {
            throw new domain_exception_1.DomainException('ID da etapa do projeto é obrigatório.');
        }
        if (!workspaceId || workspaceId.trim() === '') {
            throw new domain_exception_1.DomainException('Workspace ID da etapa do projeto é obrigatório.');
        }
        if (!projetoId || projetoId.trim() === '') {
            throw new domain_exception_1.DomainException('Projeto ID da etapa é obrigatório.');
        }
        if (!nome || nome.trim() === '') {
            throw new domain_exception_1.DomainException('Nome da etapa do projeto é obrigatório.');
        }
        if (ordem < 1) {
            throw new domain_exception_1.DomainException('A ordem da etapa deve ser um número inteiro maior ou igual a 1.');
        }
        this._nome = nome;
        this._descricao = descricao ?? null;
        this._ordem = ordem;
        this._status = status;
        this._dataInicio = dataInicio ?? null;
        this._dataConclusao = dataConclusao ?? null;
        this._versao = versao;
        this._ativo = ativo;
        this._dataCriacao = dataCriacao;
        this._dataAtualizacao = dataAtualizacao;
        this._itens = [...itens];
        for (const item of this._itens) {
            if (item.etapaId !== this.id || item.workspaceId !== this.workspaceId) {
                throw new domain_exception_1.DomainException('Integridade Hierárquica violada: Item não pertence a esta Etapa/Workspace.');
            }
        }
    }
    static criar(params) {
        const id = params.id || crypto.randomUUID();
        const agora = new Date();
        return new EtapaProjetoEntity(id, params.workspaceId, params.projetoId, params.nome, params.descricao ?? null, params.ordem ?? 1, 'PENDENTE', params.dataInicio ?? null, null, 0, true, agora, agora, []);
    }
    static reconstituir(params) {
        return new EtapaProjetoEntity(params.id, params.workspaceId, params.projetoId, params.nome, params.descricao ?? null, params.ordem, params.status, params.dataInicio ?? null, params.dataConclusao ?? null, params.versao ?? 0, params.ativo ?? true, params.dataCriacao ?? new Date(), params.dataAtualizacao ?? new Date(), params.itens ?? []);
    }
    get nome() {
        return this._nome;
    }
    get descricao() {
        return this._descricao;
    }
    get ordem() {
        return this._ordem;
    }
    get status() {
        return this._status;
    }
    get dataInicio() {
        return this._dataInicio;
    }
    get dataConclusao() {
        return this._dataConclusao;
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
    get itens() {
        return this._itens;
    }
    definirOrdem(novaOrdem) {
        if (novaOrdem < 1) {
            throw new domain_exception_1.DomainException('A ordem da etapa deve ser um número inteiro maior ou igual a 1.');
        }
        this._ordem = novaOrdem;
        this._dataAtualizacao = new Date();
    }
    iniciar(agora = new Date()) {
        this._status = 'EM_ANDAMENTO';
        if (!this._dataInicio) {
            this._dataInicio = agora;
        }
        this._dataAtualizacao = agora;
    }
    concluir(agora = new Date()) {
        this._status = 'CONCLUIDA';
        this._dataConclusao = agora;
        this._dataAtualizacao = agora;
    }
    atualizarDados(params) {
        if (params.nome !== undefined) {
            if (!params.nome || params.nome.trim() === '') {
                throw new domain_exception_1.DomainException('Nome da etapa do projeto é obrigatório.');
            }
            this._nome = params.nome;
        }
        if (params.descricao !== undefined) {
            this._descricao = params.descricao;
        }
        if (params.ordem !== undefined) {
            this.definirOrdem(params.ordem);
        }
        this._dataAtualizacao = new Date();
    }
    adicionarItem(item) {
        if (item.etapaId !== this.id || item.workspaceId !== this.workspaceId) {
            throw new domain_exception_1.DomainException('Integridade Hierárquica violada: Item não pertence a esta Etapa/Workspace.');
        }
        this._itens.push(item);
        this._dataAtualizacao = new Date();
    }
}
exports.EtapaProjetoEntity = EtapaProjetoEntity;
//# sourceMappingURL=etapa-projeto.entity.js.map