"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentWorkspace = void 0;
const common_1 = require("@nestjs/common");
exports.CurrentWorkspace = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const workspaceId = request.workspaceId || request.headers['x-workspace-id'] || request.user?.defaultWorkspaceId;
    return data ? workspaceId?.[data] : workspaceId;
});
//# sourceMappingURL=current-workspace.decorator.js.map