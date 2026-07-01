#!/usr/bin/env node
// ============================================================================
// check-i18n-coverage.mjs — CLI de auditoría de cobertura i18n (Wave 33)
// ============================================================================
// Scan src/ for `t('...')` / `t("...")` calls, compare com as chaves definidas
// em src/lib/i18n/locales/<locale>/keys.json e reporta cobertura por locale.
//
// Exit codes:
//   0  — cobertura >= threshold (default 80%) para todos os locales primários
//   1  — pt-BR ou en abaixo do threshold (CI gate)
//   2  — es abaixo do threshold (warn, mas não bloqueia por default)
// ============================================================================

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, basename, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');
const ROOT = join(__dirname, '..');
const LOCALES_DIR = join(ROOT, 'src', 'lib', 'i18n', 'locales');
const SRC_DIR = join(ROOT, 'src');

const THRESHOLD_PRIMARY = 0.8; // pt-BR / en
const THRESHOLD_TERTIARY = 0.6; // es (Wave 33 target)
const PLACEHOLDER = /\bTODO\b|\bFIXME\b|\bXXX\b/i;

// ---------------------------------------------------------------------------
// 1. Collect keys.json per locale
// ---------------------------------------------------------------------------
function loadKeys(locale) {
  const path = join(LOCALES_DIR, locale, 'keys.json');
  try {
    const raw = readFileSync(path, 'utf8');
    const parsed = JSON.parse(raw);
    const flat = new Set();
    function walk(obj, prefix) {
      for (const [k, v] of Object.entries(obj)) {
        if (k.startsWith('_')) continue;
        const fullKey = prefix ? `${prefix}.${k}` : k;
        if (v && typeof v === 'object' && !Array.isArray(v)) {
          walk(v, fullKey);
        } else {
          flat.add(fullKey);
        }
      }
    }
    walk(parsed, '');
    return flat;
  } catch (err) {
    console.error(`❌ Não foi possível ler ${path}: ${err.message}`);
    return new Set();
  }
}

// ---------------------------------------------------------------------------
// 2. Scan src/ for t('key') / t("key") usages
// ---------------------------------------------------------------------------
function walkSrc(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next' || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) walkSrc(full, files);
    else if (['.ts', '.tsx', '.js', '.jsx'].includes(extname(entry))) files.push(full);
  }
  return files;
}

function extractKeysFromFile(path) {
  const content = readFileSync(path, 'utf8');
  const keys = new Set();
  // Match t('...') t("...") and also t(`...`)
  const patterns = [
    /\bt\(\s*['"]([^'"\s]+)['"]/g,
    /\bt\(\s*`([^`]+)`/g,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(content)) !== null) {
      const key = m[1].trim();
      // Only dot-notation keys (filter out dynamic strings like `feed.${x}`)
      if (/^[a-zA-Z][a-zA-Z0-9._]*$/.test(key)) keys.add(key);
    }
  }
  return { keys, content };
}

// ---------------------------------------------------------------------------
// 3. Main audit
// ---------------------------------------------------------------------------
function main() {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes('--json');
  const verbose = args.includes('--verbose');
  const locales = readdirSync(LOCALES_DIR).filter((d) => {
    try {
      return statSync(join(LOCALES_DIR, d)).isDirectory();
    } catch {
      return false;
    }
  });

  if (locales.length === 0) {
    console.error(`❌ Nenhum locale encontrado em ${LOCALES_DIR}`);
    process.exit(1);
  }

  // Collect all keys used in source
  const srcFiles = walkSrc(SRC_DIR);
  const usedKeys = new Set();
  const keyToFiles = new Map();
  for (const f of srcFiles) {
    const { keys, content } = extractKeysFromFile(f);
    for (const k of keys) {
      usedKeys.add(k);
      if (!keyToFiles.has(k)) keyToFiles.set(k, []);
      keyToFiles.get(k).push(relative(ROOT, f));
    }
    // also flag placeholder content
    if (verbose && PLACEHOLDER.test(content)) {
      console.warn(`⚠️  PLACEHOLDER DETECTED em ${relative(ROOT, f)}`);
    }
  }

  // For each locale, compute coverage
  const report = {};
  for (const locale of locales) {
    const defined = loadKeys(locale);
    const missing = [];
    const used = [];
    for (const k of usedKeys) {
      if (defined.has(k)) {
        used.push(k);
      } else {
        missing.push(k);
      }
    }
    const coverage = defined.size === 0 ? 0 : used.length / usedKeys.size;
    report[locale] = {
      definedKeys: defined.size,
      usedKeys: usedKeys.size,
      matchedKeys: used.length,
      missingKeys: missing.length,
      coverage,
      missing: missing.sort(),
    };
  }

  // Also detect UNUSED keys (defined but not referenced)
  for (const locale of locales) {
    const defined = loadKeys(locale);
    const unused = [];
    for (const k of defined) {
      if (!usedKeys.has(k)) unused.push(k);
    }
    report[locale].unusedKeys = unused.length;
    report[locale].unused = unused.sort();
  }

  // Output
  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
    return finalize(report);
  }

  // Human-friendly table
  console.log('\n🌐 i18n Coverage Audit — Wave 33');
  console.log('─'.repeat(78));
  console.log(
    'locale'.padEnd(10) +
      'defined'.padStart(10) +
      'used'.padStart(10) +
      'matched'.padStart(10) +
      'missing'.padStart(10) +
      'coverage'.padStart(12) +
      ' status'
  );
  console.log('─'.repeat(78));

  let failed = false;
  for (const [locale, r] of Object.entries(report)) {
    const pct = (r.coverage * 100).toFixed(1) + '%';
    const threshold = ['pt-BR', 'en'].includes(locale)
      ? THRESHOLD_PRIMARY
      : THRESHOLD_TERTIARY;
    const pass = r.coverage >= threshold;
    const status = pass ? '✅' : '❌';
    if (!pass) failed = true;
    console.log(
      locale.padEnd(10) +
        String(r.definedKeys).padStart(10) +
        String(r.usedKeys).padStart(10) +
        String(r.matchedKeys).padStart(10) +
        String(r.missingKeys).padStart(10) +
        pct.padStart(12) +
        ` ${status} (threshold ${(threshold * 100).toFixed(0)}%)`
    );
  }
  console.log('─'.repeat(78));

  // Verbose: print first 20 missing keys per locale
  if (verbose) {
    for (const [locale, r] of Object.entries(report)) {
      if (r.missing.length > 0) {
        console.log(`\n📋 ${locale} — missing keys (showing first 30):`);
        for (const k of r.missing.slice(0, 30)) console.log(`   • ${k}`);
        if (r.missing.length > 30) console.log(`   … and ${r.missing.length - 30} more`);
      }
      if (r.unused && r.unused.length > 0) {
        console.log(`\n🗑️  ${locale} — unused keys (showing first 20):`);
        for (const k of r.unused.slice(0, 20)) console.log(`   • ${k}`);
        if (r.unused.length > 20) console.log(`   … and ${r.unused.length - 20} more`);
      }
    }
  }

  return finalize(report, failed);
}

function finalize(report, failed = false) {
  // Determine exit code
  for (const [locale, r] of Object.entries(report)) {
    const threshold = ['pt-BR', 'en'].includes(locale)
      ? THRESHOLD_PRIMARY
      : THRESHOLD_TERTIARY;
    if (r.coverage < threshold && ['pt-BR', 'en'].includes(locale)) {
      process.exit(1); // hard fail
    }
  }
  if (failed) process.exit(2); // soft fail (es)
  process.exit(0);
}

main();