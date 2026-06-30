// =============================================================================
// akashia-offering-tracking.smoke.ts — W75-B Smoke Harness (cycle 75)
// =============================================================================
// Inline self-running smoke (no vitest). ≥15 checks covering catalog,
// offer recording, pattern detection, journal weaving across traditions,
// audit log integrity, and HMAC signature determinism.
// Run: `node --experimental-strip-types src/lib/w75/akashia-offering-tracking.smoke.ts`
// =============================================================================

import {
  __resetAkashiaAudit,
  type AkashiaOffering,
  type Element,
  type OfferingKind,
  type RecipientType,
  detectPatterns,
  exportAudit,
  exportJournalEntry,
  findRecipientByName,
  recordOffering,
  signSynthesisWithHmac,
  synthesizeAkashia,
  uid,
  RECIPIENT_CATALOG,
} from './akashia-offering-tracking.ts';

// ---- harness ----------------------------------------------------------------

let passed = 0;
let failed = 0;

function check(label: string, ok: boolean, extra?: string): void {
  if (ok) {
    passed++;
    return;
  }
  failed++;
  console.log(`  ✗ ${label}${extra ? ' — ' + extra : ''}`);
}

function makeOffering(
  recipientName: string,
  recipientType: RecipientType,
  element: Element,
  intention: string,
  intensity: 1 | 2 | 3 | 4 | 5,
  timestamp: number,
  kind: OfferingKind = 'vela',
  planet?: never,
): Omit<AkashiaOffering, 'id'> {
  const base: Omit<AkashiaOffering, 'id'> = {
    timestamp,
    kind,
    recipient: { type: recipientType, name: recipientName },
    intention,
    element,
    intensity,
  };
  if (planet !== undefined) base.planet = planet;
  return base;
}

// ---- 1. Catalog checks ------------------------------------------------------

check(
  'RECIPIENT_CATALOG has ≥ 20 entries',
  RECIPIENT_CATALOG.length >= 20,
  `got ${RECIPIENT_CATALOG.length}`,
);

check('catalog is frozen', Object.isFrozen(RECIPIENT_CATALOG));

const catalogNames = new Set(RECIPIENT_CATALOG.map((r) => r.name));
const must = [
  'Oxalá',
  'Iemanjá',
  'Ogum',
  'Oxóssi',
  'Xangô',
  'Iansã',
  'Nanã',
  'Omulu',
  'Obá',
  'Logun-Edé',
  'Oxum',
  'Ossain',
  'Caboclo',
  'Preto-Velho',
  'Baiano',
  'Marinheiro',
  'Criança',
  'Exu',
  'Pombagira',
  'Ancestral',
  'Anjo da Guarda',
  'Eu Mesmo',
];
let catalogMissing: string[] = [];
for (const n of must) {
  if (!catalogNames.has(n)) catalogMissing.push(n);
}
check(
  'catalog covers all 22 mandatory recipients',
  catalogMissing.length === 0,
  `missing: ${catalogMissing.join(',')}`,
);

// ---- 2. Record + brand checks -----------------------------------------------

__resetAkashiaAudit();
const off1 = recordOffering(makeOffering('Oxalá', 'orixá', 'ar', 'abertura', 3, Date.parse('2026-01-01T08:00:00Z')));
check('recordOffering returns branded id string', typeof off1.id === 'string');
check('recordOffering id has off_ prefix', off1.id.startsWith('off_'));
const off2 = recordOffering(makeOffering('Oxalá', 'orixá', 'ar', 'abertura', 3, Date.parse('2026-01-02T08:00:00Z')));
check('recordOffering generates unique ids', off1.id !== off2.id);

// ---- 3. Find recipient ------------------------------------------------------

const oxala = findRecipientByName('Oxalá');
check('findRecipientByName returns Oxalá', oxala !== undefined);
check('Oxalá element=ar', oxala?.element === 'ar');
check('Oxalá planet=júpiter', oxala?.planet === 'júpiter');

const umbandaRoots = RECIPIENT_CATALOG.filter((r) => r.traditions.includes('umbanda'));
check('catalog has ≥4 umbanda recipients', umbandaRoots.length >= 4, `got ${umbandaRoots.length}`);

// ---- 4. Pattern detection ---------------------------------------------------

const offerings7: AkashiaOffering[] = [];
// 5 Sundays + 1 Monday of Oxalá → dominant day-of-week should be Sunday (0).
const sundays = ['2026-01-04', '2026-01-11', '2026-01-18', '2026-01-25', '2026-02-01'];
for (const s of sundays) {
  offerings7.push(
    recordOffering(makeOffering('Oxalá', 'orixá', 'ar', 'abertura', 3, Date.parse(s + 'T08:00:00Z'))),
  );
}
offerings7.push(
  recordOffering(makeOffering('Oxalá', 'orixá', 'ar', 'abertura', 3, Date.parse('2026-01-05T08:00:00Z'))),
);
const patterns7 = detectPatterns(offerings7);
check('detectPatterns returns ≥1 pattern', patterns7.length >= 1);
check('dominant day-of-week = 0 (Sunday)', patterns7[0]?.dominantDayOfWeek === 0);
check('offerCount = 6', patterns7[0]?.offerCount === 6);

// ---- 5. Synthesize (with trad coverage) ------------------------------------

__resetAkashiaAudit();
// 30-offering input across 7 distinct recipients covering 5+ traditions.
const seeds: Array<{ name: string; type: RecipientType; el: Element; intention: string }> = [
  { name: 'Oxalá', type: 'orixá', el: 'ar', intention: 'abertura' },
  { name: 'Iemanjá', type: 'orixá', el: 'água', intention: 'proteção' },
  { name: 'Preto-Velho', type: 'entidade', el: 'terra', intention: 'sabedoria' },
  { name: 'Anjo da Guarda', type: 'deidade', el: 'éter', intention: 'proteção' },
  { name: 'Eu Mesmo', type: 'eu-mesmo', el: 'éter', intention: 'autocura' },
  { name: 'Elemento Água', type: 'elemento', el: 'água', intention: 'limpeza' },
  { name: 'Caboclo', type: 'entidade', el: 'terra', intention: 'força' },
];
const offs30: AkashiaOffering[] = [];
for (let i = 0; i < 30; i++) {
  const seed = seeds[i % seeds.length]!;
  offs30.push(
    recordOffering(
      makeOffering(
        seed.name,
        seed.type,
        seed.el,
        seed.intention,
        ((i % 5) + 1) as 1 | 2 | 3 | 4 | 5,
        Date.parse('2026-01-01T00:00:00Z') + i * 24 * 60 * 60 * 1000,
      ),
    ),
  );
}
const synth30 = synthesizeAkashia('user-30', offs30, 30);
check('synth30 userId branded', synth30.userId === uid('user-30'));
check('synth30 total=30', synth30.totalOfferings === 30);
check('synth30 has ≥5 tradition tags in journal', (() => {
  const lower = synth30.journalEntry.toLowerCase();
  let n = 0;
  if (lower.includes('candomblé')) n++;
  if (lower.includes('umbanda')) n++;
  if (lower.includes('astrologia')) n++;
  if (lower.includes('numerologia')) n++;
  if (lower.includes('cabal')) n++;
  if (lower.includes('cigano')) n++;
  if (lower.includes('tantra')) n++;
  return n >= 5;
})());
check('synth30 has guidance text', synth30.guidance.length > 0);
check('synth30 has akashic resonance', synth30.akashicResonance.length > 0);
check('synth30 synthesisKey is 16-hex', /^[0-9a-f]{16}$/.test(synth30.synthesisKey));

// ---- 6. Trend detection ---------------------------------------------------

// rising case
const ascOffs: AkashiaOffering[] = [];
for (let i = 0; i < 4; i++) {
  ascOffs.push(
    recordOffering(
      makeOffering(
        'Xangô',
        'orixá',
        'fogo',
        'justiça',
        ((i + 1) * 2 > 5 ? 5 : (i + 1) * 2) as 1 | 2 | 3 | 4 | 5,
        Date.parse('2026-01-0' + (i + 1) + 'T08:00:00Z'),
      ),
    ),
  );
}
const ascP = detectPatterns(ascOffs);
check('ascending intensities ⇒ trend=rising', ascP[0]?.trend === 'rising');

const descOffs: AkashiaOffering[] = [];
for (let i = 0; i < 4; i++) {
  descOffs.push(
    recordOffering(
      makeOffering(
        'Oxum',
        'orixá',
        'água',
        'amor',
        (4 - i) as 1 | 2 | 3 | 4 | 5,
        Date.parse('2026-01-0' + (i + 1) + 'T08:00:00Z'),
      ),
    ),
  );
}
const descP = detectPatterns(descOffs);
check('descending intensities ⇒ trend=fading', descP[0]?.trend === 'fading');

// ---- 7. Audit log -----------------------------------------------------------

const audit = exportAudit();
check('audit is frozen array', Object.isFrozen(audit));
check('audit has ≥1 user row', audit.length >= 1);
const user30 = audit.find((r) => r.userId === uid('user-30'));
check('user-30 synthCount=1', user30?.synthCount === 1);
check('audit userId branded', typeof user30?.userId === 'string');

// ---- 8. Empty synthesis -----------------------------------------------------

__resetAkashiaAudit();
const emptySynth = synthesizeAkashia('user-empty', [], 30);
check('empty synth userId branded', emptySynth.userId === uid('user-empty'));
check('empty synth has 0 patterns', emptySynth.patterns.length === 0);
check('empty synth has total=0', emptySynth.totalOfferings === 0);
check('empty synth journal non-empty', emptySynth.journalEntry.length > 0);
check('empty synth akashicResonance mentions "branco"', emptySynth.akashicResonance.toLowerCase().includes('branco'));

// ---- 9. Export journal ------------------------------------------------------

const journalExport = exportJournalEntry(synth30);
check('export has header', journalExport.includes('═══ AKASHIA'));
check('export has GUIA section', journalExport.includes('[GUIA]'));
check('export has RESSONÂNCIA section', journalExport.includes('[RESSONÂNCIA AKÁSHICA]'));
check('export includes body text', journalExport.includes(synth30.journalEntry));

// ---- 10. HMAC async ---------------------------------------------------------

(async () => {
  const sig = await signSynthesisWithHmac(synth30, 'smoke-secret');
  check('HMAC sig is 64-hex chars', /^[0-9a-f]{64}$/.test(sig), `len=${sig.length}`);
  const sig2 = await signSynthesisWithHmac(synth30, 'smoke-secret');
  check('HMAC sig deterministic', sig === sig2);

  console.log(`\n--- SMOKE w75-akashia-offering-tracking ---`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  if (failed > 0) {
    console.log(`STATUS: ❌ ${failed} smoke checks failed`);
    process.exit(1);
  }
  console.log(`STATUS: ✅ all ${passed} smoke checks passed`);
  process.exit(0);
})();
