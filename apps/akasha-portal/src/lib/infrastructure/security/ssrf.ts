/**
 * SSRF Protection — Wave 12.5 §12.5
 *
 * Server-Side Request Forgery (SSRF) acontece quando um atacante
 * consegue fazer o servidor fazer fetch para um destino arbitrário
 * (incluindo redes internas: 169.254.169.254 cloud metadata,
 * 127.0.0.1, 10.0.0.0/8, 192.168.0.0/16, etc.).
 *
 * Cenários comuns no Akasha:
 *   - Web Share Target API (PWA) recebe URL do usuário. Hoje NÃO
 *     fetcheamos — só exibimos como fonte. Mas se evoluirmos para
 *     "preview" do link, vira vetor SSRF.
 *   - Avatar/photo upload via URL (futuro). Hoje só aceitamos
 *     Supabase storage (configurado em next.config.ts).
 *   - Webhooks Stripe (configurado, validado por assinatura).
 *
 * Esta utilidade é defesa-em-profundidade: valida URLs de entrada
 * ANTES de qualquer fetch, bloqueando:
 *   1. Schemes perigosos (javascript:, data:, file:, ftp:)
 *   2. Hosts privados / loopback / link-local / cloud metadata
 *   3. IPv4-mapped IPv6 bypass
 *   4. DNS rebinding (validação HOSTNAME, não IP — caller deve
 *      resolver e re-checar antes de fetch real)
 *
 * LGPD: bloqueio de SSRF é pré-condição para evitar vazamento de
 * dados via metadata services (ex: AWS IMDS retorna credenciais).
 *
 * USO:
 *   import { assertSafeExternalUrl } from '@/lib/infrastructure/security/ssrf';
 *
 *   // Antes de fetch:
 *   assertSafeExternalUrl(userSuppliedUrl); // throws se inseguro
 *   const res = await fetch(userSuppliedUrl);
 *
 * NOTA: esta validação é ESTÁTICA (não resolve DNS). Para defesa
 * completa, resolver hostname → IP → revalidar ANTES de fetch
 * (anti-DNS-rebinding). Hooks para isso estão em
 * `validateAndResolveExternalUrl` (comentado abaixo).
 */

import { lookup } from 'dns/promises';
import { URL } from 'url';

/**
 * Schemes permitidos para URLs externas. `https:` é o default; `http:`
 * é incluído para casos legados (com warning em prod).
 *
 * Bloqueados explicitamente:
 *   - `javascript:`, `data:`, `vbscript:` — XSS vectors
 *   - `file:` — local file disclosure (file:///etc/passwd)
 *   - `ftp:`, `gopher:`, `ldap:` — protocolos legados/abuso
 *   - `chrome:`, `about:`, `blob:` — browser-internal
 */
const ALLOWED_SCHEMES = new Set(['https:', 'http:']);

/**
 * Ranges de IP privados/bloqueados. Estes são destinos clássicos de SSRF:
 *   - 127.0.0.0/8 → loopback (localhost)
 *   - 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 → redes privadas RFC1918
 *   - 169.254.0.0/16 → link-local (AWS/GCP/Azure metadata: 169.254.169.254)
 *   - 100.64.0.0/10 → CGNAT
 *   - 0.0.0.0/8 → "this network"
 *   - 224.0.0.0/4 → multicast
 *   - 240.0.0.0/4 → reserved
 *   - ::1/128 → IPv6 loopback
 *   - fe80::/10 → IPv6 link-local
 *   - fc00::/7 → IPv6 unique local (ULA)
 *   - IPv4-mapped IPv6 (::ffff:0:0/96) → bypass comum
 */
const PRIVATE_IPV4_RANGES: Array<{ start: number; end: number; label: string }> = [
  { start: ipToInt('127.0.0.0'), end: ipToInt('127.255.255.255'), label: 'loopback' },
  { start: ipToInt('10.0.0.0'), end: ipToInt('10.255.255.255'), label: 'private-10' },
  { start: ipToInt('172.16.0.0'), end: ipToInt('172.31.255.255'), label: 'private-172' },
  { start: ipToInt('192.168.0.0'), end: ipToInt('192.168.255.255'), label: 'private-192' },
  { start: ipToInt('169.254.0.0'), end: ipToInt('169.254.255.255'), label: 'link-local-metadata' },
  { start: ipToInt('100.64.0.0'), end: ipToInt('100.127.255.255'), label: 'cgnat' },
  { start: ipToInt('0.0.0.0'), end: ipToInt('0.255.255.255'), label: 'unspecified' },
  { start: ipToInt('224.0.0.0'), end: ipToInt('239.255.255.255'), label: 'multicast' },
  { start: ipToInt('240.0.0.0'), end: ipToInt('255.255.255.255'), label: 'reserved' },
];

function ipToInt(ip: string): number {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return -1;
  }
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function isPrivateIPv4(ip: string): boolean {
  const int = ipToInt(ip);
  if (int === -1) return false;
  return PRIVATE_IPV4_RANGES.some((range) => int >= range.start && int <= range.end);
}

/**
 * Detecta IPv4-mapped IPv6 (::ffff:1.2.3.4) e retorna o IPv4 embutido.
 * Retorna null se não for mapeado.
 */
function extractMappedIPv4(ip: string): string | null {
  const match = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  return match ? match[1] : null;
}

function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === '::1') return true;
  if (lower.startsWith('fe8') || lower.startsWith('fe9') || lower.startsWith('fea') || lower.startsWith('feb')) {
    return true; // fe80::/10 link-local
  }
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true; // fc00::/7 ULA
  if (lower === '::') return true; // unspecified
  // IPv4-mapped IPv6: ::ffff:X:Y (hex) OR ::ffff:dotted-quad.
  // Node URL parser canônico: "::ffff:127.0.0.1" → "::ffff:7f00:1"
  // (hex IPv4 groups). Detectamos o prefixo e extraímos os 2 últimos
  // grupos hex (little-endian IPv4), convertendo para dotted IPv4.
  if (lower.startsWith('::ffff:')) {
    const rest = lower.slice(7); // após '::ffff:'
    const groups = rest.split(':');
    if (groups.length === 2) {
      const hi = parseInt(groups[0], 16);
      const lo = parseInt(groups[1], 16);
      if (!isNaN(hi) && !isNaN(lo)) {
        const a = (hi >> 8) & 0xff;
        const b = hi & 0xff;
        const c = (lo >> 8) & 0xff;
        const d = lo & 0xff;
        const dotted = `${a}.${b}.${c}.${d}`;
        return isPrivateIPv4(dotted);
      }
    }
    // Fallback: formato dotted (raro, mas possível se passar manualmente)
    const mapped = extractMappedIPv4(ip);
    if (mapped) return isPrivateIPv4(mapped);
  }
  return false;
}

/**
 * Verifica se um IP (string) é privado/loopback/link-local.
 *
 * Detecta formato:
 *   - IPv4 puro: "127.0.0.1" (só dígitos e pontos, exatamente 3 dots)
 *   - IPv6 puro: "::1", "fe80::1", "fc00::1" (contém ":" e não tem dots,
 *     OU tem dots mas não está em formato IPv4 válido)
 *   - IPv4-mapped IPv6: "::ffff:127.0.0.1" (formato especial)
 */
export function isPrivateIp(ip: string): boolean {
  // IPv4 puro: 4 grupos de 1-3 dígitos separados por ponto, sem dois-pontos.
  // O teste `!ip.includes(':')` distingue de IPv4-mapped (que tem `:`).
  const isPureIPv4 = !ip.includes(':') && /^\d+\.\d+\.\d+\.\d+$/.test(ip);
  if (isPureIPv4) return isPrivateIPv4(ip);
  // IPv6 ou IPv4-mapped IPv6
  return isPrivateIPv6(ip);
}

export class SsrfBlockedError extends Error {
  constructor(
    public readonly reason: string,
    public readonly url: string
  ) {
    super(`SSRF blocked: ${reason} (url=${redactUrl(url)})`);
    this.name = 'SsrfBlockedError';
  }
}

/**
 * Redacta URL para logs LGPD-safe: mantém host (debug) mas remove
 * query string (que pode conter tokens / PII).
 */
function redactUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.host}${u.pathname}`;
  } catch {
    return '<invalid-url>';
  }
}

/**
 * Validação estática de URL externa (sem DNS lookup).
 *
 * Bloqueia:
 *   - URL inválida
 *   - Scheme não permitido (javascript:, data:, file:, etc)
 *   - IP literal em range privado/loopback/link-local
 *   - Hostname que parece IP privada (heurística limitada)
 *
 * NÃO bloqueia (limitação conhecida — caller deve usar
 * `validateAndResolveExternalUrl` para defesa completa):
 *   - Hostname que resolve DNS para IP privado (DNS rebinding)
 *
 * @throws SsrfBlockedError se URL for insegura
 */
export function assertSafeExternalUrl(rawUrl: string): void {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new SsrfBlockedError('invalid-url', rawUrl);
  }

  // 1. Scheme
  if (!ALLOWED_SCHEMES.has(url.protocol)) {
    throw new SsrfBlockedError(`scheme-not-allowed:${url.protocol}`, rawUrl);
  }

  // 2. Hostname vazio
  if (!url.hostname) {
    throw new SsrfBlockedError('empty-hostname', rawUrl);
  }

  // 3. Se hostname é IP literal, checa range privado
  // (IPv4 dotted, IPv6 brackets, ou pure-numeric = IPv4)
  const hostname = url.hostname;

  // Detecta IPv4 literal (ex: "192.168.1.1", "127.0.0.1")
  if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    if (isPrivateIPv4(hostname)) {
      throw new SsrfBlockedError(`private-ip:${hostname}`, rawUrl);
    }
  } else if (hostname.startsWith('[') && hostname.endsWith(']')) {
    // IPv6 com brackets [::1]
    const ipv6 = hostname.slice(1, -1);
    if (isPrivateIPv6(ipv6)) {
      throw new SsrfBlockedError(`private-ipv6:${ipv6}`, rawUrl);
    }
  } else if (hostname === 'localhost') {
    throw new SsrfBlockedError('localhost-hostname', rawUrl);
  }

  // 4. Userinfo (user:pass@host) — blocklist explícita
  // URL parsing handles this, mas double-check para defense-in-depth
  if (url.username || url.password) {
    throw new SsrfBlockedError('userinfo-in-url', rawUrl);
  }
}

/**
 * Validação completa com DNS resolution (anti-DNS-rebinding).
 *
 * Workflow:
 *   1. assertSafeExternalUrl (validação estática)
 *   2. lookup(hostname) → IPs
 *   3. Bloqueia se QUALQUER IP retornado for privado
 *
 * IMPORTANTE: usar este helper ANTES de fetch. Para defense completa,
 * também é necessário revalidar o IP após o fetch (TOCTOU), mas isso
 * requer resolver DNS novamente e comparar com o IP usado pelo fetch —
 * fora do escopo desta Wave 12.5.
 *
 * @throws SsrfBlockedError se URL for insegura OU hostname resolve para IP privado
 */
export async function validateAndResolveExternalUrl(rawUrl: string): Promise<void> {
  assertSafeExternalUrl(rawUrl);
  const url = new URL(rawUrl);
  const hostname = url.hostname;

  // Se hostname é IP literal, assertSafeExternalUrl já checou.
  if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) return;
  if (hostname === 'localhost') return; // já bloqueado em assertSafeExternalUrl

  try {
    const addresses = await lookup(hostname, { all: true });
    for (const { address } of addresses) {
      if (isPrivateIp(address)) {
        throw new SsrfBlockedError(`dns-resolves-to-private-ip:${address}`, rawUrl);
      }
    }
  } catch (err) {
    if (err instanceof SsrfBlockedError) throw err;
    // DNS failure → bloqueia (fail-closed). Não queremos fetch cego.
    throw new SsrfBlockedError(`dns-lookup-failed:${(err as Error).message}`, rawUrl);
  }
}