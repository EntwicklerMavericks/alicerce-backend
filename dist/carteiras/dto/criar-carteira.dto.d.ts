export declare enum TipoCarteiraEnum {
    CONTA_CORRENTE = "CONTA_CORRENTE",
    DINHEIRO = "DINHEIRO",
    CARTEIRA_DIGITAL = "CARTEIRA_DIGITAL",
    POUPANCA = "POUPANCA",
    INVESTIMENTO = "INVESTIMENTO",
    CARTAO_CREDITO = "CARTAO_CREDITO"
}
export declare class CriarCarteiraDto {
    nome: string;
    tipo: TipoCarteiraEnum;
    pessoaId?: string;
    saldoInicial?: number;
    permiteSaldoNegativo?: boolean;
    cor?: string;
    icone?: string;
    padrao?: boolean;
}
