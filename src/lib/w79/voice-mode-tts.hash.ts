// Pure-JS SHA-256 (~140 LOC, byte-identical to node:crypto).
// Used by sacred-sound-ui engine for deterministic hash of canonical JSON.
const K: ReadonlyArray<number> = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
  0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];
function rotr(n: number, x: number): number {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}
function utf8Encode(input: string): Uint8Array {
  const out: number[] = [];
  for (let i = 0; i < input.length; i++) {
    let c = input.charCodeAt(i);
    if (c < 0x80) { out.push(c); }
    else if (c < 0x800) { out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f)); }
    else if ((c & 0xfc00) === 0xd800 && i + 1 < input.length) {
      const c2 = input.charCodeAt(i + 1);
      if ((c2 & 0xfc00) === 0xdc00) {
        const cp = 0x10000 + (((c & 0x3ff) << 10) | (c2 & 0x3ff));
        out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
        i++;
      } else { out.push(0xef, 0xbf, 0xbd); }
    } else { out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f)); }
  }
  return new Uint8Array(out);
}
function toHex(n: number): string {
  const h = (n >>> 0).toString(16);
  return '00000000'.slice(h.length) + h;
}
export function sha256HexSync(input: string): string {
  const bytes = utf8Encode(input);
  const len = bytes.length;
  const bitLen = len * 8;
  const padded = new Uint8Array(((len + 9 + 63) >> 6) << 6);
  padded.set(bytes);
  padded[len] = 0x80;
  const dv = new DataView(padded.buffer);
  dv.setUint32(padded.length - 4, bitLen >>> 0, false);
  dv.setUint32(padded.length - 8, Math.floor(bitLen / 0x100000000), false);
  const H: number[] = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const W = new Uint8Array(64);
  for (let off = 0; off < padded.length; off += 64) {
    for (let i = 0; i < 16; i++) {
      W[i * 4] = padded[off + i * 4] ?? 0;
      W[i * 4 + 1] = padded[off + i * 4 + 1] ?? 0;
      W[i * 4 + 2] = padded[off + i * 4 + 2] ?? 0;
      W[i * 4 + 3] = padded[off + i * 4 + 3] ?? 0;
    }
    const w = new Array<number>(64).fill(0);
    for (let i = 0; i < 16; i++) {
      w[i] = ((W[i * 4] ?? 0) << 24) | ((W[i * 4 + 1] ?? 0) << 16) | ((W[i * 4 + 2] ?? 0) << 8) | (W[i * 4 + 3] ?? 0);
      w[i] = w[i] ?? 0;
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(7, w[i - 15] ?? 0) ^ rotr(18, w[i - 15] ?? 0) ^ ((w[i - 15] ?? 0) >>> 3);
      const s1 = rotr(17, w[i - 2] ?? 0) ^ rotr(19, w[i - 2] ?? 0) ^ ((w[i - 2] ?? 0) >>> 10);
      w[i] = ((w[i - 16] ?? 0) + s0 + (w[i - 7] ?? 0) + s1) >>> 0;
    }
    let a = H[0] ?? 0, b = H[1] ?? 0, c = H[2] ?? 0, d = H[3] ?? 0;
    let e = H[4] ?? 0, f = H[5] ?? 0, g = H[6] ?? 0, h = H[7] ?? 0;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + (K[i] ?? 0) + (w[i] ?? 0)) >>> 0;
      const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
      const mj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + mj) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0;
      d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    H[0] = ((H[0] ?? 0) + a) >>> 0;
    H[1] = ((H[1] ?? 0) + b) >>> 0;
    H[2] = ((H[2] ?? 0) + c) >>> 0;
    H[3] = ((H[3] ?? 0) + d) >>> 0;
    H[4] = ((H[4] ?? 0) + e) >>> 0;
    H[5] = ((H[5] ?? 0) + f) >>> 0;
    H[6] = ((H[6] ?? 0) + g) >>> 0;
    H[7] = ((H[7] ?? 0) + h) >>> 0;
  }
  return toHex(H[0] ?? 0) + toHex(H[1] ?? 0) + toHex(H[2] ?? 0) + toHex(H[3] ?? 0)
       + toHex(H[4] ?? 0) + toHex(H[5] ?? 0) + toHex(H[6] ?? 0) + toHex(H[7] ?? 0);
}
export async function sha256Hex(input: string): Promise<string> {
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle) {
    const enc = new TextEncoder();
    const buf = await globalThis.crypto.subtle.digest('SHA-256', enc.encode(input));
    let out = '';
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i++) {
      const h = ((bytes[i] ?? 0) >>> 0).toString(16);
      out += '00'.slice(h.length) + h;
    }
    return out;
  }
  return sha256HexSync(input);
}
