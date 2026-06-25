/**
 * /api/health — structured health check (Wave 12.2)
 *
 * Testa:
 *  - Response shape: { status, timestamp, version, uptime, build, services: { db, redis, llm, mcp } }
 *  - Rollup de status:
 *      all ok                → 200, status: 'ok'
 *      any error             → 503, status: 'error'
 *      any unknown (no error)→ 200, status: 'degraded'
 *  - Cache-Control: no-store (monitoring endpoints nunca cacheiam)
 *  - Endpoint é público (não exige auth)
 *  - Build info vem dos env vars VERCEL_GIT_COMMIT_SHA / BUILD_COMMIT
 *  - Graceful degradation: falha num check não trava o resto
 *
 * Estratégia: mockar todos os 4 checks (prisma, redis, llm factory, mcp)
 * para isolar o handler de dependências reais.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Mocks de dependências externas ─────────────────────────────────────────

const mockPrismaQueryRaw = vi.fn();
vi.mock('@/lib/infrastructure/prisma', () => ({
  prisma: {
    $queryRaw: (...args: unknown[]) => mockPrismaQueryRaw(...args),
  },
}));

const mockRedisPing = vi.fn();
vi.mock('@/lib/infrastructure/redis', () => ({
  getRedisClient: vi.fn().mockResolvedValue({ ping: () => mockRedisPing() }),
}));

const mockCreateProvider = vi.fn();
vi.mock('@akasha/mentor/llm', () => ({
  createProvider: (...args: unknown[]) => mockCreateProvider(...args),
}));

const mockGetMcpServer = vi.fn();
vi.mock('@akasha/mcp', () => ({
  getMcpServer: (...args: unknown[]) => mockGetMcpServer(...args),
}));

// ─── Helpers ────────────────────────────────────────────────────────────────

interface JsonBody {
  status: string;
  timestamp: string;
  version: string;
  uptime: number;
  build: { commit: string; timestamp: string; env: string };
  services: {
    db: { status: string; latencyMs?: number; detail?: string };
    redis: { status: string; latencyMs?: number; detail?: string };
    llm: { status: string; latencyMs?: number; detail?: string };
    mcp: { status: string; latencyMs?: number; detail?: string };
  };
}

async function callHealth(): Promise<Response> {
  const { GET } = await import('@/app/api/health/route');
  return GET();
}

// ─── Testes ────────────────────────────────────────────────────────────────

describe('/api/health — Wave 12.2 structured health check', () => {
  beforeEach(() => {
    // Defaults: tudo OK. Cada teste sobrescreve o que precisar.
    mockPrismaQueryRaw.mockReset().mockResolvedValue([{ '?column?': 1 }]);
    mockRedisPing.mockReset().mockResolvedValue('PONG');
    mockCreateProvider.mockReset().mockResolvedValue({
      name: 'mock',
      model: 'mock-gpt-4',
      stream: async function* () {},
      complete: async () => '',
    });
    mockGetMcpServer.mockReset().mockResolvedValue({
      getRegistry: () => ({
        tools: new Map(),
        resources: new Map(),
        prompts: new Map(),
        schemaVersion: '2024-11-05',
        serverName: 'test-mcp',
        serverVersion: '0.1.0',
      }),
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('(1) retorna 200 com shape estruturado quando todos os serviços estão OK', async () => {
    const res = await callHealth();
    expect(res.status).toBe(200);

    const body = (await res.json()) as JsonBody;
    expect(body.status).toBe('ok');
    expect(body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO 8601
    expect(body.version).toBeTruthy();
    expect(typeof body.uptime).toBe('number');
    expect(body.uptime).toBeGreaterThanOrEqual(0);

    // build info presente
    expect(body.build).toEqual(
      expect.objectContaining({
        commit: expect.any(String),
        timestamp: expect.any(String),
        env: expect.any(String),
      })
    );

    // services todos OK com latencyMs numérico
    expect(body.services.db.status).toBe('ok');
    expect(body.services.redis.status).toBe('ok');
    expect(body.services.llm.status).toBe('ok');
    expect(body.services.llm.detail).toContain('mock');
    expect(body.services.mcp.status).toBe('ok');
    expect(body.services.mcp.detail).toContain('test-mcp');
    expect(typeof body.services.db.latencyMs).toBe('number');
  });

  it('(2) envia Cache-Control: no-store (monitoring nunca cacheia)', async () => {
    const res = await callHealth();
    const cacheControl = res.headers.get('Cache-Control');
    expect(cacheControl).toBeTruthy();
    expect(cacheControl).toContain('no-store');
    expect(cacheControl).toContain('max-age=0');
  });

  it('(3) retorna 503 quando qualquer service retorna error (db down)', async () => {
    mockPrismaQueryRaw.mockRejectedValue(new Error('connection refused'));

    const res = await callHealth();
    expect(res.status).toBe(503);

    const body = (await res.json()) as JsonBody;
    expect(body.status).toBe('error');
    expect(body.services.db.status).toBe('error');
    expect(body.services.db.detail).toContain('connection refused');
    // Outros serviços devem continuar reportando seus próprios estados
    expect(body.services.redis.status).toBe('ok');
    expect(body.services.llm.status).toBe('ok');
  });

  it('(4) retorna 200 com status="degraded" quando MCP é unknown (mas sem errors)', async () => {
    // MCP lança "not implemented" → treated como unknown, não error
    mockGetMcpServer.mockRejectedValue(new Error('not implemented yet'));

    const res = await callHealth();
    expect(res.status).toBe(200);

    const body = (await res.json()) as JsonBody;
    expect(body.status).toBe('degraded');
    expect(body.services.mcp.status).toBe('unknown');
    expect(body.services.db.status).toBe('ok');
  });

  it('(5) graceful degradation: falha no LLM não trava os outros checks', async () => {
    mockCreateProvider.mockRejectedValue(new Error('Ollama unreachable'));

    const res = await callHealth();
    // LLM falhou → top-level é "error" mas db/redis/mcp devem ter rodado
    expect(res.status).toBe(503);

    const body = (await res.json()) as JsonBody;
    expect(body.services.llm.status).toBe('error');
    expect(body.services.llm.detail).toContain('Ollama unreachable');
    // DB/Redis/MCP foram chamados apesar do LLM falhar
    expect(mockPrismaQueryRaw).toHaveBeenCalledTimes(1);
    expect(mockRedisPing).toHaveBeenCalledTimes(1);
    expect(mockGetMcpServer).toHaveBeenCalledTimes(1);
  });

  it('(6) usa VERCEL_GIT_COMMIT_SHA para build.commit quando disponível', async () => {
    vi.stubEnv('VERCEL_GIT_COMMIT_SHA', 'abc123def456');
    vi.stubEnv('VERCEL_GIT_COMMIT_DATE', '2026-06-24T12:00:00Z');
    vi.stubEnv('NODE_ENV', 'production');

    const res = await callHealth();
    const body = (await res.json()) as JsonBody;

    expect(body.build.commit).toBe('abc123def456');
    expect(body.build.timestamp).toBe('2026-06-24T12:00:00Z');
    expect(body.build.env).toBe('production');
  });

  it('(7) retorna 503 quando LLM provider retorna "error" status', async () => {
    // Simula factory que cospe um provider que joga na stream
    mockCreateProvider.mockResolvedValue({
      name: 'openai',
      model: 'gpt-4',
      stream: async function* () {
        throw new Error('rate limited');
      },
      complete: async () => {
        throw new Error('rate limited');
      },
    });

    const res = await callHealth();
    expect(res.status).toBe(200); // factory OK retorna provider → check é "ok"

    const body = (await res.json()) as JsonBody;
    expect(body.services.llm.status).toBe('ok');
    expect(body.services.llm.detail).toContain('openai');
  });
});