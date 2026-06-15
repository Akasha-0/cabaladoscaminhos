import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '../../../apps/akasha-portal/src/app/api/share/receive/route';

// Mock next/headers cookies
const mockCookieStore = { get: vi.fn() };
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

// Mock JWT verification
const mockVerifyAkashaToken = vi.fn();
vi.mock('@/lib/application/auth/akasha-jwt', () => ({
  verifyAkashaToken: (...args: unknown[]) => mockVerifyAkashaToken(...args),
  AKASHA_TOKEN_COOKIE: 'akasha_session',
}));

// Mock prisma
const mockMentorRascunhoCreate = vi.fn();
vi.mock('@/lib/infrastructure/prisma', () => ({
  prisma: {
    mentorRascunho: {
      create: (...args: unknown[]) => mockMentorRascunhoCreate(...args),
    },
  },
}));

function makeFormDataRequest(data: Record<string, string>): Request {
  const form = new FormData();
  for (const [k, v] of Object.entries(data)) form.append(k, v);
  return new Request('http://localhost/api/share/receive', {
    method: 'POST',
    body: form,
  });
}

function makeRequestWithUrl(url: string): Request {
  return new Request(url, { method: 'POST', body: new FormData() });
}

describe('POST /api/share/receive (F-240)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirect 303 para /onboarding quando sem auth', async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const res = await POST(makeRequestWithUrl('http://localhost/api/share/receive') as any);
    expect(res.status).toBe(303);
    expect(res.headers.get('Location')).toMatch(/onboarding/);
  });

  it('redirect 303 para /onboarding com return path', async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const res = await POST(makeRequestWithUrl('http://localhost/api/share/receive') as any);
    const loc = res.headers.get('Location') ?? '';
    expect(loc).toContain('return=');
    expect(decodeURIComponent(loc)).toContain('/compartilhar/receber');
  });

  it('processa FormData válida e redireciona para /oraculo?intent=', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'valid-token' });
    mockVerifyAkashaToken.mockReturnValue({ sub: 'user-123' });
    mockMentorRascunhoCreate.mockRejectedValue(new Error('table does not exist'));

    const req = makeFormDataRequest({
      title: 'Como lidar com ansiedade',
      text: 'Texto longo de exemplo...',
      url: 'https://example.com/post',
    });
    const res = await POST(req as any);
    expect(res.status).toBe(303);
    const loc = res.headers.get('Location') ?? '';
    expect(loc).toContain('/oraculo');
    expect(loc).toContain('intent=');
  });

  it('rejeita URL com scheme javascript: (segurança)', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'valid-token' });
    mockVerifyAkashaToken.mockReturnValue({ sub: 'user-123' });

    const req = makeFormDataRequest({
      text: 'olha esse conteúdo',
      url: 'javascript:alert(1)',
    });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('unsafe_url');
  });

  it('rejeita URL com scheme data: (segurança)', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'valid-token' });
    mockVerifyAkashaToken.mockReturnValue({ sub: 'user-123' });

    const req = makeFormDataRequest({
      text: 'olha',
      url: 'data:text/html,<script>alert(1)</script>',
    });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('rejeita intent vazio (400 empty_intent)', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'valid-token' });
    mockVerifyAkashaToken.mockReturnValue({ sub: 'user-123' });

    const req = new Request('http://localhost/api/share/receive', {
      method: 'POST',
      body: new FormData(), // vazio
    });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('trunca campos > 2000 chars (anti-DoS)', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'valid-token' });
    mockVerifyAkashaToken.mockReturnValue({ sub: 'user-123' });
    mockMentorRascunhoCreate.mockRejectedValue(new Error('no table'));

    const longText = 'a'.repeat(5000);
    const req = makeFormDataRequest({ text: longText });
    const res = await POST(req as any);
    expect(res.status).toBe(303);
    const loc = res.headers.get('Location') ?? '';
    // intent= encoded NÃO deve conter 5000 chars
    const intentMatch = loc.match(/intent=([^&]+)/);
    if (intentMatch) {
      const decoded = decodeURIComponent(intentMatch[1]);
      expect(decoded.length).toBeLessThanOrEqual(4000);
    }
  });

  it('inclui URL segura (https://) como "(fonte: ...)"', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'valid-token' });
    mockVerifyAkashaToken.mockReturnValue({ sub: 'user-123' });
    mockMentorRascunhoCreate.mockRejectedValue(new Error('no table'));

    const req = makeFormDataRequest({
      text: 'olha esse artigo',
      url: 'https://example.com/article',
    });
    const res = await POST(req as any);
    expect(res.status).toBe(303);
    const loc = res.headers.get('Location') ?? '';
    const intentMatch = loc.match(/intent=([^&]+)/);
    if (intentMatch) {
      const decoded = decodeURIComponent(intentMatch[1]);
      expect(decoded).toContain('fonte: https://example.com/article');
    }
  });
});
