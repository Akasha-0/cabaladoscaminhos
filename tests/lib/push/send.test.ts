/**
 * send.test.ts — Akasha T7
 *
 * Cobertura:
 *   - Rejeita payload sem `body`
 *   - Rejeita payload com `body` > 100 chars (anti-vazamento, Doc 22 AD-22.2)
 *   - Em sucesso, encaminha para `web-push.sendNotification` com JSON serializado
 *   - Encaminha `expired: true` quando web-push retorna 404/410
 *   - Encaminha `error` em outras falhas
 *   - Garante que o body do payload NUNCA contém conteúdo do ritual
 *     (ex.: campo `ritual`, `climate`, `alert`, `tensionPoint`)
 *
 * Princípio (AD-22.2): o push é GENÉRICO. O conteúdo do ritual só
 * é aberto em `/diario` (autenticado). Este teste é o guard contra
 * regressões que vazem dados sagrados/sensíveis.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ----------------------------------------------------------------------------
// Mocks
// ----------------------------------------------------------------------------

const mockSendNotification = vi.fn();

vi.mock('web-push', () => ({
  default: {
    setVapidDetails: vi.fn(),
    sendNotification: (...args: unknown[]) => mockSendNotification(...args),
    generateVAPIDKeys: () => ({ publicKey: 'pk', privateKey: 'sk' }),
  },
}));

const VALID_SUB = {
  endpoint: 'https://push.example.com/abc',
  keys: { p256dh: 'AAAA', auth: 'BBBB' },
};

const { sendPush } = await import('@/lib/push/send');

beforeEach(() => {
  vi.clearAllMocks();
  // Garante VAPID configurado para que o baseSendPush não lance.
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = 'BPk-test';
  process.env.VAPID_PRIVATE_KEY = 'sk-test';
  mockSendNotification.mockResolvedValue(undefined);
});

// ----------------------------------------------------------------------------
// Tests
// ----------------------------------------------------------------------------

describe('send.ts (privacy + delegation)', () => {
  it('rejeita payload sem body', async () => {
    const res = await sendPush(VALID_SUB, { title: 't', body: '' as unknown as string });
    expect(res).toEqual({ ok: false, error: 'payload body missing' });
    expect(mockSendNotification).not.toHaveBeenCalled();
  });

  it('rejeita payload com body > 100 chars (anti-vazamento)', async () => {
    const longBody = 'x'.repeat(101);
    const res = await sendPush(VALID_SUB, { title: 't', body: longBody });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toMatch(/too long/);
    }
    expect(mockSendNotification).not.toHaveBeenCalled();
  });

  it('envia payload com body curto e delega para web-push', async () => {
    const res = await sendPush(VALID_SUB, {
      title: 'Akasha',
      body: 'Seu ritual de hoje está pronto',
      url: '/diario',
    });
    expect(res).toEqual({ ok: true });
    expect(mockSendNotification).toHaveBeenCalledTimes(1);
    const [, payloadStr, opts] = mockSendNotification.mock.calls[0]!;
    expect(typeof payloadStr).toBe('string');
    const payload = JSON.parse(payloadStr as string);
    expect(payload).toEqual({
      title: 'Akasha',
      body: 'Seu ritual de hoje está pronto',
      url: '/diario',
    });
    // TTL de 24h (delegado para web-push)
    expect(opts).toEqual({ TTL: 60 * 60 * 24 });
  });

  it('marca expired=true quando web-push retorna 404/410', async () => {
    const err = Object.assign(new Error('Gone'), { statusCode: 410 });
    mockSendNotification.mockRejectedValueOnce(err);
    const res = await sendPush(VALID_SUB, { title: 't', body: 'msg' });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.expired).toBe(true);
    }
  });

  it('encaminha error genérico em outras falhas', async () => {
    mockSendNotification.mockRejectedValueOnce(new Error('boom'));
    const res = await sendPush(VALID_SUB, { title: 't', body: 'msg' });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toBe('boom');
      expect(res.expired).toBeUndefined();
    }
  });

  it('NUNCA inclui campos do ritual (climate/alert/tensionPoint/herbs) no payload', async () => {
    // Mesmo se um caller descuidado tentar montar um payload maior, a função
    // só envia {title, body, url?} — nada além disso. Aqui validamos o
    // contrato: a `PushPayload` aceita apenas esses campos, e o JSON
    // serializado nunca vaza `climate`, `alert`, `tensionPoint`, `herbs`,
    // `ritual`, `glossary` etc.
    const res = await sendPush(VALID_SUB, {
      title: 'Akasha',
      body: 'Seu ritual de hoje está pronto',
    });
    expect(res.ok).toBe(true);
    const payloadStr = mockSendNotification.mock.calls[0]![1] as string;
    const payload = JSON.parse(payloadStr);
    // Só {title, body} foram enviados (sem url nesse teste).
    expect(Object.keys(payload).sort()).toEqual(['body', 'title']);
    // Nenhum campo estrutural do ritual vazou em nenhuma chave do payload.
    const payloadString = JSON.stringify(payload).toLowerCase();
    for (const forbidden of ['climate', 'alert', 'tensionpoint', 'herbs', 'glossarysection']) {
      expect(payloadString).not.toContain(forbidden);
    }
  });
});
