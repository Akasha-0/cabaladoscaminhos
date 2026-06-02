// src/lib/auth/operator-totp.ts
// TOTP (RFC 6238) + AES-256-GCM encryption + recovery codes para
// MFA de Operators ADMIN — Fase 20.
//
// Escopo: gerar / verificar códigos TOTP de 6 dígitos a 30s, e
// cifrar/decifrar o secret para armazenamento no DB. Nenhuma chamada
// de rede, nenhuma dependência de relógio remoto — tudo local.
//
// Bibliotecas:
//   - otpauth  → TOTP RFC 6238 (gera e valida códigos)
//   - qrcode   → gera o QR code da URL otpauth:// que apps
//                autenticadores leem (Google Authenticator, Authy, 1P)
//
// Modelo de ameaça:
//   1. DB leak: secret TOTP cifrado com AES-256-GCM. Sem
//      `MFA_ENCRYPTION_KEY` (env), atacante não consegue gerar códigos.
//   2. Endpoint interceptado: o secret NUNCA é devolvido na response
//      após setup. Só é exposto no `setup` inicial e nunca mais.
//   3. Replay: códigos TOTP têm janela de 30s. Implementamos drift
//      de ±1 passo (RFC 6238 §5.2 recomenda aceitar 1 passo antes/
//      depois) para mitigar drift legítimo de relógio.
//   4. Recovery codes: bcrypt no DB, single-use. Operador que perde
//      o app pode usar 1 dos 10 para entrar; deve rotacionar depois.

import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { TOTP, Secret } from 'otpauth';
import QRCode from 'qrcode';

// ============================================================================
// Constantes
// ============================================================================

/** Issuer exibido no app autenticador. */
// fallow-ignore-next-line unused-export
export const MFA_ISSUER = 'Cabala dos Caminhos';
/** Tamanho do secret TOTP em bytes (20 = 160 bits, RFC 4226 recomenda ≥ 128). */
// fallow-ignore-next-line unused-export
export const TOTP_SECRET_BYTES = 20;
/** Dígitos do código TOTP. */
// fallow-ignore-next-line unused-export
export const TOTP_DIGITS = 6;
/** Período do código em segundos. */
// fallow-ignore-next-line unused-export
export const TOTP_PERIOD_SECONDS = 30;
/** Algoritmo de hash TOTP. */
// fallow-ignore-next-line unused-export
export const TOTP_ALGORITHM = 'SHA1' as const;
/**
 * Drift permitido em passos (RFC 6238 §5.2): aceita o passo anterior
 * e o próximo. Para período de 30s, isso dá ±30s de tolerância.
// fallow-ignore-next-line unused-export
export const TOTP_DRIFT_STEPS = 1;

/** Quantidade de recovery codes gerados no setup. */
export const RECOVERY_CODE_COUNT = 10;

/** Tamanho da chave AES-256 (32 bytes). */
const AES_KEY_BYTES = 32;
/** Tamanho do IV AES-GCM (12 bytes é o recomendado pelo NIST). */
const AES_IV_BYTES = 12;
/** Tamanho do auth tag AES-GCM (16 bytes). */
const AES_TAG_BYTES = 16;

// ============================================================================
// Tipos
// ============================================================================

/**
 * Resultado da verificação de um código TOTP. Inclui o "passo
 * delta" para permitir single-use (rejeitar códigos já consumidos
 * dentro da janela de drift).
 */
export type TotpVerifyResult =
  | { ok: true; delta: number; stepUsed: number }
  | { ok: false; reason: 'invalid' | 'expired' };

/**
 * Resultado da descriptografia. Se falhar (key errada, IV inválido,
 * tag MISMATCH), retorna `null` e a operação deve ser tratada como
 * erro de integridade — NÃO cair para fallback.
 */
export type DecryptResult = { ok: true; plaintext: string } | { ok: false; reason: 'malformed' | 'tag-mismatch' };

// ============================================================================
// Erros
// ============================================================================
 
/** Lançado quando a MFA_ENCRYPTION_KEY não está configurada (em prod). */
// fallow-ignore-next-line unused-export
export class MfaKeyMissingError extends Error {
  constructor() {
    super(
      'MFA_ENCRYPTION_KEY não está configurada. Defina env var (32 bytes hex/base64) antes de iniciar o servidor.'
    );
    this.name = 'MfaKeyMissingError';
  }
}

// ============================================================================
// Encryption key (AES-256-GCM)
// ============================================================================

/**
 * Resolve a chave de criptografia a partir de `MFA_ENCRYPTION_KEY`.
 * Aceita hex (64 chars) ou base64 (44 chars com padding).
 *
 * Em dev/test, gera uma chave aleatória por processo e avisa — não
 * persiste, então secret gravado antes do restart fica irrecuperável
 * (intencional: força setup de novo MFA em dev).
 */
// fallow-ignore-next-line complexity
function getEncryptionKey(): Buffer {
  const raw = process.env.MFA_ENCRYPTION_KEY;
  if (!raw || raw === '') {
    if (process.env.NODE_ENV === 'production') {
      throw new MfaKeyMissingError();
    }
    if (typeof console !== 'undefined') {
      console.warn(
        '[operator-totp] MFA_ENCRYPTION_KEY ausente — usando chave aleatória DEV ONLY. ' +
          'Dados MFA gravados não sobreviverão ao restart do processo.'
      );
    }
    return crypto.randomBytes(AES_KEY_BYTES);
  }

  // Tenta hex primeiro (mais comum em envs)
  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    return Buffer.from(raw, 'hex');
  }
  // Depois base64 (32 bytes → ~44 chars)
  try {
    const buf = Buffer.from(raw, 'base64');
    if (buf.length === AES_KEY_BYTES) return buf;
  } catch {
    // ignore
  }
  // Fallback: trata como string raw e faz SHA-256 → 32 bytes.
  // Aceita qualquer string, mas perde o benefício de seed determinístico.
  if (typeof console !== 'undefined') {
    console.warn(
      '[operator-totp] MFA_ENCRYPTION_KEY não está em hex(64) nem base64(32B). ' +
        'Aplicando SHA-256 para derivar 32 bytes. Use formato canônico em prod.'
    );
  }
  return crypto.createHash('sha256').update(raw).digest();
}

// ============================================================================
// TOTP secret gen
// ============================================================================

/**
 * Gera um secret TOTP em base32 (compatível com Google Authenticator,
 * Authy, 1Password, etc.). 20 bytes = 32 chars base32.
 */
export function generateTotpSecret(): string {
  const bytes = crypto.randomBytes(TOTP_SECRET_BYTES);
  const secret = new Secret({ buffer: bytes });
  return secret.base32;
}

/**
 * Constrói a URL `otpauth://` que será codificada no QR code.
 * Formato padrão: `otpauth://totp/ISSUER:ACCOUNT?secret=...&issuer=...&algorithm=...&digits=...&period=...`
 */
export function buildOtpAuthUrl(params: {
  secret: string;
  accountName: string; // ex: email do operator
}): string {
  const totp = new TOTP({
    issuer: MFA_ISSUER,
    label: params.accountName,
    algorithm: TOTP_ALGORITHM,
    digits: TOTP_DIGITS,
    period: TOTP_PERIOD_SECONDS,
    secret: Secret.fromBase32(params.secret),
  });
  return totp.toString();
}

/**
 * Gera o QR code (PNG data URL) para a URL otpauth.
 * Retorna `data:image/png;base64,...` pronto para `<img src=...>`.
 */
export async function generateQrCodeDataUrl(otpauthUrl: string): Promise<string> {
  return QRCode.toDataURL(otpauthUrl, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 256,
    color: { dark: '#000000', light: '#ffffff' },
  });
}

// ============================================================================
// AES-256-GCM encrypt / decrypt
// ============================================================================

/**
 * Cifra o secret TOTP com AES-256-GCM. Formato armazenado:
 *   "iv:authTag:ciphertext" (hex de cada parte).
 *
 * IV é aleatório a cada encrypt (NUNCA reuse com mesma key).
 * authTag garante integridade — qualquer adulteração do ciphertext
 * (ou do IV) faz verify falhar.
 */
export function encryptSecret(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(AES_IV_BYTES);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${enc.toString('hex')}`;
}

/**
 * Decifra um secret cifrado com `encryptSecret`. Retorna `null` se
 * o formato for inválido ou o auth tag não bater.
 *
 * IMPORTANTE: auth tag mismatch aqui é INDICATIVO de adulteração ou
 * key errada — nunca tratar como warning silencioso. A camada acima
 * (operator-mfa.ts) deve falhar fechado.
// fallow-ignore-next-line complexity
 */
export function decryptSecret(stored: string): DecryptResult {
  const parts = stored.split(':');
  if (parts.length !== 3) return { ok: false, reason: 'malformed' };
  const [ivHex, tagHex, encHex] = parts;
  if (!ivHex || !tagHex || !encHex) return { ok: false, reason: 'malformed' };
  if (ivHex.length !== AES_IV_BYTES * 2) return { ok: false, reason: 'malformed' };
  if (tagHex.length !== AES_TAG_BYTES * 2) return { ok: false, reason: 'malformed' };

  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const enc = Buffer.from(encHex, 'hex');

  try {
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
    return { ok: true, plaintext: dec.toString('utf8') };
  } catch {
    // createDecipheriv.final() throws if auth tag mismatch.
    return { ok: false, reason: 'tag-mismatch' };
  }
}

// ============================================================================
// TOTP code verify
// ============================================================================

/**
 * Verifica um código TOTP de 6 dígitos contra o secret.
 *
 * @param delta    drift permitido em passos (default: TOTP_DRIFT_STEPS = 1).
 *                 Janela efetiva: `[-delta, +delta]` passos.
 *
 * Retorna `{ ok: true, delta, stepUsed }` se o código bater, ou
 * `{ ok: false, reason }` caso contrário. NÃO revela se a diferença
 * é de formato vs expiração vs drift — apenas 'invalid' genérico.
 *
 * Single-use é responsabilidade da camada acima: depois de chamar
 * `verifyTotpCode` com sucesso, a app DEVE persistir o `stepUsed`
 * e rejeitar códigos no mesmo step.
 */
export function verifyTotpCode(params: {
  secretBase32: string;
  code: string;
  now?: Date;
  delta?: number;
}): TotpVerifyResult {
  const { secretBase32, code } = params;
  // Sanitiza: aceita só 6 dígitos
  if (!/^\d{6}$/.test(code)) return { ok: false, reason: 'invalid' };
  const now = params.now ?? new Date();
  const delta = params.delta ?? TOTP_DRIFT_STEPS;
  const totp = new TOTP({
    algorithm: TOTP_ALGORITHM,
    digits: TOTP_DIGITS,
    period: TOTP_PERIOD_SECONDS,
    secret: Secret.fromBase32(secretBase32),
  });
  const stepNow = Math.floor(now.getTime() / 1000 / TOTP_PERIOD_SECONDS);
  // Verifica cada passo da janela de drift
  for (let i = -delta; i <= delta; i++) {
    const step = stepNow + i;
    const expected = totp.generate({ timestamp: step * TOTP_PERIOD_SECONDS * 1000 });
    if (timingSafeEqual(expected, code)) {
      return { ok: true, delta: i, stepUsed: step };
    }
  }
  return { ok: false, reason: 'invalid' };
}

/** Comparação constant-time para evitar timing attacks. */
function timingSafeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

// ============================================================================
// Recovery codes
// ============================================================================

/**
 * Gera `RECOVERY_CODE_COUNT` recovery codes single-use.
 * Formato: 16 chars hex (8 bytes) sem separadores.
 * Retorna o array de códigos EM PLAIN TEXT (mostrar UMA vez no setup).
 */
export function generateRecoveryCodes(): string[] {
  return Array.from({ length: RECOVERY_CODE_COUNT }, () =>
    crypto.randomBytes(RECOVERY_CODE_BYTES).toString('hex')
  );
}

/**
 * Hash bcrypt de um recovery code. Custo 10 — alinhado com passwordHash
 * dos Operators (mesmo módulo bcryptjs). Não retorna o plain.
 */
export async function hashRecoveryCode(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

/**
 * Tenta usar um recovery code do pool.
 *
 *   - Se `code` bater com algum slot e o slot não estiver consumido,
 *     retorna o índice do slot para a camada superior poder marcá-lo
 *     como consumido (substitui por "").
 *   - Se nenhum slot bater ou todos já consumidos, retorna `null`.
 *
 * A comparação é feita com bcrypt (lento por design). Single-use é
 * responsabilidade da camada superior: depois de usar, persistir
// fallow-ignore-next-line complexity
 * o array com `codes[index] = ""` para invalidar o slot.
 */
export async function tryConsumeRecoveryCode(
  codes: string[], // bcrypt hashes (length = RECOVERY_CODE_COUNT)
  plain: string
): Promise<number | null> {
  if (codes.length !== RECOVERY_CODE_COUNT) return null;
  for (let i = 0; i < codes.length; i++) {
    const hash = codes[i];
    if (!hash || hash === '') continue; // slot já consumido
    try {
      const match = await bcrypt.compare(plain, hash);
      if (match) return i;
    } catch {
      // hash malformado — pula este slot
      continue;
    }
  }
  return null;
}

// Re-exports para testes
// fallow-ignore-next-line unused-export
export const __TEST__ = {
  AES_TAG_BYTES,
  AES_KEY_BYTES,
};