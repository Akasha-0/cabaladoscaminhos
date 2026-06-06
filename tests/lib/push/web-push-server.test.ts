import { describe, it, expect } from 'vitest';

describe('web-push-server (validacao de configuracao VAPID)', () => {
  it('generateVapidKeys gera par de chaves validas', async () => {
    const { generateVapidKeys } = await import('@/lib/push/web-push-server');
    const keys = generateVapidKeys();

    // VAPID keys sao base64 url-safe; tamanho minimo 80 chars
    expect(keys.publicKey).toMatch(/^[A-Za-z0-9_-]{80,}$/);
    expect(keys.privateKey).toMatch(/^[A-Za-z0-9_-]{30,}$/);
    // Public e private devem ser diferentes
    expect(keys.publicKey).not.toBe(keys.privateKey);
  });

  it('getPublicVapidKey lanca erro quando env nao configurada', async () => {
    const prev = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    delete process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    const { getPublicVapidKey } = await import('@/lib/push/web-push-server');
    expect(() => getPublicVapidKey()).toThrow(/NEXT_PUBLIC_VAPID_PUBLIC_KEY/);

    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = prev;
  });

  it('getPublicVapidKey retorna o valor de env quando configurada', async () => {
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = 'BPublic-test-key-1234567890';
    const { getPublicVapidKey } = await import('@/lib/push/web-push-server');
    expect(getPublicVapidKey()).toBe('BPublic-test-key-1234567890');
  });
});
