import { Injectable, BadRequestException } from '@nestjs/common';
import * as dns from 'dns';

@Injectable()
export class SsrfGuardService {
  /**
   * Valida se a URL fornecida é pública e segura para consumo via Web Scraper.
   * Realiza resolução DNS prévia para prevenir DNS Rebinding attacks.
   */
  async validarEObterUrlSegura(urlEntrada: string): Promise<string> {
    if (!urlEntrada || typeof urlEntrada !== 'string') {
      throw new BadRequestException('URL para cotação não informada ou inválida.');
    }

    let urlObj: URL;
    try {
      const temProtocolo = /^[a-zA-Z][a-zA-Z0-9+\-.]*:\/\//.test(urlEntrada);
      urlObj = new URL(temProtocolo ? urlEntrada : `https://${urlEntrada}`);
    } catch (err) {
      throw new BadRequestException('Formato de URL inválido.');
    }

    // 1. Protocolo apenas http e https
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      throw new BadRequestException(`Protocolo não permitido: ${urlObj.protocol}. Somente http: e https: são aceitos.`);
    }

    const hostname = urlObj.hostname.toLowerCase();

    // 2. Validação estrita de nomes de host óbvios
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      hostname === '0.0.0.0'
    ) {
      throw new BadRequestException(`Acesso negado ao host interno: ${hostname}`);
    }

    // 3. Resolução DNS prévia (DNS Lookup) contra DNS Rebinding
    let addresses: dns.LookupAddress[];
    try {
      addresses = await dns.promises.lookup(hostname, { all: true });
    } catch (err: any) {
      throw new BadRequestException(`Não foi possível resolver o DNS do host: ${hostname}`);
    }

    if (!addresses || addresses.length === 0) {
      throw new BadRequestException(`Nenhum IP resolvido para o host: ${hostname}`);
    }

    // 4. Verificar todos os IPs retornados pelo DNS
    for (const addr of addresses) {
      if (this.isIpPrivadoOuReservado(addr.address)) {
        throw new BadRequestException(
          `Segurança SSRF: O host ${hostname} resolveu para um endereço IP privado/reservado (${addr.address}).`,
        );
      }
    }

    return urlObj.toString();
  }

  /**
   * Verifica se o endereço IP (v4 ou v6) é privado, loopback ou reservado.
   */
  isIpPrivadoOuReservado(ip: string): boolean {
    // Normalizar IPv4 mapeado em IPv6 (ex: ::ffff:127.0.0.1)
    let cleanIp = ip;
    if (cleanIp.startsWith('::ffff:')) {
      cleanIp = cleanIp.replace('::ffff:', '');
    }

    // IPv4 Checks
    if (cleanIp.includes('.')) {
      const parts = cleanIp.split('.').map(Number);
      if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
        return true; // Malformed IPv4 -> bloquear por segurança
      }

      const [a, b] = parts;

      // 127.0.0.0/8 (Loopback)
      if (a === 127) return true;
      // 10.0.0.0/8 (Private Class A)
      if (a === 10) return true;
      // 172.16.0.0/12 (Private Class B: 172.16.0.0 - 172.31.255.255)
      if (a === 172 && b >= 16 && b <= 31) return true;
      // 192.168.0.0/16 (Private Class C)
      if (a === 192 && b === 168) return true;
      // 169.254.0.0/16 (Link-Local / APIPA)
      if (a === 169 && b === 254) return true;
      // 100.64.0.0/10 (Carrier-Grade NAT: 100.64.0.0 - 100.127.255.255)
      if (a === 100 && b >= 64 && b <= 127) return true;
      // 0.0.0.0/8 (Current network)
      if (a === 0) return true;
      // 192.0.0.0/24 (IETF Protocol Assignments)
      if (a === 192 && b === 0) return true;
      // 192.0.2.0/24 (TEST-NET-1)
      if (a === 192 && b === 0 && parts[2] === 2) return true;
      // 198.18.0.0/15 (Benchmarking: 198.18.0.0 - 198.19.255.255)
      if (a === 198 && (b === 18 || b === 19)) return true;
      // 198.51.100.0/24 (TEST-NET-2)
      if (a === 198 && b === 51 && parts[2] === 100) return true;
      // 203.0.113.0/24 (TEST-NET-3)
      if (a === 203 && b === 0 && parts[2] === 113) return true;
      // 224.0.0.0/4 (Multicast / Reserved: 224.0.0.0 - 255.255.255.255)
      if (a >= 224) return true;

      return false;
    }

    // IPv6 Checks
    const lowerV6 = cleanIp.toLowerCase();
    if (
      lowerV6 === '::1' ||
      lowerV6 === '::' ||
      lowerV6.startsWith('fe80:') || // Link-Local
      lowerV6.startsWith('fc00:') || // Unique Local Unicast (ULA)
      lowerV6.startsWith('fd00:') || // Unique Local Unicast (ULA)
      lowerV6.startsWith('ff') // Multicast
    ) {
      return true;
    }

    return false;
  }
}
