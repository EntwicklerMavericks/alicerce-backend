"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerEntry = void 0;
const invalid_ledger_entry_exception_1 = require("../../domain/exceptions/invalid-ledger-entry.exception");
const client_1 = require("@prisma/client");
class LedgerEntry {
    id;
    workspaceId;
    carteiraId;
    criadoPorId;
    tipo;
    valor;
    data;
    referenciaTipo;
    referenciaId;
    origem;
    observacao;
    constructor(id, workspaceId, carteiraId, criadoPorId, tipo, valor, data, referenciaTipo, referenciaId, origem = client_1.OrigemMovimentacao.MANUAL, observacao) {
        this.id = id;
        this.workspaceId = workspaceId;
        this.carteiraId = carteiraId;
        this.criadoPorId = criadoPorId;
        this.tipo = tipo;
        this.valor = valor;
        this.data = data;
        this.referenciaTipo = referenciaTipo;
        this.referenciaId = referenciaId;
        this.origem = origem;
        this.observacao = observacao;
        if (!workspaceId) {
            throw new invalid_ledger_entry_exception_1.InvalidLedgerEntryException('O lançamento no Ledger exige um workspaceId válido.');
        }
        if (!carteiraId && tipo !== client_1.TipoMovimentacao.AJUSTE) {
            throw new invalid_ledger_entry_exception_1.InvalidLedgerEntryException('O lançamento no Ledger exige uma carteiraId.');
        }
        if (valor.isZeroOrNegative()) {
            throw new invalid_ledger_entry_exception_1.InvalidLedgerEntryException('O valor do lançamento no Ledger deve ser estritamente maior que zero.');
        }
        if (!referenciaId) {
            throw new invalid_ledger_entry_exception_1.InvalidLedgerEntryException('O lançamento no Ledger exige uma referenciaId.');
        }
    }
    static criar(params) {
        return new LedgerEntry(params.id || crypto.randomUUID(), params.workspaceId, params.carteiraId, params.criadoPorId || null, params.tipo, params.valor, params.data || new Date(), params.referenciaTipo, params.referenciaId, params.origem || client_1.OrigemMovimentacao.MANUAL, params.observacao);
    }
}
exports.LedgerEntry = LedgerEntry;
//# sourceMappingURL=ledger-entry.js.map