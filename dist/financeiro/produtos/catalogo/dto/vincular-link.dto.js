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
exports.VincularLinkDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class VincularLinkDto {
    lojaId;
    url;
    preco;
}
exports.VincularLinkDto = VincularLinkDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'loja-uuid-123', description: 'ID da loja (global ou do workspace)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'O ID da loja é obrigatório' }),
    __metadata("design:type", String)
], VincularLinkDto.prototype, "lojaId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://www.leroymerlin.com.br/torneira-deca-123', description: 'URL do anúncio do produto' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'A URL do anúncio é obrigatória' }),
    __metadata("design:type", String)
], VincularLinkDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 450.9, description: 'Preço observado em reais (> 0)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01, { message: 'O preço deve ser maior que zero' }),
    __metadata("design:type", Number)
], VincularLinkDto.prototype, "preco", void 0);
//# sourceMappingURL=vincular-link.dto.js.map