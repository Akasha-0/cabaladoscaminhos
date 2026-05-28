import { describe, it, expect } from 'vitest';
import { SignJWT } from 'jose';

describe('JWT Debug 6 - Fix Uint8Array', () => {
  it('use global Uint8Array directly', async () => {
    const secretStr = 'test-secret-key-that-is-at-least-32-bytes-long';
    // Use the global Uint8Array constructor explicitly
    const secret = new Uint8Array([...secretStr].map(c => c.charCodeAt(0)));
    
    console.log('Using manual Uint8Array');
    console.log('secret instanceof Uint8Array:', secret instanceof Uint8Array);
    
    try {
      const token = await new SignJWT({ userId: 'test' })
        .setProtectedHeader({ alg: 'HS256' })
        .sign(secret);
      console.log('Token:', token);
      expect(token).toBeDefined();
    } catch (e) {
      console.log('Error:', e.message);
      throw e;
    }
  });

  it('use Buffer directly', async () => {
    const secret = Buffer.from('test-secret-key-that-is-at-least-32-bytes-long');
    
    console.log('Using Buffer');
    console.log('secret:', typeof secret);
    
    try {
      const token = await new SignJWT({ userId: 'test' })
        .setProtectedHeader({ alg: 'HS256' })
        .sign(secret);
      console.log('Token:', token);
      expect(token).toBeDefined();
    } catch (e) {
      console.log('Error:', e.message);
      throw e;
    }
  });
});
