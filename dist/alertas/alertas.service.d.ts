import { PrismaService } from '../prisma/prisma.service';
import { AlertasEngineService, AlertasDetectionContext } from './domain/alertas-engine.service';
import { TipoAlerta } from '@prisma/client';
export declare enum SeveridadeAlertaEnum {
    CRITICO = "CRITICO",
    ALTO = "ALTO",
    MEDIO = "MEDIO"
}
export interface ListarAlertasQuery {
    page?: number;
    pageSize?: number;
    apenasNaoLidos?: boolean | string;
    severidade?: SeveridadeAlertaEnum | string;
}
export declare function getSeveridadeFromTipo(tipo: TipoAlerta): SeveridadeAlertaEnum;
export declare function getSeveridadeRank(tipo: TipoAlerta): number;
export declare class AlertasService {
    private readonly prisma;
    private readonly alertasEngineService;
    constructor(prisma: PrismaService, alertasEngineService: AlertasEngineService);
    gerarESalvarAlertas(usuarioId: string, workspaceId: string, contexto: AlertasDetectionContext): Promise<{
        processados: number;
        filtrados: number;
        gerados: number;
        alertas: {
            id: string;
            tipo: import("@prisma/client").$Enums.TipoAlerta;
            usuarioId: string;
            workspaceId: string | null;
            referenciaId: string | null;
            mensagem: string;
            titulo: string;
            tipoReferencia: string | null;
            chaveIdempotencia: string | null;
            lido: boolean;
            dataLeitura: Date | null;
            dataDisparo: Date;
        }[];
    }>;
    listarAlertas(usuarioId: string, workspaceId: string, query: ListarAlertasQuery): Promise<{
        data: {
            severidade: SeveridadeAlertaEnum;
            id: string;
            tipo: import("@prisma/client").$Enums.TipoAlerta;
            usuarioId: string;
            workspaceId: string | null;
            referenciaId: string | null;
            mensagem: string;
            titulo: string;
            tipoReferencia: string | null;
            chaveIdempotencia: string | null;
            lido: boolean;
            dataLeitura: Date | null;
            dataDisparo: Date;
        }[];
        meta: {
            total: number;
            page: number;
            pageSize: number;
            totalPages: number;
        };
    }>;
    contarNaoLidos(usuarioId: string, workspaceId: string): Promise<{
        count: number;
    }>;
    marcarComoLido(usuarioId: string, workspaceId: string, alertaId: string): Promise<{
        id: string;
        tipo: import("@prisma/client").$Enums.TipoAlerta;
        usuarioId: string;
        workspaceId: string | null;
        referenciaId: string | null;
        mensagem: string;
        titulo: string;
        tipoReferencia: string | null;
        chaveIdempotencia: string | null;
        lido: boolean;
        dataLeitura: Date | null;
        dataDisparo: Date;
    }>;
    marcarTodosComoLidos(usuarioId: string, workspaceId: string): Promise<{
        count: number;
    }>;
}
