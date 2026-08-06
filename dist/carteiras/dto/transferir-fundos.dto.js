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
exports.TransferirFundosDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class TransferirFundosDto {
    carteiraOrigemId;
    carteiraDestinoId;
    valor;
    descricao;
}
exports.TransferirFundosDto = TransferirFundosDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'carteira-origem-uuid', description: 'ID da carteira de onde o dinheiro sairá' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'A carteira de origem é obrigatória' }),
    __metadata("design:type", String)
], TransferirFundosDto.prototype, "carteiraOrigemId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'carteira-destino-uuid', description: 'ID da carteira para onde o dinheiro irá' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'A carteira de destino é obrigatória' }),
    __metadata("design:type", String)
], TransferirFundosDto.prototype, "carteiraDestinoId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 500.0, description: 'Valor positivo a transferir' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01, { message: 'O valor da transferência deve ser maior que zero' }),
    __metadata("design:type", Number)
], TransferirFundosDto.prototype, "valor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Reserva para viagem', description: 'Descrição ou nota opcional' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransferirFundosDto.prototype, "descricao", void 0);
//# sourceMappingURL=transferir-fundos.dto.js.map