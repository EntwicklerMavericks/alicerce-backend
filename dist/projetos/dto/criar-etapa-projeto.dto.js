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
exports.CriarEtapaProjetoDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CriarEtapaProjetoDto {
    nome;
    descricao;
    ordem;
    dataInicio;
}
exports.CriarEtapaProjetoDto = CriarEtapaProjetoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nome da etapa do projeto' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'O nome da etapa é obrigatório.' }),
    __metadata("design:type", String)
], CriarEtapaProjetoDto.prototype, "nome", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Descrição detalhada da etapa' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CriarEtapaProjetoDto.prototype, "descricao", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Ordem sequencial da etapa' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1, { message: 'A ordem da etapa deve ser no mínimo 1.' }),
    __metadata("design:type", Number)
], CriarEtapaProjetoDto.prototype, "ordem", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Data de início prevista da etapa (ISO 8601)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)({}, { message: 'Data de início deve ser uma data ISO válida.' }),
    __metadata("design:type", String)
], CriarEtapaProjetoDto.prototype, "dataInicio", void 0);
//# sourceMappingURL=criar-etapa-projeto.dto.js.map