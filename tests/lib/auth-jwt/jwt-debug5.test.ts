import { describe, it, expect } from 'vitest';
import { SignJWT } from 'jose';

describe('JWT Debug 5 - Check jose internals', () => {
  it('check what sign receives', async () => {
    const secret = new TextEncoder().encode('test-secret-key-that-is-at-least-32-bytes-long');
    
    // Create a wrapper to intercept the sign call
    const originalSign = secret.constructor.prototype.constructor;
    
    // Log all details
    console.log('secret:', secret);
    console.log('secret.buffer:', secret.buffer);
    console.log('secret instanceof Uint8Array:', secret instanceof Uint8Array);
    
    try {
      const token = await new SignJWT({ userId: 'test' })
        .setProtectedHeader({ alg: 'HS256' })
        .sign(secret);
      console.log('Token:', token);
      expect(token).toBeDefined();
    } catch (e) {
      console.log('Error name:', e.name);
      console.log('Error message:', e.message);
      console.log('Error constructor:', e.constructor.name);
      throw e;
    }
  });
});
