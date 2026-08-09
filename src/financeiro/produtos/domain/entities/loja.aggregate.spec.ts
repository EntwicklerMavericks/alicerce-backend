import { LojaAggregate } from './loja.aggregate';
import { DomainException } from '../../../domain/exceptions/domain.exception';

describe('LojaAggregate', () => {
  it('deve criar uma loja de workspace com sucesso', () => {
    const loja = new LojaAggregate('loja-1', 'ws-123', 'Leroy Merlin', false);
    expect(loja.id).toBe('loja-1');
    expect(loja.workspaceId).toBe('ws-123');
    expect(loja.sistema).toBe(false);
    expect(loja.nome).toBe('Leroy Merlin');
  });

  it('deve criar uma loja global do sistema com sucesso (workspaceId null)', () => {
    const loja = new LojaAggregate('loja-sys', null, 'Amazon Global', true);
    expect(loja.id).toBe('loja-sys');
    expect(loja.workspaceId).toBeNull();
    expect(loja.sistema).toBe(true);
  });

  it('deve lançar DomainException se sistema === true e workspaceId !== null', () => {
    expect(() => new LojaAggregate('loja-sys', 'ws-123', 'Amazon Global', true)).toThrow(
      DomainException,
    );
  });

  it('deve lançar DomainException se sistema === false e workspaceId === null', () => {
    expect(() => new LojaAggregate('loja-local', null, 'Loja Local', false)).toThrow(
      DomainException,
    );
  });

  it('deve lançar DomainException se o nome for vazio', () => {
    expect(() => new LojaAggregate('loja-1', 'ws-123', '  ', false)).toThrow(DomainException);
  });

  it('deve validar se a loja pode ser editada por um determinado workspaceId', () => {
    const lojaWorkspace = new LojaAggregate('loja-1', 'ws-123', 'Loja Bairro', false);
    const lojaSistema = new LojaAggregate('loja-2', null, 'Mercado Livre', true);

    expect(lojaWorkspace.podeSerEditadaPor('ws-123')).toBe(true);
    expect(lojaWorkspace.podeSerEditadaPor('ws-999')).toBe(false);

    // Loja do sistema NUNCA pode ser editada por nenhum workspace
    expect(lojaSistema.podeSerEditadaPor('ws-123')).toBe(false);
    expect(lojaSistema.podeSerEditadaPor('ws-999')).toBe(false);
  });
});
