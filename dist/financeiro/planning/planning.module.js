"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanningModule = void 0;
const common_1 = require("@nestjs/common");
const planning_controller_1 = require("./planning.controller");
const timeline_forecast_read_model_service_1 = require("./read-models/timeline-forecast-read-model.service");
const planning_overview_read_model_service_1 = require("./read-models/planning-overview-read-model.service");
const prisma_module_1 = require("../../prisma/prisma.module");
const projetos_module_1 = require("../../projetos/projetos.module");
let PlanningModule = class PlanningModule {
};
exports.PlanningModule = PlanningModule;
exports.PlanningModule = PlanningModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, projetos_module_1.ProjetosModule],
        controllers: [planning_controller_1.PlanningController],
        providers: [
            timeline_forecast_read_model_service_1.TimelineForecastReadModelService,
            planning_overview_read_model_service_1.PlanningOverviewReadModelService,
        ],
        exports: [
            timeline_forecast_read_model_service_1.TimelineForecastReadModelService,
            planning_overview_read_model_service_1.PlanningOverviewReadModelService,
        ],
    })
], PlanningModule);
//# sourceMappingURL=planning.module.js.map