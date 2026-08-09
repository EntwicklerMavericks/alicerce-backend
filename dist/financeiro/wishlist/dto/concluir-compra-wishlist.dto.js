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
exports.ConcluirCompraWishlistDto = void 0;
const class_validator_1 = require("class-validator");
class ConcluirCompraWishlistDto {
    quebrarEsfriamento;
    valorCompraInformado;
    categoriaId;
    carteiraId;
    cartaoId;
    observacoes;
}
exports.ConcluirCompraWishlistDto = ConcluirCompraWishlistDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ConcluirCompraWishlistDto.prototype, "quebrarEsfriamento", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'O valor da compra informado deve ser um número.' }),
    (0, class_validator_1.Min)(0, { message: 'O valor da compra não pode ser negativo.' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ConcluirCompraWishlistDto.prototype, "valorCompraInformado", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ConcluirCompraWishlistDto.prototype, "categoriaId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ConcluirCompraWishlistDto.prototype, "carteiraId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ConcluirCompraWishlistDto.prototype, "cartaoId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ConcluirCompraWishlistDto.prototype, "observacoes", void 0);
//# sourceMappingURL=concluir-compra-wishlist.dto.js.map