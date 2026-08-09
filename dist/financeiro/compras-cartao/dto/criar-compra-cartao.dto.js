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
exports.CriarCompraCartaoDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CriarCompraCartaoDto {
    cartaoId;
    categoriaId;
    descricao;
    valorTotal;
    qtdParcelas;
    dataCompra;
    observacoes;
}
exports.CriarCompraCartaoDto = CriarCompraCartaoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID do cartão de crédito', example: 'cartao-123' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CriarCompraCartaoDto.prototype, "cartaoId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID da categoria financeira', example: 'cat-mercado' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CriarCompraCartaoDto.prototype, "categoriaId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Descrição da compra', example: 'Supermercado Mensal' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CriarCompraCartaoDto.prototype, "descricao", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Valor total da compra em Reais', example: 1000.0 }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], CriarCompraCartaoDto.prototype, "valorTotal", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quantidade de parcelas (1x até Nx)', example: 3, default: 1 }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CriarCompraCartaoDto.prototype, "qtdParcelas", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Data em que a compra foi realizada', example: '2026-08-20T14:30:00.000Z' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CriarCompraCartaoDto.prototype, "dataCompra", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Observações adicionais', example: 'Compra de suprimentos no Atacadão', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CriarCompraCartaoDto.prototype, "observacoes", void 0);
//# sourceMappingURL=criar-compra-cartao.dto.js.map