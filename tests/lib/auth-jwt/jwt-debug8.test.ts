import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('JWT Debug 8 - Crypto identity', () => {
  it('check if jose uses the right crypto', async () => {
    const originalCrypto = globalThis.crypto;
    const jose = await import('jose');
    
    console.log('jose cryptoRuntime:', jose.cryptoRuntime);
    
    // The jose library reports WebCryptoAPI but internally might use a different crypto
    // Check if there are multiple crypto objects
    console.log('global crypto === window.crypto:', globalThis.crypto === (globalThis as any).window?.crypto);
    
    // Try to see what jose's FlattenedSign class expects
    const { FlattenedSign } = jose;
    console.log('FlattenedSign:', typeof FlattenedSign);
  });

  it('mock crypto.subtle to see what jose passes', async () => {
    const calls: any[] = [];
    
    const mockSubtle = {
      ...globalThis.crypto.subtle,
      importKey: vi.fn(async (...args: any[]) => {
        calls.push(args);
        console.log('importKey called with:', args[0], typeof args[1], args[1]?.constructor?.name);
        return globalThis.crypto.subtle.importKey.apply(globalThis.crypto.subtle, args as any);
      }),
      sign: vi.fn(async (...args: any[]) => {
        calls.push(args);
        console.log('sign called');
        return globalThis.crypto.subtle.sign.apply(globalThis.crypto.subtle, args as any);
      }),
    };
    
    // Save original and replace
    const origSubtle = globalThis.crypto.subtle;
    (globalThis.crypto as any).subtle = mockSubtle;
    
    try {
      const secret = new TextEncoder().encode('test-secret-key-that-is-at-least-32-bytes-long');
      const { SignJWT } = await import('jose');
      
      const token = await new SignJWT({ userId: 'test' })
        .setProtectedHeader({ alg: 'HS256' })
        .sign(secret);
      
      console.log('Token created (via mock):', !!token);
      console.log('importKey calls:', calls.length);
    } catch (e: any) {
      console.log('Error:', e.message);
    } finally {
      globalThis.crypto.subtle = origSubtle;
    }
    
    expect(true).toBe(true);
  });
});
