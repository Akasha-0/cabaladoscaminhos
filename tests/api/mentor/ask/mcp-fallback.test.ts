/**
 * Mentor /ask — MCP fallback integration (Wave 8.4 B.2)
 *
 * Testa apenas o comportamento do bloco lazy import + fallback:
 * - Quando @akasha/mcp não está disponível (import throws) → handler
 *   continua para direct LLM (não deve quebrar).
 * - Quando @akasha/mcp tem tools registradas com prefixo 'mentor.' →
 *   handler logga mas continua no caminho stub (direct LLM).
 *
 * Não exercita o caminho real de LLM/credits/rate-limit (mockados).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// =============================================================================
// Mocks — isolam o handler real de tudo exceto do bloco MCP
// =============================================================================

// Auth mock: retorna user fixo
vi.mock('@/lib/application/auth/akasha-guard', () => ({
  requireAkashaApi: vi.fn().mockResolvedValue({ id: 'user-test-123' }),
}));

// Rate limit: sempre permitido
vi.mock('@/lib/infrastructure/rate-limit', () => ({
  checkRedisRateLimit: vi.fn().mockResolvedValue({ allowed: true }),
  MENTOR_RATE_LIMIT_CONFIG: { windowMs: 60000, maxRequests: 10 },
  MENTOR_RATE_LIMIT_KEY_PREFIX: 'mentor:rl',
  formatMentorRateLimitError: () => 'rate limited',
}));

// Credits: sempre disponível
vi.mock('@/lib/application/mentor/credits', () => ({
  checkCredits: vi.fn().mockResolvedValue({ hasCredits: true, balance: 10 }),
  deductCredit: vi.fn().mockResolvedValue(9),
  noCreditsMessage: () => 'no credits',
}));

// loadUserMaps: devolve mapa stub
vi.mock('@akasha/mentor/maps', () => ({
  loadUserMaps: vi.fn().mockResolvedValue({
    kabalistic: null,
    astrology: null,
    tantric: null,
    odu: null,
    iching: null,
  }),
}));

// streamMentorResponse: emite um único chunk e termina
vi.mock('@/lib/application/mentor/llm-router', () => ({
  streamMentorResponse: async function* () {
    yield 'mock-response';
  },
}));

// =============================================================================
// Helpers
// =============================================================================

function makeRequest(): NextRequest {
  return new NextRequest('http://localhost/api/mentor/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: 'qual o meu propósito?' }),
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
});

// =============================================================================
// Tests
// =============================================================================

describe('Mentor /ask — MCP fallback (Wave 8.4 B.2)', () => {
  it('falls back to direct LLM when @akasha/mcp unavailable', async () => {
    // Substitui o alias vitest para @akasha/mcp por um módulo que falha
    // ao ser importado. Como o handler usa dynamic import + try/catch,
    // isso NÃO deve quebrar o request.
    vi.doMock('@akasha/mcp', () => {
      throw new Error('Module not found');
    });

    const { POST } = await import('@/app/api/mentor/ask/route');
    const res = await POST(makeRequest());

    expect(res).toBeDefined();
    // status pode ser 200 (stream) ou 500 (algum erro interno de mock chain),
    // mas NÃO deve ser 503 nem explodir antes de retornar.
    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(500);
  });

  it('uses MCP tools if registered (logs and continues to direct LLM in stub mode)', async () => {
    // Substitui @akasha/mcp por um módulo com tools registradas
    vi.doMock('@akasha/mcp', () => ({
      mcpServer: {
        getRegistry: () => ({
          tools: new Map([
            [
              'mentor.test',
              {
                name: 'mentor.test',
                description: 'mock mentor tool',
                inputSchema: { type: 'object', properties: {} },
                handler: async () => ({ ok: true, data: {} }),
              },
            ],
          ]),
          resources: new Map(),
          prompts: new Map(),
          schemaVersion: '2024-11-05',
          serverName: 'akasha-mcp',
          serverVersion: '0.1.0-types-only',
        }),
      },
    }));

    const { POST } = await import('@/app/api/mentor/ask/route');
    const res = await POST(makeRequest());

    expect(res).toBeDefined();
    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(500);
  });
});