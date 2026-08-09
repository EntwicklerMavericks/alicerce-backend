import { DomainException } from '../../../domain/exceptions/domain.exception';

export class TempoEsfriamentoVO {
  private readonly _dias: number;

  constructor(diasEsfriamento: number) {
    if (
      typeof diasEsfriamento !== 'number' ||
      !Number.isInteger(diasEsfriamento) ||
      diasEsfriamento < 1 ||
      diasEsfriamento > 365
    ) {
      throw new DomainException(
        'O tempo de esfriamento deve ser um número inteiro entre 1 e 365 dias.',
      );
    }
    this._dias = diasEsfriamento;
  }

  get dias(): number {
    return this._dias;
  }

  calcularDataFim(inicio: Date): Date {
    if (!(inicio instanceof Date) || isNaN(inicio.getTime())) {
      throw new DomainException('Data de início inválida para cálculo de esfriamento.');
    }
    const fim = new Date(inicio.getTime());
    fim.setDate(fim.getDate() + this._dias);
    return fim;
  }

  equals(other?: TempoEsfriamentoVO): boolean {
    if (!other || !(other instanceof TempoEsfriamentoVO)) {
      return false;
    }
    return this._dias === other._dias;
  }
}
