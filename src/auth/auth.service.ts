import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegistroDto } from './dto/registro.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registra um novo usuário, cria seu Workspace Principal e envia tokens JWT
   */
  async registrar(dto: RegistroDto) {
    const emailExistente = await this.prisma.usuario.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (emailExistente) {
      throw new BadRequestException('E-mail já cadastrado no sistema.');
    }

    const senhaHash = await bcrypt.hash(dto.senha, 10);

    // Transação atômica: cria Usuário, Configuração, Workspace e Carteira Padrão
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

    // Gera os Tokens com Rotação SHA-256 e Expiração de 30 Dias
    const tokens = await this.gerarTokensERegistrar(
      resultado.usuario.id,
      resultado.workspace.id,
      resultado.usuario.email,
    );

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

  /**
   * Autentica usuário com e-mail e senha
   */
  async login(dto: LoginDto) {
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
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    const senhaCorreta = await bcrypt.compare(dto.senha, usuario.senhaHash);
    if (!senhaCorreta) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    const primeiroWorkspace = usuario.workspaces[0]?.workspace;
    if (!primeiroWorkspace) {
      throw new BadRequestException('Usuário não possui nenhum Workspace ativo.');
    }

    const tokens = await this.gerarTokensERegistrar(
      usuario.id,
      primeiroWorkspace.id,
      usuario.email,
    );

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

  /**
   * Renovação de Sessão via Refresh Token com Rotação (SHA-256 Hash no Banco)
   */
  async atualizarToken(refreshTokenTextoPuro: string) {
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
      throw new UnauthorizedException('Refresh token inválido ou não encontrado.');
    }

    if (tokenNoBanco.dataExpiracao < new Date()) {
      await this.prisma.tokenAtualizacao.delete({ where: { id: tokenNoBanco.id } });
      throw new UnauthorizedException('Refresh token expirado. Por favor, faça login novamente.');
    }

    // Rotação de Token: Remove o refresh token atual
    await this.prisma.tokenAtualizacao.delete({ where: { id: tokenNoBanco.id } });

    const primeiroWorkspace = tokenNoBanco.usuario.workspaces[0]?.workspace;
    const workspaceId = primeiroWorkspace?.id || '';

    // Gera novos tokens (Access Token + novo Refresh Token de 30 dias)
    const novosTokens = await this.gerarTokensERegistrar(
      tokenNoBanco.usuario.id,
      workspaceId,
      tokenNoBanco.usuario.email,
    );

    return {
      accessToken: novosTokens.accessToken,
      refreshToken: novosTokens.refreshToken,
    };
  }

  /**
   * Encerra a sessão removendo o Refresh Token ativo
   */
  async logout(refreshTokenTextoPuro: string) {
    if (!refreshTokenTextoPuro) return;

    const hash = this.hashSHA256(refreshTokenTextoPuro);
    await this.prisma.tokenAtualizacao.deleteMany({
      where: { token: hash },
    });
  }

  /**
   * Retorna os dados do usuário autenticado
   */
  async obterPerfil(usuarioId: string) {
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
      throw new UnauthorizedException('Usuário não encontrado.');
    }

    return usuario;
  }

  /**
   * Helper Interno: Gera Access Token (15m) e Refresh Token Seguro (30 dias com Hash SHA-256 no banco)
   */
  private async gerarTokensERegistrar(usuarioId: string, workspaceId: string, email: string) {
    const payload = { sub: usuarioId, workspaceId, email };

    // 1. Access Token (JWT 15 minutos)
    const accessToken = this.jwtService.sign(payload);

    // 2. Refresh Token (String aleatória crypto UUID + Hash SHA-256)
    const refreshTokenTextoPuro = crypto.randomUUID() + '.' + crypto.randomBytes(32).toString('hex');
    const hash = this.hashSHA256(refreshTokenTextoPuro);

    // Data de expiração de 30 dias
    const dataExpiracao = new Date();
    dataExpiracao.setDate(dataExpiracao.getDate() + 30);

    // Salva apenas o HASH SHA-256 no banco de dados
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

  /**
   * Helper para gerar Hash SHA-256
   */
  private hashSHA256(texto: string): string {
    return crypto.createHash('sha256').update(texto).digest('hex');
  }
}
