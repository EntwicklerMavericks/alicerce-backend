import { Money } from '../../domain/value-objects/money.vo';
import { TipoMovimentacao, ReferenciaTipoMovimentacao, OrigemMovimentacao } from '@prisma/client';
export declare class LedgerEntry {
    readonly id: string;
    readonly workspaceId: string;
    readonly carteiraId: string;
    readonly criadoPorId: string | null;
    readonly tipo: TipoMovimentacao;
    readonly valor: Money;
    readonly data: Date;
    readonly referenciaTipo: ReferenciaTipoMovimentacao;
    readonly referenciaId: string;
    readonly origem: OrigemMovimentacao;
    readonly observacao?: string | undefined;
    constructor(id: string, workspaceId: string, carteiraId: string, criadoPorId: string | null, tipo: TipoMovimentacao, valor: Money, data: Date, referenciaTipo: ReferenciaTipoMovimentacao, referenciaId: string, origem?: OrigemMovimentacao, observacao?: string | undefined);
    static criar(params: {
        id?: string;
        workspaceId: string;
        carteiraId: string;
        criadoPorId?: string | null;
        tipo: TipoMovimentacao;
        valor: Money;
        data?: Date;
        referenciaTipo: ReferenciaTipoMovimentacao;
        referenciaId: string;
        origem?: OrigemMovimentacao;
        observacao?: string;
    }): LedgerEntry;
}
