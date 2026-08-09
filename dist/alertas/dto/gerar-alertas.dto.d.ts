import { DespesaContexto, FaturaContexto, OrcamentoContexto, MetaContexto, SalarioContexto, WishlistContexto, SistemaContexto } from '../domain/alertas-engine.service';
export declare class GerarAlertasDto {
    referenceDate?: string;
    despesas?: DespesaContexto[];
    faturas?: FaturaContexto[];
    orcamentos?: OrcamentoContexto[];
    metas?: MetaContexto[];
    salarios?: SalarioContexto[];
    wishlist?: WishlistContexto[];
    sistemas?: SistemaContexto[];
}
