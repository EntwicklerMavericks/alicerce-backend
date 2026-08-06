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
exports.CriarPessoaDto = exports.ConfigSalarioDto = exports.TipoSalarioEnum = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
var TipoSalarioEnum;
(function (TipoSalarioEnum) {
    TipoSalarioEnum["FIXO"] = "FIXO";
    TipoSalarioEnum["POR_HORA"] = "POR_HORA";
    TipoSalarioEnum["COMISSAO"] = "COMISSAO";
    TipoSalarioEnum["DIARIO"] = "DIARIO";
})(TipoSalarioEnum || (exports.TipoSalarioEnum = TipoSalarioEnum = {}));
class ConfigSalarioDto {
    tipo;
    valorBase;
    valorHora;
    horasDiarias;
    diasTrabalhoMes;
}
exports.ConfigSalarioDto = ConfigSalarioDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: TipoSalarioEnum, example: TipoSalarioEnum.FIXO }),
    (0, class_validator_1.IsEnum)(TipoSalarioEnum),
    __metadata("design:type", String)
], ConfigSalarioDto.prototype, "tipo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 8500.0, description: 'Valor base bruto mensal' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ConfigSalarioDto.prototype, "valorBase", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 65.0, description: 'Valor por hora (para tipo POR_HORA)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ConfigSalarioDto.prototype, "valorHora", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 8.0, description: 'Horas trabalhadas por dia' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ConfigSalarioDto.prototype, "horasDiarias", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 22, description: 'Dias de trabalho por mês' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ConfigSalarioDto.prototype, "diasTrabalhoMes", void 0);
class CriarPessoaDto {
    nome;
    parentesco;
    configSalario;
}
exports.CriarPessoaDto = CriarPessoaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Carla Oliveira', description: 'Nome do membro da família' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'O nome é obrigatório' }),
    __metadata("design:type", String)
], CriarPessoaDto.prototype, "nome", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Cônjuge', description: 'Grau de parentesco (Titular, Cônjuge, Filho)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'O parentesco é obrigatório' }),
    __metadata("design:type", String)
], CriarPessoaDto.prototype, "parentesco", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: ConfigSalarioDto }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ConfigSalarioDto),
    __metadata("design:type", ConfigSalarioDto)
], CriarPessoaDto.prototype, "configSalario", void 0);
//# sourceMappingURL=criar-pessoa.dto.js.map