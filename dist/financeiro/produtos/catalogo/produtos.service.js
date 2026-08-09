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
exports.ProdutosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const produto_aggregate_1 = require("../domain/entities/produto.aggregate");
const preco_observado_vo_1 = require("../domain/value-objects/preco-observado.vo");
const concurrency_conflict_exception_1 = require("../../domain/exceptions/concurrency-conflict.exception");
const client_1 = require("@prisma/client");
let ProdutosService = class ProdutosService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async obterProdutoDoWorkspace(workspaceId, produtoId) {
        const produto = await this.prisma.produto.findFirst({
            where: {
                id: produtoId,
                workspaceId,
                ativo: true,
            },
            include: {
                categoria: true,
                imagens: { where: { ativo: true }, orderBy: { ordem: 'asc' } },
                links: {
                    where: { ativo: true },
                    include: {
                        loja: true,
                        historicoPrecos: { orderBy: { data: 'desc' }, take: 10 },
                    },
                },
            },
        });
        if (!produto) {
            throw new common_1.NotFoundException('Produto não encontrado ou não pertence ao workspace.');
        }
        return produto;
    }
    async validarCategoriaDoWorkspace(workspaceId, categoriaId) {
        const categoria = await this.prisma.categoria.findFirst({
            where: {
                id: categoriaId,
                workspaceId,
            },
        });
        if (!categoria) {
            throw new common_1.ForbiddenException('A categoria informada não pertence ao workspace.');
        }
    }
    async validarLojaAcessivel(workspaceId, lojaId) {
        const loja = await this.prisma.loja.findFirst({
            where: {
                id: lojaId,
                ativo: true,
                OR: [{ workspaceId }, { sistema: true }],
            },
        });
        if (!loja) {
            throw new common_1.ForbiddenException('A loja informada não pertence ao workspace nem é global do sistema.');
        }
        return loja;
    }
    async criar(workspaceId, dto) {
        if (dto.categoriaId) {
            await this.validarCategoriaDoWorkspace(workspaceId, dto.categoriaId);
        }
        const produtoAggregate = new produto_aggregate_1.ProdutoAggregate('temp-id', workspaceId, dto.nome, dto.descricao || null, dto.marca || null, dto.categoriaId || null, dto.observacoes || null);
        return this.prisma.produto.create({
            data: {
                workspaceId: produtoAggregate.workspaceId,
                nome: produtoAggregate.nome,
                descricao: produtoAggregate.descricao,
                marca: produtoAggregate.marca,
                categoriaId: produtoAggregate.categoriaId,
                observacoes: produtoAggregate.observacoes,
                ativo: true,
            },
            include: {
                categoria: true,
                imagens: true,
                links: { include: { loja: true } },
            },
        });
    }
    async listarPorWorkspace(workspaceId, categoriaId) {
        return this.prisma.produto.findMany({
            where: {
                workspaceId,
                ativo: true,
                ...(categoriaId ? { categoriaId } : {}),
            },
            include: {
                categoria: true,
                imagens: { where: { ativo: true }, orderBy: { ordem: 'asc' } },
                links: {
                    where: { ativo: true },
                    include: {
                        loja: true,
                        historicoPrecos: { orderBy: { data: 'desc' }, take: 5 },
                    },
                },
            },
            orderBy: { nome: 'asc' },
        });
    }
    async obterPorId(workspaceId, id) {
        return this.obterProdutoDoWorkspace(workspaceId, id);
    }
    async atualizar(workspaceId, id, dto) {
        const produto = await this.obterProdutoDoWorkspace(workspaceId, id);
        if (dto.categoriaId) {
            await this.validarCategoriaDoWorkspace(workspaceId, dto.categoriaId);
        }
        const aggregate = new produto_aggregate_1.ProdutoAggregate(produto.id, produto.workspaceId, produto.nome, produto.descricao, produto.marca, produto.categoriaId, produto.observacoes, produto.ativo);
        aggregate.atualizarDados(dto.nome, dto.descricao, dto.marca, dto.categoriaId, dto.observacoes);
        return this.prisma.produto.update({
            where: { id },
            data: {
                nome: aggregate.nome,
                descricao: aggregate.descricao,
                marca: aggregate.marca,
                categoriaId: aggregate.categoriaId,
                observacoes: aggregate.observacoes,
            },
            include: {
                categoria: true,
                imagens: { where: { ativo: true } },
                links: { where: { ativo: true }, include: { loja: true } },
            },
        });
    }
    async remover(workspaceId, id) {
        await this.obterProdutoDoWorkspace(workspaceId, id);
        return this.prisma.produto.update({
            where: { id },
            data: { ativo: false },
        });
    }
    async vincularLink(workspaceId, produtoId, dto) {
        await this.obterProdutoDoWorkspace(workspaceId, produtoId);
        await this.validarLojaAcessivel(workspaceId, dto.lojaId);
        preco_observado_vo_1.PrecoObservado.deReais(dto.preco);
        const linkExistente = await this.prisma.linkProduto.findUnique({
            where: {
                produtoId_lojaId: {
                    produtoId,
                    lojaId: dto.lojaId,
                },
            },
        });
        if (linkExistente) {
            if (linkExistente.ativo) {
                throw new common_1.ConflictException('Oferta já cadastrada para esta loja');
            }
            const agora = new Date();
            return this.prisma.$transaction(async (tx) => {
                const reativado = await tx.linkProduto.update({
                    where: { id: linkExistente.id },
                    data: {
                        ativo: true,
                        url: dto.url,
                        preco: dto.preco,
                        versao: { increment: 1 },
                        ultimaVerificacao: agora,
                    },
                    include: { loja: true },
                });
                await tx.historicoPreco.create({
                    data: {
                        linkProdutoId: reativado.id,
                        preco: dto.preco,
                        data: agora,
                    },
                });
                return reativado;
            });
        }
        const agora = new Date();
        try {
            return await this.prisma.$transaction(async (tx) => {
                const link = await tx.linkProduto.create({
                    data: {
                        produtoId,
                        lojaId: dto.lojaId,
                        url: dto.url,
                        preco: dto.preco,
                        versao: 0,
                        ativo: true,
                        ultimaVerificacao: agora,
                    },
                    include: { loja: true },
                });
                await tx.historicoPreco.create({
                    data: {
                        linkProdutoId: link.id,
                        preco: dto.preco,
                        data: agora,
                    },
                });
                return link;
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                const recheck = await this.prisma.linkProduto.findUnique({
                    where: {
                        produtoId_lojaId: { produtoId, lojaId: dto.lojaId },
                    },
                });
                if (recheck?.ativo) {
                    throw new common_1.ConflictException('Oferta já cadastrada para esta loja');
                }
                else if (recheck) {
                    return this.prisma.$transaction(async (tx) => {
                        const reativado = await tx.linkProduto.update({
                            where: { id: recheck.id },
                            data: {
                                ativo: true,
                                url: dto.url,
                                preco: dto.preco,
                                versao: { increment: 1 },
                                ultimaVerificacao: agora,
                            },
                            include: { loja: true },
                        });
                        await tx.historicoPreco.create({
                            data: {
                                linkProdutoId: reativado.id,
                                preco: dto.preco,
                                data: agora,
                            },
                        });
                        return reativado;
                    });
                }
            }
            throw error;
        }
    }
    async atualizarPrecoLink(workspaceId, produtoId, linkId, dto) {
        await this.obterProdutoDoWorkspace(workspaceId, produtoId);
        const link = await this.prisma.linkProduto.findFirst({
            where: {
                id: linkId,
                produtoId,
                ativo: true,
            },
        });
        if (!link) {
            throw new common_1.NotFoundException('Link de produto não encontrado.');
        }
        const novoPrecoVO = preco_observado_vo_1.PrecoObservado.deReais(dto.preco);
        const precoAtualNum = Number(link.preco);
        const novoPrecoNum = novoPrecoVO.paraReais();
        const agora = new Date();
        if (precoAtualNum === novoPrecoNum) {
            return this.prisma.linkProduto.update({
                where: { id: linkId },
                data: {
                    ultimaVerificacao: agora,
                    ...(dto.url ? { url: dto.url } : {}),
                },
                include: { loja: true },
            });
        }
        const result = await this.prisma.linkProduto.updateMany({
            where: {
                id: linkId,
                versao: dto.versao,
            },
            data: {
                preco: novoPrecoNum,
                versao: { increment: 1 },
                ultimaVerificacao: agora,
                ...(dto.url ? { url: dto.url } : {}),
            },
        });
        if (result.count === 0) {
            throw new concurrency_conflict_exception_1.ConcurrencyConflictException('Conflito de concorrência ao atualizar o preço do link. O registro foi alterado por outra requisição.');
        }
        await this.prisma.historicoPreco.create({
            data: {
                linkProdutoId: linkId,
                preco: novoPrecoNum,
                data: agora,
            },
        });
        return this.prisma.linkProduto.findUnique({
            where: { id: linkId },
            include: { loja: true, historicoPrecos: { orderBy: { data: 'desc' }, take: 10 } },
        });
    }
    async removerLink(workspaceId, produtoId, linkId) {
        await this.obterProdutoDoWorkspace(workspaceId, produtoId);
        const link = await this.prisma.linkProduto.findFirst({
            where: { id: linkId, produtoId, ativo: true },
        });
        if (!link) {
            throw new common_1.NotFoundException('Link de produto não encontrado.');
        }
        return this.prisma.linkProduto.update({
            where: { id: linkId },
            data: { ativo: false },
        });
    }
    async adicionarImagem(workspaceId, produtoId, dto) {
        const produto = await this.obterProdutoDoWorkspace(workspaceId, produtoId);
        const imagensAtivas = produto.imagens.map((img) => ({
            id: img.id,
            produtoId: img.produtoId,
            url: img.url,
            ordem: img.ordem,
            principal: img.principal,
            ativo: img.ativo,
            dataCriacao: img.dataCriacao,
        }));
        const novaImagem = {
            id: 'temp',
            produtoId,
            url: dto.url,
            ordem: dto.ordem ?? imagensAtivas.length,
            principal: dto.principal ?? false,
            ativo: true,
        };
        const aggregate = new produto_aggregate_1.ProdutoAggregate(produto.id, produto.workspaceId, produto.nome, produto.descricao, produto.marca, produto.categoriaId, produto.observacoes, produto.ativo, imagensAtivas);
        aggregate.adicionarImagem(novaImagem);
        if (dto.principal) {
            return this.prisma.$transaction(async (tx) => {
                await tx.imagemProduto.updateMany({
                    where: { produtoId, ativo: true },
                    data: { principal: false },
                });
                return tx.imagemProduto.create({
                    data: {
                        produtoId,
                        url: dto.url,
                        ordem: dto.ordem ?? imagensAtivas.length,
                        principal: true,
                        ativo: true,
                    },
                });
            });
        }
        return this.prisma.imagemProduto.create({
            data: {
                produtoId,
                url: dto.url,
                ordem: dto.ordem ?? imagensAtivas.length,
                principal: false,
                ativo: true,
            },
        });
    }
    async definirImagemPrincipal(workspaceId, produtoId, imagemId) {
        const produto = await this.obterProdutoDoWorkspace(workspaceId, produtoId);
        const imagensDomain = produto.imagens.map((img) => ({
            id: img.id,
            produtoId: img.produtoId,
            url: img.url,
            ordem: img.ordem,
            principal: img.principal,
            ativo: img.ativo,
        }));
        const aggregate = new produto_aggregate_1.ProdutoAggregate(produto.id, produto.workspaceId, produto.nome, produto.descricao, produto.marca, produto.categoriaId, produto.observacoes, produto.ativo, imagensDomain);
        aggregate.definirImagemPrincipal(imagemId);
        return this.prisma.$transaction(async (tx) => {
            await tx.imagemProduto.updateMany({
                where: { produtoId, ativo: true },
                data: { principal: false },
            });
            return tx.imagemProduto.update({
                where: { id: imagemId },
                data: { principal: true },
            });
        });
    }
    async removerImagem(workspaceId, produtoId, imagemId) {
        await this.obterProdutoDoWorkspace(workspaceId, produtoId);
        const imagem = await this.prisma.imagemProduto.findFirst({
            where: { id: imagemId, produtoId, ativo: true },
        });
        if (!imagem) {
            throw new common_1.NotFoundException('Imagem do produto não encontrada.');
        }
        return this.prisma.imagemProduto.update({
            where: { id: imagemId },
            data: { ativo: false, principal: false },
        });
    }
};
exports.ProdutosService = ProdutosService;
exports.ProdutosService = ProdutosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProdutosService);
//# sourceMappingURL=produtos.service.js.map