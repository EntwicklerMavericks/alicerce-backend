import { PrismaService } from '../../prisma/prisma.service';
import { SimulationSnapshot } from '../domain/services/simulador-cenarios.service';
export declare class SimulationSnapshotBuilder {
    private readonly prisma;
    constructor(prisma: PrismaService);
    buildSnapshot(workspaceId: string, projetoId: string, referenceDate?: Date): Promise<SimulationSnapshot>;
    private determinarPrecoWishlist;
}
