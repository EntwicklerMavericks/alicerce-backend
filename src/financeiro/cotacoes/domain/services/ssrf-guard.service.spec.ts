import { SsrfGuardService } from './ssrf-guard.service';
import { BadRequestException } from '@nestjs/common';

describe('SsrfGuardService', () => {
  let service: SsrfGuardService;

  beforeEach(() => {
    service = new SsrfGuardService();
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('isIpPrivadoOuReservado', () => {
    it('deve identificar IPs IPv4 privados e de loopback', () => {
      expect(service.isIpPrivadoOuReservado('127.0.0.1')).toBe(true);
      expect(service.isIpPrivadoOuReservado('10.0.0.5')).toBe(true);
      expect(service.isIpPrivadoOuReservado('172.16.0.1')).toBe(true);
      expect(service.isIpPrivadoOuReservado('172.31.255.255')).toBe(true);
      expect(service.isIpPrivadoOuReservado('192.168.1.100')).toBe(true);
      expect(service.isIpPrivadoOuReservado('169.254.169.254')).toBe(true);
      expect(service.isIpPrivadoOuReservado('100.64.1.1')).toBe(true);
      expect(service.isIpPrivadoOuReservado('224.0.0.1')).toBe(true);
    });

    it('deve identificar IPs IPv6 privados e de loopback', () => {
      expect(service.isIpPrivadoOuReservado('::1')).toBe(true);
      expect(service.isIpPrivadoOuReservado('fe80::1')).toBe(true);
      expect(service.isIpPrivadoOuReservado('fd00::1')).toBe(true);
    });

    it('deve aceitar IPs IPv4 públicos legítimos', () => {
      expect(service.isIpPrivadoOuReservado('8.8.8.8')).toBe(false);
      expect(service.isIpPrivadoOuReservado('1.1.1.1')).toBe(false);
      expect(service.isIpPrivadoOuReservado('104.26.10.12')).toBe(false);
    });
  });

  describe('validarEObterUrlSegura', () => {
    it('deve rejeitar protocolos que não sejam http/https', async () => {
      await expect(service.validarEObterUrlSegura('file:///etc/passwd')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.validarEObterUrlSegura('ftp://127.0.0.1/test')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve rejeitar hosts óbvios como localhost', async () => {
      await expect(service.validarEObterUrlSegura('http://localhost:3000')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.validarEObterUrlSegura('http://app.local')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
