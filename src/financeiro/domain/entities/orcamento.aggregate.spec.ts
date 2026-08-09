import { OrcamentoAggregate } from './orcamento.aggregate';
import { Money } from '../value-objects/money.vo';
import { YearMonth } from '../value-objects/year-month.vo';
import { DomainException } from '../exceptions/domain.exception';

describe('OrcamentoAggregate', () => {
  const validParams = {
    id: 'orc-1',
    workspaceId: 'ws-1',
    categoriaId: 'cat-1',
    competencia: YearMonth.deAnoMes(2026, 8),
    teto: Money.deReais(1500),
  };

  it('deve criar um orçamento válido com teto > 0', () => {
    const orcamento = new OrcamentoAggregate(
      validParams.id,
      validParams.workspaceId,
      validParams.categoriaId,
      validParams.competencia,
      validParams.teto,
    );

    expect(orcamento.id).toBe('orc-1');
    expect(orcamento.workspaceId).toBe('ws-1');
    expect(orcamento.categoriaId).toBe('cat-1');
    expect(orcamento.competencia.ano).toBe(2026);
    expect(orcamento.competencia.mes).toBe(8);
    expect(orcamento.teto.equals(Money.deReais(1500))).toBe(true);
  });

  it('deve lançar DomainException se o teto for zero', () => {
    expect(() => {
      new OrcamentoAggregate(
        validParams.id,
        validParams.workspaceId,
        validParams.categoriaId,
        validParams.competencia,
        Money.zero(),
      );
    }).toThrow(DomainException);
  });

  it('deve lançar DomainException se o teto for negativo', () => {
    expect(() => {
      new OrcamentoAggregate(
        validParams.id,
        validParams.workspaceId,
        validParams.categoriaId,
        validParams.competencia,
        Money.deReais(-100),
      );
    }).toThrow(DomainException);
  });

  it('deve atualizar o teto com um valor válido', () => {
    const orcamento = new OrcamentoAggregate(
      validParams.id,
      validParams.workspaceId,
      validParams.categoriaId,
      validParams.competencia,
      validParams.teto,
    );

    orcamento.atualizarTeto(Money.deReais(2000));
    expect(orcamento.teto.equals(Money.deReais(2000))).toBe(true);
  });

  it('deve recusar atualização de teto para valor <= 0', () => {
    const orcamento = new OrcamentoAggregate(
      validParams.id,
      validParams.workspaceId,
      validParams.categoriaId,
      validParams.competencia,
      validParams.teto,
    );

    expect(() => {
      orcamento.atualizarTeto(Money.zero());
    }).toThrow(DomainException);
  });
});
