import { ProdutosService } from './produtos.service';
import { CriarProdutoDto } from './dto/criar-produto.dto';
import { AtualizarProdutoDto } from './dto/atualizar-produto.dto';
import { VincularLinkDto } from './dto/vincular-link.dto';
import { AtualizarPrecoLinkDto } from './dto/atualizar-preco-link.dto';
export declare class ProdutosController {
    private readonly produtosService;
    constructor(produtosService: ProdutosService);
    criar(workspaceId: string, dto: CriarProdutoDto): Promise<{
        categoria: {
            nome: string;
            id: string;
            dataCriacao: Date;
            dataAtualizacao: Date;
            tipo: import("@prisma/client").$Enums.TipoCategoria;
            icone: string | null;
            cor: string | null;
            workspaceId: string | null;
            sistema: boolean;
            categoriaPaiId: string | null;
        } | null;
        links: ({
            loja: {
                nome: string;
                id: string;
                dataCriacao: Date;
                ativo: boolean;
                workspaceId: string | null;
                sistema: boolean;
                urlWebsite: string | null;
                urlLogo: string | null;
            };
        } & {
            id: string;
            dataCriacao: Date;
            dataAtualizacao: Date;
            ativo: boolean;
            lojaId: string;
            url: string;
            preco: import("@prisma/client/runtime/library").Decimal;
            versao: number;
            produtoId: string;
            ultimaVerificacao: Date | null;
        })[];
        imagens: {
            id: string;
            dataCriacao: Date;
            ativo: boolean;
            url: string;
            ordem: number;
            produtoId: string;
            principal: boolean;
        }[];
    } & {
        nome: string;
        id: string;
        dataCriacao: Date;
        dataAtualizacao: Date;
        ativo: boolean;
        workspaceId: string;
        descricao: string | null;
        categoriaId: string | null;
        observacoes: string | null;
        marca: string | null;
    }>;
    listar(workspaceId: string, categoriaId?: string): Promise<({
        categoria: {
            nome: string;
            id: string;
            dataCriacao: Date;
            dataAtualizacao: Date;
            tipo: import("@prisma/client").$Enums.TipoCategoria;
            icone: string | null;
            cor: string | null;
            workspaceId: string | null;
            sistema: boolean;
            categoriaPaiId: string | null;
        } | null;
        links: ({
            loja: {
                nome: string;
                id: string;
                dataCriacao: Date;
                ativo: boolean;
                workspaceId: string | null;
                sistema: boolean;
                urlWebsite: string | null;
                urlLogo: string | null;
            };
            historicoPrecos: {
                id: string;
                data: Date;
                preco: import("@prisma/client/runtime/library").Decimal;
                linkProdutoId: string;
            }[];
        } & {
            id: string;
            dataCriacao: Date;
            dataAtualizacao: Date;
            ativo: boolean;
            lojaId: string;
            url: string;
            preco: import("@prisma/client/runtime/library").Decimal;
            versao: number;
            produtoId: string;
            ultimaVerificacao: Date | null;
        })[];
        imagens: {
            id: string;
            dataCriacao: Date;
            ativo: boolean;
            url: string;
            ordem: number;
            produtoId: string;
            principal: boolean;
        }[];
    } & {
        nome: string;
        id: string;
        dataCriacao: Date;
        dataAtualizacao: Date;
        ativo: boolean;
        workspaceId: string;
        descricao: string | null;
        categoriaId: string | null;
        observacoes: string | null;
        marca: string | null;
    })[]>;
    obterPorId(workspaceId: string, id: string): Promise<{
        categoria: {
            nome: string;
            id: string;
            dataCriacao: Date;
            dataAtualizacao: Date;
            tipo: import("@prisma/client").$Enums.TipoCategoria;
            icone: string | null;
            cor: string | null;
            workspaceId: string | null;
            sistema: boolean;
            categoriaPaiId: string | null;
        } | null;
        links: ({
            loja: {
                nome: string;
                id: string;
                dataCriacao: Date;
                ativo: boolean;
                workspaceId: string | null;
                sistema: boolean;
                urlWebsite: string | null;
                urlLogo: string | null;
            };
            historicoPrecos: {
                id: string;
                data: Date;
                preco: import("@prisma/client/runtime/library").Decimal;
                linkProdutoId: string;
            }[];
        } & {
            id: string;
            dataCriacao: Date;
            dataAtualizacao: Date;
            ativo: boolean;
            lojaId: string;
            url: string;
            preco: import("@prisma/client/runtime/library").Decimal;
            versao: number;
            produtoId: string;
            ultimaVerificacao: Date | null;
        })[];
        imagens: {
            id: string;
            dataCriacao: Date;
            ativo: boolean;
            url: string;
            ordem: number;
            produtoId: string;
            principal: boolean;
        }[];
    } & {
        nome: string;
        id: string;
        dataCriacao: Date;
        dataAtualizacao: Date;
        ativo: boolean;
        workspaceId: string;
        descricao: string | null;
        categoriaId: string | null;
        observacoes: string | null;
        marca: string | null;
    }>;
    atualizar(workspaceId: string, id: string, dto: AtualizarProdutoDto): Promise<{
        categoria: {
            nome: string;
            id: string;
            dataCriacao: Date;
            dataAtualizacao: Date;
            tipo: import("@prisma/client").$Enums.TipoCategoria;
            icone: string | null;
            cor: string | null;
            workspaceId: string | null;
            sistema: boolean;
            categoriaPaiId: string | null;
        } | null;
        links: ({
            loja: {
                nome: string;
                id: string;
                dataCriacao: Date;
                ativo: boolean;
                workspaceId: string | null;
                sistema: boolean;
                urlWebsite: string | null;
                urlLogo: string | null;
            };
        } & {
            id: string;
            dataCriacao: Date;
            dataAtualizacao: Date;
            ativo: boolean;
            lojaId: string;
            url: string;
            preco: import("@prisma/client/runtime/library").Decimal;
            versao: number;
            produtoId: string;
            ultimaVerificacao: Date | null;
        })[];
        imagens: {
            id: string;
            dataCriacao: Date;
            ativo: boolean;
            url: string;
            ordem: number;
            produtoId: string;
            principal: boolean;
        }[];
    } & {
        nome: string;
        id: string;
        dataCriacao: Date;
        dataAtualizacao: Date;
        ativo: boolean;
        workspaceId: string;
        descricao: string | null;
        categoriaId: string | null;
        observacoes: string | null;
        marca: string | null;
    }>;
    remover(workspaceId: string, id: string): Promise<void>;
    vincularLink(workspaceId: string, produtoId: string, dto: VincularLinkDto): Promise<{
        loja: {
            nome: string;
            id: string;
            dataCriacao: Date;
            ativo: boolean;
            workspaceId: string | null;
            sistema: boolean;
            urlWebsite: string | null;
            urlLogo: string | null;
        };
    } & {
        id: string;
        dataCriacao: Date;
        dataAtualizacao: Date;
        ativo: boolean;
        lojaId: string;
        url: string;
        preco: import("@prisma/client/runtime/library").Decimal;
        versao: number;
        produtoId: string;
        ultimaVerificacao: Date | null;
    }>;
    atualizarPrecoLink(workspaceId: string, produtoId: string, linkId: string, dto: AtualizarPrecoLinkDto): Promise<({
        loja: {
            nome: string;
            id: string;
            dataCriacao: Date;
            ativo: boolean;
            workspaceId: string | null;
            sistema: boolean;
            urlWebsite: string | null;
            urlLogo: string | null;
        };
    } & {
        id: string;
        dataCriacao: Date;
        dataAtualizacao: Date;
        ativo: boolean;
        lojaId: string;
        url: string;
        preco: import("@prisma/client/runtime/library").Decimal;
        versao: number;
        produtoId: string;
        ultimaVerificacao: Date | null;
    }) | null>;
    removerLink(workspaceId: string, produtoId: string, linkId: string): Promise<void>;
    adicionarImagem(workspaceId: string, produtoId: string, dto: {
        url: string;
        ordem?: number;
        principal?: boolean;
    }): Promise<{
        id: string;
        dataCriacao: Date;
        ativo: boolean;
        url: string;
        ordem: number;
        produtoId: string;
        principal: boolean;
    }>;
    definirImagemPrincipal(workspaceId: string, produtoId: string, imagemId: string): Promise<{
        id: string;
        dataCriacao: Date;
        ativo: boolean;
        url: string;
        ordem: number;
        produtoId: string;
        principal: boolean;
    }>;
    removerImagem(workspaceId: string, produtoId: string, imagemId: string): Promise<void>;
}
