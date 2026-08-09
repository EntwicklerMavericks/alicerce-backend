import { DomainException } from '../../financeiro/domain/exceptions/domain.exception';

export class ReconciliationException extends DomainException {
  constructor(message?: string) {
    super(message || 'Divergência detectada na reconciliação do saldo contábil em Decimal.');
    this.name = 'ReconciliationException';
  }
}
