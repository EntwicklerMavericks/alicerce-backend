import { TimelineForecastReadModelService } from './read-models/timeline-forecast-read-model.service';
import { PlanningOverviewReadModelService } from './read-models/planning-overview-read-model.service';
export declare class PlanningController {
    private readonly timelineForecastReadModelService;
    private readonly planningOverviewReadModelService;
    constructor(timelineForecastReadModelService: TimelineForecastReadModelService, planningOverviewReadModelService: PlanningOverviewReadModelService);
    obterForecast(workspaceId: string, referenceDateStr?: string, mesesStr?: string): Promise<import("./read-models/timeline-forecast-read-model.service").TimelineForecastResult>;
    obterOverview(workspaceId: string, referenceDateStr?: string): Promise<import("./read-models/planning-overview-read-model.service").PlanningOverviewResult>;
}
