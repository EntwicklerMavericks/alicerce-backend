import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WorkspacesService } from './workspaces.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Workspaces')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get()
  @ApiOperation({ summary: 'Lista os workspaces pertencentes ao usuário logado' })
  async listarMeusWorkspaces(@CurrentUser('sub') usuarioId: string) {
    return this.workspacesService.listarWorkspacesDoUsuario(usuarioId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retorna detalhes de um workspace específico' })
  async obterWorkspace(
    @Param('id') workspaceId: string,
    @CurrentUser('sub') usuarioId: string,
  ) {
    return this.workspacesService.obterPorId(workspaceId, usuarioId);
  }
}
