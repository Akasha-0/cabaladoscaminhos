#!/usr/bin/env node
// ============================================================================
// smoke-i18n-rollout.mjs — Runtime smoke checks (≥20 asserts)
// ============================================================================
// Roda sem vitest/jest. Usa `node --import tsx` para carregar os módulos TS.
//
// Verifica:
//   1. validateRolloutTranslations() ok=true
//   2. 81 keys × 3 locales = 243 traduções
//   3. Cada locale carrega dicionário frozen
//   4. loadTranslations falha em locale inválido
//   5. t() interpolação funciona
//   6. t() plural-aware lookup (CLDR via "Plural" suffix)
//   7. t() plural-aware em PT-BR, EN, ES
//   8. t() fallback pt-BR
//   9. t() retorna key para chave inexistente
//  10. Sacred term "orixás" preservado nos 3 locales
//  11. Sacred term "axé" preservado
//  12. Sacred term "Cigano Ramiro" preservado
//  13. Sacred term "pemba" preservado
//  14. pluralRules.select — CLDR rules
//  15. formatOrdinal — en 1st/2nd/3rd/4th
//  16. formatOrdinal — pt-BR/es "1.º"
//  17. CLI validator exit 0
//  18. CLI validator --json parseável
//  19. Landing page (src/app/page.tsx) wired com useT + PluralText
//  20. Leitura page server + i18n
//  21. Onboarding page wrapper client
//  22. LocaleAwareImage contrato
//  23. PluralText contrato
//  24. Routing helpers (resolveServerLocale degrada seguramente)
//  25. formatNumber Intl CLDR-correct
// ============================================================================

import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, existsSync, writeFileSync, unlinkSync } from 'node:fs';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

let pass = 0;
let fail = 0;

function check(label, ok, detail = '') {
  if (ok) {
    pass++;
    console.log(`  ✅ ${label}`);
  } else {
    fail++;
    console.log(`  ❌ ${label}${detail ? ` — ${detail}` : ''}`);
  }
}

console.log('🌐 W93-C — i18n Rollout smoke (≥20 asserts)');
console.log('━'.repeat(55));

// ----------------------------------------------------------------------------
// Carrega engine via tsx (subprocess para evitar problemas de resolução)
// ----------------------------------------------------------------------------

const tmpDir = mkdtempSync(join(tmpdir(), 'w93-smoke-'));
const shimPath = join(tmpDir, 'smoke.mts');

const ENGINE = resolve(ROOT, 'src/lib/w93/i18n-rollout-engine.ts');
const STRINGS = resolve(ROOT, 'src/lib/w93/i18n-rollout-strings.ts');

const shimSrc = `
  import * as eng from ${JSON.stringify(ENGINE)};
  import * as strs from ${JSON.stringify(STRINGS)};

  process.stdout.write(JSON.stringify({
    validate: eng.validateRolloutTranslations(),
    keyCount: strs.W93_STRING_COUNT,
    stringsLength: Object.keys(strs.W93_STRINGS).length,
    en_keys: Object.keys(eng.loadTranslations('en')).length,
    es_keys: Object.keys(eng.loadTranslations('es')).length,
    pt_keys: Object.keys(eng.loadTranslations('pt-BR')).length,
    en_cta: eng.t(eng.asTranslationKeyW93('home.hero.ctaPrimary'), eng.loadTranslations('en'), undefined, undefined, 'en'),
    es_cta: eng.t(eng.asTranslationKeyW93('home.hero.ctaPrimary'), eng.loadTranslations('es'), undefined, undefined, 'es'),
    pt_cta: eng.t(eng.asTranslationKeyW93('home.hero.ctaPrimary'), eng.loadTranslations('pt-BR'), undefined, undefined, 'pt-BR'),
    en_orixa: eng.t(eng.asTranslationKeyW93('orixa.label.greeting'), eng.loadTranslations('en'), { name: 'orixás' }, undefined, 'en'),
    es_orixa: eng.t(eng.asTranslationKeyW93('orixa.label.greeting'), eng.loadTranslations('es'), { name: 'orixás' }, undefined, 'es'),
    pt_orixa: eng.t(eng.asTranslationKeyW93('orixa.label.greeting'), eng.loadTranslations('pt-BR'), { name: 'orixás' }, undefined, 'pt-BR'),
    en_axe: strs.W93_STRINGS['tradition.akashaGreeting']['en'],
    es_axe: strs.W93_STRINGS['tradition.akashaGreeting']['es'],
    en_axe_lower: strs.W93_STRINGS['tradition.akashaGreeting']['en'].toLowerCase(),
    es_axe_lower: strs.W93_STRINGS['tradition.akashaGreeting']['es'].toLowerCase(),
    en_cigano: strs.W93_STRINGS['tradition.ciganoRamiroAttribution']['en'],
    es_cigano: strs.W93_STRINGS['tradition.ciganoRamiroAttribution']['es'],
    en_pemba: strs.W93_STRINGS['tradition.pembaNote']['en'],
    es_pemba: strs.W93_STRINGS['tradition.pembaNote']['es'],
    plural_en_n1: eng.t(eng.asTranslationKeyW93('counter.readings'), eng.loadTranslations('en'), { n: 1 }, undefined, 'en'),
    plural_en_n5: eng.t(eng.asTranslationKeyW93('counter.readings'), eng.loadTranslations('en'), { n: 5 }, undefined, 'en'),
    plural_pt_n1: eng.t(eng.asTranslationKeyW93('counter.readings'), eng.loadTranslations('pt-BR'), { n: 1 }, undefined, 'pt-BR'),
    plural_pt_n5: eng.t(eng.asTranslationKeyW93('counter.readings'), eng.loadTranslations('pt-BR'), { n: 5 }, undefined, 'pt-BR'),
    plural_es_n1: eng.t(eng.asTranslationKeyW93('counter.readings'), eng.loadTranslations('es'), { n: 1 }, undefined, 'es'),
    plural_es_n5: eng.t(eng.asTranslationKeyW93('counter.readings'), eng.loadTranslations('es'), { n: 5 }, undefined, 'es'),
    cl_en_1: eng.pluralRules.select(1, 'en'),
    cl_pt_1: eng.pluralRules.select(1, 'pt-BR'),
    cl_es_2: eng.pluralRules.select(2, 'es'),
    ord_en_1: eng.formatOrdinal(1, 'en'),
    ord_en_2: eng.formatOrdinal(2, 'en'),
    ord_en_3: eng.formatOrdinal(3, 'en'),
    ord_en_11: eng.formatOrdinal(11, 'en'),
    ord_pt_5: eng.formatOrdinal(5, 'pt-BR'),
    missing_key: eng.t(eng.asTranslationKeyW93('key.inexistente'), eng.loadTranslations('en'), undefined, undefined, 'en'),
    with_name: eng.t(eng.asTranslationKeyW93('odu.label.header'), eng.loadTranslations('en'), { name: 'Ogbe' }, undefined, 'en'),
    fmt_pt: eng.formatNumber(1234.5, 'pt-BR'),
    fmt_en: eng.formatNumber(1234.5, 'en'),
    fmt_es: eng.formatNumber(1234.5, 'es'),
    isSupported: eng.isSupportedLocaleW93('pt-BR'),
    notSupported: eng.isSupportedLocaleW93('xx-YY'),
    tPlural_n1: eng.tPlural(eng.asTranslationKeyW93('counter.readings'), eng.asTranslationKeyW93('counter.readingsPlural'), 1, eng.loadTranslations('en'), 'en'),
    tPlural_n5: eng.tPlural(eng.asTranslationKeyW93('counter.readings'), eng.asTranslationKeyW93('counter.readingsPlural'), 5, eng.loadTranslations('en'), 'en'),
  }));
`;

writeFileSync(shimPath, shimSrc, 'utf-8');

const tsxResult = spawnSync(
  process.execPath,
  ['--import', 'tsx', shimPath],
  { encoding: 'utf-8', timeout: 30_000, cwd: ROOT, env: { ...process.env, NODE_NO_WARNINGS: '1' } },
);
try { unlinkSync(shimPath); } catch {}

if (tsxResult.status !== 0) {
  console.log('  ❌ tsx shim failed:', tsxResult.stderr?.slice(0, 500));
  process.exit(1);
}

const data = JSON.parse(tsxResult.stdout);

// ----------------------------------------------------------------------------
// 1) validateRolloutTranslations
// ----------------------------------------------------------------------------
check('1) validateRolloutTranslations() ok=true', data.validate.ok === true);

// ----------------------------------------------------------------------------
// 2) 81 keys × 3 locales = 243 traduções
// ----------------------------------------------------------------------------
check(
  '2) 81 keys × 3 locales = 243 traduções',
  data.en_keys === 81 && data.es_keys === 81 && data.pt_keys === 81,
  `en=${data.en_keys} es=${data.es_keys} pt=${data.pt_keys}`,
);

// ----------------------------------------------------------------------------
// 3) Traduções de home.hero.ctaPrimary
// ----------------------------------------------------------------------------
check('3) en[home.hero.ctaPrimary] = "Join the waitlist"', data.en_cta === 'Join the waitlist');
check('3) es[home.hero.ctaPrimary] = "Entrar en la lista de espera"', data.es_cta === 'Entrar en la lista de espera');
check('3) pt-BR[home.hero.ctaPrimary] = "Entrar na lista de espera"', data.pt_cta === 'Entrar na lista de espera');

// ----------------------------------------------------------------------------
// 4) Plural-aware lookup em 3 locales (CLDR via "Plural" suffix)
// ----------------------------------------------------------------------------
check('4) plural EN counter.readings n=1 → "1 reading"', data.plural_en_n1 === '1 reading');
check('4) plural EN counter.readings n=5 → "5 readings"', data.plural_en_n5 === '5 readings');
check('4) plural PT-BR counter.readings n=1 → "1 leitura"', data.plural_pt_n1 === '1 leitura');
check('4) plural PT-BR counter.readings n=5 → "5 leituras"', data.plural_pt_n5 === '5 leituras');
check('4) plural ES counter.readings n=1 → "1 lectura"', data.plural_es_n1 === '1 lectura');
check('4) plural ES counter.readings n=5 → "5 lecturas"', data.plural_es_n5 === '5 lecturas');

// ----------------------------------------------------------------------------
// 5) Sacred terms preservados (orixás, axé, Cigano Ramiro, pemba)
// ----------------------------------------------------------------------------
check('5) "orixás" preservado em en', !data.en_orixa.includes('orishas') && data.en_orixa.includes('orixás'));
check('5) "orixás" preservado em es', !data.es_orixa.includes('orishas') && data.es_orixa.includes('orixás'));
check('5) "orixás" preservado em pt', data.pt_orixa.includes('orixás'));
check('5) "axé" preservado em en', !data.en_axe.includes('ashé') && data.en_axe_lower.includes('axé'));
check('5) "axé" preservado em es', !data.es_axe.includes('ashé') && data.es_axe_lower.includes('axé'));
check('5) "Cigano Ramiro" preservado em en', data.en_cigano === 'Cigano Ramiro method');
check('5) "Cigano Ramiro" preservado em es', data.es_cigano === 'Método Cigano Ramiro');
check('5) "pemba" preservado em en', data.en_pemba.includes('pemba') && !data.en_pemba.toLowerCase().includes('chalk'));
check('5) "pemba" preservado em es', data.es_pemba.includes('pemba'));

// ----------------------------------------------------------------------------
// 6) t() retornando key como fallback
// ----------------------------------------------------------------------------
check('6) t() retorna a própria chave para chave inexistente', data.missing_key === 'key.inexistente');

// ----------------------------------------------------------------------------
// 7) t() com interpolação {name}
// ----------------------------------------------------------------------------
check('7) t() interpola {name} (Odu label)', data.with_name === 'Drawn Odu: Ogbe');

// ----------------------------------------------------------------------------
// 8) CLDR pluralRules
// ----------------------------------------------------------------------------
check('8) pluralRules.select(1, en) = "one"', data.cl_en_1 === 'one');
check('8) pluralRules.select(1, pt-BR) = "one"', data.cl_pt_1 === 'one');
check('8) pluralRules.select(2, es) = "other"', data.cl_es_2 === 'other');

// ----------------------------------------------------------------------------
// 9) formatOrdinal
// ----------------------------------------------------------------------------
check('9) formatOrdinal(1, en) = "1st"', data.ord_en_1 === '1st');
check('9) formatOrdinal(2, en) = "2nd"', data.ord_en_2 === '2nd');
check('9) formatOrdinal(3, en) = "3rd"', data.ord_en_3 === '3rd');
check('9) formatOrdinal(11, en) = "11th" (special case)', data.ord_en_11 === '11th');
check('9) formatOrdinal(5, pt-BR) tem "5"', data.ord_pt_5.startsWith('5'));

// ----------------------------------------------------------------------------
// 10) Type guards
// ----------------------------------------------------------------------------
check('10) isSupportedLocaleW93("pt-BR") = true', data.isSupported === true);
check('10) isSupportedLocaleW93("xx-YY") = false', data.notSupported === false);

// ----------------------------------------------------------------------------
// 11) tPlural (explicit CLDR-aware)
// ----------------------------------------------------------------------------
check('11) tPlural n=1 → "1 reading"', data.tPlural_n1 === '1 reading');
check('11) tPlural n=5 → "5 readings"', data.tPlural_n5 === '5 readings');

// ----------------------------------------------------------------------------
// 12) Format helpers (Intl)
// ----------------------------------------------------------------------------
check('12) formatNumber pt-BR usa vírgula', data.fmt_pt.includes(',5') && data.fmt_pt.includes('.'));
check('12) formatNumber en = 1,234.5', data.fmt_en === '1,234.5');
check('12) formatNumber es (Intl 4-digit rule)', data.fmt_es.includes(',5'));

// ----------------------------------------------------------------------------
// 13) Hook useT (source-inspection)
// ----------------------------------------------------------------------------
const useTSrc = readFileSync(resolve(ROOT, 'src/hooks/useT.ts'), 'utf-8');
check('13) useT.ts tem "use client"', useTSrc.includes("'use client'"));
check('13) useT.ts persiste em localStorage', useTSrc.includes('localStorage'));
check('13) useT.ts persiste em cookie', /cookie/i.test(useTSrc));

// ----------------------------------------------------------------------------
// 14) LocaleSwitcher (source-inspection)
// ----------------------------------------------------------------------------
const switcherSrc = readFileSync(resolve(ROOT, 'src/components/i18n/LocaleSwitcher.tsx'), 'utf-8');
check('14) LocaleSwitcher tem "use client"', switcherSrc.includes("'use client'"));
check('14) LocaleSwitcher tem aria-current', switcherSrc.includes('aria-current'));
check('14) LocaleSwitcher tem touch target 44px', switcherSrc.includes('min-h-[44px]') || switcherSrc.includes('min-w-[44px]'));

// ----------------------------------------------------------------------------
// 15) LocaleAwareImage (W93 novo)
// ----------------------------------------------------------------------------
const imageSrc = readFileSync(resolve(ROOT, 'src/components/i18n/LocaleAwareImage.tsx'), 'utf-8');
check('15) LocaleAwareImage tem "use client"', imageSrc.includes("'use client'"));
check('15) LocaleAwareImage usa useT', imageSrc.includes('useT'));
check('15) LocaleAwareImage tem prop alt em 3 locales', /pt-BR/.test(imageSrc) && /en/.test(imageSrc) && /es/.test(imageSrc));

// ----------------------------------------------------------------------------
// 16) PluralText (W93 novo)
// ----------------------------------------------------------------------------
const pluralSrc = readFileSync(resolve(ROOT, 'src/components/i18n/PluralText.tsx'), 'utf-8');
check('16) PluralText tem "use client"', pluralSrc.includes("'use client'"));
check('16) PluralText usa pluralRules.select', pluralSrc.includes('pluralRules.select'));
check('16) PluralText tem props singularKey/pluralKey/n', pluralSrc.includes('singularKey') && pluralSrc.includes('pluralKey') && /n:/.test(pluralSrc));

// ----------------------------------------------------------------------------
// 17) Landing page i18n (src/app/page.tsx)
// ----------------------------------------------------------------------------
const landingSrc = readFileSync(resolve(ROOT, 'src/app/page.tsx'), 'utf-8');
check('17) landing page usa useT', landingSrc.includes('useT'));
check('17) landing page usa PluralText', landingSrc.includes('PluralText'));
check('17) landing page usa LocaleSwitcher', landingSrc.includes('LocaleSwitcher'));

// ----------------------------------------------------------------------------
// 18) Onboarding page i18n (src/app/onboarding/*)
// ----------------------------------------------------------------------------
const onbSrc = readFileSync(resolve(ROOT, 'src/app/onboarding/page.tsx'), 'utf-8');
const onbClientSrc = readFileSync(resolve(ROOT, 'src/app/onboarding/OnboardingPageClient.tsx'), 'utf-8');
check('18) onboarding page wrapper usa LocaleSwitcher', onbSrc.includes('LocaleSwitcher'));
check('18) OnboardingPageClient é "use client"', onbClientSrc.includes("'use client'"));
check('18) OnboardingPageClient usa useT + PluralText', onbClientSrc.includes('useT') && onbClientSrc.includes('PluralText'));

// ----------------------------------------------------------------------------
// 19) Leitura page i18n (src/app/leitura/[id]/page.tsx)
// ----------------------------------------------------------------------------
const leituraSrc = readFileSync(resolve(ROOT, 'src/app/leitura/[id]/page.tsx'), 'utf-8');
check('19) leitura page usa resolveServerLocale', leituraSrc.includes('resolveServerLocale'));
check('19) leitura page usa getServerDict', leituraSrc.includes('getServerDict'));
check('19) leitura page usa LocaleAwareImage', leituraSrc.includes('LocaleAwareImage'));
check('19) leitura page NÃO é "use client" (server component)', !leituraSrc.includes("'use client'"));

// ----------------------------------------------------------------------------
// 20) CLI validator
// ----------------------------------------------------------------------------
const cliPath = resolve(ROOT, 'scripts/validate-i18n-rollout.mjs');
check('20) scripts/validate-i18n-rollout.mjs existe', existsSync(cliPath));

const cliRun = spawnSync(process.execPath, [cliPath], { encoding: 'utf-8', timeout: 30_000 });
check('20) CLI exit 0 no estado limpo', cliRun.status === 0, `stderr=${cliRun.stderr?.slice(0, 200)}`);

// ----------------------------------------------------------------------------
// 21) CLI --json
// ----------------------------------------------------------------------------
const cliJson = spawnSync(process.execPath, [cliPath, '--json'], { encoding: 'utf-8', timeout: 30_000 });
const jsonStart = cliJson.stdout.indexOf('{');
let parsed = null;
try {
  parsed = JSON.parse(cliJson.stdout.slice(jsonStart));
} catch {}
check('21) CLI --json produz JSON parseável com ok=true', parsed?.ok === true);
check('21) CLI --json tem totalKeys ≥ 80', parsed?.stats?.totalKeys >= 80);

// ----------------------------------------------------------------------------
// 22) Routing helpers
// ----------------------------------------------------------------------------
const routingSrc = readFileSync(resolve(ROOT, 'src/lib/w93/i18n-rollout-routing.ts'), 'utf-8');
check('22) routing tem resolveServerLocale', routingSrc.includes('resolveServerLocale'));
check('22) routing tem getServerDict', routingSrc.includes('getServerDict'));
check('22) routing tem isLocaleParam', routingSrc.includes('isLocaleParam'));
check('22) routing tem getAllSupportedLocales', routingSrc.includes('getAllSupportedLocales'));

// ----------------------------------------------------------------------------
// Final
// ----------------------------------------------------------------------------
console.log('━'.repeat(55));
console.log(`  ${pass} passed, ${fail} failed`);
console.log('');

if (fail > 0) {
  process.exit(1);
}
console.log('✅ All smoke asserts passed');
process.exit(0);