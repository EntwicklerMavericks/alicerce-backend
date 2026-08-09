import { ConflictException } from '@nestjs/common';

export class ConcurrencyConflictException extends ConflictException {
  constructor(message = 'Conflito de concorrência ao atualizar o recurso. Tente novamente.') {
    super(message);
    this.name = 'ConcurrencyConflictException';
  }
}
