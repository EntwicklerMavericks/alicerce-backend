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
exports.CriarCartaoDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CriarCartaoDto {
    nome;
    bandeira;
    ultimosDigitos;
    limiteTotal;
    diaFechamento;
    diaVencimento;
    cor;
    icone;
}
exports.CriarCartaoDto = CriarCartaoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nome de identificação do cartão', example: 'Nubank UV' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CriarCartaoDto.prototype, "nome", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Bandeira do cartão', example: 'MASTERCARD', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CriarCartaoDto.prototype, "bandeira", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Últimos 4 dígitos do cartão físico/virtual', example: '4321', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CriarCartaoDto.prototype, "ultimosDigitos", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Limite total concedido em Reais', example: 10000.0 }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], CriarCartaoDto.prototype, "limiteTotal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Dia do mês de fechamento da fatura (1 a 31)', example: 25 }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(31),
    __metadata("design:type", Number)
], CriarCartaoDto.prototype, "diaFechamento", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Dia do mês de vencimento da fatura (1 a 31)', example: 5 }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(31),
    __metadata("design:type", Number)
], CriarCartaoDto.prototype, "diaVencimento", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Cor em formato Hex para o card UI', example: '#820ad1', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CriarCartaoDto.prototype, "cor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Ícone Material Icon', example: 'credit_card', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CriarCartaoDto.prototype, "icone", void 0);
//# sourceMappingURL=criar-cartao.dto.js.map