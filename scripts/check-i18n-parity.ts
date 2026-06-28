#!/usr/bin/env node
/**
 * i18n parity checker — Cabala dos Caminhos
 * Validates that en.ts, es.ts, pt-BR.ts in src/lib/i18n/locales/ have the same top-level keys.
 */
import { readFileSync } from 'fs';
import { join } from 'path';

const LOCALES_DIR = 'src/lib/i18n/locales';
const LOCALES = ['pt-BR', 'en', 'es'] as const;
type Locale = typeof LOCALES[number];

function extractKeys(filePath: string): Set<string> {
  const src = readFileSync(filePath, 'utf8');
  // Match `keyName: {` at top level (1-2 spaces indent)
  const re = /^\s{1,3}([a-zA-Z][a-zA-Z0-9_]*)\s*:\s*\{/gm;
  const keys = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) keys.add(m[1]);
  return keys;
}

function main(): number {
  const byLocale = new Map<Locale, Set<string>>();
  for (const loc of LOCALES) {
    const path = join(LOCALES_DIR, `${loc}.ts`);
    byLocale.set(loc, extractKeys(path));
  }
  const reference: Locale = 'pt-BR';
  const refKeys = byLocale.get(reference)!;
  let issues = 0;
  for (const loc of LOCALES) {
    if (loc === reference) continue;
    const otherKeys = byLocale.get(loc)!;
    for (const k of refKeys) {
      if (!otherKeys.has(k)) {
        console.error(`[${loc}] MISSING: ${k}`);
        issues++;
      }
    }
    for (const k of otherKeys) {
      if (!refKeys.has(k)) {
        console.error(`[${loc}] EXTRA: ${k}`);
        issues++;
      }
    }
  }
  if (issues === 0) {
    console.log(`OK: ${refKeys.size} keys in sync across ${LOCALES.length} locales`);
    return 0;
  }
  console.error(`FAIL: ${issues} parity issues`);
  return 1;
}

process.exit(main());