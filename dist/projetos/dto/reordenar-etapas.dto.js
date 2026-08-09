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
exports.ReordenarEtapasDto = exports.EtapaOrdemItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class EtapaOrdemItemDto {
    id;
    ordem;
}
exports.EtapaOrdemItemDto = EtapaOrdemItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID da etapa do projeto' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'ID da etapa é obrigatório.' }),
    __metadata("design:type", String)
], EtapaOrdemItemDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nova posição de ordem da etapa' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1, { message: 'A ordem deve ser maior ou igual a 1.' }),
    __metadata("design:type", Number)
], EtapaOrdemItemDto.prototype, "ordem", void 0);
class ReordenarEtapasDto {
    versaoProjetoEsperada;
    etapas;
}
exports.ReordenarEtapasDto = ReordenarEtapasDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Versão esperada do Agregado Pai Projeto para trava otimista' }),
    (0, class_validator_1.IsInt)({ message: 'A versão esperada deve ser um número inteiro.' }),
    (0, class_validator_1.Min)(0, { message: 'A versão esperada deve ser maior ou igual a 0.' }),
    __metadata("design:type", Number)
], ReordenarEtapasDto.prototype, "versaoProjetoEsperada", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Lista de etapas com suas respectivas novas ordens', type: [EtapaOrdemItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => EtapaOrdemItemDto),
    __metadata("design:type", Array)
], ReordenarEtapasDto.prototype, "etapas", void 0);
//# sourceMappingURL=reordenar-etapas.dto.js.map