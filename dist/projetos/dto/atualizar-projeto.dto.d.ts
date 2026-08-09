import { StatusProjeto } from '@prisma/client';
export declare class AtualizarProjetoDto {
    nome?: string;
    descricao?: string;
    orcamentoEstimado?: number;
    status?: StatusProjeto;
    prioridade?: number;
    dataInicioPrevista?: string;
    dataFimPrevista?: string;
}
