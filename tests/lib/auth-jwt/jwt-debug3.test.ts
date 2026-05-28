import { describe, it, expect } from 'vitest';
import { SignJWT } from 'jose';

describe('JWT Debug 3', () => {
  const secret = new TextEncoder().encode('test-secret-key-that-is-at-least-32-bytes-long');
  
  it('minimal: just sign', async () => {
    const token = await new SignJWT({ userId: 'test' })
      .setProtectedHeader({ alg: 'HS256' })
      .sign(secret);
    console.log('Minimal: OK');
    expect(token).toBeDefined();
  });

  it('with setIssuedAt', async () => {
    const token = await new SignJWT({ userId: 'test' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .sign(secret);
    console.log('With setIssuedAt: OK');
    expect(token).toBeDefined();
  });

  it('with setExpirationTime', async () => {
    try {
      const token = await new SignJWT({ userId: 'test' })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('24h')
        .sign(secret);
      console.log('With setExpirationTime: OK');
      expect(token).toBeDefined();
    } catch (e) {
      console.log('With setExpirationTime ERROR:', e.message);
      throw e;
    }
  });
});
