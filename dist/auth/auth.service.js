"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async registrar(dto) {
        const emailExistente = await this.prisma.usuario.findUnique({
            where: { email: dto.email.toLowerCase().trim() },
        });
        if (emailExistente) {
            throw new common_1.BadRequestException('E-mail já cadastrado no sistema.');
        }
        const senhaHash = await bcrypt.hash(dto.senha, 10);
        const resultado = await this.prisma.$transaction(async (tx) => {
            const usuario = await tx.usuario.create({
                data: {
                    nome: dto.nome.trim(),
                    email: dto.email.toLowerCase().trim(),
                    senhaHash,
                    configuracao: {
                        create: {
                            tema: 'CLARO',
                            moeda: 'BRL',
                            idioma: 'pt-BR',
                        },
                    },
                },
            });
            const workspace = await tx.workspace.create({
                data: {
                    nome: 'Workspace Principal',
                    proprietarioId: usuario.id,
                    tipo: 'PESSOAL',
                    membros: {
                        create: {
                            usuarioId: usuario.id,
                            papel: 'PROPRIETARIO',
                        },
                    },
                    carteiras: {
                        create: {
                            nome: 'Conta Corrente',
                            tipo: 'CONTA_CORRENTE',
                            saldo: 0,
                            padrao: true,
                            icone: 'account_balance_wallet',
                            cor: '#d8b87e',
                        },
                    },
                    categorias: {
                        createMany: {
                            data: [
                                { nome: 'Alimentação', tipo: 'DESPESA', icone: 'restaurant', cor: '#ef4444', sistema: true },
                                { nome: 'Moradia', tipo: 'DESPESA', icone: 'home', cor: '#3b82f6', sistema: true },
                                { nome: 'Transporte', tipo: 'DESPESA', icone: 'directions_car', cor: '#f59e0b', sistema: true },
                                { nome: 'Salário', tipo: 'RECEITA', icone: 'payments', cor: '#10b981', sistema: true },
                                { nome: 'Investimentos', tipo: 'AMBAS', icone: 'trending_up', cor: '#8b5cf6', sistema: true },
                            ],
                        },
                    },
                },
            });
            return { usuario, workspace };
        });
        const tokens = await this.gerarTokensERegistrar(resultado.usuario.id, resultado.workspace.id, resultado.usuario.email);
        return {
            usuario: {
                id: resultado.usuario.id,
                nome: resultado.usuario.nome,
                email: resultado.usuario.email,
            },
            workspaceAtivo: {
                id: resultado.workspace.id,
                nome: resultado.workspace.nome,
            },
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }
    async login(dto) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { email: dto.email.toLowerCase().trim() },
            include: {
                workspaces: {
                    include: {
                        workspace: true,
                    },
                },
            },
        });
        if (!usuario) {
            throw new common_1.UnauthorizedException('E-mail ou senha inválidos.');
        }
        const senhaCorreta = await bcrypt.compare(dto.senha, usuario.senhaHash);
        if (!senhaCorreta) {
            throw new common_1.UnauthorizedException('E-mail ou senha inválidos.');
        }
        const primeiroWorkspace = usuario.workspaces[0]?.workspace;
        if (!primeiroWorkspace) {
            throw new common_1.BadRequestException('Usuário não possui nenhum Workspace ativo.');
        }
        const tokens = await this.gerarTokensERegistrar(usuario.id, primeiroWorkspace.id, usuario.email);
        return {
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
            },
            workspaceAtivo: {
                id: primeiroWorkspace.id,
                nome: primeiroWorkspace.nome,
            },
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }
    async atualizarToken(refreshTokenTextoPuro) {
        const hash = this.hashSHA256(refreshTokenTextoPuro);
        const tokenNoBanco = await this.prisma.tokenAtualizacao.findUnique({
            where: { token: hash },
            include: {
                usuario: {
                    include: {
                        workspaces: {
                            include: { workspace: true },
                        },
                    },
                },
            },
        });
        if (!tokenNoBanco) {
            throw new common_1.UnauthorizedException('Refresh token inválido ou não encontrado.');
        }
        if (tokenNoBanco.dataExpiracao < new Date()) {
            await this.prisma.tokenAtualizacao.delete({ where: { id: tokenNoBanco.id } });
            throw new common_1.UnauthorizedException('Refresh token expirado. Por favor, faça login novamente.');
        }
        await this.prisma.tokenAtualizacao.delete({ where: { id: tokenNoBanco.id } });
        const primeiroWorkspace = tokenNoBanco.usuario.workspaces[0]?.workspace;
        const workspaceId = primeiroWorkspace?.id || '';
        const novosTokens = await this.gerarTokensERegistrar(tokenNoBanco.usuario.id, workspaceId, tokenNoBanco.usuario.email);
        return {
            accessToken: novosTokens.accessToken,
            refreshToken: novosTokens.refreshToken,
        };
    }
    async logout(refreshTokenTextoPuro) {
        if (!refreshTokenTextoPuro)
            return;
        const hash = this.hashSHA256(refreshTokenTextoPuro);
        await this.prisma.tokenAtualizacao.deleteMany({
            where: { token: hash },
        });
    }
    async obterPerfil(usuarioId) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { id: usuarioId },
            select: {
                id: true,
                nome: true,
                email: true,
                avatarUrl: true,
                configuracao: true,
                workspaces: {
                    select: {
                        papel: true,
                        workspace: {
                            select: {
                                id: true,
                                nome: true,
                                tipo: true,
                            },
                        },
                    },
                },
            },
        });
        if (!usuario) {
            throw new common_1.UnauthorizedException('Usuário não encontrado.');
        }
        return usuario;
    }
    async gerarTokensERegistrar(usuarioId, workspaceId, email) {
        const payload = { sub: usuarioId, workspaceId, email };
        const accessToken = this.jwtService.sign(payload);
        const refreshTokenTextoPuro = crypto.randomUUID() + '.' + crypto.randomBytes(32).toString('hex');
        const hash = this.hashSHA256(refreshTokenTextoPuro);
        const dataExpiracao = new Date();
        dataExpiracao.setDate(dataExpiracao.getDate() + 30);
        await this.prisma.tokenAtualizacao.create({
            data: {
                usuarioId,
                token: hash,
                dataExpiracao,
            },
        });
        return {
            accessToken,
            refreshToken: refreshTokenTextoPuro,
        };
    }
    hashSHA256(texto) {
        return crypto.createHash('sha256').update(texto).digest('hex');
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map