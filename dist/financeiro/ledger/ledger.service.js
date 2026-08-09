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
exports.LedgerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let LedgerService = class LedgerService {
    defaultPrisma;
    constructor(defaultPrisma) {
        this.defaultPrisma = defaultPrisma;
    }
    async registrar(db, entry) {
        const prismaClient = db || this.defaultPrisma;
        await prismaClient.movimentacaoFinanceira.create({
            data: {
                id: entry.id,
                workspaceId: entry.workspaceId,
                carteiraId: entry.carteiraId,
                criadoPorId: entry.criadoPorId,
                tipo: entry.tipo,
                valor: new client_1.Prisma.Decimal(entry.valor.paraReais()),
                data: entry.data,
                referenciaTipo: entry.referenciaTipo,
                referenciaId: entry.referenciaId,
                origem: entry.origem,
                descricao: entry.observacao,
            },
        });
    }
    async obterSaldoGlobal(workspaceId, referenceDate) {
        const whereClause = { workspaceId };
        if (referenceDate) {
            whereClause.data = { lte: referenceDate };
        }
        const agregacao = await this.defaultPrisma.movimentacaoFinanceira.aggregate({
            where: whereClause,
            _sum: { valor: true },
        });
        const total = Number(agregacao._sum?.valor || 0);
        if (isNaN(total) || !isFinite(total)) {
            return 0;
        }
        return Math.round(total * 100) / 100;
    }
};
exports.LedgerService = LedgerService;
exports.LedgerService = LedgerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LedgerService);
//# sourceMappingURL=ledger.service.js.map