/**
 * namespaces.spec.ts — Self-running spec harness.
 */

let _passed = 0;
let _failed = 0;
let _its = 0;

function it(name: string, fn: () => void): void {
  _its++;
  try {
    fn();
    _passed++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    _failed++;
    console.log(`  ✗ ${name}\n    ${(e as Error).message}`);
  }
}

function expectEqual<T>(actual: T, expected: T, msg: string): void {
  if (actual !== expected) {
    throw new Error(`${msg}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function expectTrue(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg);
}

import {
  useNamespace,
  registerNamespace,
  listNamespaces,
  getNamespaceKeys,
  traditionCount,
  countSacredKeys,
  nsLookup,
  resetNamespaces,
} from '../engines/namespaces.ts';
import { setLocale, type TranslationKey, tk } from '../engines/i18n-core.ts';

export function runNamespacesSpec(): {
  passed: number;
  failed: number;
  its: number;
} {
  _passed = 0;
  _failed = 0;
  _its = 0;
  console.log('\n--- namespaces.spec.ts ---');

  setLocale('pt-BR');
  resetNamespaces();

  // ─── Sacred coverage ───
  it('traditionCount() returns 7 traditions', () => {
    expectEqual(traditionCount(), 7, '7 sacred traditions seeded');
  });

  it('countSacredKeys() >= 21 (7 traditions × ≥3 terms)', () => {
    const n = countSacredKeys();
    expectTrue(n >= 21, `sacred keys >= 21 (got ${n})`);
  });

  it('listNamespaces() includes traditions', () => {
    const list = listNamespaces();
    expectTrue(list.includes('traditions'), 'has traditions ns');
  });

  it('getNamespaceKeys returns sorted key list for traditions', () => {
    const keys = getNamespaceKeys('traditions', 'pt-BR');
    expectTrue(keys.length >= 21, `>= 21 keys (got ${keys.length})`);
    // Sorted? — should be the sorted PT-BR key list.
    const sorted = [...keys].sort();
    expectEqual(JSON.stringify(keys), JSON.stringify(sorted), 'keys are sorted');
  });

  // ─── Sacred tradition lookups ───
  it('nsLookup finds cigano.mesa in all 3 locales', () => {
    expectTrue(
      nsLookup('traditions', 'cigano.mesa', 'pt-BR') === 'mesa real',
      'pt-BR cigano.mesa',
    );
    expectTrue(
      nsLookup('traditions', 'cigano.mesa', 'en') === 'royal table',
      'en cigano.mesa',
    );
    expectTrue(
      nsLookup('traditions', 'cigano.mesa', 'es') === 'mesa real',
      'es cigano.mesa',
    );
  });

  it('nsLookup finds orixas.odú in all 3 locales', () => {
    expectTrue(
      nsLookup('traditions', 'orixas.odú', 'pt-BR') === 'odú de nascimento',
      'pt-BR orixas.odú',
    );
    expectTrue(
      nsLookup('traditions', 'orixas.odú', 'en') === 'birth odú',
      'en orixas.odú',
    );
    expectTrue(
      nsLookup('traditions', 'orixas.odú', 'es') === 'odú de nacimiento',
      'es orixas.odú',
    );
  });

  it('nsLookup finds astrology.mc in all 3 locales', () => {
    expectTrue(
      nsLookup('traditions', 'astrology.mc', 'pt-BR') === 'meio-do-céu',
      'pt-BR astrology.mc',
    );
    expectTrue(
      nsLookup('traditions', 'astrology.mc', 'en') === 'midheaven',
      'en astrology.mc',
    );
    expectTrue(
      nsLookup('traditions', 'astrology.mc', 'es') === 'medio cielo',
      'es astrology.mc',
    );
  });

  it('nsLookup finds cabala.arvore in all 3 locales', () => {
    expectTrue(
      nsLookup('traditions', 'cabala.arvore', 'pt-BR') === 'árvore da vida',
      'pt-BR cabala.arvore',
    );
    expectTrue(
      nsLookup('traditions', 'cabala.arvore', 'en') === 'tree of life',
      'en cabala.arvore',
    );
    expectTrue(
      nsLookup('traditions', 'cabala.arvore', 'es') === 'árbol de la vida',
      'es cabala.arvore',
    );
  });

  it('nsLookup finds numerology.mestre in all 3 locales', () => {
    expectTrue(
      nsLookup('traditions', 'numerology.mestre', 'pt-BR') === 'número mestre',
      'pt-BR numerology.mestre',
    );
    expectTrue(
      nsLookup('traditions', 'numerology.mestre', 'en') === 'master number',
      'en numerology.mestre',
    );
    expectTrue(
      nsLookup('traditions', 'numerology.mestre', 'es') === 'número maestro',
      'es numerology.mestre',
    );
  });

  it('nsLookup finds tarot.maior in all 3 locales', () => {
    expectTrue(
      nsLookup('traditions', 'tarot.maior', 'pt-BR') === 'arcano maior',
      'pt-BR tarot.maior',
    );
    expectTrue(
      nsLookup('traditions', 'tarot.maior', 'en') === 'major arcana',
      'en tarot.maior',
    );
    expectTrue(
      nsLookup('traditions', 'tarot.maior', 'es') === 'arcano mayor',
      'es tarot.maior',
    );
  });

  it('nsLookup finds tantra.kundalini in all 3 locales', () => {
    expectTrue(
      nsLookup('traditions', 'tantra.kundalini', 'pt-BR') === 'kundalini',
      'pt-BR tantra.kundalini',
    );
    expectTrue(
      nsLookup('traditions', 'tantra.kundalini', 'en') === 'kundalini',
      'en tantra.kundalini',
    );
    expectTrue(
      nsLookup('traditions', 'tantra.kundalini', 'es') === 'kundalini',
      'es tantra.kundalini',
    );
  });

  // ─── useNamespace ───
  it('useNamespace("traditions").t() returns localized term', () => {
    const ns = useNamespace('traditions');
    expectEqual(ns.t(tk('cigano.baralho')), 'baralho cigano', 'pt-BR traditions.cigano.baralho');
  });

  it('useNamespace respects setLocale (en)', () => {
    setLocale('en');
    const ns = useNamespace('traditions');
    expectEqual(ns.t(tk('cigano.baralho')), 'gypsy deck', 'en traditions.cigano.baralho');
    setLocale('pt-BR');
  });

  it('useNamespace pluralize injects count', () => {
    const ns = useNamespace('traditions');
    // No .one/.other registered for traditions.cigano.mesa, fallback fires.
    const out = ns.pluralize(tk('cigano.mesa'), 3);
    expectEqual(out, 'mesa real', 'pluralize fallback to base key');
  });

  it('useNamespace.has() returns true for registered keys', () => {
    const ns = useNamespace('traditions');
    expectTrue(ns.has(tk('cigano.mesa')), 'has cigano.mesa');
    expectTrue(ns.has(tk('orixas.odú')), 'has orixas.odú');
    expectTrue(ns.has(tk('astrology.mc')), 'has astrology.mc');
  });

  it('useNamespace.has() returns false for missing keys', () => {
    const ns = useNamespace('traditions');
    expectEqual(ns.has(tk('unknown.key')), false, 'unknown.key');
  });

  // ─── Runtime registration ───
  it('registerNamespace adds a new ns at runtime', () => {
    registerNamespace('ui', {
      'pt-BR': { 'btn.go': 'Ir' },
      en: { 'btn.go': 'Go' },
      es: { 'btn.go': 'Ir' },
    });
    const ns = useNamespace('ui');
    expectEqual(ns.t(tk('btn.go')), 'Ir', 'pt-BR ui.btn.go');
    setLocale('en');
    expectEqual(ns.t(tk('btn.go')), 'Go', 'en ui.btn.go');
    setLocale('pt-BR');
  });

  it('registerNamespace replaces an existing ns', () => {
    registerNamespace('ui', {
      'pt-BR': { 'btn.go': 'Vai' },
      en: { 'btn.go': 'Go ahead' },
      es: { 'btn.go': 'Vamos' },
    });
    const ns = useNamespace('ui');
    expectEqual(ns.t(tk('btn.go')), 'Vai', 'pt-BR replaced');
  });

  it('listNamespaces() includes runtime-registered ns', () => {
    const list = listNamespaces();
    expectTrue(list.includes('ui'), 'listNamespaces has ui');
  });

  // ─── Fallback chain ───
  it('fallback: ns:key -> key (no ns) -> key string', () => {
    registerNamespace('reading', {
      'pt-BR': { 'card.tarot': 'carta de tarot' },
      en: {},
      es: {},
    });
    const ns = useNamespace('reading');
    // en lookup misses in ns (en empty), falls back to pt-BR ns entry
    setLocale('en');
    expectEqual(ns.t(tk('card.tarot')), 'carta de tarot', 'en fallback to pt-BR ns');
    setLocale('pt-BR');
  });

  it('fallback chain ultimately returns key string', () => {
    const ns = useNamespace('ui');
    expectEqual(ns.t(tk('completely.missing')), 'completely.missing', 'final fallback');
  });

  return { passed: _passed, failed: _failed, its: _its };
}

runNamespacesSpec();