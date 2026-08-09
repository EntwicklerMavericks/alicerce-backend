import { InvalidMoneyException } from '../exceptions/invalid-money.exception';

export class Money {
  private constructor(readonly valorEmCentavos: bigint) {}

  static deReais(valor: number): Money {
    if (isNaN(valor) || !isFinite(valor)) {
      throw new InvalidMoneyException('O valor numérico informado para Money é inválido.');
    }
    const centavos = BigInt(Math.round(valor * 100));
    return new Money(centavos);
  }

  static deCentavos(centavos: bigint): Money {
    return new Money(centavos);
  }

  static zero(): Money {
    return new Money(0n);
  }

  paraReais(): number {
    return Number(this.valorEmCentavos) / 100;
  }

  somar(outro: Money): Money {
    return new Money(this.valorEmCentavos + outro.valorEmCentavos);
  }

  subtrair(outro: Money): Money {
    return new Money(this.valorEmCentavos - outro.valorEmCentavos);
  }

  /** Multiplica por porcentagem inteira (ex: 15n = 15%). Operação sem ponto flutuante. */
  multiplicarPorPercentual(percentual: bigint): Money {
    return new Money((this.valorEmCentavos * percentual) / 100n);
  }

  /** Multiplica por um fator inteiro (ex: 3n parcelas). */
  multiplicarPorInteiro(fator: bigint): Money {
    return new Money(this.valorEmCentavos * fator);
  }

  isZero(): boolean {
    return this.valorEmCentavos === 0n;
  }

  isNegative(): boolean {
    return this.valorEmCentavos < 0n;
  }

  isPositive(): boolean {
    return this.valorEmCentavos > 0n;
  }

  isZeroOrNegative(): boolean {
    return this.valorEmCentavos <= 0n;
  }

  equals(outro: Money): boolean {
    return this.valorEmCentavos === outro.valorEmCentavos;
  }

  maiorQue(outro: Money): boolean {
    return this.valorEmCentavos > outro.valorEmCentavos;
  }

  menorQue(outro: Money): boolean {
    return this.valorEmCentavos < outro.valorEmCentavos;
  }
}
