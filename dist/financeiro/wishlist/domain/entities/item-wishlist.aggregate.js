"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemWishlistAggregate = void 0;
const domain_exception_1 = require("../../../domain/exceptions/domain.exception");
const tempo_esfriamento_vo_1 = require("../value-objects/tempo-esfriamento.vo");
class ItemWishlistAggregate {
    id;
    workspaceId;
    _nome;
    _descricao;
    _precoAlvo;
    _valorCompra;
    _valorEconomizado;
    _prioridade;
    _tempoEsfriamento;
    _inicioEsfriamento;
    _fimEsfriamento;
    _status;
    _quebrouEsfriamento;
    _dataQuebraEsfriamento;
    _dataConclusao;
    _produtoId;
    _versao;
    _ativo;
    _dataCriacao;
    _dataAtualizacao;
    constructor(id, workspaceId, nome, descricao, precoAlvo, valorCompra, valorEconomizado, prioridade, tempoEsfriamento, inicioEsfriamento, fimEsfriamento, status, quebrouEsfriamento, dataQuebraEsfriamento, dataConclusao, produtoId, versao = 0, ativo = true, dataCriacao = new Date(), dataAtualizacao = new Date()) {
        this.id = id;
        this.workspaceId = workspaceId;
        if (!id || id.trim() === '') {
            throw new domain_exception_1.DomainException('ID do item da wishlist é obrigatório.');
        }
        if (!workspaceId || workspaceId.trim() === '') {
            throw new domain_exception_1.DomainException('Workspace ID do item da wishlist é obrigatório.');
        }
        if (!nome || nome.trim() === '') {
            throw new domain_exception_1.DomainException('Nome do item da wishlist é obrigatório.');
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
    static criar(params) {
        const id = params.id || crypto.randomUUID();
        const agora = params.agora || new Date();
        const diasEsfriamento = params.diasEsfriamento ?? 7;
        const tempoEsfriamento = new tempo_esfriamento_vo_1.TempoEsfriamentoVO(diasEsfriamento);
        const inicioEsfriamento = new Date(agora.getTime());
        const fimEsfriamento = tempoEsfriamento.calcularDataFim(inicioEsfriamento);
        return new ItemWishlistAggregate(id, params.workspaceId, params.nome, params.descricao ?? null, params.precoAlvo ?? null, null, null, params.prioridade || 'MEDIA', tempoEsfriamento, inicioEsfriamento, fimEsfriamento, 'ANALISE', false, null, null, params.produtoId ?? null, 0, true, agora, agora);
    }
    static reconstituir(params) {
        const tempoEsfriamento = new tempo_esfriamento_vo_1.TempoEsfriamentoVO(params.diasEsfriamento);
        return new ItemWishlistAggregate(params.id, params.workspaceId, params.nome, params.descricao ?? null, params.precoAlvo ?? null, params.valorCompra ?? null, params.valorEconomizado ?? null, params.prioridade, tempoEsfriamento, params.inicioEsfriamento, params.fimEsfriamento, params.status, params.quebrouEsfriamento, params.dataQuebraEsfriamento ?? null, params.dataConclusao ?? null, params.produtoId ?? null, params.versao ?? 0, params.ativo ?? true, params.dataCriacao ?? new Date(), params.dataAtualizacao ?? new Date());
    }
    get nome() {
        return this._nome;
    }
    get descricao() {
        return this._descricao;
    }
    get precoAlvo() {
        return this._precoAlvo;
    }
    get valorCompra() {
        return this._valorCompra;
    }
    get valorEconomizado() {
        return this._valorEconomizado;
    }
    get prioridade() {
        return this._prioridade;
    }
    get tempoEsfriamento() {
        return this._tempoEsfriamento;
    }
    get diasEsfriamento() {
        return this._tempoEsfriamento.dias;
    }
    get inicioEsfriamento() {
        return this._inicioEsfriamento;
    }
    get fimEsfriamento() {
        return this._fimEsfriamento;
    }
    get status() {
        return this._status;
    }
    get quebrouEsfriamento() {
        return this._quebrouEsfriamento;
    }
    get dataQuebraEsfriamento() {
        return this._dataQuebraEsfriamento;
    }
    get dataConclusao() {
        return this._dataConclusao;
    }
    get produtoId() {
        return this._produtoId;
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
    validarNaoTerminal() {
        if (this._status === 'COMPRADO' || this._status === 'DESISTIDO') {
            throw new domain_exception_1.DomainException('Não é possível modificar um item da wishlist no estado terminal COMPRADO ou DESISTIDO.');
        }
    }
    iniciarCompra({ agora = new Date(), quebrarEsfriamento = false, valorCompraInformado, menorCotacaoAtiva, } = {}) {
        this.validarNaoTerminal();
        const emEsfriamento = agora.getTime() < this._fimEsfriamento.getTime();
        if (emEsfriamento && quebrarEsfriamento !== true) {
            throw new domain_exception_1.DomainException('Período de esfriamento ativo. É necessário declarar a quebra explícita do desafio de impulso.');
        }
        if (quebrarEsfriamento === true) {
            this._quebrouEsfriamento = true;
            this._dataQuebraEsfriamento = agora;
        }
        let valorFinal = null;
        if (valorCompraInformado !== undefined && valorCompraInformado !== null && valorCompraInformado > 0) {
            valorFinal = Number(valorCompraInformado);
        }
        else if (menorCotacaoAtiva !== undefined && menorCotacaoAtiva !== null && menorCotacaoAtiva > 0) {
            valorFinal = Number(menorCotacaoAtiva);
        }
        else if (this._precoAlvo !== null && this._precoAlvo > 0) {
            valorFinal = Number(this._precoAlvo);
        }
        if (valorFinal === null || valorFinal <= 0) {
            throw new domain_exception_1.DomainException('Nenhum valor de compra disponível para finalizar a compra.');
        }
        this._valorCompra = valorFinal;
        this._dataConclusao = agora;
        this._status = 'COMPRADO';
        this._dataAtualizacao = agora;
    }
    desistir({ agora = new Date(), menorCotacaoAtiva } = {}) {
        this.validarNaoTerminal();
        let valorSnapshot = null;
        if (this._precoAlvo !== null && this._precoAlvo > 0) {
            valorSnapshot = Number(this._precoAlvo);
        }
        else if (menorCotacaoAtiva !== undefined && menorCotacaoAtiva !== null && menorCotacaoAtiva > 0) {
            valorSnapshot = Number(menorCotacaoAtiva);
        }
        this._valorEconomizado = valorSnapshot;
        this._dataConclusao = agora;
        this._status = 'DESISTIDO';
        this._dataAtualizacao = agora;
    }
    planejar() {
        this.validarNaoTerminal();
        this._status = 'PLANEJADO';
        this._dataAtualizacao = new Date();
    }
    vincularProduto(produtoId) {
        this.validarNaoTerminal();
        if (!produtoId || produtoId.trim() === '') {
            throw new domain_exception_1.DomainException('ID do produto é obrigatório para vincular.');
        }
        this._produtoId = produtoId;
        this._dataAtualizacao = new Date();
    }
    desvincularProduto() {
        this.validarNaoTerminal();
        this._produtoId = null;
        this._dataAtualizacao = new Date();
    }
    atualizarDados(params) {
        this.validarNaoTerminal();
        if (params.nome !== undefined) {
            if (!params.nome || params.nome.trim() === '') {
                throw new domain_exception_1.DomainException('Nome do item da wishlist é obrigatório.');
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
exports.ItemWishlistAggregate = ItemWishlistAggregate;
//# sourceMappingURL=item-wishlist.aggregate.js.map