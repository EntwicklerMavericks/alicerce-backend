import { Money } from '../value-objects/money.vo';
import { YearMonth } from '../value-objects/year-month.vo';
export declare class OrcamentoAggregate {
    readonly id: string;
    readonly workspaceId: string;
    readonly categoriaId: string;
    readonly competencia: YearMonth;
    private _teto;
    constructor(id: string, workspaceId: string, categoriaId: string, competencia: YearMonth, teto: Money);
    get teto(): Money;
    atualizarTeto(novoTeto: Money): void;
}
