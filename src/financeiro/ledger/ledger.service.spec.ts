import { Test, TestingModule } from '@nestjs/testing';
import { LedgerService } from './ledger.service';
import { PrismaService } from '../../prisma/prisma.service';
import { LedgerEntry } from './entities/ledger-entry';
import { Money } from '../domain/value-objects/money.vo';
import { TipoMovimentacao, ReferenciaTipoMovimentacao } from '@prisma/client';

describe('LedgerService', () => {
  let service: LedgerService;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = {
      movimentacaoFinanceira: {
        create: jest.fn().mockResolvedValue({ id: 'mov-1' }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LedgerService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<LedgerService>(LedgerService);
  });

  it('deve registrar um LedgerEntry com sucesso', async () => {
    const entry = LedgerEntry.criar({
      workspaceId: 'ws-1',
      carteiraId: 'cart-1',
      tipo: TipoMovimentacao.RECEITA,
      valor: Money.deReais(250.00),
      referenciaTipo: ReferenciaTipoMovimentacao.RECEITA,
      referenciaId: 'rec-1',
    });

    await service.registrar(null, entry);

    expect(prismaMock.movimentacaoFinanceira.create).toHaveBeenCalled();
  });
});
