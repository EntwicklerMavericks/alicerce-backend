import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { PessoasModule } from './pessoas/pessoas.module';
import { CarteirasModule } from './carteiras/carteiras.module';
import { LedgerModule } from './financeiro/ledger/ledger.module';
import { ReceitasModule } from './financeiro/receitas/receitas.module';
import { DespesasModule } from './financeiro/despesas/despesas.module';
import { ReadModelsModule } from './financeiro/read-models/read-models.module';
import { CartoesModule } from './financeiro/cartoes/cartoes.module';
import { ComprasCartaoModule } from './financeiro/compras-cartao/compras-cartao.module';
import { FaturasModule } from './financeiro/faturas/faturas.module';
import { RecorrenciasModule } from './financeiro/recorrencias/recorrencias.module';
import { OrcamentosModule } from './financeiro/orcamentos/orcamentos.module';
import { MetasModule } from './financeiro/metas/metas.module';
import { LojasModule } from './financeiro/produtos/lojas/lojas.module';
import { ProdutosModule } from './financeiro/produtos/catalogo/produtos.module';
import { WishlistModule } from './financeiro/wishlist/wishlist.module';
import { CotacoesModule } from './financeiro/cotacoes/cotacoes.module';
import { ProjetosModule } from './projetos/projetos.module';
import { PlanningModule } from './financeiro/planning/planning.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AlertasModule } from './alertas/alertas.module';
import { RelatoriosModule } from './relatorios/relatorios.module';import { CategoriasModule } from './financeiro/categorias/categorias.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    WorkspacesModule,
    PessoasModule,
    CarteirasModule,
    LedgerModule,
    CategoriasModule,
    ReceitasModule,
    DespesasModule,
    ReadModelsModule,
    CartoesModule,
    ComprasCartaoModule,
    FaturasModule,
    RecorrenciasModule,
    OrcamentosModule,
    MetasModule,
    LojasModule,
    ProdutosModule,
    WishlistModule,
    CotacoesModule,
    ProjetosModule,
    PlanningModule,
    DashboardModule,
    AlertasModule,
    RelatoriosModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
