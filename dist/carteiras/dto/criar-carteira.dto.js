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
exports.CriarCarteiraDto = exports.TipoCarteiraEnum = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var TipoCarteiraEnum;
(function (TipoCarteiraEnum) {
    TipoCarteiraEnum["CONTA_CORRENTE"] = "CONTA_CORRENTE";
    TipoCarteiraEnum["DINHEIRO"] = "DINHEIRO";
    TipoCarteiraEnum["CARTEIRA_DIGITAL"] = "CARTEIRA_DIGITAL";
    TipoCarteiraEnum["POUPANCA"] = "POUPANCA";
    TipoCarteiraEnum["INVESTIMENTO"] = "INVESTIMENTO";
    TipoCarteiraEnum["CARTAO_CREDITO"] = "CARTAO_CREDITO";
})(TipoCarteiraEnum || (exports.TipoCarteiraEnum = TipoCarteiraEnum = {}));
class CriarCarteiraDto {
    nome;
    tipo;
    pessoaId;
    saldoInicial;
    permiteSaldoNegativo;
    cor;
    icone;
    padrao;
}
exports.CriarCarteiraDto = CriarCarteiraDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Nubank Principal', description: 'Nome da carteira ou conta bancária' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'O nome da carteira é obrigatório' }),
    __metadata("design:type", String)
], CriarCarteiraDto.prototype, "nome", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: TipoCarteiraEnum, example: TipoCarteiraEnum.CONTA_CORRENTE }),
    (0, class_validator_1.IsEnum)(TipoCarteiraEnum),
    __metadata("design:type", String)
], CriarCarteiraDto.prototype, "tipo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'pessoa-uuid-123', description: 'ID da pessoa titular da conta' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CriarCarteiraDto.prototype, "pessoaId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1500.0, description: 'Saldo inicial de abertura da conta' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CriarCarteiraDto.prototype, "saldoInicial", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true, description: 'Permite saldo negativo nesta conta' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CriarCarteiraDto.prototype, "permiteSaldoNegativo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '#8A05BE', description: 'Cor em formato HEX' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CriarCarteiraDto.prototype, "cor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'account_balance', description: 'Nome do ícone Material Symbols' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CriarCarteiraDto.prototype, "icone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false, description: 'Marcar como carteira principal do workspace' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CriarCarteiraDto.prototype, "padrao", void 0);
//# sourceMappingURL=criar-carteira.dto.js.map