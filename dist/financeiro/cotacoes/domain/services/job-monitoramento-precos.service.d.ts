import { PrismaService } from '../../../../prisma/prisma.service';
export interface ResultadoMonitoramentoPrecos {
    processados: number;
    atualizados: number;
    erros: number;
}
export declare class JobMonitoramentoPrecosService {
    private readonly prisma;
    private readonly fonteCotacaoProvider;
    private readonly logger;
    constructor(prisma: PrismaService, fonteCotacaoProvider: any);
    executarMonitoramentoPrecos(workspaceId?: string): Promise<ResultadoMonitoramentoPrecos>;
    processarLinkAtomico(linkId: string, versaoEsperada: number, novoPreco: number): Promise<boolean>;
}
