import { DomainException } from '../../../financeiro/domain/exceptions/domain.exception';
import { ProjetoAggregate } from './projeto.aggregate';
import { EtapaProjetoEntity } from './etapa-projeto.entity';
import { ItemProjetoEntity } from './item-projeto.entity';

describe('ProjetoAggregate e Entidades de Domínio', () => {
  const workspaceId = 'ws-test-123';
  const projetoId = 'proj-test-123';
  const etapaId = 'etapa-test-123';

  describe('Invariante XOR em ItemProjetoEntity', () => {
    it('deve criar ItemProjeto com vinculo EXCLUSIVO a ItemWishlist', () => {
      const item = ItemProjetoEntity.criar({
        workspaceId,
        etapaId,
        itemWishlistId: 'wishlist-123',
        metaId: null,
      });

      expect(item.itemWishlistId).toBe('wishlist-123');
      expect(item.metaId).toBeNull();
      expect(item.wishlistVinculoAtivoKey).toBe('wishlist-123');
      expect(item.metaVinculoAtivoKey).toBeNull();
    });

    it('deve criar ItemProjeto com vinculo EXCLUSIVO a Meta', () => {
      const item = ItemProjetoEntity.criar({
        workspaceId,
        etapaId,
        itemWishlistId: null,
        metaId: 'meta-123',
      });

      expect(item.metaId).toBe('meta-123');
      expect(item.itemWishlistId).toBeNull();
      expect(item.metaVinculoAtivoKey).toBe('meta-123');
      expect(item.wishlistVinculoAtivoKey).toBeNull();
    });

    it('deve lancar DomainException quando ambos (wishlist E meta) forem fornecidos', () => {
      expect(() => {
        ItemProjetoEntity.criar({
          workspaceId,
          etapaId,
          itemWishlistId: 'wishlist-123',
          metaId: 'meta-123',
        });
      }).toThrow(DomainException);

      expect(() => {
        ItemProjetoEntity.criar({
          workspaceId,
          etapaId,
          itemWishlistId: 'wishlist-123',
          metaId: 'meta-123',
        });
      }).toThrow('O item do projeto deve estar vinculado EXCLUSIVAMENTE a um item de wishlist OU a uma meta.');
    });

    it('deve lancar DomainException quando nenhum (nem wishlist nem meta) for fornecido', () => {
      expect(() => {
        ItemProjetoEntity.criar({
          workspaceId,
          etapaId,
          itemWishlistId: null,
          metaId: null,
        });
      }).toThrow(DomainException);
    });

    it('deve zerar chaves de vinculo ativo quando o item for desativado (soft delete)', () => {
      const item = ItemProjetoEntity.criar({
        workspaceId,
        etapaId,
        itemWishlistId: 'wishlist-999',
      });

      expect(item.wishlistVinculoAtivoKey).toBe('wishlist-999');

      item.desativar();

      expect(item.ativo).toBe(false);
      expect(item.wishlistVinculoAtivoKey).toBeNull();
      expect(item.metaVinculoAtivoKey).toBeNull();
    });
  });

  describe('Invariante Temporal de Datas em ProjetoAggregate', () => {
    it('deve permitir datas validas onde dataFimPrevista >= dataInicioPrevista', () => {
      const inicio = new Date('2026-01-01');
      const fim = new Date('2026-12-31');

      const projeto = ProjetoAggregate.criar({
        workspaceId,
        nome: 'Projeto Reforma da Casa',
        dataInicioPrevista: inicio,
        dataFimPrevista: fim,
      });

      expect(projeto.dataInicioPrevista).toEqual(inicio);
      expect(projeto.dataFimPrevista).toEqual(fim);
    });

    it('deve lancar DomainException quando dataFimPrevista for anterior a dataInicioPrevista', () => {
      const inicio = new Date('2026-12-31');
      const fim = new Date('2026-01-01');

      expect(() => {
        ProjetoAggregate.criar({
          workspaceId,
          nome: 'Projeto Invalido',
          dataInicioPrevista: inicio,
          dataFimPrevista: fim,
        });
      }).toThrow('A data de fim prevista não pode ser anterior à data de início prevista.');
    });

    it('deve lancar DomainException ao atualizar para datas invalidas', () => {
      const projeto = ProjetoAggregate.criar({
        workspaceId,
        nome: 'Projeto Teste',
        dataInicioPrevista: new Date('2026-05-01'),
        dataFimPrevista: new Date('2026-06-01'),
      });

      expect(() => {
        projeto.atualizarDados({
          dataFimPrevista: new Date('2026-04-01'),
        });
      }).toThrow('A data de fim prevista não pode ser anterior à data de início prevista.');
    });
  });

  describe('Maquina de Estados do Projeto', () => {
    it('deve iniciar o projeto no estado PLANEJAMENTO', () => {
      const projeto = ProjetoAggregate.criar({
        workspaceId,
        nome: 'Construcao da Garagem',
      });

      expect(projeto.status).toBe('PLANEJAMENTO');
    });

    it('deve permitir transicao PLANEJAMENTO -> EM_ANDAMENTO -> CONCLUIDO', () => {
      const projeto = ProjetoAggregate.criar({
        workspaceId,
        nome: 'Viagem de Ferias',
      });

      projeto.iniciar();
      expect(projeto.status).toBe('EM_ANDAMENTO');

      const dataConclusao = new Date();
      projeto.concluir(dataConclusao);
      expect(projeto.status).toBe('CONCLUIDO');
      expect(projeto.dataConclusao).toEqual(dataConclusao);
    });

    it('deve permitir transicao EM_ANDAMENTO -> PAUSADO -> EM_ANDAMENTO', () => {
      const projeto = ProjetoAggregate.criar({
        workspaceId,
        nome: 'Estudo Pos-Graduacao',
      });

      projeto.iniciar();
      expect(projeto.status).toBe('EM_ANDAMENTO');

      projeto.pausar();
      expect(projeto.status).toBe('PAUSADO');

      projeto.iniciar();
      expect(projeto.status).toBe('EM_ANDAMENTO');
    });

    it('deve lancar DomainException em transicao invalida de PLANEJAMENTO para CONCLUIDO direto', () => {
      const projeto = ProjetoAggregate.criar({
        workspaceId,
        nome: 'Projeto Direto',
      });

      expect(() => {
        projeto.concluir();
      }).toThrow(DomainException);
    });

    it('deve lancar DomainException ao tentar alterar status de projeto CONCLUIDO', () => {
      const projeto = ProjetoAggregate.criar({
        workspaceId,
        nome: 'Projeto Final',
      });

      projeto.iniciar();
      projeto.concluir();

      expect(() => {
        projeto.iniciar();
      }).toThrow(DomainException);
    });
  });

  describe('Integridade Hierarquica de Etapas e Trava Otimista', () => {
    it('deve adicionar etapa respeitando a integridade hierarquica do workspace e projeto', () => {
      const projeto = ProjetoAggregate.criar({
        id: projetoId,
        workspaceId,
        nome: 'Projeto Modular',
      });

      const etapa = EtapaProjetoEntity.criar({
        id: etapaId,
        workspaceId,
        projetoId,
        nome: 'Etapa 1 - Fundacao',
      });

      projeto.adicionarEtapa(etapa);
      expect(projeto.etapas.length).toBe(1);
      expect(projeto.etapas[0].nome).toBe('Etapa 1 - Fundacao');
    });

    it('deve lancar DomainException ao adicionar etapa de outro projeto ou workspace', () => {
      const projeto = ProjetoAggregate.criar({
        id: projetoId,
        workspaceId,
        nome: 'Projeto 1',
      });

      const etapaInvalida = EtapaProjetoEntity.criar({
        id: etapaId,
        workspaceId,
        projetoId: 'outro-projeto',
        nome: 'Etapa Invalida',
      });

      expect(() => {
        projeto.adicionarEtapa(etapaInvalida);
      }).toThrow('Integridade Hierárquica violada: Etapa não pertence a este Projeto/Workspace.');
    });

    it('deve incrementar versao para trava otimista', () => {
      const projeto = ProjetoAggregate.criar({
        workspaceId,
        nome: 'Projeto Versao',
      });

      expect(projeto.versao).toBe(0);
      projeto.incrementarVersao();
      expect(projeto.versao).toBe(1);
    });
  });
});
