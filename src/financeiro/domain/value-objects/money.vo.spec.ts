import { Money } from './money.vo';
import { InvalidMoneyException } from '../exceptions/invalid-money.exception';

describe('Money Value Object', () => {
  it('deve converter reais para centavos sem perda de precisão', () => {
    const money = Money.deReais(150.75);
    expect(money.valorEmCentavos).toBe(15075n);
    expect(money.paraReais()).toBe(150.75);
  });

  it('deve realizar somas de dinheiro corretamente', () => {
    const m1 = Money.deReais(100.20);
    const m2 = Money.deReais(50.80);
    const resultado = m1.somar(m2);
    expect(resultado.paraReais()).toBe(151.00);
  });

  it('deve realizar subtrações de dinheiro corretamente', () => {
    const m1 = Money.deReais(200.00);
    const m2 = Money.deReais(75.50);
    const resultado = m1.subtrair(m2);
    expect(resultado.paraReais()).toBe(124.50);
  });

  it('deve multiplicar por percentual em BigInt sem utilizar float', () => {
    const base = Money.deReais(1000.00);
    const comDesconto = base.multiplicarPorPercentual(15n); // 15%
    expect(comDesconto.paraReais()).toBe(150.00);
  });

  it('deve comparar valores monetários corretamente', () => {
    const m1 = Money.deReais(500);
    const m2 = Money.deReais(500);
    const m3 = Money.deReais(600);

    expect(m1.equals(m2)).toBe(true);
    expect(m3.maiorQue(m1)).toBe(true);
    expect(m1.menorQue(m3)).toBe(true);
  });

  it('deve lançar InvalidMoneyException se passar NaN ou Infinity', () => {
    expect(() => Money.deReais(NaN)).toThrow(InvalidMoneyException);
    expect(() => Money.deReais(Infinity)).toThrow(InvalidMoneyException);
  });
});
