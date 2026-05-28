import { describe, it, expect } from 'vitest';

describe('JWT Debug 12 - Node environment', () => {
  it('test in node env', async () => {
    const { SignJWT } = await import('jose');
    const secret = new TextEncoder().encode('test-secret-key-that-is-at-least-32-bytes-long');
    
    console.log('In node env:');
    console.log('secret instanceof Uint8Array:', secret instanceof Uint8Array);
    
    try {
      const token = await new SignJWT({ userId: 'test' })
        .setProtectedHeader({ alg: 'HS256' })
        .sign(secret);
      console.log('Token created:', token.slice(0, 30) + '...');
      expect(token).toBeDefined();
    } catch (e: any) {
      console.log('Error:', e.message);
      throw e;
    }
  });
});
