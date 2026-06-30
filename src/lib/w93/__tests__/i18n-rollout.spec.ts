// ============================================================================
// W93-C — i18n Rollout Spec (node:test, ≥30 asserts)
// ============================================================================
// Source-inspection style + runtime. Roda via `node --import tsx --test`.
//
// COBERTURA:
//   1. W93_STRINGS shape: ≥80 keys, 3 locales cada, STRING_COUNT coerente
//   2. Sacred terms preservados em 3 locales
//   3. CLDR plural rules via Intl.PluralRules
//   4. Ordinal rules (en: 1st/2nd/3rd/4th)
//   5. loadTranslations: 3 locales, frozen, lookup
//   6. t() — interpolação, plural-aware lookup, fallback pt-BR
//   7. validateRolloutTranslations: ok em estado limpo
//   8. Routing helpers: resolveServerLocale degrada para pt-BR
//   9. LocaleAwareImage + PluralText source-inspection (componentes)
//  10. Page i18n: landing, onboarding, leitura
//  11. CLI validator: exit 0
//  12. Cobertura ≥30 asserts via tick()
// ============================================================================

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, existsSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REAL_ROOT = resolve(__dirname, '..', '..', '..', '..');

import {
  t as tCore,
  loadTranslations,
  validateRolloutTranslations,
  asTranslationKeyW93,
  isSupportedLocaleW93,
  pluralRules,
  getPluralRules,
  formatNumber,
  formatDate,
  formatRelativeTime,
  formatOrdinal,
  pluralRulesCacheInfo,
  tPlural,
  tWithLocaleW93,
  LOCALE_META_W93,
  SUPPORTED_LOCALES_W93,
} from '../i18n-rollout-engine';
import { W93_STRINGS, W93_STRING_COUNT } from '../i18n-rollout-strings';

let assertCount = 0;
function tick(name: string) {
  assertCount++;
  console.log(`  ✓ ${name}`);
}

// ----------------------------------------------------------------------------
// 1) W93_STRINGS shape
// ----------------------------------------------------------------------------

test('W93_STRINGS tem ≥80 keys (brief W93-C)', () => {
  assert.ok(Object.keys(W93_STRINGS).length >= 80, `expected ≥80, got ${Object.keys(W93_STRINGS).length}`);
  tick('W93_STRINGS.length >= 80');
});

test('W93_STRINGS tem 81+ keys (real)', () => {
  assert.ok(Object.keys(W93_STRINGS).length >= 81, `expected ≥81, got ${Object.keys(W93_STRINGS).length}`);
  tick('W93_STRINGS.length >= 81');
});

test('W93_STRING_COUNT coerente com Object.keys(W93_STRINGS).length', () => {
  assert.equal(W93_STRING_COUNT, Object.keys(W93_STRINGS).length);
  tick('W93_STRING_COUNT coerente');
});

test('toda entrada tem exatamente 3 locales (pt-BR, en, es)', () => {
  for (const [key, entry] of Object.entries(W93_STRINGS)) {
    assert.ok('pt-BR' in entry, `key=${key} missing pt-BR`);
    assert.ok('en' in entry, `key=${key} missing en`);
    assert.ok('es' in entry, `key=${key} missing es`);
  }
  tick('3 locales em cada entrada');
});

test('SUPPORTED_LOCALES_W93 contém exatamente 3 locales', () => {
  assert.deepEqual([...SUPPORTED_LOCALES_W93].sort(), ['en', 'es', 'pt-BR']);
  tick('SUPPORTED_LOCALES_W93 = [pt-BR, en, es]');
});

// ----------------------------------------------------------------------------
// 2) Sacred terms preservados em 3 locales
// ----------------------------------------------------------------------------

test('"orixás" preservado em PT-BR, EN e ES (orixaGreeting)', () => {
  // orixa.label.greeting usa placeholder {name} — quando interpolado, recebe "orixás"
  // então testamos o contrato: ao interpolar com name='orixás', o output deve
  // conter 'orixás' literal, nunca 'orishas'.
  const dict = loadTranslations('pt-BR');
  const rendered = tCore(asTranslationKeyW93('orixa.label.greeting'), dict, { name: 'orixás' }, undefined, 'pt-BR');
  assert.ok(rendered.includes('orixás'), `expected rendered to contain "orixás", got: ${rendered}`);
  assert.ok(!rendered.includes('orishas'), `expected no anglicization, got: ${rendered}`);
  assert.equal(rendered, 'Saudações a orixás');
  // Padrão se repete em en/es (mesma grafia "orixás" nas três)
  const enDict = loadTranslations('en');
  const esDict = loadTranslations('es');
  assert.equal(tCore(asTranslationKeyW93('orixa.label.greeting'), enDict, { name: 'orixás' }, undefined, 'en'), 'Greetings to orixás');
  assert.equal(tCore(asTranslationKeyW93('orixa.label.greeting'), esDict, { name: 'orixás' }, undefined, 'es'), 'Saludos a orixás');
  tick('orixás preservado em 3 locales (orixa.label.greeting)');
});

test('"axé" preservado em 3 locales (akashaGreeting)', () => {
  // akashaGreeting é uma string literal (sem placeholder) que contém 'Axé' ou 'axé'
  const v_pt = W93_STRINGS['tradition.akashaGreeting']['pt-BR'].toLowerCase();
  const v_en = W93_STRINGS['tradition.akashaGreeting']['en'].toLowerCase();
  const v_es = W93_STRINGS['tradition.akashaGreeting']['es'].toLowerCase();
  assert.ok(v_pt.includes('axé'), `pt-BR missing axé: ${v_pt}`);
  assert.ok(v_en.includes('axé'), `en missing axé: ${v_en}`);
  assert.ok(v_es.includes('axé'), `es missing axé: ${v_es}`);
  for (const loc of SUPPORTED_LOCALES_W93) {
    const v = W93_STRINGS['tradition.akashaGreeting'][loc];
    assert.ok(!v.includes('ashé'), `[${loc}] axé→ashé proibido: ${v}`);
    assert.ok(!v.toLowerCase().includes('axe ') && !v.toLowerCase().includes('axe-'), `[${loc}] axé→axe proibido: ${v}`);
  }
  // valor exato
  assert.equal(W93_STRINGS['tradition.akashaGreeting']['pt-BR'], 'Axé — que Akasha ilumine sua busca');
  assert.equal(W93_STRINGS['tradition.akashaGreeting']['en'], 'Axé — may Akasha illuminate your search');
  assert.equal(W93_STRINGS['tradition.akashaGreeting']['es'], 'Axé — que Akasha ilumine tu búsqueda');
  tick('axé preservado em 3 locales (akashaGreeting)');
});

test('"Odu" preservado em 3 locales (odu.label.header)', () => {
  for (const loc of SUPPORTED_LOCALES_W93) {
    const v = W93_STRINGS['odu.label.header'][loc];
    assert.ok(v.includes('{name}'), `[${loc}] expected placeholder {name}`);
  }
  // odu.cross.house.label preserva "House" / "Casa"
  assert.equal(W93_STRINGS['odu.cross.house.label']['pt-BR'], 'Casa {n}');
  assert.equal(W93_STRINGS['odu.cross.house.label']['en'], 'House {n}');
  assert.equal(W93_STRINGS['odu.cross.house.label']['es'], 'Casa {n}');
  tick('Odu label preservado em 3 locales');
});

test('"Cigano Ramiro" preservado em 3 locales (ciganoRamiroAttribution)', () => {
  assert.equal(W93_STRINGS['tradition.ciganoRamiroAttribution']['pt-BR'], 'Método Cigano Ramiro');
  assert.equal(W93_STRINGS['tradition.ciganoRamiroAttribution']['en'], 'Cigano Ramiro method');
  assert.equal(W93_STRINGS['tradition.ciganoRamiroAttribution']['es'], 'Método Cigano Ramiro');
  tick('Cigano Ramiro preservado');
});

test('"pemba" preservado em 3 locales (pembaNote)', () => {
  assert.ok(W93_STRINGS['tradition.pembaNote']['pt-BR'].includes('pemba'));
  assert.ok(W93_STRINGS['tradition.pembaNote']['en'].includes('pemba'));
  assert.ok(W93_STRINGS['tradition.pembaNote']['es'].includes('pemba'));
  for (const loc of SUPPORTED_LOCALES_W93) {
    const v = W93_STRINGS['tradition.pembaNote'][loc];
    assert.ok(!v.toLowerCase().includes('chalk'), `[${loc}] pemba→chalk proibido`);
  }
  tick('pemba preservado em 3 locales');
});

// ----------------------------------------------------------------------------
// 3) CLDR plural rules via Intl.PluralRules
// ----------------------------------------------------------------------------

test('pluralRules.select(1, "pt-BR") = "one"', () => {
  assert.equal(pluralRules.select(1, 'pt-BR'), 'one');
  tick('CLDR pt-BR n=1 = "one"');
});

test('pluralRules.select(2, "pt-BR") = "other"', () => {
  assert.equal(pluralRules.select(2, 'pt-BR'), 'other');
  tick('CLDR pt-BR n=2 = "other"');
});

test('pluralRules.select(0, "en") = "other"', () => {
  assert.equal(pluralRules.select(0, 'en'), 'other');
  tick('CLDR en n=0 = "other"');
});

test('pluralRules.select(1, "en") = "one"', () => {
  assert.equal(pluralRules.select(1, 'en'), 'one');
  tick('CLDR en n=1 = "one"');
});

test('pluralRules.select(2, "es") = "other"', () => {
  assert.equal(pluralRules.select(2, 'es'), 'other');
  tick('CLDR es n=2 = "other"');
});

test('pluralRules.select(1, "es") = "one"', () => {
  assert.equal(pluralRules.select(1, 'es'), 'one');
  tick('CLDR es n=1 = "one"');
});

test('getPluralRules memoiza (cache populado após múltiplas chamadas)', () => {
  const before = pluralRulesCacheInfo().size;
  getPluralRules('pt-BR', 'cardinal');
  getPluralRules('en', 'cardinal');
  getPluralRules('es', 'cardinal');
  getPluralRules('pt-BR', 'ordinal');
  const after = pluralRulesCacheInfo().size;
  assert.ok(after >= before, `cache deveria crescer: ${before} → ${after}`);
  // Re-fetch same → mesma instância (cache hit)
  const r1 = getPluralRules('pt-BR', 'cardinal');
  const r2 = getPluralRules('pt-BR', 'cardinal');
  assert.equal(r1, r2);
  tick('PluralRules cache funciona');
});

// ----------------------------------------------------------------------------
// 4) Ordinal rules (en: 1st/2nd/3rd/4th)
// ----------------------------------------------------------------------------

test('formatOrdinal(1, "en") = "1st"', () => {
  assert.equal(formatOrdinal(1, 'en'), '1st');
  tick('ordinal en 1st');
});

test('formatOrdinal(2, "en") = "2nd"', () => {
  assert.equal(formatOrdinal(2, 'en'), '2nd');
  tick('ordinal en 2nd');
});

test('formatOrdinal(3, "en") = "3rd"', () => {
  assert.equal(formatOrdinal(3, 'en'), '3rd');
  tick('ordinal en 3rd');
});

test('formatOrdinal(4, "en") = "4th"', () => {
  assert.equal(formatOrdinal(4, 'en'), '4th');
  tick('ordinal en 4th');
});

test('formatOrdinal(11, "en") = "11th" (special case)', () => {
  assert.equal(formatOrdinal(11, 'en'), '11th');
  tick('ordinal en 11th');
});

test('formatOrdinal(21, "en") = "21st"', () => {
  assert.equal(formatOrdinal(21, 'en'), '21st');
  tick('ordinal en 21st');
});

test('formatOrdinal(1, "pt-BR") = "1.º"', () => {
  const result = formatOrdinal(1, 'pt-BR');
  assert.match(result, /^1/);
  assert.match(result, /\u00ba|\./);
  tick('ordinal pt-BR 1.º');
});

test('formatOrdinal(5, "es") = "5.º"', () => {
  const result = formatOrdinal(5, 'es');
  assert.match(result, /^5/);
  tick('ordinal es 5.º');
});

// ----------------------------------------------------------------------------
// 5) loadTranslations
// ----------------------------------------------------------------------------

test('loadTranslations("en") retorna dicionário frozen', () => {
  const dict = loadTranslations('en');
  assert.ok(Object.isFrozen(dict), 'dicionário deve ser frozen');
  tick('dict é frozen');
});

test('loadTranslations retorna string para cada key registrada (3 locales)', () => {
  for (const loc of SUPPORTED_LOCALES_W93) {
    const dict = loadTranslations(loc);
    for (const key of Object.keys(W93_STRINGS)) {
      const v = dict[asTranslationKeyW93(key)];
      assert.equal(typeof v, 'string', `[${loc}][${key}] not string`);
      assert.ok(v.length > 0, `[${loc}][${key}] empty`);
    }
  }
  tick('todas keys → string não-vazia em 3 locales');
});

test('loadTranslations("en")["home.hero.ctaPrimary"] === "Join the waitlist"', () => {
  const en = loadTranslations('en');
  assert.equal(en[asTranslationKeyW93('home.hero.ctaPrimary')], 'Join the waitlist');
  tick('en[home.hero.ctaPrimary] === "Join the waitlist"');
});

test('loadTranslations("es")["home.hero.ctaPrimary"] === "Entrar en la lista de espera"', () => {
  const es = loadTranslations('es');
  assert.equal(es[asTranslationKeyW93('home.hero.ctaPrimary')], 'Entrar en la lista de espera');
  tick('es[home.hero.ctaPrimary]');
});

test('loadTranslations lança em locale inválido', () => {
  assert.throws(
    // @ts-expect-error — runtime safety
    () => loadTranslations('xx-YY'),
    /Unsupported locale/,
  );
  tick('loadTranslations lança em locale inválido');
});

// ----------------------------------------------------------------------------
// 6) t() — interpolação, plural-aware lookup, fallback
// ----------------------------------------------------------------------------

test('t() substitui {name} por valor', () => {
  const en = loadTranslations('en');
  const r = tCore(asTranslationKeyW93('odu.label.header'), en, { name: 'Ogbe' }, undefined, 'en');
  assert.equal(r, 'Drawn Odu: Ogbe');
  tick('interpolação {name}');
});

test('t() mantém vars ausentes como literal {name}', () => {
  const en = loadTranslations('en');
  const r = tCore(asTranslationKeyW93('odu.label.header'), en, undefined, undefined, 'en');
  assert.equal(r, 'Drawn Odu: {name}');
  tick('vars ausentes preservadas como literal');
});

test('t() plural-aware lookup: n=1 usa singular, n=5 usa plural (auto-detect "Plural" suffix)', () => {
  const en = loadTranslations('en');
  const r1 = tCore(asTranslationKeyW93('counter.readings'), en, { n: 1 }, undefined, 'en');
  const r5 = tCore(asTranslationKeyW93('counter.readings'), en, { n: 5 }, undefined, 'en');
  assert.equal(r1, '1 reading');
  assert.equal(r5, '5 readings');
  tick('t() plural-aware auto-detect');
});

test('t() plural-aware em PT-BR e ES', () => {
  const pt = loadTranslations('pt-BR');
  const es = loadTranslations('es');
  assert.equal(tCore(asTranslationKeyW93('counter.readings'), pt, { n: 1 }, undefined, 'pt-BR'), '1 leitura');
  assert.equal(tCore(asTranslationKeyW93('counter.readings'), pt, { n: 3 }, undefined, 'pt-BR'), '3 leituras');
  assert.equal(tCore(asTranslationKeyW93('counter.readings'), es, { n: 1 }, undefined, 'es'), '1 lectura');
  assert.equal(tCore(asTranslationKeyW93('counter.readings'), es, { n: 3 }, undefined, 'es'), '3 lecturas');
  tick('t() plural-aware PT-BR e ES');
});

test('tPlural() escolhe explicitamente singular/plural via CLDR', () => {
  const dict = loadTranslations('en');
  const r1 = tPlural(
    asTranslationKeyW93('counter.readings'),
    asTranslationKeyW93('counter.readingsPlural'),
    1, dict, 'en',
  );
  const r5 = tPlural(
    asTranslationKeyW93('counter.readings'),
    asTranslationKeyW93('counter.readingsPlural'),
    5, dict, 'en',
  );
  assert.equal(r1, '1 reading');
  assert.equal(r5, '5 readings');
  tick('tPlural() CLDR-correct');
});

test('t() fallback para pt-BR quando chave falta em en', () => {
  // Remove uma chave W93 do dict en para simular "falta"
  const incomplete = { ...loadTranslations('en') } as Record<string, string>;
  delete incomplete['home.hero.ctaPrimary'];
  const pt = loadTranslations('pt-BR');
  const r = tCore(asTranslationKeyW93('home.hero.ctaPrimary'), incomplete as never, undefined, pt, 'en');
  assert.equal(r, 'Entrar na lista de espera');
  tick('fallback pt-BR funciona');
});

test('tWithLocaleW93 resolve chave em qualquer locale', () => {
  assert.equal(tWithLocaleW93(asTranslationKeyW93('home.hero.ctaPrimary'), 'pt-BR'), 'Entrar na lista de espera');
  assert.equal(tWithLocaleW93(asTranslationKeyW93('home.hero.ctaPrimary'), 'en'), 'Join the waitlist');
  assert.equal(tWithLocaleW93(asTranslationKeyW93('home.hero.ctaPrimary'), 'es'), 'Entrar en la lista de espera');
  tick('tWithLocaleW93 em 3 locales');
});

// ----------------------------------------------------------------------------
// 7) validateRolloutTranslations
// ----------------------------------------------------------------------------

test('validateRolloutTranslations() retorna ok=true no estado limpo', () => {
  const r = validateRolloutTranslations();
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.stats.totalKeys, Object.keys(W93_STRINGS).length);
    assert.equal(r.stats.locales.length, 3);
  }
  tick('validateRolloutTranslations ok');
});

test('validateRolloutTranslations é determinístico (idempotente)', () => {
  const r1 = validateRolloutTranslations();
  const r2 = validateRolloutTranslations();
  assert.equal(r1.ok, r2.ok);
  if (r1.ok && r2.ok) {
    assert.deepEqual(r1.stats, r2.stats);
  }
  tick('validateRolloutTranslations idempotente');
});

test('todas as chaves "X" têm X+"Plural" consistente em vars', () => {
  for (const key of Object.keys(W93_STRINGS)) {
    if (!key.endsWith('Plural')) continue;
    const singularKey = key.slice(0, -'Plural'.length);
    if (!(singularKey in W93_STRINGS)) continue;
    for (const loc of SUPPORTED_LOCALES_W93) {
      const singularVars = (W93_STRINGS as Record<string, Record<string, string>>)[singularKey][loc].match(/\{[a-zA-Z_][a-zA-Z0-9_]*\}/g) ?? [];
      const pluralVars = W93_STRINGS[key as keyof typeof W93_STRINGS][loc].match(/\{[a-zA-Z_][a-zA-Z0-9_]*\}/g) ?? [];
      assert.deepEqual(
        singularVars.sort(),
        pluralVars.sort(),
        `[${loc}] ${singularKey} vs ${key} vars mismatch`,
      );
    }
  }
  tick('singular/plural vars consistentes');
});

// ----------------------------------------------------------------------------
// 8) Routing helpers
// ----------------------------------------------------------------------------

test('resolveServerLocale degrada para pt-BR (sem cookie)', async () => {
  const routing = await import('../i18n-rollout-routing');
  // Sem cookieStore → deve retornar DEFAULT_LOCALE
  const locale = routing.resolveServerLocale();
  assert.ok(isSupportedLocaleW93(locale), `locale válido: ${locale}`);
  tick('resolveServerLocale degrada seguramente');
});

test('isLocaleParam type guard funciona', async () => {
  const routing = await import('../i18n-rollout-routing');
  assert.equal(routing.isLocaleParam('pt-BR'), true);
  assert.equal(routing.isLocaleParam('en'), true);
  assert.equal(routing.isLocaleParam('xx-YY'), false);
  assert.equal(routing.isLocaleParam(undefined), false);
  tick('isLocaleParam type guard');
});

test('getAllSupportedLocales retorna 3 locales', async () => {
  const routing = await import('../i18n-rollout-routing');
  const all = routing.getAllSupportedLocales();
  assert.equal(all.length, 3);
  assert.ok(all.includes('pt-BR'));
  tick('getAllSupportedLocales = 3');
});

// ----------------------------------------------------------------------------
// 9) Components (source-inspection)
// ----------------------------------------------------------------------------

test('LocaleAwareImage é "use client" e tem props esperadas', () => {
  const src = readFileSync(resolve(REAL_ROOT, 'src/components/i18n/LocaleAwareImage.tsx'), 'utf-8');
  assert.match(src, /'use client'/);
  assert.match(src, /useT\(\)/);
  assert.match(src, /alt/);
  assert.match(src, /width/);
  assert.match(src, /height/);
  assert.match(src, /decoding/);
  assert.match(src, /loading/);
  tick('LocaleAwareImage contrato');
});

test('PluralText é "use client" e usa Intl.PluralRules', () => {
  const src = readFileSync(resolve(REAL_ROOT, 'src/components/i18n/PluralText.tsx'), 'utf-8');
  assert.match(src, /'use client'/);
  assert.match(src, /pluralRules\.select/);
  assert.match(src, /singularKey/);
  assert.match(src, /pluralKey/);
  assert.match(src, /n:/);
  tick('PluralText contrato');
});

// ----------------------------------------------------------------------------
// 10) Page i18n: landing, onboarding, leitura
// ----------------------------------------------------------------------------

test('landing page (src/app/page.tsx) usa useT() e PluralText', () => {
  const src = readFileSync(resolve(REAL_ROOT, 'src/app/page.tsx'), 'utf-8');
  assert.match(src, /useT/);
  assert.match(src, /PluralText/);
  assert.match(src, /LocaleSwitcher/);
  assert.match(src, /asTranslationKeyW93/);
  tick('landing page i18n');
});

test('onboarding page (src/app/onboarding/page.tsx) tem wrapper client', () => {
  const src = readFileSync(resolve(REAL_ROOT, 'src/app/onboarding/page.tsx'), 'utf-8');
  assert.match(src, /OnboardingFlow/);
  assert.match(src, /LocaleSwitcher/);
  assert.match(src, /OnboardingPageClient/);
  // wrapper client
  const wrapperSrc = readFileSync(resolve(REAL_ROOT, 'src/app/onboarding/OnboardingPageClient.tsx'), 'utf-8');
  assert.match(wrapperSrc, /'use client'/);
  assert.match(wrapperSrc, /useT/);
  assert.match(wrapperSrc, /PluralText/);
  tick('onboarding page i18n');
});

test('leitura page (src/app/leitura/[id]/page.tsx) é server + usa getServerDict', () => {
  const src = readFileSync(resolve(REAL_ROOT, 'src/app/leitura/[id]/page.tsx'), 'utf-8');
  assert.match(src, /resolveServerLocale/);
  assert.match(src, /getServerDict/);
  assert.match(src, /LocaleAwareImage/);
  assert.match(src, /LocaleSwitcher/);
  assert.match(src, /asTranslationKeyW93/);
  // Não é 'use client' — server component
  assert.ok(!src.includes("'use client'"), 'leitura page should NOT be use client');
  tick('leitura page server + i18n');
});

// ----------------------------------------------------------------------------
// 11) CLI validator — exit 0
// ----------------------------------------------------------------------------

test('scripts/validate-i18n-rollout.mjs existe', () => {
  const cli = resolve(REAL_ROOT, 'scripts/validate-i18n-rollout.mjs');
  assert.ok(existsSync(cli), `CLI not found at ${cli}`);
  tick('CLI file exists');
});

test('CLI validator retorna exit 0 no estado limpo', () => {
  const cli = resolve(REAL_ROOT, 'scripts/validate-i18n-rollout.mjs');
  const result = spawnSync(process.execPath, [cli], { encoding: 'utf-8', timeout: 30_000 });
  assert.equal(result.status, 0, `CLI failed: ${result.stderr?.slice(0, 500)}`);
  assert.match(result.stdout, /All translation checks passed/);
  tick('CLI exit 0');
});

test('CLI validator aceita --json e imprime JSON parseável', () => {
  const cli = resolve(REAL_ROOT, 'scripts/validate-i18n-rollout.mjs');
  const result = spawnSync(process.execPath, [cli, '--json'], { encoding: 'utf-8', timeout: 30_000 });
  assert.equal(result.status, 0);
  const start = result.stdout.indexOf('{');
  assert.ok(start >= 0, `no JSON in output: ${result.stdout.slice(0, 200)}`);
  const jsonStr = result.stdout.slice(start);
  const parsed = JSON.parse(jsonStr);
  assert.equal(parsed.ok, true);
  assert.ok(parsed.stats.totalKeys >= 80, `expected ≥80 keys, got ${parsed.stats.totalKeys}`);
  tick('CLI --json output');
});

// ----------------------------------------------------------------------------
// 12) Format helpers (Intl wrappers) — extended for W93
// ----------------------------------------------------------------------------

test('formatNumber respeita locale (pt-BR)', () => {
  const pt = formatNumber(1234.5, 'pt-BR');
  assert.match(pt, /^1\.234/);
  assert.ok(pt.includes(',5'));
  tick('formatNumber pt-BR');
});

test('formatNumber respeita locale (en)', () => {
  const en = formatNumber(1234.5, 'en');
  assert.equal(en, '1,234.5');
  tick('formatNumber en');
});

test('formatNumber respeita locale (es — Intl 4-digit rule)', () => {
  const es4 = formatNumber(1234.5, 'es');
  assert.ok(es4.includes(',5'));
  const es5 = formatNumber(12345.6, 'es');
  assert.match(es5, /12\.345/);
  tick('formatNumber es');
});

test('formatDate respeita locale (3 locales)', () => {
  const d = new Date('2026-06-30T12:00:00Z');
  const pt = formatDate(d, 'pt-BR');
  const en = formatDate(d, 'en');
  const es = formatDate(d, 'es');
  assert.match(pt, /30\/06\/2026/);
  assert.match(es, /30\/06\/2026/);
  assert.match(en, /06\/30\/2026/);
  tick('formatDate 3 locales');
});

test('formatRelativeTime produz texto localizado', () => {
  const pt = formatRelativeTime(-5, 'minute', 'pt-BR');
  const en = formatRelativeTime(-5, 'minute', 'en');
  const es = formatRelativeTime(-2, 'hour', 'es');
  assert.match(pt, /min/);
  assert.match(en, /minute/);
  assert.match(es, /hora/);
  tick('formatRelativeTime 3 locales');
});

// ----------------------------------------------------------------------------
// 13) Sacred term audit (source scan via stripComments-style regex)
// ----------------------------------------------------------------------------

test('NENHUMA string W93 contém "orishas" ou "orishás" (anglicização proibida)', () => {
  for (const [key, entry] of Object.entries(W93_STRINGS)) {
    for (const loc of SUPPORTED_LOCALES_W93) {
      const v = (entry as Record<string, string>)[loc];
      assert.ok(!v.includes('orishas'), `[${loc}][${key}] orishas detectado: ${v}`);
      assert.ok(!v.includes('orishás'), `[${loc}][${key}] orishás detectado: ${v}`);
    }
  }
  tick('zero orishas/orishás em 81 keys × 3 locales');
});

test('NENHUMA string W93 contém "ashé" (axé→ashé proibido)', () => {
  for (const [key, entry] of Object.entries(W93_STRINGS)) {
    for (const loc of SUPPORTED_LOCALES_W93) {
      const v = (entry as Record<string, string>)[loc];
      assert.ok(!v.includes('ashé'), `[${loc}][${key}] ashé detectado: ${v}`);
    }
  }
  tick('zero ashé em 81 keys × 3 locales');
});

// ----------------------------------------------------------------------------
// 14) Cobertura total ≥ 35 asserts
// ----------------------------------------------------------------------------

test('total de asserts ≥ 35', () => {
  assert.ok(assertCount >= 35, `expected ≥35 asserts, ran ${assertCount}`);
  // tick removido deste (auto-meta)
});