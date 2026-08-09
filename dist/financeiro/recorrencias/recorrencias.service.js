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
exports.RecorrenciasService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let RecorrenciasService = class RecorrenciasService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async criarRegra(workspaceId, dto) {
        return this.prisma.regraRecorrencia.create({
            data: {
                workspaceId,
                tipo: dto.tipo,
                descricao: dto.descricao,
                valor: new client_1.Prisma.Decimal(dto.valor),
                diaVencimento: dto.diaVencimento,
                categoriaId: dto.categoriaId,
                carteiraId: dto.carteiraId,
                status: 'ATIVA',
                dataInicio: new Date(dto.dataInicio),
                dataFim: dto.dataFim ? new Date(dto.dataFim) : null,
            },
        });
    }
    async listarRegras(workspaceId) {
        return this.prisma.regraRecorrencia.findMany({
            where: { workspaceId },
            include: {
                categoria: true,
                carteira: true,
            },
            orderBy: { dataCriacao: 'desc' },
        });
    }
    async alternarStatus(id, status) {
        const regra = await this.prisma.regraRecorrencia.findUnique({
            where: { id },
        });
        if (!regra) {
            throw new common_1.NotFoundException(`Regra recorrente ${id} não encontrada.`);
        }
        return this.prisma.regraRecorrencia.update({
            where: { id },
            data: { status },
        });
    }
};
exports.RecorrenciasService = RecorrenciasService;
exports.RecorrenciasService = RecorrenciasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RecorrenciasService);
//# sourceMappingURL=recorrencias.service.js.map