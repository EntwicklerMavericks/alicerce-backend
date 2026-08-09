import { PrismaService } from '../../prisma/prisma.service';
export type EstadoOrcamento = 'NORMAL' | 'ALERTA' | 'ATENCAO' | 'EXCEDIDO';
export interface ItemOrcamentoConsumo {
    id: string;
    categoriaId: string;
    categoriaNome: string;
    categoriaIcone?: string | null;
    categoriaCor?: string | null;
    mes: number;
    ano: number;
    teto: number;
    valorConsumido: number;
    valorDisponivel: number;
    percentualConsumido: number;
    estado: EstadoOrcamento;
}
export declare class OrcamentosReadModelService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    obterOrcamentosComConsumo(workspaceId: string, ano: number, mes: number): Promise<ItemOrcamentoConsumo[]>;
}
