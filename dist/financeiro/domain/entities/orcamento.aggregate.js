"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrcamentoAggregate = void 0;
const domain_exception_1 = require("../exceptions/domain.exception");
class OrcamentoAggregate {
    id;
    workspaceId;
    categoriaId;
    competencia;
    _teto;
    constructor(id, workspaceId, categoriaId, competencia, teto) {
        this.id = id;
        this.workspaceId = workspaceId;
        this.categoriaId = categoriaId;
        this.competencia = competencia;
        if (!id || !workspaceId || !categoriaId || !competencia) {
            throw new domain_exception_1.DomainException('Propriedades obrigatórias faltando para o Orçamento.');
        }
        if (!teto || !teto.isPositive()) {
            throw new domain_exception_1.DomainException('O teto do orçamento deve ser maior que zero.');
        }
        this._teto = teto;
    }
    get teto() {
        return this._teto;
    }
    atualizarTeto(novoTeto) {
        if (!novoTeto || !novoTeto.isPositive()) {
            throw new domain_exception_1.DomainException('O teto do orçamento deve ser maior que zero.');
        }
        this._teto = novoTeto;
    }
}
exports.OrcamentoAggregate = OrcamentoAggregate;
//# sourceMappingURL=orcamento.aggregate.js.map