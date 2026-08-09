import { DashboardReadModelService } from './read-models/dashboard-read-model.service';
export declare class DashboardController {
    private readonly dashboardReadModelService;
    constructor(dashboardReadModelService: DashboardReadModelService);
    obterDashboard(workspaceId: string, referenceDateStr?: string): Promise<import("./read-models/dashboard-read-model.service").DashboardResult>;
}
