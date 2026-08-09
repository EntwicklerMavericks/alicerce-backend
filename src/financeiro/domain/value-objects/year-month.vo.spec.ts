import { YearMonth } from './year-month.vo';

describe('YearMonth Value Object', () => {
  it('deve instanciar uma competência válida', () => {
    const ym = YearMonth.deAnoMes(2026, 8);
    expect(ym.ano).toBe(2026);
    expect(ym.mes).toBe(8);
    expect(ym.formatarISO()).toBe('2026-08');
    expect(ym.formatarExibicao()).toBe('08/2026');
  });

  it('deve lancar erro para ano invalido', () => {
    expect(() => YearMonth.deAnoMes(1999, 5)).toThrow();
    expect(() => YearMonth.deAnoMes(2105, 5)).toThrow();
  });

  it('deve lancar erro para mes invalido', () => {
    expect(() => YearMonth.deAnoMes(2026, 0)).toThrow();
    expect(() => YearMonth.deAnoMes(2026, 13)).toThrow();
  });

  it('deve calcular a proxima competencia (virada de ano)', () => {
    const ym = YearMonth.deAnoMes(2026, 12);
    const prox = ym.obterProxima();
    expect(prox.ano).toBe(2027);
    expect(prox.mes).toBe(1);
  });

  it('deve calcular a competencia anterior (virada de ano)', () => {
    const ym = YearMonth.deAnoMes(2026, 1);
    const ant = ym.obterAnterior();
    expect(ant.ano).toBe(2025);
    expect(ant.mes).toBe(12);
  });

  it('deve adicionar N meses corretamente', () => {
    const ym = YearMonth.deAnoMes(2026, 8);
    const futuro = ym.adicionarMeses(5);
    expect(futuro.formatarISO()).toBe('2027-01');
  });

  it('deve comparar duas competencias com equals', () => {
    const ym1 = YearMonth.deAnoMes(2026, 8);
    const ym2 = YearMonth.deAnoMes(2026, 8);
    const ym3 = YearMonth.deAnoMes(2026, 9);
    expect(ym1.equals(ym2)).toBe(true);
    expect(ym1.equals(ym3)).toBe(false);
  });

  it('deve instanciar a partir de uma data', () => {
    const data = new Date(2026, 7, 15); // Agosto é mês 7 no JS Date
    const ym = YearMonth.daData(data);
    expect(ym.formatarISO()).toBe('2026-08');
  });

  it('deve instanciar a partir de string ISO', () => {
    const ym = YearMonth.deStringISO('2026-08');
    expect(ym.ano).toBe(2026);
    expect(ym.mes).toBe(8);
  });
});
