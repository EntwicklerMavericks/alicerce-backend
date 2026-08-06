"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspacesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let WorkspacesService = class WorkspacesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listarWorkspacesDoUsuario(usuarioId) {
        const membros = await this.prisma.membroWorkspace.findMany({
            where: { usuarioId },
            include: {
                workspace: true,
            },
            orderBy: { dataEntrada: 'asc' },
        });
        return membros.map((m) => ({
            id: m.workspace.id,
            nome: m.workspace.nome,
            tipo: m.workspace.tipo,
            papel: m.papel,
            dataCriacao: m.workspace.dataCriacao,
        }));
    }
    async obterPorId(workspaceId, usuarioId) {
        const membro = await this.prisma.membroWorkspace.findUnique({
            where: {
                workspaceId_usuarioId: {
                    workspaceId,
                    usuarioId,
                },
            },
            include: {
                workspace: {
                    include: {
                        carteiras: { where: { ativo: true } },
                        cartoesCredito: { where: { ativo: true } },
                    },
                },
            },
        });
        if (!membro) {
            throw new common_1.NotFoundException('Workspace não encontrado ou sem acesso.');
        }
        return {
            ...membro.workspace,
            papel: membro.papel,
        };
    }
};
exports.WorkspacesService = WorkspacesService;
exports.WorkspacesService = WorkspacesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkspacesService);
//# sourceMappingURL=workspaces.service.js.map