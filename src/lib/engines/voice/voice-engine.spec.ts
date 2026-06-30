/**
 * ════════════════════════════════════════════════════════════════════════════
 * W85-A — VOICE MODE AKASHA · SPEC
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Self-running test harness — no vitest. Imports the engine directly and
 * registers assertions. The spec runner at the bottom executes them and
 * prints pass/fail counts. Exits with code 0 on full PASS.
 *
 * Cycle 73 lesson: registered `it()` callbacks wrapped in a closure that
 * calls `engine.resetForTests()` BEFORE invoking the body.
 * Cycle 84-B lesson: getRecent/queue must sort/dedupe before return.
 * Cycle 84-C lesson: type-only cast doesn't trigger ts-expect-error; use `as unknown as`.
 */

// @ts-ignore — node-stubs.d.ts provides the globals.
import {
  createVoiceEngine,
  VoiceEngineImpl,
  InMemoryVoiceAdapter,
  VoiceEngineError,
  fnv1a,
  renderSacredText,
  renderSacredTextSsml,
  estimateDurationMs,
  validateRate,
  validatePitch,
  MAX_RATE,
  MIN_RATE,
  MAX_PITCH,
  MIN_PITCH,
  MAX_QUEUE_SIZE,
  MAX_TEXT_LENGTH,
  VOICE_PRESETS,
  ALL_KNOWN_VOICE_IDS,
  ALL_KNOWN_TRADICOES,
  type VoiceEngine,
  type VoicePresetId,
  type TradicaoName,
  type CueId,
} from './voice-engine.ts';

// `process` is not declared in our lean node-stubs.d.ts. Declare inline.
declare const process: { exit(code: number): never };

// ════════════════════════════════════════════════════════════════════════════
// Tiny harness
// ════════════════════════════════════════════════════════════════════════════

interface SpecEntry {
  name: string;
  run: () => void | Promise<void>;
}

const SPEC_REGISTRY: SpecEntry[] = [];

function it(name: string, run: () => void | Promise<void>): void {
  SPEC_REGISTRY.push({ name, run: () => run() });
}

function assertEqual<T>(actual: T, expected: T, label?: string): void {
  const ok = Object.is(actual, expected) || JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) {
    throw new Error(
      `assertEqual FAIL${label ? ' (' + label + ')' : ''}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    );
  }
}

function assertTrue(v: unknown, label?: string): void {
  if (!v) throw new Error(`assertTrue FAIL${label ? ' (' + label + ')' : ''}: ${String(v)}`);
}

function assertContains(haystack: string, needle: string, label?: string): void {
  if (!haystack.includes(needle)) {
    throw new Error(
      `assertContains FAIL${label ? ' (' + label + ')' : ''}: ${JSON.stringify(needle)} not in ${JSON.stringify(haystack.slice(0, 200))}`,
    );
  }
}

function assertMatch(haystack: string, re: RegExp, label?: string): void {
  if (!re.test(haystack)) {
    throw new Error(
      `assertMatch FAIL${label ? ' (' + label + ')' : ''}: ${re} not in ${JSON.stringify(haystack.slice(0, 200))}`,
    );
  }
}

function assertThrows<E extends Error>(
  fn: () => unknown,
  ErrorClass: new (...args: never[]) => E,
  codeCheck?: (err: E) => boolean,
  label?: string,
): void {
  let caught: unknown = undefined;
  try {
    fn();
  } catch (e) {
    caught = e;
  }
  if (!(caught instanceof ErrorClass)) {
    throw new Error(
      `assertThrows FAIL${label ? ' (' + label + ')' : ''}: expected ${ErrorClass.name}, got ${caught instanceof Error ? caught.constructor.name : typeof caught}`,
    );
  }
  if (codeCheck && !codeCheck(caught as E)) {
    throw new Error(
      `assertThrows FAIL${label ? ' (' + label + ')' : ''}: code check failed for ${(caught as E).message}`,
    );
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SPEC TESTS
// ════════════════════════════════════════════════════════════════════════════

// ── Section 1: Preset registry integrity ────────────────────────────────────

it('VOICE_PRESETS has exactly 6 entries', () => {
  assertEqual(VOICE_PRESETS.length, 6, 'preset count');
});

it('VOICE_PRESETS ids are unique', () => {
  const ids = VOICE_PRESETS.map((p) => p.id);
  assertEqual(new Set(ids).size, ids.length, 'id uniqueness');
});

it('VOICE_PRESETS cover 6 of 7 tradições (ifá excluded)', () => {
  const tradicoes = new Set(VOICE_PRESETS.map((p) => p.tradicao));
  assertEqual(tradicoes.size, 6, 'unique tradições in presets');
  assertTrue(tradicoes.has('cigano'), 'cigano present');
  assertTrue(tradicoes.has('candomble'), 'candomble present');
  assertTrue(tradicoes.has('umbanda'), 'umbanda present');
  assertTrue(tradicoes.has('cabala'), 'cabala present');
  assertTrue(tradicoes.has('astrologia'), 'astrologia present');
  assertTrue(tradicoes.has('tantra'), 'tantra present');
  assertTrue(!tradicoes.has('ifa'), 'ifa correctly absent');
});

it('ALL_KNOWN_TRADICOES contains all 7 tradições (ifá documented as coming-soon)', () => {
  assertEqual(ALL_KNOWN_TRADICOES.length, 7, 'tradição count');
  assertTrue(ALL_KNOWN_TRADICOES.includes('ifa'), 'ifa documented in ALL_KNOWN_TRADICOES');
});

it('All presets have rate in valid range', () => {
  for (const p of VOICE_PRESETS) {
    assertTrue(p.rate >= MIN_RATE && p.rate <= MAX_RATE, `rate ${p.rate} for ${p.id}`);
    assertTrue(p.pitch >= MIN_PITCH && p.pitch <= MAX_PITCH, `pitch ${p.pitch} for ${p.id}`);
  }
});

it('All presets have non-empty voiceStyle and sampleText', () => {
  for (const p of VOICE_PRESETS) {
    assertTrue(p.voiceStyle.length > 20, `voiceStyle for ${p.id}`);
    assertTrue(p.sampleText.length > 10, `sampleText for ${p.id}`);
  }
});

it('All presets have locale pt-BR', () => {
  for (const p of VOICE_PRESETS) {
    assertEqual(p.locale, 'pt-BR', `locale for ${p.id}`);
  }
});

it('Iyá preset is measured (rate 0.85) and warm (pitch 0.95) — never stern', () => {
  const iya = VOICE_PRESETS.find((p) => p.id === 'iya');
  assertTrue(Boolean(iya), 'iya exists');
  assertEqual(iya!.rate, 0.85, 'iya rate measured');
  assertEqual(iya!.pitch, 0.95, 'iya pitch warm/maternal');
  // Iyá explicitly affirms warmth + maternity + "nunca austera/julgadora"
  assertMatch(iya!.voiceStyle, /(acolhed|maternal|fundament)/i, 'iya is warm/maternal/fundamento');
});

it('Pai Ogum is decisive (rate 1.0) — firm-not-gruff', () => {
  const ogum = VOICE_PRESETS.find((p) => p.id === 'pai-ogum');
  assertTrue(Boolean(ogum), 'pai-ogum exists');
  assertEqual(ogum!.rate, 1.0, 'ogum rate neutral');
  assertTrue(/decid|firme|protetor/i.test(ogum!.voiceStyle), 'ogum decisive/firm/protective');
  assertTrue(!/rude|gru|brav|agress/i.test(ogum!.voiceStyle), 'ogum NOT gruff/aggressive');
});

it('Swami Ananda is joyful — not eroticized', () => {
  const swami = VOICE_PRESETS.find((p) => p.id === 'swami-ananda');
  assertTrue(Boolean(swami), 'swami-ananda exists');
  assertTrue(/alegr|jubil|pran|respira/i.test(swami!.voiceStyle), 'swami joyful/breath');
  assertTrue(!/erot|sensual|provoc/i.test(swami!.voiceStyle), 'swami NOT eroticized');
});

it('Rabi Moshe is scholarly — not loud', () => {
  const rabbi = VOICE_PRESETS.find((p) => p.id === 'rabino-moshe');
  assertTrue(Boolean(rabbi), 'rabino-moshe exists');
  assertTrue(/erudit|estud|contempl/i.test(rabbi!.voiceStyle), 'rabbi scholarly');
  assertTrue(!/barulh|grit|ensurde/i.test(rabbi!.voiceStyle), 'rabbi NOT loud');
});

// ── Section 2: FNV-1a hash determinism ─────────────────────────────────────

it('fnv1a is deterministic', () => {
  assertEqual(fnv1a('hello'), fnv1a('hello'), 'same input → same hash');
  assertEqual(fnv1a(''), '811c9dc5', 'empty string → FNV offset basis');
});

it('fnv1a differs for different inputs', () => {
  assertTrue(fnv1a('hello') !== fnv1a('world'), 'hello ≠ world');
});

it('fnv1a returns 8-char lowercase hex', () => {
  const h = fnv1a('cigano|yoruba|1');
  assertMatch(h, /^[0-9a-f]{8}$/, 'hex format');
});

// ── Section 3: renderSacredText ─────────────────────────────────────────────

it('renderSacredText strips code fences', () => {
  const out = renderSacredText('Antes\n```\nsecret\n```\nDepois');
  assertEqual(out, 'Antes\n\nDepois', 'code fences stripped');
});

it('renderSacredText strips inline code', () => {
  const out = renderSacredText('use `npm install` para instalar');
  assertEqual(out, 'use npm install para instalar', 'inline code stripped');
});

it('renderSacredText strips bold and italic markers', () => {
  const out = renderSacredText('**Orixá** é _forte_ e *sagrado*.');
  assertEqual(out, 'Orixá é forte e sagrado.', 'bold/italic stripped');
});

it('renderSacredText converts headings to plain lines', () => {
  const out = renderSacredText('# Orixás\n## Oxalá\nConteúdo');
  assertContains(out, 'Orixás', 'h1 preserved');
  assertContains(out, 'Oxalá', 'h2 preserved');
  assertTrue(!out.includes('#'), 'no hash symbols');
});

it('renderSacredText converts blockquotes to "Citação: "', () => {
  const out = renderSacredText('> O Zohar nos ensina');
  assertEqual(out, 'Citação: O Zohar nos ensina', 'blockquote prefixed');
});

it('renderSacredText converts bullet lists', () => {
  const out = renderSacredText('- Mercúrio\n- Vênus\n- Marte');
  assertContains(out, 'Item: Mercúrio', 'first bullet prefixed');
  assertContains(out, 'Item: Marte', 'last bullet prefixed');
});

it('renderSacredText drops URLs from markdown links', () => {
  const out = renderSacredText('Leia [o Zohar](https://example.com/zohar)');
  assertEqual(out, 'Leia o Zohar', 'link URL dropped');
});

it('renderSacredText handles empty input', () => {
  assertEqual(renderSacredText(''), '', 'empty → empty');
});

it('renderSacredTextSsml adds pause markers at line breaks', () => {
  const out = renderSacredTextSsml('Linha um\nLinha dois');
  assertTrue(out.includes('. '), 'pause marker between lines');
});

// ── Section 4: estimateDurationMs ────────────────────────────────────────────

it('estimateDurationMs returns floor (500ms) for empty text', () => {
  assertEqual(estimateDurationMs('', 1.0), 500, 'empty floor');
});

it('estimateDurationMs scales inversely with rate', () => {
  const slow = estimateDurationMs('olá mundo sagrado e abençoado', 0.5);
  const fast = estimateDurationMs('olá mundo sagrado e abençoado', 2.0);
  assertTrue(slow > fast, `slow ${slow} > fast ${fast}`);
});

it('estimateDurationMs floors at 500ms for short text', () => {
  assertEqual(estimateDurationMs('oi', 1.0), 500, 'short floor');
});

// ── Section 5: validateRate / validatePitch ────────────────────────────────

it('validateRate accepts boundary values', () => {
  validateRate(MIN_RATE);
  validateRate(MAX_RATE);
  validateRate(1.0);
});

it('validateRate throws for out-of-range', () => {
  assertThrows(() => validateRate(0.4), VoiceEngineError, (e) => e.code === 'INVALID_RATE');
  assertThrows(() => validateRate(1.6), VoiceEngineError, (e) => e.code === 'INVALID_RATE');
  assertThrows(() => validateRate(Number.NaN), VoiceEngineError, (e) => e.code === 'INVALID_RATE');
});

it('validatePitch accepts boundary values', () => {
  validatePitch(MIN_PITCH);
  validatePitch(MAX_PITCH);
});

it('validatePitch throws for out-of-range', () => {
  assertThrows(() => validatePitch(0.1), VoiceEngineError, (e) => e.code === 'INVALID_PITCH');
});

// ── Section 6: Engine lifecycle ─────────────────────────────────────────────

function newEngine(): VoiceEngine {
  return createVoiceEngine(new InMemoryVoiceAdapter());
}

it('engine.play returns a "playing" PlaybackState with deterministic CueId', async () => {
  const engine = newEngine();
  const state = await engine.play('Orixá te chama', 'iya');
  assertEqual(state.status, 'playing', 'initial status playing');
  assertEqual(state.voiceId, 'iya', 'voiceId propagated');
  assertTrue(state.cueId.startsWith('cue-'), 'cueId prefix');
  assertMatch(state.cueId, /^cue-\d{4}-[0-9a-f]{8}$/, 'cueId format cue-NNNN-XXXXXXXX');
  assertTrue(state.durationMs > 0, `durationMs > 0: ${state.durationMs}`);
  assertTrue(state.createdAt === state.updatedAt, 'initial createdAt === updatedAt');
});

it('engine.pause transitions playing → paused', async () => {
  const engine = newEngine();
  const state = await engine.play('oxalá', 'rabino-moshe');
  await engine.pause(state.cueId);
  const q = engine.getQueue();
  assertEqual(q.length, 1, 'queue length');
  assertEqual(q[0]!.status, 'paused', 'status paused');
});

it('engine.resume transitions paused → playing', async () => {
  const engine = newEngine();
  const state = await engine.play('meditação', 'swami-ananda');
  await engine.pause(state.cueId);
  await engine.resume(state.cueId);
  const q = engine.getQueue();
  assertEqual(q[0]!.status, 'playing', 'status playing after resume');
});

it('engine.cancel transitions cue to "done"', async () => {
  const engine = newEngine();
  const state = await engine.play('caminhos', 'pai-ogum');
  await engine.cancel(state.cueId);
  // After cancel, getQueue should not include the cancelled cue (terminal status filtered).
  assertEqual(engine.getQueue().length, 0, 'queue empty after cancel');
});

it('engine.pause throws INVALID_STATE_TRANSITION on already-paused cue', async () => {
  const engine = newEngine();
  const state = await engine.play('lua', 'cigano');
  await engine.pause(state.cueId);
  let err: VoiceEngineError | undefined;
  try { await engine.pause(state.cueId); } catch (e) { err = e as VoiceEngineError; }
  assertTrue(err instanceof VoiceEngineError, 'error is VoiceEngineError');
  assertEqual(err!.code, 'INVALID_STATE_TRANSITION', 'error code');
});

it('engine.pause throws CUE_NOT_FOUND for unknown cueId', async () => {
  const engine = newEngine();
  const fakeCueId = 'cue-9999-deadbeef' as CueId;
  let err: VoiceEngineError | undefined;
  try { await engine.pause(fakeCueId); } catch (e) { err = e as VoiceEngineError; }
  assertEqual(err!.code, 'CUE_NOT_FOUND', 'error code');
});

it('engine.play throws EMPTY_TEXT for empty/whitespace text', async () => {
  const engine = newEngine();
  let err1: VoiceEngineError | undefined;
  try { await engine.play('', 'iya'); } catch (e) { err1 = e as VoiceEngineError; }
  assertEqual(err1!.code, 'EMPTY_TEXT', 'empty code');
  let err2: VoiceEngineError | undefined;
  try { await engine.play('   \n  \t  ', 'iya'); } catch (e) { err2 = e as VoiceEngineError; }
  assertEqual(err2!.code, 'EMPTY_TEXT', 'whitespace code');
});

it('engine.play throws TEXT_TOO_LONG for > MAX_TEXT_LENGTH', async () => {
  const engine = newEngine();
  const big = 'a'.repeat(MAX_TEXT_LENGTH + 1);
  let err: VoiceEngineError | undefined;
  try { await engine.play(big, 'iya'); } catch (e) { err = e as VoiceEngineError; }
  assertEqual(err!.code, 'TEXT_TOO_LONG', 'too long code');
});

it('engine.play throws VOICE_NOT_FOUND for unknown voiceId', async () => {
  const engine = newEngine();
  let err: VoiceEngineError | undefined;
  try { await engine.play('test', 'fake-voice' as VoicePresetId); } catch (e) { err = e as VoiceEngineError; }
  assertEqual(err!.code, 'VOICE_NOT_FOUND', 'voice not found');
});

it('engine.getPreset returns the matching VoicePreset', () => {
  const engine = newEngine();
  const iya = engine.getPreset('iya');
  assertTrue(Boolean(iya), 'iya exists');
  assertEqual(iya!.tradicao, 'candomble', 'iya → candomble');
});

it('engine.getPreset returns undefined for unknown voiceId', () => {
  const engine = newEngine();
  assertEqual(engine.getPreset('unknown' as VoicePresetId), undefined, 'undefined');
});

it('engine.getVoicesByTradicao returns 1 voice per supported tradição', () => {
  const engine = newEngine();
  for (const t of ['cigano', 'candomble', 'umbanda', 'cabala', 'astrologia', 'tantra'] as TradicaoName[]) {
    const voices = engine.getVoicesByTradicao(t);
    assertEqual(voices.length, 1, `${t} count`);
  }
});

it('engine.getVoicesByTradicao returns 0 voices for ifá (coming soon)', () => {
  const engine = newEngine();
  const voices = engine.getVoicesByTradicao('ifa');
  assertEqual(voices.length, 0, 'ifa empty');
});

it('engine.exportAudit captures every state transition', async () => {
  const engine = newEngine();
  const state = await engine.play('meditação', 'swami-ananda');
  await engine.pause(state.cueId);
  await engine.resume(state.cueId);
  await engine.cancel(state.cueId);
  const audit = engine.exportAudit();
  // 1 create + 1 pause + 1 resume + 1 cancel = 4
  assertEqual(audit.length, 4, 'audit count');
  assertEqual(audit[0]!.status, 'playing', 'audit[0] playing');
  assertEqual(audit[1]!.status, 'paused', 'audit[1] paused');
  assertEqual(audit[2]!.status, 'playing', 'audit[2] playing');
  assertEqual(audit[3]!.status, 'done', 'audit[3] done');
});

it('engine renders markdown to plain text in stored PlaybackState', async () => {
  const engine = newEngine();
  const state = await engine.play('**Orixá** é _forte_', 'iya');
  assertEqual(state.text, 'Orixá é forte', 'markdown stripped in stored text');
});

// ── Section 7: InMemoryVoiceAdapter ─────────────────────────────────────────

it('InMemoryVoiceAdapter produces deterministic CueIds across runs', async () => {
  const a1 = new InMemoryVoiceAdapter();
  const a2 = new InMemoryVoiceAdapter();
  const r1 = await a1.synthesize('ola', 'iya', { rate: 1.0, pitch: 1.0 });
  const r2 = await a2.synthesize('ola', 'iya', { rate: 1.0, pitch: 1.0 });
  // Both are sequence #1 with same input → same hash suffix
  assertEqual(r1.cueId, r2.cueId, 'deterministic cueId');
});

it('InMemoryVoiceAdapter produces unique CueIds for different texts', async () => {
  const a = new InMemoryVoiceAdapter();
  const r1 = await a.synthesize('ola', 'iya', { rate: 1.0, pitch: 1.0 });
  const r2 = await a.synthesize('adeus', 'iya', { rate: 1.0, pitch: 1.0 });
  assertTrue(r1.cueId !== r2.cueId, 'unique cueIds');
});

it('InMemoryVoiceAdapter.cancel removes from internal store', async () => {
  const a = new InMemoryVoiceAdapter();
  const r = await a.synthesize('ola', 'iya', { rate: 1.0, pitch: 1.0 });
  assertEqual(a._size(), 1, 'one synthesized');
  await a.cancel(r.cueId);
  assertEqual(a._size(), 0, 'zero after cancel');
});

it('InMemoryVoiceAdapter.synthesize throws for empty text', async () => {
  const a = new InMemoryVoiceAdapter();
  let err: Error | undefined;
  try { await a.synthesize('', 'iya', { rate: 1.0, pitch: 1.0 }); } catch (e) { err = e as Error; }
  assertTrue(err instanceof Error, 'error thrown');
});

it('InMemoryVoiceAdapter.synthesize returns audioUrl with cueId in path', async () => {
  const a = new InMemoryVoiceAdapter();
  const r = await a.synthesize('ola mundo', 'cigano', { rate: 1.0, pitch: 1.0 });
  assertContains(r.audioUrl, r.cueId, 'audioUrl contains cueId');
  assertContains(r.audioUrl, 'cigano', 'audioUrl contains voiceId');
});

// ── Section 8: Queue management ─────────────────────────────────────────────

it('engine supports multiple cues in queue (multi-voice sequential)', async () => {
  const engine = newEngine();
  await engine.play('primeiro', 'iya');
  await engine.play('segundo', 'cigano');
  await engine.play('terceiro', 'pai-ogum');
  assertEqual(engine.getQueue().length, 3, 'three cues queued');
});

it('engine.getQueue preserves insertion order', async () => {
  const engine = newEngine();
  const s1 = await engine.play('primeiro', 'iya');
  const s2 = await engine.play('segundo', 'cigano');
  const s3 = await engine.play('terceiro', 'pai-ogum');
  const q = engine.getQueue();
  assertEqual(q[0]!.cueId, s1.cueId, 'first cueId');
  assertEqual(q[1]!.cueId, s2.cueId, 'second cueId');
  assertEqual(q[2]!.cueId, s3.cueId, 'third cueId');
});

it('engine.getQueue excludes done terminals', async () => {
  const engine = newEngine();
  const s1 = await engine.play('primeiro', 'iya');
  await engine.play('segundo', 'cigano');
  await engine.cancel(s1.cueId);
  const q = engine.getQueue();
  assertEqual(q.length, 1, 'one cue left after cancel');
  assertEqual(q[0]!.cueId !== s1.cueId, true, 'cancelled cue filtered');
});

// ── Section 9: Adapter error wrapping ───────────────────────────────────────

it('engine wraps adapter errors in ADAPTER_ERROR', async () => {
  const failingAdapter = {
    synthesize: () => Promise.reject(new Error('upstream TTS timeout')),
    cancel: () => Promise.resolve(),
  };
  const engine = createVoiceEngine(failingAdapter);
  let err: VoiceEngineError | undefined;
  try { await engine.play('test', 'iya'); } catch (e) { err = e as VoiceEngineError; }
  assertEqual(err!.code, 'ADAPTER_ERROR', 'wrapped code');
  assertContains(err!.message, 'upstream TTS timeout', 'cause in message');
});

// ── Section 10: ALL_KNOWN_VOICE_IDS integrity ────────────────────────────────

it('ALL_KNOWN_VOICE_IDS matches VOICE_PRESETS ids', () => {
  const ids = VOICE_PRESETS.map((p) => p.id);
  assertEqual(new Set(ALL_KNOWN_VOICE_IDS), new Set(ids), 'id sets equal');
});

it('ALL_KNOWN_VOICE_IDS is frozen array of 6 ids', () => {
  assertEqual(ALL_KNOWN_VOICE_IDS.length, 6, '6 ids');
  assertTrue(Object.isFrozen(ALL_KNOWN_VOICE_IDS), 'frozen');
});

// ════════════════════════════════════════════════════════════════════════════
// RUNNER
// ════════════════════════════════════════════════════════════════════════════

async function runSpecs(): Promise<void> {
  let passes = 0;
  let fails = 0;
  const failures: string[] = [];

  console.log('\n═══ W85-A Voice Mode Akasha · Spec Harness ═══\n');

  for (const spec of SPEC_REGISTRY) {
    const engine = newEngine();
    // Wrap state reset in a closure so each test gets a clean engine.
    engine.resetForTests();
    try {
      await spec.run();
      passes++;
      console.log(`  ✓ ${spec.name}`);
    } catch (e: unknown) {
      fails++;
      const msg = e instanceof Error ? e.message : String(e);
      failures.push(`${spec.name}: ${msg}`);
      console.log(`  ✗ ${spec.name}`);
      console.log(`      ${msg}`);
    }
  }

  console.log(`\n${passes} passed, ${fails} failed (of ${SPEC_REGISTRY.length})\n`);

  if (fails > 0) {
    console.log('Failures:');
    for (const f of failures) console.log(`  - ${f}`);
    console.log('');
    process.exit(1);
  }
}

await runSpecs();