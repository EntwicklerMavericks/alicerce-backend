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
exports.GerarAlertasDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class GerarAlertasDto {
    referenceDate;
    despesas;
    faturas;
    orcamentos;
    metas;
    salarios;
    wishlist;
    sistemas;
}
exports.GerarAlertasDto = GerarAlertasDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-08-08T00:00:00Z', description: 'Data determinística de referência' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], GerarAlertasDto.prototype, "referenceDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Lista de despesas a analisar' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], GerarAlertasDto.prototype, "despesas", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Lista de faturas a analisar' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], GerarAlertasDto.prototype, "faturas", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Lista de orçamentos a analisar' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], GerarAlertasDto.prototype, "orcamentos", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Lista de metas a analisar' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], GerarAlertasDto.prototype, "metas", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Lista de salários a analisar' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], GerarAlertasDto.prototype, "salarios", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Lista de itens da wishlist a analisar' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], GerarAlertasDto.prototype, "wishlist", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Lista de avisos do sistema a analisar' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], GerarAlertasDto.prototype, "sistemas", void 0);
//# sourceMappingURL=gerar-alertas.dto.js.map