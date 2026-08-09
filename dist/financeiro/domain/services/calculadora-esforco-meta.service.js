"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalculadoraEsforcoMetaService = void 0;
const money_vo_1 = require("../value-objects/money.vo");
class CalculadoraEsforcoMetaService {
    calcularEsforcoMensal(valorAlvo, valorAcumulado, prazo, competenciaAtual) {
        if (valorAcumulado.maiorQue(valorAlvo) || valorAcumulado.equals(valorAlvo)) {
            const mesesRestantes = prazo ? this.calcularDiferencaMeses(competenciaAtual, prazo) : 0;
            return {
                mesesRestantes: Math.max(0, mesesRestantes),
                valorMensalNecessario: money_vo_1.Money.zero(),
                noPrazo: true,
            };
        }
        const valorRestante = valorAlvo.subtrair(valorAcumulado);
        if (!prazo) {
            return {
                mesesRestantes: 0,
                valorMensalNecessario: valorRestante,
                noPrazo: true,
            };
        }
        const mesesRestantes = this.calcularDiferencaMeses(competenciaAtual, prazo);
        if (mesesRestantes <= 0) {
            return {
                mesesRestantes: 0,
                valorMensalNecessario: valorRestante,
                noPrazo: false,
            };
        }
        const centavosRestantes = valorRestante.valorEmCentavos;
        const centavosMensais = (centavosRestantes + BigInt(mesesRestantes) - 1n) / BigInt(mesesRestantes);
        return {
            mesesRestantes,
            valorMensalNecessario: money_vo_1.Money.deCentavos(centavosMensais),
            noPrazo: true,
        };
    }
    calcularDiferencaMeses(inicio, fim) {
        return (fim.ano - inicio.ano) * 12 + (fim.mes - inicio.mes) + 1;
    }
}
exports.CalculadoraEsforcoMetaService = CalculadoraEsforcoMetaService;
//# sourceMappingURL=calculadora-esforco-meta.service.js.map