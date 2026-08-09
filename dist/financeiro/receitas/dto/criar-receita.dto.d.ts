import { StatusLiquidacao } from '@prisma/client';
export declare class CriarReceitaDto {
    descricao: string;
    valor: number;
    data: string;
    categoriaId: string;
    carteiraId?: string;
    pessoaId?: string;
    statusLiquidacao?: StatusLiquidacao;
    observacoes?: string;
    recorrente?: boolean;
    origemRecorrenciaId?: string;
}
