/**
 * Strict per-endpoint rate limits — Wave 12.5 §12.5.
 *
 * Antibrute-force + anti-abuse para rotas sensíveis. Diferente de
 * `rate-limit.ts` (que aplica limite genérico por IP/user em toda
 * `/api/*`), aqui temos políticas específicas:
 *
 *   - `/api/akasha/auth/login`: 5 req/min por IP — bloqueia brute-force
 *     de credenciais. 5 tentativas em 1 min é UX-aceitável (typo,
 *     esqueceu senha); >5 é claramente ataque.
 *   - `/api/akasha/auth/register`: 3 req/hour por IP — bloqueia account
 *     enumeration + criação em massa de contas fake. 3 por hora é mais
 *     do que suficiente para uso humano normal.
 *   - `/api/akasha/auth/me`: 30 req/min por userId — protege contra
 *     scraping de PII (GET retorna email, nome, birthDate, etc.).
 *   - `/api/mcp`: 100 req/min por userId — anti-abuso do MCP server
 *     (cada tools/call pode disparar LLM + RAG, computação cara).
 *
 * IMPORTANTE (LGPD Art. 33): os identifiers aqui são derivados de IP
 * via `hashIp()` (HMAC-SHA256 + JWT_SECRET) para que logs não
 * exponham PII em texto puro. Em dev sem JWT_SECRET, usa SHA-256 sem
 * salt (apenas para inspeção local; production Lança erro).
 *
 * Chave Redis: `rate:strict:<scope>:<hashed-identifier>` — namespace
 * separado do rate-limit genérico (`rate:api` / `rate:mentor`) para
 * que políticas não se confundam.
 */
import type { NextRequest } from 'next/server';
import { checkMemoryRateLimit, checkRedisRateLimit, type RateLimitConfig, type RateLimitResult } from '@/lib/infrastructure/rate-limit';
import { hashIp } from '@/lib/infrastructure/security/ip-hash';

export const STRICT_RATE_LIMIT_KEY_PREFIX = 'rate:strict';

/**
 * Configs por endpoint. Wave 12.5 §12.5 — baseados em threat model
 * e UX aceitável. Não diminuir sem alinhamento com produto.
 */
export const STRICT_RATE_LIMIT_CONFIGS = {
  /** 5 tentativas/min — UX-ok, anti-bruteforce */
  AUTH_LOGIN: {
    windowMs: 60 * 1000,
    maxRequests: 5,
  },
  /** 3 cadastros/hora — anti-enumeração + anti-spam de contas */
  AUTH_REGISTER: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 3,
  },
  /** 30 req/min — uso normal de polling; bloqueia scraping de PII */
  AUTH_ME: {
    windowMs: 60 * 1000,
    maxRequests: 30,
  },
  /** 100 req/min — MCP tools podem ser caros; anti-abuso */
  MCP: {
    windowMs: 60 * 1000,
    maxRequests: 100,
  },
} as const satisfies Record<string, RateLimitConfig>;

export type StrictScope = keyof typeof STRICT_RATE_LIMIT_CONFIGS;

/**
 * Extrai identifier LGPD-safe do request.
 *
 * - `preferUserId=true`: usa userId do header (deve ser setado por
 *   middleware após `requireAkashaApi`). Se ausente, fallback para
 *   hash do IP (defense-in-depth).
 * - `preferUserId=false`: usa SEMPRE hash do IP.
 *
 * O hash HMAC-SHA256 (com JWT_SECRET) garante que o identifier
 * seja determinístico (mesmo IP → mesmo hash entre requests, para
 * que o rate-limit acumule corretamente) sem expor o IP em logs.
 */
export function extractStrictIdentifier(
  request: { headers: { get(name: string): string | null } },
  options: { preferUserId: boolean }
): string {
  if (options.preferUserId) {
    const userId = request.headers.get('x-user-id') ?? request.headers.get('x-akasha-user-id');
    if (userId) return `user:${userId}`;
  }
  // Fallback: IP hashed (LGPD-safe)
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')?.trim()
    ?? 'unknown';
  return `ip:${hashIp(ip)}`;
}

/**
 * Checa rate limit strict para um escopo específico.
 *
 * Em produção, usa Redis (consistente entre réplicas serverless).
 * Em dev/sem Redis, fallback para memória in-process.
 */
export async function checkStrictRateLimit(
  request: { headers: { get(name: string): string | null } },
  scope: StrictScope,
  options: { preferUserId: boolean }
): Promise<RateLimitResult> {
  const config = STRICT_RATE_LIMIT_CONFIGS[scope];
  const identifier = extractStrictIdentifier(request, options);
  const key = `${STRICT_RATE_LIMIT_KEY_PREFIX}:${scope}:${identifier}`;

  // Tenta Redis primeiro (production); fallback para memória em dev.
  try {
    const result = await checkRedisRateLimit(
      key,
      config.maxRequests,
      Math.ceil(config.windowMs / 1000)
    );
    if (result) return result;
  } catch {
    // Redis indisponível — cai para memória
  }
  return checkMemoryRateLimit(key, config);
}

/**
 * Helper para API routes: retorna `NextResponse.json` 429 com mensagem
 * LGPD-friendly (não vaza identifier/IP) ou `null` se permitido.
 *
 * Caller faz: `const blocked = enforceStrictRateLimit(...); if (blocked) return blocked;`
 */
export function buildStrictRateLimitResponse(scope: StrictScope): {
  status: 429;
  body: { error: string; scope: StrictScope; retryAfterSeconds: number };
} {
  const config = STRICT_RATE_LIMIT_CONFIGS[scope];
  // Mensagem varia por scope — usuários precisam entender o que aconteceu.
  const messages: Record<StrictScope, string> = {
    AUTH_LOGIN: 'Muitas tentativas de login. Aguarde 1 minuto antes de tentar novamente.',
    AUTH_REGISTER: 'Limite de cadastros atingido. Aguarde 1 hora ou entre em contato com o suporte.',
    AUTH_ME: 'Muitas requisições. Aguarde alguns segundos.',
    MCP: 'Limite de requisições ao servidor MCP atingido. Aguarde 1 minuto.',
  };
  return {
    status: 429,
    body: {
      error: messages[scope],
      scope,
      retryAfterSeconds: Math.ceil(config.windowMs / 1000),
    },
  };
}