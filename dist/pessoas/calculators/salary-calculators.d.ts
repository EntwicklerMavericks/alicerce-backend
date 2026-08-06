import { SalaryCalculator, ParametrosSalario } from './salary-calculator.interface';
export declare class FixoSalaryCalculator implements SalaryCalculator {
    calcularRendaMensal(params: ParametrosSalario): number;
}
export declare class PorHoraSalaryCalculator implements SalaryCalculator {
    calcularRendaMensal(params: ParametrosSalario): number;
}
export declare class ComissaoSalaryCalculator implements SalaryCalculator {
    calcularRendaMensal(params: ParametrosSalario): number;
}
export declare class DiarioSalaryCalculator implements SalaryCalculator {
    calcularRendaMensal(params: ParametrosSalario): number;
}
export declare class SalaryCalculatorFactory {
    static obterCalculadora(tipo: string): SalaryCalculator;
}
