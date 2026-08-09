import type { Response } from 'express';
import { RelatoriosReadModelService } from './services/relatorios-read-model.service';
import { ExportadorRelatorioService } from './services/exportador-relatorio.service';
export declare class RelatoriosController {
    private readonly readModelService;
    private readonly exportadorService;
    constructor(readModelService: RelatoriosReadModelService, exportadorService: ExportadorRelatorioService);
    obterRelatorio(workspaceId: string, dataInicio?: string, dataFim?: string, referenceDate?: string): Promise<import("./services/relatorios-read-model.service").RelatoriosResult>;
    exportarPDF(workspaceId: string, res: Response, dataInicio?: string, dataFim?: string, referenceDate?: string): Promise<void>;
    exportarExcel(workspaceId: string, res: Response, dataInicio?: string, dataFim?: string, referenceDate?: string): Promise<void>;
    exportarCSV(workspaceId: string, res: Response, dataInicio?: string, dataFim?: string, referenceDate?: string): Promise<void>;
}
