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
exports.CriarProjetoDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CriarProjetoDto {
    nome;
    descricao;
    orcamentoEstimado;
    prioridade;
    dataInicioPrevista;
    dataFimPrevista;
}
exports.CriarProjetoDto = CriarProjetoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nome do projeto de longo prazo' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'O nome do projeto é obrigatório.' }),
    __metadata("design:type", String)
], CriarProjetoDto.prototype, "nome", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Descrição detalhada do projeto' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CriarProjetoDto.prototype, "descricao", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Orçamento estimado manual definido pelo usuário' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'O orçamento estimado deve ser um número.' }),
    (0, class_validator_1.Min)(0, { message: 'O orçamento estimado não pode ser negativo.' }),
    __metadata("design:type", Number)
], CriarProjetoDto.prototype, "orcamentoEstimado", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Nível de prioridade do projeto (1 = Normal, 2 = Alta, etc.)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CriarProjetoDto.prototype, "prioridade", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Data de início prevista (ISO 8601)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Data de início prevista deve ser uma data ISO válida.' }),
    __metadata("design:type", String)
], CriarProjetoDto.prototype, "dataInicioPrevista", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Data de fim prevista (ISO 8601)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Data de fim prevista deve ser uma data ISO válida.' }),
    __metadata("design:type", String)
], CriarProjetoDto.prototype, "dataFimPrevista", void 0);
//# sourceMappingURL=criar-projeto.dto.js.map