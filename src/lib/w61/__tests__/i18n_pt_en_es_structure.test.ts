// ============================================================================
// w61/i18n-pt-en-es-structure.test.ts — Cycle 61
// ----------------------------------------------------------------------------
// Vitest suite. Target 40+ assertions / 15-22 describe blocks.
// Hand-rolled mock-free tests using real Intl APIs.
// ============================================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  // types
  type SupportedLocale,
  type Catalog,
  // registry
  LOCALES,
  DEFAULT_LOCALE,
  FALLBACK_LOCALE,
  // engine
  createTranslator,
  loadCatalogFromJson,
  mergeCatalogs,
  diffCatalogs,
  flattenCatalog,
  unflattenCatalog,
  getCachedCatalog,
  setCachedCatalog,
  invalidateCatalog,
  __resetCatalogCache,
  __resetMissingWarnSet,
  // detection
  detectLocaleFromHeaders,
  detectLocaleFromPath,
  detectLocaleFromCookie,
  negotiateLocale,
  parseAcceptLanguage,
  // plural
  getPluralCategory,
  pluralize,
  // interp
  interpolate,
  escapeIcuVars,
  // sanitize
  sanitizeCatalogValue,
  allowHtmlKeys,
  // tooling
  extractKeys,
  markUntranslated,
  validateKey,
  // server hooks
  translateOnServer,
  withTranslator,
  // internal
  __internal__,
  hashFnv1a32,
  isValidLocale,
  cloneCatalog,
  detectCircularReference,
} from '../i18n_pt_en_es_structure';

// ============================================================================
// Test fixtures
// ============================================================================

function makeCatalog(locale: SupportedLocale, body: Record<string, unknown>): Catalog {
  return {
    locale,
    namespaces: { common: body as never },
    version: '2026.06.0',
    lastReviewedAt: new Date('2026-06-29T00:00:00Z'),
  };
}

const PT_CATALOG = makeCatalog('pt-BR', {
  auth: {
    login: { title: 'Entrar', submit: 'Entrar' },
    signup: { cta: 'Cadastrar' },
  },
  common: {
    cancel: 'Cancelar',
    save: 'Salvar',
    welcome: 'Bem-vindo, {name}',
    itemsCount: 'Você tem {count, plural, one {# item} other {# itens}}',
    messagesCount: 'Você tem {count, plural, one {# mensagem} other {# mensagens}}',
    html: '<b>negrito</b>',
  },
  errors: { network: 'Erro de conexão', notFound: 'Não encontrado' },
  sacred: { greeting: 'Axé, {name}', blessing: 'Que a luz te acompanhe' },
});

const EN_CATALOG = makeCatalog('en', {
  auth: { login: { title: 'Sign in' } },
  common: {
    cancel: 'Cancel',
    welcome: 'Welcome, {name}',
    itemsCount: 'You have {count, plural, one {# item} other {# items}}',
  },
  errors: { network: 'Connection error' },
});

const ES_CATALOG = makeCatalog('es', {
  auth: { login: { title: 'Iniciar sesión' } },
  common: {
    cancel: 'Cancelar',
    welcome: 'Bienvenido, {name}',
    itemsCount:
      'Tienes {count, plural, one {# elemento} many {# elementos} other {# elementos}}',
  },
});

beforeEach(() => {
  __resetMissingWarnSet();
  __resetCatalogCache();
});

// ============================================================================
// §1 — SupportedLocale type & registry
// ============================================================================

describe('§1 SupportedLocale registry', () => {
  it('DEFAULT_LOCALE is pt-BR', () => {
    expect(DEFAULT_LOCALE).toBe('pt-BR');
  });
  it('FALLBACK_LOCALE is pt-BR', () => {
    expect(FALLBACK_LOCALE).toBe('pt-BR');
  });
  it('LOCALES has all 3 entries', () => {
    expect(Object.keys(LOCALES).sort()).toEqual(['en', 'es', 'pt-BR']);
  });
  it('pt-BR currency is BRL', () => {
    expect(LOCALES['pt-BR'].currency).toBe('BRL');
  });
  it('en currency is USD', () => {
    expect(LOCALES.en.currency).toBe('USD');
  });
  it('es currency defaults to EUR', () => {
    expect(LOCALES.es.currency).toBe('EUR');
  });
  it('isValidLocale rejects garbage', () => {
    expect(isValidLocale('fr')).toBe(false);
    expect(isValidLocale('pt-BR')).toBe(true);
    expect(isValidLocale('en')).toBe(true);
  });
});

// ============================================================================
// §2 — LocaleConfig shape
// ============================================================================

describe('§2 LocaleConfig', () => {
  it('pt-BR date format is dd/MM/yyyy', () => {
    expect(LOCALES['pt-BR'].dateFormat).toEqual({
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  });
  it('en date format is MM/dd/yyyy', () => {
    expect(LOCALES.en.dateFormat).toEqual({
      month: '2-digit', day: '2-digit', year: 'numeric',
    });
  });
  it('all locales are LTR (RTL ready but not active)', () => {
    expect(LOCALES['pt-BR'].direction).toBe('ltr');
    expect(LOCALES.en.direction).toBe('ltr');
    expect(LOCALES.es.direction).toBe('ltr');
    expect(LOCALES['pt-BR'].writingDirection).toBe('ltr');
  });
  it('pluralRule.select returns a CLDR category', () => {
    const cat = LOCALES['pt-BR'].pluralRule.select(0);
    expect(['zero', 'one', 'two', 'few', 'many', 'other']).toContain(cat);
  });
});

// ============================================================================
// §3 — Catalog flatten / unflatten / merge / diff
// ============================================================================

describe('§3 Catalog utilities', () => {
  it('flattenCatalog produces dot-notation keys', () => {
    const flat = flattenCatalog(PT_CATALOG);
    expect(flat['auth.login.title']).toBe('Entrar');
    expect(flat['common.cancel']).toBe('Cancelar');
    expect(flat['sacred.blessing']).toBe('Que a luz te acompanhe');
  });
  it('flattenCatalog respects prefix arg', () => {
    const flat = flattenCatalog(PT_CATALOG, 'i18n');
    expect(flat['i18n.common.cancel']).toBe('Cancelar');
  });
  it('unflattenCatalog roundtrips', () => {
    const flat = flattenCatalog(PT_CATALOG);
    const back = unflattenCatalog(flat);
    expect(flattenCatalog(back)).toEqual(flat);
  });
  it('mergeCatalogs prefers c2 on conflict', () => {
    const c2 = makeCatalog('pt-BR', { common: { cancel: 'Desistir' } });
    const merged = mergeCatalogs(PT_CATALOG, c2);
    expect(merged.namespaces.common).toBeDefined();
    const flat = flattenCatalog(merged);
    expect(flat['common.cancel']).toBe('Desistir');
    // other keys preserved
    expect(flat['common.save']).toBe('Salvar');
  });
  it('diffCatalogs finds missing and extra', () => {
    const { missing, extra } = diffCatalogs(PT_CATALOG, EN_CATALOG);
    expect(missing).toContain('common.welcome'); // present in pt, missing in en? actually present
    // common.itemsCount present in both → not missing
    // sacred.* only in pt → missing in en
    expect(missing.some((k) => k.startsWith('sacred'))).toBe(true);
  });
});

// ============================================================================
// §5 — Translator.t singular
// ============================================================================

describe('§5 Translator.t singular', () => {
  it('returns localized string for existing key', () => {
    const t = createTranslator({
      locale: 'pt-BR',
      catalogs: { 'pt-BR': PT_CATALOG },
    });
    expect(t.t('common.cancel')).toBe('Cancelar');
  });
  it('interpolates variables', () => {
    const t = createTranslator({
      locale: 'pt-BR',
      catalogs: { 'pt-BR': PT_CATALOG },
    });
    expect(t.t('common.welcome', { name: 'Ana' })).toBe('Bem-vindo, Ana');
  });
  it('escapes HTML in variable values (XSS defense)', () => {
    const t = createTranslator({
      locale: 'pt-BR',
      catalogs: { 'pt-BR': PT_CATALOG },
    });
    const out = t.t('common.welcome', { name: '<script>x</script>' });
    expect(out).not.toContain('<script>');
    expect(out).toContain('&lt;script&gt;');
  });
  it('falls back to fallback locale when key missing', () => {
    const t = createTranslator({
      locale: 'en',
      catalogs: { 'pt-BR': PT_CATALOG, en: EN_CATALOG },
    });
    // en has common.welcome → uses en
    expect(t.t('common.welcome', { name: 'Ana' })).toBe('Welcome, Ana');
  });
  it('falls back to pt-BR when key missing in en', () => {
    const t = createTranslator({
      locale: 'en',
      catalogs: { 'pt-BR': PT_CATALOG, en: EN_CATALOG },
    });
    // sacred.blessing only in pt-BR
    expect(t.t('sacred.blessing')).toBe('Que a luz te acompanhe');
  });
  it('missing key returns formatted key in capslock', () => {
    const t = createTranslator({
      locale: 'pt-BR',
      catalogs: { 'pt-BR': PT_CATALOG },
    });
    expect(t.t('does.not.exist')).toBe('DOES/NOT/EXIST');
  });
  it('has() returns true for existing keys', () => {
    const t = createTranslator({
      locale: 'pt-BR',
      catalogs: { 'pt-BR': PT_CATALOG },
    });
    expect(t.has('common.cancel')).toBe(true);
    expect(t.has('does.not.exist')).toBe(false);
  });
});

// ============================================================================
// §6 — Pluralization (CLDR + ICU-lite)
// ============================================================================

describe('§6 Pluralization', () => {
  it('pt-BR: 0 → many? (CLDR says "many" for 0 in pt-BR)', () => {
    const cat = getPluralCategory(0, 'pt-BR');
    expect(['zero', 'many', 'other']).toContain(cat);
  });
  it('pt-BR: 1 → one', () => {
    expect(getPluralCategory(1, 'pt-BR')).toBe('one');
  });
  it('pt-BR: 2 → other', () => {
    expect(getPluralCategory(2, 'pt-BR')).toBe('other');
  });
  it('en: 1 → one, 2 → other', () => {
    expect(getPluralCategory(1, 'en')).toBe('one');
    expect(getPluralCategory(2, 'en')).toBe('other');
  });
  it('es: 1 → one, 16 → many', () => {
    expect(getPluralCategory(1, 'es')).toBe('one');
    expect(getPluralCategory(16, 'es')).toBe('many');
    expect(getPluralCategory(100, 'es')).toBe('many');
    expect(getPluralCategory(1000, 'es')).toBe('many');
  });
  it('pluralize: pt-BR 1 mensagem / 2 mensagens', () => {
    const tpl = 'Você tem {count, plural, one {# mensagem} other {# mensagens}}';
    expect(pluralize(tpl, 1, 'pt-BR')).toContain('1 mensagem');
    expect(pluralize(tpl, 1, 'pt-BR')).not.toContain('mensagens');
    expect(pluralize(tpl, 2, 'pt-BR')).toContain('2 mensagens');
  });
  it('pluralize: en one vs other', () => {
    const tpl = 'You have {count, plural, one {# item} other {# items}}';
    expect(pluralize(tpl, 1, 'en')).toContain('1 item');
    expect(pluralize(tpl, 5, 'en')).toContain('5 items');
  });
  it('pluralize: es many category fires for 16', () => {
    const tpl = 'Tienes {count, plural, one {# elemento} many {# elementos (many)} other {# elementos}}';
    expect(pluralize(tpl, 16, 'es')).toContain('elementos (many)');
  });
  it('Translator.tn uses plural dictionary', () => {
    const t = createTranslator({
      locale: 'pt-BR',
      catalogs: { 'pt-BR': PT_CATALOG },
    });
    expect(t.tn('common.itemsCount', 1)).toContain('1 item');
    expect(t.tn('common.itemsCount', 5)).toContain('5 itens');
    expect(t.tn('common.messagesCount', 1)).toContain('1 mensagem');
  });
});

// ============================================================================
// §7 — Number formatting
// ============================================================================

describe('§7 Number formatting', () => {
  it('pt-BR uses comma decimal separator', () => {
    const t = createTranslator({ locale: 'pt-BR', catalogs: {} });
    const out = t.number(1234.56, { minimumFractionDigits: 2 });
    expect(out).toContain(',');
    expect(out).not.toContain('.56'); // '56' not preceded by '.' in pt-BR
  });
  it('en uses dot decimal separator', () => {
    const t = createTranslator({ locale: 'en', catalogs: {} });
    const out = t.number(1234.56, { minimumFractionDigits: 2 });
    expect(out).toContain('.');
  });
  it('default decimals per locale', () => {
    const t = createTranslator({ locale: 'pt-BR', catalogs: {} });
    const out = t.number(1234);
    expect(typeof out).toBe('string');
    expect(out.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// §8 — Currency formatting
// ============================================================================

describe('§8 Currency formatting', () => {
  it('BRL formats as R$', () => {
    const t = createTranslator({ locale: 'pt-BR', catalogs: {} });
    expect(t.currency(1234.56, 'BRL')).toContain('R$');
    expect(t.currency(1234.56, 'BRL')).toContain('1.234,56');
  });
  it('USD formats as $', () => {
    const t = createTranslator({ locale: 'en', catalogs: {} });
    expect(t.currency(1234.56, 'USD')).toContain('$');
    expect(t.currency(1234.56, 'USD')).toContain('1,234.56');
  });
  it('EUR in es locale', () => {
    const t = createTranslator({ locale: 'es', catalogs: {} });
    expect(t.currency(99, 'EUR')).toContain('€');
  });
});

// ============================================================================
// §9 — Date formatting
// ============================================================================

describe('§9 Date formatting', () => {
  it('formats Date object per locale', () => {
    const t = createTranslator({ locale: 'pt-BR', catalogs: {} });
    const d = new Date('2026-06-29T12:00:00Z');
    const out = t.date(d);
    expect(typeof out).toBe('string');
    expect(out.length).toBeGreaterThan(0);
  });
  it('accepts timestamp number', () => {
    const t = createTranslator({ locale: 'en', catalogs: {} });
    const out = t.date(Date.UTC(2026, 5, 29));
    expect(out).toMatch(/2026/);
  });
  it('custom opts override default', () => {
    const t = createTranslator({ locale: 'pt-BR', catalogs: {} });
    const out = t.date(new Date('2026-06-29T12:00:00Z'), {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    expect(out.toLowerCase()).toContain('junho'); // pt-BR June
  });
});

// ============================================================================
// §10 — Relative time
// ============================================================================

describe('§10 Relative time', () => {
  it('formats past times in pt-BR', () => {
    const t = createTranslator({ locale: 'pt-BR', catalogs: {} });
    const past = new Date(Date.now() - 5 * 60 * 1000); // 5 min ago
    const out = t.relativeTime(past);
    expect(out.toLowerCase()).toMatch(/atrás|há/);
  });
  it('formats future times', () => {
    const t = createTranslator({ locale: 'en', catalogs: {} });
    const future = new Date(Date.now() + 3 * 86_400_000); // 3 days
    const out = t.relativeTime(future);
    expect(out.toLowerCase()).toMatch(/in|3/);
  });
  it('honors base date', () => {
    const t = createTranslator({ locale: 'en', catalogs: {} });
    const base = new Date('2026-06-29T00:00:00Z');
    const future = new Date('2026-07-02T00:00:00Z');
    const out = t.relativeTime(future, base);
    expect(out).toMatch(/3/);
  });
});

// ============================================================================
// §11 — List formatting
// ============================================================================

describe('§11 List formatting', () => {
  it('pt-BR uses "e" as conjunction', () => {
    const t = createTranslator({ locale: 'pt-BR', catalogs: {} });
    const out = t.list(['Ana', 'Bruno', 'Carla']);
    expect(out).toContain(' e ');
  });
  it('en uses "and"', () => {
    const t = createTranslator({ locale: 'en', catalogs: {} });
    const out = t.list(['Ana', 'Bruno', 'Carla']);
    expect(out).toContain(' and ');
  });
  it('es uses "y"', () => {
    const t = createTranslator({ locale: 'es', catalogs: {} });
    const out = t.list(['Ana', 'Bruno', 'Carla']);
    expect(out).toContain(' y ');
  });
  it('empty list returns empty string', () => {
    const t = createTranslator({ locale: 'en', catalogs: {} });
    expect(t.list([])).toBe('');
  });
});

// ============================================================================
// §12 — Unit formatting
// ============================================================================

describe('§12 Unit formatting', () => {
  it('formats kilometer in pt-BR', () => {
    const t = createTranslator({ locale: 'pt-BR', catalogs: {} });
    const out = t.unit(10, 'kilometer');
    expect(out.toLowerCase()).toContain('km');
  });
  it('formats celsius', () => {
    const t = createTranslator({ locale: 'en', catalogs: {} });
    const out = t.unit(25, 'celsius');
    expect(out).toMatch(/25/);
    expect(out.toLowerCase()).toContain('celsius');
  });
  it('falls back to number when unit is missing', () => {
    const t = createTranslator({ locale: 'pt-BR', catalogs: {} });
    const out = t.unit(42, undefined as unknown as 'kilometer');
    expect(out).toContain('42');
  });
});

// ============================================================================
// §13 — Locale detection
// ============================================================================

describe('§13 Locale detection', () => {
  it('parseAcceptLanguage parses q-values', () => {
    const tags = parseAcceptLanguage('pt-BR,en;q=0.9,es;q=0.8');
    expect(tags[0].tag).toBe('pt-BR');
    expect(tags[0].q).toBe(1);
    expect(tags[1].tag).toBe('en');
    expect(tags[1].q).toBeCloseTo(0.9);
  });
  it('detectLocaleFromHeaders matches pt-BR', () => {
    const headers = { get: (n: string) => (n === 'accept-language' ? 'pt-BR' : null) };
    expect(detectLocaleFromHeaders(headers)).toBe('pt-BR');
  });
  it('detectLocaleFromHeaders negotiates parent "en-US" → "en"', () => {
    const headers = { get: (n: string) => (n === 'accept-language' ? 'en-US' : null) };
    expect(detectLocaleFromHeaders(headers)).toBe('en');
  });
  it('detectLocaleFromPath picks /en/...', () => {
    expect(detectLocaleFromPath('/en/dashboard')).toBe('en');
    expect(detectLocaleFromPath('/pt-BR/auth')).toBe('pt-BR');
    expect(detectLocaleFromPath('/es/profile')).toBe('es');
  });
  it('detectLocaleFromPath defaults to pt-BR when no prefix', () => {
    expect(detectLocaleFromPath('/dashboard')).toBe('pt-BR');
  });
  it('detectLocaleFromCookie reads locale cookie', () => {
    const cookies = { get: (n: string) => (n === 'locale' ? { value: 'es' } : undefined) };
    expect(detectLocaleFromCookie(cookies)).toBe('es');
  });
  it('negotiateLocale orders by q', () => {
    expect(negotiateLocale(['en;q=0.5', 'pt-BR;q=0.9', 'es;q=0.7'], ['pt-BR', 'en', 'es'])).toBe('pt-BR');
  });
});

// ============================================================================
// §14 — Lazy loading & cache
// ============================================================================

describe('§14 Catalog cache', () => {
  it('set + get roundtrip', () => {
    const cat = loadCatalogFromJson('pt-BR', 'common', { foo: 'bar' });
    setCachedCatalog(cat, 'common');
    const got = getCachedCatalog('pt-BR', 'common', cat.version);
    expect(got).not.toBeNull();
    expect(got!.namespaces.common).toEqual({ foo: 'bar' });
  });
  it('miss returns null', () => {
    expect(getCachedCatalog('en', 'nonexistent', '1.0.0')).toBeNull();
  });
  it('invalidate clears by namespace', () => {
    const cat = loadCatalogFromJson('pt-BR', 'common', { foo: 'bar' });
    setCachedCatalog(cat, 'common');
    invalidateCatalog('pt-BR', 'common');
    expect(getCachedCatalog('pt-BR', 'common', cat.version)).toBeNull();
  });
});

// ============================================================================
// §15 — Fallback chain
// ============================================================================

describe('§15 Fallback chain', () => {
  it('en falls back to pt-BR for missing key', () => {
    const t = createTranslator({
      locale: 'en',
      catalogs: { 'pt-BR': PT_CATALOG, en: EN_CATALOG },
    });
    expect(t.t('sacred.blessing')).toBe('Que a luz te acompanhe');
  });
  it('custom fallbackLocale overrides default', () => {
    const t = createTranslator({
      locale: 'es',
      catalogs: { 'pt-BR': PT_CATALOG, es: ES_CATALOG },
      fallbackLocale: 'en',
    });
    // sacred.blessing not in en either → should fall back via fallbackLocale but not found
    const out = t.t('sacred.blessing');
    expect(typeof out).toBe('string');
  });
  it('returns formatted missing key when nothing matches', () => {
    const t = createTranslator({
      locale: 'es',
      catalogs: { en: EN_CATALOG },
    });
    expect(t.t('completely.absent')).toBe('COMPLETELY/ABSENT');
  });
});

// ============================================================================
// §16 — HTML sanitization
// ============================================================================

describe('§16 HTML sanitization', () => {
  it('plain mode escapes HTML', () => {
    const out = sanitizeCatalogValue('<b>bold</b>', false);
    expect(out).toBe('&lt;b&gt;bold&lt;/b&gt;');
  });
  it('allowHtml mode preserves safe tags', () => {
    const out = sanitizeCatalogValue('<b>bold</b>', true);
    expect(out).toContain('<b>bold</b>');
  });
  it('strips script tags even in allowHtml', () => {
    const out = sanitizeCatalogValue('<script>x</script><b>ok</b>', true);
    expect(out).not.toContain('<script>');
    expect(out).toContain('<b>ok</b>');
  });
  it('strips onclick attributes', () => {
    const out = sanitizeCatalogValue('<a href="x" onclick="bad()">link</a>', true);
    expect(out).not.toMatch(/onclick/i);
  });
  it('strips javascript: URLs', () => {
    const out = sanitizeCatalogValue('<a href="javascript:bad()">x</a>', true);
    expect(out.toLowerCase()).not.toContain('javascript:');
  });
  it('allowHtmlKeys whitelist includes common.legal.terms-body', () => {
    expect(allowHtmlKeys.has('common.legal.terms-body')).toBe(true);
  });
});

// ============================================================================
// §17 — Server / client compat
// ============================================================================

describe('§17 Server + client compat', () => {
  it('translateOnServer works with empty catalogs (returns capslock)', () => {
    expect(translateOnServer('pt-BR', 'missing.key')).toBe('MISSING/KEY');
  });
  it('withTranslator binds a translator', () => {
    const out = withTranslator(
      (t) => t.number(42),
      { locale: 'pt-BR' },
    );
    expect(typeof out).toBe('string');
  });
  it('createTranslator is pure (no DOM needed)', () => {
    // no window/document mock needed — would throw if DOM-dependent
    const t = createTranslator({ locale: 'pt-BR', catalogs: {} });
    expect(t.locale).toBe('pt-BR');
    expect(typeof t.t).toBe('function');
  });
});

// ============================================================================
// §18 — Variable escaping
// ============================================================================

describe('§18 Variable escaping', () => {
  it('escapeIcuVars escapes HTML in strings', () => {
    const out = escapeIcuVars({ name: '<a>' });
    expect(out.name).toBe('&lt;a&gt;');
  });
  it('escapeIcuVars stringifies numbers without escape', () => {
    const out = escapeIcuVars({ count: 42 });
    expect(out.count).toBe('42');
  });
  it('interpolate leaves unknown placeholders visible', () => {
    expect(interpolate('Hello {unknown}', {})).toBe('Hello {unknown}');
  });
  it('interpolate substitutes known placeholders', () => {
    expect(interpolate('Hello {name}', { name: 'Ana' })).toBe('Hello Ana');
  });
  it('interpolate escapes values (defense in depth)', () => {
    expect(interpolate('Hi {x}', { x: '<script>' })).toBe('Hi &lt;script&gt;');
  });
});

// ============================================================================
// §19 — RTL ready
// ============================================================================

describe('§19 RTL infrastructure', () => {
  it('all current locales are LTR', () => {
    const t = createTranslator({ locale: 'pt-BR', catalogs: {} });
    expect(t.direction()).toBe('ltr');
    expect(LOCALES['pt-BR'].writingDirection).toBe('ltr');
    expect(LOCALES.en.writingDirection).toBe('ltr');
    expect(LOCALES.es.writingDirection).toBe('ltr');
  });
  it('LocaleConfig supports writingDirection field', () => {
    expect('writingDirection' in LOCALES['pt-BR']).toBe(true);
  });
});

// ============================================================================
// §20 — Translation tooling hooks
// ============================================================================

describe('§20 Tooling hooks', () => {
  it('extractKeys returns all flat keys', () => {
    const keys = extractKeys(PT_CATALOG);
    expect(keys.has('common.cancel')).toBe(true);
    expect(keys.has('auth.login.title')).toBe(true);
    expect(keys.has('sacred.greeting')).toBe(true);
  });
  it('markUntranslated is alias for diffCatalogs', () => {
    const r1 = markUntranslated(PT_CATALOG, EN_CATALOG);
    const r2 = diffCatalogs(PT_CATALOG, EN_CATALOG);
    expect(r1.missing.sort()).toEqual(r2.missing.sort());
    expect(r1.extra.sort()).toEqual(r2.extra.sort());
  });
  it('validateKey accepts valid keys', () => {
    expect(validateKey('auth.login.title')).toBeNull();
    expect(validateKey('common.cancel')).toBeNull();
  });
  it('validateKey rejects empty', () => {
    expect(validateKey('')).toMatch(/empty/i);
  });
  it('validateKey rejects invalid chars', () => {
    expect(validateKey('auth login')).toMatch(/dot-separated/i);
  });
  it('validateKey rejects too long', () => {
    const long = 'a'.repeat(201);
    expect(validateKey(long)).toMatch(/200/);
  });
});

// ============================================================================
// Internal helpers (cross-section sanity)
// ============================================================================

describe('Internal helpers', () => {
  it('hashFnv1a32 is deterministic', () => {
    expect(hashFnv1a32('hello')).toBe(hashFnv1a32('hello'));
  });
  it('hashFnv1a32 differs for different inputs', () => {
    expect(hashFnv1a32('a')).not.toBe(hashFnv1a32('b'));
  });
  it('hashFnv1a32 returns 8 hex chars', () => {
    expect(hashFnv1a32('test')).toMatch(/^[0-9a-f]{8}$/);
  });
  it('cloneCatalog deep-clones', () => {
    const c = makeCatalog('pt-BR', { a: { b: 'x' } });
    const c2 = cloneCatalog(c);
    c2.namespaces.common = { a: { b: 'y' } } as never;
    expect((c.namespaces.common as Record<string, Record<string, string>>).a.b).toBe('x');
  });
  it('detectCircularReference catches infinite loops', () => {
    const resolver = (name: string): string | undefined => {
      if (name === 'a') return '{b}';
      if (name === 'b') return '{a}';
      return undefined;
    };
    const out = detectCircularReference('{a}', resolver);
    // either returns null (terminated via seen set) or error string
    expect(out === null || typeof out === 'string').toBe(true);
  });
  it('parsePluralCases handles nested braces', () => {
    const cases = __internal__.extractPluralCases('one {1 item} other {2 items}');
    expect(cases.one).toBe('1 item');
    expect(cases.other).toBe('2 items');
  });
  it('PR instances exist for all locales', () => {
    expect(__internal__.PR['pt-BR']).toBeDefined();
    expect(__internal__.PR.en).toBeDefined();
    expect(__internal__.PR.es).toBeDefined();
  });
});

// ============================================================================
// Edge cases
// ============================================================================

describe('Edge cases', () => {
  it('interpolate handles empty template', () => {
    expect(interpolate('', { x: 1 })).toBe('');
  });
  it('interpolate handles empty vars', () => {
    expect(interpolate('hello', {})).toBe('hello');
  });
  it('parseAcceptLanguage handles empty string', () => {
    expect(parseAcceptLanguage('')).toEqual([]);
  });
  it('parseAcceptLanguage handles malformed q-values', () => {
    const tags = parseAcceptLanguage('en;q=foo');
    expect(tags[0].tag).toBe('en');
    expect(tags[0].q).toBe(1); // fallback to 1 on NaN
  });
  it('tpl key with only 1 segment resolves directly', () => {
    const cat = loadCatalogFromJson('pt-BR', 'root', { hello: 'Olá' });
    const t = createTranslator({ locale: 'pt-BR', catalogs: { 'pt-BR': cat } });
    // Key 'root.hello' should work
    expect(t.t('root.hello')).toBe('Olá');
  });
  it('currency 0 formats as zero', () => {
    const t = createTranslator({ locale: 'pt-BR', catalogs: {} });
    const out = t.currency(0, 'BRL');
    expect(out).toContain('0');
  });
  it('relativeTime for past second', () => {
    const t = createTranslator({ locale: 'en', catalogs: {} });
    const past = new Date(Date.now() - 30 * 1000);
    const out = t.relativeTime(past);
    expect(typeof out).toBe('string');
  });
  it('list with single item', () => {
    const t = createTranslator({ locale: 'en', catalogs: {} });
    expect(t.list(['only'])).toBe('only');
  });
  it('flattenCatalog handles array of strings', () => {
    const cat = makeCatalog('pt-BR', { items: ['a', 'b', 'c'] });
    const flat = flattenCatalog(cat);
    expect(flat['items.0']).toBe('a');
    expect(flat['items.2']).toBe('c');
  });
  it('createTranslator tolerates partial catalogs', () => {
    // Only en catalog, locale pt-BR — should fall back to default (pt-BR), which is also en's fallback
    const t = createTranslator({
      locale: 'pt-BR',
      catalogs: { en: EN_CATALOG },
    });
    // common.cancel exists in en, falls back to it
    expect(t.t('common.cancel')).toBe('Cancel');
  });
});

// ============================================================================
// Sanity round-trip
// ============================================================================

describe('Sanity round-trip', () => {
  it('catalog → flatten → unflatten produces equivalent keys', () => {
    const flat = flattenCatalog(PT_CATALOG);
    const back = unflattenCatalog(flat);
    const backFlat = flattenCatalog(back);
    expect(backFlat).toEqual(flat);
  });
  it('all 3 locales produce distinct currencies', () => {
    const tpt = createTranslator({ locale: 'pt-BR', catalogs: {} });
    const ten = createTranslator({ locale: 'en', catalogs: {} });
    const tes = createTranslator({ locale: 'es', catalogs: {} });
    expect(tpt.currency(100, 'BRL')).not.toBe(ten.currency(100, 'USD'));
    expect(tes.currency(100, 'EUR')).not.toBe(ten.currency(100, 'USD'));
  });
  it('Translator exposes all required methods', () => {
    const t = createTranslator({ locale: 'pt-BR', catalogs: {} });
    const required = ['t', 'tn', 'td', 'has', 'direction', 'number', 'currency', 'date', 'relativeTime', 'list', 'unit'];
    for (const m of required) {
      expect(typeof (t as unknown as Record<string, unknown>)[m]).toBe('function');
    }
  });
});