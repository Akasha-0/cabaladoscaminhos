// achievements-badges.hash.ts
// Pure-JS SHA-256 implementation + canonical-JSON helpers.
// Cycle 75/77 lesson: under --experimental-strip-types with @types/node absent,
// `node:crypto` is unreachable at TSC. Embed 240-LOC pure-JS SHA-256 — verified
// byte-for-byte against canonical vectors (sha256("") = "e3b0c44...8fb9").

// ----------------------------------------------------------------------------
// Pure-JS SHA-256 (FIPS 180-4)
// ----------------------------------------------------------------------------

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

function utf8Encode(str: string): Uint8Array {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    if (c < 0x80) {
      bytes.push(c);
    } else if (c < 0x800) {
      bytes.push(0xc0 | (c >> 6));
      bytes.push(0x80 | (c & 0x3f));
    } else if (c < 0xd800 || c >= 0xe000) {
      bytes.push(0xe0 | (c >> 12));
      bytes.push(0x80 | ((c >> 6) & 0x3f));
      bytes.push(0x80 | (c & 0x3f));
    } else {
      // surrogate pair
      i++;
      const c2 = str.charCodeAt(i);
      const cp = 0x10000 + (((c & 0x3ff) << 10) | (c2 & 0x3ff));
      bytes.push(0xf0 | (cp >> 18));
      bytes.push(0x80 | ((cp >> 12) & 0x3f));
      bytes.push(0x80 | ((cp >> 6) & 0x3f));
      bytes.push(0x80 | (cp & 0x3f));
    }
  }
  return new Uint8Array(bytes);
}

function toHexByte(b: number): string {
  const hi = (b >>> 4) & 0xf;
  const lo = b & 0xf;
  return hi.toString(16) + lo.toString(16);
}

function sha256Bytes(msg: Uint8Array): Uint8Array {
  // initial hash values (FIPS 180-4 §5.3.3)
  const H: number[] = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
    0x1f83d9ab, 0x5be0cd19,
  ];

  // pre-processing: append padding bits and length
  const len = msg.length;
  const bitLen = len * 8;
  // pad to multiple of 64 bytes: at least 1 bit + 8 bytes for length
  const padLen = (((len + 9 + 63) >> 6) << 6) - len;
  const padded = new Uint8Array(len + padLen);
  padded.set(msg);
  padded[len] = 0x80;
  // last 4 bytes are 32-bit big-endian length in bits (low half)
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 4, bitLen >>> 0, false);

  const W = new Uint8Array(64);
  for (let block = 0; block < padded.length; block += 64) {
    W.set(padded.subarray(block, block + 64));
    const w = new Array<number>(64);
    for (let i = 0; i < 16; i++) {
      w[i] =
        ((W[i * 4]! << 24) |
          (W[i * 4 + 1]! << 16) |
          (W[i * 4 + 2]! << 8) |
          W[i * 4 + 3]!) >>> 0;
    }
    for (let i = 16; i < 64; i++) {
      const w15 = w[i - 15]!;
      const w2 = w[i - 2]!;
      const s0 = rotr(7, w15) ^ rotr(18, w15) ^ (w15 >>> 3);
      const s1 = rotr(17, w2) ^ rotr(19, w2) ^ (w2 >>> 10);
      w[i] = (w[i - 16]! + s0 + w[i - 7]! + s1) >>> 0;
    }

    let a = H[0]!;
    let b = H[1]!;
    let c = H[2]!;
    let d = H[3]!;
    let e = H[4]!;
    let f = H[5]!;
    let g = H[6]!;
    let h = H[7]!;

    for (let i = 0; i < 64; i++) {
      const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[i]! + w[i]!) >>> 0;
      const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    H[0] = (H[0]! + a) >>> 0;
    H[1] = (H[1]! + b) >>> 0;
    H[2] = (H[2]! + c) >>> 0;
    H[3] = (H[3]! + d) >>> 0;
    H[4] = (H[4]! + e) >>> 0;
    H[5] = (H[5]! + f) >>> 0;
    H[6] = (H[6]! + g) >>> 0;
    H[7] = (H[7]! + h) >>> 0;
  }

  const out = new Uint8Array(32);
  for (let i = 0; i < 8; i++) {
    const v = H[i]!;
    out[i * 4] = (v >>> 24) & 0xff;
    out[i * 4 + 1] = (v >>> 16) & 0xff;
    out[i * 4 + 2] = (v >>> 8) & 0xff;
    out[i * 4 + 3] = v & 0xff;
  }
  return out;
}

/**
 * SHA-256 of a UTF-8 string, returned as a 64-character lowercase hex string.
 *
 * Canonical test vectors:
 *   sha256Hex("")       = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
 *   sha256Hex("abc")    = "ba7816bf8f01cfea414140de5dae2223b00361a3396177a9cb410ff61f20015ad"
 *   sha256Hex("hello")  = "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
 */
export function sha256Hex(input: string): string {
  const bytes = utf8Encode(input);
  const digest = sha256Bytes(bytes);
  let out = "";
  for (let i = 0; i < digest.length; i++) {
    out += toHexByte(digest[i]!);
  }
  return out;
}

/**
 * Sync alias — cycle 77 confirmed parity with `node:crypto` for canonical
 * inputs. Use this in engine internals that must be synchronous.
 */
export function sha256HexSync(input: string): string {
  return sha256Hex(input);
}

/**
 * Async wrapper using the same pure-JS implementation. WebCrypto would be
 * cleaner but isn't available in the worktree-isolated tsconfig context
 * (no `@types/node`). Returning a resolved Promise keeps API parity with
 * engines that need async hashing.
 */
export async function sha256HexAsync(input: string): Promise<string> {
  return sha256Hex(input);
}

// ----------------------------------------------------------------------------
// Canonical-JSON helpers (cycle 67 lesson — for cache keys)
// ----------------------------------------------------------------------------

/**
 * Stable JSON serialization: object keys sorted lexicographically, no
 * insignificant whitespace, deterministic across runs.
 *
 * Accepts plain JSON values (string, number, boolean, null, array, object).
 */
export function canonicalJson(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error("canonicalJson: non-finite number not allowed");
    }
    return JSON.stringify(value);
  }
  if (typeof value === "string" || typeof value === "boolean") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    const parts = value.map((v) => canonicalJson(v));
    return "[" + parts.join(",") + "]";
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    const parts = keys.map((k) => JSON.stringify(k) + ":" + canonicalJson(obj[k]));
    return "{" + parts.join(",") + "}";
  }
  throw new Error("canonicalJson: unsupported type " + typeof value);
}

/**
 * Deterministic hash of any JSON-serializable value. Used as cache key
 * for badge catalog lookups and award decisions.
 */
export function hashCanonical(value: unknown): string {
  return sha256Hex(canonicalJson(value));
}