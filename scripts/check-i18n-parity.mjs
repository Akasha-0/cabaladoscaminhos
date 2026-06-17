#!/usr/bin/env node
/**
 * check-i18n-parity.mjs — valida paridade de chaves en.json ↔ pt-BR.json.
 *
 * Spec qualidade-i18n-en (F-231), Fase C.
 *
 * Exit codes:
 *   0 — paridade ok (todas as chaves existem em ambos os idiomas)
 *   1 — mismatch (chaves faltando em um dos idiomas)
 *
 * Uso:
 *   node scripts/check-i18n-parity.mjs
 *   pnpm i18n:check (do apps/akasha-portal)
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EN_PATH = path.join(ROOT, 'apps/akasha-portal/src/i18n/en.json');
const PT_PATH = path.join(ROOT, 'apps/akasha-portal/src/i18n/pt-BR.json');

/**
 * Achata um objeto nested em { dottedKey: leafValue }.
 * Apenas conta folhas (strings, numbers, booleans) — ignora objetos aninhados.
 */
function flatten(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flatten(v, key));
    } else {
      out[key] = v;
    }
  }
  return out;
}

async function main() {
  let en, pt;
  try {
    en = JSON.parse(await fs.readFile(EN_PATH, 'utf8'));
    pt = JSON.parse(await fs.readFile(PT_PATH, 'utf8'));
  } catch (e) {
    console.error(`Failed to read i18n files: ${e.message}`);
    process.exit(1);
  }

  const enFlat = flatten(en);
  const ptFlat = flatten(pt);
  const enKeys = new Set(Object.keys(enFlat));
  const ptKeys = new Set(Object.keys(ptFlat));

  const missingInEn = [...ptKeys].filter((k) => !enKeys.has(k)).sort();
  const missingInPt = [...enKeys].filter((k) => !ptKeys.has(k)).sort();

  console.log(`i18n parity check`);
  console.log(`  en.json:     ${enKeys.size} keys`);
  console.log(`  pt-BR.json:  ${ptKeys.size} keys`);

  let hasError = false;

  if (missingInEn.length > 0) {
    console.error(`\n  ✗ ${missingInEn.length} key(s) in pt-BR missing in en:`);
    for (const k of missingInEn) console.error(`      ${k}`);
    hasError = true;
  }

  if (missingInPt.length > 0) {
    console.error(`\n  ✗ ${missingInPt.length} key(s) in en missing in pt-BR:`);
    for (const k of missingInPt) console.error(`      ${k}`);
    hasError = true;
  }

  if (hasError) {
    console.error(`\n  Result: MISMATCH (exit 1)`);
    process.exit(1);
  }

  console.log(`\n  ✓ Result: PARITY OK (exit 0)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
