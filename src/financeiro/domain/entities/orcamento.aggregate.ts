import { Money } from '../value-objects/money.vo';
import { YearMonth } from '../value-objects/year-month.vo';
import { DomainException } from '../exceptions/domain.exception';

export class OrcamentoAggregate {
  private _teto: Money;

  constructor(
    readonly id: string,
    readonly workspaceId: string,
    readonly categoriaId: string,
    readonly competencia: YearMonth,
    teto: Money,
  ) {
    if (!id || !workspaceId || !categoriaId || !competencia) {
      throw new DomainException('Propriedades obrigatórias faltando para o Orçamento.');
    }
    if (!teto || !teto.isPositive()) {
      throw new DomainException('O teto do orçamento deve ser maior que zero.');
    }
    this._teto = teto;
  }

  get teto(): Money {
    return this._teto;
  }

  atualizarTeto(novoTeto: Money): void {
    if (!novoTeto || !novoTeto.isPositive()) {
      throw new DomainException('O teto do orçamento deve ser maior que zero.');
    }
    this._teto = novoTeto;
  }
}
