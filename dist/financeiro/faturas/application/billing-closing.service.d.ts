import { PrismaService } from '../../../prisma/prisma.service';
export declare class BillingClosingService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    processarFechamentos(dataAtual?: Date, workspaceId?: string): Promise<number>;
}
