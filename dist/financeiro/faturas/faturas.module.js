"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FaturasModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
const ledger_module_1 = require("../ledger/ledger.module");
const faturas_service_1 = require("./faturas.service");
const faturas_controller_1 = require("./faturas.controller");
const billing_closing_service_1 = require("./application/billing-closing.service");
let FaturasModule = class FaturasModule {
};
exports.FaturasModule = FaturasModule;
exports.FaturasModule = FaturasModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, ledger_module_1.LedgerModule],
        controllers: [faturas_controller_1.FaturasController],
        providers: [faturas_service_1.FaturasService, billing_closing_service_1.BillingClosingService],
        exports: [faturas_service_1.FaturasService, billing_closing_service_1.BillingClosingService],
    })
], FaturasModule);
//# sourceMappingURL=faturas.module.js.map