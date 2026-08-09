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
exports.MetasService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const metas_read_model_service_1 = require("../read-models/metas-read-model.service");
const meta_aggregate_1 = require("../domain/entities/meta.aggregate");
const money_vo_1 = require("../domain/value-objects/money.vo");
const year_month_vo_1 = require("../domain/value-objects/year-month.vo");
const client_1 = require("@prisma/client");
let MetasService = class MetasService {
    prisma;
    readModelService;
    constructor(prisma, readModelService) {
        this.prisma = prisma;
        this.readModelService = readModelService;
    }
    async criar(workspaceId, dto) {
        if (!dto.valorAlvo || dto.valorAlvo <= 0) {
            throw new common_1.BadRequestException('O valor alvo da meta deve ser maior que zero.');
        }
        const prazoDate = dto.prazo ? new Date(dto.prazo) : null;
        const prazoYM = prazoDate ? year_month_vo_1.YearMonth.daData(prazoDate) : undefined;
        const domainMeta = new meta_aggregate_1.MetaAggregate('temp-id', workspaceId, dto.nome, money_vo_1.Money.deReais(dto.valorAlvo), prazoYM, dto.icone, dto.cor, 'ATIVA', dto.descricao, dto.prioridade ?? 1);
        const valorAlvoDecimal = new client_1.Prisma.Decimal(domainMeta.valorAlvo.paraReais());
        return this.prisma.meta.create({
            data: {
                workspaceId,
                nome: domainMeta.nome,
                descricao: domainMeta.descricao,
                valorAlvo: valorAlvoDecimal,
                prazo: prazoDate,
                icone: domainMeta.icone,
                cor: domainMeta.cor,
                prioridade: domainMeta.prioridade,
                status: 'ATIVA',
            },
        });
    }
    async listar(workspaceId) {
        return this.readModelService.listarMetasComCalculos(workspaceId);
    }
    async obterPorId(workspaceId, id) {
        const meta = await this.readModelService.obterMetaDetalhadaPorId(workspaceId, id);
        if (!meta) {
            throw new common_1.NotFoundException(`Meta com ID ${id} não encontrada.`);
        }
        return meta;
    }
    async atualizar(workspaceId, id, dto) {
        const metaExistente = await this.prisma.meta.findFirst({
            where: { id, workspaceId, dataExclusao: null },
        });
        if (!metaExistente) {
            throw new common_1.NotFoundException(`Meta com ID ${id} não encontrada.`);
        }
        if (dto.valorAlvo !== undefined && dto.valorAlvo <= 0) {
            throw new common_1.BadRequestException('O valor alvo da meta deve ser maior que zero.');
        }
        const dataToUpdate = {};
        if (dto.nome !== undefined)
            dataToUpdate.nome = dto.nome;
        if (dto.descricao !== undefined)
            dataToUpdate.descricao = dto.descricao;
        if (dto.valorAlvo !== undefined)
            dataToUpdate.valorAlvo = new client_1.Prisma.Decimal(dto.valorAlvo);
        if (dto.prazo !== undefined)
            dataToUpdate.prazo = dto.prazo ? new Date(dto.prazo) : null;
        if (dto.icone !== undefined)
            dataToUpdate.icone = dto.icone;
        if (dto.cor !== undefined)
            dataToUpdate.cor = dto.cor;
        if (dto.prioridade !== undefined)
            dataToUpdate.prioridade = dto.prioridade;
        await this.prisma.meta.update({
            where: { id },
            data: dataToUpdate,
        });
        await this.sincronizarStatusDomain(id);
        return this.obterPorId(workspaceId, id);
    }
    async remover(workspaceId, id) {
        const metaExistente = await this.prisma.meta.findFirst({
            where: { id, workspaceId },
        });
        if (!metaExistente) {
            throw new common_1.NotFoundException(`Meta com ID ${id} não encontrada.`);
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.aporteMeta.deleteMany({
                where: { metaId: id },
            });
            await tx.meta.delete({
                where: { id },
            });
            return { id, mensagem: 'Meta e histórico de aportes removidos com sucesso.' };
        });
    }
    async registrarAporte(workspaceId, metaId, dto) {
        const metaDb = await this.prisma.meta.findFirst({
            where: { id: metaId, workspaceId, dataExclusao: null },
            include: { aportes: true },
        });
        if (!metaDb) {
            throw new common_1.NotFoundException(`Meta com ID ${metaId} não encontrada.`);
        }
        if (!dto.valor || dto.valor <= 0) {
            throw new common_1.BadRequestException('O valor do aporte deve ser maior que zero.');
        }
        const aportesDomain = metaDb.aportes.map((a) => ({
            id: a.id,
            metaId: a.metaId,
            valor: money_vo_1.Money.deReais(Number(a.valor)),
            data: a.data,
            descricao: a.descricao ?? undefined,
        }));
        const prazoYM = metaDb.prazo ? year_month_vo_1.YearMonth.daData(metaDb.prazo) : undefined;
        const aggregate = new meta_aggregate_1.MetaAggregate(metaDb.id, metaDb.workspaceId, metaDb.nome, money_vo_1.Money.deReais(Number(metaDb.valorAlvo)), prazoYM, metaDb.icone ?? undefined, metaDb.cor ?? undefined, metaDb.status, metaDb.descricao ?? undefined, metaDb.prioridade, aportesDomain);
        const dataAporte = dto.data ? new Date(dto.data) : new Date();
        aggregate.adicionarAporte('temp-id', money_vo_1.Money.deReais(dto.valor), dataAporte, dto.descricao);
        return this.prisma.$transaction(async (tx) => {
            const aporte = await tx.aporteMeta.create({
                data: {
                    metaId,
                    valor: new client_1.Prisma.Decimal(dto.valor),
                    data: dataAporte,
                    descricao: dto.descricao,
                },
            });
            if (aggregate.status !== metaDb.status) {
                await tx.meta.update({
                    where: { id: metaId },
                    data: { status: aggregate.status },
                });
            }
            return aporte;
        });
    }
    async removerAporte(workspaceId, metaId, aporteId) {
        const metaDb = await this.prisma.meta.findFirst({
            where: { id: metaId, workspaceId, dataExclusao: null },
            include: { aportes: true },
        });
        if (!metaDb) {
            throw new common_1.NotFoundException(`Meta com ID ${metaId} não encontrada.`);
        }
        const aporteDb = metaDb.aportes.find((a) => a.id === aporteId);
        if (!aporteDb) {
            throw new common_1.NotFoundException(`Aporte com ID ${aporteId} não encontrado nesta meta.`);
        }
        await this.prisma.aporteMeta.delete({
            where: { id: aporteId },
        });
        await this.sincronizarStatusDomain(metaId);
        return { id: aporteId, mensagem: 'Aporte removido com sucesso.' };
    }
    async sincronizarStatusDomain(metaId) {
        const metaDb = await this.prisma.meta.findUnique({
            where: { id: metaId },
            include: { aportes: true },
        });
        if (!metaDb)
            return;
        const aportesDomain = metaDb.aportes.map((a) => ({
            id: a.id,
            metaId: a.metaId,
            valor: money_vo_1.Money.deReais(Number(a.valor)),
            data: a.data,
            descricao: a.descricao ?? undefined,
        }));
        const prazoYM = metaDb.prazo ? year_month_vo_1.YearMonth.daData(metaDb.prazo) : undefined;
        const aggregate = new meta_aggregate_1.MetaAggregate(metaDb.id, metaDb.workspaceId, metaDb.nome, money_vo_1.Money.deReais(Number(metaDb.valorAlvo)), prazoYM, metaDb.icone ?? undefined, metaDb.cor ?? undefined, metaDb.status, metaDb.descricao ?? undefined, metaDb.prioridade, aportesDomain);
        if (aggregate.status !== metaDb.status) {
            await this.prisma.meta.update({
                where: { id: metaId },
                data: { status: aggregate.status },
            });
        }
    }
};
exports.MetasService = MetasService;
exports.MetasService = MetasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        metas_read_model_service_1.MetasReadModelService])
], MetasService);
//# sourceMappingURL=metas.service.js.map