// ============================================================
// API ROUTE — Rate Limit Status (Phase 24)
// ============================================================
// GET /api/operator/rate-limit-status
//
// Retorna o status atual dos rate-limits para o operator autenticado.
// Útil para dashboards e debugging. Não é crítico para segurança
// (é só informational).
//
// Respostas:
//   200 — { limits: { [action]: { limit, remaining, resetAt } } }
//   401 — operator não autenticado
//
// NOTA: Este endpoint NÃO consome rate-limit. Se quisesse,
// teríamos de criar um loop (para saber o limite, precisa verificar,
// mas verificar consome). Por isso ele é informational-only.
import { NextRequest, NextResponse } from 'next/server';
import { requireOperatorApi } from '@/lib/auth/operator-guard';
import { OPERATOR_RATE_LIMITS } from '@/lib/auth/rate-limit';
import { getRedisClient } from '@/lib/redis';

export async function GET(request: NextRequest) {
  const operatorOrResponse = await requireOperatorApi(request);
  if (operatorOrResponse instanceof NextResponse) return operatorOrResponse;
  const operator = operatorOrResponse;

  const limits: Record<string, { limit: number; remaining: number; resetAt: string }> = {};

  // Para cada ação com rate-limit, lê o contador atual do Redis
  const redis = await getRedisClient();
  const redisAny = redis as unknown as {
    ttl?: (k: string) => Promise<number>;
  };

  for (const [action, config] of Object.entries(OPERATOR_RATE_LIMITS)) {
    const key = `ratelimit:operator:${operator.id}:${action}`;
    try {
      const countStr = await redis.get(key);
      const count = countStr ? parseInt(countStr, 10) : 0;
      const remaining = Math.max(0, config.max - count);

      // Pega TTL para o resetAt
      let ttlSeconds: number = config.windowSeconds;
      if (typeof redisAny.ttl === 'function') {
        try {
          const ttl = await redisAny.ttl(key);
          if (ttl > 0) ttlSeconds = ttl;
        } catch {
          // TTL falhou, usa window padrão
        }
      }

      const resetAtEpoch = Math.floor(Date.now() / 1000) + ttlSeconds;
      const resetAt = new Date(resetAtEpoch * 1000).toISOString();

      limits[action] = {
        limit: config.max,
        remaining,
        resetAt,
      };
    } catch (err) {
      // Redis down — retorna config default com resetAt = now + window
      const resetAtEpoch = Math.floor(Date.now() / 1000) + config.windowSeconds;
      limits[action] = {
        limit: config.max,
        remaining: config.max,
        resetAt: new Date(resetAtEpoch * 1000).toISOString(),
      };
    }
  }

  return NextResponse.json({
    operatorId: operator.id,
    limits,
  });
}
