"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjetoAggregate = void 0;
const domain_exception_1 = require("../../../financeiro/domain/exceptions/domain.exception");
class ProjetoAggregate {
    id;
    workspaceId;
    _nome;
    _descricao;
    _orcamentoEstimado;
    _status;
    _prioridade;
    _dataInicioPrevista;
    _dataFimPrevista;
    _dataConclusao;
    _versao;
    _ativo;
    _dataCriacao;
    _dataAtualizacao;
    _etapas;
    constructor(id, workspaceId, nome, descricao, orcamentoEstimado, status, prioridade, dataInicioPrevista, dataFimPrevista, dataConclusao, versao = 0, ativo = true, dataCriacao = new Date(), dataAtualizacao = new Date(), etapas = []) {
        this.id = id;
        this.workspaceId = workspaceId;
        if (!id || id.trim() === '') {
            throw new domain_exception_1.DomainException('ID do projeto é obrigatório.');
        }
        if (!workspaceId || workspaceId.trim() === '') {
            throw new domain_exception_1.DomainException('Workspace ID do projeto é obrigatório.');
        }
        if (!nome || nome.trim() === '') {
            throw new domain_exception_1.DomainException('Nome do projeto é obrigatório.');
        }
        this._nome = nome;
        this._descricao = descricao ?? null;
        this._orcamentoEstimado =
            orcamentoEstimado !== undefined && orcamentoEstimado !== null
                ? Number(orcamentoEstimado)
                : null;
        this._status = status;
        this._prioridade = prioridade;
        this._dataInicioPrevista = dataInicioPrevista ?? null;
        this._dataFimPrevista = dataFimPrevista ?? null;
        this._dataConclusao = dataConclusao ?? null;
        this._versao = versao;
        this._ativo = ativo;
        this._dataCriacao = dataCriacao;
        this._dataAtualizacao = dataAtualizacao;
        this.validarDatasTemporais(this._dataInicioPrevista, this._dataFimPrevista);
        this._etapas = [...etapas];
        for (const etapa of this._etapas) {
            if (etapa.projetoId !== this.id || etapa.workspaceId !== this.workspaceId) {
                throw new domain_exception_1.DomainException('Integridade Hierárquica violada: Etapa não pertence a este Projeto/Workspace.');
            }
        }
    }
    validarDatasTemporais(inicio, fim) {
        if (inicio && fim && fim.getTime() < inicio.getTime()) {
            throw new domain_exception_1.DomainException('A data de fim prevista não pode ser anterior à data de início prevista.');
        }
    }
    static criar(params) {
        const id = params.id || crypto.randomUUID();
        const agora = new Date();
        return new ProjetoAggregate(id, params.workspaceId, params.nome, params.descricao ?? null, params.orcamentoEstimado ?? null, 'PLANEJAMENTO', params.prioridade ?? 1, params.dataInicioPrevista ?? null, params.dataFimPrevista ?? null, null, 0, true, agora, agora, []);
    }
    static reconstituir(params) {
        return new ProjetoAggregate(params.id, params.workspaceId, params.nome, params.descricao ?? null, params.orcamentoEstimado ?? null, params.status, params.prioridade, params.dataInicioPrevista ?? null, params.dataFimPrevista ?? null, params.dataConclusao ?? null, params.versao ?? 0, params.ativo ?? true, params.dataCriacao ?? new Date(), params.dataAtualizacao ?? new Date(), params.etapas ?? []);
    }
    get nome() {
        return this._nome;
    }
    get descricao() {
        return this._descricao;
    }
    get orcamentoEstimado() {
        return this._orcamentoEstimado;
    }
    get status() {
        return this._status;
    }
    get prioridade() {
        return this._prioridade;
    }
    get dataInicioPrevista() {
        return this._dataInicioPrevista;
    }
    get dataFimPrevista() {
        return this._dataFimPrevista;
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
    get etapas() {
        return this._etapas;
    }
    incrementarVersao() {
        this._versao += 1;
        this._dataAtualizacao = new Date();
    }
    alterarStatus(novoStatus, agora = new Date()) {
        if (this._status === novoStatus) {
            return;
        }
        if (this._status === 'CONCLUIDO' || this._status === 'CANCELADO') {
            throw new domain_exception_1.DomainException(`Não é possível alterar o status de um projeto finalizado (${this._status}).`);
        }
        switch (this._status) {
            case 'PLANEJAMENTO':
                if (novoStatus !== 'EM_ANDAMENTO' && novoStatus !== 'CANCELADO') {
                    throw new domain_exception_1.DomainException(`Transição de status inválida: de ${this._status} para ${novoStatus}.`);
                }
                break;
            case 'EM_ANDAMENTO':
                if (novoStatus !== 'CONCLUIDO' &&
                    novoStatus !== 'PAUSADO' &&
                    novoStatus !== 'CANCELADO') {
                    throw new domain_exception_1.DomainException(`Transição de status inválida: de ${this._status} para ${novoStatus}.`);
                }
                break;
            case 'PAUSADO':
                if (novoStatus !== 'EM_ANDAMENTO' && novoStatus !== 'CANCELADO') {
                    throw new domain_exception_1.DomainException(`Transição de status inválida: de ${this._status} para ${novoStatus}.`);
                }
                break;
        }
        this._status = novoStatus;
        if (novoStatus === 'CONCLUIDO') {
            this._dataConclusao = agora;
        }
        this._dataAtualizacao = agora;
    }
    iniciar(agora = new Date()) {
        this.alterarStatus('EM_ANDAMENTO', agora);
    }
    pausar(agora = new Date()) {
        this.alterarStatus('PAUSADO', agora);
    }
    concluir(agora = new Date()) {
        this.alterarStatus('CONCLUIDO', agora);
    }
    cancelar(agora = new Date()) {
        this.alterarStatus('CANCELADO', agora);
    }
    atualizarDados(params) {
        const inicio = params.dataInicioPrevista !== undefined
            ? params.dataInicioPrevista
            : this._dataInicioPrevista;
        const fim = params.dataFimPrevista !== undefined
            ? params.dataFimPrevista
            : this._dataFimPrevista;
        this.validarDatasTemporais(inicio, fim);
        if (params.nome !== undefined) {
            if (!params.nome || params.nome.trim() === '') {
                throw new domain_exception_1.DomainException('Nome do projeto é obrigatório.');
            }
            this._nome = params.nome;
        }
        if (params.descricao !== undefined) {
            this._descricao = params.descricao;
        }
        if (params.orcamentoEstimado !== undefined) {
            this._orcamentoEstimado =
                params.orcamentoEstimado !== null ? Number(params.orcamentoEstimado) : null;
        }
        if (params.prioridade !== undefined) {
            this._prioridade = params.prioridade;
        }
        this._dataInicioPrevista = inicio;
        this._dataFimPrevista = fim;
        if (params.status !== undefined && params.status !== this._status) {
            this.alterarStatus(params.status);
        }
        this._dataAtualizacao = new Date();
    }
    adicionarEtapa(etapa) {
        if (etapa.projetoId !== this.id || etapa.workspaceId !== this.workspaceId) {
            throw new domain_exception_1.DomainException('Integridade Hierárquica violada: Etapa não pertence a este Projeto/Workspace.');
        }
        this._etapas.push(etapa);
        this._dataAtualizacao = new Date();
    }
    reordenarEtapas(etapasOrdenadas) {
        const mapOrdens = new Map(etapasOrdenadas.map((e) => [e.id, e.ordem]));
        for (const etapa of this._etapas) {
            if (mapOrdens.has(etapa.id)) {
                etapa.definirOrdem(mapOrdens.get(etapa.id));
            }
        }
        this._etapas.sort((a, b) => a.ordem - b.ordem);
        this._dataAtualizacao = new Date();
    }
    desativar() {
        this._ativo = false;
        this._dataAtualizacao = new Date();
    }
}
exports.ProjetoAggregate = ProjetoAggregate;
//# sourceMappingURL=projeto.aggregate.js.map