/**
 * W71-B: Spec for vapid-jwt.ts
 *
 * Tests VAPID JWT signing + ECE payload encryption/decryption roundtrip.
 */

import { generateKeyPairSync, createECDH, createDecipheriv, createHmac, createPrivateKey, createPublicKey, createVerify, randomBytes as nodeRandomBytes } from 'node:crypto';
import {
  base64urlEncode,
  base64urlDecode,
  signVapidJwt,
  encryptPushPayload,
  _decodeP256PublicKey,
  _decodeAuthSecret,
  _timingSafeEqual,
  jwkScalarsToBase64url,
  TRADITION_TAGS,
} from '../engines/vapid-jwt.ts';

// ───────────────────────────────────────────────────────────────────────────
// Self-running harness
// ───────────────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const assertions: Array<{ name: string; ok: boolean; detail?: string }> = [];

function assertIt(name: string, cond: boolean, detail?: string): void {
  if (cond) {
    passed += 1;
    assertions.push({ name, ok: true });
  } else {
    failed += 1;
    assertions.push({ name, ok: false, detail });
  }
}

function assertEqual<T>(name: string, actual: T, expected: T): void {
  if (actual === expected) {
    passed += 1;
    assertions.push({ name, ok: true });
  } else {
    failed += 1;
    assertions.push({
      name,
      ok: false,
      detail: `expected=${JSON.stringify(expected)} actual=${JSON.stringify(actual)}`,
    });
  }
}

function assertThrows(name: string, fn: () => unknown, pattern?: RegExp): void {
  try {
    fn();
    failed += 1;
    assertions.push({ name, ok: false, detail: 'did not throw' });
  } catch (e) {
    const msg = (e as Error).message;
    if (!pattern || pattern.test(msg)) {
      passed += 1;
      assertions.push({ name, ok: true });
    } else {
      failed += 1;
      assertions.push({
        name,
        ok: false,
        detail: `threw "${msg}" but did not match ${pattern}`,
      });
    }
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Receiver keypair helper (real P-256 + auth secret)
// ───────────────────────────────────────────────────────────────────────────

function makeReceiver(): { p256dh: string; auth: string; privateKey: Buffer } {
  const { publicKey, privateKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
  const pubDer = publicKey.export({ type: 'spki', format: 'der' }) as Buffer;
  const pubRaw = pubDer.subarray(pubDer.length - 65);
  const p256dh = base64urlEncode(pubRaw);

  // auth secret: 16 random bytes
  const auth = base64urlEncode(nodeRandomBytes(16));

  const privDer = privateKey.export({ type: 'pkcs8', format: 'der' }) as Buffer;
  const privJwk = privateKey.export({ format: 'jwk' }) as { d?: string };
  // Use the JWK d to derive raw scalar — already 32 bytes encoded as base64url
  const privScalar = Buffer.from(base64urlDecode(privJwk.d ?? ''));
  if (privScalar.length !== 32) {
    // Fallback: extract from PKCS8 (last 32 bytes are typically d, but PKCS8 has a wrapper)
    // Use createPrivateKey + export raw if available
    const k = createPrivateKey(privDer);
    const raw = k.export({ format: 'jwk' }) as { d?: string };
    const scalar = Buffer.from(base64urlDecode(raw.d ?? ''));
    return { p256dh, auth, privateKey: scalar };
  }
  return { p256dh, auth, privateKey: privScalar };
}

// ───────────────────────────────────────────────────────────────────────────
// ECE decryption (mirror of the encryption for roundtrip testing)
// ───────────────────────────────────────────────────────────────────────────

function decryptEce(
  ciphertext: Buffer,
  p256dh: string,
  auth: string,
  receiverScalar: Buffer,
): Buffer {
  // Parse header: salt(16) || rs(4) || idlen(1) || keyid || ciphertext + tag(16)
  const salt = ciphertext.subarray(0, 16);
  const rs = ciphertext.subarray(16, 20);
  const idlen = ciphertext[20];
  if (!idlen) throw new Error('decryptEce: idlen missing');
  const keyid = ciphertext.subarray(21, 21 + idlen);
  const body = ciphertext.subarray(21 + idlen);
  const enc = body.subarray(0, body.length - 16);
  const tag = body.subarray(body.length - 16);

  // Build ECDH with receiver scalar only; peer's ephemeral keyid is passed to computeSecret.
  // (In Node 22 ECDH, setPublicKey was removed from the public API.)
  const ecdh = createECDH('prime256v1');
  ecdh.setPrivateKey(receiverScalar);

  // Shared secret = receiver_private * ephemeral_public
  const sharedSecret = ecdh.computeSecret(keyid);

  // PRK via auth_info
  const authInfo = Buffer.concat([
    Buffer.from('WebPush: info\x00', 'utf8'),
    _decodeP256PublicKey(p256dh),
    keyid,
  ]);
  const prk1 = createHmac('sha256', _decodeAuthSecret(auth)).update(sharedSecret).digest();
  const prk = createHmac('sha256', prk1).update(authInfo).digest();

  // context = "Content-Encoding: aes128gcm\x00" + receiverPub + ephemeralPub
  const context = Buffer.concat([
    Buffer.from('Content-Encoding: aes128gcm\x00', 'utf8'),
    _decodeP256PublicKey(p256dh),
    keyid,
  ]);
  const keyInfo = Buffer.concat([context, Buffer.from('aes128gcm', 'utf8'), Buffer.from([16])]);
  const nonceInfo = Buffer.concat([context, Buffer.from('nonce', 'utf8'), Buffer.from([12])]);
  const key = createHmac('sha256', prk).update(keyInfo).digest().subarray(0, 16);
  const nonce = createHmac('sha256', prk).update(nonceInfo).digest().subarray(0, 12);

  const decipher = createDecipheriv('aes-128-gcm', key, nonce);
  decipher.setAuthTag(tag);
  const padded = Buffer.concat([decipher.update(enc), decipher.final()]);
  // Strip trailing delimiter byte (last byte == 0x02)
  if (padded[padded.length - 1] !== 0x02) {
    throw new Error('decryptEce: missing final-record delimiter');
  }
  return padded.subarray(0, padded.length - 1);

  // Reference salt and rs to silence unused warnings
  void salt;
  void rs;
}

// ───────────────────────────────────────────────────────────────────────────
// Spec body
// ───────────────────────────────────────────────────────────────────────────

export function runVapidJwtSpec(): { passed: number; failed: number; assertions: typeof assertions } {
  passed = 0;
  failed = 0;
  assertions.length = 0;

  // ─── Section 1: base64url ───
  {
    assertEqual('b64:roundtrip_hello', base64urlDecode(base64urlEncode(Buffer.from('hello'))).toString(), 'hello');
    assertEqual('b64:no_padding', base64urlEncode(Buffer.from('a')).indexOf('='), -1);
    assertEqual('b64:url_safe_chars', base64urlEncode(Buffer.from([0xfb, 0xff])).includes('+'), false);
    assertEqual('b64:url_safe_chars2', base64urlEncode(Buffer.from([0xfb, 0xff])).includes('/'), false);

    assertThrows('b64:invalid_input', () => base64urlDecode('@@@@'), /invalid input/);
    assertThrows('b64:non_string', () => base64urlDecode(null as unknown as string));
  }

  // ─── Section 2: VAPID JWT ───
  {
    // Generate a VAPID keypair
    const { publicKey, privateKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
    const pubDer = publicKey.export({ type: 'spki', format: 'der' }) as Buffer;
    const privJwk = privateKey.export({ format: 'jwk' }) as { d?: string };
    const privD = privJwk.d ?? '';

    // Sign a JWT
    const jwt = signVapidJwt('https://fcm.googleapis.com', 'mailto:test@example.com', privD);
    const parts = jwt.split('.');
    assertEqual('jwt:three_parts', parts.length, 3);
    assertIt('jwt:header_decodes_to_typ_jwt', JSON.parse(base64urlDecode(parts[0] ?? '').toString()).typ === 'JWT');
    assertIt('jwt:header_decodes_to_alg_es256', JSON.parse(base64urlDecode(parts[0] ?? '').toString()).alg === 'ES256');
    const claims = JSON.parse(base64urlDecode(parts[1] ?? '').toString());
    assertEqual('jwt:claims_aud', claims.aud, 'https://fcm.googleapis.com');
    assertEqual('jwt:claims_sub', claims.sub, 'mailto:test@example.com');
    assertIt('jwt:claims_exp_in_future', typeof claims.exp === 'number' && claims.exp > Math.floor(Date.now() / 1000));
    assertIt('jwt:signature_present', parts[2] !== undefined && (parts[2]?.length ?? 0) > 0);

    // Verify signature using Node's crypto.verify
    const verifier = createVerify('SHA256');
    verifier.update(`${parts[0]}.${parts[1]}`);
    verifier.end();
    // Use the public key DER; the SPKI export we already have works
    const pubKeyObj = createPublicKey({ key: pubDer, format: 'der', type: 'spki' });
    const valid = verifier.verify(pubKeyObj, base64urlDecode(parts[2] ?? ''));
    assertEqual('jwt:signature_verifies', valid, true);
  }

  // ─── Section 3: VAPID validation ───
  {
    const privD = (generateKeyPairSync('ec', { namedCurve: 'P-256' }).privateKey.export({ format: 'jwk' }) as { d?: string }).d ?? '';
    assertThrows('jwt:empty_audience', () => signVapidJwt('', 'mailto:x', privD));
    assertThrows('jwt:empty_subject', () => signVapidJwt('https://x', '', privD));
    assertThrows('jwt:negative_exp', () => signVapidJwt('https://x', 'mailto:x', privD, -1));
    assertThrows('jwt:too_long_exp', () => signVapidJwt('https://x', 'mailto:x', privD, 25 * 60 * 60));
  }

  // ─── Section 4: ECE encryption roundtrip ───
  {
    const receiver = makeReceiver();
    const plaintext = JSON.stringify({ title: 'Hello', body: 'World' });

    const encrypted = encryptPushPayload(plaintext, receiver.p256dh, receiver.auth);

    // Headers sanity
    assertEqual('ece:Content-Encoding', encrypted.headers['Content-Encoding'], 'aes128gcm');
    assertEqual('ece:Content-Type', encrypted.headers['Content-Type'], 'application/octet-stream');
    assertIt('ece:Encryption_salt_header', encrypted.headers.Encryption?.startsWith('salt=') ?? false);
    assertIt('ece:Crypto-Key_dh_header', encrypted.headers['Crypto-Key']?.startsWith('dh=') ?? false);

    // Decrypt with receiver scalar
    const decrypted = decryptEce(encrypted.ciphertext, receiver.p256dh, receiver.auth, receiver.privateKey);
    assertEqual('ece:roundtrip_plaintext', decrypted.toString('utf8'), plaintext);

    // Ciphertext should be different on each call (ephemeral key)
    const e2 = encryptPushPayload(plaintext, receiver.p256dh, receiver.auth);
    assertEqual('ece:different_ciphertexts', encrypted.ciphertext.equals(e2.ciphertext), false);
  }

  // ─── Section 5: ECE with overridden ephemeral (deterministic test) ───
  {
    const receiver = makeReceiver();
    const ecdh = createECDH('prime256v1');
    ecdh.generateKeys();
    const ePub = ecdh.getPublicKey();
    const ePriv = ecdh.getPrivateKey();
    const salt = Buffer.alloc(16, 7); // deterministic salt

    const plaintext = 'deterministic test';
    const enc = encryptPushPayload(plaintext, receiver.p256dh, receiver.auth, {
      ephemeralKeyPair: { publicKey: ePub, privateKey: ePriv },
      salt,
    });
    // Header salt must match what we passed in
    const parsedSalt = base64urlDecode(encryptedSaltFrom(enc.headers));
    assertEqual('ece:override_salt_matches', Buffer.compare(parsedSalt, salt), 0);
    const dec = decryptEce(enc.ciphertext, receiver.p256dh, receiver.auth, receiver.privateKey);
    assertEqual('ece:override_roundtrip', dec.toString('utf8'), plaintext);
  }

  // ─── Section 6: ECE validation errors ───
  {
    const receiver = makeReceiver();
    assertThrows('ece:non_string_plaintext', () =>
      encryptPushPayload(null as unknown as string, receiver.p256dh, receiver.auth),
    );
    assertThrows('ece:invalid_p256dh_length', () =>
      encryptPushPayload('hi', 'A'.repeat(10), receiver.auth),
    );
    assertThrows('ece:invalid_auth_length', () =>
      encryptPushPayload('hi', receiver.p256dh, 'short'),
    );
  }

  // ─── Section 7: Helper utilities ───
  {
    const pk = generateKeyPairSync('ec', { namedCurve: 'P-256' });
    const jwk = pk.publicKey.export({ format: 'jwk' }) as { x?: string; y?: string };
    const norm = jwkScalarsToBase64url(jwk);
    assertIt('jwk:x_no_plus', !norm.x.includes('+'));
    assertIt('jwk:y_no_slash', !norm.y.includes('/'));
    assertIt('jwk:x_no_padding', !norm.x.includes('='));

    assertThrows('jwk:missing_x', () => jwkScalarsToBase64url({ y: 'abc' }));
    assertThrows('jwk:missing_y', () => jwkScalarsToBase64url({ x: 'abc' }));

    const a = Buffer.from('hello');
    const b = Buffer.from('hello');
    const c = Buffer.from('world');
    assertEqual('timing:equal_true', _timingSafeEqual(a, b), true);
    assertEqual('timing:diff_false', _timingSafeEqual(a, c), false);
    assertEqual('timing:length_diff_false', _timingSafeEqual(a, Buffer.from('hello world')), false);
  }

  // ─── Section 8: Sacred tags ───
  {
    assertEqual('tags:cigano', TRADITION_TAGS.cigano, 'tradition.cigano');
    assertEqual('tags:orixas', TRADITION_TAGS.orixas, 'tradition.orixas');
    assertEqual('tags:astrologia', TRADITION_TAGS.astrologia, 'tradition.astrologia');
    assertEqual('tags:cabala', TRADITION_TAGS.cabala, 'tradition.cabala');
    assertEqual('tags:numerologia', TRADITION_TAGS.numerologia, 'tradition.numerologia');
    assertEqual('tags:tarot', TRADITION_TAGS.tarot, 'tradition.tarot');
    assertEqual('tags:tantra', TRADITION_TAGS.tantra, 'tradition.tantra');
    assertEqual('tags:7_traditions', Object.keys(TRADITION_TAGS).length, 7);
  }

  return { passed, failed, assertions };
}

function encryptedSaltFrom(headers: Record<string, string>): string {
  const enc = headers.Encryption ?? '';
  const m = enc.match(/salt=([^,;]+)/);
  if (!m) throw new Error('encryptedSaltFrom: no salt in headers');
  return m[1] ?? '';
}

const isDirect = typeof import.meta.url === 'string' && process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));
if (isDirect) {
  const r = runVapidJwtSpec();
  console.log(`vapid-jwt.spec.ts: ${r.passed} passed / ${r.failed} failed / ${r.assertions.length} assertions`);
  if (r.failed > 0) {
    for (const a of r.assertions.filter((a) => !a.ok)) console.log(`  ✗ ${a.name}: ${a.detail ?? ''}`);
    process.exit(1);
  }
  process.exit(0);
}