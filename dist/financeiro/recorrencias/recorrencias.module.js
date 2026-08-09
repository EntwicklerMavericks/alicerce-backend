"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecorrenciasModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
const recorrencias_service_1 = require("./recorrencias.service");
const recurring_generator_service_1 = require("./recurring-generator.service");
const recorrencias_controller_1 = require("./recorrencias.controller");
let RecorrenciasModule = class RecorrenciasModule {
};
exports.RecorrenciasModule = RecorrenciasModule;
exports.RecorrenciasModule = RecorrenciasModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [recorrencias_controller_1.RecorrenciasController],
        providers: [recorrencias_service_1.RecorrenciasService, recurring_generator_service_1.RecurringGeneratorService],
        exports: [recorrencias_service_1.RecorrenciasService, recurring_generator_service_1.RecurringGeneratorService],
    })
], RecorrenciasModule);
//# sourceMappingURL=recorrencias.module.js.map