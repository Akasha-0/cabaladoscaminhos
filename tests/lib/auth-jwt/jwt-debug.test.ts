import { describe, it, expect, vi } from 'vitest';
import { SignJWT } from 'jose';

describe('JWT Debug', () => {
  it('should debug jose', async () => {
    console.log('crypto.subtle:', typeof crypto.subtle);
    console.log('crypto:', typeof crypto);
    
    const jose = await import('jose');
    console.log('cryptoRuntime:', jose.cryptoRuntime);
    
    const secret = new TextEncoder().encode('test-secret-key-that-is-at-least-32-bytes-long');
    console.log('secret type:', secret.constructor.name);
    
    try {
      const token = await new SignJWT({ userId: 'test' })
        .setProtectedHeader({ alg: 'HS256' })
        .sign(secret);
      console.log('Token created!');
      expect(token).toBeDefined();
    } catch (e) {
      console.log('Error:', e.message);
      throw e;
    }
  });
});
