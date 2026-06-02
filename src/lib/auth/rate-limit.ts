// ============================================================
// AUTH-SPECIFIC RATE LIMITING (Fase 18)
// ============================================================
// Rate-limit dedicado para rotas /api/operator/auth/*.
//
// Por que não usar o `checkRateLimit` genérico de `@/lib/rate-limit`?
//   1. Aquele usa store in-memory por processo (Map + setInterval). Em
//      produção multi-instância o contador não é compartilhado e o
//      limite real fica multiplicado por N pods. ERRADO para auth.
//   2. Não emite `X-RateLimit-Limit` / `X-RateLimit-Reset`, só
//      `X-RateLimit-Remaining`. RFC 6585 / draft-ietf-httpapi-ratelimit-headers
//      pede o conjunto completo.
//
// Este módulo usa o `getRedisClient()` já existente (com fallback
// in-memory transparente quando REDIS_URL não está setada). Isso
// garante:
//   - Em produção (REDIS_URL setado): contador compartilhado entre
//     instâncias. Limite respeitado de verdade.
//   - Em dev/test (sem Redis): fallback in-memory, sem quebrar.
//   - Comportamento idêntico de API em ambos os casos.
//
// Estratégia: token bucket simplificado via `INCR` + `EXPIRE` atômico.
//   key    = `auth:rl:<route>:<ip>`
//   value  = contador (string numérica)
//   TTL    = janela (segundos)
//
//   1º request    → INCR retorna 1, setamos EXPIRE = window.
//   requests N>1  → INCR retorna N, EXPIRE é NOOP se já existe.
//   request N+1   → INCR retorna max+1, retornamos 429.
//
// Atomicidade: `INCR` é atômico no Redis. O EXPIRE só é setado na
// primeira criação (count === 1). Janela deslizante? Não — janela
// fixa. Boa o suficiente para brute-force de credenciais (que é o
// caso de uso).

import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

// ============================================================
// CONFIG
// ============================================================

/**
 * Limites por rota (Fase 18).
 * - login:    5 tentativas / 15 min / IP   (mitiga brute-force)
 * - register: 3 registros / 1h / IP        (mitiga account-stuffing)
 * - refresh:  30 rotações / 1 min / IP     (mitiga abuso de refresh)
 *
 * Ajuste aqui se algum tráfego legítimo for barrado — não exponha
 * como env var sem pensar: brute-force real também lê env vars.
 */
/**
 * Limites por rota (Fase 18).
 * - login:    5 tentativas / 15 min / IP   (mitiga brute-force)
 * - register: 3 registros / 1h / IP        (mitiga account-stuffing)
 * - refresh:  30 rotações / 1 min / IP     (mitiga abuso de refresh)
 *
 * **Testabilidade**: cada limite pode ser sobrescrito via env var
 * (`AUTH_RL_LOGIN_MAX`, `AUTH_RL_REGISTER_MAX`, `AUTH_RL_REFRESH_MAX`).
 * Em testes, setamos valores altos (ex.: 10000) para desabilitar
 * efetivamente o rate-limit. Defaults são seguros para produção.
 *
 * Não exponha isso em env vars públicas sem pensar: brute-force real
 * também lê env vars. Os defaults já são restritivos.
 */
function readMax(envName: string, defaultMax: number): number {
  const v = process.env[envName];
  if (v === undefined || v === '') return defaultMax;
  const n = parseInt(v, 10);
  if (!Number.isFinite(n) || n < 0) return defaultMax;
  return n;
}

// fallow-ignore-next-line unused-export
export const AUTH_RATE_LIMITS = {
  login:    { windowSeconds: 15 * 60, max: readMax('AUTH_RL_LOGIN_MAX', 5),  label: 'login'    },
  register: { windowSeconds: 60 * 60, max: readMax('AUTH_RL_REGISTER_MAX', 3),  label: 'register' },
  refresh:  { windowSeconds: 60,      max: readMax('AUTH_RL_REFRESH_MAX', 30), label: 'refresh'  },
} as const;

export type AuthRoute = keyof typeof AUTH_RATE_LIMITS;

// ============================================================
// HELPERS
// ============================================================

/**
 * Extrai IP do request respeitando o reverse-proxy.
 * `x-forwarded-for` pode ter vários IPs encadeados ("cliente, proxy1, proxy2");
 * pegamos o primeiro (cliente real, convenção padrão).
 * Fallback para `x-real-ip` (nginx) e por fim 'unknown'.
 *
 * Defensivo: se request for undefined (ex.: chamada de teste sem mock
 * de NextRequest), retorna 'unknown'. O rate-limit ainda funciona,
 * só usa o bucket "unknown" para todos os requests sem IP.
 */
// fallow-ignore-next-line unused-export
// fallow-ignore-next-line complexity
export function getClientIp(request: NextRequest | undefined | null): string {
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

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  /** Unix epoch (segundos) em que a janela reseta. */
  resetAt: number;
  /** Segundos até o reset, p/ `Retry-After`. */
  retryAfterSeconds: number;
}

/**
 * Verifica e INCREMENTA o contador. Retorna info para os headers.
 * Em caso de falha no Redis (ex.: rede), FAILED OPEN: libera o request
 * mas loga. Bloquear tudo por causa de Redis down seria pior — um
 * atacante poderia tirar o Redis e DoS-ar todos os logins.
 */
// fallow-ignore-next-line unused-export
export async function checkAuthRateLimit(
  route: AuthRoute,
  ip: string
): Promise<RateLimitResult> {
  const cfg = AUTH_RATE_LIMITS[route];
  const key = `auth:rl:${cfg.label}:${ip}`;

  let count: number;
  let ttlSeconds: number;

  try {
    const redis = await getRedisClient();
    count = await redis.incr(key);
    // EXPIRE só é setado no primeiro INCR (count === 1). Renovações
    // subsequentes NÃO movem a janela — janela fixa, conforme spec.
    if (count === 1) {
      await redis.expire(key, cfg.windowSeconds);
    }
    // Pega o TTL atual. Se der erro (key sumiu?), usamos windowSeconds.
    // O `redis as any` cobre tanto ioredis quanto a interface in-memory.
    const redisAny = redis as unknown as {
      ttl?: (k: string) => Promise<number>;
    };
    if (typeof redisAny.ttl === 'function') {
      const ttl = await redisAny.ttl(key);
      ttlSeconds = ttl > 0 ? ttl : cfg.windowSeconds;
    } else {
      ttlSeconds = cfg.windowSeconds;
    }
  } catch (err) {
    // FAILED OPEN — loga e libera. Auth não pode parar por causa de Redis.
    console.error(`[auth/rate-limit] Redis error on ${route} for ${ip}`, err);
    return {
      allowed: true,
      limit: cfg.max,
      remaining: cfg.max,
      resetAt: Math.floor(Date.now() / 1000) + cfg.windowSeconds,
      retryAfterSeconds: cfg.windowSeconds,
    };
  }

  const allowed = count <= cfg.max;
  const remaining = Math.max(0, cfg.max - count);
  const resetAt = Math.floor(Date.now() / 1000) + ttlSeconds;

  return {
    allowed,
    limit: cfg.max,
    remaining,
    resetAt,
    retryAfterSeconds: allowed ? 0 : ttlSeconds,
  };
}

// ============================================================
// HEADERS & RESPONSE BUILDERS
// ============================================================

/** Aplica os headers padrão de rate-limit numa response mutável. */
export function applyRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult
): NextResponse {
  response.headers.set('X-RateLimit-Limit', result.limit.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', result.resetAt.toString());
  if (!result.allowed) {
    response.headers.set('Retry-After', result.retryAfterSeconds.toString());
  }
  return response;
}

/**
 * Helper de conveniência: roda o check e devolve uma 429 pronta
 * (com headers) caso excedido. Caso contrário, devolve null e o
 * caller segue. Também anexa os headers de rate-limit ao `okResponse`
 * quando o caller já construiu a response OK.
 */
export async function enforceAuthRateLimit(
  request: NextRequest | undefined | null,
  route: AuthRoute
): Promise<
  | { kind: 'blocked'; response: NextResponse }
  | { kind: 'ok'; result: RateLimitResult }
> {
  const ip = getClientIp(request);
  const result = await checkAuthRateLimit(route, ip);

  if (!result.allowed) {
    const res = NextResponse.json(
      {
        error: 'Muitas tentativas. Tente novamente mais tarde.',
        retryAfter: result.retryAfterSeconds,
      },
      { status: 429 }
    );
    applyRateLimitHeaders(res, result);
    return { kind: 'blocked', response: res };
  }

  return { kind: 'ok', result };
}


/**
 * Reseta o contador de rate-limit para um (route, ip). Útil em testes
 * que rodam múltiplos casos contra a mesma rota. Em produção, NUNCA
 * chamar — invalidaria a proteção contra brute-force.
 */
// fallow-ignore-next-line unused-export
export async function resetAuthRateLimit(
  route: AuthRoute,
  ip: string
): Promise<void> {
  const cfg = AUTH_RATE_LIMITS[route];
  const key = `auth:rl:${cfg.label}:${ip}`;
  try {
    const redis = await getRedisClient();
    // A interface RedisLike não tem `del`; usamos o `set` com TTL=1s
    // para sobrescrever. Funciona tanto no ioredis quanto no in-memory.
    // (O in-memory é privado; expomos via `disconnect`/etc — manter
    // esta abordagem agnóstica de implementação.)
    const redisAny = redis as unknown as {
      del?: (k: string) => Promise<unknown>;
    };
    if (typeof redisAny.del === 'function') {
      await redisAny.del(key);
    } else {
      // Fallback: o Map in-memory é privado. Recriamos via set
      // com valor "0" e TTL 1ms, que expira imediatamente.
      await redis.set(key, '0', 'EX', 1);
    }
  } catch (err) {
    // Best-effort; testes podem não ter Redis.
    console.error(`[auth/rate-limit] reset failed for ${route}/${ip}`, err);
  }
}
