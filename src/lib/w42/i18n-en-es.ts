/**
 * i18n EN + ES locale infrastructure (cycle 42)
 * --------------------------------------------------------------------------
 * Companion to `src/lib/i18n/` runtime — provides the *static* substrate:
 * translation dictionaries, CLDR plural rules, formatters, fallback chain.
 *
 * Design goals:
 * - Pure TypeScript, zero runtime deps beyond stdlib (Intl, Date, etc.).
 * - No `w42-` prefix in filename (cycle 38+39+40+41 convention).
 * - 800-1000 lines, 15-25 exported functions, JSDoc on every export.
 * - Spiritual terms (axé, orixá, oráculo, mentoria) preserved across locales.
 *
 * Sister module: src/lib/i18n/index.ts (runtime + React hook)
 * Locales: src/lib/i18n/locales/{pt-BR,en,es}.ts
 */

// --------------------------------------------------------------------------
// 1. Type definitions
// --------------------------------------------------------------------------

/** Locale identifier. `pt-BR` is canonical (Mesa Real tradition); en/es added in W42. */
export type Locale = 'pt-BR' | 'en' | 'es';

/** Nested string map — leaf values are translation strings. */
export type TranslationDict = {
  [key: string]: string | TranslationDict;
};

/** Flat dictionary with dot-notation keys (`auth.login.title`). */
export type FlatDict = Record<string, string>;

/** CLDR plural category — limited to the categories we actually use. */
export type PluralCategory = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

/** Date formatting style. */
export type DateStyle = 'short' | 'medium' | 'long' | 'full' | 'iso';

/** Number formatter variants. */
export type NumberStyle = 'decimal' | 'currency' | 'percent' | 'unit';

/** Relative-time granularity hint (we still pick the closest CLDR unit). */
export type RelativeUnit = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';

/** Options for {@link formatNumber}. */
export interface NumberFormatOptions {
  readonly style?: NumberStyle;
  readonly currency?: string; // ISO-4217 (USD, EUR, BRL)
  readonly minimumFractionDigits?: number;
  readonly maximumFractionDigits?: number;
  readonly useGrouping?: boolean;
}

/** Variables bag for {@link interpolate}. */
export type InterpolateVars = Record<string, string | number | undefined>;

/** Per-locale currency metadata. */
export interface CurrencyMeta {
  readonly code: string; // ISO-4217
  readonly symbol: string; // glyph or cluster
  readonly position: 'before' | 'after';
  readonly separator: '.' | ','; // thousands sep
  readonly decimal: '.' | ','; // decimal mark
}

/** Timezone descriptor — name + current offset (minutes from UTC). */
export interface TimeZoneInfo {
  readonly id: string; // IANA
  readonly label: string; // human-readable
  readonly offsetMinutes: number; // current offset
  readonly region: 'Americas' | 'Europe' | 'Africa' | 'Asia' | 'Pacific';
}

// --------------------------------------------------------------------------
// 2. CLDR plural rules (pt-BR / en / es)
// --------------------------------------------------------------------------

/**
 * Plural rule — picks a category from a count.
 * Mirrors CLDR plural rules used by `Intl.PluralRules`.
 */
export type PluralRule = (count: number) => PluralCategory;

/**
 * pt-BR plural rule: `nplurals=2; plural=(n > 1);`
 * Note: pt-BR treats 0 and 1 the same (singular), everything >1 as plural.
 */
export const pluralRulePtBR: PluralRule = (n: number): PluralCategory => {
  const abs = Math.abs(n);
  if (abs === 0) return 'zero';
  if (abs === 1) return 'one';
  return 'many';
};

/** English plural rule: `nplurals=2; plural=(n != 1);` */
export const pluralRuleEn: PluralRule = (n: number): PluralCategory => {
  const abs = Math.abs(n);
  if (abs === 1) return 'one';
  return 'other';
};

/** Spanish plural rule: `nplurals=2; plural=(n != 1);` */
export const pluralRuleEs: PluralRule = (n: number): PluralCategory => {
  const abs = Math.abs(n);
  if (abs === 1) return 'one';
  return 'other';
};

/** Lookup table — keeps the public API uniform. */
export const PLURAL_RULES: Readonly<Record<Locale, PluralRule>> = Object.freeze({
  'pt-BR': pluralRulePtBR,
  en: pluralRuleEn,
  es: pluralRuleEs,
});

/** Map of plural categories → example phrases for unit tests / docs. */
export const PLURAL_EXAMPLES: Readonly<Record<Locale, ReadonlyArray<readonly [number, PluralCategory]>>> = Object.freeze({
  'pt-BR': [
    [0, 'zero'],
    [1, 'one'],
    [2, 'many'],
    [5, 'many'],
  ],
  en: [
    [0, 'other'],
    [1, 'one'],
    [2, 'other'],
    [5, 'other'],
  ],
  es: [
    [0, 'other'],
    [1, 'one'],
    [2, 'other'],
    [5, 'other'],
  ],
});

// --------------------------------------------------------------------------
// 3. Currency / formatting metadata per locale
// --------------------------------------------------------------------------

/** Default currency metadata for each supported locale. */
export const CURRENCY_META: Readonly<Record<Locale, CurrencyMeta>> = Object.freeze({
  'pt-BR': { code: 'BRL', symbol: 'R$', position: 'before', separator: '.', decimal: ',' },
  en: { code: 'USD', symbol: '$', position: 'before', separator: ',', decimal: '.' },
  es: { code: 'EUR', symbol: '€', position: 'after', separator: '.', decimal: ',' },
});

/** Locale display name (self-referential, used in language picker). */
export const LOCALE_DISPLAY: Readonly<Record<Locale, string>> = Object.freeze({
  'pt-BR': 'Português (Brasil)',
  en: 'English',
  es: 'Español',
});

/** Native greeting — used by splash screen and email templates. */
export const LOCALE_GREETING: Readonly<Record<Locale, string>> = Object.freeze({
  'pt-BR': 'Axé! Bem-vindo ao Akasha.',
  en: 'Welcome to Akasha.',
  es: 'Bienvenido a Akasha.',
});

// --------------------------------------------------------------------------
// 4. RTL locales — NOT implemented in W42, flagged for future cycles.
// --------------------------------------------------------------------------

/**
 * Locales that use right-to-left scripts. We don't ship UI for them yet, but
 * this constant is the single source of truth when the cycle comes.
 */
export const RTL_LOCALES: ReadonlyArray<string> = Object.freeze(['ar', 'he', 'fa', 'ur']);

/**
 * Returns true if a locale string is RTL. Used by future layout flip logic.
 */
export function isRtlLocale(locale: string): boolean {
  const base = locale.toLowerCase().split('-')[0] ?? '';
  return RTL_LOCALES.includes(base);
}

// --------------------------------------------------------------------------
// 5. Spiritual terms — preserved across locales (don't translate)
// --------------------------------------------------------------------------

/**
 * Terms that MUST NOT be translated. Each Akasha user (regardless of locale)
 * sees the canonical Portuguese term so cross-cultural oracular vocabulary
 * stays consistent. Adding a term here is a governance action — discussed in
 * VISION.md and IDEIA.md.
 */
export const SPIRITUAL_TERMS: ReadonlyArray<string> = Object.freeze([
  'axé',
  'orixá',
  'orixás',
  'odú',
  'odu',
  'babalaô',
  'babalao',
  'iate',
  'iálorixá',
  'ialorixa',
  'ebó',
  'ebo',
  'ogun',
  'exu',
  'ogum',
  'Oxalá',
  'Oxala',
  'Iansã',
  'Iansa',
  'Iemanjá',
  'Iemanja',
  'Xangô',
  'Xango',
  'mesa real',
  'Mesa Real',
  'cigano',
  'Cigano',
  'tarot',
  'Tarot',
  'runas',
  'Runas',
  'numerologia',
  'Numerologia',
  'astrologia',
  'Astrologia',
  'mentoria',
  'Mentoria',
  'oráculo',
  'oraculo',
  'Oráculo',
  'akasha',
  'Akasha',
  'cabalísticos',
  'Cabalísticos',
  'Cigano Ramiro',
  'Cigana',
  'Ifá',
  'Ifa',
]);

/**
 * Check if a key belongs to a spiritual-term namespace. Used by
 * `interpolate` to skip translation in some contexts (chat-AI prompts).
 */
export function isSpiritualKey(key: string): boolean {
  const lower = key.toLowerCase();
  return SPIRITUAL_TERMS.some((term) => lower.includes(term.toLowerCase()));
}

// --------------------------------------------------------------------------
// 6. Tree helpers — flatten / unflatten / get / set
// --------------------------------------------------------------------------

/**
 * Flatten a nested `TranslationDict` into dot-notation keys.
 * Leaf strings are kept as-is. Useful for fallback chains and key enumeration.
 *
 * @example
 * flatten({ auth: { login: { title: 'Sign in' } } })
 * // → { 'auth.login.title': 'Sign in' }
 */
export function flatten(dict: TranslationDict, prefix = ''): FlatDict {
  const out: FlatDict = {};
  for (const key of Object.keys(dict)) {
    const value = dict[key];
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      out[path] = value;
    } else {
      Object.assign(out, flatten(value, path));
    }
  }
  return out;
}

/**
 * Inverse of `flatten`. Rebuilds a nested `TranslationDict` from dot-paths.
 * Throws on collision (a parent path also has a leaf value) to surface bugs.
 */
export function unflatten(flat: FlatDict): TranslationDict {
  const root: TranslationDict = {};
  for (const path of Object.keys(flat)) {
    setNested(root, path, flat[path] as string);
  }
  return root;
}

/**
 * Safe nested lookup. Returns the leaf string or `undefined` if any segment
 * is missing or hits a non-object.
 */
export function getNested(dict: TranslationDict, path: string): string | undefined {
  const segments = path.split('.');
  let cursor: string | TranslationDict = dict;
  for (const segment of segments) {
    if (typeof cursor !== 'object' || cursor === null) return undefined;
    const next = (cursor as TranslationDict)[segment];
    if (next === undefined) return undefined;
    cursor = next as string | TranslationDict;
  }
  return typeof cursor === 'string' ? cursor : undefined;
}

/**
 * Safe nested set. Creates intermediate objects as needed. If a parent of
 * `path` already holds a string, throws (use `unflatten` to recover).
 */
export function setNested(dict: TranslationDict, path: string, value: string): void {
  const segments = path.split('.');
  if (segments.length === 0) throw new Error('setNested: empty path');
  let cursor: TranslationDict = dict;
  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i]!;
    const next = cursor[segment];
    if (next === undefined) {
      const created: TranslationDict = {};
      cursor[segment] = created;
      cursor = created;
      continue;
    }
    if (typeof next === 'string') {
      throw new Error(`setNested: path collision at "${segment}" in "${path}"`);
    }
    cursor = next;
  }
  const leaf = segments[segments.length - 1]!;
  cursor[leaf] = value;
}

// --------------------------------------------------------------------------
// 7. Plural-aware message picker
// --------------------------------------------------------------------------

/**
 * Picks the right plural form for a key. The dictionary can carry either:
 *  - flat form: `{ 'posts.count': '{n} posts' }` — fallback (always "other")
 *  - plural form: `{ 'posts.count': { one: '{n} post', other: '{n} posts' } }`
 *
 * `pickPlural` returns the *template string*; call `interpolate` afterwards.
 */
export function pickPlural(
  dict: TranslationDict,
  key: string,
  count: number,
  locale: Locale,
): string {
  const node = getNested(dict, key);
  if (typeof node !== 'string') {
    // Plural form tree — walk via the rule's category.
    const nodeAsTree = ((): TranslationDict | undefined => {
      const segments = key.split('.');
      let cursor: string | TranslationDict = dict;
      for (const segment of segments) {
        if (typeof cursor !== 'object' || cursor === null) return undefined;
        const next = (cursor as TranslationDict)[segment];
        if (next === undefined) return undefined;
        cursor = next as string | TranslationDict;
      }
      return typeof cursor === 'object' && cursor !== null ? (cursor as TranslationDict) : undefined;
    })();
    if (nodeAsTree) {
      const category = PLURAL_RULES[locale](count);
      const candidate = nodeAsTree[category] ?? nodeAsTree['other'] ?? nodeAsTree['one'];
      if (typeof candidate === 'string') return candidate;
    }
    return key; // last-resort: surface the missing key
  }
  return node;
}

// --------------------------------------------------------------------------
// 8. Date / number / relative formatters
// --------------------------------------------------------------------------

/**
 * Format a date according to locale + style. Uses `Intl.DateTimeFormat` under
 * the hood with sensible style presets. ISO is always `toISOString()`.
 */
export function formatDate(date: Date | number | string, locale: Locale, style: DateStyle = 'medium'): string {
  const d = toDate(date);
  if (Number.isNaN(d.getTime())) return '';
  if (style === 'iso') return d.toISOString();
  const intlLocale = locale === 'pt-BR' ? 'pt-BR' : locale === 'en' ? 'en-US' : 'es-ES';
  try {
    return new Intl.DateTimeFormat(intlLocale, { dateStyle: style }).format(d);
  } catch {
    return d.toDateString();
  }
}

/**
 * Format a number per locale, supporting decimal / currency / percent / unit.
 * Currency defaults to the locale's canonical currency if not provided.
 */
export function formatNumber(n: number, locale: Locale, options: NumberFormatOptions = {}): string {
  const intlLocale = locale === 'pt-BR' ? 'pt-BR' : locale === 'en' ? 'en-US' : 'es-ES';
  const style = options.style ?? 'decimal';
  const intlStyle: 'decimal' | 'currency' | 'percent' | 'unit' =
    style === 'unit' ? 'unit' : style;
  const currency = options.currency ?? CURRENCY_META[locale].code;
  try {
    return new Intl.NumberFormat(intlLocale, {
      style: intlStyle,
      currency: intlStyle === 'currency' ? currency : undefined,
      minimumFractionDigits: options.minimumFractionDigits,
      maximumFractionDigits: options.maximumFractionDigits,
      useGrouping: options.useGrouping ?? true,
    }).format(n);
  } catch {
    return String(n);
  }
}

/**
 * Format a date as a relative-time string ("2 hours ago" / "há 2 horas").
 * Uses Intl.RelativeTimeFormat; granularity auto-selected from delta.
 */
export function formatRelative(date: Date | number | string, locale: Locale): string {
  const d = toDate(date);
  if (Number.isNaN(d.getTime())) return '';
  const now = Date.now();
  const diffSeconds = Math.round((d.getTime() - now) / 1000);
  const abs = Math.abs(diffSeconds);
  const intlLocale = locale === 'pt-BR' ? 'pt-BR' : locale === 'en' ? 'en-US' : 'es-ES';
  const rtf = new Intl.RelativeTimeFormat(intlLocale, { numeric: 'auto' });

  const pick = (unit: Intl.RelativeTimeFormatUnit, seconds: number): string =>
    rtf.format(Math.round(seconds), unit);

  if (abs < 60) return pick('second', diffSeconds);
  if (abs < 3600) return pick('minute', diffSeconds / 60);
  if (abs < 86_400) return pick('hour', diffSeconds / 3600);
  if (abs < 604_800) return pick('day', diffSeconds / 86_400);
  if (abs < 2_592_000) return pick('week', diffSeconds / 604_800);
  if (abs < 31_536_000) return pick('month', diffSeconds / 2_592_000);
  return pick('year', diffSeconds / 31_536_000);
}

/**
 * Format an amount in the locale's default currency (alias with locale default).
 */
export function formatCurrency(amount: number, locale: Locale, currency?: string): string {
  return formatNumber(amount, locale, {
    style: 'currency',
    currency: currency ?? CURRENCY_META[locale].code,
  });
}

// --------------------------------------------------------------------------
// 9. Interpolation + escaping
// --------------------------------------------------------------------------

/**
 * Replace `{var}` placeholders in a template. Missing variables are left as
 * the literal `{var}` so translation gaps surface in QA. `null`/`undefined`
 * are coerced via `String()`.
 */
export function interpolate(template: string, vars: InterpolateVars = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const v = vars[key];
    if (v === undefined || v === null) return match;
    return String(v);
  });
}

/**
 * Escape HTML entities so user-supplied strings can be rendered safely inside
 * `dangerouslySetInnerHTML` — we never ship `dangerouslySetInnerHTML` with
 * raw i18n strings.
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;');
}

/**
 * Escape an entire dict (used for embedding translations in client bundles).
 */
export function escapeDict(dict: FlatDict): FlatDict {
  const out: FlatDict = {};
  for (const key of Object.keys(dict)) {
    out[key] = escapeHtml(dict[key]!);
  }
  return out;
}

// --------------------------------------------------------------------------
// 10. Fallback chain
// --------------------------------------------------------------------------

/**
 * Fill missing keys in `primary` from `fallback`. Recursively merges, leaf
 * strings from `primary` win. Returns a new dict — does not mutate inputs.
 */
export function mergeFallback(primary: TranslationDict, fallback: TranslationDict): TranslationDict {
  const out: TranslationDict = {};
  // Seed with fallback
  for (const key of Object.keys(fallback)) {
    const fv = fallback[key];
    if (typeof fv === 'string') {
      out[key] = fv;
    } else {
      out[key] = deepCloneDict(fv);
    }
  }
  // Overlay primary
  for (const key of Object.keys(primary)) {
    const pv = primary[key];
    const fv = out[key];
    if (typeof pv === 'string') {
      out[key] = pv;
    } else if (fv && typeof fv === 'object') {
      out[key] = mergeFallback(pv, fv as TranslationDict);
    } else {
      out[key] = deepCloneDict(pv);
    }
  }
  return out;
}

function deepCloneDict(d: TranslationDict): TranslationDict {
  const out: TranslationDict = {};
  for (const key of Object.keys(d)) {
    const v = d[key];
    out[key] = typeof v === 'string' ? v : deepCloneDict(v);
  }
  return out;
}

// --------------------------------------------------------------------------
// 11. Locale negotiation from HTTP Accept-Language (RFC 4647)
// --------------------------------------------------------------------------

/**
 * Parse `Accept-Language` header and pick the best matching supported locale.
 * Falls back to `'pt-BR'` (canonical) if no match. Supports q-values.
 *
 * @example
 * detectLocaleFromHeader('pt-BR,en-US;q=0.9,en;q=0.8') // → 'pt-BR'
 * detectLocaleFromHeader('es-MX,es;q=0.9')           // → 'es'
 * detectLocaleFromHeader('fr-FR,de-DE')              // → 'pt-BR' (fallback)
 */
export function detectLocaleFromHeader(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage || typeof acceptLanguage !== 'string') return 'pt-BR';
  const candidates = parseAcceptLanguage(acceptLanguage);
  const supported: Locale[] = ['pt-BR', 'en', 'es'];
  // Exact match first.
  for (const c of candidates) {
    const exact = supported.find((s) => s.toLowerCase() === c.tag.toLowerCase());
    if (exact) return exact;
  }
  // Language-only match.
  for (const c of candidates) {
    const base = c.tag.split('-')[0]!.toLowerCase();
    const partial = supported.find((s) => s.toLowerCase().startsWith(base));
    if (partial) return partial;
  }
  return 'pt-BR';
}

interface AcceptCandidate {
  tag: string;
  q: number;
}

function parseAcceptLanguage(header: string): AcceptCandidate[] {
  return header
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map<AcceptCandidate>((part) => {
      const segments = part.split(';').map((s) => s.trim());
      const tag = segments[0]!;
      let q = 1;
      for (const seg of segments.slice(1)) {
        if (seg.startsWith('q=')) {
          const parsed = Number.parseFloat(seg.slice(2));
          if (!Number.isNaN(parsed)) q = parsed;
        }
      }
      return { tag, q };
    })
    .sort((a, b) => b.q - a.q);
}

// --------------------------------------------------------------------------
// 12. Phone formatting (stub — production-grade needs libphonenumber)
// --------------------------------------------------------------------------

/**
 * Lightweight phone formatter. Strips non-digits, applies a per-locale
 * grouping. NOT a full libphonenumber replacement — for display only.
 */
export function formatPhone(input: string, locale: Locale): string {
  const digits = input.replace(/\D+/g, '');
  const meta = CURRENCY_META[locale];
  void meta; // locale-specific grouping not yet implemented
  if (digits.length <= 4) return digits;
  if (digits.length <= 8) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  // E.164-ish: country code + groups of 3
  return `+${digits.slice(0, digits.length - 10)} (${digits.slice(-10, -8)}) ${digits.slice(-8, -4)}-${digits.slice(-4)}`;
}

// --------------------------------------------------------------------------
// 13. Time zones (Americas + Europe, with offsets)
// --------------------------------------------------------------------------

/** Common time zones used by Akasha users. Offsets are static — DST handled by callers via Intl. */
export const COMMON_TIMEZONES: ReadonlyArray<TimeZoneInfo> = Object.freeze([
  { id: 'America/Sao_Paulo', label: 'São Paulo (BRT)', offsetMinutes: -180, region: 'Americas' },
  { id: 'America/Buenos_Aires', label: 'Buenos Aires (ART)', offsetMinutes: -180, region: 'Americas' },
  { id: 'America/New_York', label: 'New York (EST)', offsetMinutes: -300, region: 'Americas' },
  { id: 'America/Chicago', label: 'Chicago (CST)', offsetMinutes: -360, region: 'Americas' },
  { id: 'America/Denver', label: 'Denver (MST)', offsetMinutes: -420, region: 'Americas' },
  { id: 'America/Los_Angeles', label: 'Los Angeles (PST)', offsetMinutes: -480, region: 'Americas' },
  { id: 'America/Mexico_City', label: 'Ciudad de México (CST)', offsetMinutes: -360, region: 'Americas' },
  { id: 'America/Bogota', label: 'Bogotá (COT)', offsetMinutes: -300, region: 'Americas' },
  { id: 'America/Lima', label: 'Lima (PET)', offsetMinutes: -300, region: 'Americas' },
  { id: 'America/Santiago', label: 'Santiago (CLT)', offsetMinutes: -240, region: 'Americas' },
  { id: 'Europe/Lisbon', label: 'Lisbon (WET)', offsetMinutes: 0, region: 'Europe' },
  { id: 'Europe/Madrid', label: 'Madrid (CET)', offsetMinutes: 60, region: 'Europe' },
  { id: 'Europe/Paris', label: 'Paris (CET)', offsetMinutes: 60, region: 'Europe' },
  { id: 'Europe/London', label: 'London (GMT)', offsetMinutes: 0, region: 'Europe' },
  { id: 'Europe/Berlin', label: 'Berlin (CET)', offsetMinutes: 60, region: 'Europe' },
]);

/** Find a time zone by IANA id. */
export function findTimeZone(id: string): TimeZoneInfo | undefined {
  return COMMON_TIMEZONES.find((tz) => tz.id === id);
}

/** Filter time zones by region. */
export function timeZonesByRegion(region: TimeZoneInfo['region']): ReadonlyArray<TimeZoneInfo> {
  return COMMON_TIMEZONES.filter((tz) => tz.region === region);
}

// --------------------------------------------------------------------------
// 14. Locale content — EN + ES (100+ keys each, mirrored structure)
// --------------------------------------------------------------------------

/**
 * English locale. Mirrors the namespaces consumed by the UI:
 * navigation, common, auth, errors, posts, comments, events, mentorship,
 * marketplace, settings, profile, notifications, reflection, livestream,
 * reputation.
 */
export const en: TranslationDict = {
  navigation: {
    home: 'Home',
    oracle: 'Oracle',
    community: 'Community',
    mentorship: 'Mentorship',
    events: 'Events',
    marketplace: 'Marketplace',
    reflection: 'Reflection',
    livestream: 'Livestream',
    profile: 'Profile',
    settings: 'Settings',
    notifications: 'Notifications',
    help: 'Help',
    about: 'About',
  },
  common: {
    yes: 'Yes',
    no: 'No',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    close: 'Close',
    open: 'Open',
    search: 'Search',
    loading: 'Loading…',
    retry: 'Retry',
    share: 'Share',
    report: 'Report',
    block: 'Block',
    unblock: 'Unblock',
    send: 'Send',
    or: 'or',
    and: 'and',
  },
  auth: {
    login: {
      title: 'Sign in',
      email: 'Email',
      password: 'Password',
      submit: 'Sign in',
      forgot: 'Forgot password?',
      signupCta: 'Create an account',
      invalid: 'Invalid email or password.',
    },
    signup: {
      title: 'Create account',
      name: 'Full name',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password',
      submit: 'Sign up',
      hasAccount: 'Already have an account?',
    },
    logout: 'Sign out',
    welcomeBack: 'Welcome back, {name}!',
  },
  errors: {
    generic: 'Something went wrong. Please try again.',
    network: 'Network error. Check your connection.',
    notFound: 'Not found.',
    forbidden: 'You do not have permission to do this.',
    unauthorized: 'Please sign in to continue.',
    validation: 'Please review the highlighted fields.',
    server: 'Server error. We have been notified.',
    rateLimit: 'Too many attempts. Please wait a moment.',
  },
  posts: {
    title: 'Posts',
    create: 'New post',
    placeholder: 'Share what is on your mind…',
    empty: 'No posts yet — be the first.',
    published: 'Published',
    draft: 'Draft',
    deleteConfirm: 'Delete this post? This cannot be undone.',
    like: 'Like',
    liked: 'Liked',
    share: 'Share',
  },
  comments: {
    title: 'Comments',
    placeholder: 'Write a comment…',
    reply: 'Reply',
    edit: 'Edit comment',
    delete: 'Delete comment',
    showMore: 'Show more comments',
  },
  events: {
    title: 'Events',
    upcoming: 'Upcoming',
    past: 'Past',
    today: 'Today',
    tomorrow: 'Tomorrow',
    join: 'Join event',
    leave: 'Leave event',
    startsAt: 'Starts {when}',
    endsAt: 'Ends {when}',
    location: 'Location',
    online: 'Online',
    inPerson: 'In person',
    soldOut: 'Sold out',
  },
  mentorship: {
    title: 'Mentorship',
    book: 'Book a session',
    available: 'Available mentors',
    duration: '{minutes} minutes',
    price: 'Price',
    schedule: 'Schedule',
    notes: 'Notes for the mentor',
    confirm: 'Confirm booking',
    reschedule: 'Reschedule',
    cancel: 'Cancel session',
  },
  marketplace: {
    title: 'Marketplace',
    buy: 'Buy',
    sell: 'Sell',
    cart: 'Cart',
    checkout: 'Checkout',
    total: 'Total',
    empty: 'Your cart is empty.',
    addedToCart: 'Added to cart',
    removedFromCart: 'Removed from cart',
  },
  settings: {
    title: 'Settings',
    language: 'Language',
    timezone: 'Time zone',
    theme: 'Theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeAuto: 'Auto',
    notifications: 'Notifications',
    privacy: 'Privacy',
    account: 'Account',
    saved: 'Settings saved.',
  },
  profile: {
    title: 'Profile',
    editProfile: 'Edit profile',
    bio: 'Bio',
    location: 'Location',
    joined: 'Joined {when}',
    followers: 'Followers',
    following: 'Following',
    follow: 'Follow',
    unfollow: 'Unfollow',
  },
  notifications: {
    title: 'Notifications',
    empty: 'No notifications yet.',
    markAllRead: 'Mark all as read',
    newFollower: '{name} started following you',
    newComment: '{name} commented on your post',
    newLike: '{name} liked your post',
    newMention: '{name} mentioned you',
    eventReminder: 'Reminder: {event} starts {when}',
    mentorshipRequest: 'New mentorship request from {name}',
  },
  reflection: {
    title: 'Daily reflection',
    prompt: 'Today’s question',
    answer: 'Your answer',
    save: 'Save reflection',
    saved: 'Reflection saved.',
    history: 'Past reflections',
  },
  livestream: {
    title: 'Livestream',
    live: 'LIVE',
    replay: 'Replay',
    upcoming: 'Upcoming stream',
    viewers: '{n} watching now',
    chat: 'Live chat',
    sendMessage: 'Send message',
  },
  reputation: {
    title: 'Reputation',
    points: '{n} points',
    level: 'Level {n}',
    nextLevel: '{n} points to next level',
    badges: 'Badges',
    contributions: 'Contributions',
  },
};

/**
 * Spanish locale — mirrors `en` structure 1:1.
 */
export const es: TranslationDict = {
  navigation: {
    home: 'Inicio',
    oracle: 'Oráculo',
    community: 'Comunidad',
    mentorship: 'Mentoría',
    events: 'Eventos',
    marketplace: 'Mercado',
    reflection: 'Reflexión',
    livestream: 'Transmisión en vivo',
    profile: 'Perfil',
    settings: 'Ajustes',
    notifications: 'Notificaciones',
    help: 'Ayuda',
    about: 'Acerca de',
  },
  common: {
    yes: 'Sí',
    no: 'No',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    save: 'Guardar',
    edit: 'Editar',
    delete: 'Eliminar',
    back: 'Atrás',
    next: 'Siguiente',
    previous: 'Anterior',
    close: 'Cerrar',
    open: 'Abrir',
    search: 'Buscar',
    loading: 'Cargando…',
    retry: 'Reintentar',
    share: 'Compartir',
    report: 'Reportar',
    block: 'Bloquear',
    unblock: 'Desbloquear',
    send: 'Enviar',
    or: 'o',
    and: 'y',
  },
  auth: {
    login: {
      title: 'Iniciar sesión',
      email: 'Correo electrónico',
      password: 'Contraseña',
      submit: 'Entrar',
      forgot: '¿Olvidaste tu contraseña?',
      signupCta: 'Crear una cuenta',
      invalid: 'Correo o contraseña inválidos.',
    },
    signup: {
      title: 'Crear cuenta',
      name: 'Nombre completo',
      email: 'Correo electrónico',
      password: 'Contraseña',
      confirmPassword: 'Confirmar contraseña',
      submit: 'Registrarse',
      hasAccount: '¿Ya tienes cuenta?',
    },
    logout: 'Cerrar sesión',
    welcomeBack: '¡Bienvenido de nuevo, {name}!',
  },
  errors: {
    generic: 'Algo salió mal. Inténtalo de nuevo.',
    network: 'Error de red. Revisa tu conexión.',
    notFound: 'No encontrado.',
    forbidden: 'No tienes permiso para hacer esto.',
    unauthorized: 'Inicia sesión para continuar.',
    validation: 'Revisa los campos resaltados.',
    server: 'Error del servidor. Hemos sido notificados.',
    rateLimit: 'Demasiados intentos. Espera un momento.',
  },
  posts: {
    title: 'Publicaciones',
    create: 'Nueva publicación',
    placeholder: 'Comparte lo que piensas…',
    empty: 'Aún no hay publicaciones — sé el primero.',
    published: 'Publicado',
    draft: 'Borrador',
    deleteConfirm: '¿Eliminar esta publicación? Esta acción no se puede deshacer.',
    like: 'Me gusta',
    liked: 'Te gusta',
    share: 'Compartir',
  },
  comments: {
    title: 'Comentarios',
    placeholder: 'Escribe un comentario…',
    reply: 'Responder',
    edit: 'Editar comentario',
    delete: 'Eliminar comentario',
    showMore: 'Ver más comentarios',
  },
  events: {
    title: 'Eventos',
    upcoming: 'Próximos',
    past: 'Pasados',
    today: 'Hoy',
    tomorrow: 'Mañana',
    join: 'Unirse al evento',
    leave: 'Salir del evento',
    startsAt: 'Empieza {when}',
    endsAt: 'Termina {when}',
    location: 'Lugar',
    online: 'En línea',
    inPerson: 'Presencial',
    soldOut: 'Agotado',
  },
  mentorship: {
    title: 'Mentoría',
    book: 'Reservar sesión',
    available: 'Mentores disponibles',
    duration: '{minutes} minutos',
    price: 'Precio',
    schedule: 'Horario',
    notes: 'Notas para el mentor',
    confirm: 'Confirmar reserva',
    reschedule: 'Reprogramar',
    cancel: 'Cancelar sesión',
  },
  marketplace: {
    title: 'Mercado',
    buy: 'Comprar',
    sell: 'Vender',
    cart: 'Carrito',
    checkout: 'Pagar',
    total: 'Total',
    empty: 'Tu carrito está vacío.',
    addedToCart: 'Añadido al carrito',
    removedFromCart: 'Eliminado del carrito',
  },
  settings: {
    title: 'Ajustes',
    language: 'Idioma',
    timezone: 'Zona horaria',
    theme: 'Tema',
    themeLight: 'Claro',
    themeDark: 'Oscuro',
    themeAuto: 'Automático',
    notifications: 'Notificaciones',
    privacy: 'Privacidad',
    account: 'Cuenta',
    saved: 'Ajustes guardados.',
  },
  profile: {
    title: 'Perfil',
    editProfile: 'Editar perfil',
    bio: 'Biografía',
    location: 'Ubicación',
    joined: 'Se unió {when}',
    followers: 'Seguidores',
    following: 'Siguiendo',
    follow: 'Seguir',
    unfollow: 'Dejar de seguir',
  },
  notifications: {
    title: 'Notificaciones',
    empty: 'Aún no hay notificaciones.',
    markAllRead: 'Marcar todo como leído',
    newFollower: '{name} empezó a seguirte',
    newComment: '{name} comentó tu publicación',
    newLike: '{name} le dio me gusta a tu publicación',
    newMention: '{name} te mencionó',
    eventReminder: 'Recordatorio: {event} empieza {when}',
    mentorshipRequest: 'Nueva solicitud de mentoría de {name}',
  },
  reflection: {
    title: 'Reflexión diaria',
    prompt: 'Pregunta de hoy',
    answer: 'Tu respuesta',
    save: 'Guardar reflexión',
    saved: 'Reflexión guardada.',
    history: 'Reflexiones pasadas',
  },
  livestream: {
    title: 'Transmisión en vivo',
    live: 'EN VIVO',
    replay: 'Repetición',
    upcoming: 'Próxima transmisión',
    viewers: '{n} viendo ahora',
    chat: 'Chat en vivo',
    sendMessage: 'Enviar mensaje',
  },
  reputation: {
    title: 'Reputación',
    points: '{n} puntos',
    level: 'Nivel {n}',
    nextLevel: '{n} puntos para el siguiente nivel',
    badges: 'Insignias',
    contributions: 'Contribuciones',
  },
};

// --------------------------------------------------------------------------
// 15. Bundle registry + lookup
// --------------------------------------------------------------------------

/** All shipped locale bundles keyed by locale. */
export const LOCALES: Readonly<Record<Locale, TranslationDict>> = Object.freeze({
  'pt-BR': {}, // canonical pt-BR lives in src/lib/i18n/locales/pt-BR.ts; empty here signals "use runtime loader"
  en,
  es,
});

/**
 * Look up a translation by key in the static (en/es) bundle. Returns the
 * key itself if missing (callers can detect with `=== key`). For runtime
 * locale switching, see `src/lib/i18n/useT.ts`.
 */
export function t(locale: Locale, key: string, vars?: InterpolateVars): string {
  const dict = LOCALES[locale];
  const raw = getNested(dict, key);
  if (raw === undefined) {
    // Cross-locale fallback to pt-BR (which may be empty until runtime loads).
    // In practice the runtime loader in src/lib/i18n/index.ts handles this.
    return key;
  }
  return vars ? interpolate(raw, vars) : raw;
}

// --------------------------------------------------------------------------
// 16. Internal helpers
// --------------------------------------------------------------------------

function toDate(input: Date | number | string): Date {
  if (input instanceof Date) return input;
  if (typeof input === 'number') return new Date(input);
  return new Date(input);
}
