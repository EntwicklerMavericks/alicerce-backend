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
exports.AtualizarPrecoLinkDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class AtualizarPrecoLinkDto {
    preco;
    versao;
    url;
}
exports.AtualizarPrecoLinkDto = AtualizarPrecoLinkDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 399.9, description: 'Novo preço observado em reais (> 0)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01, { message: 'O preço deve ser maior que zero' }),
    __metadata("design:type", Number)
], AtualizarPrecoLinkDto.prototype, "preco", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0, description: 'Versão atual do link para trava de concorrência otimista' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0, { message: 'A versão deve ser maior ou igual a 0' }),
    __metadata("design:type", Number)
], AtualizarPrecoLinkDto.prototype, "versao", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://www.leroymerlin.com.br/torneira-deca-123', description: 'Atualização opcional da URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AtualizarPrecoLinkDto.prototype, "url", void 0);
//# sourceMappingURL=atualizar-preco-link.dto.js.map