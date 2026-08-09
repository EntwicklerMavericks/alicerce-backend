import { SimularCenarioProjetoDto } from './simular-cenario-projeto.dto';
export declare class VersaoEtapaEsperadaDto {
    etapaId: string;
    versaoEsperada: number;
}
export declare class AplicarCenarioProjetoDto {
    versaoProjetoEsperada: number;
    versoesEtapasEsperadas?: VersaoEtapaEsperadaDto[];
    parametrosSimulacao: SimularCenarioProjetoDto;
}
