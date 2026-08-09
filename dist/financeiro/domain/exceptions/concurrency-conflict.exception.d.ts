import { ConflictException } from '@nestjs/common';
export declare class ConcurrencyConflictException extends ConflictException {
    constructor(message?: string);
}
