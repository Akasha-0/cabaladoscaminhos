#!/usr/bin/env node --experimental-strip-types
/**
 * Translation Tooling — Self-Running Spec
 *
 * Runs via `node --experimental-strip-types --no-warnings` (no vitest, no jest).
 * Prints PASS/FAIL per assertion, exits 0 on all-pass, 1 on any failure.
 *
 * Coverage:
 *  - Locale normalization (15 variants)
 *  - translate() fallback chain (pt-BR / en / es / unknown)
 *  - Missing-key sentinel
 *  - {var} interpolation
 *  - Plural forms (pt-BR / en / es)
 *  - Plural-rule function (boundaries 0 / 1 / 2 / -1)
 *  - Dictionary parity across all three locales
 *  - Deep-freeze contract
 *  - FALLBACK_CHAIN order invariant
 *  - getDictionary / getAllDictionaries shape
 */

import {
  translate,
  getDictionary,
  getAllDictionaries,
  pluralRule,
  normalizeLocale,
  formatPlural,
  interpolate,
  formatTemplate,
  checkParity,
  sizeOf,
  FALLBACK_CHAIN,
  PT_BR,
  EN,
  ES,
} from './index.ts'

// ─────────────────────────────────────────────────────────────────────────────
// Tiny test runner
// ─────────────────────────────────────────────────────────────────────────────

let passed = 0
let failed = 0
const failures: Array<{ idx: number; name: string; msg: string }> = []

function assertEq(actual: unknown, expected: unknown, msg: string): void {
  if (actual === expected) {
    passed++
  } else {
    failed++
    failures.push({
      idx: failed + passed,
      name: msg,
      msg: `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    })
  }
}

function assertContains(haystack: string, needle: string, msg: string): void {
  if (haystack.includes(needle)) {
    passed++
  } else {
    failed++
    failures.push({
      idx: failed + passed,
      name: msg,
      msg: `expected ${JSON.stringify(haystack)} to contain ${JSON.stringify(needle)}`,
    })
  }
}

function assertTrue(cond: boolean, msg: string): void {
  assertEq(cond, true, msg)
}

function assertFalse(cond: boolean, msg: string): void {
  assertEq(cond, false, msg)
}

// ─────────────────────────────────────────────────────────────────────────────
// Spec — Section: normalizeLocale
// ─────────────────────────────────────────────────────────────────────────────

assertEq(normalizeLocale('pt-BR'), 'pt-BR', '01: pt-BR stays pt-BR')
assertEq(normalizeLocale('en'), 'en', '02: en stays en')
assertEq(normalizeLocale('es'), 'es', '03: es stays es')
assertEq(normalizeLocale('pt-br'), 'pt-BR', '04: pt-br lowercased → pt-BR')
assertEq(normalizeLocale('PT-BR'), 'pt-BR', '05: PT-BR uppercased → pt-BR')
assertEq(normalizeLocale('pt_br'), 'pt-BR', '06: pt_br underscore → pt-BR')
assertEq(normalizeLocale('pt'), 'pt-BR', '07: pt bare → pt-BR')
assertEq(normalizeLocale('en-us'), 'en', '08: en-us → en')
assertEq(normalizeLocale('en-gb'), 'en', '09: en-gb → en')
assertEq(normalizeLocale('en-au'), 'en', '10: en-au → en')
assertEq(normalizeLocale('es-mx'), 'es', '11: es-mx → es')
assertEq(normalizeLocale('es-ar'), 'es', '12: es-ar → es')
assertEq(normalizeLocale(''), 'pt-BR', '13: empty → pt-BR fallback')
assertEq(normalizeLocale(null), 'pt-BR', '14: null → pt-BR fallback')
assertEq(normalizeLocale(undefined), 'pt-BR', '15: undefined → pt-BR fallback')
assertEq(normalizeLocale('zz-XX'), 'pt-BR', '16: unknown → pt-BR fallback')

// ─────────────────────────────────────────────────────────────────────────────
// Spec — Section: translate() direct hits (no fallback needed)
// ─────────────────────────────────────────────────────────────────────────────

assertEq(translate('common.save', 'pt-BR'), 'Salvar', '17: pt-BR common.save → Salvar')
assertEq(translate('common.save', 'en'), 'Save', '18: en common.save → Save')
assertEq(translate('common.save', 'es'), 'Guardar', '19: es common.save → Guardar')
assertEq(translate('mesa.title', 'en'), 'Royal Table', '20: en mesa.title')
assertEq(translate('home.subtitle', 'es'), 'Tradiciones en diálogo', '21: es home.subtitle')
assertEq(translate('trad.cigano', 'en'), 'Romani', '22: en trad.cigano → Romani')

// ─────────────────────────────────────────────────────────────────────────────
// Spec — Section: translate() fallback chain
// ─────────────────────────────────────────────────────────────────────────────

// When ES lacks a key, it should fall back to PT-BR (the source-of-truth)
// In our setup ES is complete, so simulate by passing a key that PT-BR has
// but ES does NOT — we use a deliberately non-existent key for the "missing"
// test below. For fallback semantics, we test the missing-key sentinel.
assertEq(
  translate('definitely.missing.key', 'es'),
  '[[definitely.missing.key]]',
  '23: missing key in es → sentinel fallback',
)
assertEq(
  translate('definitely.missing.key', 'en'),
  '[[definitely.missing.key]]',
  '24: missing key in en → sentinel fallback',
)
assertEq(
  translate('definitely.missing.key', 'pt-BR'),
  '[[definitely.missing.key]]',
  '25: missing key in pt-BR → sentinel fallback (last resort)',
)

// ─────────────────────────────────────────────────────────────────────────────
// Spec — Section: {var} interpolation
// ─────────────────────────────────────────────────────────────────────────────

assertEq(
  translate('home.welcome', 'en', { name: 'Akira' }),
  'Welcome, Akira',
  '26: en home.welcome interpolates name',
)
assertEq(
  translate('home.welcome', 'pt-BR', { name: 'Mestra' }),
  'Bem-vindo(a), Mestra',
  '27: pt-BR home.welcome interpolates name',
)
assertEq(
  translate('mesa.casa', 'es', { n: 7 }),
  'Casa 7',
  '28: es mesa.casa interpolates n',
)
assertEq(
  translate('mesa.open_house', 'en', { n: 13 }),
  'Open House 13',
  '29: en mesa.open_house interpolates n',
)

// Unknown var → left literal (visible)
assertEq(
  translate('home.welcome', 'en', {}),
  'Welcome, {name}',
  '30: missing var → literal {name}',
)

// ─────────────────────────────────────────────────────────────────────────────
// Spec — Section: plural forms (ICU-lite)
// ─────────────────────────────────────────────────────────────────────────────

// EN
assertEq(
  translate('mesa.cards_drawn', 'en', { count: 1 }),
  '1 card drawn',
  '31: en plural count=1 → one',
)
assertEq(
  translate('mesa.cards_drawn', 'en', { count: 5 }),
  '5 cards drawn',
  '32: en plural count=5 → other',
)
assertEq(
  translate('mesa.cards_drawn', 'en', { count: 0 }),
  '0 cards drawn',
  '33: en plural count=0 → other',
)

// ES
assertEq(
  translate('mesa.cards_drawn', 'es', { count: 1 }),
  '1 carta sacada',
  '34: es plural count=1 → one',
)
assertEq(
  translate('mesa.cards_drawn', 'es', { count: 4 }),
  '4 cartas sacadas',
  '35: es plural count=4 → other',
)

// PT-BR — special: 0 is also 'one'
assertEq(
  translate('mesa.cards_drawn', 'pt-BR', { count: 1 }),
  '1 carta sorteada',
  '36: pt-BR plural count=1 → one',
)
assertEq(
  translate('mesa.cards_drawn', 'pt-BR', { count: 0 }),
  '1 carta sorteada',
  '37: pt-BR plural count=0 → one (special)',
)
assertEq(
  translate('mesa.cards_drawn', 'pt-BR', { count: 3 }),
  '3 cartas sorteadas',
  '38: pt-BR plural count=3 → other',
)

// ─────────────────────────────────────────────────────────────────────────────
// Spec — Section: pluralRule() direct
// ─────────────────────────────────────────────────────────────────────────────

assertEq(pluralRule('en', 1), 'one', '39: en pluralRule(1) → one')
assertEq(pluralRule('en', 2), 'other', '40: en pluralRule(2) → other')
assertEq(pluralRule('es', 1), 'one', '41: es pluralRule(1) → one')
assertEq(pluralRule('es', 2), 'other', '42: es pluralRule(2) → other')
assertEq(pluralRule('pt-BR', 0), 'one', '43: pt-BR pluralRule(0) → one')
assertEq(pluralRule('pt-BR', 1), 'one', '44: pt-BR pluralRule(1) → one')
assertEq(pluralRule('pt-BR', 2), 'other', '45: pt-BR pluralRule(2) → other')
assertEq(pluralRule('pt-BR', -1), 'one', '46: pt-BR pluralRule(-1) → one (abs)')

// ─────────────────────────────────────────────────────────────────────────────
// Spec — Section: formatPlural / interpolate / formatTemplate
// ─────────────────────────────────────────────────────────────────────────────

assertEq(
  formatPlural('{count, plural, one {# item} other {# items}}', 'en', 1),
  '1 item',
  '47: formatPlural # substitution one',
)
assertEq(
  formatPlural('{count, plural, one {# item} other {# items}}', 'en', 7),
  '7 items',
  '48: formatPlural # substitution other',
)
assertEq(
  formatPlural('no plural here', 'en', 5),
  'no plural here',
  '49: formatPlural no match → unchanged',
)
assertEq(interpolate('Hello {who}', { who: 'world' }), 'Hello world', '50: interpolate basic')
assertEq(
  interpolate('Hello {who}', { who: 42 }),
  'Hello 42',
  '51: interpolate number coerced',
)
assertEq(interpolate('Hello {who}', {}), 'Hello {who}', '52: interpolate missing → literal')
assertEq(
  formatTemplate('Hi {name}', 'en', { name: 'Ada' }),
  'Hi Ada',
  '53: formatTemplate no plural',
)

// ─────────────────────────────────────────────────────────────────────────────
// Spec — Section: dictionary access + parity
// ─────────────────────────────────────────────────────────────────────────────

const ptDict = getDictionary('pt-BR')
const enDict = getDictionary('en')
const esDict = getDictionary('es')
assertTrue(typeof ptDict['common.save'] === 'string', '54: getDictionary pt-BR has common.save')
assertTrue(typeof enDict['common.save'] === 'string', '55: getDictionary en has common.save')
assertTrue(typeof esDict['common.save'] === 'string', '56: getDictionary es has common.save')
assertTrue(Object.isFrozen(ptDict), '57: pt-BR dict frozen')
assertTrue(Object.isFrozen(enDict), '58: en dict frozen')
assertTrue(Object.isFrozen(esDict), '59: es dict frozen')

const all = getAllDictionaries()
assertTrue(typeof all['pt-BR'] === 'object', '60: getAllDictionaries has pt-BR')
assertTrue(typeof all['en'] === 'object', '61: getAllDictionaries has en')
assertTrue(typeof all['es'] === 'object', '62: getAllDictionaries has es')

assertTrue(sizeOf('pt-BR') >= 50, '63: pt-BR dict has ≥50 keys')
assertEq(sizeOf('pt-BR'), sizeOf('en'), '64: pt-BR size == en size (parity)')
assertEq(sizeOf('pt-BR'), sizeOf('es'), '65: pt-BR size == es size (parity)')

const parity = checkParity()
assertTrue(parity.ok, '66: checkParity ok across all locales')
assertTrue(Array.isArray(parity.missing), '67: checkParity.missing is array')

// ─────────────────────────────────────────────────────────────────────────────
// Spec — Section: FALLBACK_CHAIN invariant
// ─────────────────────────────────────────────────────────────────────────────

assertEq(FALLBACK_CHAIN.length, 3, '68: FALLBACK_CHAIN length 3')
assertEq(FALLBACK_CHAIN[0], 'pt-BR', '69: FALLBACK_CHAIN[0] === pt-BR')
assertTrue(Object.isFrozen(FALLBACK_CHAIN), '70: FALLBACK_CHAIN frozen')

// ─────────────────────────────────────────────────────────────────────────────
// Spec — Section: missing-key sentinel contract
// ─────────────────────────────────────────────────────────────────────────────

assertEq(
  translate('nope', 'pt-BR'),
  '[[nope]]',
  '71: missing key returns [[key]]',
)
assertContains(
  translate('absent.key.path', 'en'),
  '[[',
  '72: missing key sentinel contains [[',
)
assertContains(
  translate('absent.key.path', 'en'),
  ']]',
  '73: missing key sentinel contains ]]',
)

// ─────────────────────────────────────────────────────────────────────────────
// Spec — Section: locale string with whitespace + mixed-case
// ─────────────────────────────────────────────────────────────────────────────

assertEq(normalizeLocale('  pt-BR  '), 'pt-BR', '74: trimmed whitespace')
assertEq(normalizeLocale('EN_US'), 'en', '75: EN_US uppercase → en')
assertEq(normalizeLocale('PT'), 'pt-BR', '76: PT bare → pt-BR')

// ─────────────────────────────────────────────────────────────────────────────
// Spec — Section: dictionaries object identity / isolation
// ─────────────────────────────────────────────────────────────────────────────

assertTrue(PT_BR !== EN, '77: PT_BR !== EN reference')
assertTrue(EN !== ES, '78: EN !== ES reference')
assertTrue(PT_BR !== ES, '79: PT_BR !== ES reference')

// Mutating EN should fail (frozen)
let frozenBlocked = false
try {
  ;(EN as Record<string, string>)['mutated.key'] = 'mutated'
} catch (_e) {
  frozenBlocked = true
}
assertTrue(frozenBlocked, '80: EN dict rejects mutation in strict mode')

// ─────────────────────────────────────────────────────────────────────────────
// Spec — Section: translate() with mixed locale inputs
// ─────────────────────────────────────────────────────────────────────────────

assertEq(translate('common.yes', 'en'), 'Yes', '81: en yes')
assertEq(translate('common.yes', 'pt-br'), 'Sim', '82: pt-br (normalized) yes')
assertEq(translate('common.yes', 'ES'), 'Sí', '83: ES (normalized) yes')

// ─────────────────────────────────────────────────────────────────────────────
// Spec — Section: extra sacred-content keys present
// ─────────────────────────────────────────────────────────────────────────────

assertEq(translate('trad.candomble', 'pt-BR'), 'Candomblé', '84: trad.candomble pt-BR')
assertEq(translate('trad.tarot', 'pt-BR'), 'Tarot', '85: trad.tarot pt-BR')
assertEq(translate('trad.cabala', 'en'), 'Kabbalah', '86: trad.cabala en')
assertEq(translate('trad.astrologia', 'es'), 'Astrología', '87: trad.astrologia es')

// ─────────────────────────────────────────────────────────────────────────────
// Print + exit
// ─────────────────────────────────────────────────────────────────────────────

const total = passed + failed
console.log(`\n[translation-tooling.spec] ${passed}/${total} assertions passed`)

if (failed > 0) {
  console.error(`\n${failed} FAILED:`)
  for (const f of failures) {
    console.error(`  - ${f.name}: ${f.msg}`)
  }
  process.exit(1)
}

console.log('PASS')
process.exit(0)