/**
 * ════════════════════════════════════════════════════════════════════════════
 * W85-A — VOICE MODE AKASHA · SMOKE HARNESS
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Inline checks that mirror the production engine logic without depending
 * on a test runner. ≥15 inline assertions covering preset integrity, hash
 * determinism, markdown rendering, full play→pause→resume→done cycle,
 * error states, and 7-tradição coverage.
 *
 * Run with: node --experimental-strip-types voice-engine.smoke.ts
 */

// @ts-ignore — node-stubs.d.ts provides the globals.
import {
  createVoiceEngine,
  InMemoryVoiceAdapter,
  fnv1a,
  renderSacredText,
  estimateDurationMs,
  VOICE_PRESETS,
  ALL_KNOWN_TRADICOES,
  ALL_KNOWN_VOICE_IDS,
  type CueId,
} from './voice-engine.ts';

declare const process: { exit(code: number): never };

let passes = 0;
let fails = 0;

function check(label: string, cond: boolean, detail?: string): void {
  if (cond) {
    passes++;
    console.log(`  ✓ ${label}`);
  } else {
    fails++;
    console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ''}`);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Inline checks
// ════════════════════════════════════════════════════════════════════════════

console.log('W85-A Voice Mode Akasha — Smoke Harness\n');

// ── Section 1: Preset registry ─────────────────────────────────────────────

check('VOICE_PRESETS length is 6', VOICE_PRESETS.length === 6, `got ${VOICE_PRESETS.length}`);
check('VOICE_PRESETS ids unique', new Set(VOICE_PRESETS.map((p) => p.id)).size === 6);

const tradicoesCovered = new Set(VOICE_PRESETS.map((p) => p.tradicao));
check('6 tradições covered (no ifá)', tradicoesCovered.size === 6);
check(
  'cigano / candomble / umbanda / cabala / astrologia / tantra all present',
  ['cigano', 'candomble', 'umbanda', 'cabala', 'astrologia', 'tantra'].every((t) =>
    tradicoesCovered.has(t as never),
  ),
);
check('ifá NOT in presets (coming soon)', !tradicoesCovered.has('ifa'));
check('ALL_KNOWN_TRADICOES has 7 (incl. ifá)', ALL_KNOWN_TRADICOES.length === 7);
check(
  'ALL_KNOWN_TRADICOES includes ifá',
  ALL_KNOWN_TRADICOES.includes('ifa'),
);
check('ALL_KNOWN_VOICE_IDS length is 6', ALL_KNOWN_VOICE_IDS.length === 6);

const iyaPreset = VOICE_PRESETS.find((p) => p.id === 'iya');
check('Iyá preset is measured/warm', iyaPreset?.rate === 0.85 && iyaPreset?.pitch === 0.95);
check('Iyá voiceStyle affirms warmth (acolhedora/maternal/fundamento)', /(acolhedora|maternal|fundamento)/i.test(iyaPreset?.voiceStyle ?? ''));

const swami = VOICE_PRESETS.find((p) => p.id === 'swami-ananda');
check('Swami voiceStyle is joyful (not erotic)', /alegr|jubil/i.test(swami?.voiceStyle ?? ''));
check('Swami voiceStyle NOT eroticized', !/erot|sensual/i.test(swami?.voiceStyle ?? ''));

// ── Section 2: FNV-1a hash ────────────────────────────────────────────────

check('fnv1a empty string = 811c9dc5', fnv1a('') === '811c9dc5');
check('fnv1a deterministic', fnv1a('hello') === fnv1a('hello'));
check('fnv1a differs for different inputs', fnv1a('a') !== fnv1a('b'));
check('fnv1a hex format 8 chars', /^([0-9a-f]{8})$/.test(fnv1a('test')));

// ── Section 3: renderSacredText ────────────────────────────────────────────

check(
  'renderSacredText strips code fences',
  renderSacredText('```secret```') === '',
);
check(
  'renderSacredText strips bold/italic',
  renderSacredText('**Orixá** é _forte_') === 'Orixá é forte',
);
check(
  'renderSacredText handles blockquotes',
  renderSacredText('> Zohar') === 'Citação: Zohar',
);
check(
  'renderSacredText converts bullets',
  renderSacredText('- Mercúrio').startsWith('Item:'),
);
check('renderSacredText empty input', renderSacredText('') === '');

// ── Section 4: estimateDurationMs ──────────────────────────────────────────

check('estimateDurationMs floor 500ms for empty', estimateDurationMs('', 1.0) === 500);
check('estimateDurationMs scales with rate', estimateDurationMs('cinco palavras por favor aqui', 0.5) > estimateDurationMs('cinco palavras por favor aqui', 1.5));

// ── Section 5: Engine lifecycle — end-to-end ───────────────────────────────

(async () => {
  const engine = createVoiceEngine(new InMemoryVoiceAdapter());

  // play → playing
  const s1 = await engine.play('oxalá nos abençoe', 'rabino-moshe');
  check('play → status playing', s1.status === 'playing');
  check('play → cueId starts with cue-', s1.cueId.startsWith('cue-'));
  check('play → voiceId propagated', s1.voiceId === 'rabino-moshe');

  // pause → paused
  await engine.pause(s1.cueId);
  const qAfterPause = engine.getQueue();
  check('pause → status paused', qAfterPause[0]?.status === 'paused');

  // resume → playing
  await engine.resume(s1.cueId);
  const qAfterResume = engine.getQueue();
  check('resume → status playing', qAfterResume[0]?.status === 'playing');

  // multi-voice sequential — 3 different tradições (s1 still in queue)
  await engine.play('lua cheia', 'cigano');
  await engine.play('orixá', 'iya');
  await engine.play('prana', 'swami-ananda');
  const qMulti = engine.getQueue();
  check('queue length = 4 (s1 + 3 new)', qMulti.length === 4, `got ${qMulti.length}`);
  check('queue preserves order (first = s1)', qMulti[0]?.cueId === s1.cueId);
  check('queue preserves order (4th = swami-ananda)', qMulti[3]?.voiceId === 'swami-ananda');

  // cancel s1 → queue becomes 3
  await engine.cancel(s1.cueId);
  check('after cancel — queue length 3', engine.getQueue().length === 3);

  // audit log
  const audit = engine.exportAudit();
  // s1: play + pause + resume + cancel = 4
  // + 3 plays = 7 entries
  check('audit log captures all transitions (7)', audit.length === 7, `got ${audit.length}`);
  check('audit[0] is s1 playing', audit[0]?.cueId === s1.cueId && audit[0]?.status === 'playing');
  check('audit[1] is s1 paused', audit[1]?.status === 'paused');
  check('audit[2] is s1 playing', audit[2]?.status === 'playing');
  // After 3 more plays, cancel s1 → final audit entry is s1 done
  const last = audit[audit.length - 1];
  check('last audit entry is s1 done', last?.cueId === s1.cueId && last?.status === 'done');

  // ── Section 6: Error states ──────────────────────────────────────────────

  let err: unknown = undefined;
  try { await engine.play('', 'iya'); } catch (e) { err = e; }
  check('empty text throws', (err as { code?: string } | undefined)?.code === 'EMPTY_TEXT');

  err = undefined;
  try { await engine.play('a'.repeat(5000), 'iya'); } catch (e) { err = e; }
  check('too long text throws', (err as { code?: string } | undefined)?.code === 'TEXT_TOO_LONG');

  err = undefined;
  try { await engine.play('test', 'fake-voice' as never); } catch (e) { err = e; }
  check('unknown voiceId throws', (err as { code?: string } | undefined)?.code === 'VOICE_NOT_FOUND');

  err = undefined;
  try { await engine.pause('cue-9999-deadbeef' as CueId); } catch (e) { err = e; }
  check('unknown cueId throws on pause', (err as { code?: string } | undefined)?.code === 'CUE_NOT_FOUND');

  err = undefined;
  try { await engine.pause(s1.cueId); } catch (e) { err = e; } // s1 already done
  check('pause on done cue throws', (err as { code?: string } | undefined)?.code === 'CUE_NOT_FOUND' || (err as { code?: string } | undefined)?.code === 'INVALID_STATE_TRANSITION');

  // ── Section 7: getVoicesByTradicao ───────────────────────────────────────

  check('getVoicesByTradicao(cigano) returns 1', engine.getVoicesByTradicao('cigano').length === 1);
  check('getVoicesByTradicao(candomble) returns 1', engine.getVoicesByTradicao('candomble').length === 1);
  check('getVoicesByTradicao(ifa) returns 0 (coming soon)', engine.getVoicesByTradicao('ifa').length === 0);

  // ── Section 8: Adapter determinism ────────────────────────────────────────

  const a1 = new InMemoryVoiceAdapter();
  const a2 = new InMemoryVoiceAdapter();
  const r1 = await a1.synthesize('ola', 'iya', { rate: 1.0, pitch: 1.0 });
  const r2 = await a2.synthesize('ola', 'iya', { rate: 1.0, pitch: 1.0 });
  check('InMemoryVoiceAdapter deterministic CueId', r1.cueId === r2.cueId);
  check('audioUrl contains voiceId', r1.audioUrl.includes('iya'));
  check('audioUrl contains cueId', r1.audioUrl.includes(r1.cueId));

  // ── Summary ──────────────────────────────────────────────────────────────

  console.log(`\n${passes} passed, ${fails} failed (smoke)`);
  if (fails > 0) process.exit(1);
})();