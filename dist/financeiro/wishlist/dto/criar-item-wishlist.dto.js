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
exports.CriarItemWishlistDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CriarItemWishlistDto {
    nome;
    descricao;
    precoAlvo;
    prioridade;
    diasEsfriamento;
    produtoId;
}
exports.CriarItemWishlistDto = CriarItemWishlistDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'O nome do desejo é obrigatório.' }),
    __metadata("design:type", String)
], CriarItemWishlistDto.prototype, "nome", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CriarItemWishlistDto.prototype, "descricao", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'O preço alvo deve ser um número.' }),
    (0, class_validator_1.Min)(0, { message: 'O preço alvo não pode ser negativo.' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CriarItemWishlistDto.prototype, "precoAlvo", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.PrioridadeWishlist, { message: 'Prioridade inválida.' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CriarItemWishlistDto.prototype, "prioridade", void 0);
__decorate([
    (0, class_validator_1.IsInt)({ message: 'Os dias de esfriamento devem ser um número inteiro.' }),
    (0, class_validator_1.Min)(1, { message: 'O tempo de esfriamento mínimo é de 1 dia.' }),
    (0, class_validator_1.Max)(365, { message: 'O tempo de esfriamento máximo é de 365 dias.' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CriarItemWishlistDto.prototype, "diasEsfriamento", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CriarItemWishlistDto.prototype, "produtoId", void 0);
//# sourceMappingURL=criar-item-wishlist.dto.js.map