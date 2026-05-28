import { describe, it, expect } from 'vitest';
import { SignJWT } from 'jose';

describe('JWT Debug 11 - Direct SignJWT with logging', () => {
  it('test SignJWT with console.log', async () => {
    const secret = new TextEncoder().encode('test-secret-key-that-is-at-least-32-bytes-long');
    
    console.log('Testing SignJWT...');
    console.log('secret:', secret);
    console.log('secret.buffer:', secret.buffer);
    console.log('secret.constructor:', secret.constructor.name);
    console.log('secret instanceof Uint8Array:', secret instanceof Uint8Array);
    console.log('globalThis.Uint8Array:', globalThis.Uint8Array.name);
    
    const jwt = new SignJWT({ userId: 'test' })
      .setProtectedHeader({ alg: 'HS256' });
    
    console.log('SignJWT instance created');
    
    try {
      const token = await jwt.sign(secret);
      console.log('Token created:', token.slice(0, 30) + '...');
      expect(token).toBeDefined();
    } catch (e: any) {
      console.log('Error during sign():', e.message);
      throw e;
    }
  });
});
