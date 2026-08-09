"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceAggregate = void 0;
const money_vo_1 = require("../../../domain/value-objects/money.vo");
const domain_exception_1 = require("../../../domain/exceptions/domain.exception");
class InvoiceAggregate {
    id;
    cartaoId;
    competencia;
    dataVencimento;
    _status;
    _parcelas;
    _carteiraId;
    _dataPagamento;
    constructor(id, cartaoId, competencia, dataVencimento, status = 'ABERTA', parcelas = [], carteiraId, dataPagamento) {
        this.id = id;
        this.cartaoId = cartaoId;
        this.competencia = competencia;
        this.dataVencimento = dataVencimento;
        if (!id || !cartaoId || !competencia || !dataVencimento) {
            throw new domain_exception_1.DomainException('Propriedades obrigatórias faltando para a Fatura.');
        }
        this._status = status;
        this._parcelas = [...parcelas];
        this._carteiraId = carteiraId;
        this._dataPagamento = dataPagamento;
    }
    get status() {
        return this._status;
    }
    get parcelas() {
        return this._parcelas;
    }
    get carteiraId() {
        return this._carteiraId;
    }
    get dataPagamento() {
        return this._dataPagamento;
    }
    get valorTotal() {
        return this._parcelas
            .filter((p) => p.status === 'FATURADA' || p.status === 'PENDENTE')
            .reduce((acc, p) => acc.somar(p.valor), money_vo_1.Money.zero());
    }
    fechar() {
        if (this._status !== 'ABERTA') {
            throw new domain_exception_1.DomainException(`A fatura ${this.id} não está ABERTA para ser FECHADA. Status atual: ${this._status}`);
        }
        this._status = 'FECHADA';
        this._parcelas = this._parcelas.map((p) => {
            if (p.status === 'PENDENTE') {
                return { ...p, status: 'FATURADA' };
            }
            return p;
        });
    }
    pagar(carteiraId, dataPagamento = new Date()) {
        if (this._status === 'PAGA') {
            throw new domain_exception_1.DomainException('A fatura já se encontra PAGA.');
        }
        if (!carteiraId) {
            throw new domain_exception_1.DomainException('É necessário informar a carteira pagadora para quitar a fatura.');
        }
        this._status = 'PAGA';
        this._carteiraId = carteiraId;
        this._dataPagamento = dataPagamento;
        this._parcelas = this._parcelas.map((p) => ({
            ...p,
            status: 'PAGA',
        }));
    }
    adicionarParcela(parcela) {
        if (this._status !== 'ABERTA') {
            throw new domain_exception_1.DomainException(`Não é possível adicionar compras/parcelas à fatura ${this.id} pois seu status é ${this._status}.`);
        }
        this._parcelas.push(parcela);
    }
    cancelarParcela(parcelaId) {
        if (this._status === 'PAGA') {
            throw new domain_exception_1.DomainException('Não é possível cancelar parcelas de uma fatura já PAGA.');
        }
        const idx = this._parcelas.findIndex((p) => p.id === parcelaId);
        if (idx === -1) {
            throw new domain_exception_1.DomainException(`Parcela ${parcelaId} não encontrada nesta fatura.`);
        }
        if (this._status === 'ABERTA') {
            this._parcelas.splice(idx, 1);
        }
        else if (this._status === 'FECHADA') {
            this._parcelas[idx] = {
                ...this._parcelas[idx],
                status: 'CANCELADA',
            };
        }
    }
}
exports.InvoiceAggregate = InvoiceAggregate;
//# sourceMappingURL=invoice.aggregate.js.map