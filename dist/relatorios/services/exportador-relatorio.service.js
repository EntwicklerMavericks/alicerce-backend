"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportadorRelatorioService = void 0;
const common_1 = require("@nestjs/common");
const pdfkit_1 = __importDefault(require("pdfkit"));
const ExcelJS = __importStar(require("exceljs"));
let ExportadorRelatorioService = class ExportadorRelatorioService {
    async gerarPDF(dados) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new pdfkit_1.default({ margin: 40, size: 'A4' });
                const chunks = [];
                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', (err) => reject(err));
                doc.fontSize(18).text('RELATÓRIO FINANCEIRO ANALÍTICO', { align: 'center' });
                doc.moveDown(0.5);
                const dataInicioStr = dados.periodo?.dataInicio
                    ? new Date(dados.periodo.dataInicio).toLocaleDateString('pt-BR')
                    : 'N/A';
                const dataFimStr = dados.periodo?.dataFim
                    ? new Date(dados.periodo.dataFim).toLocaleDateString('pt-BR')
                    : 'N/A';
                doc.fontSize(10).text(`Período: ${dataInicioStr} até ${dataFimStr}`, { align: 'center' });
                doc.moveDown(1.5);
                doc.fontSize(14).text('1. Resumo do Fluxo de Caixa', { underline: true });
                doc.moveDown(0.5);
                doc.fontSize(10);
                doc.text(`Saldo Inicial: R$ ${this.formatarMoeda(dados.fluxoCaixa.saldoInicial)}`);
                doc.text(`Entradas (+): R$ ${this.formatarMoeda(dados.fluxoCaixa.entradas)}`);
                doc.text(`Saídas (-): R$ ${this.formatarMoeda(dados.fluxoCaixa.saidas)}`);
                doc.text(`Resultado do Período: R$ ${this.formatarMoeda(dados.fluxoCaixa.resultadoPeriodo)}`);
                doc.text(`Saldo Final: R$ ${this.formatarMoeda(dados.fluxoCaixa.saldoFinal)}`);
                doc.moveDown(1.5);
                doc.fontSize(14).text('2. Despesas por Categoria', { underline: true });
                doc.moveDown(0.5);
                doc.fontSize(10);
                if (dados.categorias.length === 0) {
                    doc.text('Nenhuma categoria registrada no período.');
                }
                else {
                    for (const cat of dados.categorias) {
                        doc.text(`- ${cat.nome} (${cat.tipo}): R$ ${this.formatarMoeda(cat.valor)} (${cat.percentual.toFixed(2)}%)`);
                    }
                }
                doc.moveDown(1.5);
                doc.fontSize(14).text('3. Cartões de Crédito', { underline: true });
                doc.moveDown(0.5);
                doc.fontSize(10);
                if (dados.cartoes.length === 0) {
                    doc.text('Nenhum cartão ativo no período.');
                }
                else {
                    for (const cr of dados.cartoes) {
                        doc.text(`- ${cr.nome} [${cr.bandeira}]: R$ ${this.formatarMoeda(cr.valorTotal)} (${cr.qtdTransacoes} transações)`);
                    }
                }
                doc.moveDown(1.5);
                doc.fontSize(14).text('4. Metas e Projetos', { underline: true });
                doc.moveDown(0.5);
                doc.fontSize(10);
                if (dados.metasProjetos.length === 0) {
                    doc.text('Nenhuma meta ou projeto cadastrado.');
                }
                else {
                    for (const mp of dados.metasProjetos) {
                        doc.text(`- [${mp.tipo}] ${mp.nome}: ${mp.progressoPercentual.toFixed(2)}% | Alvo: R$ ${this.formatarMoeda(mp.valorAlvoOuEstimado)} | Atual: R$ ${this.formatarMoeda(mp.valorAtualOuGasto)} | Status: ${mp.status}`);
                    }
                }
                doc.end();
            }
            catch (error) {
                reject(error);
            }
        });
    }
    async gerarExcel(dados) {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Alicerce Backend';
        workbook.created = new Date();
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
    async gerarCSV(dados) {
        const lines = [];
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
        lines.push(`${dados.fluxoCaixa.saldoInicial};${dados.fluxoCaixa.entradas};${dados.fluxoCaixa.saidas};${dados.fluxoCaixa.resultadoPeriodo};${dados.fluxoCaixa.saldoFinal}`);
        lines.push('');
        lines.push('=== CATEGORIAS ===');
        lines.push('ID;Nome;Tipo;Valor;Percentual');
        for (const c of dados.categorias) {
            lines.push(`"${c.categoriaId}";"${c.nome}";"${c.tipo}";${c.valor};${c.percentual}%`);
        }
        lines.push('');
        lines.push('=== CARTOES DE CREDITO ===');
        lines.push('ID;Nome;Bandeira;Qtd Transacoes;Valor Total');
        for (const cr of dados.cartoes) {
            lines.push(`"${cr.cartaoId}";"${cr.nome}";"${cr.bandeira}";${cr.qtdTransacoes};${cr.valorTotal}`);
        }
        lines.push('');
        lines.push('=== METAS E PROJETOS ===');
        lines.push('ID;Tipo;Nome;Valor Alvo/Estimado;Valor Atual/Gasto;Progresso (%);Status');
        for (const mp of dados.metasProjetos) {
            lines.push(`"${mp.id}";"${mp.tipo}";"${mp.nome}";${mp.valorAlvoOuEstimado};${mp.valorAtualOuGasto};${mp.progressoPercentual}%;"${mp.status}"`);
        }
        return Buffer.from(lines.join('\n'), 'utf-8');
    }
    formatarMoeda(valor) {
        return (valor || 0).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }
};
exports.ExportadorRelatorioService = ExportadorRelatorioService;
exports.ExportadorRelatorioService = ExportadorRelatorioService = __decorate([
    (0, common_1.Injectable)()
], ExportadorRelatorioService);
//# sourceMappingURL=exportador-relatorio.service.js.map