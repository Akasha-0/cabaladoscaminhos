/**
 * Mentor /ask — emotionalState wiring (Wave 9.3 commit 3)
 *
 * Testa o wiring entre body, header e router para o emotionalState:
 * - (a) body sem emotionalState → router recebe undefined
 * - (b) body com emotionalState: 'ansioso' → router recebe string
 * - (c) header x-akasha-state lido como fallback quando body ausente
 * - (d) log emitido quando emotion é detectada (auto-detect ou explícita)
 *
 * Estratégia: mockar streamMentorResponse para capturar o argumento
 * `emotionalState` recebido, e mockar auth/rate-limit/credits para
 * deixar o handler chegar ao ponto onde chama o LLM router.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ─── Captura de argumentos do router ─────────────────────────────────────────

interface CapturedCall {
  request: { question: string; emotionalState?: string | null };
}

const captured: CapturedCall[] = [];

vi.mock('@/lib/application/mentor/llm-router', () => ({
  streamMentorResponse: vi.fn(async function* (req: CapturedCall['request']) {
    captured.push({ request: req });
    yield 'mock-mentor-chunk';
  }),
}));

// ─── Mocks de auth / rate-limit / credits / maps ─────────────────────────────

vi.mock('@/lib/application/auth/akasha-guard', () => ({
  requireAkashaApi: vi.fn().mockResolvedValue({ id: 'user-test-123' }),
}));

vi.mock('@/lib/infrastructure/rate-limit', () => ({
  checkRedisRateLimit: vi.fn().mockResolvedValue({ allowed: true }),
  MENTOR_RATE_LIMIT_CONFIG: { windowMs: 60000, maxRequests: 10 },
  MENTOR_RATE_LIMIT_KEY_PREFIX: 'mentor:rl',
  formatMentorRateLimitError: () => 'rate limited',
}));

vi.mock('@/lib/application/mentor/credits', () => ({
  checkCredits: vi.fn().mockResolvedValue({ hasCredits: true, balance: 10 }),
  deductCredit: vi.fn().mockResolvedValue(9),
  noCreditsMessage: () => 'no credits',
}));

vi.mock('@akasha/mentor/maps', () => ({
  loadUserMaps: vi.fn().mockResolvedValue({
    kabalistic: null,
    astrology: null,
    tantric: null,
    odu: null,
    iching: null,
  }),
}));

// Stub @akasha/mcp para evitar auto-register (tests/api/mentor/ask/mcp-fallback)
// O handler faz import dinâmico + try/catch, então este stub é tolerante.
vi.mock('@akasha/mcp', () => ({
  getMcpServer: vi.fn().mockResolvedValue({
    getRegistry: () => ({
      tools: new Map(),
      resources: new Map(),
      prompts: new Map(),
      schemaVersion: '2024-11-05',
      serverName: 'test-mcp',
      serverVersion: '0.1.0',
    }),
    callTool: vi.fn().mockResolvedValue({ ok: false, error: { code: 'TOOL_NOT_FOUND', message: 'stub' } }),
  }),
}));

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeRequest(opts: {
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
} = {}): NextRequest {
  const { body = { question: 'qual o meu propósito?' }, headers = {} } = opts;
  return new NextRequest('http://localhost/api/mentor/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  captured.length = 0;
  vi.restoreAllMocks();
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

// ─── Testes ─────────────────────────────────────────────────────────────────

describe('Mentor /ask — emotionalState wiring (Wave 9.3 commit 3)', () => {
  it('(a) body sem emotionalState → router recebe undefined', async () => {
    const { POST } = await import('@/app/api/mentor/ask/route');
    await POST(makeRequest({ body: { question: 'olá' } }));

    expect(captured).toHaveLength(1);
    expect(captured[0].request.emotionalState).toBeUndefined();
  });

  it('(b) body com emotionalState: "ansioso" → router recebe a string', async () => {
    const { POST } = await import('@/app/api/mentor/ask/route');
    await POST(
      makeRequest({
        body: { question: 'estou ansioso', emotionalState: 'ansioso' },
      })
    );

    expect(captured).toHaveLength(1);
    expect(captured[0].request.emotionalState).toBe('ansioso');
  });

  it('(c) header x-akasha-state é lido como fallback quando body não traz', async () => {
    const { POST } = await import('@/app/api/mentor/ask/route');
    await POST(
      makeRequest({
        body: { question: 'olá' }, // sem emotionalState no body
        headers: { 'x-akasha-state': 'perdido' },
      })
    );

    expect(captured).toHaveLength(1);
    expect(captured[0].request.emotionalState).toBe('perdido');
  });

  it('(d) log [mentor] emotion=X auto-detected from question quando detectado', async () => {
    const { POST } = await import('@/app/api/mentor/ask/route');
    await POST(
      makeRequest({
        body: { question: 'estou ansioso com o futuro' },
        // sem body.emotionalState, sem header — auto-detect deve pegar
      })
    );

    expect(captured).toHaveLength(1);
    // detectEmotion regex casa "ansioso"
    expect(captured[0].request.emotionalState).toBe('ansioso');
    // Log estruturado emitido pelo route handler
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('[mentor] emotion=ansioso auto-detected from question')
    );
  });

  it('header tem prioridade sobre auto-detect', async () => {
    const { POST } = await import('@/app/api/mentor/ask/route');
    await POST(
      makeRequest({
        body: { question: 'estou ansioso' }, // auto-detect pegaria "ansioso"
        headers: { 'x-akasha-state': 'centrado' }, // mas header sobrescreve
      })
    );

    expect(captured[0].request.emotionalState).toBe('centrado');
  });

  it('body tem prioridade sobre header', async () => {
    const { POST } = await import('@/app/api/mentor/ask/route');
    await POST(
      makeRequest({
        body: { question: 'olá', emotionalState: 'perdido' },
        headers: { 'x-akasha-state': 'centrado' },
      })
    );

    expect(captured[0].request.emotionalState).toBe('perdido');
  });

  it('retorna undefined quando nada casa (pergunta neutra)', async () => {
    const { POST } = await import('@/app/api/mentor/ask/route');
    await POST(
      makeRequest({
        body: { question: 'olá, tudo bem?' }, // sem padrão emocional
      })
    );

    expect(captured[0].request.emotionalState).toBeUndefined();
  });

  it('valor inválido no header é ignorado (cai para auto-detect)', async () => {
    const { POST } = await import('@/app/api/mentor/ask/route');
    await POST(
      makeRequest({
        body: { question: 'estou curioso sobre Cabala' },
        headers: { 'x-akasha-state': 'invalid-value' }, // ignorado
      })
    );

    // cai para detectEmotion → "curioso"
    expect(captured[0].request.emotionalState).toBe('curioso');
  });

  it('valor inválido no body falha Zod validation (400)', async () => {
    const { POST } = await import('@/app/api/mentor/ask/route');
    const res = await POST(
      makeRequest({
        body: { question: 'olá', emotionalState: 'INVALID_STATE' },
      })
    );

    expect(res.status).toBe(400);
    // router não foi chamado
    expect(captured).toHaveLength(0);
  });
});
