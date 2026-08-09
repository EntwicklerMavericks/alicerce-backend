import { PrismaService } from '../prisma/prisma.service';
import { CriarProjetoDto } from './dto/criar-projeto.dto';
import { AtualizarProjetoDto } from './dto/atualizar-projeto.dto';
import { CriarEtapaProjetoDto } from './dto/criar-etapa-projeto.dto';
import { ReordenarEtapasDto } from './dto/reordenar-etapas.dto';
import { VincularItemProjetoDto } from './dto/vincular-item-projeto.dto';
import { ProjetosReadModelService } from './read-models/projetos-read-model.service';
export declare class ProjetosService {
    private readonly prisma;
    private readonly readModelService;
    constructor(prisma: PrismaService, readModelService: ProjetosReadModelService);
    criar(workspaceId: string, dto: CriarProjetoDto): Promise<import("./read-models/projetos-read-model.service").ProjetoConsolidadoResult>;
    listar(workspaceId: string): Promise<import("./read-models/projetos-read-model.service").ProjetoConsolidadoResult[]>;
    obterPorId(workspaceId: string, id: string): Promise<import("./read-models/projetos-read-model.service").ProjetoConsolidadoResult>;
    atualizar(workspaceId: string, id: string, dto: AtualizarProjetoDto): Promise<import("./read-models/projetos-read-model.service").ProjetoConsolidadoResult>;
    criarEtapa(workspaceId: string, projetoId: string, dto: CriarEtapaProjetoDto): Promise<import("./read-models/projetos-read-model.service").ProjetoConsolidadoResult>;
    reordenarEtapas(workspaceId: string, projetoId: string, dto: ReordenarEtapasDto): Promise<import("./read-models/projetos-read-model.service").ProjetoConsolidadoResult>;
    vincularItemEtapa(workspaceId: string, projetoId: string, etapaId: string, dto: VincularItemProjetoDto): Promise<import("./read-models/projetos-read-model.service").ProjetoConsolidadoResult>;
    remover(workspaceId: string, id: string): Promise<{
        sucesso: boolean;
        mensagem: string;
    }>;
    private buscarProjetoAtivo;
    private mapToAggregate;
    simular(workspaceId: string, id: string, dto: any): Promise<{
        projetoId: string;
        parametros: any;
        baseline: {
            dataTerminoEstimada: string;
            duracaoMeses: number;
            custoTotal: number;
            readinessScore: number;
            coberturaFinanceira: number;
        };
        impacto: {
            diasAntecipacao: number;
            mesesAntecipacao: number;
            novaDataConclusao: string;
            novoReadinessScore: number;
            novaCoberturaFinanceira: number;
            diferencaOrcamento: number;
        };
        gargalo: {
            etapaId: any;
            nomeEtapa: any;
            causa: string;
            gravidade: string;
            sugestaoAcao: string;
        };
        etapasTimeline: {
            etapaId: any;
            nome: any;
            ordem: any;
            status: any;
            custo: any;
            readinessScore: any;
            dataInicioReal: string;
            dataFimReal: string;
            dataInicioSimulada: string;
            dataFimSimulada: string;
            diasDiferenca: number;
        }[];
    }>;
    aplicarSimulacao(workspaceId: string, id: string, dto: any): Promise<import("./read-models/projetos-read-model.service").ProjetoConsolidadoResult>;
}
