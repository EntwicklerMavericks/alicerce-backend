import { PrecoObservado } from './preco-observado.vo';
import { DomainException } from '../../../domain/exceptions/domain.exception';
import { Money } from '../../../domain/value-objects/money.vo';

describe('PrecoObservado VO', () => {
  it('deve criar um PrecoObservado válido para valores maiores que zero', () => {
    const preco = PrecoObservado.deReais(29.99);
    expect(preco.paraReais()).toBe(29.99);
    expect(preco.money.equals(Money.deReais(29.99))).toBe(true);
  });

  it('deve lançar DomainException se o valor for igual a zero', () => {
    expect(() => PrecoObservado.deReais(0)).toThrow(DomainException);
  });

  it('deve lançar DomainException se o valor for menor que zero (negativo)', () => {
    expect(() => PrecoObservado.deReais(-10.5)).toThrow(DomainException);
  });

  it('deve comparar preços usando equals, maiorQue e menorQue', () => {
    const p1 = PrecoObservado.deReais(100);
    const p2 = PrecoObservado.deReais(100);
    const p3 = PrecoObservado.deReais(150);

    expect(p1.equals(p2)).toBe(true);
    expect(p3.maiorQue(p1)).toBe(true);
    expect(p1.menorQue(p3)).toBe(true);
  });
});
