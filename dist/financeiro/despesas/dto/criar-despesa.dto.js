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
exports.CriarDespesaDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CriarDespesaDto {
    descricao;
    valor;
    dataVencimento;
    categoriaId;
    carteiraId;
    cartaoId;
    metaId;
    statusLiquidacao;
    observacoes;
    recorrente;
    origemRecorrenciaId;
}
exports.CriarDespesaDto = CriarDespesaDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CriarDespesaDto.prototype, "descricao", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CriarDespesaDto.prototype, "valor", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CriarDespesaDto.prototype, "dataVencimento", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CriarDespesaDto.prototype, "categoriaId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CriarDespesaDto.prototype, "carteiraId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CriarDespesaDto.prototype, "cartaoId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CriarDespesaDto.prototype, "metaId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.StatusLiquidacao),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CriarDespesaDto.prototype, "statusLiquidacao", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CriarDespesaDto.prototype, "observacoes", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CriarDespesaDto.prototype, "recorrente", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CriarDespesaDto.prototype, "origemRecorrenciaId", void 0);
//# sourceMappingURL=criar-despesa.dto.js.map