import { describe, it, expect } from 'vitest';
import { SignJWT } from 'jose';

describe('JWT Debug 2', () => {
  it('should debug with different payload types', async () => {
    const secret = new TextEncoder().encode('test-secret-key-that-is-at-least-32-bytes-long');
    
    // Try empty payload
    try {
      const token = await new SignJWT()
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .sign(secret);
      console.log('Empty payload: OK');
    } catch (e) {
      console.log('Empty payload error:', e.message);
    }
    
    // Try plain object
    try {
      const token = await new SignJWT({userId: '123'})
        .setProtectedHeader({ alg: 'HS256' })
        .sign(secret);
      console.log('Plain object: OK');
    } catch (e) {
      console.log('Plain object error:', e.message);
    }
    
    // Try string
    try {
      const token = await new SignJWT('test' as any)
        .setProtectedHeader({ alg: 'HS256' })
        .sign(secret);
      console.log('String: OK');
    } catch (e) {
      console.log('String error:', e.message);
    }
    
    expect(true).toBe(true);
  });
});
