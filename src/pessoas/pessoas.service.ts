import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CriarPessoaDto } from './dto/criar-pessoa.dto';
import { AtualizarSalarioDto } from './dto/atualizar-salario.dto';
import { SalaryCalculatorFactory } from './calculators/salary-calculators';

@Injectable()
export class PessoasService {
  constructor(private readonly prisma: PrismaService) {}

  async criar(workspaceId: string, dto: CriarPessoaDto) {
    const calc = SalaryCalculatorFactory.obterCalculadora(dto.configSalario.tipo);
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
          diasTrabalho: dto.configSalario.diasTrabalhoMes ? { dias: dto.configSalario.diasTrabalhoMes } : Prisma.JsonNull,
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

  async listarPorWorkspace(workspaceId: string) {
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
        const dias = (p.configSalario.diasTrabalho as any)?.dias || 22;
        const calc = SalaryCalculatorFactory.obterCalculadora(p.configSalario.tipo);
        rendaEstimada = calc.calcularRendaMensal({
          tipo: p.configSalario.tipo as any,
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

  async obterPorId(workspaceId: string, id: string) {
    const pessoa = await this.prisma.pessoa.findFirst({
      where: { id, workspaceId, ativo: true },
      include: { configSalario: true },
    });

    if (!pessoa) {
      throw new NotFoundException('Membro não encontrado.');
    }

    return pessoa;
  }

  async atualizarSalario(workspaceId: string, id: string, dto: AtualizarSalarioDto) {
    const pessoa = await this.obterPorId(workspaceId, id);

    const calc = SalaryCalculatorFactory.obterCalculadora(dto.configSalario.tipo);
    const rendaEstimada = calc.calcularRendaMensal(dto.configSalario);

    // Atualiza a configuração salarial ativa
    const configAtualizada = await this.prisma.configSalario.upsert({
      where: { pessoaId: id },
      update: {
        tipo: dto.configSalario.tipo,
        valorBase: dto.configSalario.valorBase || null,
        valorHora: dto.configSalario.valorHora || null,
        horasDiarias: dto.configSalario.horasDiarias || null,
        diasTrabalho: dto.configSalario.diasTrabalhoMes ? { dias: dto.configSalario.diasTrabalhoMes } : Prisma.JsonNull,
      },
      create: {
        pessoaId: id,
        tipo: dto.configSalario.tipo,
        valorBase: dto.configSalario.valorBase || null,
        valorHora: dto.configSalario.valorHora || null,
        horasDiarias: dto.configSalario.horasDiarias || null,
        diasTrabalho: dto.configSalario.diasTrabalhoMes ? { dias: dto.configSalario.diasTrabalhoMes } : Prisma.JsonNull,
      },
    });

    return {
      ...pessoa,
      configSalario: configAtualizada,
      rendaEstimadaMensal: rendaEstimada,
    };
  }

  async remover(workspaceId: string, id: string) {
    await this.obterPorId(workspaceId, id);
    await this.prisma.pessoa.update({
      where: { id },
      data: { ativo: false },
    });
  }
}
