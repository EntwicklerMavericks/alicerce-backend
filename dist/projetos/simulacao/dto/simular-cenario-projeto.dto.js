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
exports.SimularCenarioProjetoDto = exports.AjusteCustoEtapaDto = exports.AporteEtapaDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class AporteEtapaDto {
    etapaId;
    aporteMensal;
}
exports.AporteEtapaDto = AporteEtapaDto;
class AjusteCustoEtapaDto {
    etapaId;
    multiplicadorCusto;
    custoFixoAdicional;
}
exports.AjusteCustoEtapaDto = AjusteCustoEtapaDto;
class SimularCenarioProjetoDto {
    aporteMensalGlobal;
    aportesMensaisEtapas;
    multiplicadorEsfriamento;
    ajustesCustoEtapas;
    dataInicioSimulada;
}
exports.SimularCenarioProjetoDto = SimularCenarioProjetoDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Aporte mensal global aplicado ao projeto' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], SimularCenarioProjetoDto.prototype, "aporteMensalGlobal", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Aportes mensais específicos por etapa (Record ou Array)',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SimularCenarioProjetoDto.prototype, "aportesMensaisEtapas", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Multiplicador do período de esfriamento (0.0 a 2.0)',
        default: 1.0,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.0),
    (0, class_validator_1.Max)(2.0),
    __metadata("design:type", Number)
], SimularCenarioProjetoDto.prototype, "multiplicadorEsfriamento", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Ajustes de custo específicos por etapa' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], SimularCenarioProjetoDto.prototype, "ajustesCustoEtapas", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Data de início simulada para o cronograma' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], SimularCenarioProjetoDto.prototype, "dataInicioSimulada", void 0);
//# sourceMappingURL=simular-cenario-projeto.dto.js.map