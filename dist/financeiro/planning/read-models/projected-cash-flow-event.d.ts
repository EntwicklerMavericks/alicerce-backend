export type OrigemProjecao = 'SALARIO' | 'RECEITA_RECORRENTE' | 'RECEITA_PONTUAL' | 'DESPESA_RECORRENTE' | 'DESPESA_PONTUAL' | 'CARTAO_PARCELA' | 'ORCAMENTO_FALLBACK';
export type TipoCashFlow = 'INCOME' | 'EXPENSE' | 'ALOCACAO_PATRIMONIAL';
export interface ProjectedCashFlowEvent {
    id: string;
    descricao: string;
    valor: number;
    tipo: TipoCashFlow;
    fonte: OrigemProjecao;
    categoriaId?: string | null;
    categoriaNome?: string | null;
    competencia: string;
    dataRealizacaoProjetada: Date;
    metaId?: string | null;
}
