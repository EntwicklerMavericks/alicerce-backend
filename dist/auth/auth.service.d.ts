import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService);
    registrar(dto: RegistroDto): Promise<{
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
    atualizarToken(refreshTokenTextoPuro: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(refreshTokenTextoPuro: string): Promise<void>;
    obterPerfil(usuarioId: string): Promise<{
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
    private gerarTokensERegistrar;
    private hashSHA256;
}
