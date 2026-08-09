import { SimulacaoService } from './simulacao.service';
import { SimularCenarioProjetoDto } from './dto/simular-cenario-projeto.dto';
import { AplicarCenarioProjetoDto } from './dto/aplicar-cenario-projeto.dto';
export declare class SimulacaoController {
    private readonly simulacaoService;
    constructor(simulacaoService: SimulacaoService);
    simular(workspaceId: string, id: string, dto: SimularCenarioProjetoDto): Promise<import("../read-models/projecao-cronograma-read-model.service").ProjecaoCronogramaPayload>;
    aplicar(workspaceId: string, id: string, dto: AplicarCenarioProjetoDto): Promise<import("../read-models/projecao-cronograma-read-model.service").ProjecaoCronogramaPayload>;
}
