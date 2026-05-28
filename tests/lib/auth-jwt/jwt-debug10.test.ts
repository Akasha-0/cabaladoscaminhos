import { describe, it, expect } from 'vitest';

describe('JWT Debug 10', () => {
  it('check TextEncoder identity', async () => {
    const encoded = new TextEncoder().encode('test');
    console.log('encoded instanceof Uint8Array:', encoded instanceof Uint8Array);
    console.log('encoded instanceof globalThis.Uint8Array:', encoded instanceof globalThis.Uint8Array);
    
    // Check the constructor reference
    console.log('encoded.constructor:', encoded.constructor);
    console.log('globalThis.Uint8Array:', globalThis.Uint8Array);
    console.log('Same constructor?', encoded.constructor === globalThis.Uint8Array);
  });
});
