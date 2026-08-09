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
exports.CriarRegraRecorrenciaDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CriarRegraRecorrenciaDto {
    tipo;
    descricao;
    valor;
    diaVencimento;
    categoriaId;
    carteiraId;
    dataInicio;
    dataFim;
}
exports.CriarRegraRecorrenciaDto = CriarRegraRecorrenciaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tipo de lançamento', enum: ['RECEITA', 'DESPESA'], example: 'DESPESA' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(['RECEITA', 'DESPESA']),
    __metadata("design:type", String)
], CriarRegraRecorrenciaDto.prototype, "tipo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Descrição da regra recorrente', example: 'Aluguel do Imóvel' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CriarRegraRecorrenciaDto.prototype, "descricao", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Valor fixo estimado em Reais', example: 2500.0 }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], CriarRegraRecorrenciaDto.prototype, "valor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Dia do mês de vencimento (1 a 31)', example: 10 }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(31),
    __metadata("design:type", Number)
], CriarRegraRecorrenciaDto.prototype, "diaVencimento", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID da categoria financeira', example: 'cat-moradia' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CriarRegraRecorrenciaDto.prototype, "categoriaId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID da carteira de vinculação (opcional)', example: 'cart-123', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CriarRegraRecorrenciaDto.prototype, "carteiraId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Data de início da vigência do contrato', example: '2026-01-01T00:00:00.000Z' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CriarRegraRecorrenciaDto.prototype, "dataInicio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Data de término da vigência do contrato (opcional)', example: '2026-12-31T00:00:00.000Z', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CriarRegraRecorrenciaDto.prototype, "dataFim", void 0);
//# sourceMappingURL=criar-regra-recorrencia.dto.js.map