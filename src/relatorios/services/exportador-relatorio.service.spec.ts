import { ExportadorRelatorioService } from './exportador-relatorio.service';
import { RelatoriosResult } from './relatorios-read-model.service';

describe('ExportadorRelatorioService (Pure Domain Export Engine)', () => {
  let service: ExportadorRelatorioService;

  const mockRelatoriosResult: RelatoriosResult = {
    periodo: {
      dataInicio: new Date('2026-01-01T00:00:00.000Z'),
      dataFim: new Date('2026-02-01T00:00:00.000Z'),
    },
    fluxoCaixa: {
      saldoInicial: 1000,
      entradas: 5000,
      saidas: 2000,
      saldoFinal: 4000,
      resultadoPeriodo: 3000,
    },
    categorias: [
      {
        categoriaId: 'cat-1',
        nome: 'Alimentação',
        tipo: 'DESPESA',
        valor: 1500,
        percentual: 75,
      },
      {
        categoriaId: 'cat-2',
        nome: 'Transporte',
        tipo: 'DESPESA',
        valor: 500,
        percentual: 25,
      },
    ],
    cartoes: [
      {
        cartaoId: 'card-1',
        nome: 'Cartão Nubank',
        bandeira: 'MASTERCARD',
        valorTotal: 1200,
        qtdTransacoes: 5,
      },
    ],
    metasProjetos: [
      {
        id: 'meta-1',
        tipo: 'META',
        nome: 'Reserva de Emergência',
        progressoPercentual: 50,
        valorAlvoOuEstimado: 10000,
        valorAtualOuGasto: 5000,
        status: 'ATIVA',
      },
      {
        id: 'proj-1',
        tipo: 'PROJETO',
        nome: 'Reforma da Cozinha',
        progressoPercentual: 20,
        valorAlvoOuEstimado: 15000,
        valorAtualOuGasto: 3000,
        status: 'EM_ANDAMENTO',
      },
    ],
  };

  beforeEach(() => {
    // Caso 1: Pure Export Engine Test (SEM Prisma)
    service = new ExportadorRelatorioService();
  });

  it('deve ser instanciado sem PrismaService (Pure Engine)', () => {
    expect(service).toBeDefined();
  });

  it('Caso 5: deve gerar Formato PDF Executivo em Buffer com cabeçalho %PDF', async () => {
    const pdfBuffer = await service.gerarPDF(mockRelatoriosResult);

    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
    expect(pdfBuffer.length).toBeGreaterThan(0);
    // Validação do Magic Number %PDF-
    const pdfHeader = pdfBuffer.subarray(0, 4).toString('utf-8');
    expect(pdfHeader).toBe('%PDF');
  });

  it('Caso 6: deve gerar Formato Excel (.xlsx) em Buffer com assinatura PK', async () => {
    const excelBuffer = await service.gerarExcel(mockRelatoriosResult);

    expect(Buffer.isBuffer(excelBuffer)).toBe(true);
    expect(excelBuffer.length).toBeGreaterThan(0);
    // Arquivos XLSX são arquivos ZIP (assinado por PK\x03\x04)
    const zipHeader = excelBuffer.subarray(0, 2).toString('utf-8');
    expect(zipHeader).toBe('PK');
  });

  it('Caso 6: deve gerar Formato CSV em Buffer legível em UTF-8', async () => {
    const csvBuffer = await service.gerarCSV(mockRelatoriosResult);

    expect(Buffer.isBuffer(csvBuffer)).toBe(true);
    expect(csvBuffer.length).toBeGreaterThan(0);

    const csvContent = csvBuffer.toString('utf-8');
    expect(csvContent).toContain('=== RELATORIO FINANCEIRO ANALITICO ===');
    expect(csvContent).toContain('=== FLUXO DE CAIXA ===');
    expect(csvContent).toContain('1000;5000;2000;3000;4000');
    expect(csvContent).toContain('=== CATEGORIAS ===');
    expect(csvContent).toContain('"cat-1";"Alimentação";"DESPESA";1500;75%');
    expect(csvContent).toContain('=== CARTOES DE CREDITO ===');
    expect(csvContent).toContain('"card-1";"Cartão Nubank";"MASTERCARD";5;1200');
    expect(csvContent).toContain('=== METAS E PROJETOS ===');
    expect(csvContent).toContain('"meta-1";"META";"Reserva de Emergência";10000;5000;50%;"ATIVA"');
  });

  it('Caso 8: deve tratar Zero Absoluto sem NaN/Infinity nos relatórios exportados', async () => {
    const dadosZero: RelatoriosResult = {
      periodo: {
        dataInicio: new Date('2026-01-01'),
        dataFim: new Date('2026-02-01'),
      },
      fluxoCaixa: {
        saldoInicial: 0,
        entradas: 0,
        saidas: 0,
        saldoFinal: 0,
        resultadoPeriodo: 0,
      },
      categorias: [],
      cartoes: [],
      metasProjetos: [],
    };

    const pdfBuffer = await service.gerarPDF(dadosZero);
    const excelBuffer = await service.gerarExcel(dadosZero);
    const csvBuffer = await service.gerarCSV(dadosZero);

    expect(pdfBuffer.length).toBeGreaterThan(0);
    expect(excelBuffer.length).toBeGreaterThan(0);
    expect(csvBuffer.length).toBeGreaterThan(0);
    expect(csvBuffer.toString('utf-8')).not.toContain('NaN');
    expect(csvBuffer.toString('utf-8')).not.toContain('Infinity');
  });
});
