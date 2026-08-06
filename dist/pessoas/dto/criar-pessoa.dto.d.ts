export declare enum TipoSalarioEnum {
    FIXO = "FIXO",
    POR_HORA = "POR_HORA",
    COMISSAO = "COMISSAO",
    DIARIO = "DIARIO"
}
export declare class ConfigSalarioDto {
    tipo: TipoSalarioEnum;
    valorBase?: number;
    valorHora?: number;
    horasDiarias?: number;
    diasTrabalhoMes?: number;
}
export declare class CriarPessoaDto {
    nome: string;
    parentesco: string;
    configSalario: ConfigSalarioDto;
}
