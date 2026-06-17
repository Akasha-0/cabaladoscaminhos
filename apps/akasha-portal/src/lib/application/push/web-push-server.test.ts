// Co-located unit test for web-push-server.
//
// The web-push-server module is a thin wrapper around the `web-push` npm
// library. It (1) lazily configures VAPID on first call, (2) sends
// notifications, (3) returns a structured result that lets callers
// distinguish expired subscriptions (404/410) from generic failures.
// This test mocks the `web-push` module entirely — no real network calls,
// no VAPID keys required.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the `web-push` library before importing the module under test.
const sendNotification = vi.fn();
const setVapidDetails = vi.fn();
const generateVAPIDKeys = vi.fn();

vi.mock('web-push', () => {
  return {
    default: {
      sendNotification,
      setVapidDetails,
      generateVAPIDKeys,
    },
  };
});

async function loadModule() {
  // Reset module state so `configured` flag re-evaluates per test
  vi.resetModules();
  return import('./web-push-server');
}

const VALID_SUB = {
  endpoint: 'https://fcm.googleapis.com/fcm/send/abc123',
  keys: { p256dh: 'BPubKey', auth: 'AuthSecret' },
};

beforeEach(() => {
  // Clear all env vars so tests start from a known state
  delete process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  delete process.env.VAPID_PRIVATE_KEY;
  delete process.env.VAPID_SUBJECT;
  sendNotification.mockReset();
  setVapidDetails.mockReset();
  generateVAPIDKeys.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('sendPush', () => {
  it('envia payload e retorna ok=true quando web-push não joga erro', async () => {
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = 'BPub';
    process.env.VAPID_PRIVATE_KEY = 'Priv';
    sendNotification.mockResolvedValueOnce({});

    const { sendPush } = await loadModule();
    const result = await sendPush(VALID_SUB, { title: 'Mandato', body: 'Hoje' });

    expect(result.ok).toBe(true);
    expect(result.expired).toBeUndefined();
    expect(sendNotification).toHaveBeenCalledOnce();
    expect(sendNotification).toHaveBeenCalledWith(
      VALID_SUB,
      JSON.stringify({ title: 'Mandato', body: 'Hoje' }),
      { TTL: 60 * 60 * 24 }
    );
  });

  it('marca expired=true quando web-push retorna 404', async () => {
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = 'BPub';
    process.env.VAPID_PRIVATE_KEY = 'Priv';
    sendNotification.mockRejectedValueOnce({
      statusCode: 404,
      message: 'Not Found',
    });

    const { sendPush } = await loadModule();
    const result = await sendPush(VALID_SUB, { title: 'x', body: 'y' });

    expect(result.ok).toBe(false);
    expect(result.expired).toBe(true);
    expect(result.error).toBe('Not Found');
  });

  it('marca expired=true quando web-push retorna 410 (subscription expirada)', async () => {
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = 'BPub';
    process.env.VAPID_PRIVATE_KEY = 'Priv';
    sendNotification.mockRejectedValueOnce({
      statusCode: 410,
      message: 'Gone',
    });

    const { sendPush } = await loadModule();
    const result = await sendPush(VALID_SUB, { title: 'x', body: 'y' });

    expect(result.ok).toBe(false);
    expect(result.expired).toBe(true);
    expect(result.error).toBe('Gone');
  });

  it('retorna ok=false sem expired quando erro genérico (500, network, etc)', async () => {
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = 'BPub';
    process.env.VAPID_PRIVATE_KEY = 'Priv';
    sendNotification.mockRejectedValueOnce({
      statusCode: 500,
      message: 'Internal Server Error',
    });

    const { sendPush } = await loadModule();
    const result = await sendPush(VALID_SUB, { title: 'x', body: 'y' });

    expect(result.ok).toBe(false);
    expect(result.expired).toBeUndefined();
    expect(result.error).toBe('Internal Server Error');
  });

  it('retorna ok=false com mensagem clara quando VAPID keys não estão configuradas', async () => {
    // No VAPID env vars set
    const { sendPush } = await loadModule();

    const result = await sendPush(VALID_SUB, { title: 'x', body: 'y' });

    // The error from ensureConfigured is caught and surfaced as a structured
    // failure (no statusCode, so not treated as expired). Caller can detect
    // missing config from the error message.
    expect(result.ok).toBe(false);
    expect(result.expired).toBeUndefined();
    expect(result.error).toMatch(/VAPID keys não configuradas/);

    // sendNotification should NOT be called if VAPID is not configured
    expect(sendNotification).not.toHaveBeenCalled();
  });

  it('configura VAPID apenas uma vez (idempotência do ensureConfigured)', async () => {
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = 'BPub';
    process.env.VAPID_PRIVATE_KEY = 'Priv';
    sendNotification.mockResolvedValue({});

    const { sendPush } = await loadModule();
    // 3 calls in sequence
    await sendPush(VALID_SUB, { title: '1', body: '1' });
    await sendPush(VALID_SUB, { title: '2', body: '2' });
    await sendPush(VALID_SUB, { title: '3', body: '3' });

    // setVapidDetails must be called exactly once across all sends
    expect(setVapidDetails).toHaveBeenCalledOnce();
  });
});

describe('getPublicVapidKey', () => {
  it('retorna a chave pública do ambiente', async () => {
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = 'BPublKeyXYZ';
    const { getPublicVapidKey } = await loadModule();

    expect(getPublicVapidKey()).toBe('BPublKeyXYZ');
  });

  it('lança erro claro quando env var não está definida', async () => {
    const { getPublicVapidKey } = await loadModule();

    expect(() => getPublicVapidKey()).toThrow(/NEXT_PUBLIC_VAPID_PUBLIC_KEY/);
  });
});

describe('generateVapidKeys', () => {
  it('delega para web-push.generateVAPIDKeys e retorna o par', async () => {
    generateVAPIDKeys.mockReturnValueOnce({
      publicKey: 'genPub',
      privateKey: 'genPriv',
    });

    const { generateVapidKeys } = await loadModule();
    const keys = generateVapidKeys();

    expect(keys).toEqual({ publicKey: 'genPub', privateKey: 'genPriv' });
    expect(generateVAPIDKeys).toHaveBeenCalledOnce();
  });
});
