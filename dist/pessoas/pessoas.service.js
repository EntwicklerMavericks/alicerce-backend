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
exports.PessoasService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const salary_calculators_1 = require("./calculators/salary-calculators");
let PessoasService = class PessoasService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async criar(workspaceId, dto) {
        const calc = salary_calculators_1.SalaryCalculatorFactory.obterCalculadora(dto.configSalario.tipo);
        const rendaEstimada = calc.calcularRendaMensal(dto.configSalario);
        return this.prisma.$transaction(async (tx) => {
            const pessoa = await tx.pessoa.create({
                data: {
                    workspaceId,
                    nome: dto.nome.trim(),
                    parentesco: dto.parentesco.trim(),
                    ativo: true,
                },
            });
            const configSalario = await tx.configSalario.create({
                data: {
                    pessoaId: pessoa.id,
                    tipo: dto.configSalario.tipo,
                    valorBase: dto.configSalario.valorBase || null,
                    valorHora: dto.configSalario.valorHora || null,
                    horasDiarias: dto.configSalario.horasDiarias || null,
                    diasTrabalho: dto.configSalario.diasTrabalhoMes ? { dias: dto.configSalario.diasTrabalhoMes } : client_1.Prisma.JsonNull,
                    ativo: true,
                },
            });
            return {
                ...pessoa,
                configSalario,
                rendaEstimadaMensal: rendaEstimada,
            };
        });
    }
    async listarPorWorkspace(workspaceId) {
        const pessoas = await this.prisma.pessoa.findMany({
            where: { workspaceId, ativo: true },
            include: {
                configSalario: true,
            },
            orderBy: { dataCriacao: 'asc' },
        });
        return pessoas.map((p) => {
            let rendaEstimada = 0;
            if (p.configSalario) {
                const dias = p.configSalario.diasTrabalho?.dias || 22;
                const calc = salary_calculators_1.SalaryCalculatorFactory.obterCalculadora(p.configSalario.tipo);
                rendaEstimada = calc.calcularRendaMensal({
                    tipo: p.configSalario.tipo,
                    valorBase: Number(p.configSalario.valorBase || 0),
                    valorHora: Number(p.configSalario.valorHora || 0),
                    horasDiarias: Number(p.configSalario.horasDiarias || 8),
                    diasTrabalhoMes: dias,
                });
            }
            return {
                ...p,
                rendaEstimadaMensal: rendaEstimada,
            };
        });
    }
    async obterPorId(workspaceId, id) {
        const pessoa = await this.prisma.pessoa.findFirst({
            where: { id, workspaceId, ativo: true },
            include: { configSalario: true },
        });
        if (!pessoa) {
            throw new common_1.NotFoundException('Membro não encontrado.');
        }
        return pessoa;
    }
    async atualizarSalario(workspaceId, id, dto) {
        const pessoa = await this.obterPorId(workspaceId, id);
        const calc = salary_calculators_1.SalaryCalculatorFactory.obterCalculadora(dto.configSalario.tipo);
        const rendaEstimada = calc.calcularRendaMensal(dto.configSalario);
        const configAtualizada = await this.prisma.configSalario.upsert({
            where: { pessoaId: id },
            update: {
                tipo: dto.configSalario.tipo,
                valorBase: dto.configSalario.valorBase || null,
                valorHora: dto.configSalario.valorHora || null,
                horasDiarias: dto.configSalario.horasDiarias || null,
                diasTrabalho: dto.configSalario.diasTrabalhoMes ? { dias: dto.configSalario.diasTrabalhoMes } : client_1.Prisma.JsonNull,
            },
            create: {
                pessoaId: id,
                tipo: dto.configSalario.tipo,
                valorBase: dto.configSalario.valorBase || null,
                valorHora: dto.configSalario.valorHora || null,
                horasDiarias: dto.configSalario.horasDiarias || null,
                diasTrabalho: dto.configSalario.diasTrabalhoMes ? { dias: dto.configSalario.diasTrabalhoMes } : client_1.Prisma.JsonNull,
            },
        });
        return {
            ...pessoa,
            configSalario: configAtualizada,
            rendaEstimadaMensal: rendaEstimada,
        };
    }
    async remover(workspaceId, id) {
        await this.obterPorId(workspaceId, id);
        await this.prisma.pessoa.update({
            where: { id },
            data: { ativo: false },
        });
    }
};
exports.PessoasService = PessoasService;
exports.PessoasService = PessoasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PessoasService);
//# sourceMappingURL=pessoas.service.js.map