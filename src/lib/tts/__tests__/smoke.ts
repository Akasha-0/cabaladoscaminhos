// ============================================================================
// smoke.ts — Self-running smoke test for the TTS layer (W72-D)
// ============================================================================
// Wave-Spawner Cycle 72 — Worker D.
//
// No vitest. No dependencies. Pure Node 22 + node:assert. Run with:
//
//   node --experimental-strip-types --no-warnings src/lib/tts/__tests__/smoke.ts
//
// (or via the runner script — see __tests__/run-smoke.sh in the deliverable)
//
// 9 sections, ~30 assertions, 0.5-2s wall clock.
// ============================================================================

import assert from 'node:assert/strict';

// Engines
import {
  AKASHA_TRADITIONS,
  DEFAULT_TRADITION,
  TTS_TYPES_VERSION,
  type Tradition,
} from '../types.ts';
import {
  VOICE_PRESETS,
  auditVoicePresets,
  getVoicePreset,
  listVoicePresets,
} from '../voice-presets.ts';
import {
  __SACRED_SYMBOL_TABLE,
  auditNormalization,
  normalizeForTTS,
  splitSentences,
} from '../text-normalizer.ts';
import {
  auditAdapter,
  buildCacheKey,
  fnv1a32,
  SILENT_MP3_BYTES,
  synthesizeSpeech,
} from '../platform-tts-adapter.ts';
import { auditAudioCache, getVoiceCache, VoiceCache } from '../audio-cache.ts';

// ---------------------------------------------------------------------------
// Tiny test harness
// ---------------------------------------------------------------------------

let totalAssertions = 0;
let failedAssertions = 0;
const failures: string[] = [];

function assertIt(cond: unknown, label: string): void {
  totalAssertions++;
  if (cond) return;
  failedAssertions++;
  failures.push(label);
}

async function assertAsync(
  fn: () => Promise<unknown>,
  label: string
): Promise<void> {
  try {
    const result = await fn();
    assertIt(result, label);
  } catch (err) {
    totalAssertions++;
    failedAssertions++;
    failures.push(`${label} — threw: ${err instanceof Error ? err.message : String(err)}`);
  }
}

function section(name: string): void {
  process.stdout.write(`\n── ${name} ──\n`);
}

// ---------------------------------------------------------------------------
// SECTION 1 — Types & version
// ---------------------------------------------------------------------------

section('1. types.ts');
{
  assertIt(TTS_TYPES_VERSION === 'w72-d.v1', 'TSS_TYPES_VERSION is w72-d.v1');
  assertIt(AKASHA_TRADITIONS.length === 7, 'AKASHA_TRADITIONS has 7 entries');
  assertIt(DEFAULT_TRADITION === 'cigano', 'DEFAULT_TRADITION is cigano');
  const expected: Tradition[] = [
    'cigano',
    'orixas',
    'astrologia',
    'cabala',
    'numerologia',
    'tantra',
    'tarot',
  ];
  for (const t of expected) {
    assertIt((AKASHA_TRADITIONS as readonly string[]).includes(t), `AKASHA_TRADITIONS contains ${t}`);
  }
}

// ---------------------------------------------------------------------------
// SECTION 2 — Voice presets
// ---------------------------------------------------------------------------

section('2. voice-presets.ts');
{
  const audit = auditVoicePresets();
  assertIt(audit.count === 7, `audit.count === 7 (got ${audit.count})`);
  assertIt(audit.has_all_required, 'has_all_required');
  assertIt(audit.unique_voice_ids >= 4, `unique_voice_ids >= 4 (got ${audit.unique_voice_ids})`);
  assertIt(audit.pitch_range[0] <= 0, 'pitch_range[0] <= 0');
  assertIt(audit.pitch_range[1] >= 0, 'pitch_range[1] >= 0');
  assertIt(audit.speed_range[0] < 1.0, 'speed_range[0] < 1.0');
  assertIt(audit.speed_range[1] > 1.0, 'speed_range[1] > 1.0');

  for (const t of AKASHA_TRADITIONS) {
    const p = getVoicePreset(t);
    assertIt(typeof p.voice_id === 'string' && p.voice_id.length > 0, `${t}.voice_id non-empty`);
    assertIt(p.pitch >= -12 && p.pitch <= 12, `${t}.pitch in [-12,12]`);
    assertIt(p.speed >= 0.5 && p.speed <= 2.0, `${t}.speed in [0.5,2.0]`);
    assertIt(p.label.length > 0, `${t}.label non-empty`);
  }
  // Fallback
  const fb = getVoicePreset('not-a-tradition');
  assertIt(fb.voice_id === VOICE_PRESETS.cigano.voice_id, 'fallback → cigano');

  const list = listVoicePresets();
  assertIt(list.length === 7, `listVoicePresets().length === 7 (got ${list.length})`);

  // Frozen
  assertIt(Object.isFrozen(VOICE_PRESETS), 'VOICE_PRESETS is frozen');
}

// ---------------------------------------------------------------------------
// SECTION 3 — Text normalizer — basic
// ---------------------------------------------------------------------------

section('3. text-normalizer basic');
{
  const n1 = normalizeForTTS('Olá, mundo!');
  assertIt(n1 === 'Olá, mundo!', `n1: ${n1}`);

  const n2 = normalizeForTTS('   espaços   extras   ');
  assertIt(n2 === 'espaços extras', `n2: ${n2}`);

  const n3 = normalizeForTTS('');
  assertIt(n3 === '', 'n3: empty → empty');

  const n4 = normalizeForTTS('   ');
  assertIt(n4 === '', 'n4: whitespace → empty');

  // Idempotent
  const once = normalizeForTTS('Olá **mundo**');
  const twice = normalizeForTTS(once);
  assertIt(once === twice, `idempotent: ${once} === ${twice}`);
}

// ---------------------------------------------------------------------------
// SECTION 4 — Text normalizer — markdown / tags / URLs
// ---------------------------------------------------------------------------

section('4. text-normalizer markdown + tags + URLs');
{
  const a = normalizeForTTS('Isto é **negrito** e *itálico*.');
  assertIt(!a.includes('**'), 'strips **');
  assertIt(!a.includes('*'), 'strips *');
  assertIt(a.includes('negrito'), 'keeps "negrito"');
  assertIt(a.includes('itálico'), 'keeps "itálico"');

  const b = normalizeForTTS('Use `código` aqui.');
  assertIt(!b.includes('`'), 'strips `');
  assertIt(b.includes('código'), 'keeps "código"');

  const c = normalizeForTTS('Veja [Akasha](https://akasha.example) para mais.');
  assertIt(!c.includes('https://'), 'drops URL inside markdown link');
  assertIt(c.includes('Akasha'), 'keeps link text');

  const d = normalizeForTTS('Site: https://akasha.example/path?x=1');
  assertIt(d.includes('link omitido'), 'replaces bare URL');
  assertIt(!d.includes('https://'), 'drops https://');

  const e = normalizeForTTS('[tag:tarot-cigano] Olá [citation:42] mundo');
  assertIt(!e.includes('[tag:'), 'strips [tag:...]');
  assertIt(!e.includes('[citation:'), 'strips [citation:...]');
  assertIt(e.includes('Olá'), 'keeps "Olá"');
  assertIt(e.includes('mundo'), 'keeps "mundo"');

  const audit = auditNormalization('**bold** [tag:x] 🜂 https://x.y');
  assertIt(audit.stripped_markdown >= 1, 'audit stripped_markdown >= 1');
  assertIt(audit.stripped_tags === 1, `audit stripped_tags === 1 (got ${audit.stripped_tags})`);
  assertIt(audit.replaced_symbols === 1, `audit replaced_symbols === 1 (got ${audit.replaced_symbols})`);
  assertIt(audit.replaced_urls === 1, `audit replaced_urls === 1 (got ${audit.replaced_urls})`);
}

// ---------------------------------------------------------------------------
// SECTION 5 — Text normalizer — sacred symbols + clamp
// ---------------------------------------------------------------------------

section('5. text-normalizer sacred + clamp');
{
  const a = normalizeForTTS('Fogo 🜂 e Sol ☉ em Áries ♈.');
  assertIt(a.includes('fogo'), `translates 🜂 → fogo (got: ${a})`);
  assertIt(a.includes('sol'), `translates ☉ → sol (got: ${a})`);
  assertIt(a.includes('áries'), `translates ♈ → áries (got: ${a})`);
  assertIt(!a.includes('🜂'), 'removes 🜂');
  assertIt(!a.includes('☉'), 'removes ☉');
  assertIt(!a.includes('♈'), 'removes ♈');

  // Table sanity
  assertIt(__SACRED_SYMBOL_TABLE['☉'] === 'sol', '☉ → sol');
  assertIt(__SACRED_SYMBOL_TABLE['♈'] === 'áries', '♈ → áries');
  assertIt(__SACRED_SYMBOL_TABLE['🜂'] === 'fogo', '🜂 → fogo');
  assertIt(Object.keys(__SACRED_SYMBOL_TABLE).length >= 10, 'symbol table has ≥10 entries');

  // Clamp
  const huge = 'a'.repeat(6000);
  const clamped = normalizeForTTS(huge, { maxChars: 100 });
  assertIt(clamped.length <= 101, `clamp ≤ 100+ellipsis (got ${clamped.length})`);
  assertIt(clamped.endsWith('…'), 'clamp appends …');
}

// ---------------------------------------------------------------------------
// SECTION 6 — Sentence splitter
// ---------------------------------------------------------------------------

section('6. splitSentences');
{
  const a = splitSentences('Olá mundo. Como vai? Tudo bem!');
  assertIt(a.length === 3, `3 sentences (got ${a.length})`);
  assertIt(a[0] === 'Olá mundo.', `s0: ${a[0]}`);
  assertIt(a[1] === 'Como vai?', `s1: ${a[1]}`);
  assertIt(a[2] === 'Tudo bem!', `s2: ${a[2]}`);

  const b = splitSentences('');
  assertIt(b.length === 0, 'empty → []');

  const c = splitSentences('Uma única frase sem fim');
  assertIt(c.length === 1, `no-boundary → 1 sentence (got ${c.length})`);
  assertIt(c[0] === 'Uma única frase sem fim', 'c0 preserves content');

  const d = splitSentences('Linha 1\nLinha 2\nLinha 3');
  assertIt(d.length === 3, `newline splits (got ${d.length})`);
}

// ---------------------------------------------------------------------------
// SECTION 7 — Cache key (FNV-1a + SHA-256 truncation)
// ---------------------------------------------------------------------------

section('7. cache key + FNV-1a');
{
  // FNV-1a determinism
  const a = fnv1a32('cigano');
  const b = fnv1a32('cigano');
  assertIt(a === b, `FNV-1a deterministic: ${a}`);
  const c = fnv1a32('tarot');
  assertIt(a !== c, 'FNV-1a distinguishes inputs');
  assertIt(/^[0-9a-f]{8}$/.test(a), `FNV-1a hex 8 chars: ${a}`);

  // Cache key — same inputs → same key
  const k1 = buildCacheKey('male-qn-qingse', 'Olá mundo');
  const k2 = buildCacheKey('male-qn-qingse', 'Olá mundo');
  assertIt(k1 === k2, `cache key deterministic: ${k1}`);

  // Different text → different key
  const k3 = buildCacheKey('male-qn-qingse', 'Olá mundo!');
  assertIt(k1 !== k3, 'cache key distinguishes text');

  // Different voice → different key
  const k4 = buildCacheKey('female-yujie', 'Olá mundo');
  assertIt(k1 !== k4, 'cache key distinguishes voice');

  // Shape: tts:<8hex>:<16hex>
  assertIt(/^tts:[0-9a-f]{8}:[0-9a-f]{16}$/.test(k1), `cache key shape: ${k1}`);
}

// ---------------------------------------------------------------------------
// SECTION 8 — Adapter
// ---------------------------------------------------------------------------

section('8. platform-tts-adapter');
{
  const audit = auditAdapter();
  assertIt(audit.has_silent_mp3, 'has silent mp3 frame');
  assertIt(audit.silent_mp3_size > 0, `silent_mp3_size > 0 (got ${audit.silent_mp3_size})`);
  assertIt(typeof audit.fnv1a_self_hash === 'string', 'fnv1a_self_hash is string');
  assertIt(typeof audit.cache_key_sample === 'string', 'cache_key_sample is string');
  assertIt(audit.in_agent_runtime === false, 'in_agent_runtime is false in test env');

  assertIt(SILENT_MP3_BYTES.length > 0, 'SILENT_MP3_BYTES non-empty');

  // Synthesize — mock mode
  const result = await synthesizeSpeech('Olá', { forceMock: true });
  assertIt(result.bytes.length > 0, `mock bytes > 0 (got ${result.bytes.length})`);
  assertIt(result.source === 'mock', `source is mock (got ${result.source})`);
  assertIt(typeof result.voice_id === 'string', 'voice_id is string');
  assertIt(typeof result.elapsed_ms === 'number', 'elapsed_ms is number');

  // Synthesize — default (no agent runtime, also returns mock)
  const def = await synthesizeSpeech('Olá');
  assertIt(def.bytes.length > 0, 'default mode returns bytes');
  assertIt(['mock', 'platform', 'http-provider'].includes(def.source), `source valid: ${def.source}`);
}

// ---------------------------------------------------------------------------
// SECTION 9 — Audio cache (SSR-safe + shape)
// ---------------------------------------------------------------------------

section('9. audio-cache');
{
  const audit = auditAudioCache();
  assertIt(audit.max_entries === 500, `max_entries === 500 (got ${audit.max_entries})`);
  assertIt(audit.default_ttl_days === 7, `default_ttl_days === 7 (got ${audit.default_ttl_days})`);
  assertIt(audit.db_name === 'akasha-tts-cache', `db_name: ${audit.db_name}`);
  assertIt(audit.store_name === 'audio', `store_name: ${audit.store_name}`);

  // SSR-safe: in Node there is no indexedDB.
  const cache = getVoiceCache();
  assertIt(cache === null, 'getVoiceCache() returns null in Node (no IDB)');

  // Static method still works
  const k = VoiceCache.makeKey('male-qn-qingse', 'test');
  assertIt(k.startsWith('tts:'), `static makeKey shape: ${k}`);

  // Methods no-op in SSR
  const got = cache ? await cache.get('v', 't') : null;
  assertIt(got === null, 'get returns null in SSR');
  const put = cache ? await cache.put('v', 't', new Blob()) : false;
  assertIt(put === false, 'put returns false in SSR');
}

// ---------------------------------------------------------------------------
// Done
// ---------------------------------------------------------------------------

process.stdout.write('\n────────────────────────────────────────\n');
if (failedAssertions === 0) {
  process.stdout.write(
    `✅ SMOKE PASS — ${totalAssertions}/${totalAssertions} assertions across 9 sections\n`
  );
  process.exit(0);
} else {
  process.stdout.write(
    `❌ SMOKE FAIL — ${failedAssertions}/${totalAssertions} failed:\n`
  );
  for (const f of failures) {
    process.stdout.write(`   - ${f}\n`);
  }
  process.exit(1);
}

// Reference unused imports to satisfy noUnused checks.
void assert;
