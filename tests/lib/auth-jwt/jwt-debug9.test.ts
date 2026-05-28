import { describe, it, expect } from 'vitest';

describe('JWT Debug 9 - Global checks', () => {
  it('check global Uint8Array identity', async () => {
    const localUint8 = new Uint8Array(5);
    const globalUint8 = globalThis.Uint8Array;
    
    console.log('local === global:', localUintArray.constructor === globalUint8);
    console.log('localUint8 instanceof globalUint8:', localUint8 instanceof globalUint8);
    console.log('Object.prototype.toString.call(localUint8):', Object.prototype.toString.call(localUint8));
    
    const encoded = new TextEncoder().encode('test');
    console.log('encoded instanceof Uint8Array:', encoded instanceof Uint8Array);
    console.log('encoded instanceof globalThis.Uint8Array:', encoded instanceof globalThis.Uint8Array);
    console.log('encoded.constructor:', encoded.constructor.name);
    console.log('encoded.constructor === Uint8Array:', encoded.constructor === Uint8Array);
    
    // Check Buffer
    const buffer = Buffer.from('test');
    console.log('\nBuffer:');
    console.log('buffer instanceof Uint8Array:', buffer instanceof Uint8Array);
  });

  it('check jose internals', async () => {
    const { encoder } = await import('jose/dist/webapi/lib/buffer_utils.js');
    console.log('jose encoder:', typeof encoder);
    
    const encoded = encoder.encode('test');
    console.log('jose encoded:', encoded.constructor.name);
    console.log('jose encoded instanceof Uint8Array:', encoded instanceof Uint8Array);
  });
});
