import { SalaryCalculator, ParametrosSalario } from './salary-calculator.interface';

export class FixoSalaryCalculator implements SalaryCalculator {
  calcularRendaMensal(params: ParametrosSalario): number {
    return Number(params.valorBase || 0);
  }
}

export class PorHoraSalaryCalculator implements SalaryCalculator {
  calcularRendaMensal(params: ParametrosSalario): number {
    const valorHora = Number(params.valorHora || 0);
    const horasDiarias = Number(params.horasDiarias || 8);
    const diasTrabalho = Number(params.diasTrabalhoMes || 22);
    return valorHora * horasDiarias * diasTrabalho;
  }
}

export class ComissaoSalaryCalculator implements SalaryCalculator {
  calcularRendaMensal(params: ParametrosSalario): number {
    const valorBase = Number(params.valorBase || 0);
    const valorEstimado = Number(params.valorEstimado || 0);
    return valorBase + valorEstimado;
  }
}

export class DiarioSalaryCalculator implements SalaryCalculator {
  calcularRendaMensal(params: ParametrosSalario): number {
    const valorBase = Number(params.valorBase || 0);
    const diasTrabalho = Number(params.diasTrabalhoMes || 22);
    return valorBase * diasTrabalho;
  }
}

export class SalaryCalculatorFactory {
  static obterCalculadora(tipo: string): SalaryCalculator {
    switch (tipo) {
      case 'POR_HORA':
        return new PorHoraSalaryCalculator();
      case 'COMISSAO':
        return new ComissaoSalaryCalculator();
      case 'DIARIO':
        return new DiarioSalaryCalculator();
      case 'FIXO':
      default:
        return new FixoSalaryCalculator();
    }
  }
}
