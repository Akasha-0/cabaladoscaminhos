/**
 * @file W42 — Translation tooling
 *
 * Cycle 42 of the Akasha Portal wave-spawner. Provides a complete, dependency-free
 * toolkit for managing a multilingual codebase: key extraction from source,
 * missing-translation detection, ICU MessageFormat formatting with plural rules
 * for pt-BR / en / es, glossary enforcement, pseudo-locale generation for QA,
 * translation-memory export, and key-tree diffing.
 *
 * Design constraints:
 *   - No external runtime dependencies (stdlib only).
 *   - Pure functions — no I/O, no globals, no React.
 *   - Every public export is JSDoc-documented.
 *
 * @module w42/translation-tooling
 */

// ─────────────────────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────────────────────

/** BCP-47 style locale tag (we use a plain string so consumers stay flexible). */
export type LocaleCode = string;

/** Directionality for a locale, affects pseudo-locale generation and validation. */
export type LocaleDirection = 'ltr' | 'rtl';

/** A translation key as it appears in source code. */
export interface I18nKey {
  /** Namespace, typically the module or feature folder (e.g. `"feed"`). */
  namespace: string;
  /** Dotted path inside the namespace (e.g. `"card.aria.like"`). */
  key: string;
  /** Default (source-language) string. */
  defaultValue: string;
  /** Optional file the key was declared in (for tooling diagnostics). */
  file?: string;
}

/** A key extracted from a source-code scan, with all occurrences and contexts. */
export interface ExtractedKey {
  /** Fully-qualified key (e.g. `"feed.card.aria.like"`). */
  key: string;
  /** Source occurrences formatted as `"<file>:<line>:<col>"`. */
  occurrences: string[];
  /** Free-form contexts captured alongside the key (e.g. component name, JSDoc). */
  contexts: string[];
  /** Default value inferred from the call site if available. */
  defaultValue?: string;
  /** Source file path (basename of the first occurrence, for tooling). */
  file?: string;
}

/** A map of locale → key → translated string. Supports nesting via dotted keys. */
export type TranslationMap = Record<LocaleCode, Record<string, string>>;

/** A missing translation record. */
export interface MissingTranslation {
  /** Locale missing the translation. */
  locale: LocaleCode;
  /** Key absent in that locale. */
  key: string;
  /** Source-locale value (the expected fallback). */
  sourceValue: string;
  /** Other locales that DO have this key (helps translators find references). */
  presentIn: LocaleCode[];
}

/** A single diff between two translation maps for a specific locale. */
export interface TranslationDiff {
  /** Locale under inspection. */
  locale: LocaleCode;
  /** Key being reported. */
  key: string;
  /** Diff kind. */
  kind: 'added' | 'removed' | 'changed';
  /** Previous value (undefined for `added`). */
  before?: string;
  /** Current value (undefined for `removed`). */
  after?: string;
}

/** Per-locale metadata. */
export interface LocaleConfig {
  code: LocaleCode;
  /** Human-readable name (e.g. `"Português (Brasil)"`). */
  name: string;
  direction: LocaleDirection;
  /** CLDR date pattern skeleton (e.g. `"dd/MM/yyyy"`). */
  dateFormat: string;
  /** CLDR number pattern skeleton (e.g. `"#,##0.##"`). */
  numberFormat: string;
  /** ICU nplurals count (1 or 2 for the languages we ship). */
  nplurals: number;
  /** Plural category names in CLDR order (`["one","other"]` for pt-BR/en/es). */
  pluralCategories: PluralCategory[];
}

/** ICU plural / select categories we care about. */
export type PluralCategory = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

/** A plural rule, expressed as a CLDR-style predicate. */
export interface PluralRule {
  locale: LocaleCode;
  /** Pick category for the given numeric count. */
  pick: (count: number) => PluralCategory;
}

/** Validation issue surfaced by tooling. */
export interface ValidationError {
  /** Severity. */
  severity: 'error' | 'warning';
  /** Stable error code (machine-readable). */
  code:
    | 'ICU_SYNTAX'
    | 'PLACEHOLDER_MISMATCH'
    | 'MISSING_PLURAL_CATEGORY'
    | 'GLOSSARY_VIOLATION'
    | 'KEY_COLLISION'
    | 'EMPTY_VALUE'
    | 'WHITESPACE_MISMATCH'
    | 'QUOTE_MISMATCH';
  /** Locale the issue applies to (or `"*"` for global). */
  locale: LocaleCode | '*';
  /** Key the issue applies to. */
  key: string;
  /** Human-readable message. */
  message: string;
}

/** A glossary entry — words/phrases that must not be translated. */
export interface GlossaryEntry {
  /** Source term (case-insensitive matching). */
  term: string;
  /** Optional per-locale overrides (defaults to keeping `term` verbatim). */
  overrides?: Partial<Record<LocaleCode, string>>;
  /** Free-form explanation shown when the rule fires. */
  rationale?: string;
}

/** A nested key tree, derived from dotted keys. */
export interface KeyTreeNode {
  /** Leaf string value or undefined for intermediate nodes. */
  value?: string;
  /** Child nodes keyed by segment. */
  children: Record<string, KeyTreeNode>;
}

/** Pseudo-locale transformation result for QA. */
export interface PseudoLocaleResult {
  locale: LocaleCode;
  transformed: TranslationMap;
}

/** Translation-memory export unit (TMX-inspired, simplified to JSON). */
export interface TMXEntry {
  source: string;
  target: string;
  locale: LocaleCode;
  key: string;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Key extraction
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract i18n key calls from a TypeScript/JavaScript source string.
 * Recognises the following patterns:
 *   - `t('foo.bar')` / `t("foo.bar")` / `t(`foo.bar`)`
 *   - `i18n.t('foo.bar')`
 *   - `useTranslation('namespace').t('key')`
 *   - Optional second arg defaults: `t('foo', 'Default text')`
 *
 * @param sourceCode  Raw source string to scan.
 * @param file        Optional file label included on each occurrence.
 * @returns           Deduplicated list of extracted keys with occurrence info.
 */
export function extractKeys(sourceCode: string, file?: string): ExtractedKey[] {
  const byKey = new Map<string, ExtractedKey>();
  const lines = sourceCode.split(/\r?\n/);

  // Pattern 1: t('key' [, 'default'])
  const callRe = /\b(?:i18n\.t|\bt)\s*\(\s*(['"`])((?:\\.|(?!\1)[\s\S])*?)\1(?:\s*,\s*(['"`])((?:\\.|(?!\3)[\s\S])*?)\3)?/g;
  // Pattern 2: useTranslation('ns')
  const nsRe = /\buseTranslation\s*\(\s*(['"`])([^'"`]+)\1\s*\)/g;
  // Pattern 3: const { t } = useTranslation('ns')  — handled together with nsRe.

  let currentNs = '';
  for (const m of sourceCode.matchAll(nsRe)) {
    currentNs = m[2];
  }

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];

    // Update namespace if a useTranslation call sits on this line.
    const nsMatch = /\buseTranslation\s*\(\s*(['"`])([^'"`]+)\1\s*\)/.exec(line);
    if (nsMatch) currentNs = nsMatch[2];

    callRe.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = callRe.exec(line)) !== null) {
      const rawKey = m[2];
      const defVal = m[4];
      const qualified = currentNs && !rawKey.includes(':') ? `${currentNs}:${rawKey}` : rawKey;
      const occ = file ? `${file}:${lineIdx + 1}:${m.index + 1}` : `${lineIdx + 1}:${m.index + 1}`;
      const existing = byKey.get(qualified);
      if (existing) {
        existing.occurrences.push(occ);
        if (defVal && !existing.defaultValue) existing.defaultValue = unescapeString(defVal);
        if (!existing.contexts.length && currentNs) existing.contexts.push(`ns:${currentNs}`);
      } else {
        byKey.set(qualified, {
          key: qualified,
          occurrences: [occ],
          contexts: currentNs ? [`ns:${currentNs}`] : [],
          defaultValue: defVal ? unescapeString(defVal) : undefined,
          file,
        });
      }
    }
  }

  return Array.from(byKey.values()).sort((a, b) => a.key.localeCompare(b.key));
}

/** Unescape a JS string literal (handles the common escapes we encounter in t() calls). */
function unescapeString(raw: string): string {
  return raw
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\`/g, '`')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\');
}

/** Group a flat list of extracted keys by namespace (the segment before the first `.` or `:`). */
export function groupByNamespace(keys: ExtractedKey[]): Record<string, ExtractedKey[]> {
  const out: Record<string, ExtractedKey[]> = {};
  for (const k of keys) {
    const sep = k.key.search(/[.:]/);
    const ns = sep === -1 ? '_' : k.key.slice(0, sep);
    (out[ns] ||= []).push(k);
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Translation-map analysis
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Find keys present in the source locale but missing in any of the target locales.
 *
 * @param map            Full translation map keyed by locale.
 * @param sourceLocale   Locale considered authoritative.
 * @param targetLocales  Locales to check. Defaults to all locales other than `sourceLocale`.
 */
export function findMissingTranslations(
  map: TranslationMap,
  sourceLocale: LocaleCode,
  targetLocales?: LocaleCode[],
): MissingTranslation[] {
  const targets = targetLocales ?? Object.keys(map).filter((l) => l !== sourceLocale);
  const source = map[sourceLocale] ?? {};
  const out: MissingTranslation[] = [];

  for (const key of Object.keys(source)) {
    const sourceValue = source[key];
    for (const locale of targets) {
      const t = map[locale] ?? {};
      if (!(key in t) || !t[key] || t[key].trim() === '') {
        const presentIn: LocaleCode[] = [];
        for (const other of Object.keys(map)) {
          if (other === locale) continue;
          if (map[other]?.[key]) presentIn.push(other);
        }
        out.push({ locale, key, sourceValue, presentIn });
      }
    }
  }

  return out;
}

/**
 * Find keys extracted from source code that never appear in any locale of the map.
 * Useful for dead-code detection on translations.
 */
export function findUnusedKeys(map: TranslationMap, extractedKeys: ExtractedKey[]): string[] {
  const known = new Set<string>();
  for (const locale of Object.keys(map)) {
    for (const k of Object.keys(map[locale])) known.add(k);
  }
  return extractedKeys.map((k) => k.key).filter((k) => !known.has(k));
}

/**
 * Detect key collisions — same key, different default values across files.
 * Returns one entry per offending key with all observed defaults.
 */
export function detectKeyCollisions(keys: ExtractedKey[]): Record<string, string[]> {
  const byKey: Record<string, Set<string>> = {};
  for (const k of keys) {
    if (!k.defaultValue) continue;
    (byKey[k.key] ||= new Set<string>()).add(k.defaultValue);
  }
  const out: Record<string, string[]> = {};
  for (const [k, set] of Object.entries(byKey)) {
    if (set.size > 1) out[k] = Array.from(set);
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
//  ICU MessageFormat (subset)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Apply an ICU MessageFormat-style template to the given arguments.
 * Supports:
 *   - `{var}` — simple variable interpolation.
 *   - `{var, plural, =0 {…} one {…} other {…}}` — CLDR plural.
 *   - `{var, select, foo {…} bar {…} other {…}}` — CLDR select.
 *
 * Falls back gracefully for unknown argument types.
 *
 * @param template  ICU MessageFormat template.
 * @param args      Argument map keyed by variable name.
 * @param locale    Locale used to pick plural categories (defaults to `"en"`).
 */
export function formatIcu(
  template: string,
  args: Record<string, string | number | boolean> = {},
  locale: LocaleCode = 'en',
): string {
  let i = 0;
  return walk(template, args, locale, () => i++);

  function walk(src: string, a: typeof args, loc: LocaleCode, gensym: () => number): string {
    let out = '';
    let buf = '';
    let depth = 0;
    let inSimple = false;
    let simpleStart = -1;

    const flushSimple = (end: number) => {
      if (inSimple && simpleStart >= 0) {
        const name = src.slice(simpleStart, end).trim();
        out += renderVar(name, a);
        inSimple = false;
        simpleStart = -1;
      }
    };

    for (let idx = 0; idx < src.length; idx++) {
      const ch = src[idx];
      if (ch === '{') {
        if (depth === 0) {
          flushSimple(idx);
          // Find matching closing brace, respecting nested braces.
          let innerDepth = 1;
          let j = idx + 1;
          while (j < src.length && innerDepth > 0) {
            if (src[j] === '{') innerDepth++;
            else if (src[j] === '}') innerDepth--;
            if (innerDepth > 0) j++;
          }
          const inner = src.slice(idx + 1, j);
          out += renderBlock(inner, a, loc, gensym);
          idx = j;
          continue;
        }
        depth++;
        buf += ch;
      } else if (ch === '}') {
        if (depth > 0) {
          depth--;
          buf += ch;
        }
      } else if (depth === 0 && ch === "'") {
        // ICU quoted literal: skip next single-quoted span.
        if (src[idx + 1] === "'") {
          out += "'";
          idx++;
        } else {
          let j = idx + 1;
          while (j < src.length && src[j] !== "'") j++;
          out += src.slice(idx + 1, j);
          idx = j;
        }
      } else if (depth === 0 && /[a-zA-Z0-9_]/.test(ch)) {
        if (!inSimple) {
          inSimple = true;
          simpleStart = idx;
        }
        if (inSimple) {
          // continue collecting in `out` would be wrong — we collect via `simpleStart`.
        }
      } else {
        if (inSimple) {
          out += renderVar(src.slice(simpleStart, idx).trim(), a);
          inSimple = false;
          simpleStart = -1;
        }
        out += ch;
      }
    }
    flushSimple(src.length);
    return out;
  }

  function renderVar(name: string, a: typeof args): string {
    const trimmed = name.trim();
    if (!(trimmed in a)) return `{${trimmed}}`;
    return String(a[trimmed]);
  }

  function renderBlock(
    inner: string,
    a: typeof args,
    loc: LocaleCode,
    gensym: () => number,
  ): string {
    // Inner form: `name, type, cases...`
    const firstComma = findTopComma(inner);
    const head = firstComma === -1 ? inner : inner.slice(0, firstComma);
    const rest = firstComma === -1 ? '' : inner.slice(firstComma + 1).trim();

    const headParts = head.split(',').map((s) => s.trim());
    const name = headParts[0];
    const type = (headParts[1] || 'simple').toLowerCase();

    if (type === 'simple' || type === '') {
      return renderVar(name, a);
    }
    if (type === 'plural') {
      const value = Number(a[name] ?? 0);
      const cat = pickPluralCategory(loc, value);
      const cases = parseCases(rest);
      // Honor exact `=N` matches first.
      const exact = cases[`=${value}`];
      if (exact !== undefined) return expand(exact, a, loc, gensym);
      const picked = cases[cat] ?? cases.other;
      if (picked === undefined) return '';
      return expand(picked, a, loc, gensym);
    }
    if (type === 'select' || type === 'selectordinal') {
      const value = String(a[name] ?? '');
      const cat = type === 'selectordinal' ? pickOrdinalCategory(loc, Number(value)) : value;
      const cases = parseCases(rest);
      const picked = cases[cat] ?? cases.other;
      if (picked === undefined) return '';
      return expand(picked, a, loc, gensym);
    }
    // Unknown type — render as-is.
    return `{${inner}}`;
  }

  function findTopComma(s: string): number {
    let depth = 0;
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (c === '{') depth++;
      else if (c === '}') depth--;
      else if (c === ',' && depth === 0) return i;
    }
    return -1;
  }

  function parseCases(s: string): Record<string, string> {
    const out: Record<string, string> = {};
    let i = 0;
    while (i < s.length) {
      // skip whitespace and commas
      while (i < s.length && /\s|,/.test(s[i])) i++;
      if (i >= s.length) break;
      // read key
      let keyEnd = i;
      while (keyEnd < s.length && s[keyEnd] !== '{') keyEnd++;
      const key = s.slice(i, keyEnd).trim();
      // read {...} body
      if (s[keyEnd] !== '{') break;
      let depth = 1;
      let j = keyEnd + 1;
      while (j < s.length && depth > 0) {
        if (s[j] === '{') depth++;
        else if (s[j] === '}') depth--;
        if (depth > 0) j++;
      }
      const body = s.slice(keyEnd + 1, j);
      out[key] = body;
      i = j + 1;
    }
    return out;
  }

  function expand(body: string, a: typeof args, loc: LocaleCode, g: () => number): string {
    // `#` inside a plural block refers to the count value.
    const count = Number(a['__count'] ?? 0);
    const scoped: typeof a = { ...a, '#': String(count) };
    return walk(body, scoped, loc, g);
  }
}

/**
 * Format a plural template (sugar over `formatIcu`). Pass `count` as the
 * variable name expected by the template.
 */
export function formatPlural(
  template: string,
  count: number,
  locale: LocaleCode = 'en',
  varName: string = 'count',
): string {
  return formatIcu(template, { [varName]: count }, locale);
}

// ─────────────────────────────────────────────────────────────────────────────
//  Plural rules
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Pick a plural category for a numeric count under the rules of `locale`.
 * Supports pt-BR, en, es (all nplurals=2 with categories `one` / `other`).
 * Other locales fall back to CLDR defaults (0/1 → one, else other).
 */
export function pickPluralCategory(locale: LocaleCode, count: number): PluralCategory {
  const n = Math.abs(count);
  if (locale === 'pt-BR' || locale === 'pt' || locale === 'en') {
    return n === 1 ? 'one' : 'other';
  }
  if (locale === 'es') {
    return n === 1 ? 'one' : 'other';
  }
  // CLDR-style generic fallback.
  return n === 1 ? 'one' : 'other';
}

/** Pick a selectordinal category. We keep the same logic as cardinals for v1. */
export function pickOrdinalCategory(locale: LocaleCode, count: number): PluralCategory {
  return pickPluralCategory(locale, count);
}

/**
 * Built-in plural rules for the locales we ship. Extending to new locales is a
 * matter of adding entries here and providing a `pick` function.
 */
export const BUILTIN_PLURAL_RULES: PluralRule[] = [
  {
    locale: 'pt-BR',
    pick: (n) => (Math.abs(n) === 1 ? 'one' : 'other'),
  },
  {
    locale: 'en',
    pick: (n) => (Math.abs(n) === 1 ? 'one' : 'other'),
  },
  {
    locale: 'es',
    pick: (n) => (Math.abs(n) === 1 ? 'one' : 'other'),
  },
];

/** Return the plural rule for a locale, or a sensible fallback if unknown. */
export function getPluralRule(locale: LocaleCode): PluralRule {
  return (
    BUILTIN_PLURAL_RULES.find((r) => r.locale === locale) ?? {
      locale,
      pick: (n) => (Math.abs(n) === 1 ? 'one' : 'other'),
    }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Validation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validate ICU syntax + plural completeness for the given translation map.
 * Surfaces placeholder mismatches, missing plural categories, and empty values.
 */
export function validatePluralRules(map: TranslationMap, locale: LocaleCode): ValidationError[] {
  const errs: ValidationError[] = [];
  const data = map[locale] ?? {};
  const other = firstOtherLocale(map, locale);

  for (const [key, value] of Object.entries(data)) {
    if (!value || value.trim() === '') {
      errs.push({
        severity: 'error',
        code: 'EMPTY_VALUE',
        locale,
        key,
        message: `Translation is empty for ${locale}.`,
      });
      continue;
    }

    // Brace-balance check.
    const opens = (value.match(/\{/g) || []).length;
    const closes = (value.match(/\}/g) || []).length;
    if (opens !== closes) {
      errs.push({
        severity: 'error',
        code: 'ICU_SYNTAX',
        locale,
        key,
        message: `Unbalanced braces in translation (${opens} '{' vs ${closes} '}').`,
      });
    }

    // Plural block completeness.
    const pluralRe = /\{(\w+),\s*plural\s*,([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;
    let m: RegExpExecArray | null;
    while ((m = pluralRe.exec(value)) !== null) {
      const inner = m[2];
      const cats = parseCaseKeys(inner);
      if (!cats.includes('other')) {
        errs.push({
          severity: 'error',
          code: 'MISSING_PLURAL_CATEGORY',
          locale,
          key,
          message: `Plural block missing required "other" case.`,
        });
      }
      const rule = getPluralRule(locale);
      const sample = [0, 1, 2, 5];
      for (const s of sample) {
        const cat = rule.pick(s);
        if (!cats.includes(cat) && !cats.some((c) => c.startsWith('='))) {
          errs.push({
            severity: 'warning',
            code: 'MISSING_PLURAL_CATEGORY',
            locale,
            key,
            message: `Plural block has no case for category "${cat}" (sample count=${s}).`,
          });
        }
      }
    }

    // Placeholder consistency vs. source locale.
    if (other) {
      const sourceValue = map[other]?.[key];
      if (sourceValue) {
        const a = extractPlaceholders(sourceValue);
        const b = extractPlaceholders(value);
        const missing = a.filter((p) => !b.includes(p));
        const extra = b.filter((p) => !a.includes(p));
        if (missing.length || extra.length) {
          errs.push({
            severity: 'error',
            code: 'PLACEHOLDER_MISMATCH',
            locale,
            key,
            message: `Placeholder mismatch vs ${other}: missing=[${missing.join(',')}] extra=[${extra.join(',')}]`,
          });
        }
      }
    }

    // Whitespace/quote normalisation drift.
    if (other) {
      const sourceValue = map[other]?.[key];
      if (sourceValue) {
        if (sourceValue.trim() !== value.trim()) {
          errs.push({
            severity: 'warning',
            code: 'WHITESPACE_MISMATCH',
            locale,
            key,
            message: `Outer whitespace differs from ${other} source.`,
          });
        }
        const sQuote = (sourceValue.match(/'/g) || []).length;
        const tQuote = (value.match(/'/g) || []).length;
        if (sQuote !== tQuote) {
          errs.push({
            severity: 'warning',
            code: 'QUOTE_MISMATCH',
            locale,
            key,
            message: `Apostrophe count differs from ${other} (${sQuote} vs ${tQuote}).`,
          });
        }
      }
    }
  }

  return errs;
}

function firstOtherLocale(map: TranslationMap, locale: LocaleCode): LocaleCode | undefined {
  return Object.keys(map).find((l) => l !== locale);
}

function parseCaseKeys(s: string): string[] {
  const keys: string[] = [];
  const re = /([=\w]+)\s*\{/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) keys.push(m[1]);
  return keys;
}

/** Extract `{var}` placeholders from a template, preserving order. */
export function extractPlaceholders(template: string): string[] {
  const out: string[] = [];
  const re = /\{(\w+)(?:,[^}]*)?\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(template)) !== null) out.push(m[1]);
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Locale configuration
// ─────────────────────────────────────────────────────────────────────────────

/** Built-in locale configurations for the locales shipped by the portal. */
export const BUILTIN_LOCALES: LocaleConfig[] = [
  {
    code: 'pt-BR',
    name: 'Português (Brasil)',
    direction: 'ltr',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: '#.##0,##',
    nplurals: 2,
    pluralCategories: ['one', 'other'],
  },
  {
    code: 'en',
    name: 'English',
    direction: 'ltr',
    dateFormat: 'MM/dd/yyyy',
    numberFormat: '#,##0.##',
    nplurals: 2,
    pluralCategories: ['one', 'other'],
  },
  {
    code: 'es',
    name: 'Español',
    direction: 'ltr',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: '#.##0,##',
    nplurals: 2,
    pluralCategories: ['one', 'other'],
  },
];

export function getLocaleConfig(code: LocaleCode): LocaleConfig | undefined {
  return BUILTIN_LOCALES.find((l) => l.code === code);
}

// ─────────────────────────────────────────────────────────────────────────────
//  Normalisation
// ─────────────────────────────────────────────────────────────────────────────

/** Trim outer whitespace, collapse internal newlines, normalise unicode quotes. */
export function normalizeWhitespace(s: string): string {
  return s
    .replace(/\r\n/g, '\n')
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Round-trip a value through normalisation and report whether anything changed. */
export function isNormalized(s: string): boolean {
  return normalizeWhitespace(s) === s;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Pseudo-locale generator
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a pseudo-locale transformation for QA. Wraps every string in `[!! … !!]`,
 * accents vowels, and pads length by ~30% so designers can spot truncation early.
 *
 * @param sourceMap  Source-locale translations.
 * @param pseudo     Target pseudo-locale code (default `"en-XA"`).
 * @param source     Source locale code (default `"en"`).
 */
export function generatePseudoLocale(
  sourceMap: TranslationMap,
  pseudo: LocaleCode = 'en-XA',
  source: LocaleCode = 'en',
): PseudoLocaleResult {
  const src = sourceMap[source] ?? {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(src)) {
    out[key] = pseudoTransform(value);
  }
  return { locale: pseudo, transformed: { ...sourceMap, [pseudo]: out } };
}

function pseudoTransform(s: string): string {
  const accented = s
    .replace(/a/g, 'á')
    .replace(/e/g, 'ê')
    .replace(/i/g, 'í')
    .replace(/o/g, 'ô')
    .replace(/u/g, 'ú')
    .replace(/A/g, 'Á')
    .replace(/E/g, 'Ê')
    .replace(/I/g, 'Í')
    .replace(/O/g, 'Ô')
    .replace(/U/g, 'Ú');
  const padded = accented + ' ‽‽‽'; // visible padding marker
  return `[!! ${padded} !!]`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Translation memory
// ─────────────────────────────────────────────────────────────────────────────

/** Export a translation map as a TMX-shaped JSON array (one entry per key per locale). */
export function exportTmx(map: TranslationMap, source: LocaleCode): TMXEntry[] {
  const entries: TMXEntry[] = [];
  const src = map[source] ?? {};
  for (const locale of Object.keys(map)) {
    if (locale === source) continue;
    const tgt = map[locale];
    for (const key of Object.keys(src)) {
      if (tgt[key]) {
        entries.push({ source: src[key], target: tgt[key], locale, key });
      }
    }
  }
  return entries;
}

/** Compute a stable fingerprint for a source string, suitable for fuzzy matching. */
export function fingerprintSource(s: string): string {
  const norm = normalizeWhitespace(s).toLowerCase();
  // Strip punctuation, collapse whitespace, take first letters of each word.
  const tokens = norm
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
  return tokens
    .map((t) => t.slice(0, 3))
    .join('-')
    .slice(0, 64);
}

/** Simple fuzzy-match score: ratio of common trigrams between two strings. */
export function fuzzyScore(a: string, b: string): number {
  if (!a || !b) return 0;
  const ta = trigrams(a);
  const tb = trigrams(b);
  if (!ta.length || !tb.length) return 0;
  let inter = 0;
  const seen = new Set<string>();
  for (const t of ta) {
    if (tb.includes(t) && !seen.has(t)) {
      inter++;
      seen.add(t);
    }
  }
  return inter / Math.max(ta.length, tb.length);
}

function trigrams(s: string): string[] {
  const padded = `  ${normalizeWhitespace(s).toLowerCase()}  `;
  const out: string[] = [];
  for (let i = 0; i < padded.length - 2; i++) out.push(padded.slice(i, i + 3));
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Glossary
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Enforce a glossary: any translation in `map[locale]` that *translates* a
 * glossary term (i.e. contains a different word where the term should appear)
 * emits a validation error.
 */
export function enforceGlossary(
  map: TranslationMap,
  glossary: GlossaryEntry[],
  locale: LocaleCode,
  sourceLocale: LocaleCode = 'pt-BR',
): ValidationError[] {
  const errs: ValidationError[] = [];
  const src = map[sourceLocale] ?? {};
  const tgt = map[locale] ?? {};
  for (const [key, target] of Object.entries(tgt)) {
    const sourceValue = src[key];
    if (!sourceValue) continue;
    for (const entry of glossary) {
      const expected = entry.overrides?.[locale] ?? entry.term;
      const sourceHas = containsWord(sourceValue, entry.term);
      if (!sourceHas) continue;
      const targetHas = containsWord(target, expected);
      if (!targetHas) {
        errs.push({
          severity: 'warning',
          code: 'GLOSSARY_VIOLATION',
          locale,
          key,
          message: `Glossary term "${entry.term}" should appear as "${expected}" (${entry.rationale ?? 'no rationale'}).`,
        });
      }
    }
  }
  return errs;
}

function containsWord(haystack: string, needle: string): boolean {
  const re = new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegex(needle)}([^\\p{L}\\p{N}]|$)`, 'iu');
  return re.test(haystack);
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Default glossary for the Akasha Portal — sacred / spiritual terms never translated. */
export const DEFAULT_GLOSSARY: GlossaryEntry[] = [
  { term: 'axé', rationale: 'Yoruba-derived sacred word; keep verbatim.' },
  { term: 'orixá', rationale: 'Spiritual entity name; keep verbatim.' },
  { term: 'Orixá', rationale: 'Capitalised form also preserved.' },
  { term: 'Mesa Real', rationale: 'Proprietary divination table name; keep verbatim.' },
  { term: 'Akasha', rationale: 'Project name; never translate.' },
  { term: 'Cigano', rationale: 'Cartomante tradition; keep verbatim.' },
];

// ─────────────────────────────────────────────────────────────────────────────
//  Nested keys & merging
// ─────────────────────────────────────────────────────────────────────────────

/** Convert a flat dotted-key map into a nested KeyTree. */
export function nestKeys(flat: Record<string, string>): KeyTreeNode {
  const root: KeyTreeNode = { children: {} };
  for (const [key, value] of Object.entries(flat)) {
    const segs = key.split('.');
    let node = root;
    for (let i = 0; i < segs.length; i++) {
      const seg = segs[i];
      node.children[seg] ||= { children: {} };
      node = node.children[seg];
    }
    node.value = value;
  }
  return root;
}

/** Flatten a nested KeyTree back into a dotted-key map. Intermediate nodes are skipped. */
export function flattenTree(node: KeyTreeNode, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  if (node.value !== undefined) out[prefix] = node.value;
  for (const [seg, child] of Object.entries(node.children)) {
    const next = prefix ? `${prefix}.${seg}` : seg;
    Object.assign(out, flattenTree(child, next));
  }
  return out;
}

/** Deep-merge two translation maps. `override` wins on key collisions. */
export function mergeTranslations(
  base: TranslationMap,
  override: TranslationMap,
): TranslationMap {
  const out: TranslationMap = {};
  const locales = new Set([...Object.keys(base), ...Object.keys(override)]);
  for (const locale of locales) {
    out[locale] = { ...(base[locale] ?? {}), ...(override[locale] ?? {}) };
  }
  return out;
}

/** Compute the diff between two translation maps for the given locale. */
export function diffTranslations(
  a: TranslationMap,
  b: TranslationMap,
  locale: LocaleCode,
): TranslationDiff[] {
  const av = a[locale] ?? {};
  const bv = b[locale] ?? {};
  const keys = new Set([...Object.keys(av), ...Object.keys(bv)]);
  const out: TranslationDiff[] = [];
  for (const key of keys) {
    const inA = key in av;
    const inB = key in bv;
    if (inA && !inB) out.push({ locale, key, kind: 'removed', before: av[key] });
    else if (!inA && inB) out.push({ locale, key, kind: 'added', after: bv[key] });
    else if (av[key] !== bv[key])
      out.push({ locale, key, kind: 'changed', before: av[key], after: bv[key] });
  }
  return out.sort((x, y) => x.key.localeCompare(y.key));
}

// ─────────────────────────────────────────────────────────────────────────────
//  Coverage report
// ─────────────────────────────────────────────────────────────────────────────

/** Per-locale coverage summary. */
export interface CoverageReport {
  locale: LocaleCode;
  total: number;
  translated: number;
  missing: number;
  /** Translated / total in [0, 1]. */
  ratio: number;
}

/** Build a coverage report across all locales in `map`, anchored to `source`. */
export function coverageReport(map: TranslationMap, source: LocaleCode): CoverageReport[] {
  const src = map[source] ?? {};
  const total = Object.keys(src).length;
  const out: CoverageReport[] = [];
  for (const locale of Object.keys(map)) {
    const tgt = map[locale] ?? {};
    let translated = 0;
    for (const key of Object.keys(src)) {
      if (tgt[key] && tgt[key].trim() !== '') translated++;
    }
    out.push({
      locale,
      total,
      translated,
      missing: total - translated,
      ratio: total === 0 ? 1 : translated / total,
    });
  }
  return out;
}