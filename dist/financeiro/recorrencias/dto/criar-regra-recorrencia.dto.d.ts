export declare class CriarRegraRecorrenciaDto {
    tipo: 'RECEITA' | 'DESPESA';
    descricao: string;
    valor: number;
    diaVencimento: number;
    categoriaId: string;
    carteiraId?: string;
    dataInicio: string;
    dataFim?: string;
}
