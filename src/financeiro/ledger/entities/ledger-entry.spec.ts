import { LedgerEntry } from './ledger-entry';
import { Money } from '../../domain/value-objects/money.vo';
import { InvalidLedgerEntryException } from '../../domain/exceptions/invalid-ledger-entry.exception';
import { TipoMovimentacao, ReferenciaTipoMovimentacao } from '@prisma/client';

describe('LedgerEntry Domain Entity', () => {
  it('deve instanciar um LedgerEntry válido', () => {
    const entry = LedgerEntry.criar({
      workspaceId: 'ws-123',
      carteiraId: 'cart-123',
      tipo: TipoMovimentacao.RECEITA,
      valor: Money.deReais(500.00),
      referenciaTipo: ReferenciaTipoMovimentacao.RECEITA,
      referenciaId: 'rec-123',
    });

    expect(entry.workspaceId).toBe('ws-123');
    expect(entry.carteiraId).toBe('cart-123');
    expect(entry.valor.paraReais()).toBe(500.00);
    expect(entry.referenciaTipo).toBe(ReferenciaTipoMovimentacao.RECEITA);
  });

  it('deve lançar InvalidLedgerEntryException se valor for <= 0', () => {
    expect(() => {
      LedgerEntry.criar({
        workspaceId: 'ws-123',
        carteiraId: 'cart-123',
        tipo: TipoMovimentacao.RECEITA,
        valor: Money.deReais(0),
        referenciaTipo: ReferenciaTipoMovimentacao.RECEITA,
        referenciaId: 'rec-123',
      });
    }).toThrow(InvalidLedgerEntryException);
  });

  it('deve lançar InvalidLedgerEntryException se workspaceId estiver vazio', () => {
    expect(() => {
      LedgerEntry.criar({
        workspaceId: '',
        carteiraId: 'cart-123',
        tipo: TipoMovimentacao.RECEITA,
        valor: Money.deReais(100),
        referenciaTipo: ReferenciaTipoMovimentacao.RECEITA,
        referenciaId: 'rec-123',
      });
    }).toThrow(InvalidLedgerEntryException);
  });

  it('deve lançar InvalidLedgerEntryException se referenciaId estiver vazia', () => {
    expect(() => {
      LedgerEntry.criar({
        workspaceId: 'ws-123',
        carteiraId: 'cart-123',
        tipo: TipoMovimentacao.RECEITA,
        valor: Money.deReais(100),
        referenciaTipo: ReferenciaTipoMovimentacao.RECEITA,
        referenciaId: '',
      });
    }).toThrow(InvalidLedgerEntryException);
  });
});
