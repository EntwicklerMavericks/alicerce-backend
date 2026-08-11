import { PrismaClient, TipoWorkspace, PapelWorkspace, TipoCarteira, BandeiraCartao, TipoTransacao, StatusDespesa, StatusReceita, TipoCategoria, StatusMeta, PrioridadeWishlist, StatusWishlist, StatusProjeto, StatusEtapa, StatusItemProjeto, TipoAlerta, TipoSalario } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando geração de dados de simulação (Seed Alicerce)...');

  // 1. Garantir Usuário Principal "Eduardo"
  const senhaHash = await bcrypt.hash('123456', 10);
  
  let usuario = await prisma.usuario.findFirst({
    where: { email: 'eduardo@alicerce.com' },
  });

  if (!usuario) {
    usuario = await prisma.usuario.create({
      data: {
        email: 'eduardo@alicerce.com',
        nome: 'Eduardo Silva',
        senhaHash,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
      },
    });
    console.log(`✅ Usuário padrão criado: ${usuario.nome} (${usuario.email})`);
  }

  // 2. Garantir Workspace Principal
  let workspace = await prisma.workspace.findFirst({
    where: { proprietarioId: usuario.id },
  });

  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: {
        nome: 'Construção da Casa',
        tipo: TipoWorkspace.FAMILIAR,
        proprietarioId: usuario.id,
      },
    });

    await prisma.membroWorkspace.create({
      data: {
        workspaceId: workspace.id,
        usuarioId: usuario.id,
        papel: PapelWorkspace.PROPRIETARIO,
      },
    });
    console.log(`✅ Workspace principal criado: ${workspace.nome}`);
  }

  // Buscar todos os workspaces existentes para popular de forma completa
  const workspaces = await prisma.workspace.findMany();

  for (const ws of workspaces) {
    console.log(`\n📦 Populando dados no Workspace: "${ws.nome}" (ID: ${ws.id})...`);

    // ----------------------------------------------------
    // A. PESSOAS & SALÁRIOS (FAMÍLIA)
    // ----------------------------------------------------
    const pessoaEduardo = await prisma.pessoa.upsert({
      where: { id: `pessoa-eduardo-${ws.id}` },
      update: { nome: 'Eduardo', parentesco: 'Titular' },
      create: {
        id: `pessoa-eduardo-${ws.id}`,
        workspaceId: ws.id,
        nome: 'Eduardo',
        parentesco: 'Titular',
      },
    });

    const pessoaHelena = await prisma.pessoa.upsert({
      where: { id: `pessoa-helena-${ws.id}` },
      update: { nome: 'Helena', parentesco: 'Cônjuge' },
      create: {
        id: `pessoa-helena-${ws.id}`,
        workspaceId: ws.id,
        nome: 'Helena',
        parentesco: 'Cônjuge',
      },
    });

    // Config Salários
    await prisma.configSalario.upsert({
      where: { pessoaId: pessoaEduardo.id },
      update: { valorBase: 10600.00, tipo: TipoSalario.FIXO },
      create: {
        pessoaId: pessoaEduardo.id,
        tipo: TipoSalario.FIXO,
        valorBase: 10600.00,
      },
    });

    await prisma.configSalario.upsert({
      where: { pessoaId: pessoaHelena.id },
      update: { valorBase: 8400.00, tipo: TipoSalario.FIXO },
      create: {
        pessoaId: pessoaHelena.id,
        tipo: TipoSalario.FIXO,
        valorBase: 8400.00,
      },
    });

    // Salários Mensais
    await prisma.salarioMensal.upsert({
      where: { pessoaId_mes_ano: { pessoaId: pessoaEduardo.id, mes: 8, ano: 2026 } },
      update: { valorPrevisto: 10600.00, valorReal: 10600.00, status: StatusReceita.RECEBIDA },
      create: {
        pessoaId: pessoaEduardo.id,
        mes: 8,
        ano: 2026,
        qtdDiasUteis: 22,
        valorPrevisto: 10600.00,
        valorReal: 10600.00,
        status: StatusReceita.RECEBIDA,
      },
    });

    // ----------------------------------------------------
    // B. CARTEIRAS & CONTAS BANCÁRIAS
    // ----------------------------------------------------
    const cartItau = await prisma.carteira.upsert({
      where: { id: `carteira-itau-${ws.id}` },
      update: { saldo: 14500.00 },
      create: {
        id: `carteira-itau-${ws.id}`,
        workspaceId: ws.id,
        nome: 'Itaú Personnalité',
        tipo: TipoCarteira.CONTA_CORRENTE,
        saldo: 14500.00,
        icone: 'account_balance',
        cor: '#EC6608',
        padrao: true,
      },
    });

    const cartXP = await prisma.carteira.upsert({
      where: { id: `carteira-xp-${ws.id}` },
      update: { saldo: 45000.00 },
      create: {
        id: `carteira-xp-${ws.id}`,
        workspaceId: ws.id,
        nome: 'XP Investimentos',
        tipo: TipoCarteira.INVESTIMENTO,
        saldo: 45000.00,
        icone: 'trending_up',
        cor: '#C9A74E',
      },
    });

    const cartReserva = await prisma.carteira.upsert({
      where: { id: `carteira-reserva-${ws.id}` },
      update: { saldo: 25000.00 },
      create: {
        id: `carteira-reserva-${ws.id}`,
        workspaceId: ws.id,
        nome: 'Reserva de Emergência',
        tipo: TipoCarteira.POUPANCA,
        saldo: 25000.00,
        icone: 'shield',
        cor: '#34D399',
      },
    });

    // Cartões de Crédito
    const cartaoGold = await prisma.cartaoCredito.upsert({
      where: { id: `cartao-gold-${ws.id}` },
      update: { limiteTotal: 15000.00 },
      create: {
        id: `cartao-gold-${ws.id}`,
        workspaceId: ws.id,
        nome: 'Cartão Gold Visa',
        bandeira: BandeiraCartao.VISA,
        ultimosDigitos: '4821',
        limiteTotal: 15000.00,
        diaFechamento: 1,
        diaVencimento: 8,
        cor: '#C9A74E',
        icone: 'credit_card',
      },
    });

    // ----------------------------------------------------
    // C. CATEGORIAS FINANCEIRAS
    // ----------------------------------------------------
    const catHabitacao = await prisma.categoria.upsert({
      where: { id: `cat-habitacao-${ws.id}` },
      update: {},
      create: {
        id: `cat-habitacao-${ws.id}`,
        workspaceId: ws.id,
        nome: 'Habitação',
        tipo: TipoCategoria.DESPESA,
        icone: 'home',
        cor: '#A13D63',
      },
    });

    const catAlimentacao = await prisma.categoria.upsert({
      where: { id: `cat-alimentacao-${ws.id}` },
      update: {},
      create: {
        id: `cat-alimentacao-${ws.id}`,
        workspaceId: ws.id,
        nome: 'Alimentação',
        tipo: TipoCategoria.DESPESA,
        icone: 'restaurant',
        cor: '#F59E0B',
      },
    });

    const catImpostos = await prisma.categoria.upsert({
      where: { id: `cat-impostos-${ws.id}` },
      update: {},
      create: {
        id: `cat-impostos-${ws.id}`,
        workspaceId: ws.id,
        nome: 'Impostos & Taxas',
        tipo: TipoCategoria.DESPESA,
        icone: 'account_balance',
        cor: '#EF4444',
      },
    });

    const catSaude = await prisma.categoria.upsert({
      where: { id: `cat-saude-${ws.id}` },
      update: {},
      create: {
        id: `cat-saude-${ws.id}`,
        workspaceId: ws.id,
        nome: 'Saúde & Convênio',
        tipo: TipoCategoria.DESPESA,
        icone: 'health_and_safety',
        cor: '#10B981',
      },
    });

    const catRendimentos = await prisma.categoria.upsert({
      where: { id: `cat-rendimentos-${ws.id}` },
      update: {},
      create: {
        id: `cat-rendimentos-${ws.id}`,
        workspaceId: ws.id,
        nome: 'Salários & Rendimentos',
        tipo: TipoCategoria.RECEITA,
        icone: 'payments',
        cor: '#34D399',
      },
    });

    // ----------------------------------------------------
    // D. DESPESAS & LANÇAMENTOS (AGENDA DE VENCIMENTOS)
    // ----------------------------------------------------
    // 1. IPVA (Atrasado - 06/08)
    await prisma.despesa.upsert({
      where: { id: `despesa-ipva-${ws.id}` },
      update: { status: StatusDespesa.ATRASADA },
      create: {
        id: `despesa-ipva-${ws.id}`,
        workspaceId: ws.id,
        carteiraId: cartItau.id,
        categoriaId: catImpostos.id,
        descricao: 'IPVA Veículo - Cota 2/3',
        valor: 950.00,
        dataVencimento: new Date('2026-08-06T00:00:00Z'),
        status: StatusDespesa.ATRASADA,
        observacoes: 'Detran SP - Aguardando pagamento',
      },
    });

    // 2. Fatura Cartão Gold (Hoje - 08/08)
    await prisma.despesa.upsert({
      where: { id: `despesa-fatura-gold-${ws.id}` },
      update: { status: StatusDespesa.PENDENTE },
      create: {
        id: `despesa-fatura-gold-${ws.id}`,
        workspaceId: ws.id,
        carteiraId: cartItau.id,
        categoriaId: catAlimentacao.id,
        descricao: 'Fatura Cartão Gold',
        valor: 3450.00,
        dataVencimento: new Date('2026-08-08T00:00:00Z'),
        status: StatusDespesa.PENDENTE,
        observacoes: 'Fatura fechada Itaú Personalité',
      },
    });

    // 3. Aluguel & Condomínio (Pendente - 11/08)
    await prisma.despesa.upsert({
      where: { id: `despesa-aluguel-${ws.id}` },
      update: { status: StatusDespesa.PENDENTE },
      create: {
        id: `despesa-aluguel-${ws.id}`,
        workspaceId: ws.id,
        carteiraId: cartItau.id,
        categoriaId: catHabitacao.id,
        descricao: 'Aluguel & Condomínio',
        valor: 3200.00,
        dataVencimento: new Date('2026-08-11T00:00:00Z'),
        status: StatusDespesa.PENDENTE,
        observacoes: 'Imobiliária Central',
      },
    });

    // 4. Plano de Saúde (Pago - 02/08)
    await prisma.despesa.upsert({
      where: { id: `despesa-saude-${ws.id}` },
      update: { status: StatusDespesa.PAGA },
      create: {
        id: `despesa-saude-${ws.id}`,
        workspaceId: ws.id,
        carteiraId: cartItau.id,
        categoriaId: catSaude.id,
        descricao: 'Plano de Saúde Familiar',
        valor: 1850.00,
        dataVencimento: new Date('2026-08-02T00:00:00Z'),
        dataPagamento: new Date('2026-08-02T00:00:00Z'),
        status: StatusDespesa.PAGA,
      },
    });

    // Receita de Salário
    await prisma.receita.upsert({
      where: { id: `receita-salario-${ws.id}` },
      update: { status: StatusReceita.RECEBIDA },
      create: {
        id: `receita-salario-${ws.id}`,
        workspaceId: ws.id,
        carteiraId: cartItau.id,
        categoriaId: catRendimentos.id,
        descricao: 'Salário Mensal Eduardo',
        valor: 10600.00,
        data: new Date('2026-08-01T00:00:00Z'),
        status: StatusReceita.RECEBIDA,
      },
    });

    // ----------------------------------------------------
    // E. ORÇAMENTOS POR CATEGORIA
    // ----------------------------------------------------
    await prisma.orcamento.upsert({
      where: { id: `orcamento-habitacao-${ws.id}` },
      update: { valorPlanejado: 3500.00, valorReal: 3200.00 },
      create: {
        id: `orcamento-habitacao-${ws.id}`,
        workspaceId: ws.id,
        categoriaId: catHabitacao.id,
        valorPlanejado: 3500.00,
        valorReal: 3200.00,
        mes: 8,
        ano: 2026,
      },
    });

    await prisma.orcamento.upsert({
      where: { id: `orcamento-alimentacao-${ws.id}` },
      update: { valorPlanejado: 2500.00, valorReal: 1840.00 },
      create: {
        id: `orcamento-alimentacao-${ws.id}`,
        workspaceId: ws.id,
        categoriaId: catAlimentacao.id,
        valorPlanejado: 2500.00,
        valorReal: 1840.00,
        mes: 8,
        ano: 2026,
      },
    });

    // ----------------------------------------------------
    // F. METAS & SONHOS
    // ----------------------------------------------------
    const metaCasa = await prisma.meta.upsert({
      where: { id: `meta-casa-${ws.id}` },
      update: { valorAlvo: 150000.00 },
      create: {
        id: `meta-casa-${ws.id}`,
        workspaceId: ws.id,
        nome: 'Fundo Construção Casa Própria',
        descricao: 'Reserva para compra do terreno e fundação',
        valorAlvo: 150000.00,
        prazo: new Date('2027-12-31T00:00:00Z'),
        status: StatusMeta.ATIVA,
        cor: '#C9A74E',
        icone: 'foundation',
      },
    });

    const metaEuropa = await prisma.meta.upsert({
      where: { id: `meta-europa-${ws.id}` },
      update: { valorAlvo: 25000.00 },
      create: {
        id: `meta-europa-${ws.id}`,
        workspaceId: ws.id,
        nome: 'Viagem para a Europa',
        descricao: 'Férias em família em Roma e Paris',
        valorAlvo: 25000.00,
        prazo: new Date('2026-11-30T00:00:00Z'),
        status: StatusMeta.ATIVA,
        cor: '#A13D63',
        icone: 'flight',
      },
    });

    // Aportes de Metas para saldo acumulado
    await prisma.aporteMeta.createMany({
      data: [
        {
          metaId: metaCasa.id,
          valor: 42500.00,
          data: new Date('2026-08-01T00:00:00Z'),
          descricao: 'Aporte Inicial Terreno',
        },
        {
          metaId: metaEuropa.id,
          valor: 14200.00,
          data: new Date('2026-08-01T00:00:00Z'),
          descricao: 'Aporte de Passagens',
        },
      ],
      skipDuplicates: true,
    });

    // ----------------------------------------------------
    // G. WISHLIST & DESEJOS CONSCIENTES
    // ----------------------------------------------------
    await prisma.itemWishlist.upsert({
      where: { id: `wishlist-macbook-${ws.id}` },
      update: { precoAlvo: 18500.00 },
      create: {
        id: `wishlist-macbook-${ws.id}`,
        workspaceId: ws.id,
        nome: 'MacBook Pro M3 Max',
        descricao: 'Estação de trabalho principal para desenvolvimento e design',
        precoAlvo: 18500.00,
        diasEsfriamento: 30,
        inicioEsfriamento: new Date('2026-08-01T00:00:00Z'),
        fimEsfriamento: new Date('2026-08-31T00:00:00Z'),
        status: StatusWishlist.ANALISE,
        prioridade: PrioridadeWishlist.ALTA,
      },
    });

    await prisma.itemWishlist.upsert({
      where: { id: `wishlist-cafeteira-${ws.id}` },
      update: { precoAlvo: 2400.00 },
      create: {
        id: `wishlist-cafeteira-${ws.id}`,
        workspaceId: ws.id,
        nome: 'Cafeteira Espresso Italiana Breville',
        descricao: 'Moagem de grãos integrados e pressão de 15 bar',
        precoAlvo: 2400.00,
        diasEsfriamento: 15,
        inicioEsfriamento: new Date('2026-07-10T00:00:00Z'),
        fimEsfriamento: new Date('2026-07-25T00:00:00Z'),
        status: StatusWishlist.PLANEJADO,
        prioridade: PrioridadeWishlist.MEDIA,
      },
    });

    await prisma.itemWishlist.upsert({
      where: { id: `wishlist-tv-${ws.id}` },
      update: { valorEconomizado: 7900.00 },
      create: {
        id: `wishlist-tv-${ws.id}`,
        workspaceId: ws.id,
        nome: 'TV OLED 65" LG C3',
        descricao: 'Desistência consciente após 30 dias de esfriamento',
        precoAlvo: 7900.00,
        valorEconomizado: 7900.00,
        diasEsfriamento: 30,
        inicioEsfriamento: new Date('2026-06-01T00:00:00Z'),
        fimEsfriamento: new Date('2026-07-01T00:00:00Z'),
        dataConclusao: new Date('2026-07-02T00:00:00Z'),
        status: StatusWishlist.DESISTIDO,
        prioridade: PrioridadeWishlist.BAIXA,
      },
    });

    // ----------------------------------------------------
    // H. PROJETOS DE LONGO PRAZO & ETAPAS
    // ----------------------------------------------------
    const projetoCozinha = await prisma.projeto.upsert({
      where: { id: `projeto-cozinha-${ws.id}` },
      update: { orcamentoEstimado: 45000.00 },
      create: {
        id: `projeto-cozinha-${ws.id}`,
        workspaceId: ws.id,
        nome: 'Reforma Cozinha Gourmet & Varanda',
        descricao: 'Renovação completa da marcenaria, bancadas de quartzo e integração com varanda',
        orcamentoEstimado: 45000.00,
        dataInicioPrevista: new Date('2026-07-01T00:00:00Z'),
        dataFimPrevista: new Date('2026-11-30T00:00:00Z'),
        status: StatusProjeto.EM_ANDAMENTO,
      },
    });

    // Etapas do Projeto
    await prisma.etapaProjeto.upsert({
      where: { id: `etapa-1-${ws.id}` },
      update: { status: StatusEtapa.CONCLUIDA },
      create: {
        id: `etapa-1-${ws.id}`,
        workspaceId: ws.id,
        projetoId: projetoCozinha.id,
        nome: 'Projeto Arquitetônico & Demolição',
        ordem: 1,
        status: StatusEtapa.CONCLUIDA,
      },
    });

    await prisma.etapaProjeto.upsert({
      where: { id: `etapa-2-${ws.id}` },
      update: { status: StatusEtapa.EM_ANDAMENTO },
      create: {
        id: `etapa-2-${ws.id}`,
        workspaceId: ws.id,
        projetoId: projetoCozinha.id,
        nome: 'Revestimentos & Porcelanato',
        ordem: 2,
        status: StatusEtapa.EM_ANDAMENTO,
      },
    });

    await prisma.etapaProjeto.upsert({
      where: { id: `etapa-3-${ws.id}` },
      update: { status: StatusEtapa.PENDENTE },
      create: {
        id: `etapa-3-${ws.id}`,
        workspaceId: ws.id,
        projetoId: projetoCozinha.id,
        nome: 'Marcenaria sob Medida & Eletros',
        ordem: 3,
        status: StatusEtapa.PENDENTE,
      },
    });

    // ----------------------------------------------------
    // I. CENTRAL DE ALERTAS & NOTIFICAÇÕES
    // ----------------------------------------------------
    await prisma.alerta.createMany({
      data: [
        {
          usuarioId: usuario.id,
          workspaceId: ws.id,
          tipo: TipoAlerta.CONTA_VENCENDO,
          titulo: '⚠️ IPVA Veículo Atrasado',
          mensagem: 'O pagamento da cota 2/3 do IPVA (R$ 950,00) venceu em 06/08.',
          lido: false,
          referenciaId: `despesa-ipva-${ws.id}`,
          tipoReferencia: 'DESPESA',
        },
        {
          usuarioId: usuario.id,
          workspaceId: ws.id,
          tipo: TipoAlerta.CONTA_VENCENDO,
          titulo: '🔔 Fatura Cartão Gold Vence Hoje',
          mensagem: 'A fatura no valor de R$ 3.450,00 vence no dia de hoje (08/08).',
          lido: false,
          referenciaId: `despesa-fatura-gold-${ws.id}`,
          tipoReferencia: 'DESPESA',
        },
        {
          usuarioId: usuario.id,
          workspaceId: ws.id,
          tipo: TipoAlerta.META_ATINGIDA,
          titulo: '✨ Progresso Notável na Meta Europa',
          mensagem: 'Sua meta "Viagem Europa" atingiu 56% do objetivo estipulado!',
          lido: true,
          referenciaId: `meta-europa-${ws.id}`,
          tipoReferencia: 'META',
        },
      ],
      skipDuplicates: true,
    });
  }

  console.log('\n✨ Todos os dados de simulação foram gerados com sucesso no banco de dados!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed do banco de dados:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
