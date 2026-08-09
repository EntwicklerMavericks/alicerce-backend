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
exports.CriarProdutoDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CriarProdutoDto {
    nome;
    descricao;
    marca;
    categoriaId;
    observacoes;
}
exports.CriarProdutoDto = CriarProdutoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Torneira Monocomando Deca', description: 'Nome do produto' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'O nome do produto é obrigatório' }),
    __metadata("design:type", String)
], CriarProdutoDto.prototype, "nome", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Torneira de cozinha com misturador', description: 'Descrição detalhada' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CriarProdutoDto.prototype, "descricao", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Deca', description: 'Marca do produto' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CriarProdutoDto.prototype, "marca", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'cat-uuid-123', description: 'ID da categoria no workspace' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CriarProdutoDto.prototype, "categoriaId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Acabamento cromado', description: 'Observações adicionais' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CriarProdutoDto.prototype, "observacoes", void 0);
//# sourceMappingURL=criar-produto.dto.js.map