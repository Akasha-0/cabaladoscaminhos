/**
 * namespaces.ts — Nested key resolution + fallback chain + sacred-tradition coverage
 *
 * W71-A: W71-A i18n engine, sub-engine 4/4.
 *
 * Resolution chain (cycle 67 fallback pattern):
 *   ns:key (target locale) ->
 *   ns:key (pt-BR) ->
 *   key (target locale, no ns) ->
 *   key (pt-BR, no ns) ->
 *   key string itself
 *
 * Internal storage: keys are stored WITHOUT the namespace prefix
 * (e.g., 'cigano.mesa' not 'traditions.cigano.mesa'). The colon in
 * the public `ns:key` form is just a UX convention — the engine
 * splits on first colon to extract ns + inner key, then looks up
 * `tables[ns][locale][innerKey]`.
 *
 * Sacred coverage: 7 traditions × ≥4 terms each (cigano, orixas, astrology,
 * cabala, numerology, tarot, tantra). 28 sacred keys total.
 */

import {
  t as coreT,
  hasKey,
  getLocale,
  type Locale,
  type TranslationKey,
  interpolate,
} from './i18n-core.ts';

// ────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────

export type Namespace =
  | 'ui'
  | 'reading'
  | 'auth'
  | 'errors'
  | 'success'
  | 'time'
  | 'notifications'
  | 'traditions';

export type ScopedTranslator = {
  readonly t: (
    key: TranslationKey,
    vars?: Readonly<Record<string, string | number>>,
  ) => string;
  readonly pluralize: (
    key: TranslationKey,
    count: number,
    vars?: Readonly<Record<string, string | number>>,
  ) => string;
  readonly has: (key: TranslationKey) => boolean;
};

// ────────────────────────────────────────────────────────────────────
// Namespace store — runtime-registered translations
// ────────────────────────────────────────────────────────────────────

type NamespaceTables = Readonly<Record<Locale, Readonly<Record<string, string>>>>;

/** Mutable namespace store; preserved across calls. */
const store: Map<Namespace, NamespaceTables> = new Map();

// ────────────────────────────────────────────────────────────────────
// Sacred namespace seeds (7 traditions × 4 terms each, no ns prefix)
// ────────────────────────────────────────────────────────────────────

/**
 * Seed the namespace store with the sacred-tradition vocabulary.
 * Cycle 62 lesson: this is the canonical "sacred coverage count" baseline.
 * Each tradition has 4 terms × 3 locales. Keys stored WITHOUT 'traditions.'
 * prefix — the namespace is implicit in the store.
 */
function seedSacredTraditions(): void {
  const TRADITIONS: Readonly<Record<Locale, Readonly<Record<string, string>>>> = {
    'pt-BR': {
      // cigano (4)
      'cigano.mesa': 'mesa real',
      'cigano.baralho': 'baralho cigano',
      'cigano.jogada': 'jogada',
      'cigano.consultora': 'consultora cigana',

      // orixás (4)
      'orixas.orixá': 'orixá',
      'orixas.odú': 'odú de nascimento',
      'orixas.axé': 'axé',
      'orixas.floresta': 'floresta sagrada',

      // astrologia (4)
      'astrology.mapa': 'mapa astral',
      'astrology.casa': 'casa astrológica',
      'astrology.aspecto': 'aspecto',
      'astrology.mc': 'meio-do-céu',

      // cabala (4)
      'cabala.sephirah': 'sefirá',
      'cabala.arvore': 'árvore da vida',
      'cabala.torah': 'torá',
      'cabala.mediador': 'mediador',

      // numerologia (4)
      'numerology.caminho': 'caminho de vida',
      'numerology.destino': 'número do destino',
      'numerology.alma': 'número da alma',
      'numerology.mestre': 'número mestre',

      // tarot (4)
      'tarot.arcano': 'arcano',
      'tarot.maior': 'arcano maior',
      'tarot.corte': 'corte',
      'tarot.jogada': 'tiragem',

      // tantra (4)
      'tantra.chacra': 'chacra',
      'tantra.kundalini': 'kundalini',
      'tantra.mantra': 'mantra',
      'tantra.prana': 'prana',
    },
    en: {
      'cigano.mesa': 'royal table',
      'cigano.baralho': 'gypsy deck',
      'cigano.jogada': 'spread',
      'cigano.consultora': 'gypsy consultant',

      'orixas.orixá': 'orixá',
      'orixas.odú': 'birth odú',
      'orixas.axé': 'axé',
      'orixas.floresta': 'sacred forest',

      'astrology.mapa': 'natal chart',
      'astrology.casa': 'astrological house',
      'astrology.aspecto': 'aspect',
      'astrology.mc': 'midheaven',

      'cabala.sephirah': 'sephirah',
      'cabala.arvore': 'tree of life',
      'cabala.torah': 'torah',
      'cabala.mediador': 'mediator',

      'numerology.caminho': 'life path',
      'numerology.destino': 'destiny number',
      'numerology.alma': 'soul number',
      'numerology.mestre': 'master number',

      'tarot.arcano': 'arcana',
      'tarot.maior': 'major arcana',
      'tarot.corte': 'court',
      'tarot.jogada': 'reading',

      'tantra.chacra': 'chakra',
      'tantra.kundalini': 'kundalini',
      'tantra.mantra': 'mantra',
      'tantra.prana': 'prana',
    },
    es: {
      'cigano.mesa': 'mesa real',
      'cigano.baralho': 'baraja gitana',
      'cigano.jogada': 'tirada',
      'cigano.consultora': 'consultora gitana',

      'orixas.orixá': 'orixá',
      'orixas.odú': 'odú de nacimiento',
      'orixas.axé': 'axé',
      'orixas.floresta': 'bosque sagrado',

      'astrology.mapa': 'carta astral',
      'astrology.casa': 'casa astrológica',
      'astrology.aspecto': 'aspecto',
      'astrology.mc': 'medio cielo',

      'cabala.sephirah': 'sefirá',
      'cabala.arvore': 'árbol de la vida',
      'cabala.torah': 'torá',
      'cabala.mediador': 'mediador',

      'numerology.caminho': 'camino de vida',
      'numerology.destino': 'número del destino',
      'numerology.alma': 'número del alma',
      'numerology.mestre': 'número maestro',

      'tarot.arcano': 'arcano',
      'tarot.maior': 'arcano mayor',
      'tarot.corte': 'corte',
      'tarot.jogada': 'tirada',

      'tantra.chacra': 'chakra',
      'tantra.kundalini': 'kundalini',
      'tantra.mantra': 'mantra',
      'tantra.prana': 'prana',
    },
  };

  store.set(
    'traditions',
    Object.freeze({
      'pt-BR': Object.freeze({ ...TRADITIONS['pt-BR'] }),
      en: Object.freeze({ ...TRADITIONS.en }),
      es: Object.freeze({ ...TRADITIONS.es }),
    }),
  );
}

// Seed once on module load.
seedSacredTraditions();

// ────────────────────────────────────────────────────────────────────
// Lookup helpers
// ────────────────────────────────────────────────────────────────────

/**
 * Look up a `ns:key` in the given locale, falling back to pt-BR if missing.
 * The ns is the namespace name (e.g., 'traditions'); the key is the inner
 * key as stored (e.g., 'cigano.mesa').
 */
function lookupRaw(locale: Locale, fullKey: string): string | undefined {
  const colonIdx = fullKey.indexOf(':');
  if (colonIdx === -1) return undefined;
  const ns = fullKey.slice(0, colonIdx) as Namespace;
  const innerKey = fullKey.slice(colonIdx + 1);
  const tables = store.get(ns);
  if (!tables) return undefined;
  return tables[locale][innerKey] ?? tables['pt-BR'][innerKey];
}

// ────────────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────────────

/** Register or replace a namespace's translations at runtime. */
export function registerNamespace(
  ns: Namespace,
  translations: Readonly<Record<Locale, Readonly<Record<string, string>>>>,
): void {
  const frozen: NamespaceTables = Object.freeze({
    'pt-BR': Object.freeze({ ...translations['pt-BR'] }),
    en: Object.freeze({ ...translations.en }),
    es: Object.freeze({ ...translations.es }),
  });
  store.set(ns, frozen);
}

/** List all registered namespaces. */
export function listNamespaces(): Namespace[] {
  return Array.from(store.keys());
}

/** Get all keys for a namespace+locale (sorted, inner keys without ns prefix). */
export function getNamespaceKeys(ns: Namespace, locale: Locale): TranslationKey[] {
  const tables = store.get(ns);
  if (!tables) return [];
  // Use pt-BR as the canonical key list.
  const canonical = tables['pt-BR'];
  return Object.keys(canonical).sort() as unknown as TranslationKey[];
}

/** Total keys across all namespaces. */
export function countSacredKeys(): number {
  let total = 0;
  for (const ns of store.values()) {
    total += Object.keys(ns['pt-BR']).length;
  }
  return total;
}

/**
 * Coverage count: how many distinct tradition prefixes are present.
 * Keys are stored as 'cigano.mesa', 'orixas.odú' etc. (no 'traditions.'
 * prefix), so parts[0] gives the tradition.
 */
export function traditionCount(): number {
  const traditions = store.get('traditions');
  if (!traditions) return 0;
  const keys = Object.keys(traditions['pt-BR']);
  const prefixes = new Set<string>();
  for (const k of keys) {
    const parts = k.split('.');
    if (parts.length >= 2) prefixes.add(parts[0]);
  }
  return prefixes.size;
}

/** Return the list of distinct tradition prefixes (sorted). */
export function listTraditions(): string[] {
  const traditions = store.get('traditions');
  if (!traditions) return [];
  const keys = Object.keys(traditions['pt-BR']);
  const prefixes = new Set<string>();
  for (const k of keys) {
    const parts = k.split('.');
    if (parts.length >= 2) prefixes.add(parts[0]);
  }
  return Array.from(prefixes).sort();
}

/**
 * Resolve a scoped translator for a namespace.
 * Lookup chain: ns:key (target) -> ns:key (pt-BR) -> key (target core TABLE)
 *              -> key (pt-BR core TABLE) -> key string.
 */
export function useNamespace(ns: Namespace): ScopedTranslator {
  return {
    t: (key, vars) => {
      const fullKey = `${ns}:${key as string}`;
      const raw = lookupRaw(getLocale(), fullKey) ?? lookupRaw('pt-BR', fullKey);
      const template = raw ?? coreT(getLocale(), key, vars);
      return vars ? interpolate(template, vars) : template;
    },
    pluralize: (key, count, vars) => {
      const merged: Record<string, string | number> = { ...(vars ?? {}), count };
      const form = count === 1 ? 'one' : 'other';
      const innerSuffix = `${key as string}.${form}`;
      const fullKey = `${ns}:${innerSuffix}`;
      const formRaw =
        lookupRaw(getLocale(), fullKey) ?? lookupRaw('pt-BR', fullKey);
      if (formRaw) return interpolate(formRaw, merged);
      // Fallback: try base key (no .one/.other) in the namespace.
      const baseFullKey = `${ns}:${key as string}`;
      const baseRaw =
        lookupRaw(getLocale(), baseFullKey) ?? lookupRaw('pt-BR', baseFullKey);
      const resolved = baseRaw ?? coreT(getLocale(), key, merged);
      return interpolate(resolved, merged);
    },
    has: (key) => {
      const fullKey = `${ns}:${key as string}`;
      return (
        lookupRaw(getLocale(), fullKey) !== undefined ||
        lookupRaw('pt-BR', fullKey) !== undefined ||
        hasKey(getLocale(), key) ||
        hasKey('pt-BR', key)
      );
    },
  };
}

/** Reset all runtime namespaces to baseline (used by spec harness). */
export function resetNamespaces(): void {
  store.clear();
  seedSacredTraditions();
}

/** Direct test: lookup a single ns:key. */
export function nsLookup(
  ns: Namespace,
  key: string,
  locale: Locale,
): string | undefined {
  return lookupRaw(locale, `${ns}:${key}`);
}