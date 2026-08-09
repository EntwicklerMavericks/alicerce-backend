import { PrismaService } from '../../prisma/prisma.service';
import { YearMonth } from '../domain/value-objects/year-month.vo';
export declare class RecurringGeneratorService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    processarCompetencia(target: YearMonth, workspaceId?: string): Promise<number>;
}
