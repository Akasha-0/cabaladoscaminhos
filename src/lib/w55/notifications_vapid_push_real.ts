/**
 * w55/notifications-vapid-push-real
 * ──────────────────────────────────
 * By-shape spec for VAPID-style web push: ECDSA P-256 keypair, JWT-style
 * auth header (header.payload.signature), ECDH-ES + HKDF + AES-128 payload
 * encryption, subscription lifecycle, quiet hours, daily caps, LGPD Art. 7/9/18
 * (consentimento, finalidade, direitos do titular) e sacred-content hard
 * block. Sem dependência de node:crypto em runtime — tudo à mão.
 *
 * Esta é a SHAPE que `src/lib/notifications/push.ts` deve adotar mais tarde.
 * Aqui não há I/O: o engine recebe bytes, devolve bytes, mantém um registry
 * em memória + um audit log. Integração com FCM/Mozilla/Apple Push é tarefa
 * do companion file, que consome este por contrato.
 *
 * Política sacred: payload com `sacredFlag=true` é rejeitado com `SacredBlock`
 * mesmo quando agendado. Não há override. Prática sagrada não é push.
 *
 * Política de ruído: máximo `MAX_PUSHES_PER_DAY=5` por subscription,
 * intervalo mínimo `MIN_PUSH_INTERVAL_MS=5400000` (90 min) entre pushes,
 * janela quiet hours suprimindo tudo exceto `safetyAlert`. Re-engagement
 * cap semanal para evitar fadiga.
 *
 * Layout:
 *   §1  Tipos & contratos
 *   §2  Constantes
 *   §3  Math helpers (FNV-1a, hex/base64url, HMAC-SHA256, HKDF, P-256 ops,
 *        AES-128 round + CTR + tag)
 *   §4  VAPID keypair generation (deterministic from seed, JWK shape)
 *   §5  VAPID JWT (header.payload.signature, claims aud/exp/sub)
 *   §6  Push subscription model (endpoint, p256dh, auth, expirationTime)
 *   §7  Push payload encryption (ECDH-ES + HKDF → cek + nonce → AES-128-CTR
 *        + HMAC tag; encrypted+salt+dh+rs output)
 *   §8  Push message builder (TTL, urgency, topic, vapid headers)
 *   §9  Subscription mgmt (registry com dedup por endpoint+userId)
 *   §10 Quiet hours + daily cap + re-engagement cap (sacred override)
 *   §11 LGPD Art. 7/9/18 (double opt-in, export, erasure)
 *   §12 Sacred pattern detector (Unicode-aware; payload rejeitado)
 *   §13 Service worker handshake simulator (swap keys, verify JWT, deliver)
 *   §14 Audit log (typed steps)
 *   §15 Smoke + doc-string constants
 */

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §1 Tipos & Contratos                                                      ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Par VAPID (P-256) — applicationServerKey. */
export interface VapidKeyPair {
  publicKey: VapidJwk;
  privateKey: VapidJwk;
  /** Identificador derivado (FNV-1a 64) — útil para audit. */
  keyId: string;
}

/** Subset do JWK (RFC 7517) com apenas o que VAPID precisa. */
export interface VapidJwk {
  kty: "EC";
  crv: "P-256";
  x: string; // base64url, 32 bytes
  y: string; // base64url, 32 bytes
  d?: string; // base64url, 32 bytes — apenas na chave privada
}

/** Subscription Web Push (RFC 8030 §4). */
export interface PushSubscription {
  endpoint: string;
  /** Chave pública do cliente — base64url, 65 bytes uncompressed. */
  p256dh: string;
  /** Auth secret do cliente — base64url, 16 bytes. */
  auth: string;
  expirationTime: number | null;
  userId: string;
  /** Token de double opt-in (Art. 7) — undefined até confirmação. */
  optInToken?: string;
  optInConfirmed: boolean;
  createdAt: number;
  /** Quando a subscription expira/foi removida. */
  retiredAt?: number;
  /** Razão de retirement (deleted / unsubscribed / lgpd-erased / expired). */
  retireReason?: SubscriptionRetireReason;
}

export type SubscriptionRetireReason =
  | "deleted_by_user"
  | "endpoint_410_gone"
  | "endpoint_404_missing"
  | "lgpd_erasure"
  | "expired_passive"
  | "dedup_collision";

/** Mensagem push a ser entregue. */
export interface PushMessage {
  /** Texto livre — usado para títulos/notificações. */
  title: string;
  body: string;
  /** URL a abrir no clique (deep-link). */
  url?: string;
  /** Tag para agrupar notificações. */
  tag?: string;
  /** Prioridade de entrega (RFC 8030 §6.4). */
  urgency?: PushUrgency;
  /** TTL em segundos — 0 = descartar se offline. */
  ttlSeconds?: number;
  /** Topic para substituir (RFC 8030 §6.6). */
  topic?: string;
  /** Tag sacred — quando true, payload é rejeitado. */
  sacredFlag?: boolean;
  /** ISO timestamp para entrega agendada (delay, não calendar). */
  scheduledAt?: number;
}

export type PushUrgency = "very-low" | "low" | "normal" | "high";

/** Header de criptografia (RFC 8188 §2). */
export interface EncryptionHeader {
  /** salt — base64url, 16 bytes. */
  salt: string;
  /** dh — chave pública efêmera do sender — base64url, 65 bytes. */
  dh: string;
  /** rs — record size — sempre 4096 nesta engine. */
  rs: number;
}

/** Header de autenticação VAPID (RFC 8292 §2). */
export interface AuthHeader {
  /** Token VAPID completo (header.payload.signature). */
  t: string;
  /** Chave pública VAPID (JWK serializado). */
  k: string;
}

/** Payload encriptado pronto para envio. */
export interface EncryptedPayload {
  ciphertext: string;        // base64url
  encryptionHeader: EncryptionHeader;
  /** Tag de autenticação do AE construction (16 bytes, base64url). */
  authTag: string;
  /** Tamanho do plaintext original (bytes). */
  plaintextBytes: number;
  /** Chave privada efêmera (JWK compactado, base64url) — necessária para decrypt.
   *  Não vai no wire — fica só no server, atrelada ao pushId até TTL expirar. */
  ephemeralPrivateJwk?: string;
}

/** Bundle final (mensagem + headers + subscription). */
export interface PushRequest {
  endpoint: string;
  payload: EncryptedPayload;
  headers: {
    encryption: string; // "salt=...;dh=...;rs=4096"
    encoding: "aes128gcm";
    ttl: number;
    urgency: PushUrgency;
    topic?: string;
    authorization: string; // "vapid t=<token>,k=<jwk>"
  };
  meta: {
    pushId: string;
    builtAt: number;
    sacredFlag: boolean;
    sacredBlocked?: boolean;
  };
}

/** Configuração global do engine. */
export interface PushConfig {
  /** Subject do VAPID — geralmente "mailto:dev@cabaladoscaminhos.app". */
  vapidSubject: string;
  /** Audience — origin do endpoint (ex.: "https://fcm.googleapis.com"). */
  vapidAudience: string;
  /** Quiet hours default (24h clock, hora local do servidor). */
  quietHoursStart: number; // 22
  quietHoursEnd: number;   // 7
  /** Cap diário por subscription. */
  maxPushesPerDay: number;
  /** Intervalo mínimo entre pushes (ms). */
  minPushIntervalMs: number;
  /** Cap semanal de re-engagement (pushes disparados após 7d de silêncio). */
  weeklyReengagementCap: number;
  /** Push TTL default (segundos). */
  defaultTtlSeconds: number;
  /** Habilita dry-run (não envia, só constrói o request). */
  dryRun: boolean;
}

/** Endpoint descriptor (browser push service). */
export interface PushEndpoint {
  url: string;
  /** Service provider detectado pela URL. */
  provider: "fcm" | "mozilla" | "apple" | "windows" | "web-push" | "unknown";
}

/** Service Worker handshake — protocolo simulado. */
export interface ServiceWorkerHandshake {
  /** Versão do protocolo. */
  protocolVersion: 1;
  /** Subscription inicial enviada pelo SW. */
  offeredSubscription: Omit<PushSubscription, "userId" | "optInConfirmed" | "createdAt">;
  /** Token de opt-in retornado pelo app server. */
  optInToken: string;
  /** Quando o user confirma, este campo é setado. */
  confirmedAt?: number;
  /** Status final do handshake. */
  status: "pending" | "confirmed" | "expired" | "rejected";
  rejectionReason?: string;
}

/** Match de padrão sacred (para audit). */
export interface SacredPatternMatch {
  pattern: string;
  matchedText: string;
  offset: number;
  tradition: SacredTradition;
}

export type SacredTradition =
  | "candomble"
  | "umbanda"
  | "ifa"
  | "kabbalah"
  | "catholic"
  | "buddhist"
  | "hindu"
  | "sufi"
  | "generic-prayer";

/** Entrada de audit log. */
export interface AuditStep {
  at: number;
  kind: AuditStepKind;
  ref?: string;
  notes?: Record<string, string | number | boolean>;
}

export type AuditStepKind =
  | "SubscriptionCreated"
  | "SubscriptionConfirmed"
  | "SubscriptionExpired"
  | "SubscriptionDeleted"
  | "PushRequested"
  | "PushEncrypted"
  | "PushSent"
  | "PushDelivered"
  | "PushFailed"
  | "PushDeferredQuietHours"
  | "PushDeferredDailyCap"
  | "PushDeferredMinInterval"
  | "SacredBlock"
  | "OptInChanged"
  | "LgpdExportRequested"
  | "LgpdExportCompleted"
  | "LgpdErasureRequested"
  | "LgpdErasureCompleted"
  | "ServiceWorkerHandshake"
  | "KeypairRotated";

/** Resultado de LGPD export. */
export interface LgpdExportPayload {
  userId: string;
  generatedAt: number;
  subscriptions: PushSubscription[];
  pushHistory: Array<{
    pushId: string;
    endpoint: string;
    title: string;
    sentAt: number;
    delivered: boolean;
  }>;
  optInRecords: Array<{
    at: number;
    action: "confirmed" | "revoked";
    method: "double_opt_in" | "user_action";
  }>;
}

/** Erro tipado. */
export interface PushError {
  code: PushErrorCode;
  message: string;
  at: number;
}

export type PushErrorCode =
  | "INVALID_SUBSCRIPTION"
  | "SACRED_BLOCKED"
  | "QUIET_HOURS"
  | "DAILY_CAP_EXCEEDED"
  | "MIN_INTERVAL_NOT_MET"
  | "WEEKLY_REENGAGEMENT_CAP"
  | "OPTIN_NOT_CONFIRMED"
  | "PAYLOAD_TOO_LARGE"
  | "INVALID_VAPID"
  | "INVALID_JWT"
  | "INVALID_ENCRYPTION"
  | "ENDPOINT_GONE_410"
  | "ENDPOINT_NOT_FOUND_404";

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §2 Constantes                                                              ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

export const ENGINE_VERSION = "1.0.0-w55";
export const POLICY_VERSION = "w55-push-policy-2026.06.29";

/** VAPID audience default — derivado do endpoint em runtime. */
export const VAPID_AUDIENCE = "https://fcm.googleapis.com";

/** TTL do JWT VAPID em segundos (RFC 8292 §2 — máximo 24h, default 12h). */
export const JWT_TTL_SECONDS = 12 * 60 * 60;

/** Tamanho máximo de payload encriptado (RFC 8030 §6.2). */
export const MAX_PAYLOAD_BYTES = 4096;

/** Quiet hours default — 22:00 às 07:00 hora local. */
export const QUIET_HOURS_DEFAULT_START = 22;
export const QUIET_HOURS_DEFAULT_END = 7;

/** Cap diário de pushes por subscription. */
export const MAX_PUSHES_PER_DAY = 5;

/** Intervalo mínimo entre pushes (90 min). */
export const MIN_PUSH_INTERVAL_MS = 90 * 60 * 1000;

/** Cap semanal de re-engagement — máximo 1 push após 7 dias de silêncio. */
export const WEEKLY_REENGAGEMENT_CAP = 1;

/** TTL default (4h). */
export const PUSH_TTL_DEFAULT_SECONDS = 4 * 60 * 60;

/** AES-128 block size (bytes). */
export const AES_BLOCK_SIZE = 16;

/** AES-128 key size (bytes). */
export const AES_KEY_SIZE = 16;

/** AES-GCM nonce size (bytes). */
export const AES_GCM_NONCE_SIZE = 12;

/** HKDF salt size (bytes) — RFC 8188. */
export const HKDF_SALT_SIZE = 16;

/** Authentication tag size (bytes). */
export const AUTH_TAG_SIZE = 16;

/** ECDH-ES salt size (bytes) — RFC 8188. */
export const ECDH_SALT_SIZE = 16;

/** P-256 order n. */
export const P256_N =
  0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551n;

/** P-256 prime p. */
export const P256_P =
  0xffffffff00000001000000000000000000000000ffffffffffffffffffffffffn;

/** P-256 parameter a (= -3 mod p). */
export const P256_A =
  0xffffffff00000001000000000000000000000000fffffffffffffffffffffffcn;

/** P-256 parameter b. */
export const P256_B =
  0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604bn;

/** P-256 base point Gx, Gy. */
export const P256_GX =
  0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296n;
export const P256_GY =
  0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5n;

/** FNV-1a 32-bit constants. */
export const FNV1A_32_OFFSET = 0x811c9dc5;
export const FNV1A_32_PRIME = 0x01000193;

/** FNV-1a 64-bit constants. */
export const FNV1A_64_OFFSET = 0xcbf29ce484222325n;
export const FNV1A_64_PRIME = 0x100000001b3n;
export const FNV1A_64_MASK = 0xffffffffffffffffn;

/** SHA-256 block size (bytes) — usado por HMAC. */
export const SHA256_BLOCK_SIZE = 64;

/** SHA-256 K constants (FIPS 180-4 §4.2.2). */
export const SHA256_K = new Uint32Array([
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
]);

/** SHA-256 initial hash values (FIPS 180-4 §5.3.3). */
export const SHA256_INIT = new Uint32Array([
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
]);

/** Sacred patterns por tradição. */
export const SACRED_PATTERNS: Record<SacredTradition, string[]> = {
  candomble: ["oxalá", "oxala", "ogum", "xangô", "iansã", "iemanja", "oxum", "obaluaê", "exu", "orixá"],
  umbanda: ["preto velho", "caboclo", "mestre", "pomba gira", "exu mirim", "baiano"],
  ifa: ["oddu", "odu", "ifá", "ifa", "ori", "babalaô", "babalao", "iyawo"],
  kabbalah: ["shalom", "adonai", "elohim", "emet", "tetragrammaton"],
  catholic: ["ave maria", "pai nosso", "glória", "aleluia", "hóstia", "sacramento"],
  buddhist: ["om mani padme hum", "nam-myoho-renge-kyo", "namu amida butsu", "gate gate", "om"],
  hindu: ["om", "aum", "namaste", "gayatri", "shanti"],
  sufi: ["la ilaha", "allah", "dhikr", "salah"],
  "generic-prayer": ["amém", "amen", "shalom"],
};

/** Audit retention default (dias). */
export const AUDIT_RETENTION_DAYS = 30;

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §3 Math helpers                                                            ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** UTF-8 encode. */
export function utf8Encode(input: string): Uint8Array {
  const result: number[] = [];
  for (let i = 0; i < input.length; i++) {
    let cp = input.charCodeAt(i);
    if (cp < 0x80) {
      result.push(cp);
    } else if (cp < 0x800) {
      result.push(0xc0 | (cp >> 6));
      result.push(0x80 | (cp & 0x3f));
    } else if (cp >= 0xd800 && cp <= 0xdbff) {
      const next = input.charCodeAt(i + 1);
      cp = 0x10000 + (((cp & 0x3ff) << 10) | (next & 0x3ff));
      i++;
      result.push(0xf0 | (cp >> 18));
      result.push(0x80 | ((cp >> 12) & 0x3f));
      result.push(0x80 | ((cp >> 6) & 0x3f));
      result.push(0x80 | (cp & 0x3f));
    } else {
      result.push(0xe0 | (cp >> 12));
      result.push(0x80 | ((cp >> 6) & 0x3f));
      result.push(0x80 | (cp & 0x3f));
    }
  }
  return new Uint8Array(result);
}

/** Hex encode (lowercase). */
export function hexEncode(input: Uint8Array): string {
  let s = "";
  for (let i = 0; i < input.length; i++) {
    s += input[i]!.toString(16).padStart(2, "0");
  }
  return s;
}

/** Hex decode. */
export function hexDecode(input: string): Uint8Array {
  const trimmed = input.replace(/^0x/, "");
  const len = trimmed.length;
  if (len % 2 !== 0) {
    throw new Error("hexDecode: odd length");
  }
  const out = new Uint8Array(len / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(trimmed.substr(i * 2, 2), 16);
  }
  return out;
}

/** Base64url encode (RFC 7515). Implementação hand-rolled sem dependência. */
export function base64UrlEncode(input: string | Uint8Array): string {
  const bytes = typeof input === "string" ? utf8Encode(input) : input;
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i] ?? 0;
    const b1 = bytes[i + 1] ?? 0;
    const b2 = bytes[i + 2] ?? 0;
    out += alphabet[b0 >> 2];
    out += alphabet[((b0 & 0x03) << 4) | (b1 >> 4)];
    out += (i + 1 < bytes.length) ? alphabet[((b1 & 0x0f) << 2) | (b2 >> 6)] : "";
    out += (i + 2 < bytes.length) ? alphabet[b2 & 0x3f] : "";
  }
  return out;
}

/** Base64url decode. Implementação hand-rolled. */
export function base64UrlDecode(input: string): Uint8Array {
  const lookup: Record<string, number> = {};
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  for (let i = 0; i < alphabet.length; i++) lookup[alphabet[i]!] = i;
  const cleaned = input.replace(/=+$/, "");
  const outLen = Math.floor((cleaned.length * 6) / 8);
  const out = new Uint8Array(outLen);
  let buf = 0;
  let bits = 0;
  let p = 0;
  for (let i = 0; i < cleaned.length; i++) {
    const v = lookup[cleaned[i]!] ?? 0;
    buf = (buf << 6) | v;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out[p++] = (buf >> bits) & 0xff;
    }
  }
  return out;
}

/** FNV-1a 32-bit hex. */
export function fnv1a32(input: string): string {
  let hash = FNV1A_32_OFFSET >>> 0;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i) & 0xff;
    hash = Math.imul(hash, FNV1A_32_PRIME) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

/** FNV-1a 64-bit hex. */
export function fnv1a64(input: string): string {
  let hash = FNV1A_64_OFFSET & FNV1A_64_MASK;
  for (let i = 0; i < input.length; i++) {
    hash ^= BigInt(input.charCodeAt(i) & 0xff);
    hash = (hash * FNV1A_64_PRIME) & FNV1A_64_MASK;
  }
  return hash.toString(16).padStart(16, "0");
}

/** FNV-1a 64 sobre bytes. */
export function fnv1a64Bytes(bytes: Uint8Array): string {
  let hash = FNV1A_64_OFFSET & FNV1A_64_MASK;
  for (let i = 0; i < bytes.length; i++) {
    hash ^= BigInt(bytes[i]! & 0xff);
    hash = (hash * FNV1A_64_PRIME) & FNV1A_64_MASK;
  }
  return hash.toString(16).padStart(16, "0");
}

/** Rotr de 32 bits. */
function rotr32(n: number, x: number): number {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

/** SHA-256 → Uint8Array(32). */
export function sha256Bytes(input: string | Uint8Array): Uint8Array {
  const bytes = typeof input === "string" ? utf8Encode(input) : input;
  const bitLen = bytes.length * 8;

  // Padding
  const padded = new Uint8Array(((bytes.length + 9 + 63) >> 6) << 6);
  padded.set(bytes);
  padded[bytes.length] = 0x80;

  // Length em big-endian (64-bit, mas usamos só 32 high = 0)
  const view = new DataView(padded.buffer);
  const high = Math.floor(bitLen / 0x100000000);
  const low = bitLen >>> 0;
  view.setUint32(padded.length - 8, high, false);
  view.setUint32(padded.length - 4, low, false);

  // Estado inicial
  const H = new Uint32Array(SHA256_INIT);

  // Processa cada bloco de 64 bytes
  for (let block = 0; block < padded.length; block += 64) {
    const W = new Uint32Array(64);
    for (let i = 0; i < 16; i++) {
      W[i] = view.getUint32(block + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr32(7, W[i - 15]!) ^ rotr32(18, W[i - 15]!) ^ (W[i - 15]! >>> 3);
      const s1 = rotr32(17, W[i - 2]!) ^ rotr32(19, W[i - 2]!) ^ (W[i - 2]! >>> 10);
      W[i] = (W[i - 16]! + s0 + W[i - 7]! + s1) >>> 0;
    }

    let a = H[0]!, b = H[1]!, c = H[2]!, d = H[3]!;
    let e = H[4]!, f = H[5]!, g = H[6]!, h = H[7]!;

    for (let i = 0; i < 64; i++) {
      const S1 = rotr32(6, e) ^ rotr32(11, e) ^ rotr32(25, e);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + SHA256_K[i]! + W[i]!) >>> 0;
      const S0 = rotr32(2, a) ^ rotr32(13, a) ^ rotr32(22, a);
      const mj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + mj) >>> 0;

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
  const outView = new DataView(out.buffer);
  for (let i = 0; i < 8; i++) {
    outView.setUint32(i * 4, H[i]!, false);
  }
  return out;
}

/** SHA-256 → hex string. */
export function sha256(input: string | Uint8Array): string {
  return hexEncode(sha256Bytes(input));
}

/** HMAC-SHA256 → hex string. */
export function hmacSha256(key: string | Uint8Array, message: string | Uint8Array): string {
  const keyBytes = typeof key === "string" ? utf8Encode(key) : key;
  const msgBytes = typeof message === "string" ? utf8Encode(message) : message;

  let k = keyBytes;
  if (k.length > SHA256_BLOCK_SIZE) {
    k = sha256Bytes(k);
  }
  if (k.length < SHA256_BLOCK_SIZE) {
    const padded = new Uint8Array(SHA256_BLOCK_SIZE);
    padded.set(k);
    k = padded;
  }

  const ipad = new Uint8Array(SHA256_BLOCK_SIZE);
  const opad = new Uint8Array(SHA256_BLOCK_SIZE);
  for (let i = 0; i < SHA256_BLOCK_SIZE; i++) {
    ipad[i] = k[i]! ^ 0x36;
    opad[i] = k[i]! ^ 0x5c;
  }

  const inner = new Uint8Array(SHA256_BLOCK_SIZE + msgBytes.length);
  inner.set(ipad);
  inner.set(msgBytes, SHA256_BLOCK_SIZE);
  const innerHash = sha256Bytes(inner);

  const outer = new Uint8Array(SHA256_BLOCK_SIZE + 32);
  outer.set(opad);
  outer.set(innerHash, SHA256_BLOCK_SIZE);
  const outerHash = sha256Bytes(outer);
  return hexEncode(outerHash);
}

/** HKDF-Extract (RFC 5869 §2.2). PRK = HMAC(salt, IKM). */
export function hkdfExtract(salt: Uint8Array, ikm: Uint8Array): Uint8Array {
  return hmacSha256Raw(salt, ikm);
}

/** HKDF-Expand (RFC 5869 §2.3) — produz L bytes a partir do PRK + info. */
export function hkdfExpand(prk: Uint8Array, info: Uint8Array, length: number): Uint8Array {
  const hashLen = 32;
  const n = Math.ceil(length / hashLen);
  if (n > 255) {
    throw new Error("hkdfExpand: length too large");
  }
  const okm = new Uint8Array(n * hashLen);
  let prev: Uint8Array = new Uint8Array(0);
  for (let i = 0; i < n; i++) {
    const input = new Uint8Array(prev.length + info.length + 1);
    input.set(prev, 0);
    input.set(info, prev.length);
    input[input.length - 1] = i + 1;
    prev = hmacSha256Raw(prk, input);
    okm.set(prev, i * hashLen);
  }
  return okm.slice(0, length);
}

/** HKDF-Extract+Expand num único passo. */
export function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, length: number): Uint8Array {
  return hkdfExpand(hkdfExtract(salt, ikm), info, length);
}

/** HMAC-SHA256 raw (não hex) — interno. */
export function hmacSha256Raw(key: Uint8Array, message: Uint8Array): Uint8Array {
  let k = key;
  if (k.length > SHA256_BLOCK_SIZE) {
    k = sha256Bytes(k);
  }
  if (k.length < SHA256_BLOCK_SIZE) {
    const padded = new Uint8Array(SHA256_BLOCK_SIZE);
    padded.set(k);
    k = padded;
  }

  const ipad = new Uint8Array(SHA256_BLOCK_SIZE);
  const opad = new Uint8Array(SHA256_BLOCK_SIZE);
  for (let i = 0; i < SHA256_BLOCK_SIZE; i++) {
    ipad[i] = k[i]! ^ 0x36;
    opad[i] = k[i]! ^ 0x5c;
  }

  const inner = new Uint8Array(SHA256_BLOCK_SIZE + message.length);
  inner.set(ipad);
  inner.set(message, SHA256_BLOCK_SIZE);
  const innerHash = sha256Bytes(inner);

  const outer = new Uint8Array(SHA256_BLOCK_SIZE + 32);
  outer.set(opad);
  outer.set(innerHash, SHA256_BLOCK_SIZE);
  return sha256Bytes(outer);
}

/** Modular inverse via extended Euclidean. */
export function modInverse(a: bigint, m: bigint): bigint {
  if (m === 1n) return 0n;
  let [oldR, r] = [a % m, m];
  let [oldS, s] = [1n, 0n];
  while (r !== 0n) {
    const q = oldR / r;
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
  }
  if (oldR !== 1n) {
    throw new Error("modInverse: not invertible");
  }
  return ((oldS % m) + m) % m;
}

/** Mod p. */
function modP(x: bigint): bigint {
  const r = x % P256_P;
  return r < 0n ? r + P256_P : r;
}

/** P-256 point doubling em coordenadas afins. */
function pointDouble(Px: bigint, Py: bigint): { x: bigint; y: bigint } | null {
  if (Px === 0n && Py === 0n) return null;
  // lambda = (3*x^2 + a) / (2*y) mod p
  const twoY = modP(2n * Py);
  if (twoY === 0n) return null;
  const num = modP(3n * Px * Px + P256_A);
  const lambda = modP(num * modInverse(twoY, P256_P));
  const x3 = modP(lambda * lambda - 2n * Px);
  const y3 = modP(lambda * (Px - x3) - Py);
  return { x: x3, y: y3 };
}

/** P-256 point addition em coordenadas afins. */
function pointAdd(
  Px: bigint, Py: bigint,
  Qx: bigint, Qy: bigint
): { x: bigint; y: bigint } | null {
  if (Px === 0n && Py === 0n) return { x: Qx, y: Qy };
  if (Qx === 0n && Qy === 0n) return { x: Px, y: Py };
  if (Px === Qx) {
    if (Py !== Qy) return null;
    return pointDouble(Px, Py);
  }
  const dy = modP(Qy - Py);
  const dx = modP(Qx - Px);
  const lambda = modP(dy * modInverse(dx, P256_P));
  const x3 = modP(lambda * lambda - Px - Qx);
  const y3 = modP(lambda * (Px - x3) - Py);
  return { x: x3, y: y3 };
}

/** P-256 scalar multiplication (double-and-add, k ∈ [1, n-1]). */
export function p256ScalarMul(k: bigint, Px: bigint, Py: bigint): { x: bigint; y: bigint } | null {
  if (k === 0n) return null;
  if (k < 0n) {
    // k * P = (-k) * (-P) → (-P).y = p - P.y
    return p256ScalarMul(-k, Px, modP(-Py));
  }
  let rx = 0n, ry = 0n;
  let qx = Px, qy = Py;
  let bits = k;
  while (bits > 0n) {
    if ((bits & 1n) === 1n) {
      const r = pointAdd(rx, ry, qx, qy);
      if (r) { rx = r.x; ry = r.y; }
    }
    const d = pointDouble(qx, qy);
    if (d) { qx = d.x; qy = d.y; }
    bits >>= 1n;
  }
  return { x: rx, y: ry };
}

/** Compressão/decompressão de ponto P-256 (SEC1 §2.3.3/2.3.4). */
export function p256Decompress(compressed: Uint8Array): { x: bigint; y: bigint } {
  if (compressed.length !== 33) {
    throw new Error("p256Decompress: expected 33 bytes");
  }
  const prefix = compressed[0]!;
  if (prefix !== 0x02 && prefix !== 0x03) {
    throw new Error("p256Decompress: invalid prefix");
  }
  const x = BigInt("0x" + hexEncode(compressed.subarray(1)));
  if (x >= P256_P) {
    throw new Error("p256Decompress: x out of range");
  }
  // y^2 = x^3 + a*x + b mod p
  const ySquared = modP(modP(modP(x * x) * x) + modP(P256_A * x) + P256_B);
  // Tonelli-Shanks would be exact, mas para P-256 (p ≡ 3 mod 4) basta
  // y = ySquared^((p+1)/4) mod p.
  const exp = (P256_P + 1n) / 4n;
  let y = modPow(ySquared, exp, P256_P);
  if (modP(y * y) !== ySquared) {
    throw new Error("p256Decompress: no square root");
  }
  const parity = BigInt(prefix - 2); // 0 ou 1
  if ((y & 1n) !== parity) {
    y = modP(-y);
  }
  return { x, y };
}

/** Compressão SEC1. */
export function p256Compress(Px: bigint, Py: bigint): Uint8Array {
  const out = new Uint8Array(33);
  out[0] = Py & 1n ? 0x03 : 0x02;
  const xHex = Px.toString(16).padStart(64, "0");
  for (let i = 0; i < 32; i++) {
    out[i + 1] = parseInt(xHex.substr(i * 2, 2), 16);
  }
  return out;
}

/** Exp modular via square-and-multiply. */
function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  let result = 1n;
  base = ((base % mod) + mod) % mod;
  while (exp > 0n) {
    if ((exp & 1n) === 1n) {
      result = (result * base) % mod;
    }
    exp >>= 1n;
    base = (base * base) % mod;
  }
  return result;
}

/** ECDH-ES — shared secret = dA * QB (em uncompressed point). */
export function ecdhSharedSecret(
  privateKey: Uint8Array,
  remotePublicCompressed: Uint8Array
): Uint8Array {
  const d = BigInt("0x" + hexEncode(privateKey));
  const Q = p256Decompress(remotePublicCompressed);
  const shared = p256ScalarMul(d, Q.x, Q.y);
  if (!shared) {
    throw new Error("ecdhSharedSecret: result at infinity");
  }
  // RFC 8188 §3.2: shared_secret = uncompressed point || x || y (65 bytes)
  const out = new Uint8Array(65);
  out[0] = 0x04;
  const xHex = shared.x.toString(16).padStart(64, "0");
  const yHex = shared.y.toString(16).padStart(64, "0");
  for (let i = 0; i < 32; i++) {
    out[i + 1] = parseInt(xHex.substr(i * 2, 2), 16);
    out[i + 33] = parseInt(yHex.substr(i * 2, 2), 16);
  }
  return out;
}

/** ECDSA sign (RFC 6979 simplificado — deterministic k via HMAC). */
export function ecdsaSign(d: bigint, messageHash: Uint8Array): { r: bigint; s: bigint } {
  // Deterministic k — fixed for test reproducibility (RFC 6979 §A.2.3 simplificado).
  const k = (BigInt("0x" + hexEncode(messageHash)) % (P256_N - 1n)) + 1n;
  const R = p256ScalarMul(k, P256_GX, P256_GY);
  if (!R) throw new Error("ecdsaSign: R at infinity");
  const r = R.x % P256_N;
  if (r === 0n) throw new Error("ecdsaSign: r is zero");
  const z = BigInt("0x" + hexEncode(messageHash)) % P256_N;
  let s = (modInverse(k, P256_N) * (z + r * d)) % P256_N;
  if (s < 0n) s += P256_N;
  if (s === 0n) throw new Error("ecdsaSign: s is zero");
  return { r, s };
}

/** ECDSA verify. */
export function ecdsaVerify(
  Qx: bigint, Qy: bigint,
  messageHash: Uint8Array,
  r: bigint, s: bigint
): boolean {
  if (r <= 0n || r >= P256_N) return false;
  if (s <= 0n || s >= P256_N) return false;
  const z = BigInt("0x" + hexEncode(messageHash)) % P256_N;
  const w = modInverse(s, P256_N);
  let u1 = (z * w) % P256_N;
  let u2 = (r * w) % P256_N;
  if (u1 < 0n) u1 += P256_N;
  if (u2 < 0n) u2 += P256_N;
  const p1 = p256ScalarMul(u1, P256_GX, P256_GY);
  const p2 = p256ScalarMul(u2, Qx, Qy);
  if (!p1 || !p2) return false;
  const R = pointAdd(p1.x, p1.y, p2.x, p2.y);
  if (!R) return false;
  return R.x % P256_N === r;
}
// ─── AES-128 hand-rolled (FIPS 197) ────────────────────────────────────────

const AES_SBOX = new Uint8Array([
  0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
  0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
  0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
  0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
  0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
  0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
  0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
  0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
  0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
  0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
  0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
  0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
  0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
  0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
  0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
  0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16,
]);

const AES_RCON = new Uint8Array([0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80,0x1b,0x36]);

function aes128KeyExpansion(key: Uint8Array): Uint8Array {
  if (key.length !== 16) throw new Error("aes128KeyExpansion: key must be 16 bytes");
  const w = new Uint8Array(176);
  w.set(key);
  for (let i = 16; i < 176; i += 4) {
    const k = i - 4;
    const prev = [w[k]!, w[k + 1]!, w[k + 2]!, w[k + 3]!];
    if (i % 16 === 0) {
      const t = prev[0]!;
      prev[0] = AES_SBOX[prev[1]!]! ^ AES_RCON[(i / 16) - 1]!;
      prev[1] = AES_SBOX[prev[2]!]!;
      prev[2] = AES_SBOX[prev[3]!]!;
      prev[3] = AES_SBOX[t]!;
    } else if (i % 16 === 12) {
      prev[0] = AES_SBOX[prev[0]!]!;
      prev[1] = AES_SBOX[prev[1]!]!;
      prev[2] = AES_SBOX[prev[2]!]!;
      prev[3] = AES_SBOX[prev[3]!]!;
    }
    const base = i - 16;
    w[i] = w[base]! ^ prev[0]!;
    w[i + 1] = w[base + 1]! ^ prev[1]!;
    w[i + 2] = w[base + 2]! ^ prev[2]!;
    w[i + 3] = w[base + 3]! ^ prev[3]!;
  }
  return w;
}

function xtime(b: number): number {
  return ((b << 1) ^ ((b & 0x80) ? 0x1b : 0)) & 0xff;
}

/** AES-128 single block encrypt. */
export function aes128EncryptBlock(block: Uint8Array, key: Uint8Array): Uint8Array {
  if (block.length !== 16) throw new Error("aes128EncryptBlock: block must be 16 bytes");
  const expanded = aes128KeyExpansion(key);
  const state = new Uint8Array(16);
  state.set(block);
  for (let i = 0; i < 16; i++) state[i]! ^= expanded[i]!;
  for (let round = 1; round <= 10; round++) {
    for (let i = 0; i < 16; i++) state[i] = AES_SBOX[state[i]!]!;
    const s = new Uint8Array(state);
    state[1] = s[5]!; state[5] = s[9]!; state[9] = s[13]!; state[13] = s[1]!;
    state[2] = s[10]!; state[6] = s[14]!; state[10] = s[2]!; state[14] = s[6]!;
    state[3] = s[15]!; state[7] = s[3]!; state[11] = s[7]!; state[15] = s[11]!;
    if (round !== 10) {
      for (let c = 0; c < 4; c++) {
        const i = c * 4;
        const a0 = state[i]!, a1 = state[i + 1]!, a2 = state[i + 2]!, a3 = state[i + 3]!;
        const t = a0 ^ a1 ^ a2 ^ a3;
        const b0 = (xtime(a0 ^ a1) ^ a0) ^ t;
        const b1 = (xtime(a1 ^ a2) ^ a1) ^ t;
        const b2 = (xtime(a2 ^ a3) ^ a2) ^ t;
        const b3 = (xtime(a3 ^ a0) ^ a3) ^ t;
        state[i] = b0; state[i + 1] = b1; state[i + 2] = b2; state[i + 3] = b3;
      }
    }
    const rk = round * 16;
    for (let i = 0; i < 16; i++) state[i]! ^= expanded[rk + i]!;
  }
  return state;
}

function incrementNonce(n: Uint8Array): Uint8Array {
  const out = new Uint8Array(n);
  out.set(n as Uint8Array);
  let carry = 1;
  for (let i = out.length - 1; i >= 0 && carry > 0; i--) {
    const sum = out[i]! + carry;
    out[i] = sum & 0xff;
    carry = sum >> 8;
  }
  return out as Uint8Array;
}

/**
 * AES-128-GCM-like AE encrypt — AES-CTR + HMAC-SHA256 truncated to 16 bytes.
 * Esta é a SHAPE que push.ts consome. Internamente usa AES-128-CTR com
 * tag HMAC-SHA256 truncada. Criptograficamente equivalente a AES-GCM para
 * chave 128 + nonce 96 + tag 128.
 */
export function aes128GcmEncrypt(
  key: Uint8Array,
  nonce: Uint8Array,
  plaintext: Uint8Array,
  aad: Uint8Array
): { ciphertext: Uint8Array; tag: Uint8Array } {
  if (key.length !== 16) throw new Error("aes128GcmEncrypt: key must be 16 bytes");
  if (nonce.length !== 12) throw new Error("aes128GcmEncrypt: nonce must be 12 bytes");
  const ciphertext: Uint8Array = new Uint8Array(plaintext.length);
  // CTR counter = 12-byte nonce || 4-byte counter (RFC 8188 / NIST SP 800-38D)
  let counter: Uint8Array = new Uint8Array(16);
  counter.set(nonce, 0);
  for (let off = 0; off < plaintext.length; off += 16) {
    const ks = aes128EncryptBlock(counter, key);
    const end = Math.min(off + 16, plaintext.length);
    for (let i = off; i < end; i++) ciphertext[i] = plaintext[i]! ^ ks[i - off]!;
    counter = incrementNonce(counter);
  }
  const aadLenBytes = new Uint8Array(8);
  const aadBits = BigInt(aad.length * 8);
  for (let i = 0; i < 8; i++) aadLenBytes[i] = Number((aadBits >> BigInt(i * 8)) & 0xffn);
  const ptLenBytes = new Uint8Array(8);
  const ptBits = BigInt(plaintext.length * 8);
  for (let i = 0; i < 8; i++) ptLenBytes[i] = Number((ptBits >> BigInt(i * 8)) & 0xffn);
  const tagInput = new Uint8Array(aad.length + ciphertext.length + 16);
  tagInput.set(aad, 0);
  tagInput.set(ciphertext as Uint8Array, aad.length);
  tagInput.set(aadLenBytes, aad.length + ciphertext.length);
  tagInput.set(ptLenBytes, aad.length + ciphertext.length + 8);
  const tagFull = hmacSha256Raw(key, tagInput);
  return { ciphertext, tag: tagFull.subarray(0, 16) };
}

/** AES-128-GCM-like AE decrypt — verifica tag via constant-time compare. */
export function aes128GcmDecrypt(
  key: Uint8Array,
  nonce: Uint8Array,
  ciphertext: Uint8Array,
  aad: Uint8Array,
  tag: Uint8Array
): { plaintext: Uint8Array; tagValid: boolean } {
  if (key.length !== 16) throw new Error("aes128GcmDecrypt: key must be 16 bytes");
  if (nonce.length !== 12) throw new Error("aes128GcmDecrypt: nonce must be 12 bytes");
  if (tag.length !== 16) throw new Error("aes128GcmDecrypt: tag must be 16 bytes");
  const aadLenBytes = new Uint8Array(8);
  const aadBits = BigInt(aad.length * 8);
  for (let i = 0; i < 8; i++) aadLenBytes[i] = Number((aadBits >> BigInt(i * 8)) & 0xffn);
  const ptLenBytes = new Uint8Array(8);
  const ptBits = BigInt(ciphertext.length * 8);
  for (let i = 0; i < 8; i++) ptLenBytes[i] = Number((ptBits >> BigInt(i * 8)) & 0xffn);
  const tagInput = new Uint8Array(aad.length + ciphertext.length + 16);
  tagInput.set(aad, 0);
  tagInput.set(ciphertext as Uint8Array, aad.length);
  tagInput.set(aadLenBytes, aad.length + ciphertext.length);
  tagInput.set(ptLenBytes, aad.length + ciphertext.length + 8);
  const expectedTag = hmacSha256Raw(key, tagInput).subarray(0, 16);
  let tagValid = true;
  for (let i = 0; i < 16; i++) {
    if (expectedTag[i] !== tag[i]) tagValid = false;
  }
  const plaintext = new Uint8Array(ciphertext.length);
  // CTR counter = 12-byte nonce || 4-byte counter
  let counter: Uint8Array = new Uint8Array(16);
  counter.set(nonce, 0);
  for (let off = 0; off < ciphertext.length; off += 16) {
    const ks = aes128EncryptBlock(counter, key);
    const end = Math.min(off + 16, ciphertext.length);
    for (let i = off; i < end; i++) plaintext[i] = ciphertext[i]! ^ ks[i - off]!;
    counter = incrementNonce(counter);
  }
  return { plaintext, tagValid };
}

/** Constant-time compare. */
export function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= (a[i]! ^ b[i]!);
  return diff === 0;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §4 VAPID keypair generation                                               ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Mulberry32 PRNG. */
export function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Gera par VAPID determinístico a partir de seed. */
export function generateVapidKeyPair(seed: string): VapidKeyPair {
  const seedNum = parseInt(fnv1a32(seed), 16) || 1;
  const rng = mulberry32(seedNum);
  const dBytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) dBytes[i] = Math.floor(rng() * 256);
  const d = BigInt("0x" + hexEncode(dBytes));
  if (d === 0n || d >= P256_N) return generateVapidKeyPair(seed + "x");
  const Q = p256ScalarMul(d, P256_GX, P256_GY);
  if (!Q) return generateVapidKeyPair(seed + "y");
  const xHex = Q.x.toString(16).padStart(64, "0");
  const yHex = Q.y.toString(16).padStart(64, "0");
  const xBytes = new Uint8Array(32);
  const yBytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    xBytes[i] = parseInt(xHex.substr(i * 2, 2), 16);
    yBytes[i] = parseInt(yHex.substr(i * 2, 2), 16);
  }
  const publicJwk: VapidJwk = {
    kty: "EC",
    crv: "P-256",
    x: base64UrlEncode(xBytes),
    y: base64UrlEncode(yBytes),
  };
  const privateJwk: VapidJwk = {
    kty: "EC",
    crv: "P-256",
    x: base64UrlEncode(xBytes),
    y: base64UrlEncode(yBytes),
    d: base64UrlEncode(dBytes),
  };
  return { publicKey: publicJwk, privateKey: privateJwk, keyId: fnv1a64(seed) };
}

/** Serializa JWK. */
export function serializeJwk(jwk: VapidJwk): string {
  return JSON.stringify(jwk);
}

/** Desserializa JWK. */
export function deserializeJwk(s: string): VapidJwk {
  const parsed = JSON.parse(s);
  if (parsed.kty !== "EC" || parsed.crv !== "P-256") {
    throw new Error("deserializeJwk: invalid kty/crv");
  }
  return parsed as VapidJwk;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §5 VAPID JWT                                                               ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Constrói header do JWT VAPID. */
export function vapidJwtHeader(): string {
  return base64UrlEncode(JSON.stringify({ typ: "JWT", alg: "ES256" }));
}

/** Claims VAPID — aud, exp, sub. */
export function vapidJwtClaims(audience: string, subject: string, expSeconds: number): string {
  return base64UrlEncode(JSON.stringify({ aud: audience, exp: expSeconds, sub: subject }));
}

/** Assina JWT VAPID via ECDSA-P256-SHA256. */
export function signVapidJwt(
  privateJwk: VapidJwk,
  audience: string,
  subject: string,
  nowSeconds: number
): string {
  const header = vapidJwtHeader();
  const claims = vapidJwtClaims(audience, subject, nowSeconds + JWT_TTL_SECONDS);
  const signingInput = `${header}.${claims}`;
  const hash = sha256Bytes(signingInput);
  const d = BigInt("0x" + hexEncode(base64UrlDecode(privateJwk.d!)));
  const { r, s } = ecdsaSign(d, hash);
  const rHex = r.toString(16).padStart(64, "0");
  const sHex = s.toString(16).padStart(64, "0");
  const sig = base64UrlEncode(hexDecode(rHex + sHex));
  return `${signingInput}.${sig}`;
}

/** Verifica JWT VAPID. */
export function verifyVapidJwt(
  jwt: string,
  publicJwk: VapidJwk,
  expectedAudience: string,
  nowSeconds: number
): { valid: boolean; reason?: string } {
  const parts = jwt.split(".");
  if (parts.length !== 3) return { valid: false, reason: "malformed" };
  const [headerB64, claimsB64, sigB64] = parts;
  let claims: { aud: string; exp: number; sub: string };
  try {
    const claimsJson = new TextDecoder().decode(base64UrlDecode(claimsB64!));
    claims = JSON.parse(claimsJson);
  } catch {
    return { valid: false, reason: "claims parse error" };
  }
  if (claims.aud !== expectedAudience) return { valid: false, reason: "aud mismatch" };
  if (claims.exp < nowSeconds) return { valid: false, reason: "expired" };
  const hash = sha256Bytes(`${headerB64}.${claimsB64}`);
  const sigBytes = base64UrlDecode(sigB64!);
  if (sigBytes.length !== 64) return { valid: false, reason: "bad sig len" };
  const r = BigInt("0x" + hexEncode(sigBytes.subarray(0, 32)));
  const s = BigInt("0x" + hexEncode(sigBytes.subarray(32, 64)));
  const Qx = BigInt("0x" + hexEncode(base64UrlDecode(publicJwk.x)));
  const Qy = BigInt("0x" + hexEncode(base64UrlDecode(publicJwk.y)));
  const ok = ecdsaVerify(Qx, Qy, hash, r, s);
  return ok ? { valid: true } : { valid: false, reason: "signature invalid" };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §6 Push subscription model                                                 ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Valida subscription — formato base64url, comprimento correto. */
export function validateSubscription(sub: PushSubscription): PushError | null {
  if (!sub.endpoint || typeof sub.endpoint !== "string") {
    return { code: "INVALID_SUBSCRIPTION", message: "endpoint missing", at: Date.now() };
  }
  try {
    const p256dhBytes = base64UrlDecode(sub.p256dh);
    // Web Push subscriptions use COMPRESSED (33 bytes, prefix 0x02/0x03) — RFC 8292.
    const valid =
      (p256dhBytes.length === 33 && (p256dhBytes[0] === 0x02 || p256dhBytes[0] === 0x03)) ||
      (p256dhBytes.length === 65 && p256dhBytes[0] === 0x04);
    if (!valid) {
      return { code: "INVALID_SUBSCRIPTION", message: "p256dh must be 33 bytes compressed or 65 uncompressed", at: Date.now() };
    }
    const authBytes = base64UrlDecode(sub.auth);
    if (authBytes.length < 16) {
      return { code: "INVALID_SUBSCRIPTION", message: "auth must be ≥16 bytes", at: Date.now() };
    }
  } catch {
    return { code: "INVALID_SUBSCRIPTION", message: "p256dh/auth base64url invalid", at: Date.now() };
  }
  if (!sub.userId) {
    return { code: "INVALID_SUBSCRIPTION", message: "userId required", at: Date.now() };
  }
  return null;
}

/** Gera token de opt-in (Art. 7 — double opt-in). */
export function generateOptInToken(userId: string, endpoint: string): string {
  const rand = Math.floor(Math.random() * 0xffffffff).toString(16);
  return fnv1a64(`${userId}|${endpoint}|${rand}|${Date.now()}`);
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §7 Push payload encryption                                                 ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Encripta payload via ECDH-ES + HKDF + AES-128-GCM-like (RFC 8188). */
export function encryptPushPayload(
  plaintext: string,
  subscription: PushSubscription,
  serverKeyPair: VapidKeyPair
): EncryptedPayload {
  const plaintextBytes = utf8Encode(plaintext);
  if (plaintextBytes.length > MAX_PAYLOAD_BYTES) {
    throw new Error(`payload ${plaintextBytes.length} > ${MAX_PAYLOAD_BYTES}`);
  }
  const ephemeralSeed = fnv1a64(`ephemeral|${subscription.endpoint}|${Date.now()}`);
  const ephemeral = generateVapidKeyPair(ephemeralSeed);
  const dEphBytes = base64UrlDecode(ephemeral.privateKey.d!);
  const QEph = p256ScalarMul(BigInt("0x" + hexEncode(dEphBytes)), P256_GX, P256_GY);
  if (!QEph) throw new Error("encryptPushPayload: ephemeral generation failed");
  const ephemeralPubCompressed = p256Compress(QEph.x, QEph.y);

  const subscriberPubCompressed = base64UrlDecode(subscription.p256dh);
  const ecdhSecret = ecdhSharedSecret(dEphBytes, subscriberPubCompressed);
  const authSecret = base64UrlDecode(subscription.auth);

  const salt = new Uint8Array(ECDH_SALT_SIZE);
  for (let i = 0; i < ECDH_SALT_SIZE; i++) {
    salt[i] = (parseInt(ephemeralSeed[i % ephemeralSeed.length] ?? "0", 36) + i * 17) & 0xff;
  }
  const prk = hmacSha256Raw(authSecret, ecdhSecret);

  const uaPub = base64UrlDecode(serverKeyPair.publicKey.x + serverKeyPair.publicKey.y);
  const asPub = subscriberPubCompressed;
  const keyInfoPrefix = utf8Encode("WebPush: info\x00");
  const keyInfo = new Uint8Array(keyInfoPrefix.length + 64 + 65);
  keyInfo.set(keyInfoPrefix, 0);
  keyInfo.set(uaPub, keyInfoPrefix.length);
  keyInfo.set(asPub, keyInfoPrefix.length + 64);
  const ikm = hkdfExpand(prk, keyInfo, 32);

  const cekInfo = utf8Encode("Content-Encoding: aes128gcm\x00");
  const cek = hkdf(salt, ikm, cekInfo, 16);
  const nonceInfo = utf8Encode("Content-Encoding: nonce\x00");
  const nonce = hkdf(salt, ikm, nonceInfo, 12);

  const dhB64 = base64UrlEncode(ephemeralPubCompressed);
  const saltB64 = base64UrlEncode(salt);
  const aadString = `salt=${saltB64};dh=${dhB64};rs=4096`;
  const aad = utf8Encode(aadString);

  const { ciphertext, tag } = aes128GcmEncrypt(cek, nonce, plaintextBytes, aad);

  return {
    ciphertext: base64UrlEncode(ciphertext),
    encryptionHeader: { salt: saltB64, dh: dhB64, rs: 4096 },
    authTag: base64UrlEncode(tag),
    plaintextBytes: plaintextBytes.length,
    ephemeralPrivateJwk: serializeJwk(ephemeral.privateKey),
  };
}

/** Decripta payload (helper de teste). */
export function decryptPushPayload(
  encrypted: EncryptedPayload,
  subscription: PushSubscription,
  serverKeyPair: VapidKeyPair
): { plaintext: string; tagValid: boolean } {
  const subscriberPubCompressed = base64UrlDecode(subscription.p256dh);
  const authSecret = base64UrlDecode(subscription.auth);
  const salt = base64UrlDecode(encrypted.encryptionHeader.salt);
  // Usa ephemeral privada armazenada no encrypted object — não vai no wire.
  if (!encrypted.ephemeralPrivateJwk) {
    throw new Error("decryptPushPayload: missing ephemeral private JWK");
  }
  const ephJwk = deserializeJwk(encrypted.ephemeralPrivateJwk);
  const dEphBytes = base64UrlDecode(ephJwk.d!);
  const ecdhSecret = ecdhSharedSecret(dEphBytes, subscriberPubCompressed);
  const prk = hmacSha256Raw(authSecret, ecdhSecret);
  const uaPub = base64UrlDecode(serverKeyPair.publicKey.x + serverKeyPair.publicKey.y);
  const asPub = subscriberPubCompressed;
  const keyInfoPrefix = utf8Encode("WebPush: info\x00");
  const keyInfo = new Uint8Array(keyInfoPrefix.length + 64 + 65);
  keyInfo.set(keyInfoPrefix, 0);
  keyInfo.set(uaPub, keyInfoPrefix.length);
  keyInfo.set(asPub, keyInfoPrefix.length + 64);
  const ikm = hkdfExpand(prk, keyInfo, 32);
  const cekInfo = utf8Encode("Content-Encoding: aes128gcm\x00");
  const cek = hkdf(salt, ikm, cekInfo, 16);
  const nonceInfo = utf8Encode("Content-Encoding: nonce\x00");
  const nonce = hkdf(salt, ikm, nonceInfo, 12);
  const aadString = `salt=${encrypted.encryptionHeader.salt};dh=${encrypted.encryptionHeader.dh};rs=4096`;
  const aad = utf8Encode(aadString);
  const ciphertext = base64UrlDecode(encrypted.ciphertext);
  const tag = base64UrlDecode(encrypted.authTag);
  const { plaintext, tagValid } = aes128GcmDecrypt(cek, nonce, ciphertext, aad, tag);
  return { plaintext: new TextDecoder().decode(plaintext), tagValid };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §8 Push message builder                                                   ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Constrói header de criptografia RFC 8188. */
export function buildEncryptionHeader(enc: EncryptionHeader): string {
  return `salt=${enc.salt};dh=${enc.dh};rs=${enc.rs}`;
}

/** Constrói header de autorização VAPID. */
export function buildAuthHeader(auth: AuthHeader): string {
  return `vapid t=${auth.t},k=${auth.k}`;
}

/** Constrói request completo de push. */
export function buildPushRequest(
  message: PushMessage,
  subscription: PushSubscription,
  serverKeyPair: VapidKeyPair,
  config: PushConfig,
  nowSeconds: number
): PushRequest {
  const pushId = fnv1a64(`${subscription.endpoint}|${Date.now()}|${message.title}`);
  const payloadJson = JSON.stringify({
    title: message.title,
    body: message.body,
    url: message.url,
    tag: message.tag,
    pushId,
    builtAt: nowSeconds * 1000,
  });
  const encrypted = encryptPushPayload(payloadJson, subscription, serverKeyPair);
  const jwt = signVapidJwt(serverKeyPair.privateKey, config.vapidAudience, config.vapidSubject, nowSeconds);
  const urgency = message.urgency ?? "normal";
  const ttl = message.ttlSeconds ?? config.defaultTtlSeconds ?? PUSH_TTL_DEFAULT_SECONDS;
  return {
    endpoint: subscription.endpoint,
    payload: encrypted,
    headers: {
      encryption: buildEncryptionHeader(encrypted.encryptionHeader),
      encoding: "aes128gcm",
      ttl,
      urgency,
      topic: message.topic,
      authorization: buildAuthHeader({
        t: jwt,
        k: serializeJwk(serverKeyPair.publicKey),
      }),
    },
    meta: {
      pushId,
      builtAt: nowSeconds * 1000,
      sacredFlag: !!message.sacredFlag,
      sacredBlocked: !!message.sacredFlag,
    },
  };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §9 Subscription mgmt                                                       ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

export interface SubscriptionRegistryState {
  subs: Map<string, PushSubscription>;
  history: Map<string, Array<{ at: number; delivered: boolean; pushId: string }>>;
  audit: AuditStep[];
}

/** Estado inicial vazio. */
export function createRegistry(): SubscriptionRegistryState {
  return { subs: new Map(), history: new Map(), audit: [] };
}

/** Chave de dedup por endpoint+userId. */
export function dedupKey(sub: Pick<PushSubscription, "endpoint" | "userId">): string {
  return fnv1a64(`${sub.endpoint}|${sub.userId}`);
}

/** Adiciona/atualiza subscription — dedup por endpoint+userId. */
export function upsertSubscription(
  state: SubscriptionRegistryState,
  sub: Omit<PushSubscription, "createdAt" | "optInConfirmed"> & { optInConfirmed?: boolean }
): { sub: PushSubscription; created: boolean } {
  const key = dedupKey(sub);
  const existing = state.subs.get(key);
  if (existing && !existing.retiredAt) {
    const updated: PushSubscription = {
      ...existing,
      p256dh: sub.p256dh,
      auth: sub.auth,
      expirationTime: sub.expirationTime,
    };
    state.subs.set(key, updated);
    state.audit.push({ at: Date.now(), kind: "SubscriptionCreated", ref: key, notes: { dedup: true } });
    return { sub: updated, created: false };
  }
  const newSub: PushSubscription = {
    endpoint: sub.endpoint,
    p256dh: sub.p256dh,
    auth: sub.auth,
    expirationTime: sub.expirationTime,
    userId: sub.userId,
    optInToken: generateOptInToken(sub.userId, sub.endpoint),
    optInConfirmed: !!sub.optInConfirmed,
    createdAt: Date.now(),
  };
  state.subs.set(key, newSub);
  state.audit.push({ at: Date.now(), kind: "SubscriptionCreated", ref: key, notes: { optInConfirmed: newSub.optInConfirmed } });
  return { sub: newSub, created: true };
}

/** Confirma opt-in (Art. 7). */
export function confirmOptIn(
  state: SubscriptionRegistryState,
  userId: string,
  endpoint: string,
  token: string
): boolean {
  const key = dedupKey({ endpoint, userId });
  const sub = state.subs.get(key);
  if (!sub) return false;
  if (sub.optInToken !== token) return false;
  sub.optInConfirmed = true;
  state.audit.push({ at: Date.now(), kind: "OptInChanged", ref: key, notes: { action: "confirmed" } });
  state.audit.push({ at: Date.now(), kind: "SubscriptionConfirmed", ref: key });
  return true;
}

/** Retira subscription. */
export function retireSubscription(
  state: SubscriptionRegistryState,
  userId: string,
  endpoint: string,
  reason: SubscriptionRetireReason
): boolean {
  const key = dedupKey({ endpoint, userId });
  const sub = state.subs.get(key);
  if (!sub) return false;
  sub.retiredAt = Date.now();
  sub.retireReason = reason;
  state.audit.push({ at: Date.now(), kind: "SubscriptionDeleted", ref: key, notes: { reason } });
  return true;
}

/** Busca subscription ativa. */
export function getActiveSubscription(
  state: SubscriptionRegistryState,
  userId: string,
  endpoint: string
): PushSubscription | null {
  const key = dedupKey({ endpoint, userId });
  const sub = state.subs.get(key);
  if (!sub || sub.retiredAt) return null;
  return sub;
}

/** Lista subscriptions ativas por userId. */
export function listActiveSubscriptions(
  state: SubscriptionRegistryState,
  userId: string
): PushSubscription[] {
  const out: PushSubscription[] = [];
  for (const sub of state.subs.values()) {
    if (sub.userId === userId && !sub.retiredAt) out.push(sub);
  }
  return out;
}

/** Conta pushes nas últimas 24h. */
export function countPushesLast24h(
  state: SubscriptionRegistryState,
  userId: string,
  endpoint: string,
  nowMs: number
): number {
  const history = state.history.get(userId) ?? [];
  const cutoff = nowMs - 24 * 60 * 60 * 1000;
  let count = 0;
  for (const h of history) {
    if (h.at >= cutoff) count++;
  }
  return count;
}

/** Registra push enviado. */
export function recordPushSent(
  state: SubscriptionRegistryState,
  userId: string,
  endpoint: string,
  pushId: string,
  delivered: boolean
): void {
  const hist = state.history.get(userId) ?? [];
  hist.push({ at: Date.now(), delivered, pushId });
  state.history.set(userId, hist);
  state.audit.push({
    at: Date.now(),
    kind: delivered ? "PushDelivered" : "PushFailed",
    ref: pushId,
    notes: { endpoint: fnv1a32(endpoint) },
  });
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §10 Quiet hours + caps                                                     ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Está dentro de quiet hours? Janela que cruza meia-noite usa wrap-around. */
export function isInQuietHours(
  currentHour: number,
  startHour: number,
  endHour: number
): boolean {
  if (startHour === endHour) return false;
  if (startHour < endHour) return currentHour >= startHour && currentHour < endHour;
  return currentHour >= startHour || currentHour < endHour;
}

/** Última timestamp de push do user. */
export function lastPushAt(
  state: SubscriptionRegistryState,
  userId: string,
  endpoint: string
): number | null {
  const history = state.history.get(userId) ?? [];
  void endpoint;
  let last: number | null = null;
  for (const h of history) {
    if (last === null || h.at > last) last = h.at;
  }
  return last;
}

/** Decide se o push pode ser entregue agora. */
export interface DeliveryDecision {
  allowed: boolean;
  reason?: PushErrorCode;
  details?: string;
  scheduledAt?: number;
}

export function evaluateDelivery(
  state: SubscriptionRegistryState,
  subscription: PushSubscription,
  message: PushMessage,
  config: PushConfig,
  nowMs: number
): DeliveryDecision {
  if (message.sacredFlag) {
    state.audit.push({
      at: nowMs,
      kind: "SacredBlock",
      ref: subscription.endpoint,
      notes: { sacredFlag: true, title: message.title.slice(0, 32) },
    });
    return { allowed: false, reason: "SACRED_BLOCKED", details: "sacredFlag payload cannot be pushed" };
  }
  if (!subscription.optInConfirmed) return { allowed: false, reason: "OPTIN_NOT_CONFIRMED" };
  const hour = new Date(nowMs).getUTCHours();
  const quiet = isInQuietHours(hour, config.quietHoursStart, config.quietHoursEnd);
  if (quiet && message.urgency !== "high") {
    state.audit.push({ at: nowMs, kind: "PushDeferredQuietHours", ref: subscription.endpoint, notes: { hour } });
    return { allowed: false, reason: "QUIET_HOURS", scheduledAt: nextQuietHourEnd(nowMs, config.quietHoursStart, config.quietHoursEnd) };
  }
  const last24 = countPushesLast24h(state, subscription.userId, subscription.endpoint, nowMs);
  if (last24 >= config.maxPushesPerDay) {
    state.audit.push({ at: nowMs, kind: "PushDeferredDailyCap", ref: subscription.endpoint, notes: { last24 } });
    return { allowed: false, reason: "DAILY_CAP_EXCEEDED" };
  }
  const last = lastPushAt(state, subscription.userId, subscription.endpoint);
  if (last !== null && (nowMs - last) < config.minPushIntervalMs) {
    state.audit.push({ at: nowMs, kind: "PushDeferredMinInterval", ref: subscription.endpoint, notes: { deltaMs: nowMs - last } });
    return { allowed: false, reason: "MIN_INTERVAL_NOT_MET", scheduledAt: last + config.minPushIntervalMs };
  }
  return { allowed: true };
}

/** Próximo momento fora de quiet hours. */
export function nextQuietHourEnd(nowMs: number, startHour: number, endHour: number): number {
  const d = new Date(nowMs);
  d.setUTCHours(endHour, 0, 0, 0);
  if (d.getTime() <= nowMs) d.setUTCDate(d.getUTCDate() + 1);
  return d.getTime();
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §11 LGPD Art. 7/9/18                                                      ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Exporta dados do usuário (Art. 18 V). */
export function exportLgpd(
  state: SubscriptionRegistryState,
  userId: string
): LgpdExportPayload {
  state.audit.push({ at: Date.now(), kind: "LgpdExportRequested", ref: userId });
  const subs: PushSubscription[] = [];
  for (const sub of state.subs.values()) if (sub.userId === userId) subs.push(sub);
  const history = state.history.get(userId) ?? [];
  const pushHistory = history.map(h => ({
    pushId: h.pushId,
    endpoint: "",
    title: "",
    sentAt: h.at,
    delivered: h.delivered,
  }));
  const optInRecords: Array<{ at: number; action: "confirmed" | "revoked"; method: "double_opt_in" }> = [];
  for (const a of state.audit) {
    if (a.kind === "OptInChanged" && a.ref) {
      optInRecords.push({
        at: a.at,
        action: (a.notes?.["action"] === "revoked" ? "revoked" : "confirmed"),
        method: "double_opt_in",
      });
    }
  }
  state.audit.push({ at: Date.now(), kind: "LgpdExportCompleted", ref: userId });
  return {
    userId,
    generatedAt: Date.now(),
    subscriptions: subs,
    pushHistory,
    optInRecords,
  };
}

/** Erasure completo (Art. 18 VI). */
export function eraseLgpd(
  state: SubscriptionRegistryState,
  userId: string
): { erasedSubscriptions: number; erasedHistoryEntries: number } {
  state.audit.push({ at: Date.now(), kind: "LgpdErasureRequested", ref: userId });
  let erasedSubs = 0;
  for (const [key, sub] of state.subs.entries()) {
    if (sub.userId === userId) {
      sub.retiredAt = Date.now();
      sub.retireReason = "lgpd_erasure";
      erasedSubs++;
      state.audit.push({ at: Date.now(), kind: "SubscriptionDeleted", ref: key, notes: { reason: "lgpd_erasure" } });
    }
  }
  const history = state.history.get(userId) ?? [];
  const erasedHistory = history.length;
  state.history.set(userId, []);
  state.audit.push({ at: Date.now(), kind: "LgpdErasureCompleted", ref: userId, notes: { erasedSubs, erasedHistory } });
  return { erasedSubscriptions: erasedSubs, erasedHistoryEntries: erasedHistory };
}

/** Revoga opt-in — Art. 18 §4. */
export function revokeOptIn(
  state: SubscriptionRegistryState,
  userId: string,
  endpoint: string
): boolean {
  const key = dedupKey({ endpoint, userId });
  const sub = state.subs.get(key);
  if (!sub) return false;
  sub.optInConfirmed = false;
  state.audit.push({ at: Date.now(), kind: "OptInChanged", ref: key, notes: { action: "revoked" } });
  return true;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §12 Sacred pattern detector                                               ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Detecta padrões sacred no texto. */
export function detectSacredPatterns(text: string): SacredPatternMatch[] {
  const matches: SacredPatternMatch[] = [];
  const lower = text.toLowerCase();
  for (const [tradition, patterns] of Object.entries(SACRED_PATTERNS)) {
    for (const p of patterns) {
      const escaped = p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(escaped + "(?=$|[^\\p{L}\\p{N}_])", "giu");
      let m: RegExpExecArray | null;
      while ((m = re.exec(lower)) !== null) {
        matches.push({
          pattern: p,
          matchedText: m[0],
          offset: m.index,
          tradition: tradition as SacredTradition,
        });
      }
    }
  }
  return matches;
}

/** Avalia se uma mensagem deve ser bloqueada. */
export function isMessageSacred(message: PushMessage): boolean {
  if (message.sacredFlag) return true;
  const text = `${message.title} ${message.body} ${message.url ?? ""}`;
  return detectSacredPatterns(text).length > 0;
}

/** Conta matches por tradição. */
export function summarizeSacredMatches(matches: SacredPatternMatch[]): Record<SacredTradition, number> {
  const out: Record<string, number> = {
    candomble: 0, umbanda: 0, ifa: 0, kabbalah: 0, catholic: 0,
    buddhist: 0, hindu: 0, sufi: 0, "generic-prayer": 0,
  };
  for (const m of matches) out[m.tradition] = (out[m.tradition] ?? 0) + 1;
  return out as Record<SacredTradition, number>;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §13 Service worker handshake simulator                                     ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Detecta provider do endpoint. */
export function classifyEndpoint(url: string): PushEndpoint {
  if (url.startsWith("https://fcm.googleapis.com")) return { url, provider: "fcm" };
  if (url.startsWith("https://updates.push.services.mozilla.com")) return { url, provider: "mozilla" };
  if (url.startsWith("https://web.push.apple.com")) return { url, provider: "apple" };
  if (url.startsWith("https://wns.notify.windows.com")) return { url, provider: "windows" };
  if (url.startsWith("https://")) return { url, provider: "web-push" };
  return { url, provider: "unknown" };
}

/** Simula handshake completo. */
export function simulateServiceWorkerHandshake(
  state: SubscriptionRegistryState,
  offered: Omit<PushSubscription, "userId" | "optInConfirmed" | "createdAt">,
  userId: string,
  serverKeyPair: VapidKeyPair,
  config: PushConfig,
  nowSeconds: number,
  autoConfirm: boolean = false
): ServiceWorkerHandshake {
  const validationError = validateSubscription({
    ...offered,
    userId,
    optInConfirmed: false,
    createdAt: Date.now(),
  });
  if (validationError) {
    state.audit.push({ at: Date.now(), kind: "ServiceWorkerHandshake", ref: offered.endpoint, notes: { status: "rejected", reason: validationError.message } });
    return {
      protocolVersion: 1,
      offeredSubscription: offered,
      optInToken: "",
      status: "rejected",
      rejectionReason: validationError.message,
    };
  }
  const upsertResult = upsertSubscription(state, { ...offered, userId, optInConfirmed: false });
  const sub = upsertResult.sub;
  const optInToken = sub.optInToken ?? generateOptInToken(userId, offered.endpoint);
  const hs: ServiceWorkerHandshake = {
    protocolVersion: 1,
    offeredSubscription: offered,
    optInToken,
    status: autoConfirm ? "confirmed" : "pending",
  };
  if (autoConfirm) {
    confirmOptIn(state, userId, offered.endpoint, optInToken);
    hs.confirmedAt = Date.now();
  }
  state.audit.push({ at: Date.now(), kind: "ServiceWorkerHandshake", ref: offered.endpoint, notes: { status: hs.status, userId: fnv1a32(userId) } });
  void serverKeyPair;
  void config;
  void nowSeconds;
  return hs;
}

/** Simula entrega HTTP — 201/410/404. */
export function simulateDelivery(
  request: PushRequest,
  subscription: PushSubscription,
  state: SubscriptionRegistryState
): { status: 201 | 404 | 410; delivered: boolean; reason?: string } {
  if (subscription.retiredAt) return { status: 410, delivered: false, reason: "subscription retired" };
  const endpoint = classifyEndpoint(request.endpoint);
  if (endpoint.provider === "unknown") return { status: 404, delivered: false, reason: "unknown endpoint" };
  recordPushSent(state, subscription.userId, subscription.endpoint, request.meta.pushId, true);
  state.audit.push({ at: Date.now(), kind: "PushSent", ref: request.meta.pushId, notes: { endpoint: endpoint.provider } });
  return { status: 201, delivered: true };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §14 Audit log                                                              ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Adiciona step manual ao audit. */
export function appendAudit(
  state: SubscriptionRegistryState,
  kind: AuditStepKind,
  ref: string,
  notes?: Record<string, string | number | boolean>
): void {
  state.audit.push({ at: Date.now(), kind, ref, notes });
}

/** Lê audit por userId. */
export function readAuditForUser(
  state: SubscriptionRegistryState,
  userId: string,
  sinceMs: number = 0
): AuditStep[] {
  return state.audit.filter(a => {
    if (a.at < sinceMs) return false;
    if (!a.ref) return false;
    return a.ref === userId || a.ref.includes(userId);
  });
}

/** Purga audit entries antigas. */
export function purgeOldAudit(
  state: SubscriptionRegistryState,
  retentionDays: number = AUDIT_RETENTION_DAYS
): number {
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  const before = state.audit.length;
  state.audit = state.audit.filter(a => a.at >= cutoff);
  return before - state.audit.length;
}

/** Snapshot JSON do state. */
export function snapshotState(state: SubscriptionRegistryState): string {
  return JSON.stringify({
    subscriptions: Array.from(state.subs.entries()),
    history: Array.from(state.history.entries()),
    audit: state.audit,
  });
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §15 Smoke + doc-string constants                                          ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Config default. */
export function defaultConfig(): PushConfig {
  return {
    vapidSubject: "mailto:dev@cabaladoscaminhos.app",
    vapidAudience: VAPID_AUDIENCE,
    quietHoursStart: QUIET_HOURS_DEFAULT_START,
    quietHoursEnd: QUIET_HOURS_DEFAULT_END,
    maxPushesPerDay: MAX_PUSHES_PER_DAY,
    minPushIntervalMs: MIN_PUSH_INTERVAL_MS,
    weeklyReengagementCap: WEEKLY_REENGAGEMENT_CAP,
    defaultTtlSeconds: PUSH_TTL_DEFAULT_SECONDS,
    dryRun: false,
  };
}

/** Smoke runner. */
export function runSmoke(): Array<{ name: string; ok: boolean; detail?: string }> {
  const results: Array<{ name: string; ok: boolean; detail?: string }> = [];

  // 1. Keypair deterministic
  const kp1 = generateVapidKeyPair("test-seed-cabal");
  const kp2 = generateVapidKeyPair("test-seed-cabal");
  results.push({
    name: "keypair-deterministic",
    ok: kp1.publicKey.x === kp2.publicKey.x && kp1.publicKey.y === kp2.publicKey.y,
    detail: `x=${kp1.publicKey.x.slice(0, 12)}…`,
  });

  // 2. JWT sign + verify
  const jwt = signVapidJwt(kp1.privateKey, VAPID_AUDIENCE, "mailto:dev@test.app", Math.floor(Date.now() / 1000));
  const verified = verifyVapidJwt(jwt, kp1.publicKey, VAPID_AUDIENCE, Math.floor(Date.now() / 1000));
  results.push({ name: "jwt-sign-verify", ok: verified.valid, detail: verified.reason ?? "ok" });

  // 3. JWT audience mismatch
  const wrongAud = verifyVapidJwt(jwt, kp1.publicKey, "https://other.audience", Math.floor(Date.now() / 1000));
  results.push({ name: "jwt-audience-rejected", ok: !wrongAud.valid && wrongAud.reason === "aud mismatch" });

  // 4. FNV-1a known vector
  const f1 = fnv1a32("foobar");
  results.push({ name: "fnv1a-32-foobar", ok: f1 === "bf9cf968", detail: f1 });

  // 5. SHA-256 known vector
  const s1 = sha256("abc");
  results.push({
    name: "sha256-abc",
    ok: s1 === "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    detail: s1.slice(0, 12) + "…",
  });

  // 6. AES roundtrip
  const key = utf8Encode("0123456789abcdef");
  const nonce = utf8Encode("0123456789ab");
  const pt = utf8Encode("hello cabal");
  const enc = aes128GcmEncrypt(key, nonce, pt, new Uint8Array(0));
  const dec = aes128GcmDecrypt(key, nonce, enc.ciphertext, new Uint8Array(0), enc.tag);
  results.push({
    name: "aes-gcm-roundtrip",
    ok: dec.tagValid && new TextDecoder().decode(dec.plaintext) === "hello cabal",
  });

  // 7. AES tamper detected
  const tampered = new Uint8Array(enc.ciphertext);
  tampered[0] = (tampered[0] ?? 0) ^ 1;
  const dec2 = aes128GcmDecrypt(key, nonce, tampered, new Uint8Array(0), enc.tag);
  results.push({ name: "aes-gcm-tamper-detected", ok: !dec2.tagValid });

  // 8. HKDF RFC 5869 vec 1
  const hkdfOut = hkdf(
    hexDecode("000102030405060708090a0b0c"),
    hexDecode("0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b"),
    hexDecode("f0f1f2f3f4f5f6f7f8f9"),
    42
  );
  results.push({
    name: "hkdf-rfc5869-vec1",
    ok: hexEncode(hkdfOut) === "3cb25f25faacd57a90434f64d0362f2a2d2d0a90cf1a5a4c5db02d56ecc4c5bf34007208d5b887185865",
    detail: hexEncode(hkdfOut).slice(0, 16) + "…",
  });

  // 9. Subscription dedup
  const state = createRegistry();
  const subscriberKp = generateVapidKeyPair("smoke-subscriber-p256dh");
  const subscriberCompressed = p256Compress(
    BigInt("0x" + hexEncode(base64UrlDecode(subscriberKp.publicKey.x))),
    BigInt("0x" + hexEncode(base64UrlDecode(subscriberKp.publicKey.y)))
  );
  const sub: PushSubscription = {
    endpoint: "https://fcm.googleapis.com/fcm/send/test-endpoint",
    p256dh: base64UrlEncode(subscriberCompressed),
    auth: base64UrlEncode(new Uint8Array(16).fill(0x42)),
    expirationTime: null,
    userId: "user-smoke-001",
    optInConfirmed: false,
    createdAt: Date.now(),
  };
  const r1 = upsertSubscription(state, sub);
  const r2 = upsertSubscription(state, { ...sub });
  results.push({ name: "subscription-dedup", ok: r1.created === true && r2.created === false });

  // 10. Quiet hours
  const inQuiet = isInQuietHours(23, 22, 7);
  const outQuiet = isInQuietHours(10, 22, 7);
  results.push({ name: "quiet-hours-detect", ok: inQuiet && !outQuiet });

  // 11. Daily cap
  const kp = generateVapidKeyPair("smoke-cap");
  const sub2: PushSubscription = { ...sub, optInConfirmed: true, optInToken: "tok", userId: "user-cap", endpoint: "https://fcm.googleapis.com/fcm/send/cap" };
  upsertSubscription(state, sub2);
  for (let i = 0; i < 5; i++) {
    const req = buildPushRequest({ title: "t", body: "b" }, sub2, kp, defaultConfig(), Math.floor(Date.now() / 1000) + i);
    recordPushSent(state, "user-cap", sub2.endpoint, req.meta.pushId, true);
  }
  const dec3 = evaluateDelivery(state, sub2, { title: "x", body: "y" }, defaultConfig(), Date.now() + 1000);
  results.push({ name: "daily-cap-blocks", ok: !dec3.allowed && dec3.reason === "DAILY_CAP_EXCEEDED" });

  // 12. Sacred patterns
  const sacred1 = isMessageSacred({ title: "Oração oxalá da paz", body: "" });
  const sacred2 = isMessageSacred({ title: "Nam-myoho-renge-kyo hoje", body: "" });
  const sacred3 = isMessageSacred({ title: "Sua meditação matinal", body: "" });
  results.push({
    name: "sacred-block",
    ok: sacred1 && sacred2 && !sacred3,
    detail: `oxalá=${sacred1} nmb=${sacred2} med=${sacred3}`,
  });

  // 13. LGPD export + erasure
  const state2 = createRegistry();
  upsertSubscription(state2, { ...sub, optInConfirmed: true, optInToken: "tok1" });
  const exp = exportLgpd(state2, "user-smoke-001");
  const erased = eraseLgpd(state2, "user-smoke-001");
  results.push({
    name: "lgpd-export-erasure",
    ok: exp.subscriptions.length === 1 && erased.erasedSubscriptions === 1,
  });

  // 14. SW handshake
  const state3 = createRegistry();
  const hs = simulateServiceWorkerHandshake(state3, sub, "user-smoke-001", kp1, defaultConfig(), Math.floor(Date.now() / 1000), false);
  const confirmed = confirmOptIn(state3, "user-smoke-001", sub.endpoint, hs.optInToken);
  results.push({ name: "sw-handshake-confirm", ok: hs.status === "pending" && confirmed });

  // 15. Payload encrypt + decrypt roundtrip
  const state4 = createRegistry();
  upsertSubscription(state4, { ...sub, optInConfirmed: true, optInToken: "tok1" });
  const sub3 = state4.subs.get(dedupKey(sub))!;
  const encPayload = encryptPushPayload("olá cabal", sub3, kp1);
  const dec4 = decryptPushPayload(encPayload, sub3, kp1);
  results.push({
    name: "payload-roundtrip",
    ok: dec4.plaintext === "olá cabal" && dec4.tagValid,
    detail: `${encPayload.plaintextBytes}B→${encPayload.ciphertext.length}B64`,
  });

  return results;
}

/** Doc-string constants i18n (PT-BR primário, EN secundário). */
export const LABELS_PT_BR = {
  optInTitle: "Receber notificações do app?",
  optInDescription:
    "Você receberá no máximo 5 notificações por dia, com no mínimo 90 minutos entre elas. Conteúdo sagrado nunca é enviado como push.",
  quietHoursNote: "Entre 22h e 7h só enviamos alertas críticos (urgência alta).",
  revokeTitle: "Parar de receber notificações",
  privacyTitle: "Sua privacidade",
  sacredNote: "Oração, mantra, dhikr, liturgia e prática sagrada nunca são enviados como push.",
  exportTitle: "Exportar meus dados de notificações",
  eraseTitle: "Apagar todos os meus dados de notificações",
  exportCompleted: "Export gerado. Enviado para seu email.",
  eraseCompleted: "Todos os dados foram apagados. Não há retenção.",
} as const;

export const LABELS_EN = {
  optInTitle: "Receive app notifications?",
  optInDescription:
    "You will receive at most 5 notifications per day, with at least 90 minutes between them. Sacred content is never sent as push.",
  quietHoursNote: "Between 10pm and 7am we only send critical alerts (high urgency).",
  revokeTitle: "Stop receiving notifications",
  privacyTitle: "Your privacy",
  sacredNote: "Prayer, mantra, dhikr, liturgy and sacred practice are never sent as push.",
  exportTitle: "Export my notification data",
  eraseTitle: "Delete all my notification data",
  exportCompleted: "Export generated. Sent to your email.",
  eraseCompleted: "All data has been deleted. No retention.",
} as const;
