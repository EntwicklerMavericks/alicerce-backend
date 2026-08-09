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
exports.LojasService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const loja_aggregate_1 = require("../domain/entities/loja.aggregate");
let LojasService = class LojasService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async criar(workspaceId, dto) {
        const lojaAggregate = new loja_aggregate_1.LojaAggregate('temp-id', workspaceId, dto.nome, false, dto.urlWebsite || null, dto.urlLogo || null, true);
        return this.prisma.loja.create({
            data: {
                workspaceId: lojaAggregate.workspaceId,
                nome: lojaAggregate.nome,
                urlWebsite: lojaAggregate.urlWebsite,
                urlLogo: lojaAggregate.urlLogo,
                sistema: false,
                ativo: true,
            },
        });
    }
    async listarPorWorkspace(workspaceId) {
        return this.prisma.loja.findMany({
            where: {
                ativo: true,
                OR: [
                    { workspaceId },
                    { sistema: true },
                ],
            },
            orderBy: { nome: 'asc' },
        });
    }
    async obterPorId(workspaceId, id) {
        const loja = await this.prisma.loja.findFirst({
            where: {
                id,
                ativo: true,
                OR: [
                    { workspaceId },
                    { sistema: true },
                ],
            },
        });
        if (!loja) {
            throw new common_1.NotFoundException('Loja não encontrada.');
        }
        return loja;
    }
    async atualizar(workspaceId, id, dto) {
        const lojaRaw = await this.obterPorId(workspaceId, id);
        const aggregate = new loja_aggregate_1.LojaAggregate(lojaRaw.id, lojaRaw.workspaceId, lojaRaw.nome, lojaRaw.sistema, lojaRaw.urlWebsite, lojaRaw.urlLogo, lojaRaw.ativo, lojaRaw.dataCriacao);
        if (!aggregate.podeSerEditadaPor(workspaceId)) {
            throw new common_1.ForbiddenException('Lojas globais do sistema não podem ser alteradas.');
        }
        aggregate.atualizar(dto.nome, dto.urlWebsite, dto.urlLogo);
        return this.prisma.loja.update({
            where: { id },
            data: {
                nome: aggregate.nome,
                urlWebsite: aggregate.urlWebsite,
                urlLogo: aggregate.urlLogo,
            },
        });
    }
    async remover(workspaceId, id) {
        const lojaRaw = await this.obterPorId(workspaceId, id);
        const aggregate = new loja_aggregate_1.LojaAggregate(lojaRaw.id, lojaRaw.workspaceId, lojaRaw.nome, lojaRaw.sistema, lojaRaw.urlWebsite, lojaRaw.urlLogo, lojaRaw.ativo, lojaRaw.dataCriacao);
        if (!aggregate.podeSerEditadaPor(workspaceId)) {
            throw new common_1.ForbiddenException('Lojas globais do sistema não podem ser excluídas.');
        }
        return this.prisma.loja.update({
            where: { id },
            data: { ativo: false },
        });
    }
};
exports.LojasService = LojasService;
exports.LojasService = LojasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LojasService);
//# sourceMappingURL=lojas.service.js.map