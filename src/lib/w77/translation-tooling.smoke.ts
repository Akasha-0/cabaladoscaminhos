/**
 * W77-C Translation Tooling — Smoke harness (cycle 77, 06:00 UTC).
 *
 * Sync-friendly smoke runner (cycle 60+ pattern). Uses bare `check(label, cond)`
 * with a one-shot counter; any false condition increments `FAILURES`. Exits 0
 * iff FAILURES === 0. NO vitest, NO async — keeps the harness fast and
 * deterministic in worktree-isolated configs.
 */

import {
  createTranslationEngine,
  canonicalJson,
  sha256Hex,
  sacredTermId,
  langCode,
  traditionCode,
  translateText,
  lookupTerm,
  registerCustomTranslation,
  getSacredDictionary,
  validateTranslation,
  exportAudit,
  hashCacheKey,
  dictSize,
  dictSizeByLang,
  termCountByTradition,
  SACRED_LANGS,
  SACRED_TRADITIONS,
  DEFAULT_LANG,
  SACRED_LANGS as _LANGS_DUP,
} from './translation-tooling.ts';

let CHECK_COUNT = 0;
let FAILURES = 0;

function check(label: string, cond: unknown, detail?: string): void {
  CHECK_COUNT++;
  if (cond) {
    process.stdout.write(`  ✓ ${label}\n`);
  } else {
    FAILURES++;
    process.stdout.write(`  ✗ ${label}${detail ? ' — ' + detail : ''}\n`);
  }
}

function expectThrow(label: string, fn: () => unknown, pattern: RegExp | string): void {
  CHECK_COUNT++;
  let threw = false;
  let msg = '';
  try { fn(); } catch (e) { threw = true; msg = e instanceof Error ? e.message : String(e); }
  if (!threw) {
    FAILURES++;
    process.stdout.write(`  ✗ ${label} — no throw\n`);
    return;
  }
  const ok = pattern instanceof RegExp ? pattern.test(msg) : msg.includes(pattern);
  if (!ok) {
    FAILURES++;
    process.stdout.write(`  ✗ ${label} — pattern ${pattern} did not match: ${msg}\n`);
    return;
  }
  process.stdout.write(`  ✓ ${label}\n`);
}

// ===========================================================================
// SMOKE BUNDLE — every check is a 1-bit signal
// ===========================================================================

process.stdout.write('\n=== W77-C translation-tooling smoke — cycle 77 ===\n');

const eng = createTranslationEngine({ readonly: false });
const engRO = createTranslationEngine({ readonly: true });

// --- 1. dictionary inventory ---
check('dictSize >= 600', dictSize() >= 600, `actual=${dictSize()}`);
for (const lang of SACRED_LANGS) {
  check(`dict[${lang}] >= 200`, dictSizeByLang(lang) >= 200, `actual=${dictSizeByLang(lang)}`);
}
const counts = termCountByTradition();
for (const t of SACRED_TRADITIONS) {
  check(`tradition[${t}] >= 30`, (counts[t] ?? 0) >= 30, `actual=${counts[t]}`);
}
check('exactly 3 langs', SACRED_LANGS.length === 3);
check('exactly 7 traditions', SACRED_TRADITIONS.length === 7);

// --- 2. brand factories ---
check('sacredTermId normalizes', sacredTermId('  Oxalá  ') === 'Oxalá');
expectThrow('sacredTermId empty throws', () => sacredTermId(''), /empty/);
expectThrow('sacredTermId too long throws', () => sacredTermId('x'.repeat(200)), /too long/);
check('langCode pt-BR', langCode('pt-BR') === 'pt-BR');
check('langCode en', langCode('en') === 'en');
check('langCode es', langCode('es') === 'es');
expectThrow('langCode unknown', () => langCode('xx'), /unsupported/);
check('traditionCode candomble', traditionCode('candomble') === 'candomble');
check('traditionCode cigano', traditionCode('cigano') === 'cigano');
expectThrow('traditionCode voodoo', () => traditionCode('voodoo'), /unsupported/);

// --- 3. lookup + dictionary structural integrity ---
const oxala = lookupTerm('Oxalá', 'pt-BR');
check('lookup Oxalá pt-BR found', oxala.found);
check('lookup Oxalá pt-BR preserve', oxala.mode === 'preserve');
const oxalaEn = lookupTerm('Oxalá', 'en');
check('lookup Oxalá en preserve', oxalaEn.mode === 'preserve');
const iemanjaEn = lookupTerm('Iemanjá', 'en');
check('lookup Iemanjá en transliterate', iemanjaEn.mode === 'transliterate');
const missing = lookupTerm('Zzzzz', 'pt-BR');
check('lookup missing', !missing.found && missing.mode === null);

// --- 4. translateText behavior ---
const r1 = eng.translateText({ text: 'Oxalá é pai', sourceLang: 'pt-BR', targetLang: 'en' });
check('translate Oxalá → EN keeps Oxalá', r1.output.includes('Oxalá'));
check('translate Oxalá → EN has hit', r1.hits.length >= 1);
check('translate hash key 64 hex', /^[0-9a-f]{64}$/.test(r1.cacheKey));

const r2 = eng.translateText({ text: 'Ifá consulta', sourceLang: 'pt-BR', targetLang: 'en' });
check('translate Ifá → Ifa', r2.output.includes('Ifa'));

const r3 = eng.translateText({ text: 'Kether e Binah', sourceLang: 'pt-BR', targetLang: 'en' });
check('translate Cabala preserve', r3.output.includes('Kether') && r3.output.includes('Binah'));

const r4 = eng.translateText({ text: 'Meu Ascendente', sourceLang: 'pt-BR', targetLang: 'en' });
check('translate Ascendente → Ascendant', r4.output.includes('Ascendant'));

const r5 = eng.translateText({ text: 'Kundalini e Mantra', sourceLang: 'pt-BR', targetLang: 'en' });
check('translate Tantra preserve', r5.output.includes('Kundalini') && r5.output.includes('Mantra'));

const r6 = eng.translateText({ text: 'A Estrela do Tarô Cigano', sourceLang: 'pt-BR', targetLang: 'en' });
check('translate Cigano cards', r6.output.includes('The Star'));

// --- 5. idempotency ---
const r7 = eng.translateText({ text: 'Oxalá é pai', sourceLang: 'pt-BR', targetLang: 'pt-BR' });
check('same-lang returns input', r7.output === 'Oxalá é pai');
const r8 = eng.translateText({ text: '', sourceLang: 'pt-BR', targetLang: 'en' });
check('empty input', r8.output === '');

// --- 6. validation ---
const v1 = validateTranslation('Olá mundo', 'pt-BR', 'en');
check('validate plain text ok', v1.ok);
const v2 = validateTranslation('Oxalá é pai', 'pt-BR', 'en');
check('validate sacred text ok', v2.ok);

// --- 7. audit log ---
const auditBefore = eng.exportAudit().length;
eng.translateText({ text: 'cache-hit-smoke', sourceLang: 'pt-BR', targetLang: 'en' });
eng.translateText({ text: 'cache-hit-smoke', sourceLang: 'pt-BR', targetLang: 'en' });
const auditA = eng.exportAudit();
check('audit has entries', auditA.length - auditBefore >= 2, `before=${auditBefore} after=${auditA.length}`);
check('audit is frozen array', Object.isFrozen(auditA));
check('audit[0] frozen', auditA[0] !== undefined && Object.isFrozen(auditA[0]));
check('audit cacheHit captured', auditA.slice(-2).some((r) => r.cacheHit === true));

// --- 8. cache key + canonical json ---
const k1 = hashCacheKey({ text: 'oxalá', sourceLang: 'pt-BR', targetLang: 'en' });
const k2 = hashCacheKey({ text: 'oxalá', sourceLang: 'pt-BR', targetLang: 'en' });
check('cache key deterministic', k1 === k2);
const k3 = hashCacheKey({ text: 'oxalá', sourceLang: 'pt-BR', targetLang: 'es' });
check('cache key differs by lang', k1 !== k3);
const c1 = canonicalJson({ b: 2, a: 1 });
const c2 = canonicalJson({ a: 1, b: 2 });
check('canonical json order-independent', c1 === c2);

// --- 9. SHA-256 hex correctness ---
check('sha256 empty', sha256Hex('') === 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
check('sha256 abc', sha256Hex('abc') === 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
check('sha256 64 hex chars', sha256Hex('x').length === 64);
check('sha256 deterministic', sha256Hex('det-check') === sha256Hex('det-check'));

// --- 10. custom translations ---
expectThrow('readonly engine rejects register',
  () => engRO.registerCustomTranslation(sacredTermId('X'), 'en', {
    term: 'X', tradition: 'cabala', mode: 'translate', aliases: [], notes: '',
  }),
  /readonly/,
);
const eng2 = createTranslationEngine({ readonly: false });
eng2.registerCustomTranslation(sacredTermId('Oxalá'), 'en', {
  term: 'OXALA-OVERRIDE', tradition: 'candomble', mode: 'translate', aliases: [], notes: '',
});
const rCustom = eng2.translateText({ text: 'Oxalá', sourceLang: 'pt-BR', targetLang: 'en' });
check('custom translation overrides', rCustom.output.includes('OXALA-OVERRIDE'));

// --- 11. dictionary structural freezing ---
const dictEn = getSacredDictionary('en');
check('dict frozen array', Object.isFrozen(dictEn));
if (dictEn[0]) {
  const e0 = dictEn[0];
  check('dict entry frozen', Object.isFrozen(e0));
  check('dict entry aliases frozen', Object.isFrozen(e0.aliases));
}
check('dict contains all 7 traditions', (() => {
  const trads = new Set(dictEn.map((d) => d.tradition));
  return SACRED_TRADITIONS.every((t) => trads.has(t));
})());

// --- 12. multi-lang translation works ---
const r9 = eng.translateText({ text: 'Oxalá preside Kether no Ascendente', sourceLang: 'pt-BR', targetLang: 'en' });
check('multi-tradition translate hits >= 3', r9.hits.length >= 3, `hits=${r9.hits.length}`);
check('multi-tradition translate keeps structure', r9.output.includes('Oxalá') && r9.output.includes('Kether') && r9.output.includes('Ascendant'));

// --- 13. top-level wrappers ---
check('top-level translateText', typeof translateText === 'function');
check('top-level lookupTerm', typeof lookupTerm === 'function');
check('top-level registerCustomTranslation', typeof registerCustomTranslation === 'function');
check('top-level getSacredDictionary', typeof getSacredDictionary === 'function');
check('top-level validateTranslation', typeof validateTranslation === 'function');
check('top-level exportAudit', typeof exportAudit === 'function');
check('top-level hashCacheKey', typeof hashCacheKey === 'function');
check('DEFAULT_LANG === pt-BR', DEFAULT_LANG === 'pt-BR');
// Sanity: dup import didn't shadow the namespace
check('SACRED_LANGS length 3', _LANGS_DUP.length === 3);

// --- 14. _resetForTest ---
eng2.translateText({ text: 'reset-me', sourceLang: 'pt-BR', targetLang: 'en' });
eng2._resetForTest();
check('reset clears audit', eng2.exportAudit().length === 0);

// ===========================================================================
// FINAL REPORT
// ===========================================================================

process.stdout.write(`\n=== ${CHECK_COUNT} checks; ${FAILURES} failures ===\n`);
if (FAILURES === 0) {
  process.stdout.write('SMOKE PASS ✅\n');
  process.exit(0);
} else {
  process.stdout.write('SMOKE FAIL ✗\n');
  process.exit(1);
}
