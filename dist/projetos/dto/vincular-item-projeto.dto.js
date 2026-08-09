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
exports.VincularItemProjetoDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class VincularItemProjetoDto {
    itemWishlistId;
    metaId;
    observacoes;
}
exports.VincularItemProjetoDto = VincularItemProjetoDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID do item da wishlist a vincular (Invariante XOR: wishlist OU meta)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VincularItemProjetoDto.prototype, "itemWishlistId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID da meta financeira a vincular (Invariante XOR: wishlist OU meta)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VincularItemProjetoDto.prototype, "metaId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Observações adicionais do vínculo no projeto' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VincularItemProjetoDto.prototype, "observacoes", void 0);
//# sourceMappingURL=vincular-item-projeto.dto.js.map