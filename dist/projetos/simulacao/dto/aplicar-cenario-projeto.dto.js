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
exports.AplicarCenarioProjetoDto = exports.VersaoEtapaEsperadaDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const simular_cenario_projeto_dto_1 = require("./simular-cenario-projeto.dto");
class VersaoEtapaEsperadaDto {
    etapaId;
    versaoEsperada;
}
exports.VersaoEtapaEsperadaDto = VersaoEtapaEsperadaDto;
class AplicarCenarioProjetoDto {
    versaoProjetoEsperada;
    versoesEtapasEsperadas;
    parametrosSimulacao;
}
exports.AplicarCenarioProjetoDto = AplicarCenarioProjetoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Versão esperada do projeto pai para trava otimista' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AplicarCenarioProjetoDto.prototype, "versaoProjetoEsperada", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Versões esperadas das etapas do projeto' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], AplicarCenarioProjetoDto.prototype, "versoesEtapasEsperadas", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Parâmetros do cenário a serem aplicados no projeto' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => simular_cenario_projeto_dto_1.SimularCenarioProjetoDto),
    __metadata("design:type", simular_cenario_projeto_dto_1.SimularCenarioProjetoDto)
], AplicarCenarioProjetoDto.prototype, "parametrosSimulacao", void 0);
//# sourceMappingURL=aplicar-cenario-projeto.dto.js.map