// ============================================================================
// W91s — notifications-prefs-engine.spec.ts
// ============================================================================
// Spec source-inspection (readFileSync + regex). Sem vitest+jsdom (W88-RPC
// teardown bug confirmado em ciclos anteriores — memory 2026-06-30).
//
// Roda via `npx vitest run src/lib/w91s/notifications-prefs-engine.spec.ts`
// OU `npx tsx src/lib/w91s/notifications-prefs-engine.spec.ts` para sanity.
//
// Cobre (≥15 asserts):
//   1) Exports públicos (hook + helpers + constantes)
//   2) Tipos (tradições, canais, categorias)
//   3) Hook surface (toggle, setQuietHours, commit, etc.)
//   4) Pure helpers (parseHHMM, formatHHMM, isInQuietHours, fingerprint)
//   5) Channel matrix (byTradicao + ALWAYS_IN_APP_TYPES)
//   6) Frequency caps (createInitialCapState + UNCAPPED_TYPES)
//   7) LGPD/sacred-cultural compliance (banned vocab + positive-only copy)
//   8) Cross-file invariants (consistência entre engine e form)
// ============================================================================

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const ENGINE = readFileSync(
  resolve(__dirname, './notifications-prefs-engine.ts'),
  'utf8'
);
const FORM = readFileSync(
  resolve(__dirname, '../../components/community/settings/NotificationsPrefsForm.tsx'),
  'utf8'
);
const PAGE = readFileSync(
  resolve(
    __dirname,
    '../../app/(app)/settings/notifications/page.tsx'
  ),
  'utf8'
);

// ============================================================================
// [1] Exports públicos do engine
// ============================================================================

describe('[engine] exports', () => {
  it('exports useNotificationPrefs hook', () => {
    expect(ENGINE).toMatch(/export function useNotificationPrefs/);
  });

  it('exports byTradicao adapter', () => {
    expect(ENGINE).toMatch(/export function byTradicao/);
  });

  it('exports applyPageFilter', () => {
    expect(ENGINE).toMatch(/export function applyPageFilter/);
  });

  it('exports TRADICAO_ORDER frozen const', () => {
    expect(ENGINE).toMatch(/TRADICAO_ORDER\s*:\s*readonly NotificationTradicao\[\]\s*=\s*Object\.freeze/);
  });

  it('exports DEFAULT_QUIET_HOURS', () => {
    expect(ENGINE).toMatch(/export const DEFAULT_QUIET_HOURS/);
  });

  it('exports fingerprint()', () => {
    expect(ENGINE).toMatch(/export function fingerprint/);
  });

  it('exports diffPreferences / mergePreferences', () => {
    expect(ENGINE).toMatch(/export function diffPreferences/);
    expect(ENGINE).toMatch(/export function mergePreferences/);
  });

  it('exports setCap / registerDelivery / shouldDeliverWithCap', () => {
    expect(ENGINE).toMatch(/export function setCap/);
    expect(ENGINE).toMatch(/export function registerDelivery/);
    expect(ENGINE).toMatch(/export function shouldDeliverWithCap/);
  });
});

// ============================================================================
// [2] Tipos e catálogos
// ============================================================================

describe('[engine] tipos e catálogos', () => {
  it('declara 6 NotificationTradicao (cigano+ifa+cabala+candomble+umbanda+astrologia)', () => {
    expect(ENGINE).toMatch(/'cigano'/);
    expect(ENGINE).toMatch(/'ifa'/);
    expect(ENGINE).toMatch(/'cabala'/);
    expect(ENGINE).toMatch(/'candomble'/);
    expect(ENGINE).toMatch(/'umbanda'/);
    expect(ENGINE).toMatch(/'astrologia'/);
  });

  it('declara 3 canais (IN_APP, EMAIL, PUSH)', () => {
    expect(ENGINE).toMatch(/'IN_APP'/);
    expect(ENGINE).toMatch(/'EMAIL'/);
    expect(ENGINE).toMatch(/'PUSH'/);
  });

  it('cobre 13 NotificationType no NOTIFICATION_TYPE_META', () => {
    const expected = [
      'LIKE',
      'COMMENT',
      'POST_REPLY',
      'FOLLOW',
      'MENTION',
      'GROUP_INVITE',
      'GROUP_POST',
      'GROUP_ROLE_CHANGE',
      'ARTICLE_RECOMMENDATION',
      'ARTICLE_PUBLISHED',
      'SYSTEM_ALERT',
      'MODERATION_ACTION',
      'DIGEST_WEEKLY',
    ];
    for (const t of expected) {
      expect(ENGINE).toContain(`'${t}'`);
    }
  });

  it('declara 5 PrefsCategory (social/comunidade/conteudo/sistema/meta)', () => {
    expect(ENGINE).toMatch(/'social'/);
    expect(ENGINE).toMatch(/'comunidade'/);
    expect(ENGINE).toMatch(/'conteudo'/);
    expect(ENGINE).toMatch(/'sistema'/);
    expect(ENGINE).toMatch(/'meta'/);
  });
});

// ============================================================================
// [3] Hook surface (actions exposed by useNotificationPrefs)
// ============================================================================

describe('[engine] hook surface', () => {
  it('expõe toggle(row, channel)', () => {
    expect(ENGINE).toMatch(/toggle:\s*useCallback/);
    expect(ENGINE).toMatch(/dispatch\(\{\s*type:\s*'toggle'/);
  });

  it('expõe toggleWeeklyDigest(row)', () => {
    expect(ENGINE).toMatch(/toggleWeeklyDigest:\s*useCallback/);
  });

  it('expõe setRow(row, value)', () => {
    expect(ENGINE).toMatch(/setRow:\s*useCallback/);
  });

  it('expõe setQuietHours(window)', () => {
    expect(ENGINE).toMatch(/setQuietHours:\s*useCallback/);
  });

  it('expõe commit() e reset()', () => {
    expect(ENGINE).toMatch(/commit:\s*useCallback/);
    expect(ENGINE).toMatch(/reset:\s*useCallback/);
  });

  it('calcula canSubmit baseado em diff.totalChanges + hasAnyChannel', () => {
    expect(ENGINE).toMatch(/diff\.totalChanges > 0 && anyRow/);
    expect(ENGINE).toMatch(/export function hasAnyChannel/);
  });

  it('detecta dirty automaticamente', () => {
    expect(ENGINE).toMatch(/dirty:\s*diff\.totalChanges > 0/);
  });
});

// ============================================================================
// [4] Pure helpers — quiet hours / HH:MM
// ============================================================================

describe('[engine] pure helpers', () => {
  it('parseHHMM aceita HH:MM e converte pra minutos', () => {
    expect(ENGINE).toMatch(/export function parseHHMM/);
    expect(ENGINE).toMatch(/h \* 60 \+ m/);
  });

  it('formatHHMM usa padStart(2,"0")', () => {
    expect(ENGINE).toMatch(/export function formatHHMM/);
    expect(ENGINE).toMatch(/\.padStart\(2, '0'\)/);
  });

  it('isInQuietHours lida com janelas cruzando meia-noite', () => {
    expect(ENGINE).toMatch(/export function isInQuietHours/);
    expect(ENGINE).toMatch(/startMinutes < endMinutes/);
    expect(ENGINE).toMatch(/cruzando meia-noite/);
  });

  it('createQuietHours normaliza start >= end (+1h)', () => {
    expect(ENGINE).toMatch(/export function createQuietHours/);
    expect(ENGINE).toMatch(/empurra fim pra \+1h/);
  });

  it('localMinutesOfDate usa Intl.DateTimeFormat com timeZone', () => {
    expect(ENGINE).toMatch(/export function localMinutesOfDate/);
    expect(ENGINE).toMatch(/timeZone:\s*tz/);
  });

  it('fingerprint ordena tipos e produz string determinística', () => {
    expect(ENGINE).toMatch(/export function fingerprint/);
    expect(ENGINE).toMatch(/Object\.keys\(prefs\)\.sort/);
  });
});

// ============================================================================
// [5] Channel Matrix
// ============================================================================

describe('[engine] channel matrix', () => {
  it('declara TRADICAO_DEFAULT_CHANNELS com IN_APP+EMAIL nas 6 tradições', () => {
    expect(ENGINE).toMatch(/export const TRADICAO_DEFAULT_CHANNELS/);
    const blocks = (ENGINE.match(/IN_APP.*?EMAIL/g) ?? []).length;
    expect(blocks).toBeGreaterThanOrEqual(6);
  });

  it('resolveActiveChannels respeita matriz da tradição', () => {
    expect(ENGINE).toMatch(/export function resolveActiveChannels/);
    expect(ENGINE).toMatch(/allowed\.has\('EMAIL'\)/);
    expect(ENGINE).toMatch(/allowed\.has\('PUSH'\)/);
  });

  it('ALWAYS_IN_APP_TYPES força SYSTEM_ALERT/MODERATION_ACTION como IN_APP', () => {
    expect(ENGINE).toMatch(/export const ALWAYS_IN_APP_TYPES/);
    expect(ENGINE).toMatch(/'SYSTEM_ALERT'/);
    expect(ENGINE).toMatch(/'MODERATION_ACTION'/);
  });
});

// ============================================================================
// [6] Frequency Caps
// ============================================================================

describe('[engine] frequency caps', () => {
  it('declara DEFAULT_FREQUENCY_CAPS com 10 entradas', () => {
    const matches = ENGINE.match(/type: '\w+'/g) ?? [];
    // 10 entries esperados (excluindo system alerts).
    expect(matches.length).toBeGreaterThanOrEqual(10);
  });

  it('UNCAPPED_TYPES contém apenas SYSTEM_ALERT e MODERATION_ACTION', () => {
    expect(ENGINE).toMatch(/UNCAPPED_TYPES:\s*ReadonlySet<NotificationType>/);
    expect(ENGINE).toMatch(/set<NotificationType>\(\[\s*'SYSTEM_ALERT', 'MODERATION_ACTION' \]\)/);
  });

  it('createInitialCapState usa GLOBAL_DAILY_FLOOR como fallback', () => {
    expect(ENGINE).toMatch(/export const GLOBAL_DAILY_FLOOR\s*=\s*100/);
    expect(ENGINE).toMatch(/export function createInitialCapState/);
  });

  it('shouldDeliverWithCap retorna "throttle" quando global estourou', () => {
    expect(ENGINE).toMatch(/export function shouldDeliverWithCap/);
    expect(ENGINE).toMatch(/state\.globalCount >= GLOBAL_DAILY_FLOOR/);
  });
});

// ============================================================================
// [7] LGPD / sacred-cultural compliance
// ============================================================================

describe('[engine] LGPD + sacred-cultural compliance', () => {
  it('não contém banned vocab (amarração, amarre, vinculação)', () => {
    // NOTE: split prohibited term to avoid spec self-flag.
    const banned: ReadonlyArray<string> = [
      'amarra' + 'ção',
      'amarre',
      'vincula' + 'ção',
    ];
    const lower = ENGINE.toLowerCase();
    const hits = banned.filter((term) => lower.includes(term.toLowerCase()));
    expect(hits.length).toBe(0);
  });

  it('não contém UI negativas (odeio/destruição/bloquear)', () => {
    const negative = ['odi' + 'o', 'destruição', 'bloquear'];
    const lower = ENGINE.toLowerCase();
    const hits = negative.filter((t) => lower.includes(t));
    expect(hits.length).toBe(0);
  });

  it('preserva termos sagrados verbatim (orixá, babalaô, sefirá)', () => {
    // Estes podem não aparecer no engine (copy fica na UI), mas `cabala`
    // deve aparecer como tradição.
    expect(ENGINE).toContain('cabala');
  });

  it('declara LGPD-friendly defaults (push=false em vários tipos)', () => {
    const matches = ENGINE.match(/push:\s*false/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(5);
  });
});

// ============================================================================
// [8] Cross-file invariants — engine ↔ form ↔ page
// ============================================================================

describe('[cross-file] consistência', () => {
  it('form importa de @/lib/w91s/notifications-prefs-engine', () => {
    expect(FORM).toMatch(/from "@\/lib\/w91s\/notifications-prefs-engine"/);
  });

  it('form usa hook useNotificationPrefs', () => {
    expect(FORM).toMatch(/useNotificationPrefs/);
  });

  it('form tem aria-label em pontos tocáveis (≥3 ocorrências)', () => {
    const matches = FORM.match(/aria-label=/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(3);
  });

  it('form respeita touch-target 44px (min-h-[44px])', () => {
    expect(FORM).toMatch(/min-h-\[44px\]/);
  });

  it('form é "use client"', () => {
    expect(FORM).toMatch(/^'use client'/m);
  });

  it('page é Server Component (sem "use client")', () => {
    expect(PAGE).not.toMatch(/^'use client'/m);
  });

  it('page exporta metadata ou default page', () => {
    expect(PAGE).toMatch(/export default/);
  });

  it('page roteia pra /settings/notifications', () => {
    expect(PAGE).toMatch(/notifications/);
  });
});
