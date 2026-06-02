// tests/lib/auth/operator-mfa.test.ts
// Testes do manager de MFA (Fase 20).
// Cobre: setup, verifySetup, consumeMfaChallenge (single-use), consumeRecoveryCode,
// disableMfa (com senha).

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TOTP, Secret } from 'otpauth';

// ----------------------------------------------------------------------------
// Mocks
// ----------------------------------------------------------------------------

const { mockFindUnique, mockUpsert, mockUpdate, mockDelete, mockBcryptHash, mockBcryptCompare } = vi.hoisted(() => {
  return {
    mockFindUnique: vi.fn(),
    mockUpsert: vi.fn(),
    mockUpdate: vi.fn(),
    mockDelete: vi.fn(),
    mockBcryptHash: vi.fn(),
    mockBcryptCompare: vi.fn(),
  };
});

vi.mock('@/lib/prisma', () => ({
  prisma: {
    operatorMfa: {
      findUnique: (args: unknown) => mockFindUnique(args),
      upsert: (args: unknown) => mockUpsert(args),
      update: (args: unknown) => mockUpdate(args),
      delete: (args: unknown) => mockDelete(args),
    },
  },
}));

vi.mock('bcryptjs', () => {
  const hash = (...args: unknown[]) => mockBcryptHash(...args);
  const compare = (...args: unknown[]) => mockBcryptCompare(...args);
  return { default: { hash, compare }, hash, compare };
});

// TOTP secret determinístico para os testes de verify/consume
import { encryptSecret, generateTotpSecret, hashRecoveryCode } from '@/lib/auth/operator-totp';
import {
  TOTP_DIGITS,
  TOTP_PERIOD_SECONDS,
} from '@/lib/auth/operator-totp';

const TEST_SECRET = 'JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP';
const TEST_KEY_HEX = 'a'.repeat(64);

let storedMfa: {
  operatorId: string;
  secretEncrypted: string;
  enabled: boolean;
  recoveryCodesHash: string;
  lastUsedStep: bigint | null;
} | null = null;

beforeEach(() => {
  process.env.MFA_ENCRYPTION_KEY = TEST_KEY_HEX;
  process.env.NODE_ENV = 'test';
  vi.clearAllMocks();
  // Mock bcrypt: hash(plain) = "$2a$10$" + base64(plain) (fake bcrypt look),
  // compare(plain, hash) = reverse o base64 e compara com plain
  // Estrutura do fake hash: "$2a$10$<22 chars base64-style>"
  mockBcryptHash.mockImplementation(async (pw: string) => {
    // Encode plain como base64 truncado (apenas deterministic)
    const buf = Buffer.from(pw, 'utf8').toString('base64').replace(/=+$/, '').slice(0, 22);
    return `$2a$10$${buf}`;
  });
  mockBcryptCompare.mockImplementation(async (pw: string, hash: string) => {
    // Decode: extrai o meio do fake hash e compara
    if (!hash.startsWith('$2a$10$')) return false;
    const middle = hash.slice('$2a$10$'.length);
    const expected = Buffer.from(pw, 'utf8').toString('base64').replace(/=+$/, '').slice(0, 22);
    return middle === expected;
  });
  storedMfa = null;

  // Implementação realística do mock: findUnique/upsert/update/delete
  // mantêm o `storedMfa` em memória.
  mockFindUnique.mockImplementation(async ({ where }: { where: { operatorId: string } }) => {
    if (!storedMfa || storedMfa.operatorId !== where.operatorId) return null;
    return storedMfa;
  });
  mockUpsert.mockImplementation(async ({ where, create, update }: {
    where: { operatorId: string };
    create: typeof storedMfa;
    update: Partial<NonNullable<typeof storedMfa>>;
  }) => {
    if (storedMfa && storedMfa.operatorId === where.operatorId) {
      storedMfa = { ...storedMfa, ...update };
    } else {
      storedMfa = { ...create };
    }
    return storedMfa!;
  });
  mockUpdate.mockImplementation(async ({ where, data }: {
    where: { operatorId: string };
    data: Partial<NonNullable<typeof storedMfa>>;
  }) => {
    if (!storedMfa || storedMfa.operatorId !== where.operatorId) {
      throw new Error('not found');
    }
    storedMfa = { ...storedMfa, ...data };
    return storedMfa;
  });
  mockDelete.mockImplementation(async ({ where }: { where: { operatorId: string } }) => {
    if (!storedMfa || storedMfa.operatorId !== where.operatorId) {
      // Simula P2025 do Prisma
      const err = new Error('Record not found') as Error & { code: string };
      err.code = 'P2025';
      throw err;
    }
    const deleted = storedMfa;
    storedMfa = null;
    return deleted;
  });
});

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

const testOperator = {
  id: 'op-admin-1',
  email: 'admin@cabala.com',
  passwordHash: '$2a$10$' + Buffer.from('admin123', 'utf8').toString('base64').replace(/=+$/, '').slice(0, 22),
  role: 'ADMIN' as const,
};

function currentTotpCode(secret = TEST_SECRET): string {
  const totp = new TOTP({
    secret: Secret.fromBase32(secret),
    digits: TOTP_DIGITS,
    period: TOTP_PERIOD_SECONDS,
    algorithm: 'SHA1',
  });
  return totp.generate();
}

// ----------------------------------------------------------------------------
// Tests
// ----------------------------------------------------------------------------

describe('setupMfa', () => {
  it('cria OperatorMfa com enabled=false e retorna secret + recoveryCodes', async () => {
    const { setupMfa } = await import('@/lib/auth/operator-mfa');
    const result = await setupMfa({ id: testOperator.id, email: testOperator.email });

    // Retorno
    expect(result.secret).toMatch(/^[A-Z2-7]{32}$/);
    expect(result.qrDataUrl).toMatch(/^data:image\/png;base64,/);
    expect(result.otpauthUrl).toMatch(/^otpauth:\/\/totp\//);
    expect(result.recoveryCodes).toHaveLength(10);

    // DB
    expect(storedMfa).not.toBeNull();
    expect(storedMfa!.operatorId).toBe(testOperator.id);
    expect(storedMfa!.enabled).toBe(false);
    expect(storedMfa!.secretEncrypted).toContain(':'); // formato iv:tag:ciphertext
    // Recovery codes armazenados como bcrypt, não plain
    const codes = JSON.parse(storedMfa!.recoveryCodesHash);
    expect(codes).toHaveLength(10);
    for (const c of codes) {
      expect(c).toMatch(/^\$2[aby]\$/); // bcrypt hash
    }
  });

  it('setup é idempotente: chamar 2x sobrescreve (não duplica)', async () => {
    const { setupMfa } = await import('@/lib/auth/operator-mfa');
    const r1 = await setupMfa({ id: testOperator.id, email: testOperator.email });
    const r2 = await setupMfa({ id: testOperator.id, email: testOperator.email });
    expect(r1.secret).not.toBe(r2.secret);
    expect(storedMfa).not.toBeNull();
  });
});

describe('verifySetupMfa', () => {
  it('com código válido → enabled=true', async () => {
    const { setupMfa, verifySetupMfa } = await import('@/lib/auth/operator-mfa');
    const r = await setupMfa({ id: testOperator.id, email: testOperator.email });
    // Gera código com o secret plain retornado pelo setup
    const totp = new TOTP({
      secret: Secret.fromBase32(r.secret),
      digits: TOTP_DIGITS,
      period: TOTP_PERIOD_SECONDS,
      algorithm: 'SHA1',
    });
    const code = totp.generate();
    const result = await verifySetupMfa({ operatorId: testOperator.id, code });
    expect(result.ok).toBe(true);
    expect(storedMfa!.enabled).toBe(true);
  });

  it('código inválido → ok=false, reason=invalid (mantém enabled=false)', async () => {
    const { setupMfa, verifySetupMfa } = await import('@/lib/auth/operator-mfa');
    await setupMfa({ id: testOperator.id, email: testOperator.email });
    const result = await verifySetupMfa({ operatorId: testOperator.id, code: '000000' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('invalid');
    expect(storedMfa!.enabled).toBe(false);
  });

  it('sem setup prévio → reason=no-setup', async () => {
    const { verifySetupMfa } = await import('@/lib/auth/operator-mfa');
    const result = await verifySetupMfa({ operatorId: 'no-setup', code: '123456' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('no-setup');
  });

  it('re-verificar com MFA já enabled é idempotente (ok=true)', async () => {
    const { setupMfa, verifySetupMfa } = await import('@/lib/auth/operator-mfa');
    const r = await setupMfa({ id: testOperator.id, email: testOperator.email });
    const totp = new TOTP({
      secret: Secret.fromBase32(r.secret),
      digits: TOTP_DIGITS,
      period: TOTP_PERIOD_SECONDS,
      algorithm: 'SHA1',
    });
    await verifySetupMfa({ operatorId: testOperator.id, code: totp.generate() });
    // 2ª chamada: já enabled, retorna ok sem re-validar
    const result = await verifySetupMfa({ operatorId: testOperator.id, code: '000000' });
    expect(result.ok).toBe(true);
  });
});

describe('consumeMfaChallenge (single-use)', () => {
  it('código válido → ok=true, persiste lastUsedStep', async () => {
    const { setupMfa, verifySetupMfa, consumeMfaChallenge } = await import('@/lib/auth/operator-mfa');
    const r = await setupMfa({ id: testOperator.id, email: testOperator.email });
    const totp = new TOTP({
      secret: Secret.fromBase32(r.secret),
      digits: TOTP_DIGITS,
      period: TOTP_PERIOD_SECONDS,
      algorithm: 'SHA1',
    });
    const code = totp.generate();
    await verifySetupMfa({ operatorId: testOperator.id, code });

    const result = await consumeMfaChallenge({ operatorId: testOperator.id, code });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.method).toBe('totp');
    expect(storedMfa!.lastUsedStep).not.toBeNull();
  });

  it('código reusado no mesmo step → ok=false, reason=invalid', async () => {
    const { setupMfa, verifySetupMfa, consumeMfaChallenge } = await import('@/lib/auth/operator-mfa');
    const r = await setupMfa({ id: testOperator.id, email: testOperator.email });
    const totp = new TOTP({
      secret: Secret.fromBase32(r.secret),
      digits: TOTP_DIGITS,
      period: TOTP_PERIOD_SECONDS,
      algorithm: 'SHA1',
    });
    const code = totp.generate();
    await verifySetupMfa({ operatorId: testOperator.id, code });

    // 1ª vez: sucesso
    const r1 = await consumeMfaChallenge({ operatorId: testOperator.id, code });
    expect(r1.ok).toBe(true);
    // 2ª vez no mesmo step: rejeitado
    const r2 = await consumeMfaChallenge({ operatorId: testOperator.id, code });
    expect(r2.ok).toBe(false);
    if (!r2.ok) expect(r2.reason).toBe('invalid');
  });

  it('código errado → ok=false, reason=invalid', async () => {
    const { setupMfa, verifySetupMfa, consumeMfaChallenge } = await import('@/lib/auth/operator-mfa');
    const r = await setupMfa({ id: testOperator.id, email: testOperator.email });
    const totp = new TOTP({
      secret: Secret.fromBase32(r.secret),
      digits: TOTP_DIGITS,
      period: TOTP_PERIOD_SECONDS,
      algorithm: 'SHA1',
    });
    await verifySetupMfa({ operatorId: testOperator.id, code: totp.generate() });

    const result = await consumeMfaChallenge({ operatorId: testOperator.id, code: '000000' });
    expect(result.ok).toBe(false);
  });

  it('MFA não enabled → reason=not-enabled', async () => {
    const { setupMfa, consumeMfaChallenge } = await import('@/lib/auth/operator-mfa');
    await setupMfa({ id: testOperator.id, email: testOperator.email });
    // Não chama verifySetup → enabled=false
    const result = await consumeMfaChallenge({ operatorId: testOperator.id, code: '123456' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('not-enabled');
  });
});

describe('consumeRecoveryCode', () => {
  it('código válido → ok=true e marca slot como consumido', async () => {
    const { setupMfa, verifySetupMfa, consumeRecoveryCode } = await import('@/lib/auth/operator-mfa');
    const r = await setupMfa({ id: testOperator.id, email: testOperator.email });
    const totp = new TOTP({
      secret: Secret.fromBase32(r.secret),
      digits: TOTP_DIGITS,
      period: TOTP_PERIOD_SECONDS,
      algorithm: 'SHA1',
    });
    await verifySetupMfa({ operatorId: testOperator.id, code: totp.generate() });

    const targetCode = r.recoveryCodes[3];
    const result = await consumeRecoveryCode({ operatorId: testOperator.id, code: targetCode });
    // DEBUG
    if (!result.ok) {
      // eslint-disable-next-line no-console
      console.log('DEBUG recovery fail:', { result, targetCode, storedCodes: storedMfa?.recoveryCodesHash });
    }
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.method).toBe('recovery');

    // Slot 3 foi consumido
    const codes = JSON.parse(storedMfa!.recoveryCodesHash);
    expect(codes[3]).toBe('');
    // Outros slots intactos
    expect(codes[0]).not.toBe('');
  });

  it('código reusado → ok=false (slot já consumido)', async () => {
    const { setupMfa, verifySetupMfa, consumeRecoveryCode } = await import('@/lib/auth/operator-mfa');
    const r = await setupMfa({ id: testOperator.id, email: testOperator.email });
    const totp = new TOTP({
      secret: Secret.fromBase32(r.secret),
      digits: TOTP_DIGITS,
      period: TOTP_PERIOD_SECONDS,
      algorithm: 'SHA1',
    });
    await verifySetupMfa({ operatorId: testOperator.id, code: totp.generate() });

    const targetCode = r.recoveryCodes[0];
    await consumeRecoveryCode({ operatorId: testOperator.id, code: targetCode });
    const result2 = await consumeRecoveryCode({ operatorId: testOperator.id, code: targetCode });
    expect(result2.ok).toBe(false);
  });

  it('código inexistente → ok=false, reason=invalid', async () => {
    const { setupMfa, verifySetupMfa, consumeRecoveryCode } = await import('@/lib/auth/operator-mfa');
    const r = await setupMfa({ id: testOperator.id, email: testOperator.email });
    const totp = new TOTP({
      secret: Secret.fromBase32(r.secret),
      digits: TOTP_DIGITS,
      period: TOTP_PERIOD_SECONDS,
      algorithm: 'SHA1',
    });
    await verifySetupMfa({ operatorId: testOperator.id, code: totp.generate() });
    const result = await consumeRecoveryCode({ operatorId: testOperator.id, code: 'ffffffffffffffff' });
    expect(result.ok).toBe(false);
  });
});

describe('disableMfa', () => {
  it('senha correta → ok=true e apaga OperatorMfa', async () => {
    const { setupMfa, verifySetupMfa, disableMfa } = await import('@/lib/auth/operator-mfa');
    const r = await setupMfa({ id: testOperator.id, email: testOperator.email });
    const totp = new TOTP({
      secret: Secret.fromBase32(r.secret),
      digits: TOTP_DIGITS,
      period: TOTP_PERIOD_SECONDS,
      algorithm: 'SHA1',
    });
    await verifySetupMfa({ operatorId: testOperator.id, code: totp.generate() });

    const result = await disableMfa({
      operator: { id: testOperator.id, passwordHash: testOperator.passwordHash },
      password: 'admin123',
    });
    expect(result.ok).toBe(true);
    expect(storedMfa).toBeNull();
  });

  it('senha errada → ok=false, reason=wrong-password (não apaga)', async () => {
    const { setupMfa, verifySetupMfa, disableMfa } = await import('@/lib/auth/operator-mfa');
    const r = await setupMfa({ id: testOperator.id, email: testOperator.email });
    const totp = new TOTP({
      secret: Secret.fromBase32(r.secret),
      digits: TOTP_DIGITS,
      period: TOTP_PERIOD_SECONDS,
      algorithm: 'SHA1',
    });
    await verifySetupMfa({ operatorId: testOperator.id, code: totp.generate() });

    const result = await disableMfa({
      operator: { id: testOperator.id, passwordHash: testOperator.passwordHash },
      password: 'wrong',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('wrong-password');
    expect(storedMfa).not.toBeNull();
  });

  it('sem MFA configurado → reason=no-mfa', async () => {
    const { disableMfa } = await import('@/lib/auth/operator-mfa');
    const result = await disableMfa({
      operator: { id: 'no-mfa-op', passwordHash: testOperator.passwordHash },
      password: 'admin123',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('no-mfa');
  });
});

describe('isMfaEnabled', () => {
  it('retorna true se OperatorMfa.enabled=true', async () => {
    const { setupMfa, verifySetupMfa, isMfaEnabled } = await import('@/lib/auth/operator-mfa');
    const r = await setupMfa({ id: testOperator.id, email: testOperator.email });
    const totp = new TOTP({
      secret: Secret.fromBase32(r.secret),
      digits: TOTP_DIGITS,
      period: TOTP_PERIOD_SECONDS,
      algorithm: 'SHA1',
    });
    await verifySetupMfa({ operatorId: testOperator.id, code: totp.generate() });
    expect(await isMfaEnabled(testOperator.id)).toBe(true);
  });

  it('retorna false se não existe OperatorMfa', async () => {
    const { isMfaEnabled } = await import('@/lib/auth/operator-mfa');
    expect(await isMfaEnabled('no-such-op')).toBe(false);
  });

  it('retorna false se OperatorMfa.enabled=false', async () => {
    const { setupMfa, isMfaEnabled } = await import('@/lib/auth/operator-mfa');
    await setupMfa({ id: testOperator.id, email: testOperator.email });
    expect(await isMfaEnabled(testOperator.id)).toBe(false);
  });
});
