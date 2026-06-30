// ============================================================================
// W91s — NotificationsPrefsForm.spec.tsx
// ============================================================================
// Spec source-inspection pro NotificationsPrefsForm. Sem vitest+jsdom (W88 bug).
//
// Cobre (≥10 asserts):
//   1) Estrutura (export default + named + 'use client')
//   2) ARIA acessível (role=switch, aria-checked, aria-label, aria-live)
//   3) Mobile-first 44px
//   4) LGPD gate (canSubmit disabled)
//   5) Sacred-cultural compliance (sem banned vocab)
//   6) Quiet Hours UI (controle HH:MM)
//   7) Hook integration (useNotificationPrefs + bulkSet + reset + commit)
//   8) data-testid coverage
// ============================================================================

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const FORM = readFileSync(
  resolve(__dirname, './NotificationsPrefsForm.tsx'),
  'utf8'
);

// ============================================================================
// [1] Estrutura
// ============================================================================

describe('[form] estrutura', () => {
  it('declara "use client"', () => {
    expect(FORM).toMatch(/^'use client'/m);
  });

  it('exporta named component NotificationsPrefsForm', () => {
    expect(FORM).toMatch(/export function NotificationsPrefsForm/);
  });

  it('exporta default NotificationsPrefsForm (Next.js convention)', () => {
    expect(FORM).toMatch(/export default NotificationsPrefsForm/);
  });

  it('usa hook useNotificationPrefs', () => {
    expect(FORM).toMatch(/useNotificationPrefs\(\{/);
  });

  it('importa constantes do engine (TRADICAO_ORDER, CHANNEL_*)', () => {
    expect(FORM).toMatch(/TRADICAO_ORDER/);
    expect(FORM).toMatch(/CHANNEL_ORDER/);
  });
});

// ============================================================================
// [2] ARIA acessível
// ============================================================================

describe('[form] ARIA', () => {
  it('channels usam role=switch + aria-checked', () => {
    expect(FORM).toMatch(/role="switch"/);
    expect(FORM).toMatch(/aria-checked=\{active\}/);
  });

  it('cada switch tem aria-label único', () => {
    expect(FORM).toMatch(/aria-label=`\$\{row\.meta\.label\}:/);
  });

  it('fieldset do grupo usa role="group" + aria-label', () => {
    expect(FORM).toMatch(/role="group"/);
    expect(FORM).toMatch(/aria-label=`Canais para/);
  });

  it('header tem aria-labelledby ligado ao título', () => {
    expect(FORM).toMatch(/aria-labelledby="notif-prefs-title"/);
    expect(FORM).toMatch(/id="notif-prefs-title"/);
  });

  it('status do quiet hours usa aria-live="polite"', () => {
    expect(FORM).toMatch(/aria-live="polite"/);
  });

  it('erro usa role="alert"', () => {
    expect(FORM).toMatch(/role="alert"/);
  });

  it('toggles de categoria usam aria-expanded', () => {
    expect(FORM).toMatch(/aria-expanded=\{expandedCats\[cat\]\}/);
  });
});

// ============================================================================
// [3] Mobile-first (44px touch targets)
// ============================================================================

describe('[form] mobile-first', () => {
  it('inputs e botões têm min-h-[44px] (≥3 ocorrências)', () => {
    const occurrences = (FORM.match(/min-h-\[44px\]/g) ?? []).length;
    expect(occurrences).toBeGreaterThanOrEqual(3);
  });

  it('layout é max-w-full mobile / sm:max-w-3xl', () => {
    expect(FORM).toMatch(/max-w-full sm:max-w-3xl/);
  });

  it('padding responsivo px-4 sm:px-6', () => {
    expect(FORM).toMatch(/px-4 sm:px-6/);
  });
});

// ============================================================================
// [4] LGPD gate (canSubmit)
// ============================================================================

describe('[form] LGPD gate', () => {
  it('save button usa disabled={!canSubmit}', () => {
    expect(FORM).toMatch(/disabled=\{!canSubmit\|\| status === 'saving'\}/);
  });

  it('reset button usa disabled={!dirty}', () => {
    expect(FORM).toMatch(/disabled=\{!dirty\}/);
  });

  it('bloqueia submit quando canSubmit=false via onPersist guard', () => {
    expect(FORM).toMatch(/if \(!canSubmit\)/);
  });

  it('comunica erro LGPD quando sem canais marcados', () => {
    expect(FORM).toMatch(/pelo menos um canal/);
  });
});

// ============================================================================
// [5] Sacred-cultural compliance
// ============================================================================

describe('[form] sacred-cultural compliance', () => {
  it('não usa banned vocab (split pra evitar spec self-flag)', () => {
    const banned: ReadonlyArray<string> = [
      'amarra' + 'ção',
      'amarre',
      'vincula' + 'ção',
      'odeio',
      'destruição',
      'bloquear',
    ];
    const lower = FORM.toLowerCase();
    const hits = banned.filter((t) => lower.includes(t));
    expect(hits.length).toBe(0);
  });

  it('preserva termos sagrados verbatim (cigano/cabala/umbanda/candomble)', () => {
    expect(FORM.toLowerCase()).toContain('cigano');
    expect(FORM.toLowerCase()).toContain('cabala');
    expect(FORM.toLowerCase()).toContain('umbanda');
    expect(FORM.toLowerCase()).toContain('candomble');
  });

  it('copy é descritiva (positive-only), sem "destruir/odiar"', () => {
    expect(FORM.toLowerCase()).toMatch(/salvar preferências/);
    expect(FORM.toLowerCase()).toMatch(/restaurar/);
  });
});

// ============================================================================
// [6] Quiet Hours UI
// ============================================================================

describe('[form] quiet hours', () => {
  it('campo Início usa type="time" + parseHHMM', () => {
    expect(FORM).toMatch(/<Input[^>]*type="time"[^>]*data-testid="quiet-hours-start"/);
    expect(FORM).toMatch(/parseHHMM\(e\.target\.value\)/);
  });

  it('campo Fim usa type="time" + parseHHMM', () => {
    expect(FORM).toMatch(/<Input[^>]*type="time"[^>]*data-testid="quiet-hours-end"/);
  });

  it('mostra estado dinâmico "Em silêncio agora" / "Fora da janela"', () => {
    expect(FORM).toMatch(/Em silêncio agora/);
    expect(FORM).toMatch(/Fora da janela/);
  });
});

// ============================================================================
// [7] Hook integration
// ============================================================================

describe('[form] hook integration', () => {
  it('consome toggle, toggleWeeklyDigest, bulkSet, setQuietHours', () => {
    expect(FORM).toMatch(/toggle\(/);
    expect(FORM).toMatch(/toggleWeeklyDigest\(/);
    expect(FORM).toMatch(/bulkSet\(/);
    expect(FORM).toMatch(/setQuietHours\(/);
  });

  it('chama commit() em caso de sucesso', () => {
    expect(FORM).toMatch(/setStatus\('saved'/);
    expect(FORM).toMatch(/commit\(\)/);
  });

  it('chama reset() no botão "Restaurar"', () => {
    expect(FORM).toMatch(/reset\(\)/);
  });

  it('passa tradicao como prop ou default "cigano"', () => {
    expect(FORM).toMatch(/tradicao = 'cigano'/);
  });
});

// ============================================================================
// [8] data-testid coverage (≥8 IDs distintas)
// ============================================================================

describe('[form] data-testid coverage', () => {
  it('tem testids pra quiet hours, save, reset, status', () => {
    expect(FORM).toMatch(/data-testid="quiet-hours-card"/);
    expect(FORM).toMatch(/data-testid="save-button"/);
    expect(FORM).toMatch(/data-testid="reset-button"/);
    expect(FORM).toMatch(/data-testid="notifications-prefs-form"/);
  });

  it('tem testids por canal (IN_APP/EMAIL/PUSH) em linha exemplo', () => {
    expect(FORM).toMatch(/data-testid="bulk-in-app-only"/);
    expect(FORM).toMatch(/data-testid="bulk-email-only"/);
  });

  it('count de testids distintos é ≥ 15', () => {
    const ids = new Set<string>();
    const re = /data-testid="([^"]+)"/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(FORM)) !== null) {
      ids.add(m[1]);
    }
    expect(ids.size).toBeGreaterThanOrEqual(15);
  });
});
