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
exports.AlertasService = exports.SeveridadeAlertaEnum = void 0;
exports.getSeveridadeFromTipo = getSeveridadeFromTipo;
exports.getSeveridadeRank = getSeveridadeRank;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const alertas_engine_service_1 = require("./domain/alertas-engine.service");
const client_1 = require("@prisma/client");
var SeveridadeAlertaEnum;
(function (SeveridadeAlertaEnum) {
    SeveridadeAlertaEnum["CRITICO"] = "CRITICO";
    SeveridadeAlertaEnum["ALTO"] = "ALTO";
    SeveridadeAlertaEnum["MEDIO"] = "MEDIO";
})(SeveridadeAlertaEnum || (exports.SeveridadeAlertaEnum = SeveridadeAlertaEnum = {}));
function getSeveridadeFromTipo(tipo) {
    switch (tipo) {
        case client_1.TipoAlerta.CONTA_VENCENDO:
        case client_1.TipoAlerta.ORCAMENTO_EXCEDIDO:
            return SeveridadeAlertaEnum.CRITICO;
        case client_1.TipoAlerta.QUEDA_PRECO:
            return SeveridadeAlertaEnum.ALTO;
        case client_1.TipoAlerta.META_ATINGIDA:
        case client_1.TipoAlerta.SALARIO_RECEBIDO:
        case client_1.TipoAlerta.SISTEMA:
        default:
            return SeveridadeAlertaEnum.MEDIO;
    }
}
function getSeveridadeRank(tipo) {
    const sev = getSeveridadeFromTipo(tipo);
    switch (sev) {
        case SeveridadeAlertaEnum.CRITICO:
            return 3;
        case SeveridadeAlertaEnum.ALTO:
            return 2;
        case SeveridadeAlertaEnum.MEDIO:
            return 1;
        default:
            return 0;
    }
}
let AlertasService = class AlertasService {
    prisma;
    alertasEngineService;
    constructor(prisma, alertasEngineService) {
        this.prisma = prisma;
        this.alertasEngineService = alertasEngineService;
    }
    async gerarESalvarAlertas(usuarioId, workspaceId, contexto) {
        const candidatos = this.alertasEngineService.detectarAlertas(contexto);
        const userConfigs = await this.prisma.configAlerta.findMany({
            where: { usuarioId },
        });
        const configMap = new Map();
        userConfigs.forEach((cfg) => {
            configMap.set(cfg.tipo, cfg.ativo);
        });
        const candidatosFiltrados = candidatos.filter((candidate) => {
            if (configMap.has(candidate.tipo)) {
                return configMap.get(candidate.tipo) === true;
            }
            return true;
        });
        const alertasSalvos = [];
        for (const candidate of candidatosFiltrados) {
            const tipoRef = candidate.tipoReferencia || 'GERAL';
            const refId = candidate.referenciaId || 'GLOBAL';
            const comp = candidate.competenciaConcreta || 'ATUAL';
            const chaveIdempotencia = [
                usuarioId,
                workspaceId,
                candidate.tipo,
                tipoRef,
                refId,
                comp,
            ].join(':');
            try {
                const alertaCriado = await this.prisma.alerta.create({
                    data: {
                        usuarioId,
                        workspaceId,
                        tipo: candidate.tipo,
                        titulo: candidate.titulo,
                        mensagem: candidate.mensagem,
                        tipoReferencia: candidate.tipoReferencia || null,
                        referenciaId: candidate.referenciaId || null,
                        chaveIdempotencia,
                        lido: false,
                        dataDisparo: contexto.referenceDate
                            ? new Date(contexto.referenceDate)
                            : new Date(),
                    },
                });
                alertasSalvos.push(alertaCriado);
            }
            catch (error) {
                if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                    error.code === 'P2002') {
                }
                else {
                    throw error;
                }
            }
        }
        return {
            processados: candidatos.length,
            filtrados: candidatosFiltrados.length,
            gerados: alertasSalvos.length,
            alertas: alertasSalvos,
        };
    }
    async listarAlertas(usuarioId, workspaceId, query) {
        const page = query.page ? Math.max(1, Number(query.page)) : 1;
        const pageSize = query.pageSize ? Math.max(1, Number(query.pageSize)) : 10;
        const apenasNaoLidos = query.apenasNaoLidos === true || query.apenasNaoLidos === 'true';
        const severidadeFiltro = query.severidade;
        const where = {
            usuarioId,
            workspaceId,
        };
        if (apenasNaoLidos) {
            where.lido = false;
        }
        const alertas = await this.prisma.alerta.findMany({
            where,
        });
        let alertasFiltrados = alertas;
        if (severidadeFiltro) {
            alertasFiltrados = alertas.filter((a) => getSeveridadeFromTipo(a.tipo) === severidadeFiltro);
        }
        alertasFiltrados.sort((a, b) => {
            const rankA = getSeveridadeRank(a.tipo);
            const rankB = getSeveridadeRank(b.tipo);
            if (rankA !== rankB) {
                return rankB - rankA;
            }
            const timeA = new Date(a.dataDisparo).getTime();
            const timeB = new Date(b.dataDisparo).getTime();
            if (timeA !== timeB) {
                return timeB - timeA;
            }
            return a.id.localeCompare(b.id);
        });
        const total = alertasFiltrados.length;
        const totalPages = Math.ceil(total / pageSize);
        const paginated = alertasFiltrados.slice((page - 1) * pageSize, page * pageSize);
        const data = paginated.map((alerta) => ({
            ...alerta,
            severidade: getSeveridadeFromTipo(alerta.tipo),
        }));
        return {
            data,
            meta: {
                total,
                page,
                pageSize,
                totalPages,
            },
        };
    }
    async contarNaoLidos(usuarioId, workspaceId) {
        const count = await this.prisma.alerta.count({
            where: {
                usuarioId,
                workspaceId,
                lido: false,
            },
        });
        return { count };
    }
    async marcarComoLido(usuarioId, workspaceId, alertaId) {
        const alerta = await this.prisma.alerta.findFirst({
            where: {
                id: alertaId,
                usuarioId,
                workspaceId,
            },
        });
        if (!alerta) {
            throw new common_1.NotFoundException('Alerta não encontrado.');
        }
        return this.prisma.alerta.update({
            where: { id: alertaId },
            data: {
                lido: true,
                dataLeitura: new Date(),
            },
        });
    }
    async marcarTodosComoLidos(usuarioId, workspaceId) {
        const resultado = await this.prisma.alerta.updateMany({
            where: {
                usuarioId,
                workspaceId,
                lido: false,
            },
            data: {
                lido: true,
                dataLeitura: new Date(),
            },
        });
        return { count: resultado.count };
    }
};
exports.AlertasService = AlertasService;
exports.AlertasService = AlertasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        alertas_engine_service_1.AlertasEngineService])
], AlertasService);
//# sourceMappingURL=alertas.service.js.map