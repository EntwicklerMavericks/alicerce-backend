import { AuthService } from './auth.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    registro(dto: RegistroDto): Promise<{
        usuario: {
            id: string;
            nome: string;
            email: string;
        };
        workspaceAtivo: {
            id: string;
            nome: string;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    login(dto: LoginDto): Promise<{
        usuario: {
            id: string;
            nome: string;
            email: string;
        };
        workspaceAtivo: {
            id: string;
            nome: string;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    refresh(dto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(dto: RefreshTokenDto): Promise<void>;
    eu(usuarioId: string): Promise<{
        nome: string;
        email: string;
        id: string;
        avatarUrl: string | null;
        workspaces: {
            workspace: {
                nome: string;
                id: string;
                tipo: import("@prisma/client").$Enums.TipoWorkspace;
            };
            papel: import("@prisma/client").$Enums.PapelWorkspace;
        }[];
        configuracao: {
            id: string;
            dataAtualizacao: Date;
            tema: import("@prisma/client").$Enums.TemaInterface;
            moeda: string;
            estado: string | null;
            cidade: string | null;
            idioma: string;
            notificacoesAtivas: boolean;
            usuarioId: string;
        } | null;
    }>;
}
