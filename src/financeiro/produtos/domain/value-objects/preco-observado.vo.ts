import { Money } from '../../../domain/value-objects/money.vo';
import { DomainException } from '../../../domain/exceptions/domain.exception';

export class PrecoObservado {
  private constructor(readonly money: Money) {
    if (!money || money.isZeroOrNegative()) {
      throw new DomainException('O valor do preço observado deve ser maior que zero.');
    }
  }

  static deReais(valor: number): PrecoObservado {
    const money = Money.deReais(valor);
    return new PrecoObservado(money);
  }

  static deMoney(money: Money): PrecoObservado {
    return new PrecoObservado(money);
  }

  paraReais(): number {
    return this.money.paraReais();
  }

  equals(outro: PrecoObservado): boolean {
    return this.money.equals(outro.money);
  }

  maiorQue(outro: PrecoObservado): boolean {
    return this.money.maiorQue(outro.money);
  }

  menorQue(outro: PrecoObservado): boolean {
    return this.money.menorQue(outro.money);
  }
}
