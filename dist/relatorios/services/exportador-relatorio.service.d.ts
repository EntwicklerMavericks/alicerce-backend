import { RelatoriosResult } from './relatorios-read-model.service';
export declare class ExportadorRelatorioService {
    gerarPDF(dados: RelatoriosResult): Promise<Buffer>;
    gerarExcel(dados: RelatoriosResult): Promise<Buffer>;
    gerarCSV(dados: RelatoriosResult): Promise<Buffer>;
    private formatarMoeda;
}
