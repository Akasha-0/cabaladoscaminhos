import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('JWT Debug 7 - Crypto check', () => {
  it('check crypto object', async () => {
    console.log('crypto:', typeof crypto);
    console.log('crypto.subtle:', typeof crypto.subtle);
    console.log('crypto.getRandomValues:', typeof crypto.getRandomValues);
    
    // Try importing jose and checking its internals
    const jose = await import('jose');
    console.log('jose cryptoRuntime:', jose.cryptoRuntime);
    
    // Check if jose's SignJWT uses the right crypto
    console.log('SignJWT source check');
  });

  it('try direct crypto call', async () => {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode('test-secret-key-that-is-at-least-32-bytes-long'),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    console.log('Key imported:', !!key);
    expect(key).toBeDefined();
  });
});
