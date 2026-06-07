/**
 * IP Hashing — LGPD Compliance Helper
 *
 * AD-22.2 (Doc 22 §2): "Privacidade por padrão. ... Logs referenciam
 * por ID, nunca por conteúdo. ... Nunca logar PII nem conteúdo de
 * dossiê/pergunta em texto puro."
 *
 * Endereço IP é considerado **dado pessoal** pela LGPD (art. 5º, II)
 * e pelo GDPR (Recital 30) — permite re-identificação do titular.
 *
 * Esta função aplica HMAC-SHA256 sobre o IP usando `JWT_SECRET` (env
 * var obrigatória em produção) como **salt server-side**. Resultado:
 *  - Mesmo IP → mesmo hash (determinístico para rate-limit/auditoria)
 *  - Impossível recuperar o IP original a partir do hash (HMAC unidirecional)
 *  - Mesmo secret, mesmo IP, mesmo hash — auditoria preserva join com
 *    logs históricos e chaves Redis
 *
 * O secret NUNCA é logado. Em ambiente dev sem JWT_SECRET, fallback
 * para hash SHA-256 simples sem salt (apenas dev) — produção Lança
 * erro se JWT_SECRET não estiver definido.
 */
import { createHmac } from 'crypto';

/**
 * Resultado do hash — sempre mesmo formato (hex 64 chars).
 */
export type IpHash = string;

const HASH_PREFIX = 'ipHash:'; // marca para diferenciar de outros usos do HMAC

/**
 * Hash determinístico de IP para uso em logs/auditoria/rate-limit.
 *
 * - Em produção, usa HMAC-SHA256 com JWT_SECRET como salt
 * - Em dev (NODE_ENV !== 'production' e sem JWT_SECRET), usa SHA-256
 *   simples (sem salt) para permitir inspeção
 *
 * @param ip - Endereço IP em texto puro (IPv4 ou IPv6)
 * @returns Hash hexadecimal de 64 caracteres
 * @throws Error se NODE_ENV=production e JWT_SECRET não estiver definido
 */
export function hashIp(ip: string): IpHash {
  if (!ip || ip === 'unknown') {
    // 'unknown' vira um hash fixo (vazio) para que logs sem IP ainda
    // sejam agrupáveis mas não exponham o valor literal.
    return hashRaw('');
  }
  return hashRaw(ip);
}

function hashRaw(input: string): IpHash {
  const secret = process.env.JWT_SECRET;

  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error(
      'JWT_SECRET must be set in production to hash IPs safely (LGPD compliance)',
    );
  }

  if (!secret) {
    // Dev/test fallback: SHA-256 sem salt. NÃO usar em produção.
    return createHmac('sha256', 'dev-only-no-secret').update(HASH_PREFIX + input).digest('hex');
  }

  return createHmac('sha256', secret).update(HASH_PREFIX + input).digest('hex');
}

/**
 * Helper que retorna tanto o IP (para logging de debug) quanto o hash
 * (para persistência). Em produção, NUNCA retornar o IP puro em logs
 * — use apenas o hash.
 */
export function getClientIpInfo(request: {
  headers: { get(name: string): string | null };
} | null | undefined): { ip: string; hash: IpHash } {
  const ip = getClientIp(request);
  return { ip, hash: hashIp(ip) };
}

/**
 * Extração de IP do request. Suporta x-forwarded-for, x-real-ip,
 * com fallback 'unknown' quando o header está ausente.
 */
function getClientIp(request: {
  headers: { get(name: string): string | null };
} | null | undefined): string {
  if (!request || !request.headers) {
    return 'unknown';
  }
  try {
    const fwd = request.headers.get('x-forwarded-for');
    if (fwd) {
      const first = fwd.split(',')[0]?.trim();
      if (first) return first;
    }
    const real = request.headers.get('x-real-ip');
    if (real) return real.trim();
  } catch {
    // Headers podem ser exóticos em alguns mocks; fallback seguro.
  }
  return 'unknown';
}
