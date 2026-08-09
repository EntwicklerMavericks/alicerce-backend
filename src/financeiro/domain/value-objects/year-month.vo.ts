export class YearMonth {
  constructor(
    readonly ano: number,
    readonly mes: number,
  ) {
    if (!Number.isInteger(ano) || ano < 2000 || ano > 2100) {
      throw new Error(`Ano inválido para YearMonth: ${ano}`);
    }
    if (!Number.isInteger(mes) || mes < 1 || mes > 12) {
      throw new Error(`Mês inválido para YearMonth: ${mes}`);
    }
  }

  static deAnoMes(ano: number, mes: number): YearMonth {
    return new YearMonth(ano, mes);
  }

  static daData(data: Date): YearMonth {
    return new YearMonth(data.getFullYear(), data.getMonth() + 1);
  }

  static deStringISO(iso: string): YearMonth {
    const partes = iso.split('-');
    if (partes.length < 2) {
      throw new Error(`Formato de competência ISO inválido: ${iso}`);
    }
    const ano = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10);
    return new YearMonth(ano, mes);
  }

  obterProxima(): YearMonth {
    if (this.mes === 12) {
      return new YearMonth(this.ano + 1, 1);
    }
    return new YearMonth(this.ano, this.mes + 1);
  }

  obterAnterior(): YearMonth {
    if (this.mes === 1) {
      return new YearMonth(this.ano - 1, 12);
    }
    return new YearMonth(this.ano, this.mes - 1);
  }

  adicionarMeses(qtd: number): YearMonth {
    let ym: YearMonth = this;
    for (let i = 0; i < qtd; i++) {
      ym = ym.obterProxima();
    }
    return ym;
  }

  equals(outro: YearMonth): boolean {
    return this.ano === outro.ano && this.mes === outro.mes;
  }

  formatarISO(): string {
    const mesStr = this.mes.toString().padStart(2, '0');
    return `${this.ano}-${mesStr}`;
  }

  formatarExibicao(): string {
    const mesStr = this.mes.toString().padStart(2, '0');
    return `${mesStr}/${this.ano}`;
  }
}
