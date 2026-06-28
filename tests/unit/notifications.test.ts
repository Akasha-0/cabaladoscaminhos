/**
 * Unit Tests — Notifications (Wave 26)
 *
 * Cobre:
 *   - src/lib/notifications/preferences.ts  (resolvePreferences, shouldDeliver, DEFAULT_PREFERENCES)
 *   - src/lib/notifications/triggers.ts     (likeGroupKey, groupPostGroupKey, fetchActorSnapshot)
 *   - src/lib/notifications/types.ts        (BATCHABLE_TYPES, CRITICAL_TYPES)
 *
 * Funções puras — sem DB. Os helpers de trigger são testáveis isoladamente.
 */

import { describe, it, expect } from 'vitest';

import {
  DEFAULT_PREFERENCES,
  resolvePreferences,
  shouldDeliver,
  type PreferenceRow,
} from '@/lib/notifications/preferences';
import {
  likeGroupKey,
  groupPostGroupKey,
  fetchActorSnapshot,
} from '@/lib/notifications/triggers';
import {
  BATCHABLE_TYPES,
  CRITICAL_TYPES,
  NEVER_BATCH_TYPES,
} from '@/lib/notifications/types';

// =============================================================================
// DEFAULT_PREFERENCES — Defaults LGPD-friendly
// =============================================================================

describe('DEFAULT_PREFERENCES', () => {
  it('LIKE: inApp=true, email=false, push=false, weekly=true', () => {
    expect(DEFAULT_PREFERENCES.LIKE).toEqual({
      inApp: true,
      email: false,
      push: false,
      weeklyDigest: true,
    });
  });

  it('COMMENT: email=true, weekly=false (urgente)', () => {
    expect(DEFAULT_PREFERENCES.COMMENT.email).toBe(true);
    expect(DEFAULT_PREFERENCES.COMMENT.weeklyDigest).toBe(false);
  });

  it('SYSTEM_ALERT: todos true (crítico)', () => {
    expect(DEFAULT_PREFERENCES.SYSTEM_ALERT.inApp).toBe(true);
    expect(DEFAULT_PREFERENCES.SYSTEM_ALERT.email).toBe(true);
  });

  it('push começa false em todos os tipos (opt-in LGPD)', () => {
    for (const type of Object.keys(DEFAULT_PREFERENCES) as Array<keyof typeof DEFAULT_PREFERENCES>) {
      expect(DEFAULT_PREFERENCES[type].push).toBe(false);
    }
  });
});

// =============================================================================
// resolvePreferences — Merge DB rows com defaults
// =============================================================================

describe('resolvePreferences', () => {
  it('retorna defaults quando rows é vazio', () => {
    const result = resolvePreferences([]);
    expect(result.LIKE.inApp).toBe(true);
    expect(result.COMMENT.email).toBe(true);
    expect(result.SYSTEM_ALERT.inApp).toBe(true);
  });

  it('override do DB vence o default', () => {
    const rows: PreferenceRow[] = [
      { type: 'LIKE', inApp: false, email: true, push: true, weeklyDigest: false },
    ];
    const result = resolvePreferences(rows);
    expect(result.LIKE.inApp).toBe(false);
    expect(result.LIKE.email).toBe(true);
    expect(result.LIKE.push).toBe(true);
  });

  it('mantém defaults para tipos sem override', () => {
    const rows: PreferenceRow[] = [
      { type: 'COMMENT', inApp: false, email: false, push: true, weeklyDigest: true },
    ];
    const result = resolvePreferences(rows);
    expect(result.COMMENT.inApp).toBe(false);
    // LIKE não foi passado, mantém default
    expect(result.LIKE.inApp).toBe(true);
  });

  it('sempre retorna todos os tipos (mesmo sem override)', () => {
    const result = resolvePreferences([]);
    const allTypes = Object.keys(DEFAULT_PREFERENCES);
    for (const t of allTypes) {
      expect(result[t as keyof typeof result]).toBeDefined();
    }
  });
});

// =============================================================================
// shouldDeliver — Decide canal
// =============================================================================

describe('shouldDeliver', () => {
  it('respeita inApp para canal IN_APP', () => {
    const prefs = resolvePreferences([
      { type: 'LIKE', inApp: false, email: true, push: true, weeklyDigest: false },
    ]);
    expect(shouldDeliver(prefs, 'LIKE', 'IN_APP')).toBe(false);
  });

  it('respeita email para canal EMAIL', () => {
    const prefs = resolvePreferences([
      { type: 'LIKE', inApp: true, email: false, push: true, weeklyDigest: false },
    ]);
    expect(shouldDeliver(prefs, 'LIKE', 'EMAIL')).toBe(false);
  });

  it('respeita push para canal PUSH', () => {
    const prefs = resolvePreferences([
      { type: 'LIKE', inApp: true, email: true, push: false, weeklyDigest: false },
    ]);
    expect(shouldDeliver(prefs, 'LIKE', 'PUSH')).toBe(false);
  });

  it('retorna true para tipo desconhecido (fail-open)', () => {
    const prefs = resolvePreferences([]);
    const fakePrefs = { ...prefs, UNKNOWN: undefined } as never;
    expect(shouldDeliver(fakePrefs, 'UNKNOWN' as never, 'IN_APP')).toBe(true);
  });
});

// =============================================================================
// Types sets
// =============================================================================

describe('Notification type sets', () => {
  it('BATCHABLE_TYPES inclui LIKE', () => {
    expect(BATCHABLE_TYPES.has('LIKE')).toBe(true);
  });

  it('CRITICAL_TYPES inclui SYSTEM_ALERT e MODERATION_ACTION', () => {
    expect(CRITICAL_TYPES.has('SYSTEM_ALERT')).toBe(true);
    expect(CRITICAL_TYPES.has('MODERATION_ACTION')).toBe(true);
  });

  it('NEVER_BATCH_TYPES não inclui LIKE', () => {
    expect(NEVER_BATCH_TYPES.has('LIKE')).toBe(false);
  });

  it('CRITICAL e NEVER_BATCH não devem ter overlap', () => {
    for (const t of CRITICAL_TYPES) {
      expect(NEVER_BATCH_TYPES.has(t)).toBe(false);
    }
  });
});

// =============================================================================
// likeGroupKey / groupPostGroupKey
// =============================================================================

describe('likeGroupKey', () => {
  it('formato: post:<postId>:LIKES', () => {
    expect(likeGroupKey('post-abc-123')).toBe('post:post-abc-123:LIKES');
  });

  it('groupKey diferente para posts diferentes', () => {
    expect(likeGroupKey('post-1')).not.toBe(likeGroupKey('post-2'));
  });
});

describe('groupPostGroupKey', () => {
  it('formato: group:<groupId>:post:<postId>', () => {
    expect(groupPostGroupKey('g-1', 'p-1')).toBe('group:g-1:post:p-1');
  });

  it('groupKey único por par (group, post)', () => {
    const a = groupPostGroupKey('g-1', 'p-1');
    const b = groupPostGroupKey('g-1', 'p-2');
    expect(a).not.toBe(b);
  });
});

// =============================================================================
// fetchActorSnapshot
// =============================================================================

describe('fetchActorSnapshot', () => {
  it('retorna snapshot mínimo baseado no ID', async () => {
    const snap = await fetchActorSnapshot('user-12345-abc');
    expect(snap).not.toBeNull();
    expect(snap?.id).toBe('user-12345-abc');
    expect(snap?.handle).toBe('user-12345-abc');
    expect(snap?.avatarUrl).toBeNull();
    expect(snap?.displayName).toContain('Membro');
  });

  it('displayName inclui últimos 4 chars do ID', async () => {
    const snap = await fetchActorSnapshot('user-aaaa1234');
    expect(snap?.displayName).toContain('1234');
  });
});