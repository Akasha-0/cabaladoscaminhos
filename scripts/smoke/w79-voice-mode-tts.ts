// W79 voice-mode-tts smoke — fast happy-path exercise of the public API.
// Self-running synchronous harness. ≥20 checks.

import {
  // Branded primitives + factories
  makeVoiceId, makeTraditionId, makeResponseId, makeSessionId, makeChunkId,
  // Option / Result
  some, NONE, ok, err, isSome, isNone,
  // Tradition + voice catalog
  TRADITION_IDS, isTraditionIdLiteral, TRADITION_DISPLAY,
  listVoices, listVoicesByTradition, getVoice, getDefaultVoiceForTradition,
  getAlternativeVoiceForTradition,
  // Sacred terms + chunking
  normalizeForMatch, detectSacredTerms, chunkResponse,
  // Synthesis + buffer
  buildSynthesisRequest, synthesizeToBuffer, getCachedBuffer,
  clearAudioCache, audioCacheSize,
  // Playback
  createSession, play, pause, resume, stop, seek, onStateChange,
  // Accessibility + download
  getKeyboardShortcuts, getScreenReaderAnnouncement,
  buildAudioFilename, estimateAudioSizeMs,
  // LGPD
  isAutoPlayApproved, approveAutoPlay, revokeAutoPlay, _setAutoPlayForTests,
  // Hash + reset
  hashSynthesisRequest, hashAudioBuffer, hashVoicePreset,
  _resetTTSForTests,
} from '../../src/lib/w79/voice-mode-tts.ts';

let passed = 0, failed = 0;

function check(label: string, cond: boolean, detail = ''): void {
  if (cond) { passed++; console.log(`  ✓ ${label}`); }
  else { failed++; console.error(`  ✗ ${label}${detail ? ' — ' + detail : ''}`); }
}

function expectThrow(label: string, fn: () => unknown, contains?: string): void {
  let threw = false; let msg = '';
  try { fn(); } catch (e) { threw = true; msg = String(e); }
  const ok = threw && (contains ? msg.includes(contains) : true);
  check(label, ok, threw ? (contains && !msg.includes(contains) ? `error msg doesn't contain "${contains}": ${msg}` : '') : 'did not throw');
}

// === 1. Branded primitive factories ===
console.log('\n[1] Branded primitive factories');
_resetTTSForTests();
const v = makeVoiceId('CIGANO-F');
check('makeVoiceId accepts CIGANO-F', (v as string) === 'CIGANO-F');
expectThrow('makeVoiceId rejects BOGUS', () => makeVoiceId('BOGUS'));
expectThrow('makeVoiceId rejects CIGANO-X', () => makeVoiceId('CIGANO-X'));
const t = makeTraditionId('CANDOMBLE');
check('makeTraditionId accepts CANDOMBLE', (t as string) === 'CANDOMBLE');
expectThrow('makeTraditionId rejects bogus', () => makeTraditionId('XXXX'));
const r = makeResponseId('r_responsename');
check('makeResponseId accepts r_', (r as string).startsWith('r_'));
const sid = makeSessionId('s_sessionname');
check('makeSessionId accepts s_', (sid as string).startsWith('s_'));
const cid = makeChunkId('c_chunkname');
check('makeChunkId accepts c_', (cid as string).startsWith('c_'));

// === 2. Voice catalog ===
console.log('\n[2] Voice preset catalog (7 traditions × 2 voices)');
_resetTTSForTests();
check('listVoices returns 14 presets', listVoices().length === 14);
check('TRADITION_IDS has 7 canonical roots', TRADITION_IDS.length === 7);
for (const tid of TRADITION_IDS) {
  check(`${tid}: 2 voices`, listVoicesByTradition(tid).length === 2);
  const def = getDefaultVoiceForTradition(tid);
  check(`${tid}: default is feminine`, def.gender === 'F');
  const alt = getAlternativeVoiceForTradition(tid, 'M');
  check(`${tid}: alt is masculine`, alt.gender === 'M');
}
const cig = getVoice(makeVoiceId('CIGANO-F'));
check('getVoice(CIGANO-F) returns some', cig.kind === 'some');
const bogusV = getVoice('BOGUS-X' as ReturnType<typeof makeVoiceId>);
check('getVoice(BOGUS-X) returns none', bogusV.kind === 'none');

// === 3. Sacred terms ===
console.log('\n[3] Sacred term detection');
const hits1 = detectSacredTerms('O orixá Ogum traz força.');
check('detects orixá in PT text', hits1.includes('orixá'));
const hits2 = detectSacredTerms('Com axé abençoamos.');
check('detects axé (diacritic insensitive)', hits2.includes('axé'));
const hits3 = detectSacredTerms('O tikkún é sagrado.');
check('detects tikkún (cabala term)', hits3.length >= 1);
const hits4 = detectSacredTerms('Plain English message.');
check('returns empty for plain text', hits4.length === 0);
const norm = normalizeForMatch('Oxalá');
check('normalizeForMatch uses NFD (combining mark preserved)', norm.length === 6);

// === 4. Response chunking ===
console.log('\n[4] Response chunking');
const short = chunkResponse('Olá.');
check('short text → 1 chunk', short.length === 1);
check('short chunk has index 0', short[0]?.index === 0);
const longText = Array.from({length: 15}, (_, i) => `Frase número ${i+1} com conteúdo distinto.`).join(' ');
const long = chunkResponse(longText);
check('long text → multiple chunks', long.length > 1);
let overSized = false;
for (const c of long) { if (c.charCount > 240) overSized = true; }
check('all chunks ≤ 240 chars', !overSized);
check('all chunks have unique hashes (varied text)', new Set(long.map((c) => c.hash as string)).size === long.length);

// === 5. Synthesis request + buffer ===
console.log('\n[5] Synthesis request + audio buffer');
_resetTTSForTests();
const cigVoice = getDefaultVoiceForTradition('CIGANO');
const req = buildSynthesisRequest('Akasha fala com voz suave.', cigVoice);
check('buildSynthesisRequest ok', req.ok);
if (req.ok) {
  check('chunks > 0', req.value.chunks.length > 0);
  check('totalChars > 0', req.value.totalChars > 0);
  check('estimatedDurationMs > 0', req.value.estimatedDurationMs > 0);
}
const buf1 = synthesizeToBuffer('Teste síntese.', cigVoice);
check('synthesizeToBuffer ok', buf1.ok);
if (buf1.ok) {
  check('buffer has ab_ prefix', (buf1.value.id as string).startsWith('ab_'));
  check('buffer size > 0', buf1.value.sizeBytes > 0);
  check('buffer format is wav (default)', buf1.value.format === 'wav');
}
const buf2 = synthesizeToBuffer('Teste síntese.', cigVoice);
check('cache hit returns same id', buf1.ok && buf2.ok && buf1.value.id === buf2.value.id);
check('cache size = 1', audioCacheSize() === 1);
const buf3 = synthesizeToBuffer('Outro texto.', cigVoice, { format: 'mp3' });
check('mp3 format works', buf3.ok && buf3.value.format === 'mp3');
clearAudioCache();
check('clearAudioCache empties', audioCacheSize() === 0);

// === 6. Playback state machine ===
console.log('\n[6] Playback state machine');
_resetTTSForTests();
_setAutoPlayForTests(true);
const req2 = buildSynthesisRequest('Sessão de teste.', cigVoice);
if (req2.ok) {
  const sess = createSession(req2.value, { autoPlayApproved: true });
  check('session starts idle', sess.state === 'idle');
  const playing = play(sess);
  check('play transitions to playing', playing.state === 'playing');
  const paused = pause(playing);
  check('pause transitions to paused', paused.state === 'paused');
  const resumed = resume(paused);
  check('resume transitions to playing', resumed.state === 'playing');
  const stopped = stop(playing);
  check('stop transitions to ended', stopped.state === 'ended');
  const seeked = seek(playing, 100);
  check('seek updates position', seeked.positionMs === 100);
}
_setAutoPlayForTests(false);
const req3 = buildSynthesisRequest('LGPD test.', cigVoice);
if (req3.ok) {
  const sess = createSession(req3.value, { autoPlayApproved: false });
  const noAutoPlay = play(sess);
  check('NO auto-play without approval (LGPD)', noAutoPlay.state === 'idle');
}

// === 7. Accessibility ===
console.log('\n[7] Accessibility');
const sc = getKeyboardShortcuts();
check('7 keyboard shortcuts', sc.length === 7);
check('Space = play-pause', sc.find((s) => s.key === 'Space')?.action === 'play-pause');
check('Escape = stop', sc.find((s) => s.key === 'Escape')?.action === 'stop');
const announce = getScreenReaderAnnouncement('playing', 'Cigana voz suave');
check('announcement includes voice label', announce.text.includes('Cigana voz suave'));

// === 8. LGPD defaults ===
console.log('\n[8] LGPD / autoPlay');
_resetTTSForTests();
_setAutoPlayForTests(false);
check('autoPlay default false', !isAutoPlayApproved());
approveAutoPlay();
check('approveAutoPlay toggles true', isAutoPlayApproved());
revokeAutoPlay();
check('revokeAutoPlay toggles false', !isAutoPlayApproved());

// === 9. Download + filename ===
console.log('\n[9] Download + filename');
const fn = buildAudioFilename(cigVoice, 'wav');
check('wav filename ends with .wav', fn.endsWith('.wav'));
check('mp3 filename ends with .mp3', buildAudioFilename(cigVoice, 'mp3').endsWith('.mp3'));
check('estimateAudioSizeMs scales linearly', estimateAudioSizeMs('Olá') > 0 && estimateAudioSizeMs('Olá'.repeat(10)) > estimateAudioSizeMs('Olá') * 5);

// === 10. Hash ===
console.log('\n[10] Hash determinism');
const req4 = buildSynthesisRequest('Hash determinism.', cigVoice);
if (req4.ok) {
  check('hashSynthesisRequest deterministic', hashSynthesisRequest(req4.value) === hashSynthesisRequest(req4.value));
}
const buf4 = synthesizeToBuffer('Buffer hash.', cigVoice);
if (buf4.ok) {
  check('hashAudioBuffer deterministic', hashAudioBuffer(buf4.value) === hashAudioBuffer(buf4.value));
}
check('hashVoicePreset deterministic', hashVoicePreset(cigVoice) === hashVoicePreset(cigVoice));
const cigM = getAlternativeVoiceForTradition('CIGANO', 'M');
check('different voice → different hash', hashVoicePreset(cigVoice) !== hashVoicePreset(cigM));

// ============================== REPORT ==============================

console.log(`\nSmoke summary: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
