import { describe, it, expect } from 'vitest';
import { SignJWT } from 'jose';

describe('JWT Debug 4', () => {
  it('minimal with assertion', async () => {
    const secret = new TextEncoder().encode('test-secret-key-that-is-at-least-32-bytes-long');
    const token = await new SignJWT({ userId: 'test' })
      .setProtectedHeader({ alg: 'HS256' })
      .sign(secret);
    expect(token).toBeDefined();
  });
});
