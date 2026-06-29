// =============================================================================
// W53 — REDACTION POLICY VAULT
// =============================================================================
//
// Encrypted-at-rest vault for redaction policies produced by
// w51/redaction-policy-builder and exported by w52/policy-export-portability.
//
// Architecture:
//   ┌────────────────────────────────────────────────────────────────────────┐
//   │                              VAULT                                     │
//   │                                                                        │
//   │   owner ──► KEK (Key Encryption Key, per-user, rotatable)               │
//   │              │                                                         │
//   │              ├──► wraps DEK₁ (per-policy, 256-bit)                     │
//   │              ├──► wraps DEK₂                                            │
//   │              └──► wraps DEK₃                                            │
//   │                       │                                                 │
//   │                       ▼                                                 │
//   │                  ciphertext + MAC  (HMAC-chain stream cipher)          │
//   │                                                                        │
//   │   actor (read) ──► KEK unwrap DEK ──► DEK decrypts ciphertext         │
//   │                                                                        │
//   │   share ──► grant wraps grantee-DEK with grantee-KEK                   │
//   │   revoke ──► drop grantee wrapping, ciphertext unchanged               │
//   │   rotate ──► new KEK, re-wrap all DEKs, old KEK kept for grace period  │
//   │                                                                        │
//   │   audit ──► every op appended, hash-chained, immutable                 │
//   │   LGPD  ──► consent gate, export-as-bundle, erasure with chain         │
//   │              placeholder                                                │
//   └────────────────────────────────────────────────────────────────────────┘
//
// Crypto choice (educational, NOT production-grade):
//   • SHA-256 implemented from scratch (no node:crypto, no external lib)
//   • HMAC-SHA256 for authentication
//   • Stream cipher: keystream = SHA-256(key ‖ counter) blocks
//   • Envelope encryption: DEK wrapped by KEK via the same primitive
//   • Auth tag: HMAC-SHA256 over (nonce ‖ ciphertext)
//
// This is by design. The shape is what matters:
//   • envelope(dek, kek) → wrappedDek
//   • unwrap(wrappedDek, kek) → dek
//   • encrypt(plaintext, dek) → ciphertext + tag + nonce
//   • decrypt(ciphertext, tag, nonce, dek) → plaintext
//
// A production deployment should swap these primitives for AES-256-GCM
// via Web Crypto API. The interfaces stay the same.
//
// Scope (W53, in priority order):
//   1. Vault record model (policy + metadata + envelope + version + audit)
//   2. Hand-rolled envelope encryption (DEK per-policy, KEK per-user)
//   3. Store/retrieve with on-the-fly decrypt + in-memory DEK cache
//   4. Key rotation (manual + 90d auto), grace-period KEK retention
//   5. Share grants (read), revocable
//   6. Audit log (actor + ts + reason, hash-chained, immutable)
//   7. Versioning (every store creates a version; retrieve latest or specific)
//   8. LGPD Art. 7/9/18 — consent, export-as-w52-bundle, erasure with chain
//      placeholder
//   9. Sacred-text policy — elevated KEK tier + dual-custody
//
// File-level guarantees:
//   • Zero imports from other repo files (self-contained)
//   • No `any` types
//   • TSC strict mode clean in isolation
//   • 100+ named exports
//   • 1800–2800 lines
//
// Convention:
//   • snake_case for file names (this file: redaction_policy_vault.ts)
//   • camelCase for functions, PascalCase for types
//   • All crypto functions return branded strings (Hex) for safety
//
// Dependencies: NONE. Only TypeScript + Web Crypto (via globalThis.crypto for
// a single helper used only in tests/example seeding; the main primitives
// are hand-rolled below).
// =============================================================================

// =============================================================================
// SECTION 0 — TYPE BRAND HELPERS (compile-time safety for hex/base64 strings)
// =============================================================================

declare const __hex: unique symbol;
declare const __b64: unique symbol;

export type Hex = string & { readonly [__hex]: true };
export type Base64 = string & { readonly [__b64]: true };

/**
 * A 256-bit DEK. Structurally a Hex of length 64; the alias is kept for
 * readability (semantic intent) and to allow future divergence (e.g. adding
 * tier metadata). DEK ↔ Hex are interchangeable via casts at call sites.
 */
export type DEK = Hex;

/**
 * A 256-bit KEK. Structurally a Hex of length 64. The tier is recorded in
 * KEKMetadata, not in the key bytes themselves.
 */
export type KEK = Hex;

/** RFC3339 timestamp string. */
export type Iso8601 = string & { readonly __iso: true };

const HEX_RE = /^[0-9a-f]+$/;
const B64_RE = /^[A-Za-z0-9+/]+=*$/;

export function isHex(s: string): s is Hex {
  return HEX_RE.test(s) && s.length % 2 === 0;
}

export function isBase64(s: string): s is Base64 {
  return B64_RE.test(s) && s.length % 4 === 0;
}

export function asHex(s: string): Hex {
  if (!isHex(s)) throw new Error(`not valid hex: ${s.slice(0, 8)}...`);
  return s as Hex;
}

export function asBase64(s: string): Base64 {
  if (!isBase64(s)) throw new Error(`not valid base64: ${s.slice(0, 8)}...`);
  return s as Base64;
}

export function asIso(s: string): Iso8601 {
  const t = Date.parse(s);
  if (Number.isNaN(t)) throw new Error(`not a valid ISO8601: ${s}`);
  return s as Iso8601;
}

export function nowIso(): Iso8601 {
  return new Date().toISOString() as Iso8601;
}

// =============================================================================
// SECTION 1 — HAND-ROLLED SHA-256
// =============================================================================
//
// Pure-JS SHA-256. Round constants K[0..63], initial hash H[0..7].
// Reference: FIPS PUB 180-4.
// =============================================================================

const SHA256_K: readonly number[] = [
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

const SHA256_H0: readonly number[] = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
  0x1f83d9ab, 0x5be0cd19,
];

function rotr(n: number, x: number): number {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

function utf8Bytes(s: string): Uint8Array {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(s);
  }
  const out: number[] = [];
  for (let i = 0; i < s.length; i++) {
    let c = s.charCodeAt(i);
    if (c < 0x80) out.push(c);
    else if (c < 0x800) {
      out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    } else if (c >= 0xd800 && c <= 0xdbff) {
      i++;
      const c2 = s.charCodeAt(i);
      c = 0x10000 + (((c & 0x3ff) << 10) | (c2 & 0x3ff));
      out.push(
        0xf0 | (c >> 18),
        0x80 | ((c >> 12) & 0x3f),
        0x80 | ((c >> 6) & 0x3f),
        0x80 | (c & 0x3f),
      );
    } else {
      out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    }
  }
  return Uint8Array.from(out);
}

function padBlock(block: Uint8Array, off: number, len: number): void {
  block[off + len] = 0x80;
  for (let i = len + 1; i < 56; i++) block[off + i] = 0;
  const bitLenHi = Math.floor((off * 8) / 0x100000000) >>> 0;
  const bitLenLo = ((off + len) * 8) >>> 0;
  block[off + 56] = (bitLenHi >>> 24) & 0xff;
  block[off + 57] = (bitLenHi >>> 16) & 0xff;
  block[off + 58] = (bitLenHi >>> 8) & 0xff;
  block[off + 59] = bitLenHi & 0xff;
  block[off + 60] = (bitLenLo >>> 24) & 0xff;
  block[off + 61] = (bitLenLo >>> 16) & 0xff;
  block[off + 62] = (bitLenLo >>> 8) & 0xff;
  block[off + 63] = bitLenLo & 0xff;
}

function processBlock(H: number[], block: Uint8Array, off: number): void {
  const W = new Array<number>(64);
  for (let i = 0; i < 16; i++) {
    W[i] =
      ((block[off + i * 4] << 24) |
        (block[off + i * 4 + 1] << 16) |
        (block[off + i * 4 + 2] << 8) |
        block[off + i * 4 + 3]) >>>
      0;
  }
  for (let i = 16; i < 64; i++) {
    const s0 = rotr(7, W[i - 15]) ^ rotr(18, W[i - 15]) ^ (W[i - 15] >>> 3);
    const s1 = rotr(17, W[i - 2]) ^ rotr(19, W[i - 2]) ^ (W[i - 2] >>> 10);
    W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0;
  }
  let a = H[0],
    b = H[1],
    c = H[2],
    d = H[3],
    e = H[4],
    f = H[5],
    g = H[6],
    h = H[7];
  for (let i = 0; i < 64; i++) {
    const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
    const ch = (e & f) ^ (~e & g);
    const T1 = (h + S1 + ch + SHA256_K[i] + W[i]) >>> 0;
    const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
    const mj = (a & b) ^ (a & c) ^ (b & c);
    const T2 = (S0 + mj) >>> 0;
    h = g;
    g = f;
    f = e;
    e = (d + T1) >>> 0;
    d = c;
    c = b;
    b = a;
    a = (T1 + T2) >>> 0;
  }
  H[0] = (H[0] + a) >>> 0;
  H[1] = (H[1] + b) >>> 0;
  H[2] = (H[2] + c) >>> 0;
  H[3] = (H[3] + d) >>> 0;
  H[4] = (H[4] + e) >>> 0;
  H[5] = (H[5] + f) >>> 0;
  H[6] = (H[6] + g) >>> 0;
  H[7] = (H[7] + h) >>> 0;
}

/** Hand-rolled SHA-256. Returns lowercase hex digest. */
export function sha256(input: string | Uint8Array): Hex {
  const data = typeof input === 'string' ? utf8Bytes(input) : input;
  const H = SHA256_H0.slice();
  const block = new Uint8Array(64);
  let off = 0;
  while (data.length - off >= 64) {
    processBlock(H, data, off);
    off += 64;
  }
  const rem = data.length - off;
  for (let i = 0; i < rem; i++) block[i] = data[off + i];
  if (rem < 56) {
    padBlock(block, 0, rem);
  } else {
    padBlock(block, 0, rem);
    processBlock(H, block, 0);
    block.fill(0);
    padBlock(block, 0, 0);
  }
  processBlock(H, block, 0);
  let hex = '';
  for (let i = 0; i < 8; i++) {
    hex += H[i].toString(16).padStart(8, '0');
  }
  return hex as Hex;
}

/** SHA-256 of a hex string (treated as raw bytes). */
export function sha256Hex(input: Hex): Hex {
  const out = new Uint8Array(input.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(input.slice(i * 2, i * 2 + 2), 16);
  }
  return sha256(out);
}

/** Hex-encoded SHA-256, salted. */
export function sha256Salted(input: string, salt: Hex): Hex {
  return sha256(salt + input);
}

/** Double SHA-256 (used for audit chain). */
export function sha256Double(input: string | Uint8Array): Hex {
  return sha256(sha256(input));
}

/** SHA-256 in chunks, fed as a sequence of strings. */
export function sha256Concat(parts: readonly string[]): Hex {
  let acc = '';
  for (const p of parts) acc += p;
  return sha256(acc);
}

// =============================================================================
// SECTION 2 — HEX / BASE64 ENCODING
// =============================================================================

const HEX_CHARS = '0123456789abcdef';

export function bytesToHex(bytes: Uint8Array): Hex {
  let s = '';
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    s += HEX_CHARS[(b >> 4) & 0x0f] + HEX_CHARS[b & 0x0f];
  }
  return s as Hex;
}

export function hexToBytes(hex: Hex): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

// Hand-rolled base64 encoder (RFC 4648). Avoids depending on Buffer/btoa at
// runtime so this file works in both Node and browser contexts without
// @types/node.
const B64_ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function bytesToBase64(bytes: Uint8Array): Base64 {
  let out = '';
  let i = 0;
  for (; i + 2 < bytes.length; i += 3) {
    const a = bytes[i];
    const b = bytes[i + 1];
    const c = bytes[i + 2];
    out += B64_ALPHA[a >> 2];
    out += B64_ALPHA[((a & 0x03) << 4) | (b >> 4)];
    out += B64_ALPHA[((b & 0x0f) << 2) | (c >> 6)];
    out += B64_ALPHA[c & 0x3f];
  }
  if (i < bytes.length) {
    const a = bytes[i];
    const b = i + 1 < bytes.length ? bytes[i + 1] : 0;
    out += B64_ALPHA[a >> 2];
    out += B64_ALPHA[((a & 0x03) << 4) | (b >> 4)];
    out += i + 1 < bytes.length ? B64_ALPHA[(b & 0x0f) << 2] : '=';
    out += '=';
  }
  return out as Base64;
}

export function base64ToBytes(b64: Base64): Uint8Array {
  // Strip whitespace + padding markers and build reverse map.
  const clean = (b64 as string).replace(/[^A-Za-z0-9+/]/g, '');
  const out = new Uint8Array(Math.floor((clean.length * 6) / 8));
  let buf = 0;
  let bits = 0;
  let idx = 0;
  for (let i = 0; i < clean.length; i++) {
    const ch = clean.charCodeAt(i);
    let v: number;
    if (ch >= 65 && ch <= 90) v = ch - 65;
    else if (ch >= 97 && ch <= 122) v = ch - 71;
    else if (ch >= 48 && ch <= 57) v = ch + 4;
    else if (ch === 43) v = 62;
    else if (ch === 47) v = 63;
    else continue;
    buf = (buf << 6) | v;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out[idx++] = (buf >> bits) & 0xff;
    }
  }
  return out.slice(0, idx);
}

export function hexToBase64(hex: Hex): Base64 {
  return bytesToBase64(hexToBytes(hex));
}

export function base64ToHex(b64: Base64): Hex {
  return bytesToHex(base64ToBytes(b64));
}

export function stringToHex(s: string): Hex {
  return bytesToHex(utf8Bytes(s));
}

export function hexToString(hex: Hex): string {
  const bytes = hexToBytes(hex);
  if (typeof TextDecoder !== 'undefined') {
    return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  }
  let out = '';
  for (let i = 0; i < bytes.length; i++) out += String.fromCharCode(bytes[i]);
  return out;
}

export function base64ToString(b64: Base64): string {
  return hexToString(base64ToHex(b64));
}

export function stringToBase64(s: string): Base64 {
  return hexToBase64(stringToHex(s));
}

export function xorBytes(a: Uint8Array, b: Uint8Array): Uint8Array {
  const n = Math.min(a.length, b.length);
  const out = new Uint8Array(n);
  for (let i = 0; i < n; i++) out[i] = a[i] ^ b[i];
  return out;
}

// =============================================================================
// SECTION 3 — HMAC-SHA256
// =============================================================================

const IPAD = 0x36;
const OPAD = 0x5c;
const BLOCK_SIZE = 64;

function hmacInner(key: Uint8Array, message: Uint8Array): Hex {
  let k: Uint8Array;
  if (key.length > BLOCK_SIZE) {
    k = hexToBytes(sha256(key));
  } else if (key.length < BLOCK_SIZE) {
    k = new Uint8Array(BLOCK_SIZE);
    for (let i = 0; i < key.length; i++) k[i] = key[i];
  } else {
    k = key;
  }
  const inner = new Uint8Array(BLOCK_SIZE + message.length);
  const outer = new Uint8Array(BLOCK_SIZE + 32);
  for (let i = 0; i < BLOCK_SIZE; i++) {
    inner[i] = k[i] ^ IPAD;
    outer[i] = k[i] ^ OPAD;
  }
  for (let i = 0; i < message.length; i++) inner[BLOCK_SIZE + i] = message[i];
  const innerHash = hexToBytes(sha256(inner));
  for (let i = 0; i < 32; i++) outer[BLOCK_SIZE + i] = innerHash[i];
  return sha256(outer);
}

/** HMAC-SHA256 over a string message with a hex key. */
export function hmacSha256(key: Hex, message: string): Hex {
  return hmacInner(hexToBytes(key), utf8Bytes(message));
}

/** HMAC-SHA256 over raw bytes. */
export function hmacSha256Bytes(key: Hex, message: Uint8Array): Hex {
  return hmacInner(hexToBytes(key), message);
}

/** HMAC-SHA256 over a hex-encoded message. */
export function hmacSha256Hex(key: Hex, message: Hex): Hex {
  return hmacInner(hexToBytes(key), hexToBytes(message));
}

/** Constant-time hex comparison. */
export function constantTimeEqual(a: Hex, b: Hex): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) {
    r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return r === 0;
}

// =============================================================================
// SECTION 4 — STREAM CIPHER (keystream via SHA-256 counter mode)
// =============================================================================
//
// This is NOT AES. It is a teaching primitive that produces a keystream by
// repeatedly hashing (key ‖ counter ‖ nonce ‖ ad). Each block of keystream is
// 32 bytes (one SHA-256 output). Plaintext is XORed with the keystream. The
// auth tag is HMAC-SHA256 over (nonce ‖ ad ‖ ciphertext).
//
// SECURITY: this construction has known weaknesses (no IV-commitment, low
// diffusion per block). It is intentionally simple to read. Production must
// use AES-256-GCM via Web Crypto. The shapes and call sites transfer.
// =============================================================================

const KEYSTREAM_BLOCK = 32;
const DEFAULT_NONCE_BYTES = 16;

export interface Ciphertext {
  nonce: Hex;
  ad: Hex;
  body: Hex;
  tag: Hex;
}

export interface CipherOptions {
  ad?: string;
  nonce?: Hex;
}

function deriveKeystreamBlock(key: Hex, nonce: Hex, counter: number, ad: Hex): Hex {
  const ctrHex = counter.toString(16).padStart(16, '0');
  const message: Hex = `${nonce}${ctrHex}${ad}` as Hex;
  return hmacSha256Hex(key, message);
}

/** Encrypt plaintext with a key. Returns nonce + body + tag. */
export function encryptWithKey(
  key: Hex,
  plaintext: string,
  opts: CipherOptions = {},
): Ciphertext {
  const nonce =
    opts.nonce ?? (bytesToHex(randomBytes(DEFAULT_NONCE_BYTES)) as Hex);
  const ad = opts.ad ? stringToHex(opts.ad) : ('' as Hex);
  const ptBytes = utf8Bytes(plaintext);
  const out = new Uint8Array(ptBytes.length);
  let counter = 0;
  let offset = 0;
  while (offset < ptBytes.length) {
    const block = deriveKeystreamBlock(key, nonce, counter, ad);
    const blockBytes = hexToBytes(block);
    const n = Math.min(KEYSTREAM_BLOCK, ptBytes.length - offset);
    for (let i = 0; i < n; i++) out[offset + i] = ptBytes[offset + i] ^ blockBytes[i];
    offset += n;
    counter++;
  }
  const body = bytesToHex(out);
  const tagInput = (nonce as string) + (ad as string) + (body as string);
  const tag = hmacSha256(key, tagInput);
  return { nonce, ad, body, tag };
}

/** Decrypt a ciphertext blob using the same key. Throws on tag mismatch. */
export function decryptWithKey(
  key: Hex,
  ct: Ciphertext,
): string {
  const tagInput = (ct.nonce as string) + (ct.ad as string) + (ct.body as string);
  const expected = hmacSha256(key, tagInput);
  if (!constantTimeEqual(expected, ct.tag)) {
    throw new Error('decryptWithKey: auth tag mismatch (tampering or wrong key)');
  }
  const bodyBytes = hexToBytes(ct.body);
  const out = new Uint8Array(bodyBytes.length);
  let counter = 0;
  let offset = 0;
  while (offset < bodyBytes.length) {
    const block = deriveKeystreamBlock(key, ct.nonce, counter, ct.ad);
    const blockBytes = hexToBytes(block);
    const n = Math.min(KEYSTREAM_BLOCK, bodyBytes.length - offset);
    for (let i = 0; i < n; i++)
      out[offset + i] = bodyBytes[offset + i] ^ blockBytes[i];
    offset += n;
    counter++;
  }
  if (typeof TextDecoder !== 'undefined') {
    return new TextDecoder('utf-8', { fatal: false }).decode(out);
  }
  let s = '';
  for (let i = 0; i < out.length; i++) s += String.fromCharCode(out[i]);
  return s;
}

/** Encrypt arbitrary bytes. */
export function encryptBytes(key: Hex, data: Uint8Array, opts: CipherOptions = {}): Ciphertext {
  const nonce =
    opts.nonce ?? (bytesToHex(randomBytes(DEFAULT_NONCE_BYTES)) as Hex);
  const ad = opts.ad ? stringToHex(opts.ad) : ('' as Hex);
  const out = new Uint8Array(data.length);
  let counter = 0;
  let offset = 0;
  while (offset < data.length) {
    const block = deriveKeystreamBlock(key, nonce, counter, ad);
    const blockBytes = hexToBytes(block);
    const n = Math.min(KEYSTREAM_BLOCK, data.length - offset);
    for (let i = 0; i < n; i++) out[offset + i] = data[offset + i] ^ blockBytes[i];
    offset += n;
    counter++;
  }
  const body = bytesToHex(out);
  const tagInput = (nonce as string) + (ad as string) + (body as string);
  const tag = hmacSha256(key, tagInput);
  return { nonce, ad, body, tag };
}

export function decryptBytes(key: Hex, ct: Ciphertext): Uint8Array {
  const tagInput = (ct.nonce as string) + (ct.ad as string) + (ct.body as string);
  const expected = hmacSha256(key, tagInput);
  if (!constantTimeEqual(expected, ct.tag)) {
    throw new Error('decryptBytes: auth tag mismatch');
  }
  const bodyBytes = hexToBytes(ct.body);
  const out = new Uint8Array(bodyBytes.length);
  let counter = 0;
  let offset = 0;
  while (offset < bodyBytes.length) {
    const block = deriveKeystreamBlock(key, ct.nonce, counter, ct.ad);
    const blockBytes = hexToBytes(block);
    const n = Math.min(KEYSTREAM_BLOCK, bodyBytes.length - offset);
    for (let i = 0; i < n; i++)
      out[offset + i] = bodyBytes[offset + i] ^ blockBytes[i];
    offset += n;
    counter++;
  }
  return out;
}

// =============================================================================
// SECTION 5 — RANDOM BYTES (CSPRNG)
// =============================================================================
//
// We use globalThis.crypto.getRandomValues when available; otherwise we fall
// back to a hand-rolled counter-chained SHA-256 PRNG seeded by time. Both are
// sufficient for the educational scope. Production: Web Crypto only.
// =============================================================================

export function randomBytes(n: number): Uint8Array {
  if (n <= 0) throw new Error('randomBytes: n must be positive');
  if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.getRandomValues) {
    const out = new Uint8Array(n);
    globalThis.crypto.getRandomValues(out);
    return out;
  }
  // Soft fallback (NOT production): SHA-256 chain seeded by Date.now()
  const out = new Uint8Array(n);
  let seed = sha256(`prng-seed-${Date.now()}-${Math.random()}`);
  let i = 0;
  while (i < n) {
    seed = sha256(seed);
    const chunk = hexToBytes(seed);
    const take = Math.min(KEYSTREAM_BLOCK, n - i);
    for (let j = 0; j < take; j++) out[i + j] = chunk[j];
    i += take;
  }
  return out;
}

export function randomHex(n: number): Hex {
  return bytesToHex(randomBytes(n));
}

export function randomBase64(n: number): Base64 {
  return bytesToBase64(randomBytes(n));
}

// =============================================================================
// SECTION 6 — DEK / KEK LIFECYCLE
// =============================================================================

export type KEKTier = 'standard' | 'elevated' | 'sacred';

export interface KEKMetadata {
  tier: KEKTier;
  /** Identifier of the user owning this KEK. */
  ownerId: string;
  /** When this KEK was created. */
  createdAt: Iso8601;
  /** When this KEK expires (grace period end). null = no expiry. */
  retiredAt: Iso8601 | null;
  /** Monotonically increasing rotation counter. */
  generation: number;
  /** Human-readable label (e.g. "alice-2026-04"). */
  label: string;
}

/** Generate a fresh 256-bit DEK (hex). */
export function generateDEK(): DEK {
  return randomHex(32) as DEK;
}

/** Generate a fresh 256-bit KEK (hex), branded. */
export function generateKEK(): KEK {
  return randomHex(32) as KEK;
}

/** Generate a KEK with tier-specific metadata. */
export function generateKEKWithMetadata(
  ownerId: string,
  tier: KEKTier = 'standard',
  label?: string,
  generation: number = 1,
): { kek: KEK; meta: KEKMetadata } {
  const kek = generateKEK();
  const meta: KEKMetadata = {
    tier,
    ownerId,
    createdAt: nowIso(),
    retiredAt: null,
    generation,
    label: label ?? `${ownerId}-${tier}-gen${generation}`,
  };
  return { kek, meta };
}

/** Derive a tier-specific KEK from a master secret + owner. */
export function deriveKEK(masterSecret: Hex, ownerId: string, tier: KEKTier): KEK {
  const tierSalt = stringToHex(`${tier}::${ownerId}`);
  const inner = sha256Hex(masterSecret);
  const composed: Hex = `${inner}${tierSalt}` as Hex;
  return sha256Hex(composed);
}

/** Length-tagged KEK fingerprint (first 16 hex chars). */
export function kekFingerprint(kek: KEK): Hex {
  return sha256Hex(kek).slice(0, 16) as Hex;
}

/** Quick tier probe by fingerprint prefix (does not decode tier; for logs). */
export function kekShortLabel(kek: KEK): string {
  const fp = kekFingerprint(kek);
  return `kek:${fp.slice(0, 8)}`;
}

// =============================================================================
// SECTION 7 — ENVELOPE ENCRYPTION (wrap / unwrap)
// =============================================================================
//
// We treat DEK/KEK as hex strings and run the same stream cipher over them.
// The "plaintext" being wrapped is the DEK; the wrapping "key" is the KEK.
// The result is a Ciphertext whose body is the encrypted DEK. The nonce + tag
// are stored alongside so unwrap can verify authenticity.
// =============================================================================

export interface WrappedDEK {
  /** Envelope ciphertext of the DEK. */
  envelope: Ciphertext;
  /** Which KEK generation wrapped this DEK. */
  kekGeneration: number;
  /** Fingerprint of the wrapping KEK (for fast lookup). */
  kekFingerprint: Hex;
  /** Algorithm identifier (forward-compat). */
  alg: 'rpv1-stream-hmac';
}

export function wrapDEK(dek: DEK, kek: KEK, kekGeneration: number): WrappedDEK {
  const envelope = encryptWithKey(kek, dek as string, { ad: 'rpv1-wrap-dek' });
  return {
    envelope,
    kekGeneration,
    kekFingerprint: kekFingerprint(kek),
    alg: 'rpv1-stream-hmac',
  };
}

export function unwrapDEK(wrapped: WrappedDEK, kek: KEK): DEK {
  const fp = kekFingerprint(kek);
  if (fp !== wrapped.kekFingerprint) {
    throw new Error('unwrapDEK: KEK fingerprint mismatch');
  }
  const dek = decryptWithKey(kek, wrapped.envelope);
  if (!isHex(dek) || dek.length !== 64) {
    throw new Error('unwrapDEK: decrypted DEK not 256-bit hex');
  }
  return dek as DEK;
}

/** Re-wrap a DEK under a new KEK. Verifies the old wrap first. */
export function rewrapDEK(
  wrapped: WrappedDEK,
  oldKek: KEK,
  newKek: KEK,
  newGeneration: number,
): WrappedDEK {
  const dek = unwrapDEK(wrapped, oldKek);
  return wrapDEK(dek, newKek, newGeneration);
}

// =============================================================================
// SECTION 8 — REDACTION POLICY SHAPE (input contract for w51/w52)
// =============================================================================
//
// The vault does not import w51 or w52 directly. It accepts any payload that
// satisfies this structural shape. In practice, the w51 builder will emit a
// serialized policy matching RedactionPolicy, and w52 will read it back.
// =============================================================================

export type RedactionStrategy =
  | 'mask'
  | 'hash'
  | 'tokenize'
  | 'drop'
  | 'pseudonymize'
  | 'generalize'
  | 'suppress';

export type RedactionScope =
  | 'field'
  | 'record'
  | 'document'
  | 'stream'
  | 'pii-block';

export interface RedactionRule {
  /** Stable id within the policy. */
  ruleId: string;
  /** Match pattern: dot-path into the data object, or '*' wildcard. */
  path: string;
  /** Strategy to apply. */
  strategy: RedactionStrategy;
  /** Scope (where the rule applies). */
  scope: RedactionScope;
  /** Optional seed (for tokenize/hash strategies). */
  seed?: Hex;
  /** Optional pattern (regex source) for content-based redaction. */
  pattern?: string;
  /** Flag whether this rule touches sacred content. */
  sacred?: boolean;
  /** Human-readable explanation. */
  description?: string;
}

export interface RedactionPolicy {
  policyId: string;
  ownerId: string;
  name: string;
  version: number;
  rules: RedactionRule[];
  /** Tags for search/classification (e.g. ["lgpd", "finance", "sacred"]). */
  tags: string[];
  /** True if any rule touches sacred content. */
  sacred: boolean;
  /** Optional description. */
  description?: string;
  /** When the policy was created (ISO). */
  createdAt: Iso8601;
  /** ISO of last update. */
  updatedAt: Iso8601;
}

export interface W52ExportBundle {
  bundleId: string;
  policyId: string;
  format: 'json' | 'yaml' | 'tar';
  payload: string;
  /** Auxiliary files (e.g. README, manifest). */
  attachments: { name: string; content: string }[];
  signature: Hex;
  createdAt: Iso8601;
}

// =============================================================================
// SECTION 9 — VAULT RECORD MODEL
// =============================================================================

export interface VaultVersion {
  /** Monotonic version (1-based). */
  version: number;
  /** Wrapped DEK used to encrypt this version's ciphertext. */
  wrappedDEK: WrappedDEK;
  /** Ciphertext of the JSON-serialized policy. */
  ciphertext: Ciphertext;
  /** When this version was created. */
  createdAt: Iso8601;
  /** Actor who created it. */
  createdBy: string;
  /** Reason / changelog string. */
  reason: string;
  /** SHA-256 of the plaintext (for integrity proofs). */
  plaintextHash: Hex;
  /** Optional pointer to a w52 export bundle. */
  exportBundleId: string | null;
}

export interface VaultRecord {
  policyId: string;
  ownerId: string;
  /** All versions, oldest first. */
  versions: VaultVersion[];
  /** Currently active KEK fingerprint. */
  activeKekFingerprint: Hex;
  /** KEK metadata history. */
  kekHistory: KEKMetadata[];
  /** Sacred flag (inherited from latest policy). */
  sacred: boolean;
  /** When the record was created. */
  createdAt: Iso8601;
  /** Last update timestamp. */
  updatedAt: Iso8601;
  /** LGPD consent token id (proof of consent at store time). */
  consentTokenId: string | null;
  /** Erasure placeholder (set when erased; never deleted). */
  erasedAt: Iso8601 | null;
  /** Soft-purge: when true, the record exists only as a tombstone. */
  tombstone: boolean;
}

export function isErased(record: VaultRecord): boolean {
  return record.tombstone;
}

export function latestVersion(record: VaultRecord): VaultVersion | null {
  if (record.versions.length === 0) return null;
  return record.versions[record.versions.length - 1];
}

export function findVersion(record: VaultRecord, version: number): VaultVersion | null {
  return record.versions.find((v) => v.version === version) ?? null;
}

// =============================================================================
// SECTION 10 — AUDIT LOG
// =============================================================================

export type AuditAction =
  | 'store'
  | 'retrieve'
  | 'rotate-kek'
  | 'share-grant'
  | 'share-revoke'
  | 'erase'
  | 'export'
  | 'consent-grant'
  | 'consent-revoke'
  | 'version-prune'
  | 'dual-custody-attest';

export interface AuditEntry {
  /** Monotonic per-vault sequence (1-based). */
  seq: number;
  /** When the action happened. */
  at: Iso8601;
  /** Actor (user id, system, or 'system:rotation'). */
  actor: string;
  /** Action type. */
  action: AuditAction;
  /** Policy id (or '*' for global). */
  policyId: string;
  /** Free-form reason / context. */
  reason: string;
  /** Optional version number affected. */
  version: number | null;
  /** Hash of the previous entry (chain). */
  prevHash: Hex;
  /** Hash of this entry (chain). */
  hash: Hex;
}

export interface AuditLog {
  policyId: string;
  entries: AuditEntry[];
}

export function computeAuditHash(prev: AuditEntry | null, e: Omit<AuditEntry, 'hash'>): Hex {
  const prevHash = prev ? (prev.hash as string) : '0'.repeat(64);
  const payload =
    `${e.seq}|${e.at}|${e.actor}|${e.action}|${e.policyId}|${e.reason}|${e.version ?? 'null'}|${prevHash}`;
  return sha256(payload);
}

export function appendAudit(log: AuditLog, e: Omit<AuditEntry, 'seq' | 'hash' | 'prevHash'>): AuditEntry {
  const prev = log.entries.length > 0 ? log.entries[log.entries.length - 1] : null;
  const seq = log.entries.length + 1;
  const prevHash = prev ? prev.hash : ('0'.repeat(64) as Hex);
  const full: Omit<AuditEntry, 'hash'> = {
    seq,
    prevHash,
    ...e,
  };
  const hash = computeAuditHash(prev, full);
  const entry: AuditEntry = { ...full, hash };
  log.entries.push(entry);
  return entry;
}

export function verifyAuditChain(log: AuditLog): boolean {
  let prev: AuditEntry | null = null;
  for (let i = 0; i < log.entries.length; i++) {
    const e = log.entries[i];
    const expected = computeAuditHash(prev, {
      seq: e.seq,
      at: e.at,
      actor: e.actor,
      action: e.action,
      policyId: e.policyId,
      reason: e.reason,
      version: e.version,
      prevHash: e.prevHash,
    });
    if (expected !== e.hash) return false;
    if (prev && e.prevHash !== prev.hash) return false;
    if (e.seq !== i + 1) return false;
    prev = e;
  }
  return true;
}

export function auditTail(log: AuditLog, n: number): AuditEntry[] {
  return log.entries.slice(Math.max(0, log.entries.length - n));
}

export function auditFilter(log: AuditLog, action: AuditAction): AuditEntry[] {
  return log.entries.filter((e) => e.action === action);
}

export function auditByActor(log: AuditLog, actor: string): AuditEntry[] {
  return log.entries.filter((e) => e.actor === actor);
}

// =============================================================================
// SECTION 11 — SHARE GRANTS
// =============================================================================

export interface ShareGrant {
  grantId: string;
  policyId: string;
  granteeId: string;
  /** A copy of the DEK, wrapped with the grantee's KEK. */
  wrappedDEK: WrappedDEK;
  grantedAt: Iso8601;
  grantedBy: string;
  expiresAt: Iso8601 | null;
  revokedAt: Iso8601 | null;
  reason: string;
}

export function isGrantActive(g: ShareGrant): boolean {
  if (g.revokedAt) return false;
  if (!g.expiresAt) return true;
  return Date.parse(g.expiresAt) > Date.now();
}

export function generateGrantId(): string {
  return `grant_${randomHex(8)}`;
}

// =============================================================================
// SECTION 12 — IN-MEMORY DEK CACHE (hot reads)
// =============================================================================

export interface DEKCacheEntry {
  dek: DEK;
  cachedAt: Iso8601;
  hits: number;
  /** TTL in ms (0 = no expiry). */
  ttlMs: number;
}

export function isCacheEntryFresh(e: DEKCacheEntry): boolean {
  if (e.ttlMs <= 0) return true;
  return Date.now() - Date.parse(e.cachedAt) < e.ttlMs;
}

export interface DEKCache {
  byPolicy: Map<string, DEKCacheEntry>;
  maxSize: number;
  defaultTtlMs: number;
  hits: number;
  misses: number;
}

export function makeDEKCache(maxSize = 128, defaultTtlMs = 5 * 60 * 1000): DEKCache {
  return {
    byPolicy: new Map(),
    maxSize,
    defaultTtlMs,
    hits: 0,
    misses: 0,
  };
}

export function cacheGet(cache: DEKCache, policyId: string): DEK | null {
  const e = cache.byPolicy.get(policyId);
  if (!e) {
    cache.misses++;
    return null;
  }
  if (!isCacheEntryFresh(e)) {
    cache.byPolicy.delete(policyId);
    cache.misses++;
    return null;
  }
  e.hits++;
  cache.hits++;
  return e.dek;
}

export function cachePut(cache: DEKCache, policyId: string, dek: DEK): void {
  if (cache.byPolicy.size >= cache.maxSize) {
    // Evict the entry with the lowest hit count.
    let victim: string | null = null;
    let minHits = Infinity;
    for (const [k, v] of cache.byPolicy) {
      if (v.hits < minHits) {
        minHits = v.hits;
        victim = k;
      }
    }
    if (victim) cache.byPolicy.delete(victim);
  }
  cache.byPolicy.set(policyId, {
    dek,
    cachedAt: nowIso(),
    hits: 0,
    ttlMs: cache.defaultTtlMs,
  });
}

export function cacheInvalidate(cache: DEKCache, policyId: string): void {
  cache.byPolicy.delete(policyId);
}

export function cacheClear(cache: DEKCache): void {
  cache.byPolicy.clear();
}

export function cacheStats(cache: DEKCache): { size: number; hits: number; misses: number; hitRate: number } {
  const total = cache.hits + cache.misses;
  const hitRate = total === 0 ? 0 : cache.hits / total;
  return {
    size: cache.byPolicy.size,
    hits: cache.hits,
    misses: cache.misses,
    hitRate,
  };
}

// =============================================================================
// SECTION 13 — KEY RING (per-user KEK history with grace period)
// =============================================================================

export interface KeyRing {
  ownerId: string;
  entries: { meta: KEKMetadata; kek: KEK }[];
}

export function findActiveKEK(ring: KeyRing): { meta: KEKMetadata; kek: KEK } {
  const live = ring.entries
    .filter((e) => e.meta.retiredAt === null)
    .sort((a, b) => b.meta.generation - a.meta.generation);
  if (live.length === 0) throw new Error('findActiveKEK: no active KEK');
  return live[0];
}

export function findKEKByFingerprint(ring: KeyRing, fp: Hex): { meta: KEKMetadata; kek: KEK } | null {
  for (const entry of ring.entries) {
    if (kekFingerprint(entry.kek) === fp) return entry;
  }
  return null;
}

export function findKEKByGeneration(
  ring: KeyRing,
  generation: number,
): { meta: KEKMetadata; kek: KEK } | null {
  return ring.entries.find((e) => e.meta.generation === generation) ?? null;
}

export function pruneExpiredKEKs(ring: KeyRing, now: Iso8601 = nowIso()): number {
  const cutoff = Date.parse(now);
  let pruned = 0;
  ring.entries = ring.entries.filter((e) => {
    if (e.meta.retiredAt && Date.parse(e.meta.retiredAt) < cutoff) {
      pruned++;
      return false;
    }
    return true;
  });
  return pruned;
}

export function rotateKEK(ring: KeyRing, newLabel?: string): { meta: KEKMetadata; kek: KEK } {
  const active = findActiveKEK(ring);
  const nextGen = active.meta.generation + 1;
  const tier = active.meta.tier;
  const ownerId = active.meta.ownerId;
  const next = generateKEKWithMetadata(ownerId, tier, newLabel ?? `${ownerId}-${tier}-gen${nextGen}`, nextGen);
  // Mark the old KEK as retired but set retiredAt to a sentinel far-future
  // date so that pruneExpiredKEKs never accidentally drops it immediately
  // after rotation. Only rotateKEKWithGrace sets a real grace-expiry.
  active.meta.retiredAt = '9999-12-31T23:59:59.999Z' as Iso8601;
  ring.entries.push(next);
  return next;
}

/** Rotate with grace period (the old KEK stays usable for graceMs). */
export function rotateKEKWithGrace(
  ring: KeyRing,
  graceMs: number,
  newLabel?: string,
): { meta: KEKMetadata; kek: KEK } {
  const next = rotateKEK(ring, newLabel);
  // Schedule logical grace: store graceMs on retired entry (encoded as a
  // future ISO timestamp on retiredAt). For users who want explicit grace,
  // we instead shift retiredAt forward by graceMs.
  const retired = ring.entries[ring.entries.length - 2];
  if (retired) {
    const futureMs = Date.now() + graceMs;
    retired.meta.retiredAt = new Date(futureMs).toISOString() as Iso8601;
  }
  return next;
}

// =============================================================================
// SECTION 14 — SACRED-TEXT POLICY (elevated tier + dual-custody)
// =============================================================================

export interface DualCustodyAttestation {
  attestationId: string;
  policyId: string;
  custodianA: string;
  custodianB: string;
  attestedAt: Iso8601;
  /** Fingerprint of the KEK that was jointly released. */
  kekFingerprint: Hex;
  /** HMAC over (custodianA ‖ custodianB ‖ policyId ‖ kekFingerprint). */
  releaseTag: Hex;
}

export function generateAttestationId(): string {
  return `att_${randomHex(8)}`;
}

export function releaseSacredKEK(
  meta: KEKMetadata,
  kek: KEK,
  custodianA: string,
  custodianB: string,
  policyId: string,
): DualCustodyAttestation {
  if (meta.tier !== 'sacred') {
    throw new Error('releaseSacredKEK: KEK tier is not sacred');
  }
  const releaseTag = hmacSha256(kek, `${custodianA}|${custodianB}|${policyId}`);
  return {
    attestationId: generateAttestationId(),
    policyId,
    custodianA,
    custodianB,
    attestedAt: nowIso(),
    kekFingerprint: kekFingerprint(kek),
    releaseTag,
  };
}

export function verifyDualCustodyRelease(
  meta: KEKMetadata,
  kek: KEK,
  attestation: DualCustodyAttestation,
): boolean {
  const expected = hmacSha256(
    kek,
    `${attestation.custodianA}|${attestation.custodianB}|${attestation.policyId}`,
  );
  return constantTimeEqual(expected, attestation.releaseTag);
}

export function isSacred(meta: KEKMetadata): boolean {
  return meta.tier === 'sacred';
}

// =============================================================================
// SECTION 15 — LGPD COMPLIANCE — CONSENT, EXPORT, ERASURE
// =============================================================================

export interface LGPDConsent {
  consentId: string;
  userId: string;
  /** Purpose description (LGPD Art. 7). */
  purpose: string;
  /** Specific, explicit consent text the user agreed to. */
  text: string;
  /** When consent was given. */
  grantedAt: Iso8601;
  /** When consent was revoked (if applicable). */
  revokedAt: Iso8601 | null;
  /** IP / user-agent fingerprint at grant time (audit aid). */
  fingerprint: Hex;
}

export function generateConsentId(): string {
  return `consent_${randomHex(8)}`;
}

export function makeConsent(
  userId: string,
  purpose: string,
  text: string,
  fingerprintSeed: string,
): LGPDConsent {
  return {
    consentId: generateConsentId(),
    userId,
    purpose,
    text,
    grantedAt: nowIso(),
    revokedAt: null,
    fingerprint: sha256(fingerprintSeed),
  };
}

export function revokeConsent(c: LGPDConsent): LGPDConsent {
  return { ...c, revokedAt: nowIso() };
}

export function isConsentValid(c: LGPDConsent | null): boolean {
  if (!c) return false;
  return c.revokedAt === null;
}

export interface LGPDExportBundle {
  bundleId: string;
  ownerId: string;
  exportedAt: Iso8601;
  /** w52-compatible export (shape mirrors W52ExportBundle). */
  policies: W52ExportBundle[];
  /** Audit trail included in the export (LGPD Art. 18 V — confirmation). */
  auditTrail: AuditEntry[];
  /** Consent records at export time. */
  consents: LGPDConsent[];
  /** Format version. */
  format: 'lgpd-rpv1';
}

export function generateExportId(): string {
  return `exp_${randomHex(8)}`;
}

export function buildLGPDExport(
  ownerId: string,
  records: VaultRecord[],
  policies: Map<string, RedactionPolicy>,
  audits: Map<string, AuditLog>,
  consents: LGPDConsent[],
): LGPDExportBundle {
  const bundles: W52ExportBundle[] = [];
  for (const r of records) {
    if (r.ownerId !== ownerId) continue;
    const policy = policies.get(r.policyId);
    if (!policy) continue;
    const payload = JSON.stringify(policy, null, 2);
    const signature = sha256(payload + ownerId + r.policyId);
    bundles.push({
      bundleId: generateExportId(),
      policyId: r.policyId,
      format: 'json',
      payload,
      attachments: [],
      signature,
      createdAt: nowIso(),
    });
  }
  const trail: AuditEntry[] = [];
  for (const r of records) {
    if (r.ownerId !== ownerId) continue;
    const log = audits.get(r.policyId);
    if (log) trail.push(...log.entries);
  }
  return {
    bundleId: generateExportId(),
    ownerId,
    exportedAt: nowIso(),
    policies: bundles,
    auditTrail: trail,
    consents,
    format: 'lgpd-rpv1',
  };
}

export interface ErasureReceipt {
  receiptId: string;
  ownerId: string;
  erasedAt: Iso8601;
  policyIds: string[];
  /** Hash-chain continuation token (the next audit seq). */
  chainContinuationToken: Hex;
  /** Audit hash of the last entry before erasure. */
  lastPreErasureAuditHash: Hex;
}

export function generateReceiptId(): string {
  return `rcpt_${randomHex(8)}`;
}

/** Mark records erased (tombstone) without destroying the audit chain. */
export function eraseRecords(
  records: VaultRecord[],
  ownerId: string,
  audits: Map<string, AuditLog>,
  actor: string,
): ErasureReceipt {
  const policyIds: string[] = [];
  let lastHash: Hex = '0'.repeat(64) as Hex;
  for (const r of records) {
    if (r.ownerId !== ownerId) continue;
    r.versions = [];
    r.tombstone = true;
    r.erasedAt = nowIso();
    r.updatedAt = r.erasedAt;
    r.sacred = false;
    policyIds.push(r.policyId);
    const log = audits.get(r.policyId);
    if (log && log.entries.length > 0) {
      lastHash = log.entries[log.entries.length - 1].hash;
    }
    // Append a chain-continuation placeholder so the chain remains valid.
    if (log) {
      appendAudit(log, {
        at: nowIso(),
        actor,
        action: 'erase',
        policyId: r.policyId,
        reason: `LGPD Art. 18 VI erasure (placeholder)`,
        version: null,
      });
    }
  }
  const chainToken = sha256(lastHash + policyIds.join(',') + actor);
  return {
    receiptId: generateReceiptId(),
    ownerId,
    erasedAt: nowIso(),
    policyIds,
    chainContinuationToken: chainToken,
    lastPreErasureAuditHash: lastHash,
  };
}

// =============================================================================
// SECTION 16 — VAULT — ORCHESTRATOR
// =============================================================================
//
// The Vault class is the primary entry point. It owns:
//   • the in-memory DEK cache
//   • the per-user KeyRings
//   • the per-policy VaultRecord + AuditLog
//   • the per-grantee ShareGrants
//
// Persisting these structures is the caller's responsibility (typically
// Prisma + Postgres for records/audit, and an encrypted KV for KEKs). The
// vault provides serialize/deserialize helpers.
// =============================================================================

export interface VaultOptions {
  /** TTL for in-memory DEK cache (ms). */
  cacheTtlMs?: number;
  /** Max DEK cache entries. */
  cacheMaxSize?: number;
  /** KEK rotation interval (ms). 0 disables auto-rotation. */
  autoRotateMs?: number;
  /** Grace period after rotation (ms). */
  gracePeriodMs?: number;
}

export const DEFAULT_VAULT_OPTIONS: Required<VaultOptions> = {
  cacheTtlMs: 5 * 60 * 1000,
  cacheMaxSize: 128,
  autoRotateMs: 90 * 24 * 60 * 60 * 1000, // 90 days
  gracePeriodMs: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export interface VaultState {
  records: Map<string, VaultRecord>;
  keyRings: Map<string, KeyRing>;
  auditLogs: Map<string, AuditLog>;
  shareGrants: ShareGrant[];
  consents: Map<string, LGPDConsent>;
}

export function makeVaultState(): VaultState {
  return {
    records: new Map(),
    keyRings: new Map(),
    auditLogs: new Map(),
    shareGrants: [],
    consents: new Map(),
  };
}

export interface Vault {
  state: VaultState;
  cache: DEKCache;
  opts: Required<VaultOptions>;
}

export function makeVault(opts: VaultOptions = {}): Vault {
  const merged = { ...DEFAULT_VAULT_OPTIONS, ...opts };
  return {
    state: makeVaultState(),
    cache: makeDEKCache(merged.cacheMaxSize, merged.cacheTtlMs),
    opts: merged,
  };
}

// =============================================================================
// SECTION 17 — VAULT OPERATIONS — STORE / RETRIEVE
// =============================================================================

export interface StoreInput {
  policy: RedactionPolicy;
  actor: string;
  reason: string;
  /** Optional explicit KEK to use (else the user's active one). */
  kekOverride?: KEK;
  /** Skip cache write (used when caller wants to manage cache manually). */
  skipCache?: boolean;
}

export interface StoreResult {
  version: number;
  ciphertext: Ciphertext;
  wrappedDEK: WrappedDEK;
  plaintextHash: Hex;
}

export function getOrCreateKeyRing(v: Vault, ownerId: string, tier: KEKTier = 'standard'): KeyRing {
  let ring = v.state.keyRings.get(ownerId);
  if (!ring) {
    const initial = generateKEKWithMetadata(ownerId, tier);
    ring = { ownerId, entries: [initial] };
    v.state.keyRings.set(ownerId, ring);
    return ring;
  }
  // If the caller asks for a higher tier than what's currently active,
  // upgrade by generating a new sacred-tier KEK and retiring the existing
  // one (with sentinel far-future retiredAt so prune doesn't drop it).
  const active = findActiveKEK(ring);
  const tierRank = (t: KEKTier): number => (t === 'standard' ? 0 : t === 'elevated' ? 1 : 2);
  if (tierRank(tier) > tierRank(active.meta.tier)) {
    const nextGen = active.meta.generation + 1;
    const upgraded = generateKEKWithMetadata(
      ownerId,
      tier,
      `${ownerId}-${tier}-gen${nextGen}`,
      nextGen,
    );
    active.meta.retiredAt = '9999-12-31T23:59:59.999Z' as Iso8601;
    ring.entries.push(upgraded);
  }
  return ring;
}

export function getOrCreateRecord(v: Vault, policyId: string, ownerId: string): VaultRecord {
  let rec = v.state.records.get(policyId);
  if (!rec) {
    rec = {
      policyId,
      ownerId,
      versions: [],
      activeKekFingerprint: '0'.repeat(64) as Hex,
      kekHistory: [],
      sacred: false,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      consentTokenId: null,
      erasedAt: null,
      tombstone: false,
    };
    v.state.records.set(policyId, rec);
  }
  return rec;
}

export function getOrCreateAuditLog(v: Vault, policyId: string): AuditLog {
  let log = v.state.auditLogs.get(policyId);
  if (!log) {
    log = { policyId, entries: [] };
    v.state.auditLogs.set(policyId, log);
  }
  return log;
}

export function ensureConsent(v: Vault, ownerId: string, purpose: string, text: string, fingerprintSeed: string): LGPDConsent {
  const c = makeConsent(ownerId, purpose, text, fingerprintSeed);
  v.state.consents.set(c.consentId, c);
  return c;
}

/** Store a new version of a redaction policy (encrypted). */
export function storePolicy(v: Vault, input: StoreInput): StoreResult {
  if (!input.policy) throw new Error('storePolicy: policy is required');
  if (!input.actor) throw new Error('storePolicy: actor is required');
  const rec = getOrCreateRecord(v, input.policy.policyId, input.policy.ownerId);
  if (rec.tombstone) throw new Error('storePolicy: record is erased (LGPD)');

  const ring = getOrCreateKeyRing(v, input.policy.ownerId, input.policy.sacred ? 'sacred' : 'standard');
  const active = input.kekOverride
    ? { meta: ring.entries[0].meta, kek: input.kekOverride }
    : findActiveKEK(ring);

  // DEK is per-policy, regenerated on first store or on rotation
  let dek = cacheGet(v.cache, rec.policyId);
  if (!dek) {
    dek = generateDEK();
  }
  const wrapped = wrapDEK(dek, active.kek, active.meta.generation);

  const json = JSON.stringify(input.policy);
  const ciphertext = encryptWithKey(dek, json, { ad: `rpv1:${input.policy.policyId}` });
  const plaintextHash = sha256(json);

  const version: VaultVersion = {
    version: rec.versions.length + 1,
    wrappedDEK: wrapped,
    ciphertext,
    createdAt: nowIso(),
    createdBy: input.actor,
    reason: input.reason,
    plaintextHash,
    exportBundleId: null,
  };
  rec.versions.push(version);
  rec.activeKekFingerprint = kekFingerprint(active.kek);
  rec.kekHistory.push({ ...active.meta });
  rec.sacred = input.policy.sacred;
  rec.updatedAt = version.createdAt;

  if (!input.skipCache) cachePut(v.cache, rec.policyId, dek);

  const log = getOrCreateAuditLog(v, rec.policyId);
  appendAudit(log, {
    at: version.createdAt,
    actor: input.actor,
    action: 'store',
    policyId: rec.policyId,
    reason: input.reason,
    version: version.version,
  });

  return {
    version: version.version,
    ciphertext,
    wrappedDEK: wrapped,
    plaintextHash,
  };
}

export interface RetrieveInput {
  policyId: string;
  actor: string;
  reason: string;
  /** Specific version (latest if omitted). */
  version?: number;
  /** KEK to use for unwrap (else user's active KEK). */
  kekOverride?: KEK;
  /** When true, do not populate the DEK cache. */
  skipCache?: boolean;
}

export interface RetrieveResult {
  policy: RedactionPolicy;
  version: number;
  plaintextHash: Hex;
}

export function retrievePolicy(v: Vault, input: RetrieveInput): RetrieveResult {
  const rec = v.state.records.get(input.policyId);
  if (!rec) throw new Error(`retrievePolicy: unknown policyId ${input.policyId}`);
  if (rec.tombstone) throw new Error('retrievePolicy: record is erased (LGPD)');
  const target = input.version
    ? findVersion(rec, input.version)
    : latestVersion(rec);
  if (!target) throw new Error(`retrievePolicy: no version for ${input.policyId}`);

  // Resolve the KEK that wrapped this version
  const ring = v.state.keyRings.get(rec.ownerId);
  if (!ring) throw new Error('retrievePolicy: owner has no key ring');
  const kekEntry =
    findKEKByFingerprint(ring, target.wrappedDEK.kekFingerprint) ??
    (input.kekOverride
      ? { meta: ring.entries[0].meta, kek: input.kekOverride }
      : null);
  if (!kekEntry) {
    throw new Error('retrievePolicy: wrapped KEK not found in key ring');
  }

  // Try cache first, then unwrap
  let dek = cacheGet(v.cache, rec.policyId);
  if (!dek) {
    dek = unwrapDEK(target.wrappedDEK, kekEntry.kek);
    if (!input.skipCache) cachePut(v.cache, rec.policyId, dek);
  }

  const json = decryptWithKey(dek, target.ciphertext);
  const plaintextHash = sha256(json);
  if (plaintextHash !== target.plaintextHash) {
    throw new Error('retrievePolicy: plaintext hash mismatch (corrupted)');
  }
  const policy = JSON.parse(json) as RedactionPolicy;

  const log = getOrCreateAuditLog(v, rec.policyId);
  appendAudit(log, {
    at: nowIso(),
    actor: input.actor,
    action: 'retrieve',
    policyId: rec.policyId,
    reason: input.reason,
    version: target.version,
  });

  return { policy, version: target.version, plaintextHash };
}

// =============================================================================
// SECTION 18 — KEY ROTATION
// =============================================================================

export interface RotateInput {
  ownerId: string;
  actor: string;
  reason: string;
  /** Optional explicit grace period (ms). */
  gracePeriodMs?: number;
  /** Optional label for the new KEK. */
  newLabel?: string;
}

export interface RotateResult {
  newKekFingerprint: Hex;
  newGeneration: number;
  rewrapped: number;
  pruned: number;
  timestamp: Iso8601;
}

export function rotateOwnerKEK(v: Vault, input: RotateInput): RotateResult {
  const ring = v.state.keyRings.get(input.ownerId);
  if (!ring) throw new Error(`rotateOwnerKEK: unknown owner ${input.ownerId}`);
  const next = input.gracePeriodMs
    ? rotateKEKWithGrace(ring, input.gracePeriodMs, input.newLabel)
    : rotateKEK(ring, input.newLabel);

  // Re-wrap every DEK across every record owned by this user.
  let rewrapped = 0;
  for (const rec of v.state.records.values()) {
    if (rec.ownerId !== input.ownerId) continue;
    if (rec.tombstone) continue;
    for (const ver of rec.versions) {
      const oldKek = findKEKByFingerprint(ring, ver.wrappedDEK.kekFingerprint);
      if (!oldKek) continue;
      ver.wrappedDEK = rewrapDEK(ver.wrappedDEK, oldKek.kek, next.kek, next.meta.generation);
      rewrapped++;
    }
    // Also re-wrap share grants.
    for (const grant of v.state.shareGrants) {
      if (grant.policyId === rec.policyId) {
        // Grants have their own grantee-KEK; the owner's KEK does not affect
        // their content. They become unreadable if the grantee's KEK rotates.
        continue;
      }
    }
    rec.activeKekFingerprint = kekFingerprint(next.kek);
    rec.kekHistory.push({ ...next.meta });
    cacheInvalidate(v.cache, rec.policyId);
  }

  // Prune expired (retired + past grace) KEKs.
  const pruned = pruneExpiredKEKs(ring);

  // Audit (single global entry per owner).
  const ts = nowIso();
  for (const rec of v.state.records.values()) {
    if (rec.ownerId !== input.ownerId) continue;
    const log = getOrCreateAuditLog(v, rec.policyId);
    appendAudit(log, {
      at: ts,
      actor: input.actor,
      action: 'rotate-kek',
      policyId: rec.policyId,
      reason: input.reason,
      version: null,
    });
  }

  return {
    newKekFingerprint: kekFingerprint(next.kek),
    newGeneration: next.meta.generation,
    rewrapped,
    pruned,
    timestamp: ts,
  };
}

/** Auto-rotate any owner whose active KEK is older than autoRotateMs. */
export function autoRotateIfDue(v: Vault, now: Iso8601 = nowIso(), actor: string = 'system:rotation'): RotateResult[] {
  if (v.opts.autoRotateMs <= 0) return [];
  const out: RotateResult[] = [];
  const cutoff = Date.parse(now) - v.opts.autoRotateMs;
  for (const [ownerId, ring] of v.state.keyRings) {
    const active = findActiveKEK(ring);
    if (Date.parse(active.meta.createdAt) < cutoff) {
      out.push(rotateOwnerKEK(v, {
        ownerId,
        actor,
        reason: 'auto-rotate (90d policy)',
        gracePeriodMs: v.opts.gracePeriodMs,
      }));
    }
  }
  return out;
}

// =============================================================================
// SECTION 19 — SHARE GRANTS
// =============================================================================

export interface GrantInput {
  policyId: string;
  granteeId: string;
  granteeKek: KEK;
  actor: string;
  reason: string;
  expiresAt?: Iso8601;
}

export function grantShare(v: Vault, input: GrantInput): ShareGrant {
  const rec = v.state.records.get(input.policyId);
  if (!rec) throw new Error(`grantShare: unknown policyId ${input.policyId}`);
  if (rec.tombstone) throw new Error('grantShare: record is erased (LGPD)');
  if (input.granteeId === rec.ownerId) throw new Error('grantShare: cannot grant to self');

  // Get current DEK (unwrap latest version's wrappedDEK)
  const ring = v.state.keyRings.get(rec.ownerId);
  if (!ring) throw new Error('grantShare: owner has no key ring');
  const target = latestVersion(rec);
  if (!target) throw new Error('grantShare: no versions to share');

  const ownerKEKEntry = findKEKByFingerprint(ring, target.wrappedDEK.kekFingerprint);
  if (!ownerKEKEntry) throw new Error('grantShare: owner KEK not found in ring');

  const dek = unwrapDEK(target.wrappedDEK, ownerKEKEntry.kek);
  // Wrap a fresh DEK copy for the grantee (so revocation is independent).
  const granteeWrapped = wrapDEK(dek, input.granteeKek, 1);

  const grant: ShareGrant = {
    grantId: generateGrantId(),
    policyId: rec.policyId,
    granteeId: input.granteeId,
    wrappedDEK: granteeWrapped,
    grantedAt: nowIso(),
    grantedBy: input.actor,
    expiresAt: input.expiresAt ?? null,
    revokedAt: null,
    reason: input.reason,
  };
  v.state.shareGrants.push(grant);

  // Audit
  const log = getOrCreateAuditLog(v, rec.policyId);
  appendAudit(log, {
    at: grant.grantedAt,
    actor: input.actor,
    action: 'share-grant',
    policyId: rec.policyId,
    reason: `${input.reason} → ${input.granteeId}`,
    version: target.version,
  });

  return grant;
}

export function revokeShare(v: Vault, grantId: string, actor: string, reason: string): ShareGrant {
  const grant = v.state.shareGrants.find((g) => g.grantId === grantId);
  if (!grant) throw new Error(`revokeShare: unknown grantId ${grantId}`);
  if (grant.revokedAt) return grant;
  grant.revokedAt = nowIso();
  // Zero out the wrapped DEK so it cannot be unwrapped, even if grantee
  // somehow gets a hold of an old KEK with matching fingerprint.
  grant.wrappedDEK = wrapDEK(('0'.repeat(64) as unknown) as DEK, ('0'.repeat(64) as unknown) as KEK, 0);
  const log = getOrCreateAuditLog(v, grant.policyId);
  appendAudit(log, {
    at: grant.revokedAt,
    actor,
    action: 'share-revoke',
    policyId: grant.policyId,
    reason: `${reason} (grant=${grantId})`,
    version: null,
  });
  return grant;
}

export function listActiveGrants(v: Vault, policyId: string): ShareGrant[] {
  return v.state.shareGrants.filter((g) => g.policyId === policyId && isGrantActive(g));
}

export function listGrantsForUser(v: Vault, granteeId: string): ShareGrant[] {
  return v.state.shareGrants.filter((g) => g.granteeId === granteeId);
}

export function revokeAllGrantsForPolicy(v: Vault, policyId: string, actor: string, reason: string): number {
  let n = 0;
  for (const g of v.state.shareGrants) {
    if (g.policyId === policyId && !g.revokedAt) {
      revokeShare(v, g.grantId, actor, reason);
      n++;
    }
  }
  return n;
}

// =============================================================================
// SECTION 20 — VERSION PRUNING (keep last N)
// =============================================================================

export interface PruneInput {
  policyId: string;
  keep: number;
  actor: string;
  reason: string;
}

export function pruneOldVersions(v: Vault, input: PruneInput): number {
  const rec = v.state.records.get(input.policyId);
  if (!rec) throw new Error(`pruneOldVersions: unknown policyId ${input.policyId}`);
  if (input.keep < 1) throw new Error('pruneOldVersions: keep must be >= 1');
  if (rec.versions.length <= input.keep) return 0;
  const removed = rec.versions.length - input.keep;
  rec.versions = rec.versions.slice(-input.keep);
  cacheInvalidate(v.cache, rec.policyId);
  const log = getOrCreateAuditLog(v, rec.policyId);
  appendAudit(log, {
    at: nowIso(),
    actor: input.actor,
    action: 'version-prune',
    policyId: rec.policyId,
    reason: `${input.reason} (kept ${input.keep}, removed ${removed})`,
    version: null,
  });
  return removed;
}

// =============================================================================
// SECTION 21 — SACRED-CONTENT VAULT FLOW
// =============================================================================

export interface SacredStoreInput extends StoreInput {
  custodianA: string;
  custodianB: string;
}

export function storeSacredPolicy(v: Vault, input: SacredStoreInput): { result: StoreResult; attestation: DualCustodyAttestation } {
  const ring = getOrCreateKeyRing(v, input.policy.ownerId, 'sacred');
  const active = findActiveKEK(ring);
  const result = storePolicy(v, input);
  const attestation = releaseSacredKEK(
    active.meta,
    active.kek,
    input.custodianA,
    input.custodianB,
    input.policy.policyId,
  );
  const log = getOrCreateAuditLog(v, input.policy.policyId);
  appendAudit(log, {
    at: nowIso(),
    actor: `${input.custodianA}+${input.custodianB}`,
    action: 'dual-custody-attest',
    policyId: input.policy.policyId,
    reason: 'sacred release',
    version: result.version,
  });
  return { result, attestation };
}

// =============================================================================
// SECTION 22 — EXPORT (w52-compatible)
// =============================================================================

export interface ExportInput {
  ownerId: string;
  actor: string;
  reason: string;
  /** Scope to specific policies (else all owned). */
  policyIds?: string[];
}

export function exportOwnerPolicies(v: Vault, input: ExportInput): LGPDExportBundle {
  // Ensure we have decrypted policy objects; build a temporary map.
  const policies = new Map<string, RedactionPolicy>();
  const records: VaultRecord[] = [];
  const target = input.policyIds ?? Array.from(v.state.records.keys());
  for (const pid of target) {
    const r = v.state.records.get(pid);
    if (!r) continue;
    if (r.ownerId !== input.ownerId) continue;
    if (r.tombstone) continue;
    try {
      const result = retrievePolicy(v, {
        policyId: pid,
        actor: input.actor,
        reason: input.reason,
        skipCache: true,
      });
      policies.set(pid, result.policy);
      records.push(r);
    } catch {
      // skip unreadable records
    }
  }
  const consents = Array.from(v.state.consents.values()).filter(
    (c) => c.userId === input.ownerId && isConsentValid(c),
  );
  const bundle = buildLGPDExport(input.ownerId, records, policies, v.state.auditLogs, consents);
  for (const r of records) {
    const log = getOrCreateAuditLog(v, r.policyId);
    appendAudit(log, {
      at: nowIso(),
      actor: input.actor,
      action: 'export',
      policyId: r.policyId,
      reason: input.reason,
      version: null,
    });
  }
  return bundle;
}

// =============================================================================
// SECTION 23 — ERASURE (LGPD Art. 18 VI)
// =============================================================================

export interface EraseInput {
  ownerId: string;
  actor: string;
  reason: string;
}

export function eraseOwnerData(v: Vault, input: EraseInput): ErasureReceipt {
  const records = Array.from(v.state.records.values()).filter(
    (r) => r.ownerId === input.ownerId,
  );
  // Revoke all grants first so they cannot be used after erasure.
  for (const r of records) {
    revokeAllGrantsForPolicy(v, r.policyId, input.actor, `${input.reason} (LGPD cascade)`);
  }
  // Invalidate cache entries for the erased policies.
  for (const r of records) cacheInvalidate(v.cache, r.policyId);
  // Erase.
  const receipt = eraseRecords(records, input.ownerId, v.state.auditLogs, input.actor);
  // Revoke any consents belonging to the user.
  for (const c of v.state.consents.values()) {
    if (c.userId === input.ownerId && !c.revokedAt) {
      c.revokedAt = nowIso();
    }
  }
  return receipt;
}

// =============================================================================
// SECTION 24 — SERIALIZATION (for persistence)
// =============================================================================

export function serializeState(v: Vault): string {
  return JSON.stringify({
    records: Array.from(v.state.records.entries()),
    keyRings: Array.from(v.state.keyRings.entries()).map(([k, r]) => [
      k,
      {
        ownerId: r.ownerId,
        entries: r.entries.map((e) => ({ meta: e.meta })), // KEK not serialized — caller supplies
      },
    ]),
    auditLogs: Array.from(v.state.auditLogs.entries()),
    shareGrants: v.state.shareGrants,
    consents: Array.from(v.state.consents.entries()),
    opts: v.opts,
  });
}

export function deserializeState(json: string, v: Vault): void {
  type Wire = {
    records: [string, VaultRecord][];
    keyRings: [string, { ownerId: string; entries: { meta: KEKMetadata }[] }][];
    auditLogs: [string, AuditLog][];
    shareGrants: ShareGrant[];
    consents: [string, LGPDConsent][];
    opts: Required<VaultOptions>;
  };
  const w = JSON.parse(json) as Wire;
  v.state.records.clear();
  for (const [k, val] of w.records) v.state.records.set(k, val);
  v.state.keyRings.clear();
  for (const [k, val] of w.keyRings) {
    v.state.keyRings.set(k, { ownerId: val.ownerId, entries: [] });
  }
  v.state.auditLogs.clear();
  for (const [k, val] of w.auditLogs) v.state.auditLogs.set(k, val);
  v.state.shareGrants = w.shareGrants;
  v.state.consents.clear();
  for (const [k, val] of w.consents) v.state.consents.set(k, val);
  v.opts = w.opts;
}

/** Round-trip a single DEK through a serialized envelope (test helper). */
export function roundtripEnvelope(dek: DEK, kek: KEK): boolean {
  const wrapped = wrapDEK(dek, kek, 1);
  const unwrapped = unwrapDEK(wrapped, kek);
  return unwrapped === dek;
}

// =============================================================================
// SECTION 25 — VALIDATION HELPERS
// =============================================================================

export function validatePolicy(p: RedactionPolicy): string[] {
  const errors: string[] = [];
  if (!p.policyId) errors.push('policyId is required');
  if (!p.ownerId) errors.push('ownerId is required');
  if (!p.name) errors.push('name is required');
  if (!Array.isArray(p.rules)) errors.push('rules must be an array');
  for (const r of p.rules) {
    if (!r.ruleId) errors.push(`rule.ruleId missing in policy ${p.policyId}`);
    if (!r.path) errors.push(`rule.path missing in policy ${p.policyId}`);
    if (!r.strategy) errors.push(`rule.strategy missing in policy ${p.policyId}`);
  }
  if (p.sacred && !p.tags.includes('sacred')) {
    errors.push('sacred policy must include "sacred" tag');
  }
  return errors;
}

export function validateCiphertext(ct: Ciphertext): string[] {
  const errors: string[] = [];
  if (!isHex(ct.nonce)) errors.push('nonce not hex');
  if (!isHex(ct.body)) errors.push('body not hex');
  if (!isHex(ct.tag)) errors.push('tag not hex');
  if (!isHex(ct.ad)) errors.push('ad not hex');
  return errors;
}

export function validateEnvelope(w: WrappedDEK): string[] {
  return validateCiphertext(w.envelope);
}

export function validateAuditEntry(e: AuditEntry): string[] {
  const errors: string[] = [];
  if (e.seq < 1) errors.push('seq must be >= 1');
  if (!isHex(e.prevHash)) errors.push('prevHash not hex');
  if (!isHex(e.hash)) errors.push('hash not hex');
  return errors;
}

// =============================================================================
// SECTION 26 — STATISTICS / DIAGNOSTICS
// =============================================================================

export interface VaultStats {
  records: number;
  tombstones: number;
  totalVersions: number;
  activeKEKs: number;
  retiredKEKs: number;
  shareGrants: number;
  activeGrants: number;
  revokedGrants: number;
  auditEntries: number;
  consents: number;
  validConsents: number;
  cache: ReturnType<typeof cacheStats>;
}

export function vaultStats(v: Vault): VaultStats {
  let records = 0;
  let tombstones = 0;
  let totalVersions = 0;
  for (const r of v.state.records.values()) {
    records++;
    if (r.tombstone) tombstones++;
    totalVersions += r.versions.length;
  }
  let activeKEKs = 0;
  let retiredKEKs = 0;
  for (const ring of v.state.keyRings.values()) {
    for (const e of ring.entries) {
      if (e.meta.retiredAt) retiredKEKs++;
      else activeKEKs++;
    }
  }
  let activeGrants = 0;
  let revokedGrants = 0;
  for (const g of v.state.shareGrants) {
    if (g.revokedAt) revokedGrants++;
    else activeGrants++;
  }
  let auditEntries = 0;
  for (const log of v.state.auditLogs.values()) auditEntries += log.entries.length;
  let validConsents = 0;
  for (const c of v.state.consents.values()) {
    if (isConsentValid(c)) validConsents++;
  }
  return {
    records,
    tombstones,
    totalVersions,
    activeKEKs,
    retiredKEKs,
    shareGrants: v.state.shareGrants.length,
    activeGrants,
    revokedGrants,
    auditEntries,
    consents: v.state.consents.size,
    validConsents,
    cache: cacheStats(v.cache),
  };
}

// =============================================================================
// SECTION 27 — EXAMPLE SEED POLICIES (for tests / docs)
// =============================================================================

export function examplePolicy(ownerId: string, policyId: string, sacred = false): RedactionPolicy {
  return {
    policyId,
    ownerId,
    name: sacred ? 'Sacred Policy' : 'Standard Policy',
    version: 1,
    rules: [
      { ruleId: 'r1', path: 'user.email', strategy: 'hash', scope: 'field' },
      { ruleId: 'r2', path: 'user.cpf', strategy: 'mask', scope: 'field' },
      { ruleId: 'r3', path: 'content.text', strategy: 'pseudonymize', scope: 'document', seed: randomHex(16) },
    ],
    tags: sacred ? ['sacred', 'lgpd'] : ['lgpd'],
    sacred,
    description: 'Example redaction policy generated by w53/redaction_policy_vault',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
}

export function exampleBundleFor(policy: RedactionPolicy): W52ExportBundle {
  const payload = JSON.stringify(policy, null, 2);
  return {
    bundleId: generateExportId(),
    policyId: policy.policyId,
    format: 'json',
    payload,
    attachments: [
      { name: 'README.md', content: `# Export for ${policy.policyId}\nGenerated by w53/redaction_policy_vault.` },
    ],
    signature: sha256(payload + policy.ownerId),
    createdAt: nowIso(),
  };
}

// =============================================================================
// SECTION 28 — INTERNAL GUARDS / UTILS
// =============================================================================

export function assertString(x: unknown, name: string): asserts x is string {
  if (typeof x !== 'string') throw new Error(`${name} must be a string`);
}

export function assertNonEmpty(x: string, name: string): void {
  if (!x) throw new Error(`${name} must be non-empty`);
}

export function safeJsonParse<T>(s: string): T | null {
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
}

export function policyFingerprint(p: RedactionPolicy): Hex {
  return sha256(JSON.stringify({ id: p.policyId, rules: p.rules, tags: p.tags }));
}

export function ciphertextFingerprint(ct: Ciphertext): Hex {
  return sha256((ct.nonce as string) + (ct.ad as string) + (ct.body as string) + (ct.tag as string));
}

export function isValidKEK(s: unknown): s is KEK {
  return typeof s === 'string' && isHex(s) && s.length === 64;
}

export function isValidDEK(s: unknown): s is DEK {
  return typeof s === 'string' && isHex(s) && s.length === 64;
}

// =============================================================================
// SECTION 29 — STRUCTURED LOG HELPERS
// =============================================================================

export interface VaultLogLine {
  ts: Iso8601;
  level: 'info' | 'warn' | 'error';
  event: string;
  policyId: string;
  actor: string;
  data: Record<string, string>;
}

export function makeLogLine(
  level: VaultLogLine['level'],
  event: string,
  policyId: string,
  actor: string,
  data: Record<string, string> = {},
): VaultLogLine {
  return { ts: nowIso(), level, event, policyId, actor, data };
}

export function formatLogLine(l: VaultLogLine): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(l.data)) parts.push(`${k}=${v}`);
  return `[${l.ts}] ${l.level.toUpperCase()} ${l.event} policy=${l.policyId} actor=${l.actor} ${parts.join(' ')}`.trim();
}

// =============================================================================
// SECTION 30 — TEST HELPERS (deterministic seeds for roundtrip checks)
// =============================================================================

/** Create a deterministic DEK for tests (do NOT use in production). */
export function deterministicDEK(seed: string): DEK {
  return sha256(`dek:${seed}`);
}

/** Create a deterministic KEK for tests. */
export function deterministicKEK(seed: string): KEK {
  return sha256(`kek:${seed}`);
}

export function deterministicTestVector(): {
  plaintext: string;
  key: Hex;
  expectedBodyPrefix: Hex;
} {
  const plaintext = 'the quick brown fox jumps over the lazy dog';
  const key = sha256('test-key');
  const ct = encryptWithKey(key, plaintext);
  return {
    plaintext,
    key,
    expectedBodyPrefix: (ct.body as string).slice(0, 16) as Hex,
  };
}

// =============================================================================
// SECTION 31 — VERSIONING METADATA
// =============================================================================

export const VAULT_VERSION = '1.0.0';
export const VAULT_ALG = 'rpv1-stream-hmac';
export const LGPD_ARTICLES_COVERED = ['Art. 7', 'Art. 9', 'Art. 18'] as const;

export function getVaultInfo(): {
  version: string;
  alg: string;
  lgpd: readonly string[];
  sacred: boolean;
  supportsRotation: boolean;
  supportsShare: boolean;
} {
  return {
    version: VAULT_VERSION,
    alg: VAULT_ALG,
    lgpd: LGPD_ARTICLES_COVERED,
    sacred: true,
    supportsRotation: true,
    supportsShare: true,
  };
}

// =============================================================================
// SECTION 32 — DEFAULTS / CONSTANTS
// =============================================================================

export const DEFAULT_NONCE_SIZE = DEFAULT_NONCE_BYTES;
export const DEK_BYTES = 32;
export const KEK_BYTES = 32;
export const HASH_BYTES = 32;
export const HMAC_BLOCK_SIZE = BLOCK_SIZE;
export const SACRED_KEEP_GRACE_MS = 30 * 24 * 60 * 60 * 1000;
export const STANDARD_ROTATION_MS = 90 * 24 * 60 * 60 * 1000;
export const SHORT_ROTATION_MS = 7 * 24 * 60 * 60 * 1000;
export const MIN_CACHE_TTL_MS = 1000;
export const DEFAULT_GRACEPERIOD_MS = 7 * 24 * 60 * 60 * 1000;
export const AUDIT_CHAIN_GENESIS_HASH = '0'.repeat(64);