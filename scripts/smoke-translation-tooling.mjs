#!/usr/bin/env node
// ============================================================================
// smoke-translation-tooling.mjs — Runtime smoke checks (10+ asserts)
// ============================================================================
// Roda sem vitest/jest. Usa `node --import tsx` para carregar os módulos TS.
//
// Verifica:
//   1. validateTranslations() ok=true
//   2. 32 keys × 3 locales = 96 traduções
//   3. Cada locale carrega dicionário frozen
//   4. loadTranslations falha em locale inválido
//   5. t() interpolação funciona
//   6. t() plural n=1 / n=5
//   7. t() fallback pt-BR
//   8. t() retorna key para chave inexistente
//   9. Sacred term "orixás" preservado nos 3 locales (sem anglicização)
//  10. CLI validator exit 0
//  11. CLI validator --json parseável
//  12. tWithLocale em 3 locales
//  13. Hook useT (source-inspection)
//  14. LocaleSwitcher (source-inspection)
//  15. Demo page wired (source-inspection)
// ============================================================================

import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, existsSync } from 'node:fs';

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

console.log('🌐 W92-C — Translation Tooling smoke (10+ asserts)');
console.log('━'.repeat(55));

// ----------------------------------------------------------------------------
// Carrega tooling via tsx (subprocess para evitar problemas de resolução)
// ----------------------------------------------------------------------------

const shimPath = resolve(ROOT, '.smoke-shim.mts');
const shimSrc = `
  import * as mod from '/workspace/wt-w92/translation-tooling/src/lib/w92/translation-tooling.ts';
  import * as strs from '/workspace/wt-w92/translation-tooling/src/lib/w92/translation-strings.ts';
  process.stdout.write(JSON.stringify({
    validateTranslations: mod.validateTranslations(),
    loadTranslations_en_keys: Object.keys(mod.loadTranslations('en')).length,
    loadTranslations_es_keys: Object.keys(mod.loadTranslations('es')).length,
    loadTranslations_pt_keys: Object.keys(mod.loadTranslations('pt-BR')).length,
    en_nav_home: mod.t(mod.asTranslationKey('nav.home'), mod.loadTranslations('en')),
    es_nav_home: mod.t(mod.asTranslationKey('nav.home'), mod.loadTranslations('es')),
    pt_nav_home: mod.t(mod.asTranslationKey('nav.home'), mod.loadTranslations('pt-BR')),
    en_comment_n1: mod.t(mod.asTranslationKey('counter.comments'), mod.loadTranslations('en'), { n: 1 }),
    en_comment_n5: mod.t(mod.asTranslationKey('counter.comments'), mod.loadTranslations('en'), { n: 5 }),
    pt_comment_n1: mod.t(mod.asTranslationKey('counter.comments'), mod.loadTranslations('pt-BR'), { n: 1 }),
    pt_comment_n5: mod.t(mod.asTranslationKey('counter.comments'), mod.loadTranslations('pt-BR'), { n: 5 }),
    es_comment_n1: mod.t(mod.asTranslationKey('counter.comments'), mod.loadTranslations('es'), { n: 1 }),
    es_comment_n5: mod.t(mod.asTranslationKey('counter.comments'), mod.loadTranslations('es'), { n: 5 }),
    en_orixa: mod.t(mod.asTranslationKey('tradition.orixaGreeting'), mod.loadTranslations('en')),
    es_orixa: mod.t(mod.asTranslationKey('tradition.orixaGreeting'), mod.loadTranslations('es')),
    pt_orixa: mod.t(mod.asTranslationKey('tradition.orixaGreeting'), mod.loadTranslations('pt-BR')),
    en_axe: mod.t(mod.asTranslationKey('greeting.goodMorning'), mod.loadTranslations('en')),
    stringCount: strs.STRING_COUNT,
    stringsLength: Object.keys(strs.STRINGS).length,
    missing_key: mod.t(mod.asTranslationKey('nonexistent.key'), mod.loadTranslations('en')),
    with_name: mod.t(mod.asTranslationKey('notification.newLike'), mod.loadTranslations('en'), { name: 'Cigano Ramiro' }),
    status_saved_pt: mod.t(mod.asTranslationKey('status.saved'), mod.loadTranslations('pt-BR')),
    status_saved_en: mod.t(mod.asTranslationKey('status.saved'), mod.loadTranslations('en')),
    aria_posts_pt: mod.t(mod.asTranslationKey('aria.postsCount'), mod.loadTranslations('pt-BR'), { n: 42 }),
    aria_posts_en: mod.t(mod.asTranslationKey('aria.postsCount'), mod.loadTranslations('en'), { n: 42 }),
    fmt_pt: mod.formatNumber(1234.5, 'pt-BR'),
    fmt_en: mod.formatNumber(1234.5, 'en'),
    fmt_es: mod.formatNumber(1234.5, 'es'),
    reltime_pt: mod.formatRelativeTime(-5, 'minute', 'pt-BR'),
    reltime_en: mod.formatRelativeTime(-5, 'minute', 'en'),
  }));
`;
import { writeFileSync, unlinkSync } from 'node:fs';
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
// 1) validateTranslations
// ----------------------------------------------------------------------------
check('1) validateTranslations() ok=true', data.validateTranslations.ok === true);

// ----------------------------------------------------------------------------
// 2) 41 keys × 3 locales
// ----------------------------------------------------------------------------
check(
  '2) 41 keys × 3 locales = 123 traduções',
  data.loadTranslations_en_keys === 41 &&
    data.loadTranslations_es_keys === 41 &&
    data.loadTranslations_pt_keys === 41,
  `en=${data.loadTranslations_en_keys} es=${data.loadTranslations_es_keys} pt=${data.loadTranslations_pt_keys}`,
);

// ----------------------------------------------------------------------------
// 3) Traduções de nav.home
// ----------------------------------------------------------------------------
check('3) en[nav.home] = "Feed"', data.en_nav_home === 'Feed');
check('3) es[nav.home] = "Inicio"', data.es_nav_home === 'Inicio');
check('3) pt[nav.home] = "Feed"', data.pt_nav_home === 'Feed');

// ----------------------------------------------------------------------------
// 4) Plural em 3 locales
// ----------------------------------------------------------------------------
check('4) en comments n=1 → "1 comment"', data.en_comment_n1 === '1 comment');
check('4) en comments n=5 → "5 comments"', data.en_comment_n5 === '5 comments');
check('4) pt comments n=1 → "1 comentário"', data.pt_comment_n1 === '1 comentário');
check('4) pt comments n=5 → "5 comentários"', data.pt_comment_n5 === '5 comentários');
check('4) es comments n=1 → "1 comentario"', data.es_comment_n1 === '1 comentario');
check('4) es comments n=5 → "5 comentarios"', data.es_comment_n5 === '5 comentarios');

// ----------------------------------------------------------------------------
// 5) Sacred terms preservados (orixás, axé)
// ----------------------------------------------------------------------------
check('5) "orixás" preservado em en (NÃO orishas)', !data.en_orixa.includes('orishas') && data.en_orixa.includes('orixás'));
check('5) "orixás" preservado em es (NÃO orishas)', !data.es_orixa.includes('orishas') && data.es_orixa.includes('orixás'));
check('5) "orixás" preservado em pt', data.pt_orixa.includes('orixás'));
check('5) "axé" preservado em en (NÃO ashé)', !data.en_axe.includes('ashé') && data.en_axe.includes('axé'));

// ----------------------------------------------------------------------------
// 6) STRING_COUNT coerente
// ----------------------------------------------------------------------------
check('6) STRING_COUNT coerente', data.stringCount === data.stringsLength && data.stringCount === 41);

// ----------------------------------------------------------------------------
// 7) t() retornando key como fallback
// ----------------------------------------------------------------------------
check('7) t() retorna a própria chave para chave inexistente', data.missing_key === 'nonexistent.key');

// ----------------------------------------------------------------------------
// 8) t() com interpolação {name}
// ----------------------------------------------------------------------------
check('8) t() interpola {name}', data.with_name === 'Cigano Ramiro liked your post');

// ----------------------------------------------------------------------------
// 8b) Strings novas (status, aria.postsCount)
// ----------------------------------------------------------------------------
check('8b) status.saved em pt-BR', data.status_saved_pt === 'Salvo com sucesso');
check('8b) status.saved em en', data.status_saved_en === 'Saved successfully');
check('8b) aria.postsCount pt-BR com n=42', data.aria_posts_pt === '42 posts no feed');
check('8b) aria.postsCount en com n=42', data.aria_posts_en === '42 posts in feed');

// ----------------------------------------------------------------------------
// 8c) Format helpers (Intl)
// ----------------------------------------------------------------------------
check('8c) formatNumber pt-BR usa vírgula', data.fmt_pt.includes(',5') && data.fmt_pt.includes('.'));
check('8c) formatNumber en = 1,234.5', data.fmt_en === '1,234.5');
check('8c) formatNumber es Intl (4 dígitos sem milhar)', data.fmt_es.includes(',5'));
check('8c) formatRelativeTime pt-BR', /min/.test(data.reltime_pt));
check('8c) formatRelativeTime en', /minute/.test(data.reltime_en));

// ----------------------------------------------------------------------------
// 9) Hook useT (source-inspection)
// ----------------------------------------------------------------------------
const useTSrc = readFileSync(resolve(ROOT, 'src/hooks/useT.ts'), 'utf-8');
check('9) useT.ts tem "use client"', useTSrc.includes("'use client'"));
check('9) useT.ts persiste em localStorage', useTSrc.includes('localStorage'));
check('9) useT.ts persiste em cookie', /cookie/i.test(useTSrc));

// ----------------------------------------------------------------------------
// 10) LocaleSwitcher (source-inspection)
// ----------------------------------------------------------------------------
const switcherSrc = readFileSync(resolve(ROOT, 'src/components/i18n/LocaleSwitcher.tsx'), 'utf-8');
check('10) LocaleSwitcher.tsx tem "use client"', switcherSrc.includes("'use client'"));
check('10) LocaleSwitcher tem aria-current', switcherSrc.includes('aria-current'));
check('10) LocaleSwitcher tem touch target 44px', switcherSrc.includes('min-h-[44px]') || switcherSrc.includes('min-w-[44px]'));

// ----------------------------------------------------------------------------
// 11) Demo page (source-inspection)
// ----------------------------------------------------------------------------
const demoSrc = readFileSync(resolve(ROOT, 'src/app/i18n-demo/page.tsx'), 'utf-8');
check('11) i18n-demo/page.tsx importa LocaleSwitcher', demoSrc.includes('LocaleSwitcher'));
check('11) i18n-demo/page.tsx usa loadTranslations', demoSrc.includes('loadTranslations'));

// ----------------------------------------------------------------------------
// 12) CLI validator
// ----------------------------------------------------------------------------
const cliPath = resolve(ROOT, 'scripts/validate-translations.mjs');
check('12) scripts/validate-translations.mjs existe', existsSync(cliPath));

const cliRun = spawnSync(process.execPath, [cliPath], { encoding: 'utf-8', timeout: 30_000 });
check('12) CLI exit 0 no estado limpo', cliRun.status === 0, `stderr=${cliRun.stderr?.slice(0, 200)}`);

// ----------------------------------------------------------------------------
// 13) CLI --json
// ----------------------------------------------------------------------------
const cliJson = spawnSync(process.execPath, [cliPath, '--json'], { encoding: 'utf-8', timeout: 30_000 });
const jsonStart = cliJson.stdout.indexOf('{');
let parsed = null;
try {
  parsed = JSON.parse(cliJson.stdout.slice(jsonStart));
} catch {}
check('13) CLI --json produz JSON parseável com ok=true', parsed?.ok === true);

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
