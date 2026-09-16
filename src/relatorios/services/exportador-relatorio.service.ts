import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';
import { RelatoriosResult } from './relatorios-read-model.service';

@Injectable()
export class ExportadorRelatorioService {
  /**
   * Pure Export Engine (Sem PrismaService, Sem Tenancy).
   * Recebe um contrato estrito `RelatoriosResult` pré-autorizado.
   */

  /**
   * Gera relatório em formato PDF Executivo de Alto Padrão com Design System Alicerce.
   */
  async gerarPDF(dados: RelatoriosResult): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          margin: 30,
          size: 'A4',
          bufferPages: true,
        });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', (err: Error) => reject(err));

        const margin = 30;
        const contentWidth = 535; // 595 - 60

        // ==========================================
        // 1. BANNER HEADER EXECUTIVO DE ALTO PADRÃO
        // ==========================================
        const headerY = margin;
        const headerHeight = 84;

        doc.save();
        // Fundo Bordô Imperial Profundo
        doc.roundedRect(margin, headerY, contentWidth, headerHeight, 6).fill('#1E060D');

        // Borda Externa Fina Dourada no Banner
        doc.roundedRect(margin, headerY, contentWidth, headerHeight, 6)
           .strokeColor('#C5A059').lineWidth(0.8).stroke();

        // Friso Superior em Ouro Nobre Polido
        doc.roundedRect(margin + 1, headerY + 1, contentWidth - 2, 3, 1.5).fill('#D4AF37');

        // --- CRISTA / BRASÃO MONOGRAMA "A" À ESQUERDA ---
        const crestX = margin + 18;
        const crestY = headerY + 16;
        const crestSize = 48;

        // Fundo do Brasão com moldura dupla em ouro
        doc.save();
        doc.roundedRect(crestX, crestY, crestSize, crestSize, 8).fill('#2D0B14');
        doc.roundedRect(crestX, crestY, crestSize, crestSize, 8)
           .strokeColor('#D4AF37').lineWidth(1).stroke();

        doc.roundedRect(crestX + 3, crestY + 3, crestSize - 6, crestSize - 6, 6)
           .strokeColor('#997736').lineWidth(0.5).stroke();

        // Letra Monograma "A" Clássica Serifada
        doc.font('Times-Bold').fontSize(26).fillColor('#E8D39E')
           .text('A', crestX, crestY + 9, { width: crestSize, align: 'center' });
        doc.restore();

        // --- TEXTOS DO HEADER ---
        const textStartX = crestX + crestSize + 14;

        doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#C5A059')
           .text('ALICERCE  •  FAMILY OFFICE & GESTÃO PATRIMONIAL', textStartX, headerY + 16);

        doc.font('Helvetica-Bold').fontSize(16).fillColor('#FFFFFF')
           .text('RELATÓRIO FINANCEIRO ANALÍTICO', textStartX, headerY + 28);

        const dInicioStr = dados.periodo?.dataInicio
          ? new Date(dados.periodo.dataInicio).toLocaleDateString('pt-BR')
          : 'N/A';
        const dFimStr = dados.periodo?.dataFim
          ? new Date(dados.periodo.dataFim).toLocaleDateString('pt-BR')
          : 'N/A';

        doc.font('Helvetica').fontSize(8.5).fillColor('#E8D39E')
           .text(`Competência: ${dInicioStr} até ${dFimStr}`, textStartX, headerY + 52);

        // --- CARD DE CHANCELA / EMISSÃO À DIREITA ---
        const stampWidth = 140;
        const stampX = margin + contentWidth - stampWidth - 14;
        const stampY = headerY + 15;

        doc.roundedRect(stampX, stampY, stampWidth, 52, 4).fill('#2A0D15');
        doc.roundedRect(stampX, stampY, stampWidth, 52, 4)
           .strokeColor('#664D24').lineWidth(0.5).stroke();

        doc.font('Helvetica-Bold').fontSize(6.5).fillColor('#C5A059')
           .text('DOCUMENTO EXECUTIVO', stampX + 8, stampY + 8, { width: stampWidth - 16, align: 'right' });

        const agora = new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        doc.font('Helvetica').fontSize(7.5).fillColor('#D1D5DB')
           .text(`Emissão: ${agora}`, stampX + 8, stampY + 22, { width: stampWidth - 16, align: 'right' });

        doc.font('Helvetica-Bold').fontSize(7).fillColor('#10B981')
           .text('● BASE CONSOLIDADA', stampX + 8, stampY + 36, { width: stampWidth - 16, align: 'right' });

        doc.restore();

        let currentY = headerY + headerHeight + 18;

        // ==========================================
        // 2. SEÇÃO I: FLUXO DE CAIXA CONSOLIDADO
        // ==========================================
        currentY = this.desenharTituloSecaoNobre(doc, 'I', 'FLUXO DE CAIXA CONSOLIDADO', 'Posição de liquidez, aportes e despesas incorridas', margin, currentY, contentWidth);

        const kpiGap = 8;
        const kpiWidth = (contentWidth - (kpiGap * 3)) / 4;
        const kpiHeight = 54;

        // 4 KPI Cards Harmônicos
        this.desenharKpiCardChique(doc, margin, currentY, kpiWidth, kpiHeight, 'SALDO INICIAL', `R$ ${this.formatarMoeda(dados.fluxoCaixa.saldoInicial)}`, '#475569', '#64748B');
        this.desenharKpiCardChique(doc, margin + (kpiWidth + kpiGap), currentY, kpiWidth, kpiHeight, 'RECEITAS (+)', `R$ ${this.formatarMoeda(dados.fluxoCaixa.entradas)}`, '#047857', '#059669');
        this.desenharKpiCardChique(doc, margin + (kpiWidth + kpiGap) * 2, currentY, kpiWidth, kpiHeight, 'DESPESAS (-)', `R$ ${this.formatarMoeda(dados.fluxoCaixa.saidas)}`, '#B91C1C', '#DC2626');
        this.desenharKpiCardChique(doc, margin + (kpiWidth + kpiGap) * 3, currentY, kpiWidth, kpiHeight, 'SALDO FINAL', `R$ ${this.formatarMoeda(dados.fluxoCaixa.saldoFinal)}`, '#1E060D', '#C5A059', true);

        currentY += kpiHeight + 10;

        // Faixa Executiva de Diagnóstico
        doc.save();
        doc.roundedRect(margin, currentY, contentWidth, 26, 4).fill('#FBF9F5');
        doc.roundedRect(margin, currentY, contentWidth, 26, 4).strokeColor('#E6DEC9').lineWidth(0.75).stroke();

        const resPeriodo = dados.fluxoCaixa.resultadoPeriodo;
        const resCor = resPeriodo >= 0 ? '#047857' : '#B91C1C';
        const sinal = resPeriodo >= 0 ? '+' : '';

        doc.font('Helvetica-Bold').fontSize(8).fillColor('#6B7280')
           .text('RESULTADO LÍQUIDO DO PERÍODO:', margin + 14, currentY + 8);
        doc.font('Helvetica-Bold').fontSize(9.5).fillColor(resCor)
           .text(`${sinal}R$ ${this.formatarMoeda(resPeriodo)}`, margin + 175, currentY + 7);

        const taxaPoupanca = dados.fluxoCaixa.taxaPoupanca ?? (dados.fluxoCaixa.entradas > 0 ? ((dados.fluxoCaixa.entradas - dados.fluxoCaixa.saidas) / dados.fluxoCaixa.entradas * 100) : 0);
        doc.font('Helvetica-Bold').fontSize(8).fillColor('#6B7280')
           .text('TAXA DE POUPANÇA:', margin + 285, currentY + 8);
        doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#8C6D2D')
           .text(`${this.sanitizarNumero(taxaPoupanca).toFixed(1)}%`, margin + 395, currentY + 7);

        const statusPillW = 86;
        const statusPillX = margin + contentWidth - statusPillW - 8;
        const isSuperavit = resPeriodo >= 0;
        doc.roundedRect(statusPillX, currentY + 5, statusPillW, 16, 8).fill(isSuperavit ? '#ECFDF5' : '#FEF2F2');
        doc.font('Helvetica-Bold').fontSize(6.5).fillColor(isSuperavit ? '#065F46' : '#991B1B')
           .text(isSuperavit ? '● SUPERAVITÁRIO' : '● DEFICITÁRIO', statusPillX, currentY + 9, { width: statusPillW, align: 'center' });
        doc.restore();

        currentY += 38;

        // ==========================================
        // 3. SEÇÃO II: DESPESAS POR CATEGORIA
        // ==========================================
        currentY = this.desenharTituloSecaoNobre(doc, 'II', 'COMPOSIÇÃO DE DESPESAS POR CATEGORIA', 'Distribuição dos dispêndios por centro de custo e relevância', margin, currentY, contentWidth);

        const colsCat = [
          { title: 'CATEGORIA', width: 195, align: 'left' },
          { title: 'NATUREZA', width: 75, align: 'center' },
          { title: 'LANÇAMENTOS', width: 85, align: 'center' },
          { title: 'VALOR TOTAL (R$)', width: 95, align: 'right' },
          { title: 'PARTICIPAÇÃO', width: 85, align: 'right' },
        ];

        currentY = this.desenharCabecalhoTabelaNobre(doc, colsCat, margin, currentY, contentWidth);

        const cats = Array.isArray(dados.categorias) ? dados.categorias : (dados.categorias as any)?.distribuicaoDespesas || [];
        if (cats.length === 0) {
          currentY = this.desenharLinhaVazia(doc, 'Nenhum lançamento de despesa apurado no período.', margin, currentY, contentWidth);
        } else {
          cats.forEach((cat: any, idx: number) => {
            const bg = idx % 2 === 0 ? '#FFFFFF' : '#FAF9F6';
            const pct = this.sanitizarNumero(cat.percentual);
            currentY = this.desenharLinhaTabelaNobre(doc, [
              { text: cat.nome, align: 'left', font: 'Helvetica-Bold', color: '#1F2937' },
              { text: cat.tipo || 'DESPESA', align: 'center', color: '#6B7280', fontSize: 7.5 },
              { text: `${cat.quantidadeLancamentos ?? 1} reg.`, align: 'center', color: '#4B5563' },
              { text: this.formatarMoeda(cat.valor), align: 'right', font: 'Helvetica-Bold', color: '#1F2937' },
              { text: `${pct.toFixed(1)}%`, align: 'right', font: 'Helvetica-Bold', color: '#8C6D2D' },
            ], colsCat, margin, currentY, contentWidth, bg);
          });
        }

        currentY += 24;

        // ==========================================
        // 4. SEÇÃO III: CARTÕES DE CRÉDITO & PASSIVOS
        // ==========================================
        currentY = this.desenharTituloSecaoNobre(doc, 'III', 'CARTÕES DE CRÉDITO & FATURAS', 'Controle de limites operacionais e compromissos abertos', margin, currentY, contentWidth);

        const colsCartao = [
          { title: 'NOME DO CARTÃO', width: 180, align: 'left' },
          { title: 'BANDEIRA', width: 75, align: 'center' },
          { title: 'TRANSAÇÕES', width: 85, align: 'center' },
          { title: 'FATURA ATUAL (R$)', width: 95, align: 'right' },
          { title: 'LIMITE TOTAL (R$)', width: 100, align: 'right' },
        ];

        currentY = this.desenharCabecalhoTabelaNobre(doc, colsCartao, margin, currentY, contentWidth);

        const cartoes = Array.isArray(dados.cartoes) ? dados.cartoes : (dados.cartoes as any)?.usoPorCartao || [];
        if (cartoes.length === 0) {
          currentY = this.desenharLinhaVazia(doc, 'Nenhum cartão com movimentação no período.', margin, currentY, contentWidth);
        } else {
          cartoes.forEach((cr: any, idx: number) => {
            const bg = idx % 2 === 0 ? '#FFFFFF' : '#FAF9F6';
            const qtd = cr.qtdTransacoes || 0;
            const textoQtd = qtd === 1 ? '1 compra' : `${qtd} compras`;
            const vTotal = cr.valorTotal ?? cr.valorFaturaAtual ?? 0;
            currentY = this.desenharLinhaTabelaNobre(doc, [
              { text: cr.nomeCartao || cr.nome, align: 'left', font: 'Helvetica-Bold', color: '#1F2937' },
              { text: cr.bandeira || 'OUTROS', align: 'center', color: '#4B5563', badge: true },
              { text: textoQtd, align: 'center', color: '#6B7280' },
              { text: this.formatarMoeda(vTotal), align: 'right', font: 'Helvetica-Bold', color: vTotal > 0 ? '#1E060D' : '#6B7280' },
              { text: this.formatarMoeda(cr.limiteTotal || 0), align: 'right', color: '#6B7280' },
            ], colsCartao, margin, currentY, contentWidth, bg);
          });
        }

        currentY += 24;

        // ==========================================
        // 5. SEÇÃO IV: METAS & PROJETOS ESTRATÉGICOS
        // ==========================================
        if (currentY > 620) {
          doc.addPage();
          currentY = margin + 15;
        }

        currentY = this.desenharTituloSecaoNobre(doc, 'IV', 'METAS & PROJETOS ESTRATÉGICOS', 'Acompanhamento de objetivos patrimoniais de médio e longo prazo', margin, currentY, contentWidth);

        const colsMP = [
          { title: 'TIPO', width: 55, align: 'center' },
          { title: 'OBJETIVO / PROJETO', width: 175, align: 'left' },
          { title: 'VALOR ATUAL (R$)', width: 90, align: 'right' },
          { title: 'ALVO ESTIMADO (R$)', width: 95, align: 'right' },
          { title: 'PROGRESSO', width: 60, align: 'center' },
          { title: 'STATUS', width: 60, align: 'center' },
        ];

        currentY = this.desenharCabecalhoTabelaNobre(doc, colsMP, margin, currentY, contentWidth);

        const metasProj = Array.isArray(dados.metasProjetos) ? dados.metasProjetos : [
          ...((dados.metasProjetos as any)?.metasStatus || []),
          ...((dados.metasProjetos as any)?.projetosStatus || []),
        ];

        if (metasProj.length === 0) {
          currentY = this.desenharLinhaVazia(doc, 'Nenhuma meta ou projeto cadastrado no portfólio.', margin, currentY, contentWidth);
        } else {
          metasProj.forEach((mp: any, idx: number) => {
            const bg = idx % 2 === 0 ? '#FFFFFF' : '#FAF9F6';
            const prog = this.sanitizarNumero(mp.progressoPercentual ?? mp.percentualConcluido ?? mp.percentualProgresso ?? 0);
            const tipo = mp.tipo || (mp.metaId ? 'META' : 'PROJETO');
            const nome = mp.nome || mp.titulo;
            const atual = mp.valorAtualOuGasto ?? mp.valorAtual ?? mp.valorGasto ?? 0;
            const alvo = mp.valorAlvoOuEstimado ?? mp.valorAlvo ?? mp.orcamentoTotal ?? 0;

            currentY = this.desenharLinhaTabelaNobre(doc, [
              { text: tipo === 'META' ? 'META' : 'PROJETO', align: 'center', font: 'Helvetica-Bold', typeBadge: tipo },
              { text: nome, align: 'left', font: 'Helvetica-Bold', color: '#1F2937' },
              { text: this.formatarMoeda(atual), align: 'right', color: '#1F2937' },
              { text: this.formatarMoeda(alvo), align: 'right', color: '#6B7280' },
              { text: `${prog.toFixed(1)}%`, align: 'center', font: 'Helvetica-Bold', color: prog >= 100 ? '#047857' : '#8C6D2D', miniBar: prog },
              { text: this.formatarStatus(mp.status), align: 'center', statusPill: true },
            ], colsMP, margin, currentY, contentWidth, bg);
          });
        }

        // ==========================================
        // 6. MOLDURA DE LUXO & RODAPÉ EM TODAS AS PÁGINAS
        // ==========================================
        const totalPages = doc.bufferedPageRange().count;
        for (let i = 0; i < totalPages; i++) {
          doc.switchToPage(i);
          doc.save();

          // Moldura Periférica Dupla em Ouro Nobre (Estilo Certificado Privado)
          const framePadOuter = 16;
          const framePadInner = 19;

          // Linha externa fina dourada
          doc.roundedRect(framePadOuter, framePadOuter, 595.28 - (framePadOuter * 2), 841.89 - (framePadOuter * 2), 3)
             .strokeColor('#C5A059').lineWidth(0.75).stroke();

          // Linha interna marfim/ouro suave
          doc.roundedRect(framePadInner, framePadInner, 595.28 - (framePadInner * 2), 841.89 - (framePadInner * 2), 2)
             .strokeColor('#EFE7D8').lineWidth(0.5).stroke();

          // 4 Ornamentos de Canto (Micro-diamantes)
          this.desenharOrnamentoCanto(doc, framePadInner + 4, framePadInner + 4);
          this.desenharOrnamentoCanto(doc, 595.28 - framePadInner - 4, framePadInner + 4);
          this.desenharOrnamentoCanto(doc, framePadInner + 4, 841.89 - framePadInner - 4);
          this.desenharOrnamentoCanto(doc, 595.28 - framePadInner - 4, 841.89 - framePadInner - 4);

          // Rodapé Institucional
          const footerY = 808;
          doc.strokeColor('#E6DEC9').lineWidth(0.5)
             .moveTo(margin, footerY).lineTo(margin + contentWidth, footerY).stroke();

          doc.font('Helvetica-Bold').fontSize(6.8).fillColor('#6B7280')
             .text('ALICERCE', margin, footerY + 6, { continued: true });
          doc.font('Helvetica').fontSize(6.8).fillColor('#9CA3AF')
             .text('  •  SISTEMA INTEGRADO DE GOVERNANÇA PATRIMONIAL & PRIVATE ANALYTICS');

          doc.font('Helvetica-Bold').fontSize(6.8).fillColor('#C5A059')
             .text(`DOCUMENTO CONFIDENCIAL  •  PÁGINA ${i + 1} DE ${totalPages}`, margin, footerY + 6, { width: contentWidth, align: 'right' });

          doc.restore();
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Gera relatório em formato Excel (.xlsx) com múltiplas abas.
   */
  async gerarExcel(dados: RelatoriosResult): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Alicerce Backend';
    workbook.created = new Date();

    // Aba 1: Fluxo de Caixa
    const sheetFluxo = workbook.addWorksheet('Fluxo de Caixa');
    sheetFluxo.columns = [
      { header: 'Métrica', key: 'metrica', width: 25 },
      { header: 'Valor (R$)', key: 'valor', width: 20 },
    ];
    sheetFluxo.addRows([
      { metrica: 'Saldo Inicial', valor: dados.fluxoCaixa.saldoInicial },
      { metrica: 'Entradas (+)', valor: dados.fluxoCaixa.entradas },
      { metrica: 'Saídas (-)', valor: dados.fluxoCaixa.saidas },
      { metrica: 'Resultado do Período', valor: dados.fluxoCaixa.resultadoPeriodo },
      { metrica: 'Saldo Final', valor: dados.fluxoCaixa.saldoFinal },
    ]);

    // Aba 2: Categorias
    const sheetCat = workbook.addWorksheet('Categorias');
    sheetCat.columns = [
      { header: 'ID Categoria', key: 'id', width: 36 },
      { header: 'Nome', key: 'nome', width: 25 },
      { header: 'Tipo', key: 'tipo', width: 15 },
      { header: 'Valor (R$)', key: 'valor', width: 15 },
      { header: 'Percentual (%)', key: 'percentual', width: 15 },
    ];
    for (const c of dados.categorias) {
      sheetCat.addRow({
        id: c.categoriaId,
        nome: c.nome,
        tipo: c.tipo,
        valor: c.valor,
        percentual: c.percentual,
      });
    }

    // Aba 3: Cartões de Crédito
    const sheetCartoes = workbook.addWorksheet('Cartões de Crédito');
    sheetCartoes.columns = [
      { header: 'ID Cartão', key: 'id', width: 36 },
      { header: 'Nome', key: 'nome', width: 25 },
      { header: 'Bandeira', key: 'bandeira', width: 15 },
      { header: 'Qtd Transações', key: 'qtd', width: 15 },
      { header: 'Valor Total (R$)', key: 'valorTotal', width: 20 },
    ];
    for (const cr of dados.cartoes) {
      sheetCartoes.addRow({
        id: cr.cartaoId,
        nome: cr.nome,
        bandeira: cr.bandeira,
        qtd: cr.qtdTransacoes,
        valorTotal: cr.valorTotal,
      });
    }

    // Aba 4: Metas e Projetos
    const sheetMP = workbook.addWorksheet('Metas e Projetos');
    sheetMP.columns = [
      { header: 'ID', key: 'id', width: 36 },
      { header: 'Tipo', key: 'tipo', width: 12 },
      { header: 'Nome', key: 'nome', width: 25 },
      { header: 'Valor Alvo/Estimado (R$)', key: 'alvo', width: 22 },
      { header: 'Valor Atual/Gasto (R$)', key: 'atual', width: 22 },
      { header: 'Progresso (%)', key: 'progresso', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
    ];
    for (const mp of dados.metasProjetos) {
      sheetMP.addRow({
        id: mp.id,
        tipo: mp.tipo,
        nome: mp.nome,
        alvo: mp.valorAlvoOuEstimado,
        atual: mp.valorAtualOuGasto,
        progresso: mp.progressoPercentual,
        status: mp.status,
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Gera relatório em formato CSV legível em UTF-8.
   */
  async gerarCSV(dados: RelatoriosResult): Promise<Buffer> {
    const lines: string[] = [];

    lines.push('=== RELATORIO FINANCEIRO ANALITICO ===');
    const dataInicioStr = dados.periodo?.dataInicio
      ? new Date(dados.periodo.dataInicio).toISOString()
      : '';
    const dataFimStr = dados.periodo?.dataFim
      ? new Date(dados.periodo.dataFim).toISOString()
      : '';
    lines.push(`Periodo;${dataInicioStr};${dataFimStr}`);
    lines.push('');

    lines.push('=== FLUXO DE CAIXA ===');
    lines.push('Saldo Inicial;Entradas;Saidas;Resultado do Periodo;Saldo Final');
    lines.push(
      `${dados.fluxoCaixa.saldoInicial};${dados.fluxoCaixa.entradas};${dados.fluxoCaixa.saidas};${dados.fluxoCaixa.resultadoPeriodo};${dados.fluxoCaixa.saldoFinal}`,
    );
    lines.push('');

    lines.push('=== CATEGORIAS ===');
    lines.push('ID;Nome;Tipo;Valor;Percentual');
    for (const c of dados.categorias) {
      lines.push(
        `"${c.categoriaId}";"${c.nome}";"${c.tipo}";${c.valor};${c.percentual}%`,
      );
    }
    lines.push('');

    lines.push('=== CARTOES DE CREDITO ===');
    lines.push('ID;Nome;Bandeira;Qtd Transacoes;Valor Total');
    for (const cr of dados.cartoes) {
      lines.push(
        `"${cr.cartaoId}";"${cr.nome}";"${cr.bandeira}";${cr.qtdTransacoes};${cr.valorTotal}`,
      );
    }
    lines.push('');

    lines.push('=== METAS E PROJETOS ===');
    lines.push('ID;Tipo;Nome;Valor Alvo/Estimado;Valor Atual/Gasto;Progresso (%);Status');
    for (const mp of dados.metasProjetos) {
      lines.push(
        `"${mp.id}";"${mp.tipo}";"${mp.nome}";${mp.valorAlvoOuEstimado};${mp.valorAtualOuGasto};${mp.progressoPercentual}%;"${mp.status}"`,
      );
    }

    return Buffer.from(lines.join('\n'), 'utf-8');
  }

  private desenharOrnamentoCanto(doc: PDFKit.PDFDocument, x: number, y: number): void {
    doc.save();
    doc.rect(x - 1.5, y - 1.5, 3, 3).fill('#C5A059');
    doc.restore();
  }

  private desenharTituloSecaoNobre(
    doc: PDFKit.PDFDocument,
    numero: string,
    titulo: string,
    subtitulo: string,
    x: number,
    y: number,
    width: number,
  ): number {
    doc.save();
    // Losango Dourado decorativo à esquerda
    const diamondX = x + 4;
    const diamondY = y + 5;
    doc.polygon([diamondX, diamondY - 4], [diamondX + 4, diamondY], [diamondX, diamondY + 4], [diamondX - 4, diamondY])
       .fill('#C5A059');

    // Título nobre em caixa alta
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#1E060D')
       .text(`${numero}. ${titulo}`, x + 14, y);

    if (subtitulo) {
      doc.font('Helvetica').fontSize(7.5).fillColor('#6B7280')
         .text(subtitulo, x + 14, y + 13);
    }

    // Régua divisória fina com detalhe dourado
    const ruleY = y + 25;
    doc.strokeColor('#E6DEC9').lineWidth(0.5)
       .moveTo(x, ruleY).lineTo(x + width, ruleY).stroke();
    doc.strokeColor('#C5A059').lineWidth(1.5)
       .moveTo(x, ruleY).lineTo(x + 45, ruleY).stroke();

    doc.restore();
    return ruleY + 8;
  }

  private desenharKpiCardChique(
    doc: PDFKit.PDFDocument,
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    valor: string,
    corTexto: string,
    corAcento: string,
    destaque = false,
  ): void {
    doc.save();
    const bgColor = destaque ? '#FDFBF7' : '#FCFBF9';
    doc.roundedRect(x, y, width, height, 5).fill(bgColor);

    const borderColor = destaque ? '#C5A059' : '#E6DEC9';
    const borderWidth = destaque ? 1 : 0.75;
    doc.roundedRect(x, y, width, height, 5).strokeColor(borderColor).lineWidth(borderWidth).stroke();

    // Friso superior de acento colorido (2.5px)
    doc.roundedRect(x + 1, y + 1, width - 2, 2.5, 1).fill(corAcento);

    // Label
    doc.font('Helvetica-Bold').fontSize(6.8).fillColor(destaque ? '#8C6D2D' : '#6B7280')
       .text(label, x + 8, y + 10, { width: width - 16 });

    // Valor Monetário Grande
    doc.font('Helvetica-Bold').fontSize(11.5).fillColor(corTexto)
       .text(valor, x + 8, y + 26, { width: width - 16 });

    doc.restore();
  }

  private desenharCabecalhoTabelaNobre(
    doc: PDFKit.PDFDocument,
    colunas: Array<{ title: string; width: number; align?: string }>,
    startX: number,
    startY: number,
    totalWidth: number,
  ): number {
    const rowHeight = 22;
    doc.save();
    doc.roundedRect(startX, startY, totalWidth, rowHeight, 3).fill('#1E060D');

    // Filetes Dourados superior e inferior no cabeçalho
    doc.strokeColor('#C5A059').lineWidth(0.8)
       .moveTo(startX, startY).lineTo(startX + totalWidth, startY).stroke();
    doc.strokeColor('#C5A059').lineWidth(0.8)
       .moveTo(startX, startY + rowHeight).lineTo(startX + totalWidth, startY + rowHeight).stroke();

    let currentX = startX;
    colunas.forEach(col => {
      doc.font('Helvetica-Bold').fontSize(7.2).fillColor('#E8D39E');
      doc.text(col.title, currentX + 6, startY + 7, {
        width: col.width - 12,
        align: (col.align as any) || 'left',
      });
      currentX += col.width;
    });
    doc.restore();
    return startY + rowHeight;
  }

  private desenharLinhaTabelaNobre(
    doc: PDFKit.PDFDocument,
    celulas: Array<{
      text: string;
      align?: string;
      font?: string;
      color?: string;
      fontSize?: number;
      typeBadge?: string;
      statusPill?: boolean;
      badge?: boolean;
      miniBar?: number;
    }>,
    colunas: Array<{ width: number; align?: string }>,
    startX: number,
    startY: number,
    totalWidth: number,
    bgColor: string,
  ): number {
    const rowHeight = 22;
    doc.save();
    doc.rect(startX, startY, totalWidth, rowHeight).fill(bgColor);

    doc.strokeColor('#EFEAE1').lineWidth(0.5)
       .moveTo(startX, startY + rowHeight).lineTo(startX + totalWidth, startY + rowHeight).stroke();

    let currentX = startX;
    celulas.forEach((cell, idx) => {
      const col = colunas[idx];

      if (cell.typeBadge) {
        const isMeta = cell.typeBadge === 'META';
        const bColor = isMeta ? '#FDF6E2' : '#FDF2F4';
        const tColor = isMeta ? '#8C6D2D' : '#881337';
        const bBorder = isMeta ? '#C5A059' : '#BE123C';
        const bW = 54;
        const bX = currentX + (col.width - bW) / 2;
        doc.roundedRect(bX, startY + 4.5, bW, 13, 3).fill(bColor);
        doc.roundedRect(bX, startY + 4.5, bW, 13, 3).strokeColor(bBorder).lineWidth(0.5).stroke();
        doc.font('Helvetica-Bold').fontSize(6.5).fillColor(tColor)
           .text(cell.text, bX, startY + 7.5, { width: bW, align: 'center' });
      } else if (cell.statusPill) {
        const s = cell.text;
        const isConcluido = s === 'CONCLUÍDO';
        const isAndamento = s === 'EM ANDAMENTO';
        const isAtiva = s === 'ATIVA' || s === 'ATIVO';

        let pBg = '#F3F4F6';
        let pText = '#4B5563';
        if (isConcluido) { pBg = '#ECFDF5'; pText = '#065F46'; }
        else if (isAndamento) { pBg = '#EFF6FF'; pText = '#1D4ED8'; }
        else if (isAtiva) { pBg = '#FEF3C7'; pText = '#92400E'; }

        const pW = col.width - 10;
        const pX = currentX + 5;
        doc.roundedRect(pX, startY + 4.5, pW, 13, 6.5).fill(pBg);
        doc.font('Helvetica-Bold').fontSize(6.2).fillColor(pText)
           .text(s, pX, startY + 7.5, { width: pW, align: 'center' });
      } else if (cell.badge) {
        const bW = col.width - 16;
        const bX = currentX + 8;
        doc.roundedRect(bX, startY + 4.5, bW, 13, 3).fill('#F3F4F6');
        doc.font('Helvetica-Bold').fontSize(6.8).fillColor('#374151')
           .text(cell.text, bX, startY + 7.5, { width: bW, align: 'center' });
      } else {
        doc.font((cell.font as any) || 'Helvetica').fontSize(cell.fontSize || 8).fillColor(cell.color || '#1F2937');
        doc.text(cell.text, currentX + 6, startY + 6.5, {
          width: col.width - 12,
          align: (cell.align as any) || 'left',
        });

        if (cell.miniBar !== undefined) {
          const barW = 32;
          const barH = 3.5;
          const barX = currentX + (col.width - barW) / 2;
          const barY = startY + 16;
          const pct = Math.max(0, Math.min(cell.miniBar, 100));

          doc.roundedRect(barX, barY, barW, barH, 1.5).fill('#E5E7EB');
          if (pct > 0) {
            const fillW = (pct / 100) * barW;
            const barColor = pct >= 100 ? '#059669' : '#C5A059';
            doc.roundedRect(barX, barY, fillW, barH, 1.5).fill(barColor);
          }
        }
      }
      currentX += col.width;
    });

    doc.restore();
    return startY + rowHeight;
  }

  private desenharLinhaVazia(doc: PDFKit.PDFDocument, mensagem: string, startX: number, startY: number, width: number): number {
    doc.save();
    doc.rect(startX, startY, width, 26).fill('#FAF9F6');
    doc.strokeColor('#EFEAE1').lineWidth(0.5)
       .moveTo(startX, startY + 26).lineTo(startX + width, startY + 26).stroke();
    doc.font('Helvetica-Oblique').fontSize(8).fillColor('#9CA3AF')
       .text(mensagem, startX, startY + 9, { width, align: 'center' });
    doc.restore();
    return startY + 26;
  }

  private formatarStatus(status: string | null | undefined): string {
    if (!status) return 'ATIVO';
    const s = String(status).toUpperCase();
    if (s === 'PLANEJAMENTO') return 'PLANEJADO';
    if (s === 'EM_ANDAMENTO') return 'EM ANDAMENTO';
    if (s === 'CONCLUIDO' || s === 'CONCLUIDA') return 'CONCLUÍDO';
    return s;
  }

  private formatarMoeda(valor: number | null | undefined): string {
    if (valor === null || valor === undefined || isNaN(valor) || !isFinite(valor)) {
      return '0,00';
    }
    return valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  private sanitizarNumero(valor: number | null | undefined): number {
    if (valor === null || valor === undefined || isNaN(valor) || !isFinite(valor)) {
      return 0;
    }
    return Math.round(valor * 100) / 100;
  }
}
