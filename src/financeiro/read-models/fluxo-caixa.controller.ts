import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { FluxoCaixaReadModelService } from './fluxo-caixa-read-model.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentWorkspace } from '../../common/decorators/current-workspace.decorator';

@Controller('financeiro/fluxo-caixa')
@UseGuards(JwtAuthGuard)
export class FluxoCaixaController {
  constructor(private readonly readModelService: FluxoCaixaReadModelService) {}

  @Get()
  obterResumo(
    @CurrentWorkspace() workspaceId: string,
    @Query('mes') mes?: string,
    @Query('ano') ano?: string,
  ) {
    return this.readModelService.obterResumoMensal(
      workspaceId,
      mes ? parseInt(mes, 10) : undefined,
      ano ? parseInt(ano, 10) : undefined,
    );
  }
}
