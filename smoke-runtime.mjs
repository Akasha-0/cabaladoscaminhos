// smoke-runtime.mjs — Cycle 64 Worker B2 runtime smoke (6 paths)
import {
  lookupQuote, searchQuotes, pickQuoteByTradition,
  pickQuoteByCard, pickQuoteByNumerology, pickQuoteByContext,
  auditSacredCoverage, FORBIDDEN_CONTEXTS, ALL_QUOTES,
  SacredBoundaryError,
} from './src/lib/w64/sacred_text_quote_engine.ts';

const out = (s) => {
  const stdout = globalThis.process?.stdout;
  if (stdout) stdout.write(s + '\n'); else console.log(s);
};

let pass = 0, fail = 0;
const ok = (label, cond) => {
  if (cond) { pass += 1; out(`  PASS ${label}`); }
  else { fail += 1; out(`  FAIL ${label}`); }
};

// 1. lookupQuote
const cd01 = lookupQuote('cd-01');
ok('1. lookupQuote("cd-01")', cd01?.tradition === 'candomble');

// 2. searchQuotes
const sResults = searchQuotes({ tradition: 'cabala', limit: 50 });
ok('2. searchQuotes(cabala).length === 12', sResults.length === 12);

// 3. pickQuoteByTradition
const pickCd = pickQuoteByTradition('candomble', { topic: 'paz' });
ok('3. pickQuoteByTradition(candomble, paz)', pickCd.tradition === 'candomble');

// 4. pickQuoteByCard
const pickCard = pickQuoteByCard(1);
ok('4. pickQuoteByCard(1) returns cavaleiro', pickCard.sacredRefs.some(r => r.kind === 'card' && r.value === '1'));

// 5. pickQuoteByNumerology
const pickNum = pickQuoteByNumerology(7);
ok('5. pickQuoteByNumerology(7) returns 7-tagged', pickNum.sacredRefs.some(r => r.kind === 'numerology' && r.value === '7'));

// 6. anti-misuse
let boundaryThrown = false;
try {
  pickQuoteByContext({ situation: 'medical-diagnosis' });
} catch (e) {
  boundaryThrown = e instanceof SacredBoundaryError && e.code === 'SACRED_BOUNDARY';
}
ok('6. anti-misuse (medical-diagnosis) throws SacredBoundaryError', boundaryThrown);

// bonus checks
ok('7. ALL_QUOTES.length >= 100', ALL_QUOTES.length >= 100);
ok('8. auditSacredCoverage.isFullCoverage', auditSacredCoverage().isFullCoverage);
ok('9. FORBIDDEN_CONTEXTS has 6 entries', FORBIDDEN_CONTEXTS.length === 6);

out(`\n=== Smoke: ${pass}/${pass + fail} PASS ===`);
const proc = globalThis.process;
if (proc) proc.exit(fail > 0 ? 1 : 0);