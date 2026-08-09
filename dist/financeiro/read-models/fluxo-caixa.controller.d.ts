import { FluxoCaixaReadModelService } from './fluxo-caixa-read-model.service';
export declare class FluxoCaixaController {
    private readonly readModelService;
    constructor(readModelService: FluxoCaixaReadModelService);
    obterResumo(workspaceId: string, mes?: string, ano?: string): Promise<import("./fluxo-caixa-read-model.service").ResumoFluxoCaixa>;
}
