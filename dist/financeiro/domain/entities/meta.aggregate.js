"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaAggregate = void 0;
const money_vo_1 = require("../value-objects/money.vo");
const domain_exception_1 = require("../exceptions/domain.exception");
class MetaAggregate {
    id;
    workspaceId;
    _status;
    _aportes;
    _nome;
    _descricao;
    _valorAlvo;
    _prazo;
    _icone;
    _cor;
    _prioridade;
    constructor(id, workspaceId, nome, valorAlvo, prazo, icone, cor, status = 'ATIVA', descricao, prioridade = 1, aportes = []) {
        this.id = id;
        this.workspaceId = workspaceId;
        if (!id || !workspaceId || !nome) {
            throw new domain_exception_1.DomainException('Propriedades obrigatórias faltando para a Meta.');
        }
        if (!valorAlvo || !valorAlvo.isPositive()) {
            throw new domain_exception_1.DomainException('O valor alvo da meta deve ser maior que zero.');
        }
        this._nome = nome;
        this._valorAlvo = valorAlvo;
        this._prazo = prazo;
        this._icone = icone;
        this._cor = cor;
        this._status = status;
        this._descricao = descricao;
        this._prioridade = prioridade;
        this._aportes = [...aportes];
        this.verificarEAtualizarStatus();
    }
    get nome() {
        return this._nome;
    }
    get descricao() {
        return this._descricao;
    }
    get valorAlvo() {
        return this._valorAlvo;
    }
    get prazo() {
        return this._prazo;
    }
    get icone() {
        return this._icone;
    }
    get cor() {
        return this._cor;
    }
    get status() {
        return this._status;
    }
    get prioridade() {
        return this._prioridade;
    }
    get aportes() {
        return this._aportes;
    }
    get valorAcumulado() {
        return this._aportes.reduce((acc, aporte) => acc.somar(aporte.valor), money_vo_1.Money.zero());
    }
    adicionarAporte(id, valor, data = new Date(), descricao) {
        if (this._status === 'CANCELADA') {
            throw new domain_exception_1.DomainException('Não é possível adicionar aportes a uma meta cancelada.');
        }
        if (!valor || !valor.isPositive()) {
            throw new domain_exception_1.DomainException('O valor do aporte deve ser maior que zero.');
        }
        const aporte = {
            id,
            metaId: this.id,
            valor,
            data,
            descricao,
            dataCriacao: new Date(),
        };
        this._aportes.push(aporte);
        this.verificarEAtualizarStatus();
        return aporte;
    }
    removerAporte(aporteId) {
        const idx = this._aportes.findIndex((a) => a.id === aporteId);
        if (idx === -1) {
            throw new domain_exception_1.DomainException(`Aporte ${aporteId} não encontrado nesta meta.`);
        }
        this._aportes.splice(idx, 1);
        this.verificarEAtualizarStatus();
    }
    atualizarDados(nome, valorAlvo, prazo, icone, cor, descricao, prioridade) {
        if (nome)
            this._nome = nome;
        if (valorAlvo) {
            if (!valorAlvo.isPositive()) {
                throw new domain_exception_1.DomainException('O valor alvo da meta deve ser maior que zero.');
            }
            this._valorAlvo = valorAlvo;
        }
        if (prazo !== undefined)
            this._prazo = prazo;
        if (icone !== undefined)
            this._icone = icone;
        if (cor !== undefined)
            this._cor = cor;
        if (descricao !== undefined)
            this._descricao = descricao;
        if (prioridade !== undefined)
            this._prioridade = prioridade;
        this.verificarEAtualizarStatus();
    }
    cancelar() {
        this._status = 'CANCELADA';
    }
    verificarEAtualizarStatus() {
        if (this._status === 'CANCELADA' || this._status === 'PAUSADA') {
            return;
        }
        const acumulado = this.valorAcumulado;
        if (acumulado.maiorQue(this._valorAlvo) || acumulado.equals(this._valorAlvo)) {
            this._status = 'CONCLUIDA';
        }
        else if (this._status === 'CONCLUIDA') {
            this._status = 'ATIVA';
        }
    }
}
exports.MetaAggregate = MetaAggregate;
//# sourceMappingURL=meta.aggregate.js.map