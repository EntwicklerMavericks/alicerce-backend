import { TipoAlerta } from '@prisma/client';
export type SeveridadeAlerta = 'CRITICO' | 'ALTO' | 'MEDIO';
export interface AlertaCandidate {
    tipo: TipoAlerta;
    titulo: string;
    mensagem: string;
    tipoReferencia?: string;
    referenciaId?: string;
    competenciaConcreta?: string;
    severidade: SeveridadeAlerta;
}
export interface DespesaContexto {
    id: string;
    descricao: string;
    valor: number;
    dataVencimento: Date | string;
    status?: string;
}
export interface FaturaContexto {
    id: string;
    cartaoId?: string;
    cartaoNome?: string;
    valorTotal: number;
    dataVencimento: Date | string;
    status?: string;
}
export interface OrcamentoContexto {
    id: string;
    categoriaId: string;
    categoriaNome?: string;
    mes: number;
    ano: number;
    valorPlanejado: number;
    valorReal: number;
}
export interface MetaContexto {
    id: string;
    nome: string;
    valorAlvo: number;
    valorAtual: number;
    status?: string;
}
export interface SalarioContexto {
    id: string;
    pessoaId: string;
    pessoaNome?: string;
    mes: number;
    ano: number;
    valorReal?: number | null;
    status?: string;
}
export interface WishlistContexto {
    id: string;
    nome: string;
    precoAlvo?: number | null;
    menorPrecoCotacao?: number | null;
}
export interface SistemaContexto {
    id: string;
    titulo: string;
    mensagem: string;
    data?: Date | string;
}
export interface AlertasDetectionContext {
    referenceDate: Date;
    despesas?: DespesaContexto[];
    faturas?: FaturaContexto[];
    orcamentos?: OrcamentoContexto[];
    metas?: MetaContexto[];
    salarios?: SalarioContexto[];
    wishlist?: WishlistContexto[];
    sistemas?: SistemaContexto[];
}
export declare class AlertasEngineService {
    detectarAlertas(contexto: AlertasDetectionContext): AlertaCandidate[];
}
