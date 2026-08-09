import { CalculadoraEsforcoMetaService } from './calculadora-esforco-meta.service';
import { Money } from '../value-objects/money.vo';
import { YearMonth } from '../value-objects/year-month.vo';

describe('CalculadoraEsforcoMetaService', () => {
  let service: CalculadoraEsforcoMetaService;

  beforeEach(() => {
    service = new CalculadoraEsforcoMetaService();
  });

  it('deve calcular esforço mensal corretamente para meta dentro do prazo (5 meses)', () => {
    const valorAlvo = Money.deReais(10000);
    const valorAcumulado = Money.deReais(2000);
    const prazo = YearMonth.deAnoMes(2026, 12);
    const competenciaAtual = YearMonth.deAnoMes(2026, 8); // Ago, Set, Out, Nov, Dez = 5 meses

    const resultado = service.calcularEsforcoMensal(
      valorAlvo,
      valorAcumulado,
      prazo,
      competenciaAtual,
    );

    expect(resultado.mesesRestantes).toBe(5);
    // Falta R$ 8000 / 5 meses = R$ 1600/mês
    expect(resultado.valorMensalNecessario.equals(Money.deReais(1600))).toBe(true);
    expect(resultado.noPrazo).toBe(true);
  });

  it('deve retornar valorMensalNecessario zerado se a meta já estiver atingida', () => {
    const valorAlvo = Money.deReais(5000);
    const valorAcumulado = Money.deReais(5000);
    const prazo = YearMonth.deAnoMes(2026, 10);
    const competenciaAtual = YearMonth.deAnoMes(2026, 8);

    const resultado = service.calcularEsforcoMensal(
      valorAlvo,
      valorAcumulado,
      prazo,
      competenciaAtual,
    );

    expect(resultado.valorMensalNecessario.equals(Money.zero())).toBe(true);
    expect(resultado.noPrazo).toBe(true);
  });

  it('deve marcar noPrazo = false se a meta estiver vencida (prazo no passado)', () => {
    const valorAlvo = Money.deReais(5000);
    const valorAcumulado = Money.deReais(1000);
    const prazo = YearMonth.deAnoMes(2026, 6); // passado
    const competenciaAtual = YearMonth.deAnoMes(2026, 8);

    const resultado = service.calcularEsforcoMensal(
      valorAlvo,
      valorAcumulado,
      prazo,
      competenciaAtual,
    );

    expect(resultado.mesesRestantes).toBe(0);
    expect(resultado.noPrazo).toBe(false);
    expect(resultado.valorMensalNecessario.equals(Money.deReais(4000))).toBe(true);
  });

  it('deve tratar metas sem prazo (prazo = null)', () => {
    const valorAlvo = Money.deReais(3000);
    const valorAcumulado = Money.deReais(1000);
    const competenciaAtual = YearMonth.deAnoMes(2026, 8);

    const resultado = service.calcularEsforcoMensal(
      valorAlvo,
      valorAcumulado,
      null,
      competenciaAtual,
    );

    expect(resultado.mesesRestantes).toBe(0);
    expect(resultado.noPrazo).toBe(true);
    expect(resultado.valorMensalNecessario.equals(Money.deReais(2000))).toBe(true);
  });
});
