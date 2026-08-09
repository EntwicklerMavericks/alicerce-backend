import { PrioridadeWishlist } from '@prisma/client';
export declare class AtualizarItemWishlistDto {
    nome?: string;
    descricao?: string;
    precoAlvo?: number;
    prioridade?: PrioridadeWishlist;
}
