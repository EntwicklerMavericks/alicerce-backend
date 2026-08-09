import { ConflictException } from '@nestjs/common';

export class ScenarioBaselineConflictException extends ConflictException {
  constructor(
    message = 'Conflito de baseline detectado. O projeto ou suas etapas foram modificados após a geração da simulação.',
  ) {
    super(message);
    this.name = 'ScenarioBaselineConflictException';
  }
}
