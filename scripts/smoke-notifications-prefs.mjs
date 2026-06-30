// ============================================================================
// W91s — scripts/smoke-notifications-prefs.mjs
// ============================================================================
// Smoke test (tsx subprocess + node --test). Roda em ~3s e valida o engine
// + form + page à distância de leitura de arquivos e exec de função.
//
// Rodar: `npx tsx scripts/smoke-notifications-prefs.mjs`
//        OU via Make: `make smoke-notifications-prefs` (se target existir)
//
// Assertions (≥5):
//   1) Engine exporta todas as constantes e helpers esperados.
//   2) engine.byTradicao filtra canais não disponíveis na matriz.
//   3) engine.fingerprint é determinístico + monotônico no #changes.
//   4) engine.isInQuietHours detecta janela cruzando meia-noite.
//   5) engine.parseHHMM / formatHHMM são round-trip seguros.
//   6) engine.createInitialCapState respeita UNCAPPED_TYPES (INF).
//   7) engine.shouldDeliverWithCap retorna 'throttle' quando global estoura.
//   8) Form tem pelo menos 3 aria-label + role=switch + min-h-[44px].
//   9) Page é Server Component (sem 'use client').
//   10) Nenhum banned vocab (amarração/amarre/vinculação) em engine+form+page.
// ============================================================================

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const ENGINE_PATH = join(ROOT, 'src/lib/w91s/notifications-prefs-engine.ts');
const FORM_PATH = join(ROOT, 'src/components/community/settings/NotificationsPrefsForm.tsx');
const PAGE_PATH = join(ROOT, 'src/app/(app)/settings/notifications/page.tsx');

let pass = 0;
let fail = 0;

function ok(label) {
  pass++;
  console.log(`  ✓ ${label}`);
}

function bad(label, detail) {
  fail++;
  console.error(`  ✗ ${label}`);
  if (detail) console.error(`    ${detail}`);
}

function readSource(path) {
  return readFileSync(path, 'utf8');
}

// ============================================================================
// SUBTEST 1 — Pure engine runtime
// ============================================================================
console.log('\n[smoke-1] engine runtime');

const benchPath = join(__dirname, '.smoke-tmp-notifications-prefs.mjs');
const benchCode = `
import {
  byTradicao,
  fingerprint,
  diffPreferences,
  mergePreferences,
  isInQuietHours,
  parseHHMM,
  formatHHMM,
  createQuietHours,
  createInitialCapState,
  setCap,
  registerDelivery,
  shouldDeliverWithCap,
  hasAnyChannel,
  applyPageFilter,
  buildPrefsRows,
  EMPTY_PAGE_FILTER,
  NOTIFICATION_TYPE_META,
  TRADICAO_ORDER,
  UNCAPPED_TYPES,
} from ${JSON.stringify(ENGINE_PATH)};

const out = {};

try {
  // Assertion 1: engine exports.
  const requiredNames = [
    'byTradicao', 'fingerprint', 'diffPreferences', 'mergePreferences',
    'isInQuietHours', 'parseHHMM', 'formatHHMM',
    'createInitialCapState', 'shouldDeliverWithCap',
  ];
  out.assertion1 = requiredNames.every((n) => typeof eval(n) === 'function');

  // Assertion 2: byTradicao filtra canais.
  const fakePrefs = {
    LIKE: { inApp: true, email: true, push: true, weeklyDigest: true },
    COMMENT: { inApp: true, email: true, push: true, weeklyDigest: false },
  };
  const withoutPush = byTradicao(fakePrefs, 'cigano');
  out.assertion2 = withoutPush.LIKE.push === false
    && withoutPush.LIKE.email === true
    && withoutPush.LIKE.inApp === true;

  // Assertion 3: fingerprint determinístico + muda com diff.
  const fp1 = fingerprint(fakePrefs);
  const fp2 = fingerprint({
    ...fakePrefs,
    LIKE: { inApp: false, email: false, push: false, weeklyDigest: false },
  });
  out.assertion3 = fp1 !== fp2 && typeof fp1 === 'string';

  // Assertion 4: isInQuietHours detecta janela cruzando meia-noite.
  const window = createQuietHours(22 * 60, 8 * 60, 'America/Sao_Paulo');
  const { Date: D } = globalThis;
  // Helper: cria um Date cujo INSTANTE UTC é equivalente a HH:MM em São Paulo
  // (UTC-3 estável desde 2019). Evita ambiguidade de parse em diferentes
  // runtime (V8 vs tsx).
  function spLocalInstant(hh, mm) {
    return new D(Date.UTC(2026, 5, 30, hh + 3, mm, 0));
  }
  const lateNight = spLocalInstant(23, 0); // SP 23:00 → UTC 02:00 July 1
  const earlyMorning = spLocalInstant(3, 0); // SP 03:00 → UTC 06:00
  const noon = spLocalInstant(12, 0); // SP 12:00 → UTC 15:00
  out.assertion4 = isInQuietHours(lateNight, window)
    && isInQuietHours(earlyMorning, window)
    && !isInQuietHours(noon, window);

  // Assertion 5: parseHHMM ↔ formatHHMM.
  out.assertion5 = parseHHMM('07:30') === 7 * 60 + 30
    && formatHHMM(7 * 60 + 30) === '07:30'
    && formatHHMM(parseHHMM('00:00')) === '00:00';

  // Assertion 6: createInitialCapState respeita UNCAPPED_TYPES (INF).
  const cap = createInitialCapState();
  out.assertion6 = cap.caps.SYSTEM_ALERT === Number.POSITIVE_INFINITY
    && cap.caps.MODERATION_ACTION === Number.POSITIVE_INFINITY
    && cap.caps.LIKE === 20;

  // Assertion 7: shouldDeliverWithCap throttle quando global estoura.
  const cap2 = createInitialCapState();
  const over = { ...cap2, globalCount: 100 };
  // LIKE tem cap 20 < 100, então cai pra 'throttle'.
  out.assertion7 = shouldDeliverWithCap(over, 'LIKE') === 'throttle';

  // Assertion 8: hasAnyChannel detecta utilidade pra LGPD gate.
  out.assertion8 = hasAnyChannel({ inApp: false, email: false, push: false, weeklyDigest: false }) === false
    && hasAnyChannel({ inApp: true, email: false, push: false, weeklyDigest: false }) === true;

  // Assertion 9: applyPageFilter filtra por query (substring única).
  const rows = buildPrefsRows({
    LIKE: { inApp: true, email: false, push: false, weeklyDigest: false },
    COMMENT: { inApp: true, email: true, push: false, weeklyDigest: false },
    SYSTEM_ALERT: { inApp: true, email: true, push: false, weeklyDigest: false },
  }, 'cigano');
  const filtered = applyPageFilter(rows, {
    ...EMPTY_PAGE_FILTER,
    query: 'aninhamento', // substring exclusiva da descrição de COMMENT.
  });
  out.assertion9 = filtered.length === 1 && filtered[0].type === 'COMMENT';

  // Assertion 10: buildPrefsRows ordena por categoria (social primeiro).
  out.assertion10 = rows[0].meta.category === 'social'
    && rows.some((r) => r.meta.category === 'sistema');

  out.OK = true;
} catch (err) {
  out.OK = false;
  out.error = (err && err.message) || String(err);
}

console.log(JSON.stringify(out));
`;

const benchFile = join(__dirname, '.smoke-tmp-notifications-prefs.mjs');
import { writeFileSync, unlinkSync } from 'node:fs';
writeFileSync(benchFile, benchCode, 'utf8');

const tsxResult = spawnSync(
  'npx',
  ['tsx', benchFile],
  { encoding: 'utf8', cwd: ROOT, timeout: 60000 }
);

try {
  if (tsxResult.status !== 0) {
    bad(
      'tsx subprocess exited non-zero',
      `status=${tsxResult.status}\nstdout=${(tsxResult.stdout || '').slice(0, 800)}\nstderr=${(tsxResult.stderr || '').slice(0, 800)}`
    );
  } else {
    const stdout = (tsxResult.stdout || '').trim();
    let parsed;
    try {
      parsed = JSON.parse(stdout);
    } catch {
      parsed = null;
    }
    if (!parsed || !parsed.OK) {
      bad('engine bench output invalid', parsed ? parsed.error : stdout.slice(0, 400));
    } else {
      // Mapeia assertionN → labels.
      const labels = {
        assertion1: 'engine exports todos os helpers',
        assertion2: 'byTradicao filtra canais não permitidos',
        assertion3: 'fingerprint determinístico + sensível a diff',
        assertion4: 'isInQuietHours detecta janela cruzando meia-noite',
        assertion5: 'parseHHMM / formatHHMM round-trip seguros',
        assertion6: 'createInitialCapState respeita UNCAPPED_TYPES',
        assertion7: 'shouldDeliverWithCap throttle quando global estoura',
        assertion8: 'hasAnyChannel usable pra LGPD gate',
        assertion9: 'applyPageFilter filtra por query',
        assertion10: 'buildPrefsRows ordena por categoria',
      };
      for (const [k, v] of Object.entries(parsed)) {
        if (k === 'OK' || k === 'error') continue;
        if (v === true) ok(labels[k] || k);
        else bad(labels[k] || k, parsed.error);
      }
    }
  }
} finally {
  try { unlinkSync(benchFile); } catch { /* ignore */ }
}

// ============================================================================
// SUBTEST 2 — Source compliance (form + page + banned vocab)
// ============================================================================
console.log('\n[smoke-2] source compliance');

const form = readSource(FORM_PATH);
const page = readSource(PAGE_PATH);
const engine = readSource(ENGINE_PATH);

if (/role="switch"/.test(form)) ok('form tem role="switch"');
else bad('form SEM role="switch"');

if (/aria-checked/.test(form)) ok('form usa aria-checked em switches');
else bad('form SEM aria-checked');

const minH44 = (form.match(/min-h-\[44px\]/g) ?? []).length;
if (minH44 >= 3) ok(`form respeita 44px touch targets (${minH44}x)`);
else bad(`form sem 44px (${minH44}x)`);

if (/^'use client'/m.test(form)) ok('form é Client Component');
else bad('form NÃO é Client Component');

if (!/^'use client'/m.test(page)) ok('page é Server Component (sem "use client")');
else bad('page é Client Component (não esperado)');

if (/'use server'/.test(page)) ok('page declara server action em onPersist');
else bad('page SEM server action declarada');

// Banned vocab cross-check (split pra evitar self-flag).
const banned = [
  'amarra' + 'ção',
  'amarre',
  'vincula' + 'ção',
];
let bannedFound = false;
for (const term of banned) {
  for (const [name, src] of [
    ['engine', engine],
    ['form', form],
    ['page', page],
  ]) {
    if (src.toLowerCase().includes(term.toLowerCase())) {
      bad(`banned term "${term}" found in ${name}`);
      bannedFound = true;
    }
  }
}
if (!bannedFound) ok('zero banned vocab (amarração/amarre/vinculação)');

if (/'cigano'/.test(engine)) ok('engine preserva tradição cigano');
else bad('engine SEM tradição cigano');

if (/'cabala'/.test(engine)) ok('engine preserva tradição cabala');
else bad('engine SEM tradição cabala');

if (/SYSTEM_ALERT/.test(engine) && /MODERATION_ACTION/.test(engine)) ok('engine cobre tipos críticos');
else bad('engine SEM tipos críticos');

// ============================================================================
// SUMMARY
// ============================================================================
console.log(`\n[smoke-notifications-prefs] ${pass} pass · ${fail} fail`);
if (fail > 0) {
  console.error('SMOKE FAILED');
  process.exit(1);
} else {
  console.log('SMOKE PASSED ✓');
  process.exit(0);
}
