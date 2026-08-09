import { Money } from '../../../domain/value-objects/money.vo';
import { YearMonth } from '../../../domain/value-objects/year-month.vo';
import { DomainException } from '../../../domain/exceptions/domain.exception';

export type StatusFaturaDomain = 'ABERTA' | 'FECHADA' | 'PAGA';
export type StatusParcelaDomain = 'PENDENTE' | 'FATURADA' | 'PAGA' | 'CANCELADA';

export interface ParcelaCartaoItem {
  id: string;
  compraId: string;
  numero: number;
  valor: Money;
  competencia: YearMonth;
  status: StatusParcelaDomain;
}

export class InvoiceAggregate {
  private _status: StatusFaturaDomain;
  private _parcelas: ParcelaCartaoItem[];
  private _carteiraId?: string;
  private _dataPagamento?: Date;

  constructor(
    readonly id: string,
    readonly cartaoId: string,
    readonly competencia: YearMonth,
    readonly dataVencimento: Date,
    status: StatusFaturaDomain = 'ABERTA',
    parcelas: ParcelaCartaoItem[] = [],
    carteiraId?: string,
    dataPagamento?: Date,
  ) {
    if (!id || !cartaoId || !competencia || !dataVencimento) {
      throw new DomainException('Propriedades obrigatórias faltando para a Fatura.');
    }
    this._status = status;
    this._parcelas = [...parcelas];
    this._carteiraId = carteiraId;
    this._dataPagamento = dataPagamento;
  }

  get status(): StatusFaturaDomain {
    return this._status;
  }

  get parcelas(): ReadonlyArray<ParcelaCartaoItem> {
    return this._parcelas;
  }

  get carteiraId(): string | undefined {
    return this._carteiraId;
  }

  get dataPagamento(): Date | undefined {
    return this._dataPagamento;
  }

  /**
   * INVARIANTE CONTÁBIL:
   * O valorTotal da fatura é 100% derivado da soma das parcelas ativas (FATURADA/PENDENTE).
   * Nunca existe um valor estático solto ou dessincronizado no banco.
   */
  get valorTotal(): Money {
    return this._parcelas
      .filter((p) => p.status === 'FATURADA' || p.status === 'PENDENTE')
      .reduce((acc, p) => acc.somar(p.valor), Money.zero());
  }

  fechar(): void {
    if (this._status !== 'ABERTA') {
      throw new DomainException(`A fatura ${this.id} não está ABERTA para ser FECHADA. Status atual: ${this._status}`);
    }
    this._status = 'FECHADA';
    // Atualiza status das parcelas para FATURADA
    this._parcelas = this._parcelas.map((p) => {
      if (p.status === 'PENDENTE') {
        return { ...p, status: 'FATURADA' };
      }
      return p;
    });
  }

  pagar(carteiraId: string, dataPagamento: Date = new Date()): void {
    if (this._status === 'PAGA') {
      throw new DomainException('A fatura já se encontra PAGA.');
    }
    if (!carteiraId) {
      throw new DomainException('É necessário informar a carteira pagadora para quitar a fatura.');
    }
    this._status = 'PAGA';
    this._carteiraId = carteiraId;
    this._dataPagamento = dataPagamento;

    // Atualiza status das parcelas para PAGA
    this._parcelas = this._parcelas.map((p) => ({
      ...p,
      status: 'PAGA' as StatusParcelaDomain,
    }));
  }

  adicionarParcela(parcela: ParcelaCartaoItem): void {
    if (this._status !== 'ABERTA') {
      throw new DomainException(
        `Não é possível adicionar compras/parcelas à fatura ${this.id} pois seu status é ${this._status}.`,
      );
    }
    this._parcelas.push(parcela);
  }

  cancelarParcela(parcelaId: string): void {
    if (this._status === 'PAGA') {
      throw new DomainException('Não é possível cancelar parcelas de uma fatura já PAGA.');
    }
    const idx = this._parcelas.findIndex((p) => p.id === parcelaId);
    if (idx === -1) {
      throw new DomainException(`Parcela ${parcelaId} não encontrada nesta fatura.`);
    }

    if (this._status === 'ABERTA') {
      // Remove diretamente a parcela da fatura aberta
      this._parcelas.splice(idx, 1);
    } else if (this._status === 'FECHADA') {
      // Marca como cancelada na fatura fechada
      this._parcelas[idx] = {
        ...this._parcelas[idx],
        status: 'CANCELADA',
      };
    }
  }
}
