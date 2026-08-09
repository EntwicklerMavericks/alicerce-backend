import { Money } from '../../domain/value-objects/money.vo';
import { InvalidLedgerEntryException } from '../../domain/exceptions/invalid-ledger-entry.exception';
import { TipoMovimentacao, ReferenciaTipoMovimentacao, OrigemMovimentacao } from '@prisma/client';

export class LedgerEntry {
  constructor(
    readonly id: string,
    readonly workspaceId: string,
    readonly carteiraId: string,
    readonly criadoPorId: string | null,
    readonly tipo: TipoMovimentacao,
    readonly valor: Money,
    readonly data: Date,
    readonly referenciaTipo: ReferenciaTipoMovimentacao,
    readonly referenciaId: string,
    readonly origem: OrigemMovimentacao = OrigemMovimentacao.MANUAL,
    readonly observacao?: string,
  ) {
    if (!workspaceId) {
      throw new InvalidLedgerEntryException('O lançamento no Ledger exige um workspaceId válido.');
    }
    if (!carteiraId && tipo !== TipoMovimentacao.AJUSTE) {
      throw new InvalidLedgerEntryException('O lançamento no Ledger exige uma carteiraId.');
    }
    if (valor.isZeroOrNegative()) {
      throw new InvalidLedgerEntryException('O valor do lançamento no Ledger deve ser estritamente maior que zero.');
    }
    if (!referenciaId) {
      throw new InvalidLedgerEntryException('O lançamento no Ledger exige uma referenciaId.');
    }
  }

  static criar(params: {
    id?: string;
    workspaceId: string;
    carteiraId: string;
    criadoPorId?: string | null;
    tipo: TipoMovimentacao;
    valor: Money;
    data?: Date;
    referenciaTipo: ReferenciaTipoMovimentacao;
    referenciaId: string;
    origem?: OrigemMovimentacao;
    observacao?: string;
  }): LedgerEntry {
    return new LedgerEntry(
      params.id || crypto.randomUUID(),
      params.workspaceId,
      params.carteiraId,
      params.criadoPorId || null,
      params.tipo,
      params.valor,
      params.data || new Date(),
      params.referenciaTipo,
      params.referenciaId,
      params.origem || OrigemMovimentacao.MANUAL,
      params.observacao,
    );
  }
}
