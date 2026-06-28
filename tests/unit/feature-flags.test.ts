/**
 * Unit Tests — Feature Flags (Wave 26)
 *
 * Cobre:
 *   - src/lib/feature-flags/flags.ts       (registry: listFlags, getFlagDefinition, isValidFlagKey)
 *   - src/lib/feature-flags/index.ts       (hashUserId, getFlag, isFlagEnabled)
 *
 * Storage é mockado (readFlags) — não precisa de I/O real.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock do storage ANTES de importar o evaluator
vi.mock('@/lib/feature-flags/storage', () => ({
  readFlags: vi.fn(async () => ({})),
  // Snapshot helpers não usados nos testes diretos
  writeFlag: vi.fn(async () => undefined),
}));

import {
  FEATURE_FLAGS,
  listFlags,
  getFlagDefinition,
  isValidFlagKey,
} from '@/lib/feature-flags/flags';
import {
  hashUserId,
  getFlag,
  isFlagEnabled,
} from '@/lib/feature-flags/index';
import { readFlags } from '@/lib/feature-flags/storage';

const mockedReadFlags = vi.mocked(readFlags);

// =============================================================================
// Registry — flags.ts
// =============================================================================

describe('FEATURE_FLAGS registry', () => {
  it('contém flags conhecidas da Wave 19-20', () => {
    expect(isValidFlagKey('onboarding-redesign-v2')).toBe(true);
    expect(isValidFlagKey('streaming-sse-always')).toBe(true);
    expect(isValidFlagKey('landing-variant')).toBe(true);
    expect(isValidFlagKey('signup-magic-link')).toBe(true);
  });

  it('rejeita chaves desconhecidas', () => {
    expect(isValidFlagKey('flag-que-nao-existe')).toBe(false);
    expect(isValidFlagKey('')).toBe(false);
  });

  it('listFlags retorna array com definições completas', () => {
    const flags = listFlags();
    expect(flags.length).toBeGreaterThan(0);
    const ff = flags.find((f) => f.key === 'streaming-sse-always');
    expect(ff).toBeDefined();
    expect(ff?.type).toBe('boolean');
    expect(ff?.defaultValue).toBe(true);
    expect(ff?.owner).toBeTruthy();
  });

  it('getFlagDefinition retorna definition ou undefined', () => {
    expect(getFlagDefinition('streaming-sse-always')).toBeDefined();
    expect(getFlagDefinition('nao-existe')).toBeUndefined();
  });

  it('cada flag tem expiresAt válido (ISO) ou ausente', () => {
    for (const f of listFlags()) {
      if (f.expiresAt) {
        expect(() => new Date(f.expiresAt!).toISOString()).not.toThrow();
      }
    }
  });

  it('flags percentage têm rolloutPercent 0-100', () => {
    for (const f of listFlags()) {
      if (f.type === 'percentage') {
        expect(f.rolloutPercent).toBeGreaterThanOrEqual(0);
        expect(f.rolloutPercent).toBeLessThanOrEqual(100);
      }
    }
  });
});

// =============================================================================
// hashUserId — FNV-1a 32-bit determinístico
// =============================================================================

describe('hashUserId', () => {
  it('retorna mesmo hash para mesmo input (determinístico)', () => {
    expect(hashUserId('user-123', 'flag-key')).toBe(hashUserId('user-123', 'flag-key'));
  });

  it('retorna hash diferente para userIds diferentes', () => {
    const a = hashUserId('user-aaa', 'flag-x');
    const b = hashUserId('user-bbb', 'flag-x');
    expect(a).not.toBe(b);
  });

  it('retorna hash diferente para salts diferentes', () => {
    const a = hashUserId('user-123', 'flag-x');
    const b = hashUserId('user-123', 'flag-y');
    expect(a).not.toBe(b);
  });

  it('retorna número de 32-bit unsigned (0..2^32)', () => {
    const h = hashUserId('user', 'salt');
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThanOrEqual(0xffffffff);
    expect(Number.isInteger(h)).toBe(true);
  });

  it('hashToPercentile implícito: distribui em [0,100)', () => {
    const seen = new Set<number>();
    for (let i = 0; i < 200; i++) {
      const h = hashUserId(`u-${i}`, 'percentile-test');
      seen.add(h % 100);
    }
    // Distribuição esperada: pelo menos 50 valores únicos de 200 amostras
    expect(seen.size).toBeGreaterThan(50);
  });
});

// =============================================================================
// getFlag / isFlagEnabled — Evaluation
// =============================================================================

describe('getFlag', () => {
  beforeEach(() => {
    mockedReadFlags.mockReset();
    mockedReadFlags.mockResolvedValue({});
  });

  it('retorna default para flag boolean conhecida', async () => {
    const r = await getFlag('streaming-sse-always');
    expect(r.enabled).toBe(true);
    expect(r.reason).toBe('default');
  });

  it('retorna false para flag desconhecida (fail-safe)', async () => {
    const r = await getFlag('flag-totalmente-inventada');
    expect(r.enabled).toBe(false);
    expect(r.definition.description).toContain('desconhecida');
  });

  it('forced-on via storage override tem prioridade', async () => {
    mockedReadFlags.mockResolvedValue({
      'signup-magic-link': { enabled: true } as never,
    });
    const r = await getFlag('signup-magic-link', 'user-1');
    expect(r.enabled).toBe(true);
    expect(r.reason).toBe('forced-on');
  });

  it('forced-off via storage override desliga mesmo com default true', async () => {
    mockedReadFlags.mockResolvedValue({
      'streaming-sse-always': { enabled: false } as never,
    });
    const r = await getFlag('streaming-sse-always');
    expect(r.enabled).toBe(false);
    expect(r.reason).toBe('forced-off');
  });

  it('percentage sem userId sempre retorna false', async () => {
    const r = await getFlag('exit-intent-modal');
    expect(r.enabled).toBe(false);
    expect(r.reason).toBe('default');
  });

  it('percentage com userId respeita rolloutPercent', async () => {
    // rolloutPercent=100 (mobile-capture-bar é boolean) — vamos testar com uma
    // percentage flag simulada via storage override (rolloutPercent=0).
    mockedReadFlags.mockResolvedValue({
      'onboarding-redesign-v2': { rolloutPercent: 0 } as never,
    });
    const r = await getFlag('onboarding-redesign-v2', 'user-abc');
    expect(r.enabled).toBe(false);
    expect(r.reason).toBe('percentage');
  });

  it('percentage com rolloutPercent=100 inclui todos', async () => {
    mockedReadFlags.mockResolvedValue({
      'onboarding-redesign-v2': { rolloutPercent: 100 } as never,
    });
    // Testa com 20 userIds diferentes
    for (let i = 0; i < 20; i++) {
      const r = await getFlag('onboarding-redesign-v2', `user-${i}`);
      expect(r.enabled).toBe(true);
      expect(r.reason).toBe('percentage');
    }
  });

  it('whitelist bypass liga para userId listado', async () => {
    mockedReadFlags.mockResolvedValue({
      'landing-variant': { whitelist: ['user-special'] } as never,
    });
    const r1 = await getFlag('landing-variant', 'user-special');
    const r2 = await getFlag('landing-variant', 'user-other');
    expect(r1.enabled).toBe(true);
    expect(r1.reason).toBe('whitelist');
    expect(r2.enabled).toBe(false);
  });

  it('falha de I/O do storage usa default (fail-safe)', async () => {
    mockedReadFlags.mockRejectedValue(new Error('DB offline'));
    const r = await getFlag('streaming-sse-always');
    expect(r.enabled).toBe(true); // default
    expect(r.reason).toBe('default');
  });

  it('isFlagEnabled é shorthand booleano de getFlag', async () => {
    const enabled = await isFlagEnabled('streaming-sse-always');
    expect(enabled).toBe(true);
  });
});