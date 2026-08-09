import { MetaAggregate } from './meta.aggregate';
import { Money } from '../value-objects/money.vo';
import { YearMonth } from '../value-objects/year-month.vo';
import { DomainException } from '../exceptions/domain.exception';

describe('MetaAggregate', () => {
  const validMetaParams = {
    id: 'meta-1',
    workspaceId: 'ws-1',
    nome: 'Viagem Japão',
    valorAlvo: Money.deReais(10000),
    prazo: YearMonth.deAnoMes(2026, 12),
  };

  it('deve criar uma meta válida com valorAcumulado derivado zerado', () => {
    const meta = new MetaAggregate(
      validMetaParams.id,
      validMetaParams.workspaceId,
      validMetaParams.nome,
      validMetaParams.valorAlvo,
      validMetaParams.prazo,
    );

    expect(meta.id).toBe('meta-1');
    expect(meta.nome).toBe('Viagem Japão');
    expect(meta.valorAlvo.equals(Money.deReais(10000))).toBe(true);
    expect(meta.valorAcumulado.equals(Money.zero())).toBe(true);
    expect(meta.status).toBe('ATIVA');
  });

  it('deve lançar exceção se valorAlvo <= 0', () => {
    expect(() => {
      new MetaAggregate(
        validMetaParams.id,
        validMetaParams.workspaceId,
        validMetaParams.nome,
        Money.zero(),
      );
    }).toThrow(DomainException);
  });

  it('deve calcular valorAcumulado 100% derivado da soma dos aportes', () => {
    const meta = new MetaAggregate(
      validMetaParams.id,
      validMetaParams.workspaceId,
      validMetaParams.nome,
      validMetaParams.valorAlvo,
      validMetaParams.prazo,
    );

    meta.adicionarAporte('ap-1', Money.deReais(2000), new Date(), 'Primeiro aporte');
    expect(meta.valorAcumulado.equals(Money.deReais(2000))).toBe(true);

    meta.adicionarAporte('ap-2', Money.deReais(3000), new Date(), 'Segundo aporte');
    expect(meta.valorAcumulado.equals(Money.deReais(5000))).toBe(true);
    expect(meta.status).toBe('ATIVA');
  });

  it('deve transicionar automaticamente o status para CONCLUIDA quando valorAcumulado >= valorAlvo', () => {
    const meta = new MetaAggregate(
      validMetaParams.id,
      validMetaParams.workspaceId,
      validMetaParams.nome,
      validMetaParams.valorAlvo,
      validMetaParams.prazo,
    );

    meta.adicionarAporte('ap-1', Money.deReais(5000));
    expect(meta.status).toBe('ATIVA');

    meta.adicionarAporte('ap-2', Money.deReais(5000));
    expect(meta.valorAcumulado.equals(Money.deReais(10000))).toBe(true);
    expect(meta.status).toBe('CONCLUIDA');
  });

  it('deve retornar status para ATIVA se um aporte for removido e valorAcumulado ficar < valorAlvo', () => {
    const meta = new MetaAggregate(
      validMetaParams.id,
      validMetaParams.workspaceId,
      validMetaParams.nome,
      validMetaParams.valorAlvo,
      validMetaParams.prazo,
    );

    meta.adicionarAporte('ap-1', Money.deReais(10000));
    expect(meta.status).toBe('CONCLUIDA');

    meta.removerAporte('ap-1');
    expect(meta.valorAcumulado.equals(Money.zero())).toBe(true);
    expect(meta.status).toBe('ATIVA');
  });

  it('deve rejeitar aporte com valor <= 0', () => {
    const meta = new MetaAggregate(
      validMetaParams.id,
      validMetaParams.workspaceId,
      validMetaParams.nome,
      validMetaParams.valorAlvo,
    );

    expect(() => {
      meta.adicionarAporte('ap-1', Money.zero());
    }).toThrow(DomainException);
  });
});
