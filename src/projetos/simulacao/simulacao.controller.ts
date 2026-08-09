import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentWorkspace } from '../../common/decorators/current-workspace.decorator';
import { SimulacaoService } from './simulacao.service';
import { SimularCenarioProjetoDto } from './dto/simular-cenario-projeto.dto';
import { AplicarCenarioProjetoDto } from './dto/aplicar-cenario-projeto.dto';

@ApiTags('Projetos - Simulação de Cenários Executivos')
@Controller('projetos')
@UseGuards(JwtAuthGuard)
export class SimulacaoController {
  constructor(private readonly simulacaoService: SimulacaoService) {}

  @Post(':id/simular')
  @ApiOperation({
    summary:
      'Simular cenario executivo What-If (cobertura financeira, readiness e cronograma) em um projeto',
  })
  @ApiResponse({
    status: 200,
    description: 'Projeção simulada gerada com sucesso sem alteração do estado base',
  })
  async simular(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: SimularCenarioProjetoDto,
  ) {
    return this.simulacaoService.simular(workspaceId, id, dto);
  }

  @Post(':id/simular/aplicar')
  @ApiOperation({
    summary:
      'Aplicar um cenário simulado no projeto com verificação de conflito de baseline e trava otimista (versao)',
  })
  @ApiResponse({
    status: 200,
    description: 'Cenário aplicado com sucesso no banco de dados',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflito de baseline detectado (versão do projeto alterada)',
  })
  async aplicar(
    @CurrentWorkspace() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: AplicarCenarioProjetoDto,
  ) {
    return this.simulacaoService.aplicar(workspaceId, id, dto);
  }
}
