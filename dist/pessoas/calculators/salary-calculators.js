"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalaryCalculatorFactory = exports.DiarioSalaryCalculator = exports.ComissaoSalaryCalculator = exports.PorHoraSalaryCalculator = exports.FixoSalaryCalculator = void 0;
class FixoSalaryCalculator {
    calcularRendaMensal(params) {
        return Number(params.valorBase || 0);
    }
}
exports.FixoSalaryCalculator = FixoSalaryCalculator;
class PorHoraSalaryCalculator {
    calcularRendaMensal(params) {
        const valorHora = Number(params.valorHora || 0);
        const horasDiarias = Number(params.horasDiarias || 8);
        const diasTrabalho = Number(params.diasTrabalhoMes || 22);
        return valorHora * horasDiarias * diasTrabalho;
    }
}
exports.PorHoraSalaryCalculator = PorHoraSalaryCalculator;
class ComissaoSalaryCalculator {
    calcularRendaMensal(params) {
        const valorBase = Number(params.valorBase || 0);
        const valorEstimado = Number(params.valorEstimado || 0);
        return valorBase + valorEstimado;
    }
}
exports.ComissaoSalaryCalculator = ComissaoSalaryCalculator;
class DiarioSalaryCalculator {
    calcularRendaMensal(params) {
        const valorBase = Number(params.valorBase || 0);
        const diasTrabalho = Number(params.diasTrabalhoMes || 22);
        return valorBase * diasTrabalho;
    }
}
exports.DiarioSalaryCalculator = DiarioSalaryCalculator;
class SalaryCalculatorFactory {
    static obterCalculadora(tipo) {
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
exports.SalaryCalculatorFactory = SalaryCalculatorFactory;
//# sourceMappingURL=salary-calculators.js.map