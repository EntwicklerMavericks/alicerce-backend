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
exports.OrcamentosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const orcamentos_read_model_service_1 = require("../read-models/orcamentos-read-model.service");
const orcamento_aggregate_1 = require("../domain/entities/orcamento.aggregate");
const money_vo_1 = require("../domain/value-objects/money.vo");
const year_month_vo_1 = require("../domain/value-objects/year-month.vo");
const client_1 = require("@prisma/client");
let OrcamentosService = class OrcamentosService {
    prisma;
    readModelService;
    constructor(prisma, readModelService) {
        this.prisma = prisma;
        this.readModelService = readModelService;
    }
    async criarOuAtualizar(workspaceId, dto) {
        const valorTeto = dto.teto ?? dto.valorPlanejado;
        if (!valorTeto || valorTeto <= 0) {
            throw new common_1.BadRequestException('O teto do orçamento deve ser maior que zero.');
        }
        const competencia = year_month_vo_1.YearMonth.deAnoMes(dto.ano, dto.mes);
        const aggregate = new orcamento_aggregate_1.OrcamentoAggregate('temp-id', workspaceId, dto.categoriaId, competencia, money_vo_1.Money.deReais(valorTeto));
        const categoria = await this.prisma.categoria.findUnique({
            where: { id: dto.categoriaId },
        });
        if (!categoria) {
            throw new common_1.NotFoundException(`Categoria com ID ${dto.categoriaId} não encontrada.`);
        }
        const tetoDecimal = new client_1.Prisma.Decimal(aggregate.teto.paraReais());
        return this.prisma.orcamento.upsert({
            where: {
                workspaceId_mes_ano_categoriaId: {
                    workspaceId,
                    mes: dto.mes,
                    ano: dto.ano,
                    categoriaId: dto.categoriaId,
                },
            },
            create: {
                workspaceId,
                categoriaId: dto.categoriaId,
                mes: dto.mes,
                ano: dto.ano,
                valorPlanejado: tetoDecimal,
            },
            update: {
                valorPlanejado: tetoDecimal,
            },
            include: {
                categoria: true,
            },
        });
    }
    async listarComConsumo(workspaceId, mes, ano) {
        const agora = new Date();
        const targetMes = mes || agora.getMonth() + 1;
        const targetAno = ano || agora.getFullYear();
        return this.readModelService.obterOrcamentosComConsumo(workspaceId, targetAno, targetMes);
    }
    async remover(workspaceId, id) {
        const orcamento = await this.prisma.orcamento.findFirst({
            where: { id, workspaceId },
        });
        if (!orcamento) {
            throw new common_1.NotFoundException(`Orçamento com ID ${id} não encontrado.`);
        }
        await this.prisma.orcamento.delete({
            where: { id },
        });
        return { id, mensagem: 'Orçamento removido com sucesso.' };
    }
};
exports.OrcamentosService = OrcamentosService;
exports.OrcamentosService = OrcamentosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        orcamentos_read_model_service_1.OrcamentosReadModelService])
], OrcamentosService);
//# sourceMappingURL=orcamentos.service.js.map