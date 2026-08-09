import { TempoEsfriamentoVO } from './tempo-esfriamento.vo';
import { DomainException } from '../../../domain/exceptions/domain.exception';

describe('TempoEsfriamentoVO', () => {
  it('deve criar uma instância válida com dias dentro do intervalo 1..365', () => {
    const vo1 = new TempoEsfriamentoVO(1);
    expect(vo1.dias).toBe(1);

    const vo7 = new TempoEsfriamentoVO(7);
    expect(vo7.dias).toBe(7);

    const vo365 = new TempoEsfriamentoVO(365);
    expect(vo365.dias).toBe(365);
  });

  it('deve lançar DomainException para valores menores que 1', () => {
    expect(() => new TempoEsfriamentoVO(0)).toThrow(DomainException);
    expect(() => new TempoEsfriamentoVO(-5)).toThrow(DomainException);
  });

  it('deve lançar DomainException para valores maiores que 365', () => {
    expect(() => new TempoEsfriamentoVO(366)).toThrow(DomainException);
    expect(() => new TempoEsfriamentoVO(400)).toThrow(DomainException);
  });

  it('deve lançar DomainException para valores não inteiros', () => {
    expect(() => new TempoEsfriamentoVO(7.5)).toThrow(DomainException);
  });

  it('deve calcular a data de fim corretamente a partir da data de início', () => {
    const vo = new TempoEsfriamentoVO(7);
    const inicio = new Date('2026-08-01T10:00:00.000Z');
    const fim = vo.calcularDataFim(inicio);

    expect(fim.toISOString()).toBe('2026-08-08T10:00:00.000Z');
  });

  it('deve comparar igualdade de dois value objects', () => {
    const vo1 = new TempoEsfriamentoVO(14);
    const vo2 = new TempoEsfriamentoVO(14);
    const vo3 = new TempoEsfriamentoVO(30);

    expect(vo1.equals(vo2)).toBe(true);
    expect(vo1.equals(vo3)).toBe(false);
    expect(vo1.equals(undefined)).toBe(false);
  });
});
