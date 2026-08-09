import { PrioridadeWishlist } from '@prisma/client';
export declare class CriarItemWishlistDto {
    nome: string;
    descricao?: string;
    precoAlvo?: number;
    prioridade?: PrioridadeWishlist;
    diasEsfriamento?: number;
    produtoId?: string;
}
