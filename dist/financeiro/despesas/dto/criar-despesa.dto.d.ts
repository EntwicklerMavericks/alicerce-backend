import { StatusLiquidacao } from '@prisma/client';
export declare class CriarDespesaDto {
    descricao: string;
    valor: number;
    dataVencimento: string;
    categoriaId: string;
    carteiraId?: string;
    cartaoId?: string;
    metaId?: string;
    statusLiquidacao?: StatusLiquidacao;
    observacoes?: string;
    recorrente?: boolean;
    origemRecorrenciaId?: string;
}
