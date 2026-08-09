import { PrismaService } from '../../prisma/prisma.service';
import { LedgerEntry } from './entities/ledger-entry';
export declare class LedgerService {
    private readonly defaultPrisma;
    constructor(defaultPrisma: PrismaService);
    registrar(db: any, entry: LedgerEntry): Promise<void>;
    obterSaldoGlobal(workspaceId: string, referenceDate?: Date): Promise<number>;
}
