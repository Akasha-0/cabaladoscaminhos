// tests/lib/auth/operator-totp.test.ts
// Testes do helper de TOTP + AES-256-GCM (Fase 20).
// Cobre: secret gen, buildOtpAuthUrl, encrypt/decrypt roundtrip,
// AES-GCM tag mismatch, code verify (válido, expirado, drift),
// recovery code gen + hash + consume.

import { describe, it, expect, beforeEach } from 'vitest';
import { TOTP, Secret } from 'otpauth';
import {
  TOTP_DIGITS,
  TOTP_PERIOD_SECONDS,
  TOTP_SECRET_BYTES,
  buildOtpAuthUrl,
  decryptSecret,
  encryptSecret,
  generateRecoveryCodes,
  generateTotpSecret,
  hashRecoveryCode,
  verifyTotpCode,
  tryConsumeRecoveryCode,
  RECOVERY_CODE_COUNT,
  MFA_ISSUER,
} from '@/lib/auth/operator-totp';

beforeEach(() => {
  // FIXTURE: key de teste determinística (32 bytes hex).
  process.env.MFA_ENCRYPTION_KEY = 'a'.repeat(64);
});

// ============================================================================
// Secret gen
// ============================================================================

describe('generateTotpSecret', () => {
  it('gera secret base32 com tamanho esperado (160 bits = 32 chars)', () => {
    const s = generateTotpSecret();
    // 20 bytes = 160 bits → base32 (5 bits/char) → 32 chars
    expect(s.length).toBe(32);
    // Caracteres válidos base32
    expect(s).toMatch(/^[A-Z2-7]+$/);
  });

  it('gera secrets únicos a cada chamada (aleatoriedade)', () => {
    const a = generateTotpSecret();
    const b = generateTotpSecret();
    const c = generateTotpSecret();
    expect(a).not.toBe(b);
    expect(b).not.toBe(c);
    expect(a).not.toBe(c);
  });

  it('usa 20 bytes (160 bits) de entropia', () => {
    const s = generateTotpSecret();
    // 20 bytes = 160 bits → base32 (5 bits/char) → 32 chars
    expect(TOTP_SECRET_BYTES).toBe(20);
    expect(s.length).toBe(32);
  });
});

// ============================================================================
// buildOtpAuthUrl
// ============================================================================

describe('buildOtpAuthUrl', () => {
  it('gera URL otpauth:// válida com issuer e accountName', () => {
    const secret = generateTotpSecret();
    const url = buildOtpAuthUrl({ secret, accountName: 'admin@cabala.com' });
    expect(url).toMatch(/^otpauth:\/\/totp\//);
    expect(url).toContain(encodeURIComponent(MFA_ISSUER));
    expect(url).toContain('admin%40cabala.com');
    expect(url).toContain('algorithm=SHA1');
    expect(url).toContain(`digits=${TOTP_DIGITS}`);
    expect(url).toContain(`period=${TOTP_PERIOD_SECONDS}`);
    expect(url).toContain(`secret=${secret}`);
  });
});

// ============================================================================
// AES-256-GCM encrypt / decrypt
// ============================================================================

describe('encryptSecret / decryptSecret', () => {
  it('roundtrip: encrypt → decrypt devolve o plaintext', () => {
    const plain = 'JBSWY3DPEHPK3PXP';
    const stored = encryptSecret(plain);
    const result = decryptSecret(stored);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.plaintext).toBe(plain);
    }
  });

  it('stored format é "iv:authTag:ciphertext" (hex)', () => {
    const stored = encryptSecret('hello');
    const parts = stored.split(':');
    expect(parts).toHaveLength(3);
    // IV: 12 bytes = 24 hex chars
    expect(parts[0]).toHaveLength(24);
    // Tag: 16 bytes = 32 hex chars
    expect(parts[1]).toHaveLength(32);
    // Ciphertext: variável
    expect(parts[2]).toMatch(/^[0-9a-f]+$/);
  });

  it('cada encrypt usa IV diferente (aleatoriedade)', () => {
    const a = encryptSecret('same');
    const b = encryptSecret('same');
    expect(a).not.toBe(b);
    // Mas ambos decifram para o mesmo plaintext
    expect(decryptSecret(a)).toEqual({ ok: true, plaintext: 'same' });
    expect(decryptSecret(b)).toEqual({ ok: true, plaintext: 'same' });
  });

  it('tag-mismatch: adulterar ciphertext falha com reason=tag-mismatch', () => {
    const stored = encryptSecret('secret123');
    const parts = stored.split(':');
    // Adultera 1 byte do ciphertext
    const tamperedCipher = parts[2].slice(0, -2) + (parts[2].endsWith('ab') ? 'cd' : 'ab');
    const tampered = `${parts[0]}:${parts[1]}:${tamperedCipher}`;
    const result = decryptSecret(tampered);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('tag-mismatch');
  });

  it('tag-mismatch: adulterar IV falha', () => {
    const stored = encryptSecret('secret123');
    const parts = stored.split(':');
    // Inverte o IV (muda 1 byte)
    const ivBytes = Buffer.from(parts[0], 'hex');
    ivBytes[0] = ivBytes[0] ^ 0xff;
    const tampered = `${ivBytes.toString('hex')}:${parts[1]}:${parts[2]}`;
    const result = decryptSecret(tampered);
    expect(result.ok).toBe(false);
  });

  it('format inválido → reason=malformed', () => {
    const r1 = decryptSecret('not-a-valid-format');
    expect(r1.ok).toBe(false);
    if (!r1.ok) expect(r1.reason).toBe('malformed');

    const r2 = decryptSecret('aa:bb'); // só 2 partes
    expect(r2.ok).toBe(false);
    if (!r2.ok) expect(r2.reason).toBe('malformed');

    const r3 = decryptSecret('aa:bb:cc:dd'); // 4 partes
    expect(r3.ok).toBe(false);
  });
});

// ============================================================================
// verifyTotpCode
// ============================================================================

describe('verifyTotpCode', () => {
  function freshTotp(): string {
    return generateTotpSecret();
  }

  it('código válido bate → ok=true, stepUsed definido', () => {
    const secret = freshTotp();
    const totp = new TOTP({
      secret: Secret.fromBase32(secret),
      digits: TOTP_DIGITS,
      period: TOTP_PERIOD_SECONDS,
      algorithm: 'SHA1',
    });
    const code = totp.generate();
    const result = verifyTotpCode({ secretBase32: secret, code });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.stepUsed).toBeGreaterThan(0);
      expect([-1, 0, 1]).toContain(result.delta);
    }
  });

  it('código errado → ok=false, reason=invalid', () => {
    const secret = freshTotp();
    const result = verifyTotpCode({ secretBase32: secret, code: '000000' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('invalid');
  });

  it('formato inválido (não-6-dígitos) → reason=invalid', () => {
    const secret = freshTotp();
    expect(verifyTotpCode({ secretBase32: secret, code: '12345' }).ok).toBe(false);
    expect(verifyTotpCode({ secretBase32: secret, code: '1234567' }).ok).toBe(false);
    expect(verifyTotpCode({ secretBase32: secret, code: 'abcdef' }).ok).toBe(false);
    expect(verifyTotpCode({ secretBase32: secret, code: '' }).ok).toBe(false);
  });

  it('drift de ±1 passo é aceito (±30s)', () => {
    const secret = freshTotp();
    const totp = new TOTP({
      secret: Secret.fromBase32(secret),
      digits: TOTP_DIGITS,
      period: TOTP_PERIOD_SECONDS,
      algorithm: 'SHA1',
    });
    // Gera código para "agora + 30s" (próximo passo)
    const future = Date.now() + TOTP_PERIOD_SECONDS * 1000;
    const code = totp.generate({ timestamp: future });
    // Verifica com `now` = atual (delta=+1)
    const result = verifyTotpCode({ secretBase32: secret, code });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.delta).toBe(1);
  });

  it('código de 2 passos atrás é rejeitado (delta=2)', () => {
    const secret = freshTotp();
    const totp = new TOTP({
      secret: Secret.fromBase32(secret),
      digits: TOTP_DIGITS,
      period: TOTP_PERIOD_SECONDS,
      algorithm: 'SHA1',
    });
    // Gera código para "agora - 60s" (2 passos atrás, fora do drift default=1)
    const past = Date.now() - 2 * TOTP_PERIOD_SECONDS * 1000;
    const code = totp.generate({ timestamp: past });
    const result = verifyTotpCode({ secretBase32: secret, code });
    expect(result.ok).toBe(false);
  });

  it('delta customizado: aceita drift maior se configurado', () => {
    const secret = freshTotp();
    const totp = new TOTP({
      secret: Secret.fromBase32(secret),
      digits: TOTP_DIGITS,
      period: TOTP_PERIOD_SECONDS,
      algorithm: 'SHA1',
    });
    const past = Date.now() - 2 * TOTP_PERIOD_SECONDS * 1000;
    const code = totp.generate({ timestamp: past });
    // Com delta=2, deve aceitar
    const result = verifyTotpCode({ secretBase32: secret, code, delta: 2 });
    expect(result.ok).toBe(true);
  });
});

// ============================================================================
// Recovery codes
// ============================================================================

describe('generateRecoveryCodes', () => {
  it('gera 10 codes de 16 chars hex', () => {
    const codes = generateRecoveryCodes();
    expect(codes).toHaveLength(RECOVERY_CODE_COUNT);
    for (const c of codes) {
      expect(c).toMatch(/^[0-9a-f]{16}$/);
    }
  });

  it('codes são únicos entre si', () => {
    const codes = generateRecoveryCodes();
    const set = new Set(codes);
    expect(set.size).toBe(RECOVERY_CODE_COUNT);
  });
});

describe('hashRecoveryCode + tryConsumeRecoveryCode', () => {
  it('roundtrip: hash + compare retorna match', async () => {
    const plain = 'a1b2c3d4e5f67890';
    const hash = await hashRecoveryCode(plain);
    const codes = [hash, '', '', '', '', '', '', '', '', ''];
    const index = await tryConsumeRecoveryCode(codes, plain);
    expect(index).toBe(0);
  });

  it('tryConsume retorna null se nenhum slot bater', async () => {
    const hash = await hashRecoveryCode('correct');
    const codes = [hash, '', '', '', '', '', '', '', '', ''];
    const index = await tryConsumeRecoveryCode(codes, 'wrong');
    expect(index).toBeNull();
  });

  it('tryConsume pula slots consumidos (string vazia)', async () => {
    const hash = await hashRecoveryCode('same');
    // Slot 0 consumido, slot 1 ativo
    const codes = ['', hash, '', '', '', '', '', '', '', ''];
    const index = await tryConsumeRecoveryCode(codes, 'same');
    expect(index).toBe(1);
  });

  it('tryConsume retorna null se todos slots consumidos', async () => {
    const codes = Array(RECOVERY_CODE_COUNT).fill('');
    const index = await tryConsumeRecoveryCode(codes, 'anything');
    expect(index).toBeNull();
  });

  it('tryConsume retorna null se pool tem tamanho errado', async () => {
    const index = await tryConsumeRecoveryCode(['a', 'b'], 'a');
    expect(index).toBeNull();
  });
});
