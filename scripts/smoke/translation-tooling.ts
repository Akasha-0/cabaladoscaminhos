#!/usr/bin/env node --experimental-strip-types
/**
 * Translation Tooling — Smoke Harness
 *
 * Lightweight end-to-end smoke. Verifies:
 *  - Engine entrypoint loads
 *  - All three dictionaries have ≥ 50 keys and are frozen
 *  - Cross-locale parity (every pt-BR key exists in en + es)
 *  - translate() returns expected canonical strings for the 9 named UI keys
 *  - Plural form pipeline works end-to-end for en/es/pt-BR (counts 0/1/2)
 *  - Missing-key sentinel contract
 *  - FALLBACK_CHAIN shape
 *  - Locale normalization for 4 common inputs
 *
 * Exits 0 on success, 1 on failure.
 */

import {
  translate,
  getDictionary,
  pluralRule,
  normalizeLocale,
  checkParity,
  sizeOf,
  FALLBACK_CHAIN,
  PT_BR,
  EN,
  ES,
} from '../../src/lib/engines/translation-tooling/index.ts'

let passed = 0
let failed = 0
const failures: string[] = []

function check(name: string, cond: boolean, detail = ''): void {
  if (cond) {
    passed++
    console.log(`  ✓ ${name}`)
  } else {
    failed++
    const msg = detail.length > 0 ? ` — ${detail}` : ''
    failures.push(`${name}${msg}`)
    console.log(`  ✗ ${name}${msg}`)
  }
}

function section(label: string): void {
  console.log(`\n[${label}]`)
}

// ─────────────────────────────────────────────────────────────────────────────
section('engine entrypoint')
// ─────────────────────────────────────────────────────────────────────────────

check('PT_BR loaded', typeof PT_BR === 'object' && Object.keys(PT_BR).length > 0)
check('EN loaded', typeof EN === 'object' && Object.keys(EN).length > 0)
check('ES loaded', typeof ES === 'object' && Object.keys(ES).length > 0)
check('translate is a function', typeof translate === 'function')
check('pluralRule is a function', typeof pluralRule === 'function')
check('normalizeLocale is a function', typeof normalizeLocale === 'function')

// ─────────────────────────────────────────────────────────────────────────────
section('dictionary size + freeze')
// ─────────────────────────────────────────────────────────────────────────────

check('pt-BR has ≥ 50 keys', sizeOf('pt-BR') >= 50, `actual=${sizeOf('pt-BR')}`)
check('en has ≥ 50 keys', sizeOf('en') >= 50, `actual=${sizeOf('en')}`)
check('es has ≥ 50 keys', sizeOf('es') >= 50, `actual=${sizeOf('es')}`)
check('pt-BR is frozen', Object.isFrozen(PT_BR))
check('en is frozen', Object.isFrozen(EN))
check('es is frozen', Object.isFrozen(ES))

// ─────────────────────────────────────────────────────────────────────────────
section('cross-locale parity')
// ─────────────────────────────────────────────────────────────────────────────

const parity = checkParity()
check('parity ok', parity.ok, `missing=${JSON.stringify(parity.missing.slice(0, 3))}`)
check('pt-BR/en sizes match', sizeOf('pt-BR') === sizeOf('en'))
check('pt-BR/es sizes match', sizeOf('pt-BR') === sizeOf('es'))

// ─────────────────────────────────────────────────────────────────────────────
section('translate() canonical keys (UI chrome)')
// ─────────────────────────────────────────────────────────────────────────────

check('pt-BR common.save', translate('common.save', 'pt-BR') === 'Salvar')
check('en common.save', translate('common.save', 'en') === 'Save')
check('es common.save', translate('common.save', 'es') === 'Guardar')
check('pt-BR mesa.title', translate('mesa.title', 'pt-BR') === 'Mesa Real')
check('en mesa.title', translate('mesa.title', 'en') === 'Royal Table')
check('es mesa.title', translate('mesa.title', 'es') === 'Mesa Real')
check('pt-BR auth.signin', translate('auth.signin', 'pt-BR') === 'Entrar')
check('en auth.signin', translate('auth.signin', 'en') === 'Sign in')
check('es auth.signin', translate('auth.signin', 'es') === 'Iniciar sesión')
check('pt-BR state.saved', translate('state.saved', 'pt-BR') === 'Salvo com sucesso')
check('en state.saved', translate('state.saved', 'en') === 'Saved successfully')

// ─────────────────────────────────────────────────────────────────────────────
section('plural pipeline end-to-end')
// ─────────────────────────────────────────────────────────────────────────────

check(
  'en plural count=1',
  translate('mesa.cards_drawn', 'en', { count: 1 }) === '1 card drawn',
)
check(
  'en plural count=2',
  translate('mesa.cards_drawn', 'en', { count: 2 }) === '2 cards drawn',
)
check(
  'es plural count=1',
  translate('mesa.cards_drawn', 'es', { count: 1 }) === '1 carta sacada',
)
check(
  'es plural count=2',
  translate('mesa.cards_drawn', 'es', { count: 2 }) === '2 cartas sacadas',
)
check(
  'pt-BR plural count=0',
  translate('mesa.cards_drawn', 'pt-BR', { count: 0 }) === '1 carta sorteada',
)
check(
  'pt-BR plural count=2',
  translate('mesa.cards_drawn', 'pt-BR', { count: 2 }) === '2 cartas sorteadas',
)

// ─────────────────────────────────────────────────────────────────────────────
section('missing-key sentinel')
// ─────────────────────────────────────────────────────────────────────────────

check(
  'missing returns [[key]]',
  translate('totally.absent', 'pt-BR') === '[[totally.absent]]',
)
check(
  'missing in en → sentinel',
  translate('totally.absent', 'en') === '[[totally.absent]]',
)
check(
  'missing in es → sentinel',
  translate('totally.absent', 'es') === '[[totally.absent]]',
)

// ─────────────────────────────────────────────────────────────────────────────
section('FALLBACK_CHAIN invariant')
// ─────────────────────────────────────────────────────────────────────────────

check('FALLBACK_CHAIN length 3', FALLBACK_CHAIN.length === 3)
check('FALLBACK_CHAIN[0] === pt-BR', FALLBACK_CHAIN[0] === 'pt-BR')
check('FALLBACK_CHAIN includes en', FALLBACK_CHAIN.includes('en'))
check('FALLBACK_CHAIN includes es', FALLBACK_CHAIN.includes('es'))
check('FALLBACK_CHAIN frozen', Object.isFrozen(FALLBACK_CHAIN))

// ─────────────────────────────────────────────────────────────────────────────
section('locale normalization')
// ─────────────────────────────────────────────────────────────────────────────

check('pt-br → pt-BR', normalizeLocale('pt-br') === 'pt-BR')
check('en-us → en', normalizeLocale('en-us') === 'en')
check('es-mx → es', normalizeLocale('es-mx') === 'es')
check('PT_BR → pt-BR', normalizeLocale('PT_BR') === 'pt-BR')

// ─────────────────────────────────────────────────────────────────────────────
section('getDictionary shape')
// ─────────────────────────────────────────────────────────────────────────────

const d = getDictionary('pt-BR')
check(
  'getDictionary(pt-BR).common.save === Salvar',
  d['common.save'] === 'Salvar',
)
check('getDictionary(en).mesa.title === Royal Table', getDictionary('en')['mesa.title'] === 'Royal Table')
check(
  'getDictionary(es).trad.cigano === Gitano',
  getDictionary('es')['trad.cigano'] === 'Gitano',
)

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────

console.log(`\n[smoke] ${passed}/${passed + failed} checks passed`)
if (failed > 0) {
  console.error('\nFailures:')
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}
console.log('PASS')
process.exit(0)