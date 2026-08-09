import { AlertasService } from './alertas.service';
import { ListarAlertasQueryDto } from './dto/listar-alertas-query.dto';
import { GerarAlertasDto } from './dto/gerar-alertas.dto';
export declare class AlertasController {
    private readonly alertasService;
    constructor(alertasService: AlertasService);
    listar(usuarioId: string, workspaceId: string, query: ListarAlertasQueryDto): Promise<{
        data: {
            severidade: import("./alertas.service").SeveridadeAlertaEnum;
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
    marcarTodosComoLidos(usuarioId: string, workspaceId: string): Promise<{
        count: number;
    }>;
    marcarComoLido(usuarioId: string, workspaceId: string, id: string): Promise<{
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
    gerar(usuarioId: string, workspaceId: string, dto: GerarAlertasDto): Promise<{
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
}
