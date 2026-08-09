import { BillingCycleService } from './billing-cycle.service';

describe('BillingCycleService (Domain Service)', () => {
  it('deve atribuir à fatura do mês atual se compra realizada ANTES ou NO dia do fechamento', () => {
    const dataCompra = new Date(2026, 7, 20); // 20 de Agosto
    const competencia = BillingCycleService.calcularCompetenciaFatura(dataCompra, 25);
    expect(competencia.formatarISO()).toBe('2026-08');
  });

  it('deve atribuir à fatura do DIA DE FECHAMENTO exato', () => {
    const dataCompra = new Date(2026, 7, 25, 14, 30); // 25 de Agosto às 14:30
    const competencia = BillingCycleService.calcularCompetenciaFatura(dataCompra, 25);
    expect(competencia.formatarISO()).toBe('2026-08');
  });

  it('deve atribuir à PRÓXIMA fatura se compra realizada APÓS o dia de fechamento', () => {
    const dataCompra = new Date(2026, 7, 26); // 26 de Agosto
    const competencia = BillingCycleService.calcularCompetenciaFatura(dataCompra, 25);
    expect(competencia.formatarISO()).toBe('2026-09');
  });

  it('deve tratar virada de ano em compras após o fechamento em Dezembro', () => {
    const dataCompra = new Date(2026, 11, 28); // 28 de Dezembro (mês 11 no JS)
    const competencia = BillingCycleService.calcularCompetenciaFatura(dataCompra, 25);
    expect(competencia.formatarISO()).toBe('2027-01');
  });

  it('deve tratar bordas extremas de horário (23:59:59 no dia de fechamento)', () => {
    const dataCompra = new Date(2026, 7, 25, 23, 59, 59);
    const competencia = BillingCycleService.calcularCompetenciaFatura(dataCompra, 25);
    expect(competencia.formatarISO()).toBe('2026-08');
  });

  it('deve tratar bordas extremas de horário (00:00:00 do dia seguinte ao fechamento)', () => {
    const dataCompra = new Date(2026, 7, 26, 0, 0, 0);
    const competencia = BillingCycleService.calcularCompetenciaFatura(dataCompra, 25);
    expect(competencia.formatarISO()).toBe('2026-09');
  });

  it('deve calcular corretamente em Fevereiro de ano bissexto (29 dias)', () => {
    const dataCompra = new Date(2028, 1, 29); // 29 de Fev de 2028
    const competencia = BillingCycleService.calcularCompetenciaFatura(dataCompra, 30);
    expect(competencia.formatarISO()).toBe('2028-02');
  });

  it('deve ajustar o dia de fechamento para o último dia útil de Fevereiro (28 ou 29 dias)', () => {
    const ym2027 = { ano: 2027, mes: 2 } as any;
    const dataFev2027 = BillingCycleService.calcularDataFechamento(ym2027, 31);
    expect(dataFev2027.getDate()).toBe(28);

    const ym2028 = { ano: 2028, mes: 2 } as any;
    const dataFev2028 = BillingCycleService.calcularDataFechamento(ym2028, 31);
    expect(dataFev2028.getDate()).toBe(29);
  });
});
