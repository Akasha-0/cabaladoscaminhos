/**
 * API Route: GET /api/akasha/health
 *
 * Wave 31.4 Observability MVP — endpoint leve de health check que
 * retorna status agregado dos subsistemas (db, redis, mentor, openai).
 *
 * Status codes:
 *   200 — todos os subsistemas up OU degraded (openai não-crítico)
 *   503 — algum subsistema crítico está down
 *
 * Subsistemas verificados:
 *   - database: Prisma $queryRaw `SELECT 1`
 *   - redis:    PING (fallback in-memory se REDIS_URL ausente)
 *   - mentor:   presença de LLM API key (sem chamada real)
 *   - openai:   presença de OPENAI_API_KEY (não-crítico)
 *
 * LGPD: não loga body nem query params.
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  checkAllSubsystems,
  getLogger,
  getRequestScopedLogger,
  httpRequestsTotal,
  httpRequestDurationSeconds,
  makeCustomProbe,
  makeDbProbe,
  type SubsystemProbe,
  type SubsystemStatus,
} from '@akasha/observability';

import { prisma } from '@/lib/infrastructure/prisma';
import { getRedisClient } from '@/lib/infrastructure/redis';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Prisma + ioredis exigem Node runtime (não Edge)

const log = getLogger('api:akasha:health');

async function buildProbes(): Promise<SubsystemProbe[]> {
  // Database — Prisma `SELECT 1` é o canônico de liveness.
  const dbProbe = makeDbProbe({
    name: 'database',
    timeoutMs: 1500,
    run: async () => {
      await prisma.$queryRaw`SELECT 1`;
    },
  });

  // Redis — PING. Sem REDIS_URL, o client usa in-memory fallback.
  const redisProbe = makeCustomProbe({
    name: 'redis',
    timeoutMs: 1000,
    run: async () => {
      try {
        const client = await getRedisClient();
        const reply = await client.ping();
        if (reply !== 'PONG') {
          return { ok: false, error: `PING respondeu "${reply}"` };
        }
        return { ok: true, detail: 'PING → PONG' };
      } catch (err) {
        return {
          ok: false,
          error: err instanceof Error ? err.message : 'redis check falhou',
        };
      }
    },
  });

  // Mentor — checa API key do LLM provider. NÃO faz chamada real (custo).
  const mentorProbe = makeCustomProbe({
    name: 'mentor',
    timeoutMs: 500,
    run: async () => {
      const apiKey =
        process.env['MINIMAX_API_KEY'] ??
        process.env['OPENAI_API_KEY'] ??
        process.env['MENTOR_LLM_API_KEY'];
      if (!apiKey) {
        return {
          ok: false,
          error: 'Nenhuma LLM API key configurada (MINIMAX/OPENAI/MENTOR)',
        };
      }
      if (apiKey.length < 16) {
        return { ok: false, error: 'LLM API key parece inválida (muito curta)' };
      }
      return { ok: true, detail: 'LLM API key configurada' };
    },
  });

  // OpenAI — partner antigo. Não-crítico: ausente = ok, presente mas
  // inválida = down (mas não-derruba o endpoint).
  const openaiProbe = makeCustomProbe({
    name: 'openai',
    timeoutMs: 500,
    run: async () => {
      const apiKey = process.env['OPENAI_API_KEY'];
      if (!apiKey) {
        return { ok: true, detail: 'OpenAI não configurado (não-crítico)' };
      }
      if (apiKey.length < 16) {
        return { ok: false, error: 'OPENAI_API_KEY presente mas inválida' };
      }
      return { ok: true, detail: 'OPENAI_API_KEY configurada' };
    },
  });

  return [dbProbe, redisProbe, mentorProbe, openaiProbe];
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  // NextRequest satisfies the structural shape of RequestLike (headers.get,
  // method, url) but its TypeScript declarations omit the index signature
  // we declared. Cast is the documented escape hatch.
  const reqLog = getRequestScopedLogger(
    'api:akasha:health',
    request as unknown as Parameters<typeof getRequestScopedLogger>[1]
  );

  try {
    const probes = await buildProbes();
    const result = await checkAllSubsystems(probes);

    reqLog.info({ status: result.status, subsystems: result.subsystems.length }, 'health.check.completed');

    // Métricas Prometheus — observam contadores e duração.
    const route = '/api/akasha/health';
    const allUp = result.status === 'ok';
    httpRequestsTotal.inc({ route, method: 'GET', status: allUp ? 'up' : 'degraded' });
    httpRequestDurationSeconds.observe({ route, method: 'GET' }, result.durationMs / 1000);

    // 503 só se algum subsystem crítico está down. OpenAI não-crítico.
    const criticalDown = result.subsystems.some(
      (s: SubsystemStatus) => s.name !== 'openai' && s.status === 'down'
    );

    const requestId =
      (request.headers.get('x-request-id') as string | null) ?? `req-${Date.now().toString(36)}`;

    return NextResponse.json(
      {
        status: result.status,
        durationMs: result.durationMs,
        checkedAt: result.checkedAt,
        subsystems: result.subsystems,
      },
      {
        status: criticalDown ? 503 : 200,
        headers: { 'X-Request-Id': requestId },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    log.error({ error: message }, 'health.check.failed');
    httpRequestsTotal.inc({ route: '/api/akasha/health', method: 'GET', status: 'error' });
    const requestId =
      (request.headers.get('x-request-id') as string | null) ?? `req-${Date.now().toString(36)}`;
    return NextResponse.json(
      { status: 'error', error: message, subsystems: [] },
      { status: 500, headers: { 'X-Request-Id': requestId } }
    );
  }
}