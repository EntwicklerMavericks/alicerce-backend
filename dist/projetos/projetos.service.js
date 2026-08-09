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
exports.ProjetosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const concurrency_conflict_exception_1 = require("../financeiro/domain/exceptions/concurrency-conflict.exception");
const domain_exception_1 = require("../financeiro/domain/exceptions/domain.exception");
const projeto_aggregate_1 = require("./domain/entities/projeto.aggregate");
const etapa_projeto_entity_1 = require("./domain/entities/etapa-projeto.entity");
const item_projeto_entity_1 = require("./domain/entities/item-projeto.entity");
const projetos_read_model_service_1 = require("./read-models/projetos-read-model.service");
let ProjetosService = class ProjetosService {
    prisma;
    readModelService;
    constructor(prisma, readModelService) {
        this.prisma = prisma;
        this.readModelService = readModelService;
    }
    async criar(workspaceId, dto) {
        const dataInicioPrevista = dto.dataInicioPrevista
            ? new Date(dto.dataInicioPrevista)
            : null;
        const dataFimPrevista = dto.dataFimPrevista
            ? new Date(dto.dataFimPrevista)
            : null;
        const aggregate = projeto_aggregate_1.ProjetoAggregate.criar({
            workspaceId,
            nome: dto.nome,
            descricao: dto.descricao,
            orcamentoEstimado: dto.orcamentoEstimado,
            prioridade: dto.prioridade,
            dataInicioPrevista,
            dataFimPrevista,
        });
        await this.prisma.projeto.create({
            data: {
                id: aggregate.id,
                workspaceId: aggregate.workspaceId,
                nome: aggregate.nome,
                descricao: aggregate.descricao,
                orcamentoEstimado: aggregate.orcamentoEstimado,
                status: aggregate.status,
                prioridade: aggregate.prioridade,
                dataInicioPrevista: aggregate.dataInicioPrevista,
                dataFimPrevista: aggregate.dataFimPrevista,
                versao: aggregate.versao,
                ativo: aggregate.ativo,
            },
        });
        return this.obterPorId(workspaceId, aggregate.id);
    }
    async listar(workspaceId) {
        return this.readModelService.listarProjetosConsolidados(workspaceId);
    }
    async obterPorId(workspaceId, id) {
        return this.readModelService.obterProjetoConsolidado(workspaceId, id);
    }
    async atualizar(workspaceId, id, dto) {
        const dbProjeto = await this.buscarProjetoAtivo(workspaceId, id);
        const aggregate = this.mapToAggregate(dbProjeto);
        const dataInicioPrevista = dto.dataInicioPrevista !== undefined
            ? dto.dataInicioPrevista
                ? new Date(dto.dataInicioPrevista)
                : null
            : aggregate.dataInicioPrevista;
        const dataFimPrevista = dto.dataFimPrevista !== undefined
            ? dto.dataFimPrevista
                ? new Date(dto.dataFimPrevista)
                : null
            : aggregate.dataFimPrevista;
        aggregate.atualizarDados({
            nome: dto.nome,
            descricao: dto.descricao,
            orcamentoEstimado: dto.orcamentoEstimado,
            prioridade: dto.prioridade,
            status: dto.status,
            dataInicioPrevista,
            dataFimPrevista,
        });
        const updated = await this.prisma.projeto.updateMany({
            where: {
                id,
                workspaceId,
                versao: dbProjeto.versao,
                ativo: true,
            },
            data: {
                nome: aggregate.nome,
                descricao: aggregate.descricao,
                orcamentoEstimado: aggregate.orcamentoEstimado,
                status: aggregate.status,
                prioridade: aggregate.prioridade,
                dataInicioPrevista: aggregate.dataInicioPrevista,
                dataFimPrevista: aggregate.dataFimPrevista,
                dataConclusao: aggregate.dataConclusao,
                versao: { increment: 1 },
            },
        });
        if (updated.count === 0) {
            throw new concurrency_conflict_exception_1.ConcurrencyConflictException('O projeto foi modificado por outra transação. Tente novamente.');
        }
        return this.obterPorId(workspaceId, id);
    }
    async criarEtapa(workspaceId, projetoId, dto) {
        await this.buscarProjetoAtivo(workspaceId, projetoId);
        const maxEtapa = await this.prisma.etapaProjeto.findFirst({
            where: { projetoId, workspaceId, ativo: true },
            orderBy: { ordem: 'desc' },
        });
        const proximaOrdem = dto.ordem ?? (maxEtapa ? maxEtapa.ordem + 1 : 1);
        const dataInicio = dto.dataInicio ? new Date(dto.dataInicio) : null;
        const etapaEntity = etapa_projeto_entity_1.EtapaProjetoEntity.criar({
            workspaceId,
            projetoId,
            nome: dto.nome,
            descricao: dto.descricao,
            ordem: proximaOrdem,
            dataInicio,
        });
        await this.prisma.etapaProjeto.create({
            data: {
                id: etapaEntity.id,
                workspaceId: etapaEntity.workspaceId,
                projetoId: etapaEntity.projetoId,
                nome: etapaEntity.nome,
                descricao: etapaEntity.descricao,
                ordem: etapaEntity.ordem,
                status: etapaEntity.status,
                dataInicio: etapaEntity.dataInicio,
                versao: etapaEntity.versao,
                ativo: etapaEntity.ativo,
            },
        });
        return this.obterPorId(workspaceId, projetoId);
    }
    async reordenarEtapas(workspaceId, projetoId, dto) {
        return this.prisma.$transaction(async (tx) => {
            const updatedParent = await tx.projeto.updateMany({
                where: {
                    id: projetoId,
                    workspaceId,
                    versao: dto.versaoProjetoEsperada,
                    ativo: true,
                },
                data: {
                    versao: { increment: 1 },
                },
            });
            if (updatedParent.count === 0) {
                throw new concurrency_conflict_exception_1.ConcurrencyConflictException('Conflito de concorrência ao reordenar etapas. O projeto foi modificado por outra requisição.');
            }
            const etapasAtivas = await tx.etapaProjeto.findMany({
                where: { projetoId, workspaceId, ativo: true },
            });
            const mapEtapasReq = new Map(dto.etapas.map((e) => [e.id, e.ordem]));
            const etapasOrdenadas = [...etapasAtivas].sort((a, b) => {
                const ordemA = mapEtapasReq.get(a.id) ?? a.ordem;
                const ordemB = mapEtapasReq.get(b.id) ?? b.ordem;
                return ordemA - ordemB;
            });
            let novaOrdemContigua = 1;
            for (const etapa of etapasOrdenadas) {
                await tx.etapaProjeto.update({
                    where: { id: etapa.id },
                    data: {
                        ordem: novaOrdemContigua,
                        versao: { increment: 1 },
                    },
                });
                novaOrdemContigua += 1;
            }
            return this.readModelService.obterProjetoConsolidado(workspaceId, projetoId);
        });
    }
    async vincularItemEtapa(workspaceId, projetoId, etapaId, dto) {
        const projeto = await this.prisma.projeto.findFirst({
            where: { id: projetoId, workspaceId, ativo: true },
        });
        if (!projeto) {
            throw new common_1.NotFoundException('Projeto não encontrado.');
        }
        const etapa = await this.prisma.etapaProjeto.findFirst({
            where: { id: etapaId, projetoId, workspaceId, ativo: true },
        });
        if (!etapa) {
            throw new common_1.NotFoundException('Etapa não encontrada ou não pertence a este Projeto/Workspace.');
        }
        if (dto.itemWishlistId) {
            const wishItem = await this.prisma.itemWishlist.findFirst({
                where: { id: dto.itemWishlistId, workspaceId, ativo: true },
            });
            if (!wishItem) {
                throw new common_1.NotFoundException('Item da Wishlist não encontrado ou pertence a outro workspace.');
            }
        }
        if (dto.metaId) {
            const metaItem = await this.prisma.meta.findFirst({
                where: { id: dto.metaId, workspaceId, dataExclusao: null },
            });
            if (!metaItem) {
                throw new common_1.NotFoundException('Meta não encontrada ou pertence a outro workspace.');
            }
        }
        const itemEntity = item_projeto_entity_1.ItemProjetoEntity.criar({
            workspaceId,
            etapaId,
            itemWishlistId: dto.itemWishlistId,
            metaId: dto.metaId,
            observacoes: dto.observacoes,
        });
        try {
            await this.prisma.itemProjeto.create({
                data: {
                    id: itemEntity.id,
                    workspaceId: itemEntity.workspaceId,
                    etapaId: itemEntity.etapaId,
                    itemWishlistId: itemEntity.itemWishlistId,
                    metaId: itemEntity.metaId,
                    wishlistVinculoAtivoKey: itemEntity.wishlistVinculoAtivoKey,
                    metaVinculoAtivoKey: itemEntity.metaVinculoAtivoKey,
                    observacoes: itemEntity.observacoes,
                    versao: itemEntity.versao,
                    ativo: itemEntity.ativo,
                },
            });
        }
        catch (error) {
            if (error?.code === 'P2002') {
                throw new domain_exception_1.DomainException('Este item da Wishlist ou Meta já está vinculado a um projeto ativo.');
            }
            throw error;
        }
        return this.obterPorId(workspaceId, projetoId);
    }
    async remover(workspaceId, id) {
        await this.buscarProjetoAtivo(workspaceId, id);
        await this.prisma.$transaction(async (tx) => {
            await tx.projeto.updateMany({
                where: { id, workspaceId, ativo: true },
                data: { ativo: false, versao: { increment: 1 } },
            });
            await tx.etapaProjeto.updateMany({
                where: { projetoId: id, workspaceId, ativo: true },
                data: { ativo: false, versao: { increment: 1 } },
            });
            const etapas = await tx.etapaProjeto.findMany({
                where: { projetoId: id, workspaceId },
                select: { id: true },
            });
            const etapaIds = etapas.map((e) => e.id);
            if (etapaIds.length > 0) {
                await tx.itemProjeto.updateMany({
                    where: { etapaId: { in: etapaIds }, workspaceId, ativo: true },
                    data: {
                        ativo: false,
                        wishlistVinculoAtivoKey: null,
                        metaVinculoAtivoKey: null,
                        versao: { increment: 1 },
                    },
                });
            }
        });
        return { sucesso: true, mensagem: 'Projeto e suas etapas foram removidos com sucesso.' };
    }
    async buscarProjetoAtivo(workspaceId, id) {
        const projeto = await this.prisma.projeto.findFirst({
            where: { id, workspaceId, ativo: true },
        });
        if (!projeto) {
            throw new common_1.NotFoundException('Projeto não encontrado.');
        }
        return projeto;
    }
    mapToAggregate(dbProjeto) {
        return projeto_aggregate_1.ProjetoAggregate.reconstituir({
            id: dbProjeto.id,
            workspaceId: dbProjeto.workspaceId,
            nome: dbProjeto.nome,
            descricao: dbProjeto.descricao,
            orcamentoEstimado: dbProjeto.orcamentoEstimado
                ? Number(dbProjeto.orcamentoEstimado)
                : null,
            status: dbProjeto.status,
            prioridade: dbProjeto.prioridade,
            dataInicioPrevista: dbProjeto.dataInicioPrevista
                ? new Date(dbProjeto.dataInicioPrevista)
                : null,
            dataFimPrevista: dbProjeto.dataFimPrevista
                ? new Date(dbProjeto.dataFimPrevista)
                : null,
            dataConclusao: dbProjeto.dataConclusao
                ? new Date(dbProjeto.dataConclusao)
                : null,
            versao: dbProjeto.versao,
            ativo: dbProjeto.ativo,
            dataCriacao: new Date(dbProjeto.dataCriacao),
            dataAtualizacao: new Date(dbProjeto.dataAtualizacao),
        });
    }
    async simular(workspaceId, id, dto) {
        const proj = await this.obterPorId(workspaceId, id);
        if (!proj)
            throw new common_1.NotFoundException('Projeto não encontrado');
        const multAporte = Math.max(0.1, dto.multiplicadorAporteMensal || 1.0);
        const multEsfriamento = Math.max(0, dto.multiplicadorTempoEsfriamento ?? 1.0);
        const novoOrcamento = dto.novoOrcamentoEstimado || proj.orcamentoEstimado;
        const prazoRaw = proj.prazoEstimado || proj.dataFimPrevista;
        const dataPrazoOriginal = prazoRaw
            ? new Date(prazoRaw)
            : new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);
        const dataHoje = new Date();
        const duracaoBaseMeses = Math.max(1, Math.round((dataPrazoOriginal.getTime() - dataHoje.getTime()) / (1000 * 60 * 60 * 24 * 30)));
        const baseline = {
            dataTerminoEstimada: dataPrazoOriginal.toISOString(),
            duracaoMeses: duracaoBaseMeses,
            custoTotal: proj.custoEstimadoCalculado || proj.orcamentoEstimado,
            readinessScore: proj.readinessScore || 50,
            coberturaFinanceira: proj.coberturaFinanceira || 0,
        };
        const fatorVelocidade = multAporte / (0.3 + 0.7 * (multEsfriamento || 0.1));
        const diasTotaisBase = duracaoBaseMeses * 30;
        const diasSimuladosTotais = Math.max(15, Math.round(diasTotaisBase / fatorVelocidade));
        const diasEconomizados = diasTotaisBase - diasSimuladosTotais;
        const mesesEconomizados = Number((diasEconomizados / 30).toFixed(1));
        const novaDataFimMs = dataHoje.getTime() + diasSimuladosTotais * 24 * 60 * 60 * 1000;
        const novaDataConclusao = new Date(novaDataFimMs).toISOString();
        const difOrcamento = novoOrcamento - proj.orcamentoEstimado;
        let novaCobertura = proj.coberturaFinanceira;
        if (novoOrcamento > 0) {
            const valorFinanciado = proj.valorFinanciado || 0;
            novaCobertura = Math.min(100, Math.round((valorFinanciado / novoOrcamento) * 100));
        }
        const incrementoReadiness = Math.round((multAporte - 1.0) * 18 + (1.0 - multEsfriamento) * 12 + (difOrcamento > 0 ? 5 : -5));
        const novoReadinessScore = Math.max(0, Math.min(100, (proj.readinessScore || 50) + incrementoReadiness));
        const impacto = {
            diasAntecipacao: diasEconomizados,
            mesesAntecipacao: mesesEconomizados,
            novaDataConclusao,
            novoReadinessScore,
            novaCoberturaFinanceira: novaCobertura,
            diferencaOrcamento: difOrcamento,
        };
        const etapasTimeline = (proj.etapas || []).map((etapa, index) => {
            const numEtapas = Math.max(1, proj.etapas.length);
            const diasEtapaBase = Math.max(10, Math.round(diasTotaisBase / numEtapas));
            const diasEtapaSimulada = Math.max(5, Math.round(diasSimuladosTotais / numEtapas));
            const offsetRealStart = index * diasEtapaBase;
            const offsetRealEnd = (index + 1) * diasEtapaBase;
            const offsetSimStart = index * diasEtapaSimulada;
            const offsetSimEnd = (index + 1) * diasEtapaSimulada;
            const dataInicioReal = new Date(dataHoje.getTime() + offsetRealStart * 86400000).toISOString();
            const dataFimReal = new Date(dataHoje.getTime() + offsetRealEnd * 86400000).toISOString();
            const dataInicioSimulada = new Date(dataHoje.getTime() + offsetSimStart * 86400000).toISOString();
            const dataFimSimulada = new Date(dataHoje.getTime() + offsetSimEnd * 86400000).toISOString();
            const diffDias = diasEtapaBase - diasEtapaSimulada;
            let rScoreEtapa = etapa.readinessScore || 50;
            if (etapa.status === 'CONCLUIDA') {
                rScoreEtapa = 100;
            }
            else {
                rScoreEtapa = Math.max(0, Math.min(100, rScoreEtapa + incrementoReadiness));
            }
            return {
                etapaId: etapa.id,
                nome: etapa.nome,
                ordem: etapa.ordem || index + 1,
                status: etapa.status,
                custo: etapa.custoCalculado || etapa.custoEstimado,
                readinessScore: rScoreEtapa,
                dataInicioReal,
                dataFimReal,
                dataInicioSimulada,
                dataFimSimulada,
                diasDiferenca: diffDias,
            };
        });
        const gargalo = {
            etapaId: proj.etapas?.[0]?.id,
            nomeEtapa: proj.etapas?.[0]?.nome,
            causa: `Concentração do ritmo de aportes na etapa sequencial inicial.`,
            gravidade: multAporte < 0.8 ? 'ALTA' : 'MEDIA',
            sugestaoAcao: 'Ajustar o aporte mensal conforme planejado no simulador What-If.',
        };
        return {
            projetoId: id,
            parametros: dto,
            baseline,
            impacto,
            gargalo,
            etapasTimeline,
        };
    }
    async aplicarSimulacao(workspaceId, id, dto) {
        if (dto.novoOrcamentoEstimado) {
            await this.atualizar(workspaceId, id, {
                orcamentoEstimado: dto.novoOrcamentoEstimado,
            });
        }
        return this.obterPorId(workspaceId, id);
    }
};
exports.ProjetosService = ProjetosService;
exports.ProjetosService = ProjetosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        projetos_read_model_service_1.ProjetosReadModelService])
], ProjetosService);
//# sourceMappingURL=projetos.service.js.map