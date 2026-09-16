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
   * Gera relatório em formato Excel (.xlsx) Executivo de Alto Padrão com Design System Alicerce.
   */
  async gerarExcel(dados: RelatoriosResult): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Alicerce Family Office & Private Analytics';
    workbook.lastModifiedBy = 'Alicerce Core';
    workbook.created = new Date();
    workbook.modified = new Date();

    const dInicio = dados.periodo?.dataInicio ? new Date(dados.periodo.dataInicio).toLocaleDateString('pt-BR') : 'N/A';
    const dFim = dados.periodo?.dataFim ? new Date(dados.periodo.dataFim).toLocaleDateString('pt-BR') : 'N/A';
    const emissao = new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // Cores Institucionais
    const COLOR_BORDO_PRIMARY = '1E060D';
    const COLOR_BORDO_LIGHT = '2D0B14';
    const COLOR_GOLD_PRIMARY = 'C5A059';
    const COLOR_GOLD_CHAMPAGNE = 'E8D39E';
    const COLOR_ZEBRA_BG = 'FAF9F6';
    const COLOR_BORDER = 'E6DEC9';

    const aplicarCabecalhoInstitucional = (sheet: ExcelJS.Worksheet, tituloAba: string, maxCol: number) => {
      sheet.views = [{ showGridLines: true }];

      // Linha 1: Título Marca
      sheet.mergeCells(1, 1, 1, maxCol);
      const row1 = sheet.getRow(1);
      row1.height = 36;
      const cell1 = sheet.getCell('A1');
      cell1.value = 'ALICERCE   •   FAMILY OFFICE & PRIVATE WEALTH MANAGEMENT';
      cell1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_BORDO_PRIMARY } };
      cell1.font = { name: 'Segoe UI', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
      cell1.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

      // Linha 2: Subtítulo
      sheet.mergeCells(2, 1, 2, maxCol);
      const row2 = sheet.getRow(2);
      row2.height = 24;
      const cell2 = sheet.getCell('A2');
      cell2.value = tituloAba.toUpperCase();
      cell2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_BORDO_LIGHT } };
      cell2.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: COLOR_GOLD_CHAMPAGNE } };
      cell2.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

      // Linha 3: Metadados
      sheet.mergeCells(3, 1, 3, maxCol);
      const row3 = sheet.getRow(3);
      row3.height = 20;
      const cell3 = sheet.getCell('A3');
      cell3.value = `Competência: ${dInicio} até ${dFim}   |   Emissão: ${emissao}   |   Base: Auditada e Consolidada`;
      cell3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FBF9F5' } };
      cell3.font = { name: 'Segoe UI', size: 8.5, italic: true, color: { argb: '6B7280' } };
      cell3.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      cell3.border = { bottom: { style: 'thin', color: { argb: COLOR_BORDER } } };

      // Linha 4: Espaço
      sheet.getRow(4).height = 12;
    };

    // ==========================================
    // ABA 1: FLUXO DE CAIXA
    // ==========================================
    const sheetFluxo = workbook.addWorksheet('Fluxo de Caixa', {
      properties: { tabColor: { argb: COLOR_GOLD_PRIMARY } },
    });
    aplicarCabecalhoInstitucional(sheetFluxo, 'Resumo Executivo do Fluxo de Caixa', 3);

    sheetFluxo.getColumn(1).width = 34;
    sheetFluxo.getColumn(2).width = 25;
    sheetFluxo.getColumn(3).width = 30;

    const headerFluxo = sheetFluxo.getRow(5);
    headerFluxo.height = 24;
    headerFluxo.values = ['Métrica Patrimonial', 'Valor Consolidado (R$)', 'Status / Observação'];
    headerFluxo.eachCell((cell, colNumber) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_BORDO_PRIMARY } };
      cell.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: COLOR_GOLD_CHAMPAGNE } };
      cell.alignment = { vertical: 'middle', horizontal: colNumber === 2 ? 'right' : 'left' };
      cell.border = {
        top: { style: 'thin', color: { argb: COLOR_GOLD_PRIMARY } },
        bottom: { style: 'thin', color: { argb: COLOR_GOLD_PRIMARY } },
      };
    });

    const resPeriodo = this.sanitizarNumero(dados.fluxoCaixa.resultadoPeriodo);
    const taxaPoupanca = this.sanitizarNumero(dados.fluxoCaixa.taxaPoupanca ?? 0);

    const itensFluxo = [
      { metrica: 'Saldo Inicial de Caixa', valor: this.sanitizarNumero(dados.fluxoCaixa.saldoInicial), obs: 'Posição na data inicial', numFmt: '"R$" #,##0.00', color: '475569' },
      { metrica: 'Receitas Totais (+)', valor: this.sanitizarNumero(dados.fluxoCaixa.entradas), obs: 'Entradas e proventos realizados', numFmt: '"R$" #,##0.00', color: '047857' },
      { metrica: 'Despesas Totais (-)', valor: this.sanitizarNumero(dados.fluxoCaixa.saidas), obs: 'Saídas e pagamentos efetuados', numFmt: '"R$" #,##0.00', color: 'B91C1C' },
      { metrica: 'Resultado Líquido do Período', valor: resPeriodo, obs: resPeriodo >= 0 ? 'Superávit no período' : 'Déficit no período', numFmt: '"+" "R$" #,##0.00; "-" "R$" #,##0.00', color: resPeriodo >= 0 ? '047857' : 'B91C1C', bold: true, bg: 'FAF9F6' },
      { metrica: 'Saldo Final Consolidado', valor: this.sanitizarNumero(dados.fluxoCaixa.saldoFinal), obs: 'Disponibilidade imediata apurada', numFmt: '"R$" #,##0.00', color: '1E060D', bold: true, bg: 'FDFBF7', doubleBottom: true },
    ];

    itensFluxo.forEach((item, idx) => {
      const rIdx = 6 + idx;
      const row = sheetFluxo.getRow(rIdx);
      row.height = 22;
      row.values = [item.metrica, item.valor, item.obs];

      const bg = item.bg || (idx % 2 === 0 ? 'FFFFFF' : COLOR_ZEBRA_BG);
      row.getCell(1).font = { name: 'Segoe UI', size: 9.5, bold: !!item.bold, color: { argb: '1F2937' } };
      row.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' };
      row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

      row.getCell(2).font = { name: 'Segoe UI', size: 10, bold: !!item.bold, color: { argb: item.color || '1F2937' } };
      row.getCell(2).alignment = { vertical: 'middle', horizontal: 'right' };
      row.getCell(2).numFmt = item.numFmt;
      row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

      row.getCell(3).font = { name: 'Segoe UI', size: 8.5, color: { argb: '6B7280' } };
      row.getCell(3).alignment = { vertical: 'middle', horizontal: 'left' };
      row.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };

      const borderStyle = item.doubleBottom ? 'double' : 'thin';
      row.eachCell(cell => {
        cell.border = {
          bottom: { style: borderStyle, color: { argb: item.doubleBottom ? COLOR_GOLD_PRIMARY : COLOR_BORDER } },
        };
      });
    });

    // Indicadores Complementares
    sheetFluxo.getRow(12).height = 12;
    const rIndicadores = sheetFluxo.getRow(13);
    rIndicadores.height = 22;
    rIndicadores.values = ['Taxa de Poupança Acumulada', taxaPoupanca / 100, resPeriodo >= 0 ? 'Eficiência Financeira Alta' : 'Atenção ao Fluxo'];
    rIndicadores.getCell(1).font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: '6B7280' } };
    rIndicadores.getCell(2).font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: '8C6D2D' } };
    rIndicadores.getCell(2).numFmt = '0.0%';
    rIndicadores.getCell(2).alignment = { vertical: 'middle', horizontal: 'right' };
    rIndicadores.getCell(3).font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: resPeriodo >= 0 ? '047857' : 'B91C1C' } };

    // ==========================================
    // ABA 2: CATEGORIAS
    // ==========================================
    const sheetCat = workbook.addWorksheet('Despesas por Categoria', {
      properties: { tabColor: { argb: '881337' } },
    });
    aplicarCabecalhoInstitucional(sheetCat, 'Composição de Despesas por Categoria', 5);

    sheetCat.getColumn(1).width = 32;
    sheetCat.getColumn(2).width = 18;
    sheetCat.getColumn(3).width = 18;
    sheetCat.getColumn(4).width = 24;
    sheetCat.getColumn(5).width = 20;

    const headerCat = sheetCat.getRow(5);
    headerCat.height = 24;
    headerCat.values = ['Categoria', 'Natureza', 'Lançamentos', 'Valor Total (R$)', 'Participação (%)'];
    headerCat.eachCell((cell, colNumber) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_BORDO_PRIMARY } };
      cell.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: COLOR_GOLD_CHAMPAGNE } };
      cell.alignment = { vertical: 'middle', horizontal: colNumber >= 3 ? (colNumber === 3 ? 'center' : 'right') : 'left' };
      cell.border = { top: { style: 'thin', color: { argb: COLOR_GOLD_PRIMARY } }, bottom: { style: 'thin', color: { argb: COLOR_GOLD_PRIMARY } } };
    });

    const cats = Array.isArray(dados.categorias) ? dados.categorias : (dados.categorias as any)?.distribuicaoDespesas || [];
    cats.forEach((c: any, idx: number) => {
      const rIdx = 6 + idx;
      const row = sheetCat.getRow(rIdx);
      row.height = 20;
      const v = this.sanitizarNumero(c.valor);
      const p = this.sanitizarNumero(c.percentual);

      row.values = [c.nome, c.tipo || 'DESPESA', c.quantidadeLancamentos ?? 1, v, p / 100];

      const bg = idx % 2 === 0 ? 'FFFFFF' : COLOR_ZEBRA_BG;
      row.getCell(1).font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: '1F2937' } };
      row.getCell(2).font = { name: 'Segoe UI', size: 8.5, color: { argb: '6B7280' } };
      row.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell(3).font = { name: 'Segoe UI', size: 9, color: { argb: '4B5563' } };
      row.getCell(3).alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell(4).font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: '1F2937' } };
      row.getCell(4).numFmt = '"R$" #,##0.00';
      row.getCell(4).alignment = { vertical: 'middle', horizontal: 'right' };
      row.getCell(5).font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: '8C6D2D' } };
      row.getCell(5).numFmt = '0.0%';
      row.getCell(5).alignment = { vertical: 'middle', horizontal: 'right' };

      row.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
        cell.border = { bottom: { style: 'thin', color: { argb: COLOR_BORDER } } };
      });
    });

    if (cats.length > 0) {
      const rTot = 6 + cats.length;
      const rowTot = sheetCat.getRow(rTot);
      rowTot.height = 22;
      rowTot.values = ['TOTAL CONSOLIDADO', '', { formula: `SUM(C6:C${rTot - 1})` }, { formula: `SUM(D6:D${rTot - 1})` }, 1.0];
      rowTot.getCell(1).font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: '1E060D' } };
      rowTot.getCell(3).font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: '1E060D' } };
      rowTot.getCell(3).alignment = { vertical: 'middle', horizontal: 'center' };
      rowTot.getCell(4).font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: '1E060D' } };
      rowTot.getCell(4).numFmt = '"R$" #,##0.00';
      rowTot.getCell(4).alignment = { vertical: 'middle', horizontal: 'right' };
      rowTot.getCell(5).font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: '8C6D2D' } };
      rowTot.getCell(5).numFmt = '0.0%';
      rowTot.getCell(5).alignment = { vertical: 'middle', horizontal: 'right' };
      rowTot.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FDFBF7' } };
        cell.border = {
          top: { style: 'thin', color: { argb: COLOR_BORDER } },
          bottom: { style: 'double', color: { argb: COLOR_GOLD_PRIMARY } },
        };
      });
    }

    // ==========================================
    // ABA 3: CARTÕES DE CRÉDITO
    // ==========================================
    const sheetCartoes = workbook.addWorksheet('Cartões de Crédito', {
      properties: { tabColor: { argb: COLOR_BORDO_PRIMARY } },
    });
    aplicarCabecalhoInstitucional(sheetCartoes, 'Extrato de Cartões de Crédito e Faturas', 6);

    sheetCartoes.getColumn(1).width = 30;
    sheetCartoes.getColumn(2).width = 18;
    sheetCartoes.getColumn(3).width = 18;
    sheetCartoes.getColumn(4).width = 24;
    sheetCartoes.getColumn(5).width = 24;
    sheetCartoes.getColumn(6).width = 20;

    const headerCartao = sheetCartoes.getRow(5);
    headerCartao.height = 24;
    headerCartao.values = ['Nome do Cartão', 'Bandeira', 'Transações', 'Fatura Atual (R$)', 'Limite Total (R$)', 'Uso de Limite (%)'];
    headerCartao.eachCell((cell, colNumber) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_BORDO_PRIMARY } };
      cell.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: COLOR_GOLD_CHAMPAGNE } };
      cell.alignment = { vertical: 'middle', horizontal: colNumber >= 3 ? (colNumber === 3 ? 'center' : 'right') : 'left' };
      cell.border = { top: { style: 'thin', color: { argb: COLOR_GOLD_PRIMARY } }, bottom: { style: 'thin', color: { argb: COLOR_GOLD_PRIMARY } } };
    });

    const cartoes = Array.isArray(dados.cartoes) ? dados.cartoes : (dados.cartoes as any)?.usoPorCartao || [];
    cartoes.forEach((cr: any, idx: number) => {
      const rIdx = 6 + idx;
      const row = sheetCartoes.getRow(rIdx);
      row.height = 20;
      const lim = this.sanitizarNumero(cr.limiteTotal || 0);
      const fat = this.sanitizarNumero(cr.valorTotal ?? cr.valorFaturaAtual ?? 0);
      const usoPct = lim > 0 ? fat / lim : 0;

      row.values = [cr.nomeCartao || cr.nome, cr.bandeira || 'OUTROS', cr.qtdTransacoes || 0, fat, lim, usoPct];

      const bg = idx % 2 === 0 ? 'FFFFFF' : COLOR_ZEBRA_BG;
      row.getCell(1).font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: '1F2937' } };
      row.getCell(2).font = { name: 'Segoe UI', size: 8.5, color: { argb: '4B5563' } };
      row.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell(3).font = { name: 'Segoe UI', size: 9, color: { argb: '6B7280' } };
      row.getCell(3).alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell(4).font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: fat > 0 ? '1E060D' : '6B7280' } };
      row.getCell(4).numFmt = '"R$" #,##0.00';
      row.getCell(4).alignment = { vertical: 'middle', horizontal: 'right' };
      row.getCell(5).font = { name: 'Segoe UI', size: 9.5, color: { argb: '4B5563' } };
      row.getCell(5).numFmt = '"R$" #,##0.00';
      row.getCell(5).alignment = { vertical: 'middle', horizontal: 'right' };
      row.getCell(6).font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: usoPct > 0.7 ? 'B91C1C' : '8C6D2D' } };
      row.getCell(6).numFmt = '0.0%';
      row.getCell(6).alignment = { vertical: 'middle', horizontal: 'right' };

      row.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
        cell.border = { bottom: { style: 'thin', color: { argb: COLOR_BORDER } } };
      });
    });

    // ==========================================
    // ABA 4: METAS E PROJETOS
    // ==========================================
    const sheetMP = workbook.addWorksheet('Metas e Projetos', {
      properties: { tabColor: { argb: '059669' } },
    });
    aplicarCabecalhoInstitucional(sheetMP, 'Acompanhamento de Metas e Projetos Estratégicos', 6);

    sheetMP.getColumn(1).width = 16;
    sheetMP.getColumn(2).width = 36;
    sheetMP.getColumn(3).width = 24;
    sheetMP.getColumn(4).width = 24;
    sheetMP.getColumn(5).width = 18;
    sheetMP.getColumn(6).width = 20;

    const headerMP = sheetMP.getRow(5);
    headerMP.height = 24;
    headerMP.values = ['Tipo', 'Objetivo / Projeto', 'Valor Atual (R$)', 'Valor Alvo / Estimado (R$)', 'Progresso (%)', 'Status'];
    headerMP.eachCell((cell, colNumber) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_BORDO_PRIMARY } };
      cell.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: COLOR_GOLD_CHAMPAGNE } };
      cell.alignment = { vertical: 'middle', horizontal: colNumber >= 3 ? (colNumber >= 5 ? 'center' : 'right') : 'left' };
      cell.border = { top: { style: 'thin', color: { argb: COLOR_GOLD_PRIMARY } }, bottom: { style: 'thin', color: { argb: COLOR_GOLD_PRIMARY } } };
    });

    const metasProj = Array.isArray(dados.metasProjetos) ? dados.metasProjetos : [
      ...((dados.metasProjetos as any)?.metasStatus || []),
      ...((dados.metasProjetos as any)?.projetosStatus || []),
    ];

    metasProj.forEach((mp: any, idx: number) => {
      const rIdx = 6 + idx;
      const row = sheetMP.getRow(rIdx);
      row.height = 20;
      const prog = this.sanitizarNumero(mp.progressoPercentual ?? mp.percentualConcluido ?? mp.percentualProgresso ?? 0) / 100;
      const tipo = mp.tipo || (mp.metaId ? 'META' : 'PROJETO');
      const nome = mp.nome || mp.titulo;
      const atual = this.sanitizarNumero(mp.valorAtualOuGasto ?? mp.valorAtual ?? mp.valorGasto ?? 0);
      const alvo = this.sanitizarNumero(mp.valorAlvoOuEstimado ?? mp.valorAlvo ?? mp.orcamentoTotal ?? 0);
      const status = this.formatarStatus(mp.status);

      row.values = [tipo, nome, atual, alvo, prog, status];

      const bg = idx % 2 === 0 ? 'FFFFFF' : COLOR_ZEBRA_BG;
      row.getCell(1).font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: tipo === 'META' ? '8C6D2D' : '881337' } };
      row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell(2).font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: '1F2937' } };
      row.getCell(3).font = { name: 'Segoe UI', size: 9.5, color: { argb: '1F2937' } };
      row.getCell(3).numFmt = '"R$" #,##0.00';
      row.getCell(3).alignment = { vertical: 'middle', horizontal: 'right' };
      row.getCell(4).font = { name: 'Segoe UI', size: 9.5, color: { argb: '6B7280' } };
      row.getCell(4).numFmt = '"R$" #,##0.00';
      row.getCell(4).alignment = { vertical: 'middle', horizontal: 'right' };
      row.getCell(5).font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: prog >= 1 ? '047857' : '8C6D2D' } };
      row.getCell(5).numFmt = '0.0%';
      row.getCell(5).alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell(6).font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: status === 'CONCLUÍDO' ? '047857' : '4B5563' } };
      row.getCell(6).alignment = { vertical: 'middle', horizontal: 'center' };

      row.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
        cell.border = { bottom: { style: 'thin', color: { argb: COLOR_BORDER } } };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Gera relatório em formato CSV Executivo com codificação UTF-8 (BOM).
   */
  async gerarCSV(dados: RelatoriosResult): Promise<Buffer> {
    const lines: string[] = [];

    const dInicio = dados.periodo?.dataInicio
      ? new Date(dados.periodo.dataInicio).toLocaleDateString('pt-BR')
      : 'N/A';
    const dFim = dados.periodo?.dataFim
      ? new Date(dados.periodo.dataFim).toLocaleDateString('pt-BR')
      : 'N/A';
    const emissao = new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // 1. Cabeçalho Corporativo
    lines.push('ALICERCE • FAMILY OFFICE & PRIVATE WEALTH MANAGEMENT');
    lines.push('RELATÓRIO FINANCEIRO ANALÍTICO');
    lines.push(`Competência: ${dInicio} até ${dFim};Emissão: ${emissao};Base: Auditada e Consolidada`);
    lines.push('');

    // 2. Seção I: Fluxo de Caixa
    lines.push('[I. RESUMO EXECUTIVO DO FLUXO DE CAIXA]');
    lines.push('Métrica Patrimonial;Valor Consolidado (R$);Status / Observação');

    const sInicial = this.sanitizarNumero(dados.fluxoCaixa.saldoInicial);
    const entradas = this.sanitizarNumero(dados.fluxoCaixa.entradas);
    const saidas = this.sanitizarNumero(dados.fluxoCaixa.saidas);
    const resPeriodo = this.sanitizarNumero(dados.fluxoCaixa.resultadoPeriodo);
    const sFinal = this.sanitizarNumero(dados.fluxoCaixa.saldoFinal);
    const taxaPoupanca = this.sanitizarNumero(dados.fluxoCaixa.taxaPoupanca ?? 0);

    lines.push(`Saldo Inicial de Caixa;${this.formatarMoeda(sInicial)};Posição na data inicial`);
    lines.push(`Receitas Totais (+);${this.formatarMoeda(entradas)};Entradas e proventos realizados`);
    lines.push(`Despesas Totais (-);${this.formatarMoeda(saidas)};Saídas e pagamentos efetuados`);
    lines.push(`Resultado Líquido do Período;${resPeriodo >= 0 ? '+' : ''}${this.formatarMoeda(resPeriodo)};${resPeriodo >= 0 ? 'Superávit no período' : 'Déficit no período'}`);
    lines.push(`Saldo Final Consolidado;${this.formatarMoeda(sFinal)};Disponibilidade imediata apurada`);
    lines.push(`Taxa de Poupança Acumulada;${taxaPoupanca.toFixed(1)}%;${resPeriodo >= 0 ? 'Eficiência Financeira Alta' : 'Atenção ao Fluxo'}`);
    lines.push('');

    // 3. Seção II: Categorias
    lines.push('[II. COMPOSIÇÃO DE DESPESAS POR CATEGORIA]');
    lines.push('Categoria;Natureza;Lançamentos;Valor Total (R$);Participação (%)');

    const cats = Array.isArray(dados.categorias) ? dados.categorias : ((dados.categorias as any)?.distribuicaoDespesas || []);
    let totalCatValor = 0;
    let totalCatLancamentos = 0;

    for (const c of cats) {
      const v = this.sanitizarNumero(c.valor);
      const p = this.sanitizarNumero(c.percentual);
      const qtd = c.quantidadeLancamentos ?? 1;
      totalCatValor += v;
      totalCatLancamentos += qtd;
      lines.push(`"${c.nome}";"${c.tipo || 'DESPESA'}";${qtd};${this.formatarMoeda(v)};${p.toFixed(1)}%`);
    }

    if (cats.length > 0) {
      lines.push(`TOTAL CONSOLIDADO;;${totalCatLancamentos};${this.formatarMoeda(totalCatValor)};100,0%`);
    }
    lines.push('');

    // 4. Seção III: Cartões de Crédito
    lines.push('[III. CARTÕES DE CRÉDITO & FATURAS]');
    lines.push('Nome do Cartão;Bandeira;Transações;Fatura Atual (R$);Limite Total (R$);Uso de Limite (%)');

    const cartoes = Array.isArray(dados.cartoes) ? dados.cartoes : ((dados.cartoes as any)?.usoPorCartao || []);
    for (const cr of cartoes) {
      const lim = this.sanitizarNumero(cr.limiteTotal || 0);
      const fat = this.sanitizarNumero(cr.valorTotal ?? cr.valorFaturaAtual ?? 0);
      const usoPct = lim > 0 ? (fat / lim) * 100 : 0;
      const qtd = cr.qtdTransacoes || 0;
      const textoQtd = qtd === 1 ? '1 compra' : `${qtd} compras`;
      lines.push(`"${cr.nomeCartao || cr.nome}";"${cr.bandeira || 'OUTROS'}";${textoQtd};${this.formatarMoeda(fat)};${this.formatarMoeda(lim)};${usoPct.toFixed(1)}%`);
    }
    lines.push('');

    // 5. Seção IV: Metas e Projetos
    lines.push('[IV. METAS E PROJETOS ESTRATÉGICOS]');
    lines.push('Tipo;Objetivo / Projeto;Valor Atual (R$);Valor Alvo / Estimado (R$);Progresso (%);Status');

    const metasProj = Array.isArray(dados.metasProjetos) ? dados.metasProjetos : [
      ...((dados.metasProjetos as any)?.metasStatus || []),
      ...((dados.metasProjetos as any)?.projetosStatus || []),
    ];

    for (const mp of metasProj) {
      const prog = this.sanitizarNumero(mp.progressoPercentual ?? mp.percentualConcluido ?? mp.percentualProgresso ?? 0);
      const tipo = mp.tipo || (mp.metaId ? 'META' : 'PROJETO');
      const nome = mp.nome || mp.titulo;
      const atual = this.sanitizarNumero(mp.valorAtualOuGasto ?? mp.valorAtual ?? mp.valorGasto ?? 0);
      const alvo = this.sanitizarNumero(mp.valorAlvoOuEstimado ?? mp.valorAlvo ?? mp.orcamentoTotal ?? 0);
      const status = this.formatarStatus(mp.status);

      lines.push(`"${tipo}";"${nome}";${this.formatarMoeda(atual)};${this.formatarMoeda(alvo)};${prog.toFixed(1)}%;"${status}"`);
    }

    // Adicionar UTF-8 BOM (\uFEFF) para garantir renderização de acentos no Excel / WPS Office do Windows
    return Buffer.from('\uFEFF' + lines.join('\r\n'), 'utf-8');
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
