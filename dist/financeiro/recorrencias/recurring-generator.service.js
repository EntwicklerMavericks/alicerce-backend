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
var RecurringGeneratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecurringGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let RecurringGeneratorService = RecurringGeneratorService_1 = class RecurringGeneratorService {
    prisma;
    logger = new common_1.Logger(RecurringGeneratorService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async processarCompetencia(target, workspaceId) {
        const inicioDaCompetencia = new Date(target.ano, target.mes - 1, 1);
        const fimDaCompetencia = new Date(target.ano, target.mes, 0, 23, 59, 59, 999);
        const regras = await this.prisma.regraRecorrencia.findMany({
            where: {
                status: 'ATIVA',
                ...(workspaceId ? { workspaceId } : {}),
                dataInicio: { lte: fimDaCompetencia },
                OR: [{ dataFim: null }, { dataFim: { gte: inicioDaCompetencia } }],
            },
        });
        let totalGerados = 0;
        for (const regra of regras) {
            try {
                await this.prisma.$transaction(async (tx) => {
                    const ultimoDiaDoMes = fimDaCompetencia.getDate();
                    const diaEfetivo = Math.min(regra.diaVencimento, ultimoDiaDoMes);
                    const dataVencimento = new Date(target.ano, target.mes - 1, diaEfetivo);
                    let referenciaId = '';
                    if (regra.tipo === 'RECEITA') {
                        const receita = await tx.receita.create({
                            data: {
                                workspaceId: regra.workspaceId,
                                descricao: `${regra.descricao} (${target.formatarExibicao()})`,
                                valor: regra.valor,
                                data: dataVencimento,
                                categoriaId: regra.categoriaId,
                                carteiraId: regra.carteiraId,
                                statusLiquidacao: 'PENDENTE',
                                statusDocumento: 'ATIVO',
                                origemRecorrenciaId: regra.id,
                            },
                        });
                        referenciaId = receita.id;
                    }
                    else {
                        const despesa = await tx.despesa.create({
                            data: {
                                workspaceId: regra.workspaceId,
                                descricao: `${regra.descricao} (${target.formatarExibicao()})`,
                                valor: regra.valor,
                                dataVencimento: dataVencimento,
                                categoriaId: regra.categoriaId,
                                carteiraId: regra.carteiraId,
                                statusLiquidacao: 'PENDENTE',
                                statusDocumento: 'ATIVO',
                                origemRecorrenciaId: regra.id,
                            },
                        });
                        referenciaId = despesa.id;
                    }
                    await tx.execucaoRecorrencia.create({
                        data: {
                            regraRecorrenciaId: regra.id,
                            competenciaAno: target.ano,
                            competenciaMes: target.mes,
                            referenciaId,
                        },
                    });
                    totalGerados++;
                    this.logger.log(`Recorrência ${regra.descricao} gerada para competência ${target.formatarISO()} (Ref: ${referenciaId})`);
                });
            }
            catch (err) {
                if (err instanceof client_1.Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
                    this.logger.debug(`Regra ${regra.id} já possui execução para a competência ${target.formatarISO()}. Ignorando.`);
                    continue;
                }
                this.logger.error(`Erro ao processar regra de recorrência ${regra.id}: ${err.message}`, err.stack);
            }
        }
        return totalGerados;
    }
};
exports.RecurringGeneratorService = RecurringGeneratorService;
exports.RecurringGeneratorService = RecurringGeneratorService = RecurringGeneratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RecurringGeneratorService);
//# sourceMappingURL=recurring-generator.service.js.map