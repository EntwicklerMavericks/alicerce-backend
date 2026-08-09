import { InvoiceAggregate } from './invoice.aggregate';
import { Money } from '../../../domain/value-objects/money.vo';
import { YearMonth } from '../../../domain/value-objects/year-month.vo';

describe('InvoiceAggregate (Domain Aggregate)', () => {
  const competencia = YearMonth.deAnoMes(2026, 8);
  const vencimento = new Date(2026, 7, 5);

  it('deve calcular valorTotal dinamicamente como getter derivado de SUM(parcelas.valor)', () => {
    const fatura = new InvoiceAggregate('fat-1', 'cartao-1', competencia, vencimento, 'ABERTA', [
      {
        id: 'p-1',
        compraId: 'c-1',
        numero: 1,
        valor: Money.deReais(250),
        competencia,
        status: 'PENDENTE',
      },
      {
        id: 'p-2',
        compraId: 'c-2',
        numero: 1,
        valor: Money.deReais(150),
        competencia,
        status: 'PENDENTE',
      },
    ]);

    expect(fatura.valorTotal.paraReais()).toBe(400);
  });

  it('deve fechar fatura ABERTA alterando status para FECHADA', () => {
    const fatura = new InvoiceAggregate('fat-1', 'cartao-1', competencia, vencimento, 'ABERTA');
    fatura.fechar();
    expect(fatura.status).toBe('FECHADA');
  });

  it('deve recusar fechar fatura que já não esteja ABERTA', () => {
    const fatura = new InvoiceAggregate('fat-1', 'cartao-1', competencia, vencimento, 'FECHADA');
    expect(() => fatura.fechar()).toThrow();
  });

  it('deve pagar fatura alterando status para PAGA e definindo carteira pagadora', () => {
    const fatura = new InvoiceAggregate('fat-1', 'cartao-1', competencia, vencimento, 'FECHADA');
    fatura.pagar('cart-1', new Date());
    expect(fatura.status).toBe('PAGA');
    expect(fatura.carteiraId).toBe('cart-1');
  });

  it('deve recusar adicionar parcela a uma fatura FECHADA', () => {
    const fatura = new InvoiceAggregate('fat-1', 'cartao-1', competencia, vencimento, 'FECHADA');
    expect(() =>
      fatura.adicionarParcela({
        id: 'p-3',
        compraId: 'c-3',
        numero: 1,
        valor: Money.deReais(100),
        competencia,
        status: 'PENDENTE',
      }),
    ).toThrow();
  });

  it('deve excluir parcela ao cancelar em fatura ABERTA', () => {
    const fatura = new InvoiceAggregate('fat-1', 'cartao-1', competencia, vencimento, 'ABERTA', [
      {
        id: 'p-1',
        compraId: 'c-1',
        numero: 1,
        valor: Money.deReais(200),
        competencia,
        status: 'PENDENTE',
      },
    ]);

    fatura.cancelarParcela('p-1');
    expect(fatura.parcelas.length).toBe(0);
    expect(fatura.valorTotal.paraReais()).toBe(0);
  });
});
