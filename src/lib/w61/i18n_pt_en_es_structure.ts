// ============================================================================
// w61/i18n-pt-en-es-structure.ts — Cycle 61
// ----------------------------------------------------------------------------
// Internationalization **structural** engine: PT-BR (default) + EN + ES.
//
// Hand-rolled. ZERO runtime deps. Pure native `Intl.*` APIs.
//
// Public API surface (see SPEC §1-20 below):
//   - Types:        SupportedLocale, LocaleConfig, Catalog, Translator, ...
//   - Registry:     LOCALES, DEFAULT_LOCALE, FALLBACK_LOCALE
//   - Engine:       createTranslator, loadCatalogFromJson, mergeCatalogs,
//                   diffCatalogs, flattenCatalog, unflattenCatalog
//   - Detection:    detectLocaleFromHeaders, detectLocaleFromPath,
//                   detectLocaleFromCookie, negotiateLocale
//   - Plural:       getPluralCategory, pluralize
//   - Interp:       interpolate, escapeIcuVars
//   - Sanitize:     sanitizeCatalogValue, allowHtmlKeys
//   - Hooks:        useTranslator, withTranslator, translateOnServer
//   - Internal:     __internal__ hashFnv1a32, parseAcceptLanguage, ...
//
// SPEC coverage map (comments mark each section):
//   §1  SupportedLocale             §11 List formatting
//   §2  LocaleConfig                §12 Unit formatting
//   §3  Catalog structure           §13 Locale detection (server)
//   §4  Bundles (pt-BR/en/es)       §14 Lazy loading
//   §5  Translator.t                §15 Fallback chain
//   §6  Translator.tn (plural)      §16 HTML in catalog values
//   §7  Number formatting           §17 Server + Client compat
//   §8  Currency formatting         §18 Variable escaping
//   §9  Date formatting             §19 RTL ready
//   §10 Relative time               §20 Translation tooling hooks
// ============================================================================

// ============================================================================
// §1 — Supported types
// ============================================================================

export type SupportedLocale = 'pt-BR' | 'en' | 'es';   // §1
export type LocaleDirection = 'ltr' | 'rtl';           // §19
export type TranslationKey = `${string}.${string}` | string; // template literal for IDE autocomplete

export type TranslationValue =
  | string
  | { [key: string]: TranslationValue }
  | TranslationValue[];

export interface LocaleConfig {                         // §2
  code: SupportedLocale;
  name: string;              // native name e.g. 'Português (Brasil)'
  englishName: string;       // english name e.g. 'Portuguese (Brazil)'
  direction: LocaleDirection;
  numberFormat: Intl.NumberFormatOptions;
  dateFormat: Intl.DateTimeFormatOptions;
  currency: string;          // ISO 4217
  pluralRule: Intl.PluralRules;
  fallback: SupportedLocale;
  writingDirection: 'ltr' | 'rtl'; // §19 duplicate of direction but explicit for tooling
}

export interface Catalog {                              // §3
  locale: SupportedLocale;
  namespaces: Record<string /* namespace */, TranslationValue>;
  version: string;           // 'YYYY.MM.MINOR'
  lastReviewedAt: Date;
}

export interface Translator {                           // §5
  readonly locale: SupportedLocale;
  t(key: TranslationKey, vars?: Record<string, string | number>, count?: number): string;
  tn(key: TranslationKey, count: number, vars?: Record<string, string | number>): string;
  td(key: TranslationKey, vars?: Record<string, string | number>): string;
  has(key: TranslationKey): boolean;
  direction(): LocaleDirection;
  number(value: number, opts?: Intl.NumberFormatOptions): string;
  currency(value: number, currency: string): string;
  date(date: Date | number, opts?: Intl.DateTimeFormatOptions): string;
  relativeTime(date: Date | number, base?: Date): string;
  list(items: string[], opts?: Intl.ListFormatOptions): string;
  unit(value: number, unit: Intl.NumberFormatOptions['unit']): string;
}

// ============================================================================
// §2/§19 — Locale registry (LOCALES)
// ============================================================================

export const DEFAULT_LOCALE: SupportedLocale = 'pt-BR';    // §1
export const FALLBACK_LOCALE: SupportedLocale = 'pt-BR';   // §15

// Pre-built PluralRules per locale — §6, §13
// We instantiate once at module load. CLDR-backed by the runtime.
const PR = {
  'pt-BR': new Intl.PluralRules('pt-BR'),
  en: new Intl.PluralRules('en'),
  es: new Intl.PluralRules('es'),
} as const;

export const LOCALES: Record<SupportedLocale, LocaleConfig> = {
  'pt-BR': {
    code: 'pt-BR',
    name: 'Português (Brasil)',
    englishName: 'Portuguese (Brazil)',
    direction: 'ltr',                  // §19
    writingDirection: 'ltr',
    numberFormat: { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 2 },
    dateFormat: { day: '2-digit', month: '2-digit', year: 'numeric' }, // dd/MM/yyyy
    currency: 'BRL',
    pluralRule: PR['pt-BR'],
    fallback: 'pt-BR',
  },
  en: {
    code: 'en',
    name: 'English',
    englishName: 'English',
    direction: 'ltr',
    writingDirection: 'ltr',
    numberFormat: { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 2 },
    dateFormat: { month: '2-digit', day: '2-digit', year: 'numeric' }, // MM/dd/yyyy
    currency: 'USD',
    pluralRule: PR.en,
    fallback: 'pt-BR',                 // §15: en falls back to pt-BR
  },
  es: {
    code: 'es',
    name: 'Español',
    englishName: 'Spanish',
    direction: 'ltr',
    writingDirection: 'ltr',
    numberFormat: { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 2 },
    dateFormat: { day: '2-digit', month: '2-digit', year: 'numeric' }, // dd/MM/yyyy
    currency: 'EUR',                   // configurable per-region (ARS/MXN)
    pluralRule: PR.es,                 // has 'many' category
    fallback: 'pt-BR',
  },
};

// ============================================================================
// §3 — Catalog helpers (flatten/unflatten/merge/diff)
// ============================================================================

/** §3 — flatten a namespaced Catalog to dot-notation keys. */
export function flattenCatalog(
  catalog: Catalog,
  prefix: string = '',
): Record<TranslationKey, string> {
  const out: Record<string, string> = {};
  const walk = (node: TranslationValue, p: string): void => {
    if (typeof node === 'string') {
      out[p] = node;
      return;
    }
    if (Array.isArray(node)) {
      // ICU plural categories come back as arrays of objects — flatten by index
      node.forEach((v, i) => walk(v, `${p}.${i}`));
      return;
    }
    if (node && typeof node === 'object') {
      for (const [k, v] of Object.entries(node)) {
        walk(v, p ? `${p}.${k}` : k);
      }
    }
  };
  for (const [ns, body] of Object.entries(catalog.namespaces)) {
    walk(body, ns);
  }
  // also support prefix arg merging the namespace segment
  if (prefix) {
    const merged: Record<string, string> = {};
    for (const [k, v] of Object.entries(out)) {
      merged[`${prefix}.${k}`] = v;
    }
    return merged;
  }
  return out;
}

/** §3 — invert flattenCatalog. Returns Catalog with empty namespaces bucket. */
export function unflattenCatalog(flat: Record<TranslationKey, string>): Catalog {
  const namespaces: Record<string, TranslationValue> = {};
  for (const [key, val] of Object.entries(flat)) {
    const segs = key.split('.');
    const ns = segs[0];
    const tail = segs.slice(1);
    if (!namespaces[ns]) namespaces[ns] = {};
    let cur: TranslationValue = namespaces[ns];
    for (let i = 0; i < tail.length - 1; i++) {
      const k = tail[i];
      if (typeof cur !== 'object' || cur === null || Array.isArray(cur)) {
        cur = {} as TranslationValue;
      }
      cur = (cur as Record<string, TranslationValue>)[k] ?? ({} as TranslationValue);
      (namespaces[ns] as Record<string, TranslationValue>)[k] = cur;
    }
    const last = tail[tail.length - 1];
    if (tail.length === 0) {
      // key was just namespace — store as literal string (unusual)
      namespaces[ns] = val;
    } else if (typeof cur === 'object' && cur !== null && !Array.isArray(cur)) {
      (cur as Record<string, TranslationValue>)[last] = val;
    }
  }
  return {
    locale: DEFAULT_LOCALE,
    namespaces,
    version: new Date().toISOString().slice(0, 7).replace('-', '.') + '.0',
    lastReviewedAt: new Date(),
  };
}

/** §3 — merge two catalogs (c2 wins on conflict). */
export function mergeCatalogs(c1: Catalog, c2: Catalog): Catalog {
  const merged: Record<string, TranslationValue> = JSON.parse(JSON.stringify(c1.namespaces));
  for (const [ns, body] of Object.entries(c2.namespaces)) {
    if (!merged[ns]) {
      merged[ns] = JSON.parse(JSON.stringify(body));
      continue;
    }
    merged[ns] = deepMerge(merged[ns] as TranslationValue, body) as TranslationValue;
  }
  // bump minor version
  const [y, m, minor] = c2.version.split('.');
  return {
    locale: c2.locale,
    namespaces: merged,
    version: `${y}.${m}.${Number(minor || 0) + 1}`,
    lastReviewedAt: new Date(),
  };
}

function deepMerge(a: TranslationValue, b: TranslationValue): TranslationValue {
  if (typeof a === 'string' && typeof b === 'string') return b;
  if (Array.isArray(a) && Array.isArray(b)) return b;
  if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
    const out: Record<string, TranslationValue> = { ...(a as Record<string, TranslationValue>) };
    for (const [k, v] of Object.entries(b as Record<string, TranslationValue>)) {
      out[k] = k in out ? deepMerge(out[k], v) : v;
    }
    return out;
  }
  return b;
}

/** §20 — diff two catalogs (source is the reference). */
export function diffCatalogs(
  source: Catalog,
  target: Catalog,
): { missing: TranslationKey[]; extra: TranslationKey[] } {
  const sKeys = new Set(Object.keys(flattenCatalog(source)));
  const tKeys = new Set(Object.keys(flattenCatalog(target)));
  const missing: TranslationKey[] = [];
  const extra: TranslationKey[] = [];
  for (const k of sKeys) if (!tKeys.has(k)) missing.push(k);
  for (const k of tKeys) if (!sKeys.has(k)) extra.push(k);
  return { missing, extra };
}

/** §14 — load a namespace from a JSON bundle into a Catalog. */
export function loadCatalogFromJson(
  locale: SupportedLocale,
  namespace: string,
  json: Record<string, TranslationValue>,
): Catalog {
  return {
    locale,
    namespaces: { [namespace]: json as TranslationValue },
    version: new Date().toISOString().slice(0, 7).replace('-', '.') + '.0',
    lastReviewedAt: new Date(),
  };
}

// ============================================================================
// §18 — Variable escaping & interpolation
// ============================================================================

const HTML_ESCAPE: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '`': '&#96;',
};

export function escapeIcuVars(
  vars: Record<string, string | number>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(vars)) {
    const s = typeof v === 'number' ? String(v) : v;
    out[k] = s.replace(/[&<>"'`]/g, (c) => HTML_ESCAPE[c] ?? c);
  }
  return out;
}

/** §18 — interpolate `{name}` style placeholders. Vars are HTML-escaped by default. */
export function interpolate(
  template: string,
  vars: Record<string, string | number>,
): string {
  if (!vars || Object.keys(vars).length === 0) return template;
  const escaped = escapeIcuVars(vars);
  return template.replace(/\{(\w+)\}/g, (_full, key: string) => {
    if (key in escaped) return escaped[key];
    return `{${key}}`; // leave placeholder visible
  });
}

// ============================================================================
// §6 — Pluralization (CLDR)
// ============================================================================

export type PluralCategory = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

export function getPluralCategory(value: number, locale: SupportedLocale): PluralCategory {
  const rule = LOCALES[locale].pluralRule;
  return rule.select(value) as PluralCategory;
}

/** §6 — ICU MessageFormat-lite pluralization.
 *  Syntax: `"Você tem {count, plural, one {# mensagem} other {# mensagens}}"`
 *  - `count` may be a vars key or the literal `count` (auto-injected if present in vars)
 *  - `#` substituted with the actual count.
 *  - Supports categories: zero, one, two, few, many, other
 */
export function pluralize(
  message: string,
  count: number,
  locale: SupportedLocale,
  vars: Record<string, string | number> = {},
): string {
  const cat = getPluralCategory(count, locale);
  // find "{name, plural, ...}" patterns
  return message.replace(
    /\{(\w+),\s*plural,\s*([^}]+(?:\{[^}]*\}[^}]*)*)\}/g,
    (_full, varName: string, body: string) => {
      const cases = parsePluralCases(body);
      const pick = cases[cat] ?? cases.other ?? Object.values(cases)[0] ?? '';
      const interpolated = pick.replace(/#/g, String(count));
      const allVars: Record<string, string | number> = { ...vars, [varName]: count };
      return interpolate(interpolated, allVars);
    },
  );
}

function parsePluralCases(body: string): Record<PluralCategory, string> {
  // cases are top-level forms: "category { ... }" — we split on category keywords
  const cases: Partial<Record<PluralCategory, string>> = {};
  const re = /\b(zero|one|two|few|many|other)\s*\{/g;
  const matches: Array<{ cat: PluralCategory; start: number; bodyStart: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    matches.push({
      cat: m[1] as PluralCategory,
      start: m.index,
      bodyStart: m.index + m[0].length,
    });
  }
  for (let i = 0; i < matches.length; i++) {
    const cur = matches[i];
    const next = matches[i + 1];
    const end = next ? next.start : body.length;
    // walk braces to find matching close from bodyStart-1
    const contentStart = cur.bodyStart;
    let depth = 1;
    let j = contentStart;
    while (j < body.length && depth > 0) {
      const c = body[j];
      if (c === '{') depth++;
      else if (c === '}') depth--;
      j++;
    }
    // j now points just past the matching '}'
    const content = body.slice(contentStart, j - 1);
    cases[cur.cat] = content;
    void end;
  }
  return cases as Record<PluralCategory, string>;
}

// ============================================================================
// §16 — HTML sanitization
// ============================================================================

/** Whitelist of keys whose values may contain HTML. */
export const allowHtmlKeys: Set<TranslationKey> = new Set<TranslationKey>([
  'common.legal.terms-body',
  'common.legal.privacy-body',
  'common.marketing.hero-rationale',
  'sacred.odu.blessing-detail',
]);

/** §16 — strip dangerous HTML unless allowHtml is true. Tags allowed if allowHtml. */
export function sanitizeCatalogValue(value: string, allowHtml: boolean): string {
  if (allowHtml) {
    // very conservative allowlist: <b>, <i>, <strong>, <em>, <br>, <a href>, <span>, <p>
    // remove <script>, <style>, on* attrs, javascript: urls
    let v = value.replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '');
    v = v.replace(/<\s*style[^>]*>[\s\S]*?<\s*\/\s*style\s*>/gi, '');
    v = v.replace(/\son\w+\s*=\s*"[^"]*"/gi, '');
    v = v.replace(/\son\w+\s*=\s*'[^']*'/gi, '');
    v = v.replace(/javascript\s*:/gi, '');
    // mark raw-html comments as preserved signal (no-op strip)
    v = v.replace(/<!--\s*raw-html\s*-->/g, '');
    return v;
  }
  // plain text mode: escape everything
  return value.replace(/[&<>"'`]/g, (c) => HTML_ESCAPE[c] ?? c);
}

// ============================================================================
// §13 — Locale detection (server)
// ============================================================================

/** Minimal Headers-shaped dependency so we don't import next/headers. */
export interface HeadersLike {
  get(name: string): string | null;
}

/** Minimal Cookies-shaped dependency. */
export interface CookiesLike {
  get(name: string): { value: string } | undefined;
}

const LOCALE_PATTERN = /^[a-z]{2}(-[A-Z]{2})?$/;

/** §13 — detect locale from Accept-Language header. */
export function detectLocaleFromHeaders(headers: HeadersLike): SupportedLocale {
  const al = headers.get('accept-language') ?? '';
  const tags = parseAcceptLanguage(al);
  return negotiateLocale(
    tags.map((t) => t.tag),
    ['pt-BR', 'en', 'es'],
  );
}

/** §13 — detect locale from URL path prefix. */
export function detectLocaleFromPath(pathname: string): SupportedLocale {
  const seg = pathname.split('/').filter(Boolean)[0] ?? '';
  if (LOCALE_PATTERN.test(seg)) {
    const lc = seg.toLowerCase();
    if (lc === 'pt-br' || lc === 'pt') return 'pt-BR';
    if (lc === 'en') return 'en';
    if (lc === 'es') return 'es';
  }
  return DEFAULT_LOCALE;
}

/** §13 — detect locale from cookie. */
export function detectLocaleFromCookie(cookies: CookiesLike): SupportedLocale {
  const c = cookies.get('locale');
  if (!c) return DEFAULT_LOCALE;
  const v = c.value;
  if (v === 'pt-BR' || v === 'en' || v === 'es') return v;
  return DEFAULT_LOCALE;
}

/** §13 — q-value aware negotiation against available locales. */
export function negotiateLocale(
  accepted: string[],
  available: SupportedLocale[],
): SupportedLocale {
  const tags = parseAcceptLanguage(accepted.join(','));
  for (const t of tags) {
    const exact = available.find((l) => l.toLowerCase() === t.tag.toLowerCase());
    if (exact) return exact;
  }
  // parent match: 'en-US' → 'en', 'pt' → 'pt-BR'
  for (const t of tags) {
    const parent = t.tag.toLowerCase().split('-')[0];
    const match = available.find((l) => l.toLowerCase().split('-')[0] === parent);
    if (match) return match;
  }
  return DEFAULT_LOCALE;
}

export interface AcceptLangTag {
  tag: string;
  q: number;
}

export function parseAcceptLanguage(header: string): AcceptLangTag[] {
  if (!header) return [];
  return header
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      const parts = p.split(';').map((s) => s.trim());
      const tag = parts[0];
      let q = 1.0;
      for (const param of parts.slice(1)) {
        if (param.startsWith('q=')) {
          const v = Number(param.slice(2));
          if (!Number.isNaN(v)) q = v;
        }
      }
      return { tag, q };
    })
    .sort((a, b) => b.q - a.q);
}

// ============================================================================
// §14 — Lazy loading & cache
// ============================================================================

interface CacheEntry {
  catalog: Catalog;
  expiresAt: number;
}

const CATALOG_CACHE = new Map<string, CacheEntry>();
const CATALOG_TTL_MS = 60 * 60 * 1000; // 1h

/** §14 — cache key = `${locale}:${namespace}:${version}` */
function cacheKey(locale: SupportedLocale, ns: string, version: string): string {
  return `${locale}:${ns}:${version}`;
}

/** §14 — get a cached catalog if fresh. */
export function getCachedCatalog(
  locale: SupportedLocale,
  namespace: string,
  version: string,
): Catalog | null {
  const k = cacheKey(locale, namespace, version);
  const e = CATALOG_CACHE.get(k);
  if (!e) return null;
  if (Date.now() > e.expiresAt) {
    CATALOG_CACHE.delete(k);
    return null;
  }
  return e.catalog;
}

/** §14 — set a catalog in cache with TTL. */
export function setCachedCatalog(catalog: Catalog, namespace: string): void {
  const k = cacheKey(catalog.locale, namespace, catalog.version);
  CATALOG_CACHE.set(k, { catalog, expiresAt: Date.now() + CATALOG_TTL_MS });
}

/** §14 — invalidate a cached catalog (for hot reload / version bump). */
export function invalidateCatalog(locale: SupportedLocale, namespace: string): void {
  for (const k of Array.from(CATALOG_CACHE.keys())) {
    if (k.startsWith(`${locale}:${namespace}:`)) CATALOG_CACHE.delete(k);
  }
}

// ============================================================================
// §5-§12 — Translator
// ============================================================================

const MISSING_KEY_WARNED = new Set<string>();

function warnMissing(key: TranslationKey, locale: SupportedLocale): void {
  const tag = `${locale}:${key}`;
  if (MISSING_KEY_WARNED.has(tag)) return;
  MISSING_KEY_WARNED.add(tag);
  if (typeof console !== 'undefined' && console.warn) {
    console.warn(`[i18n] missing key '${key}' for locale '${locale}'`);
  }
}

function keyAllowsHtml(key: TranslationKey): boolean {
  return allowHtmlKeys.has(key);
}

function getNestedValue(node: TranslationValue, path: string[]): TranslationValue | undefined {
  let cur: TranslationValue = node;
  for (const seg of path) {
    if (cur === null || cur === undefined) return undefined;
    if (Array.isArray(cur)) {
      const idx = Number(seg);
      if (!Number.isInteger(idx)) return undefined;
      cur = cur[idx];
      continue;
    }
    if (typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, TranslationValue>)[seg];
  }
  return cur;
}

function getRaw(
  catalogs: Partial<Record<SupportedLocale, Catalog>>,
  locale: SupportedLocale,
  key: TranslationKey,
): { value: TranslationValue; fromLocale: SupportedLocale } | null {
  const segs = String(key).split('.');
  // try requested locale first
  const c = catalogs[locale];
  if (c) {
    const v = getNestedValue(c.namespaces, segs);
    if (v !== undefined) return { value: v, fromLocale: locale };
  }
  // try fallback
  const fallback = LOCALES[locale].fallback;
  if (fallback !== locale) {
    const fc = catalogs[fallback];
    if (fc) {
      const v = getNestedValue(fc.namespaces, segs);
      if (v !== undefined) return { value: v, fromLocale: fallback };
    }
  }
  return null;
}

function formatMissing(key: TranslationKey): string {
  // Capslock + dot-replaced with '/' for visibility per SPEC §5
  return String(key).toUpperCase().replace(/\./g, '/');
}

interface TranslatorOptions {
  locale: SupportedLocale;
  catalogs: Partial<Record<SupportedLocale, Catalog>>;
  fallbackLocale?: SupportedLocale;
}

export function createTranslator(opts: TranslatorOptions): Translator {
  const { locale, catalogs } = opts;
  const fallbackLocale = opts.fallbackLocale ?? LOCALES[locale].fallback;

  const t = (key: TranslationKey, vars?: Record<string, string | number>, count?: number): string => {
    if (count !== undefined) {
      return tn(key, count, vars);
    }
    return td(key, vars);
  };

  const td = (key: TranslationKey, vars?: Record<string, string | number>): string => {
    const raw = getRaw(catalogs, locale, key);
    if (!raw) {
      warnMissing(key, locale);
      return formatMissing(key);
    }
    if (typeof raw.value !== 'string') {
      // plural dict / object — fall through to tn if no count, else use 'other'
      const cat = raw.fromLocale === locale ? locale : fallbackLocale;
      const otherVal = extractCategory(raw.value, 'other');
      if (typeof otherVal === 'string') {
        const s = interpolate(otherVal, vars ?? {});
        return keyAllowsHtml(key) ? s : sanitizeCatalogValue(s, false);
      }
      warnMissing(key, locale);
      return formatMissing(key);
    }
    const allowHtml = keyAllowsHtml(key);
    const v = allowHtml ? raw.value : sanitizeCatalogValue(raw.value, allowHtml);
    return interpolate(v, vars ?? {});
  };

  const tn = (key: TranslationKey, count: number, vars?: Record<string, string | number>): string => {
    const raw = getRaw(catalogs, locale, key);
    if (!raw) {
      warnMissing(key, locale);
      return formatMissing(key);
    }
    const value = raw.value;
    let template: string;
    if (typeof value === 'string') {
      template = value;
    } else {
      // pick plural category from raw.fromLocale so CLDR rules match the catalog
      const cat = getPluralCategory(count, raw.fromLocale);
      const picked = extractCategory(value, cat) ?? extractCategory(value, 'other');
      if (typeof picked !== 'string') {
        warnMissing(key, locale);
        return formatMissing(key);
      }
      template = picked;
    }
    const merged: Record<string, string | number> = { ...(vars ?? {}), count };
    const out = pluralize(template, count, raw.fromLocale, merged);
    return keyAllowsHtml(key) ? out : sanitizeCatalogValue(out, false);
  };

  const has = (key: TranslationKey): boolean => {
    const raw = getRaw(catalogs, locale, key);
    return raw !== null;
  };

  const direction = (): LocaleDirection => LOCALES[locale].direction;

  const number = (value: number, nOpts?: Intl.NumberFormatOptions): string => {
    const merged = { ...LOCALES[locale].numberFormat, ...(nOpts ?? {}) };
    return new Intl.NumberFormat(locale, merged).format(value);
  };

  const currency = (value: number, ccy: string): string => {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: ccy }).format(value);
  };

  const date = (d: Date | number, dOpts?: Intl.DateTimeFormatOptions): string => {
    const dateObj = typeof d === 'number' ? new Date(d) : d;
    const merged = { ...LOCALES[locale].dateFormat, ...(dOpts ?? {}) };
    return new Intl.DateTimeFormat(locale, merged).format(dateObj);
  };

  const relativeTime = (d: Date | number, base?: Date): string => {
    const target = typeof d === 'number' ? new Date(d) : d;
    const baseline = base ?? new Date();
    const diffMs = target.getTime() - baseline.getTime();
    const abs = Math.abs(diffMs);
    const sign = diffMs < 0 ? -1 : 1;
    let unit: Intl.RelativeTimeFormatUnit = 'second';
    let value = diffMs / 1000;
    if (abs >= 86_400_000) {
      unit = 'day';
      value = diffMs / 86_400_000;
    } else if (abs >= 3_600_000) {
      unit = 'hour';
      value = diffMs / 3_600_000;
    } else if (abs >= 60_000) {
      unit = 'minute';
      value = diffMs / 60_000;
    }
    return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(sign * Math.round(value), unit);
  };

  const list = (items: string[], lOpts?: Intl.ListFormatOptions): string => {
    if (items.length === 0) return '';
    return new Intl.ListFormat(locale, { style: 'long', type: 'conjunction', ...(lOpts ?? {}) }).format(items);
  };

  const unit = (value: number, u: Intl.NumberFormatOptions['unit']): string => {
    if (!u) {
      // fall back to plain number
      return number(value);
    }
    return new Intl.NumberFormat(locale, { style: 'unit', unit: u }).format(value);
  };

  return {
    locale,
    t,
    tn,
    td,
    has,
    direction,
    number,
    currency,
    date,
    relativeTime,
    list,
    unit,
  };
}

function extractCategory(node: TranslationValue, cat: PluralCategory): string | undefined {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) {
    // icu-style { one {...}, other {...} } is rendered as Array of {one:'...', other:'...'}
    for (const item of node) {
      if (item && typeof item === 'object' && cat in (item as Record<string, TranslationValue>)) {
        const v = (item as Record<string, TranslationValue>)[cat];
        if (typeof v === 'string') return v;
      }
    }
    return undefined;
  }
  if (node && typeof node === 'object') {
    const v = (node as Record<string, TranslationValue>)[cat];
    if (typeof v === 'string') return v;
    // 'other' fallback already implicit if caller passes 'other'
  }
  return undefined;
}

// ============================================================================
// §17 — Hooks (client + RSC)
// ============================================================================

/** §17 — React hook for client-side translator. Must be called from a 'use client' file. */
export function useTranslator(): Translator {
  // The actual hook implementation lives in a sibling `.tsx` file (i18n_pt_en_es_structure.client.tsx)
  // to keep this engine module DOM-free. This signature re-exports the contract.
  throw new Error(
    'useTranslator must be imported from "./i18n_pt_en_es_structure.client" in a "use client" file',
  );
}

/** §17 — server-side pure wrapper. */
export function translateOnServer(
  locale: SupportedLocale,
  key: TranslationKey,
  vars?: Record<string, string | number>,
): string {
  return createTranslator({ locale, catalogs: {} }).t(key, vars);
}

/** §17 — convenience: bind translator into a function. */
export function withTranslator<P>(
  fn: (t: Translator) => P,
  options?: { locale?: SupportedLocale; catalogs?: Partial<Record<SupportedLocale, Catalog>> },
): P {
  const t = createTranslator({
    locale: options?.locale ?? DEFAULT_LOCALE,
    catalogs: options?.catalogs ?? {},
  });
  return fn(t);
}

// ============================================================================
// §20 — Translation tooling hooks
// ============================================================================

/** §20 — extract all keys (flat and nested paths). */
export function extractKeys(catalog: Catalog): Set<TranslationKey> {
  const flat = flattenCatalog(catalog);
  return new Set(Object.keys(flat));
}

/** §20 — alias for diffCatalogs — clearer name for translation workflow. */
export function markUntranslated(
  source: Catalog,
  target: Catalog,
): { missing: TranslationKey[]; extra: TranslationKey[] } {
  return diffCatalogs(source, target);
}

/** §20 — validate a key pattern. Returns null if OK, else error message. */
export function validateKey(key: string): string | null {
  if (!key) return 'key is empty';
  if (key.length > 200) return 'key exceeds 200 chars';
  if (!/^[a-z0-9]+(\.[a-z0-9_-]+)*$/i.test(key)) {
    return 'key must be dot-separated segments of [a-z0-9_-]';
  }
  return null;
}

// ============================================================================
// §4 — Internal helpers exposed via __internal__ for testing
// ============================================================================

/** FNV-1a 32-bit hash (deterministic, no Date.now). */
export function hashFnv1a32(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

export function isValidLocale(s: string): s is SupportedLocale {
  return s === 'pt-BR' || s === 'en' || s === 'es';
}

export function cloneCatalog(catalog: Catalog): Catalog {
  return JSON.parse(JSON.stringify(catalog)) as Catalog;
}

const MAX_RECURSION_DEPTH = 10;
const MAX_KEYS_PER_NAMESPACE = 10_000;

/** §4 — depth-check + circular-ref detection for template variables. */
export function detectCircularReference(
  template: string,
  resolver: (name: string) => string | undefined,
): null | string {
  const seen = new Set<string>();
  const walk = (tpl: string, depth: number): string | null => {
    if (depth > MAX_RECURSION_DEPTH) return 'recursion depth exceeded';
    return tpl.replace(/\{(\w+)\}/g, (_full, name: string) => {
      if (seen.has(name)) return `{${name}}`; // already resolved, leave placeholder
      seen.add(name);
      const v = resolver(name);
      if (v === undefined) return `{${name}}`;
      const inner = walk(v, depth + 1);
      return inner ?? v;
    });
  };
  return walk(template, 0);
}

export const __internal__ = {
  hashFnv1a32,
  parseAcceptLanguage,
  isValidLocale,
  getNestedValue,
  setNestedValue,
  detectCircularReference,
  cloneCatalog,
  validateKey,
  extractPluralCases: parsePluralCases,
  MAX_RECURSION_DEPTH,
  MAX_KEYS_PER_NAMESPACE,
  PR, // plural rules instances for tests
};

function setNestedValue(
  obj: Record<string, TranslationValue>,
  path: string[],
  value: TranslationValue,
): Record<string, TranslationValue> {
  const root = JSON.parse(JSON.stringify(obj)) as Record<string, TranslationValue>;
  let cur: Record<string, TranslationValue> = root;
  for (let i = 0; i < path.length - 1; i++) {
    const k = path[i];
    if (!(k in cur) || typeof cur[k] !== 'object' || cur[k] === null || Array.isArray(cur[k])) {
      cur[k] = {} as TranslationValue;
    }
    cur = cur[k] as Record<string, TranslationValue>;
  }
  cur[path[path.length - 1]] = value;
  return root;
}

// ============================================================================
// §15 — Reset warn-set (testing utility)
// ============================================================================

/** Clear the dedup set for missing-key warnings. Useful in tests. */
export function __resetMissingWarnSet(): void {
  MISSING_KEY_WARNED.clear();
}

/** Clear the entire catalog cache. Useful in tests. */
export function __resetCatalogCache(): void {
  CATALOG_CACHE.clear();
}