export declare class AporteEtapaDto {
    etapaId: string;
    aporteMensal: number;
}
export declare class AjusteCustoEtapaDto {
    etapaId: string;
    multiplicadorCusto?: number;
    custoFixoAdicional?: number;
}
export declare class SimularCenarioProjetoDto {
    aporteMensalGlobal?: number;
    aportesMensaisEtapas?: Record<string, number> | AporteEtapaDto[];
    multiplicadorEsfriamento?: number;
    ajustesCustoEtapas?: Record<string, number> | AjusteCustoEtapaDto[];
    dataInicioSimulada?: string;
}
