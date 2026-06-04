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
import { logSecurityEvent } from '@/lib/auth/audit-service';
import { hashIp } from '@/lib/security/ip-hash';

// ============================================================
// CONFIG
// ============================================================

/**
 * Limites por rota (Fase 18 + Fase 25).
 * - login:    5 tentativas / 15 min / IP   (mitiga brute-force)
 * - register: 3 registros / 1h / IP        (mitiga account-stuffing)
 * - refresh:  30 rotações / 1 min / IP     (mitiga abuso de refresh)
 * - forgot-password:  5 pedidos / 15 min / IP  (mitiga enumeração de emails)
 * - reset-password:   10 tentativas / 5 min / IP (mitiga brute-force de token)
 *
 * **Testabilidade**: cada limite pode ser sobrescrito via env var
 * (`AUTH_RL_LOGIN_MAX`, `AUTH_RL_REGISTER_MAX`, `AUTH_RL_REFRESH_MAX`,
 * `AUTH_RL_FORGOT_PASSWORD_MAX`, `AUTH_RL_RESET_PASSWORD_MAX`).
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

export const AUTH_RATE_LIMITS = {
  login:    { windowSeconds: 15 * 60, max: readMax('AUTH_RL_LOGIN_MAX', 5),  label: 'login'    },
  register: { windowSeconds: 60 * 60, max: readMax('AUTH_RL_REGISTER_MAX', 3),  label: 'register' },
  refresh:  { windowSeconds: 60,      max: readMax('AUTH_RL_REFRESH_MAX', 30), label: 'refresh'  },
  'forgot-password':  { windowSeconds: 15 * 60, max: readMax('AUTH_RL_FORGOT_PASSWORD_MAX', 5), label: 'forgot-password' },
  'reset-password':   { windowSeconds: 5 * 60,  max: readMax('AUTH_RL_RESET_PASSWORD_MAX', 10), label: 'reset-password'  },
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
export async function checkAuthRateLimit(
  route: AuthRoute,
  ip: string
): Promise<RateLimitResult> {
  const cfg = AUTH_RATE_LIMITS[route];
  // LGPD: usar hash do IP como chave Redis (não IP puro).
  // O hash é determinístico (mesmo IP → mesmo hash) e unidirecional.
  // Preserva o rate-limit por origem sem expor PII no Redis/logs.
  const key = `auth:rl:${cfg.label}:${hashIp(ip)}`;

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
    // Fase 21: RATE_LIMIT_EXCEEDED — fire-and-forget, nunca bloqueia
    // LGPD: passa o HASH do IP, não o IP em texto puro.
    logSecurityEvent({
      type: 'RATE_LIMIT_EXCEEDED',
      ipAddress: hashIp(ip),
      metadata: { route, limit: result.limit, remaining: result.remaining },
    });
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
async function resetAuthRateLimit(
  route: AuthRoute,
  ip: string
): Promise<void> {
  const cfg = AUTH_RATE_LIMITS[route];
  // LGPD: hash determinístico (mesmo IP → mesmo hash), unidirecional.
  const key = `auth:rl:${cfg.label}:${hashIp(ip)}`;
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
// ============================================================
// PER-OPERATOR RATE LIMITING (Phase 24)
// ============================================================
// Rate-limit adicional POR OPERATOR (não só por IP).
// Redis key pattern: `ratelimit:operator:{operatorId}:{action}`
//
// Camadas de proteção:
//   1. IP-based rate limit (Fase 18) — primeira linha de defesa
//   2. Operator-based rate limit — segunda linha (evita abuso por operator comprometido)
//
// Ambas são verificadas independentemente. Se qualquer uma exceder → 429.
//
// Estratégia: token bucket simplificado via `INCR` + `EXPIRE` atômico (mesmo
// padrão do checkAuthRateLimit, mas com key diferente).
//
// Fail-open: se Redis estiver down,允许请求但记录警告。Auth不能因Redis down而阻塞。
export interface OperatorRateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}
/**
 * Verifica e INCREMENTA o contador de rate-limit por operator.
 *
 * @param operatorId - ID do operador autenticado
 * @param action     - nome da ação (ex: 'revoke-all', 'refresh', 'logout')
 * @param limit      - máximo de requests permitidos na janela
 * @param windowSecs - tamanho da janela em segundos
 *
 * Fail-open: se Redis falhar, permite o request e loga warning.
 * Nunca bloqueia por causa de Redis down.
 */
export async function checkOperatorRateLimit(
  operatorId: string,
  action: string,
  limit: number,
  windowSecs: number
): Promise<OperatorRateLimitResult> {
  if (!operatorId || typeof operatorId !== 'string') {
    // Sem operatorId válido, não podemos fazer rate-limit por operator.
    // Mas IP limit já está lá — deixamos passar.
    return {
      allowed: true,
      limit,
      remaining: limit,
      resetAt: Math.floor(Date.now() / 1000) + windowSecs,
      retryAfterSeconds: 0,
    };
  }
  const key = `ratelimit:operator:${operatorId}:${action}`;
  let count: number;
  let ttlSeconds: number;
  try {
    const redis = await getRedisClient();
    count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, windowSecs);
    }
    // Pega TTL atual
    const redisAny = redis as unknown as {
      ttl?: (k: string) => Promise<number>;
    };
    if (typeof redisAny.ttl === 'function') {
      const ttl = await redisAny.ttl(key);
      ttlSeconds = ttl > 0 ? ttl : windowSecs;
    } else {
      ttlSeconds = windowSecs;
    }
  } catch (err) {
    // FAILED OPEN — loga e libera. Redis down não bloqueia auth.
    console.error(
      `[auth/rate-limit/operator] Redis error on ${action} for operatorId ${operatorId}`,
      err
    );
    return {
      allowed: true,
      limit,
      remaining: limit,
      resetAt: Math.floor(Date.now() / 1000) + windowSecs,
      retryAfterSeconds: windowSecs,
    };
  }
  const allowed = count <= limit;
  const remaining = Math.max(0, limit - count);
  const resetAt = Math.floor(Date.now() / 1000) + ttlSeconds;
  return {
    allowed,
    limit,
    remaining,
    resetAt,
    retryAfterSeconds: allowed ? 0 : ttlSeconds,
  };
}
/**
 * Helper: combina verificação de rate-limit IP + Operator.
 * Retorna 429 se QUALQUER um dos dois for excedido.
 *
 * Uso típico:
 *   const rl = await checkBothRateLimits(request, operatorId, 'refresh', IP_LIMIT, OPERATOR_LIMIT, WINDOW);
 *   if (!rl.allowed) return rl.response;
 */
export async function checkBothRateLimits(
  request: NextRequest | undefined | null,
  operatorId: string,
  action: string,
  ipLimit: number,
  ipWindowSeconds: number,
  operatorLimit: number,
  operatorWindowSeconds: number
): Promise<
  | { kind: 'blocked'; response: NextResponse; by: 'ip' | 'operator' }
  | {
      kind: 'ok';
      ipResult: RateLimitResult;
      operatorResult: OperatorRateLimitResult;
    }
> {
  // 1) IP-based (já existente)
  const ip = getClientIp(request);
  const ipResult = await checkAuthRateLimitFromConfig(ip, action, ipLimit, ipWindowSeconds);
  if (!ipResult.allowed) {
    // Fase 21: RATE_LIMIT_EXCEEDED — fire-and-forget
    // LGPD: passa o HASH do IP, não o IP em texto puro.
    logSecurityEvent({
      type: 'RATE_LIMIT_EXCEEDED',
      ipAddress: hashIp(ip),
      metadata: { route: action, limit: ipResult.limit, remaining: ipResult.remaining, by: 'ip' },
    });
    const res = NextResponse.json(
      {
        error: 'Muitas tentativas. Tente novamente mais tarde.',
        retryAfter: ipResult.retryAfterSeconds,
        limitType: 'ip',
      },
      { status: 429 }
    );
    applyRateLimitHeaders(res, ipResult);
    return { kind: 'blocked', response: res, by: 'ip' };
  }
  // 2) Operator-based
  const operatorResult = await checkOperatorRateLimit(
    operatorId,
    action,
    operatorLimit,
    operatorWindowSeconds
  );
  if (!operatorResult.allowed) {
    // Fase 21: RATE_LIMIT_EXCEEDED — fire-and-forget
    logSecurityEvent({
      type: 'RATE_LIMIT_EXCEEDED',
      operatorId: operatorId,
      ipAddress: ip,
      metadata: { route: action, limit: operatorResult.limit, remaining: operatorResult.remaining, by: 'operator' },
    });
    const res = NextResponse.json(
      {
        error: 'Limite de操作 por operador excedido. Tente novamente mais tarde.',
        retryAfter: operatorResult.retryAfterSeconds,
        limitType: 'operator',
      },
      { status: 429 }
    );
    // Aplica headers de rate-limit (usando operador result)
    res.headers.set('X-RateLimit-Limit', operatorResult.limit.toString());
    res.headers.set('X-RateLimit-Remaining', operatorResult.remaining.toString());
    res.headers.set('X-RateLimit-Reset', operatorResult.resetAt.toString());
    res.headers.set('Retry-After', operatorResult.retryAfterSeconds.toString());
    return { kind: 'blocked', response: res, by: 'operator' };
  }
  return { kind: 'ok', ipResult, operatorResult };
}
/**
 * Wrapper sobre checkAuthRateLimit que aceita config customizada
 * (limit + windowSeconds) em vez de usar AUTH_RATE_LIMITS.
 * Usado por checkBothRateLimits.
 */
async function checkAuthRateLimitFromConfig(
  ip: string,
  action: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  let count: number;
  let ttlSeconds: number;
  try {
    const redis = await getRedisClient();
    // LGPD: hash determinístico, unidirecional.
    const key = `auth:rl:${action}:${hashIp(ip)}`;
    count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }
    const redisAny = redis as unknown as {
      ttl?: (k: string) => Promise<number>;
    };
    if (typeof redisAny.ttl === 'function') {
      const ttl = await redisAny.ttl(key);
      ttlSeconds = ttl > 0 ? ttl : windowSeconds;
    } else {
      ttlSeconds = windowSeconds;
    }
  } catch (err) {
    console.error(`[auth/rate-limit] Redis error on ${action} for ${ip}`, err);
    return {
      allowed: true,
      limit,
      remaining: limit,
      resetAt: Math.floor(Date.now() / 1000) + windowSeconds,
      retryAfterSeconds: windowSeconds,
    };
  }
  const allowed = count <= limit;
  const remaining = Math.max(0, limit - count);
  const resetAt = Math.floor(Date.now() / 1000) + ttlSeconds;
  return {
    allowed,
    limit,
    remaining,
    resetAt,
    retryAfterSeconds: allowed ? 0 : ttlSeconds,
  };
}
/**
 * Limites por rota para rate-limit POR OPERATOR (Phase 24).
 * Estes são mais permissivos que os de IP (o operator autenticado é
 * menos provável de ser atacante, mas um operator comprometido pode
 * tentar abusar de suas próprias sessões).
 */
export const OPERATOR_RATE_LIMITS = {
  'sessions/revoke-all': { windowSeconds: 60, max: 3 },
  'sessions/delete':     { windowSeconds: 60, max: 10 },
  'logout':              { windowSeconds: 60, max: 10 },
  'refresh':             { windowSeconds: 60, max: 30 },
  'pdf-export':          { windowSeconds: 60, max: 5 },
} as const;
export type OperatorRoute = keyof typeof OPERATOR_RATE_LIMITS;
/**
 * Reseta o contador de rate-limit por operator. Útil em testes.
 * Em produção, NUNCA chamar — invalidaria a proteção.
 */
export async function resetOperatorRateLimit(
  operatorId: string,
  action: string
): Promise<void> {
  const key = `ratelimit:operator:${operatorId}:${action}`;
  try {
    const redis = await getRedisClient();
    const redisAny = redis as unknown as {
      del?: (k: string) => Promise<unknown>;
    };
    if (typeof redisAny.del === 'function') {
      await redisAny.del(key);
    } else {
      await redis.set(key, '0', 'EX', 1);
    }
  } catch (err) {
    console.error(`[auth/rate-limit/operator] reset failed for ${operatorId}/${action}`, err);
  }
}
