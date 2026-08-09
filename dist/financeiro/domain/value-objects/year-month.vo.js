"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YearMonth = void 0;
class YearMonth {
    ano;
    mes;
    constructor(ano, mes) {
        this.ano = ano;
        this.mes = mes;
        if (!Number.isInteger(ano) || ano < 2000 || ano > 2100) {
            throw new Error(`Ano inválido para YearMonth: ${ano}`);
        }
        if (!Number.isInteger(mes) || mes < 1 || mes > 12) {
            throw new Error(`Mês inválido para YearMonth: ${mes}`);
        }
    }
    static deAnoMes(ano, mes) {
        return new YearMonth(ano, mes);
    }
    static daData(data) {
        return new YearMonth(data.getFullYear(), data.getMonth() + 1);
    }
    static deStringISO(iso) {
        const partes = iso.split('-');
        if (partes.length < 2) {
            throw new Error(`Formato de competência ISO inválido: ${iso}`);
        }
        const ano = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10);
        return new YearMonth(ano, mes);
    }
    obterProxima() {
        if (this.mes === 12) {
            return new YearMonth(this.ano + 1, 1);
        }
        return new YearMonth(this.ano, this.mes + 1);
    }
    obterAnterior() {
        if (this.mes === 1) {
            return new YearMonth(this.ano - 1, 12);
        }
        return new YearMonth(this.ano, this.mes - 1);
    }
    adicionarMeses(qtd) {
        let ym = this;
        for (let i = 0; i < qtd; i++) {
            ym = ym.obterProxima();
        }
        return ym;
    }
    equals(outro) {
        return this.ano === outro.ano && this.mes === outro.mes;
    }
    formatarISO() {
        const mesStr = this.mes.toString().padStart(2, '0');
        return `${this.ano}-${mesStr}`;
    }
    formatarExibicao() {
        const mesStr = this.mes.toString().padStart(2, '0');
        return `${mesStr}/${this.ano}`;
    }
}
exports.YearMonth = YearMonth;
//# sourceMappingURL=year-month.vo.js.map