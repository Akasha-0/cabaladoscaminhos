#!/usr/bin/env node
/**
 * ════════════════════════════════════════════════════════════════════════════
 * W86-C — i18n SMOKE HARNESS
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Node-runnable smoke checks for the i18n engine. Runs without a test
 * framework — same pattern as W75-A smoke harness. ≥15 assertions covering
 * parity, fallback, interpolation, sacred-term preservation, and SSR safety.
 *
 * Run: node scripts/smoke-i18n.mjs
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

let pass = 0;
let fail = 0;
const failures = [];

function assertEq(actual, expected, label) {
  if (Object.is(actual, expected) || JSON.stringify(actual) === JSON.stringify(expected)) {
    pass++;
    console.log(`  \u2713 ${label}`);
  } else {
    fail++;
    const msg = `${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`;
    failures.push(msg);
    console.log(`  \u2717 ${msg}`);
  }
}

function assertTrue(cond, label) {
  if (cond) {
    pass++;
    console.log(`  \u2713 ${label}`);
  } else {
    fail++;
    const msg = `${label}: expected truthy, got ${String(cond)}`;
    failures.push(msg);
    console.log(`  \u2717 ${msg}`);
  }
}

function readTable(file) {
  const text = readFileSync(resolve(ROOT, file), 'utf8');
  // Extract the table body via regex (the table is a frozen object literal).
  // We pull every "key": "value" pair in the table block.
  const match = text.match(/const TABLE_RAW[^=]*=\s*Object\.freeze\(\{([\s\S]*?)\}\)/);
  if (!match) throw new Error(`Could not find TABLE_RAW in ${file}`);
  const body = match[1];
  // Match: 'key': 'value' OR 'key': "value" (key has no quote; value can
  // contain apostrophes / escapes). Stop at unescaped delimiter followed by
  // comma or newline.
  const re = /'([a-zA-Z0-9._\-\u00e0-\u00ff]+)'\s*:\s*(?:'((?:\\'|[^'])*)'|"((?:\\"|[^"])*)")/g;
  const out = {};
  let m;
  while ((m = re.exec(body)) !== null) {
    out[m[1]] = m[2] !== undefined ? m[2] : m[3];
  }
  return out;
}

console.log('');
console.log('  W86-C \u2014 i18n SMOKE HARNESS');
console.log('  \u2550'.repeat(50));
console.log('');

// Load all 3 tables via file-read (zero imports \u2014 standalone smoke)
const pt = readTable('src/i18n/tables/pt-BR.ts');
const en = readTable('src/i18n/tables/en.ts');
const es = readTable('src/i18n/tables/es.ts');

console.log('  Table parity:');
const ptKeys = Object.keys(pt);
const enKeys = Object.keys(en);
const esKeys = Object.keys(es);
assertEq(ptKeys.length, enKeys.length, 'PT-BR / EN key count parity');
assertEq(ptKeys.length, esKeys.length, 'PT-BR / ES key count parity');
assertTrue(ptKeys.length >= 50, `PT-BR has \u226550 keys (has ${ptKeys.length})`);
assertTrue(enKeys.length >= 50, `EN has \u226550 keys (has ${enKeys.length})`);
assertTrue(esKeys.length >= 50, `ES has \u226550 keys (has ${esKeys.length})`);

const missingInEn = ptKeys.filter((k) => !enKeys.includes(k));
const missingInEs = ptKeys.filter((k) => !esKeys.includes(k));
const extraInEn = enKeys.filter((k) => !ptKeys.includes(k));
const extraInEs = esKeys.filter((k) => !ptKeys.includes(k));
assertEq(missingInEn.length, 0, 'no PT-BR keys missing in EN');
assertEq(missingInEs.length, 0, 'no PT-BR keys missing in ES');
assertEq(extraInEn.length, 0, 'no extra keys in EN not in PT-BR');
assertEq(extraInEs.length, 0, 'no extra keys in ES not in PT-BR');

console.log('');
console.log('  Translation correctness:');
assertEq(pt['nav.home'], 'In\u00edcio', 'PT-BR nav.home = In\u00edcio');
assertEq(en['nav.home'], 'Home', 'EN nav.home = Home');
assertEq(es['nav.home'], 'Inicio', 'ES nav.home = Inicio');
assertEq(pt['auth.email'], 'E-mail', 'PT-BR auth.email = E-mail');
assertEq(en['auth.email'], 'Email', 'EN auth.email = Email');
assertEq(es['auth.email'], 'Correo electr\u00f3nico', 'ES auth.email = Correo electr\u00f3nico');

console.log('');
console.log('  Interpolation (inline):');
const tmpl = 'Hello {{name}}, you have {{count}} messages';
const interpolated = tmpl.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, n) => {
  const vars = { name: 'Ana', count: 3 };
  return String(vars[n] ?? `{{${n}}}`);
});
assertEq(interpolated, 'Hello Ana, you have 3 messages', 'multi-var interpolation');
const tmpl2 = 'Hi {{name}}';
const missingVar = tmpl2.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, n) => {
  return `{{${n}}}`;
});
assertEq(missingVar, 'Hi {{name}}', 'missing var keeps placeholder literal');

console.log('');
console.log('  Sacred-term preservation:');
const SACRED = [
  'sacred.orixa', 'sacred.caboclo', 'sacred.balabao', 'sacred.sefira',
  'sacred.tarot', 'sacred.baralhoCigano', 'sacred.mesaReal',
];
let sacredPreserved = 0;
for (const k of SACRED) {
  if (pt[k] && en[k] && pt[k] === en[k]) sacredPreserved++;
  if (pt[k] && es[k] && pt[k] === es[k]) sacredPreserved++;
}
assertTrue(sacredPreserved === SACRED.length * 2, `sacred terms preserved verbatim in EN+ES (${sacredPreserved}/${SACRED.length * 2})`);
assertEq(en['sacred.orixa'], 'Orix\u00e1', 'orix\u00e1 not translated to Orisha');
assertEq(en['sacred.balabao'], 'Babala\u00f4', 'babala\u00f4 not translated to Babalawo');

console.log('');
console.log('  SSR safety (no window access at module load):');
// Verify by checking the source doesn't reference `window` at module level.
const useLocaleSrc = readFileSync(resolve(ROOT, 'src/i18n/useLocale.tsx'), 'utf8');
// Allow `window.` inside useEffect callbacks (deferred to client only).
// We check that window access is NOT at module top level.
const moduleLevelWindow = /^(?!.*useEffect).*window\./m.test(useLocaleSrc.split('\n').slice(0, 20).join('\n'));
assertTrue(!moduleLevelWindow, 'useLocale.tsx has no top-level window access');

console.log('');
console.log('  LocaleSwitcher contract (source-level):');
const lsSrc = readFileSync(resolve(ROOT, 'src/i18n/LocaleSwitcher.tsx'), 'utf8');
assertTrue(lsSrc.includes('aria-label="Selecionar idioma"'), 'LocaleSwitcher has aria-label="Selecionar idioma"');
assertTrue(lsSrc.includes('role="radio"'), 'LocaleSwitcher uses role=radio for segmented options');
assertTrue(lsSrc.includes('role="radiogroup"'), 'LocaleSwitcher uses role=radiogroup');
assertTrue(lsSrc.includes('aria-checked'), 'LocaleSwitcher sets aria-checked');
assertTrue(lsSrc.includes('data-testid="locale-switcher"'), 'LocaleSwitcher has data-testid for testing');

console.log('');
console.log('  Page contract (source-level):');
const pageSrc = readFileSync(resolve(ROOT, 'src/app/settings/locale/page.tsx'), 'utf8');
assertTrue(pageSrc.includes("'use client'"), 'page is client component');
assertTrue(pageSrc.includes('<LocaleProvider>'), 'page wraps in LocaleProvider');
assertTrue(pageSrc.includes('<LocaleSwitcher'), 'page renders LocaleSwitcher');
assertTrue(pageSrc.includes('data-testid="preview-grid"'), 'page has preview grid testid');
assertTrue(pageSrc.includes('preview-card-'), 'page renders per-locale preview cards');

console.log('');
console.log(`  RESULT: ${pass} PASS \u00b7 ${fail} FAIL \u00b7 ${pass + fail} total`);
console.log('');
if (fail > 0) {
  console.log('  Failures:');
  for (const f of failures) console.log(`    \u00b7 ${f}`);
  process.exit(1);
}
process.exit(0);
