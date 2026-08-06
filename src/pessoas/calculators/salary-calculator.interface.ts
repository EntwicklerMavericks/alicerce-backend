export interface ParametrosSalario {
  tipo: 'FIXO' | 'POR_HORA' | 'COMISSAO' | 'DIARIO';
  valorBase?: number;
  valorHora?: number;
  horasDiarias?: number;
  diasTrabalhoMes?: number;
  valorEstimado?: number;
}

export interface SalaryCalculator {
  calcularRendaMensal(params: ParametrosSalario): number;
}
