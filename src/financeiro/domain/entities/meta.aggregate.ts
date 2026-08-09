import { Money } from '../value-objects/money.vo';
import { YearMonth } from '../value-objects/year-month.vo';
import { DomainException } from '../exceptions/domain.exception';

export type StatusMetaDomain = 'ATIVA' | 'CONCLUIDA' | 'PAUSADA' | 'CANCELADA';

export interface AporteMetaItem {
  id: string;
  metaId: string;
  valor: Money;
  data: Date;
  descricao?: string;
  dataCriacao?: Date;
}

export class MetaAggregate {
  private _status: StatusMetaDomain;
  private _aportes: AporteMetaItem[];
  private _nome: string;
  private _descricao?: string;
  private _valorAlvo: Money;
  private _prazo?: YearMonth;
  private _icone?: string;
  private _cor?: string;
  private _prioridade: number;

  constructor(
    readonly id: string,
    readonly workspaceId: string,
    nome: string,
    valorAlvo: Money,
    prazo?: YearMonth,
    icone?: string,
    cor?: string,
    status: StatusMetaDomain = 'ATIVA',
    descricao?: string,
    prioridade = 1,
    aportes: AporteMetaItem[] = [],
  ) {
    if (!id || !workspaceId || !nome) {
      throw new DomainException('Propriedades obrigatórias faltando para a Meta.');
    }
    if (!valorAlvo || !valorAlvo.isPositive()) {
      throw new DomainException('O valor alvo da meta deve ser maior que zero.');
    }
    this._nome = nome;
    this._valorAlvo = valorAlvo;
    this._prazo = prazo;
    this._icone = icone;
    this._cor = cor;
    this._status = status;
    this._descricao = descricao;
    this._prioridade = prioridade;
    this._aportes = [...aportes];

    this.verificarEAtualizarStatus();
  }

  get nome(): string {
    return this._nome;
  }

  get descricao(): string | undefined {
    return this._descricao;
  }

  get valorAlvo(): Money {
    return this._valorAlvo;
  }

  get prazo(): YearMonth | undefined {
    return this._prazo;
  }

  get icone(): string | undefined {
    return this._icone;
  }

  get cor(): string | undefined {
    return this._cor;
  }

  get status(): StatusMetaDomain {
    return this._status;
  }

  get prioridade(): number {
    return this._prioridade;
  }

  get aportes(): ReadonlyArray<AporteMetaItem> {
    return this._aportes;
  }

  /**
   * REGRA CRÍTICA DDD:
   * valorAcumulado é 100% DERIVADO da soma dos aportes. NUNCA ARMAZENADO.
   */
  get valorAcumulado(): Money {
    return this._aportes.reduce((acc, aporte) => acc.somar(aporte.valor), Money.zero());
  }

  adicionarAporte(id: string, valor: Money, data: Date = new Date(), descricao?: string): AporteMetaItem {
    if (this._status === 'CANCELADA') {
      throw new DomainException('Não é possível adicionar aportes a uma meta cancelada.');
    }
    if (!valor || !valor.isPositive()) {
      throw new DomainException('O valor do aporte deve ser maior que zero.');
    }

    const aporte: AporteMetaItem = {
      id,
      metaId: this.id,
      valor,
      data,
      descricao,
      dataCriacao: new Date(),
    };

    this._aportes.push(aporte);
    this.verificarEAtualizarStatus();

    return aporte;
  }

  removerAporte(aporteId: string): void {
    const idx = this._aportes.findIndex((a) => a.id === aporteId);
    if (idx === -1) {
      throw new DomainException(`Aporte ${aporteId} não encontrado nesta meta.`);
    }

    this._aportes.splice(idx, 1);
    this.verificarEAtualizarStatus();
  }

  atualizarDados(
    nome?: string,
    valorAlvo?: Money,
    prazo?: YearMonth,
    icone?: string,
    cor?: string,
    descricao?: string,
    prioridade?: number,
  ): void {
    if (nome) this._nome = nome;
    if (valorAlvo) {
      if (!valorAlvo.isPositive()) {
        throw new DomainException('O valor alvo da meta deve ser maior que zero.');
      }
      this._valorAlvo = valorAlvo;
    }
    if (prazo !== undefined) this._prazo = prazo;
    if (icone !== undefined) this._icone = icone;
    if (cor !== undefined) this._cor = cor;
    if (descricao !== undefined) this._descricao = descricao;
    if (prioridade !== undefined) this._prioridade = prioridade;

    this.verificarEAtualizarStatus();
  }

  cancelar(): void {
    this._status = 'CANCELADA';
  }

  private verificarEAtualizarStatus(): void {
    if (this._status === 'CANCELADA' || this._status === 'PAUSADA') {
      return;
    }

    const acumulado = this.valorAcumulado;
    if (acumulado.maiorQue(this._valorAlvo) || acumulado.equals(this._valorAlvo)) {
      this._status = 'CONCLUIDA';
    } else if (this._status === 'CONCLUIDA') {
      this._status = 'ATIVA';
    }
  }
}
