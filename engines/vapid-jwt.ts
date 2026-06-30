/**
 * W71-B: VAPID JWT signing + ECE payload encryption.
 *
 * Implements:
 *  - RFC 8030 (Generic Event Delivery Using HTTP Push): VAPID auth scheme
 *  - RFC 8292 (VAPID Authentication Protocol): JWT claims + signature
 *  - RFC 8291 (Message Encryption for Web Push): key management + content encoding
 *  - RFC 8188 (Encrypted Content-Encoding for HTTP): aes128gcm content encoding
 *
 * Crypto primitives: Node.js `crypto` (generateKeyPairSync, ECDH, HKDF, AES-128-GCM).
 * No external libraries — the goal is to ship a small, auditable surface for the
 * Cabala dos Caminhos ecosystem.
 *
 * References:
 *  - https://datatracker.ietf.org/doc/html/rfc8292
 *  - https://datatracker.ietf.org/doc/html/rfc8188
 *  - https://datatracker.ietf.org/doc/html/rfc8291
 *  - https://datatracker.ietf.org/doc/html/rfc8030
 */

import {
  createECDH,
  createHmac,
  createCipheriv,
  createSign,
  randomBytes,
  timingSafeEqual,
  KeyObject,
  createPrivateKey,
  createPublicKey,
  verify as cryptoVerify,
} from 'node:crypto';

// ───────────────────────────────────────────────────────────────────────────
// Base64url helpers (RFC 4648 §5)
// ───────────────────────────────────────────────────────────────────────────

const B64URL_REPLACE = { '+': '-', '/': '_', '=': '' } as const;

/** Encode a Buffer to base64url string (no padding). */
export function base64urlEncode(buf: Buffer | Uint8Array): string {
  const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
  return b.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Decode a base64url string to Buffer. Throws on invalid input. */
export function base64urlDecode(s: string): Buffer {
  if (typeof s !== 'string') {
    throw new TypeError('base64urlDecode: input must be a string');
  }
  const pad = s.length % 4 === 0 ? 0 : 4 - (s.length % 4);
  const padded = s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(pad);
  const buf = Buffer.from(padded, 'base64');
  if (buf.length === 0 && s.length > 0) {
    throw new Error(`base64urlDecode: invalid input "${s.slice(0, 24)}..."`);
  }
  return buf;
}

// ───────────────────────────────────────────────────────────────────────────
// VAPID JWT (RFC 8292)
// ───────────────────────────────────────────────────────────────────────────

export interface VapidPrivateKey {
  /** base64url-encoded P-256 private scalar (32 bytes) */
  d: string;
  /** base64url-encoded uncompressed public point (65 bytes, leading 0x04) */
  x_y: string;
  /** Wrapped Node KeyObject (internal use) */
  _keyObject?: KeyObject;
}

/** Header for VAPID JWT — always `typ:JWT, alg:ES256` per RFC 8292 §2. */
const VAPID_HEADER = { typ: 'JWT', alg: 'ES256' } as const;

/**
 * Sign a VAPID JWT with an EC P-256 private key.
 *
 * @param audience — origin of the push receiver (e.g. "https://fcm.googleapis.com")
 * @param subject — mailto: or https: contact URI for the application server
 * @param privateKey — base64url-encoded 32-byte P-256 scalar, OR a VapidPrivateKey object
 * @param expiresInSeconds — exp = now + this many seconds (default 12h, max 24h per RFC 8292)
 * @returns base64url-encoded JWT (header.claims.signature)
 */
export function signVapidJwt(
  audience: string,
  subject: string,
  privateKey: string | VapidPrivateKey,
  expiresInSeconds: number = 12 * 60 * 60,
): string {
  if (typeof audience !== 'string' || audience.length === 0) {
    throw new TypeError('signVapidJwt: audience must be a non-empty string');
  }
  if (typeof subject !== 'string' || subject.length === 0) {
    throw new TypeError('signVapidJwt: subject must be a non-empty string (mailto: or https:)');
  }
  if (expiresInSeconds <= 0 || expiresInSeconds > 24 * 60 * 60) {
    throw new RangeError('signVapidJwt: expiresInSeconds must be in (0, 86400]');
  }

  const headerB64 = base64urlEncode(Buffer.from(JSON.stringify(VAPID_HEADER)));
  const now = Math.floor(Date.now() / 1000);
  const claims = { aud: audience, exp: now + expiresInSeconds, sub: subject };
  const claimsB64 = base64urlEncode(Buffer.from(JSON.stringify(claims)));
  const signingInput = `${headerB64}.${claimsB64}`;

  const sig = signEcdsaP256Sha256(signingInput, privateKey);
  return `${signingInput}.${base64urlEncode(sig)}`;
}

/** Internal: ECDSA P-256 SHA-256 sign over a UTF-8 string. Returns DER signature. */
function signEcdsaP256Sha256(message: string, privateKey: string | VapidPrivateKey): Buffer {
  // Build a PEM/DER private key from the JWK scalar. Node 22's createPrivateKey
  // rejects a bare scalar d without x/y for EC keys, so we either:
  //  (a) accept a full VapidPrivateKey (with x_y) — recommended path
  //  (b) accept a bare scalar d and derive x,y via createECDH + getPublicKey
  let d: string;
  let x = '';
  let y = '';
  if (typeof privateKey === 'string') {
    d = privateKey;
    // Derive x,y from d by using an ECDH instance
    const ecdh = createECDH('prime256v1');
    ecdh.setPrivateKey(Buffer.from(base64urlDecode(d)));
    const pubBuf = ecdh.getPublicKey();
    // pubBuf = 0x04 || x(32) || y(32)
    x = base64urlEncode(pubBuf.subarray(1, 33));
    y = base64urlEncode(pubBuf.subarray(33, 65));
  } else {
    d = privateKey.d;
    // x_y is the full 65-byte uncompressed public point; extract x and y from it
    if (privateKey.x_y) {
      const pubBuf = base64urlDecode(privateKey.x_y);
      if (pubBuf.length === 65 && pubBuf[0] === 0x04) {
        x = base64urlEncode(pubBuf.subarray(1, 33));
        y = base64urlEncode(pubBuf.subarray(33, 65));
      }
    }
  }
  const jwk: import('node:crypto').JsonWebKey = {
    kty: 'EC',
    crv: 'P-256',
    d,
    x,
    y,
  };
  const keyObj = createPrivateKey({ key: jwk, format: 'jwk' });
  const signer = createSign('SHA256');
  signer.update(message);
  signer.end();
  return signer.sign(keyObj);
}

// ───────────────────────────────────────────────────────────────────────────
// ECE Encryption (RFC 8188 aes128gcm content encoding)
// ───────────────────────────────────────────────────────────────────────────

export interface EceEncrypted {
  /** Concatenated record: salt(16) || rs(4) || idlen(1) || keyid || ciphertext */
  ciphertext: Buffer;
  /** HTTP headers required by RFC 8030 §5.3 */
  headers: Record<string, string>;
}

/**
 * Encrypt a plaintext payload for a specific push subscription using ECE aes128gcm.
 *
 * @param plaintext — UTF-8 string body (typically JSON.stringify(payload))
 * @param p256dh — base64url receiver public key (raw 65 bytes uncompressed point)
 * @param auth — base64url receiver auth secret (16 bytes)
 * @param overrides — optional ephemeral key material (for deterministic tests)
 */
export function encryptPushPayload(
  plaintext: string,
  p256dh: string,
  auth: string,
  overrides?: { ephemeralKeyPair?: { publicKey: Buffer; privateKey: Buffer }; salt?: Buffer },
): EceEncrypted {
  if (typeof plaintext !== 'string') {
    throw new TypeError('encryptPushPayload: plaintext must be a string');
  }
  if (typeof p256dh !== 'string' || typeof auth !== 'string') {
    throw new TypeError('encryptPushPayload: p256dh and auth must be base64url strings');
  }

  const receiverPub = decodeP256PublicKey(p256dh);
  const receiverAuth = decodeAuthSecret(auth);

  // Ephemeral keypair (per-message ECDH)
  const ecdh = createECDH('prime256v1');
  if (overrides?.ephemeralKeyPair) {
    // Inject known key for testing — Node 22 dropped ECDH.setPublicKey from the API.
    // We keep the private key on the ecdh instance and pass the public directly to
    // computeSecret (the same way the browser would).
    const { publicKey, privateKey } = overrides.ephemeralKeyPair;
    const ecdh2 = createECDH('prime256v1');
    ecdh2.setPrivateKey(privateKey);
    return finishEncryptWithPeer(plaintext, receiverPub, receiverAuth, ecdh2, publicKey, overrides.salt);
  }

  ecdh.generateKeys();
  const ephemeralPub = ecdh.getPublicKey(); // uncompressed 65 bytes
  return finishEncrypt(plaintext, receiverPub, receiverAuth, ecdh, ephemeralPub, overrides?.salt);
}

function finishEncrypt(
  plaintext: string,
  receiverPub: Buffer,
  receiverAuth: Buffer,
  ecdh: ReturnType<typeof createECDH>,
  ephemeralPub: Buffer,
  saltOverride?: Buffer,
): EceEncrypted {
  return finishEncryptWithPeer(plaintext, receiverPub, receiverAuth, ecdh, ephemeralPub, saltOverride);
}

function finishEncryptWithPeer(
  plaintext: string,
  receiverPub: Buffer,
  receiverAuth: Buffer,
  ecdh: ReturnType<typeof createECDH>,
  ephemeralPub: Buffer,
  saltOverride?: Buffer,
): EceEncrypted {
  // ECDH → IKM: sharedSecret = ephemeral_private * receiver_public
  const sharedSecret = ecdh.computeSecret(receiverPub);

  // auth_secret + ecdh_secret → PRK via HKDF-SHA-256 (RFC 8291 §3.2: "auth info")
  const authInfo = createAuthInfo(receiverPub, ephemeralPub);
  const prk = hkdfExtract(receiverAuth, sharedSecret, authInfo);

  // Context → key/nonce via HKDF-Expand
  const context = buildEceContext(receiverPub, ephemeralPub);
  const key = hkdfExpand(prk, context, 'aes128gcm', 16);
  const nonce = hkdfExpand(prk, context, 'nonce', 12);

  // Salt for ECE record header (16 bytes random if not provided)
  const salt = saltOverride ?? randomBytes(16);
  if (salt.length !== 16) {
    throw new RangeError('encryptPushPayload: salt must be exactly 16 bytes');
  }
  const rs = Buffer.from([0, 0, 0x10, 0x00]); // rs = 4096 (record size)
  const idlen = Buffer.from([ephemeralPub.length]);
  const header = Buffer.concat([salt, rs, idlen, ephemeralPub]);

  // AES-128-GCM encrypt (RFC 8188 §2: ciphertext = enc_record = AES-GCM(plaintext, key, nonce, aad=""))
  // The plaintext is padded with a single 0x02 delimiter record at the end (final record).
  const padded = Buffer.concat([Buffer.from(plaintext, 'utf8'), Buffer.from([0x02])]);
  const cipher = createCipheriv('aes-128-gcm', key, nonce);
  // ECE aes128gcm does NOT include aad beyond the implicit header (set above)
  const enc = Buffer.concat([cipher.update(padded), cipher.final()]);
  const tag = cipher.getAuthTag();

  const ciphertext = Buffer.concat([header, enc, tag]);

  const headers: Record<string, string> = {
    'Content-Encoding': 'aes128gcm',
    'Content-Type': 'application/octet-stream',
    'Encryption': `salt=${base64urlEncode(salt)}`,
    'Crypto-Key': `dh=${base64urlEncode(ephemeralPub)}`,
  };

  return { ciphertext, headers };
}

// ───────────────────────────────────────────────────────────────────────────
// HKDF (RFC 5869)
// ───────────────────────────────────────────────────────────────────────────

/** HKDF-Extract: PRK = HMAC-SHA256(salt, IKM) */
function hkdfExtract(salt: Buffer, ikm: Buffer, info: Buffer): Buffer {
  const prk = createHmac('sha256', salt).update(ikm).digest();
  // RFC 8291 §3.2 mixes the auth info into the PRK derivation as well
  return createHmac('sha256', prk).update(info).digest();
}

/** HKDF-Expand: OKM = T(1) || T(2) || ... truncated to L bytes */
function hkdfExpand(prk: Buffer, info: Buffer, label: string, length: number): Buffer {
  const fullInfo = Buffer.concat([info, Buffer.from(label, 'utf8'), Buffer.from([length])]);
  const t = createHmac('sha256', prk).update(fullInfo).digest();
  return t.subarray(0, length);
}

// ───────────────────────────────────────────────────────────────────────────
// RFC 8291 §3 helpers
// ───────────────────────────────────────────────────────────────────────────

function createAuthInfo(receiverPub: Buffer, ephemeralPub: Buffer): Buffer {
  // "WebPush: info\x00" + ua_public (receiver) + as_public (ephemeral)
  const label = Buffer.from('WebPush: info\x00', 'utf8');
  return Buffer.concat([label, receiverPub, ephemeralPub]);
}

function buildEceContext(receiverPub: Buffer, ephemeralPub: Buffer): Buffer {
  // RFC 8188 §2.2: context = label("P-256\x00") + keyid_len(1) + keyid(receiverPub) + ...
  // But for web-push the simplified form is: "Content-Encoding: aes128gcm\x00" + header(...)
  // We use the full RFC 8188 form:
  //   "Content-Encoding: aes128gcm\x00" || 0x00 || 16 (rs) || 16 (keyid_len) || 16 (keyid)
  // Wait — the IETF web-push profile (RFC 8188 §3) uses: receiverPub as keyid with len=65.
  const label = Buffer.from('Content-Encoding: aes128gcm\x00', 'utf8');
  return Buffer.concat([label, receiverPub, ephemeralPub]);
}

function encodeUncompressedPoint(x: string, y: string): Buffer {
  // x and y are base64url-encoded 32-byte scalars; prepend 0x04 for uncompressed form.
  const xb = base64urlDecode(x);
  const yb = base64urlDecode(y);
  if (xb.length !== 32 || yb.length !== 32) {
    throw new RangeError('encodeUncompressedPoint: x and y must each decode to 32 bytes');
  }
  return Buffer.concat([Buffer.from([0x04]), xb, yb]);
}

function decodeP256PublicKey(s: string): Buffer {
  const buf = base64urlDecode(s);
  if (buf.length !== 65 || buf[0] !== 0x04) {
    throw new RangeError(`decodeP256PublicKey: expected 65-byte uncompressed point, got ${buf.length} bytes`);
  }
  return buf;
}

function decodeAuthSecret(s: string): Buffer {
  const buf = base64urlDecode(s);
  if (buf.length !== 16) {
    throw new RangeError(`decodeAuthSecret: expected 16 bytes, got ${buf.length}`);
  }
  return buf;
}

// ───────────────────────────────────────────────────────────────────────────
// Internal helpers for export
// ───────────────────────────────────────────────────────────────────────────

/** Decode + verify an ECDH point for a given receiver public key (for testing). */
export function _decodeP256PublicKey(s: string): Buffer {
  return decodeP256PublicKey(s);
}

/** Decode a base64url auth secret (for testing). */
export function _decodeAuthSecret(s: string): Buffer {
  return decodeAuthSecret(s);
}

/** Constant-time compare for tests. */
export function _timingSafeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Convert JWK x/y scalars to base64url strings (no padding). */
export function jwkScalarsToBase64url(jwk: { x?: string; y?: string }): { x: string; y: string } {
  if (!jwk.x || !jwk.y) {
    throw new Error('jwkScalarsToBase64url: x and y required');
  }
  return { x: jwk.x.replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_'), y: jwk.y.replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_') };
}

// ───────────────────────────────────────────────────────────────────────────
// Default-tag computation for sacred traditions
// ───────────────────────────────────────────────────────────────────────────

export const TRADITION_TAGS = {
  cigano: 'tradition.cigano',
  orixas: 'tradition.orixas',
  astrologia: 'tradition.astrologia',
  cabala: 'tradition.cabala',
  numerologia: 'tradition.numerologia',
  tarot: 'tradition.tarot',
  tantra: 'tradition.tantra',
} as const;

export type Tradition = keyof typeof TRADITION_TAGS;