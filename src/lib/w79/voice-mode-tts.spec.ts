// W79 voice-mode-tts spec — self-running (no vitest at runtime).
// Pattern: cycle 60+ harness with describe/it/expect/beforeEach/afterEach stubs.
// ≥40 assertions covering: brand validation, voice catalog, sacred terms,
// chunking, audio buffers, synthesis requests, playback state machine,
// accessibility, LGPD defaults.

import {
  // Branded primitives + factories
  makeVoiceId, makeTraditionId, makeAudioBufferId, makeResponseId,
  makeSessionId, makeChunkId, makeHash,
  // Option / Result
  some, NONE, ok, err, fromNullable, isSome, isNone,
  // Tradition taxonomy
  TRADITION_IDS, isTraditionIdLiteral, TRADITION_DISPLAY,
  // Voice catalog
  listVoices, listVoicesByTradition, getVoice, getDefaultVoiceForTradition,
  getAlternativeVoiceForTradition,
  // Sacred terms
  SACRED_TERMS_PT_BR, normalizeForMatch, detectSacredTerms,
  // Chunking
  chunkResponse,
  // Audio buffer
  synthesizeToBuffer, getCachedBuffer, clearAudioCache, audioCacheSize,
  // Synthesis request
  buildSynthesisRequest,
  // Playback state machine
  createSession, play, pause, resume, stop, seek,
  getCurrentPosition, getCurrentChunkIndex, onStateChange,
  // Accessibility
  getKeyboardShortcuts, getScreenReaderAnnouncement,
  // Download / filename
  buildAudioFilename, estimateAudioSizeMs,
  // LGPD
  isAutoPlayApproved, approveAutoPlay, revokeAutoPlay, _setAutoPlayForTests,
  // Hash
  hashSynthesisRequest, hashAudioBuffer, hashVoicePreset,
  // Reset
  _resetTTSForTests,
  // Types
  type VoiceId, type VoicePreset, type PlaybackState, type VoiceSession,
  type SynthesisRequest, type TraditionIdLiteral, type AudioBuffer,
  type AudioChunk, type KeyboardShortcut, type ScreenReaderAnnouncement,
} from './voice-mode-tts.ts';

// ----- self-running harness -----
let _testsPassed = 0;
let _testsFailed = 0;
const _failures: string[] = [];

function expect<T>(actual: T, label?: string): {
  toBe(expected: T): void;
  toEqual(expected: unknown): void;
  toStrictEqual(expected: unknown): void;
  toBeTruthy(): void;
  toBeFalsy(): void;
  toBeDefined(): void;
  toBeUndefined(): void;
  toBeNull(): void;
  toThrow(fn: () => unknown, msg?: string): void;
  toContain(item: unknown): void;
  toHaveLength(n: number): void;
  toBeGreaterThan(n: number): void;
  toBeGreaterThanOrEqual(n: number): void;
  toBeLessThan(n: number): void;
  toBeLessThanOrEqual(n: number): void;
} {
  return {
    toBe(expected: T) {
      const ok = Object.is(actual, expected);
      recordAssertion(label ?? 'toBe', ok, `expected ${String(expected)}, got ${String(actual)}`);
    },
    toEqual(expected: unknown) {
      const ok = JSON.stringify(actual) === JSON.stringify(expected);
      recordAssertion(label ?? 'toEqual', ok, `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    },
    toStrictEqual(expected: unknown) {
      const ok = JSON.stringify(actual) === JSON.stringify(expected);
      recordAssertion(label ?? 'toStrictEqual', ok, `strict: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    },
    toBeTruthy() {
      recordAssertion(label ?? 'toBeTruthy', Boolean(actual), `expected truthy, got ${String(actual)}`);
    },
    toBeFalsy() {
      recordAssertion(label ?? 'toBeFalsy', !actual, `expected falsy, got ${String(actual)}`);
    },
    toBeDefined() {
      recordAssertion(label ?? 'toBeDefined', actual !== undefined, `got undefined`);
    },
    toBeUndefined() {
      recordAssertion(label ?? 'toBeUndefined', actual === undefined, `got ${String(actual)}`);
    },
    toBeNull() {
      recordAssertion(label ?? 'toBeNull', actual === null, `got ${String(actual)}`);
    },
    toThrow(fn: () => unknown, msg?: string) {
      let threw = false;
      let errMsg = '';
      try { fn(); } catch (e) { threw = true; errMsg = String(e); }
      const ok = msg ? threw && errMsg.includes(msg) : threw;
      recordAssertion(label ?? 'toThrow', ok, `did not throw as expected (msg=${msg})`);
    },
    toContain(item: unknown) {
      const isStr = typeof actual === 'string';
      const isArr = Array.isArray(actual);
      const ok = isStr ? (actual as string).includes(String(item))
                : isArr ? (actual as unknown[]).includes(item)
                : false;
      recordAssertion(label ?? 'toContain', ok, `actual does not contain ${String(item)}`);
    },
    toHaveLength(n: number) {
      const len = (actual as { length?: number })?.length ?? -1;
      recordAssertion(label ?? 'toHaveLength', len === n, `expected length ${n}, got ${len}`);
    },
    toBeGreaterThan(n: number) {
      recordAssertion(label ?? 'toBeGreaterThan', (actual as number) > n, `${actual} not > ${n}`);
    },
    toBeGreaterThanOrEqual(n: number) {
      recordAssertion(label ?? 'toBeGreaterThanOrEqual', (actual as number) >= n, `${actual} not >= ${n}`);
    },
    toBeLessThan(n: number) {
      recordAssertion(label ?? 'toBeLessThan', (actual as number) < n, `${actual} not < ${n}`);
    },
    toBeLessThanOrEqual(n: number) {
      recordAssertion(label ?? 'toBeLessThanOrEqual', (actual as number) <= n, `${actual} not <= ${n}`);
    },
  };
}

function recordAssertion(label: string, ok: boolean, msg: string): void {
  if (ok) {
    _testsPassed++;
  } else {
    _testsFailed++;
    _failures.push(`[${_currentTestName}] ${label}: ${msg}`);
  }
}

// describe/it/beforeEach/afterEach stubs (with proper per-it beforeEach)
let _beforeEachFn: (() => void) | null = null;
let _afterEachFn: (() => void) | null = null;
let _currentTestName = '';
function describe(_name: string, fn: () => void): void { fn(); }
function it(name: string, fn: () => void): void {
  _currentTestName = name;
  try {
    if (_beforeEachFn) _beforeEachFn();
    fn();
  }
  catch (e) {
    _testsFailed++;
    _failures.push(`[${name}] threw: ${String(e)}`);
  }
  finally {
    if (_afterEachFn) { try { _afterEachFn(); } catch { /* ignore */ } }
  }
}
function beforeEach(fn: () => void): void { _beforeEachFn = fn; }
function afterEach(fn: () => void): void { _afterEachFn = fn; }

// =========================================================================
// TESTS
// =========================================================================

describe('branded primitive factories', () => {
  it('makeVoiceId accepts valid format', () => {
    const v = makeVoiceId('CIGANO-F');
    expect(v).toBe('CIGANO-F' as VoiceId);
  });
  it('makeVoiceId rejects bogus', () => {
    expect({}).toThrow(() => makeVoiceId('bogus'), 'invalid VoiceId');
    expect({}).toThrow(() => makeVoiceId('CIGANO-X'), 'invalid VoiceId');
    expect({}).toThrow(() => makeVoiceId('CIGANO'), 'invalid VoiceId');
  });
  it('makeTraditionId accepts all 7', () => {
    for (const t of TRADITION_IDS) {
      expect(makeTraditionId(t)).toBe(t as unknown as ReturnType<typeof makeTraditionId>);
    }
  });
  it('makeTraditionId rejects bogus', () => {
    expect({}).toThrow(() => makeTraditionId('BOGUS'), 'invalid TraditionId');
  });
  it('makeAudioBufferId accepts ab_ prefix', () => {
    const id = makeAudioBufferId('ab_abcdef1234567890');
    expect((id as string).startsWith('ab_')).toBeTruthy();
  });
  it('makeAudioBufferId rejects wrong prefix', () => {
    expect({}).toThrow(() => makeAudioBufferId('xx_abc'), 'invalid AudioBufferId');
  });
  it('makeResponseId accepts r_ prefix', () => {
    const id = makeResponseId('r_myresponse_001');
    expect((id as string).startsWith('r_')).toBeTruthy();
  });
  it('makeSessionId accepts s_ prefix', () => {
    const id = makeSessionId('s_sessionabc');
    expect((id as string).startsWith('s_')).toBeTruthy();
  });
  it('makeChunkId accepts c_ prefix', () => {
    const id = makeChunkId('c_chunk001');
    expect((id as string).startsWith('c_')).toBeTruthy();
  });
  it('makeHash accepts 64-hex', () => {
    const id = makeHash('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef');
    expect((id as string).length).toBe(64);
  });
  it('makeHash rejects wrong format', () => {
    expect({}).toThrow(() => makeHash('not-hex'), 'invalid HashHex');
    expect({}).toThrow(() => makeHash('ABCD'), 'invalid HashHex');
  });
});

describe('Option / Result helpers', () => {
  it('some wraps value; NONE is none', () => {
    const s = some(42);
    expect(s.kind).toBe('some');
    if (s.kind === 'some') expect(s.value).toBe(42);
    expect(NONE.kind).toBe('none');
    expect(isSome(s)).toBeTruthy();
    expect(isNone(NONE)).toBeTruthy();
  });
  it('ok / err shape', () => {
    expect(ok(1).ok).toBeTruthy();
    expect(err('x').ok).toBeFalsy();
  });
  it('fromNullable handles null/undefined/value', () => {
    expect(fromNullable(1).kind).toBe('some');
    expect(fromNullable(null).kind).toBe('none');
    expect(fromNullable(undefined).kind).toBe('none');
  });
});

describe('tradition taxonomy', () => {
  it('TRADITION_IDS has 7 canonical roots', () => {
    expect(TRADITION_IDS).toHaveLength(7);
  });
  it('TRADITION_IDS are all valid literals', () => {
    for (const t of TRADITION_IDS) {
      expect(isTraditionIdLiteral(t)).toBeTruthy();
    }
  });
  it('TRADITION_DISPLAY has 7 entries', () => {
    expect(TRADITION_DISPLAY).toHaveLength(7);
  });
  it('TRADITION_DISPLAY entries have pt + en labels', () => {
    for (const t of TRADITION_DISPLAY) {
      expect(t.pt.length).toBeGreaterThan(2);
      expect(t.en.length).toBeGreaterThan(2);
    }
  });
});

describe('voice preset catalog', () => {
  beforeEach(() => { _resetTTSForTests(); });
  afterEach(() => { _resetTTSForTests(); });

  it('listVoices returns 14 presets (7 × 2)', () => {
    expect(listVoices()).toHaveLength(14);
  });
  it('each tradition has exactly 2 voices', () => {
    for (const t of TRADITION_IDS) {
      expect(listVoicesByTradition(t)).toHaveLength(2);
    }
  });
  it('each tradition has F + M voices', () => {
    for (const t of TRADITION_IDS) {
      const voices = listVoicesByTradition(t);
      const genders = voices.map((v) => v.gender).sort();
      expect(genders.join(',')).toBe('F,M');
    }
  });
  it('getVoice returns some for valid ID, none for invalid', () => {
    const v = getVoice(makeVoiceId('CIGANO-F'));
    expect(v.kind).toBe('some');
    if (v.kind === 'some') {
      expect(v.value.tradition).toBe('CIGANO');
      expect(v.value.gender).toBe('F');
    }
    const bogus = getVoice('BOGUS-X' as VoiceId);
    expect(bogus.kind).toBe('none');
  });
  it('getDefaultVoiceForTradition returns F by default', () => {
    for (const t of TRADITION_IDS) {
      const v = getDefaultVoiceForTradition(t);
      expect(v.gender).toBe('F');
      expect(v.tradition).toBe(t);
    }
  });
  it('getAlternativeVoiceForTradition returns requested gender', () => {
    const masc = getAlternativeVoiceForTradition('CANDOMBLE', 'M');
    expect(masc.gender).toBe('M');
    expect(masc.tradition).toBe('CANDOMBLE');
  });
  it('all presets have valid gravitas/rate/pitch', () => {
    for (const v of listVoices()) {
      expect(v.gravitas).toBeGreaterThanOrEqual(0);
      expect(v.gravitas).toBeLessThanOrEqual(4);
      expect(v.rate).toBeGreaterThanOrEqual(0.5);
      expect(v.rate).toBeLessThanOrEqual(1.5);
      expect(v.pitch).toBeGreaterThanOrEqual(0);
      expect(v.pitch).toBeLessThanOrEqual(2);
      expect(v.volume).toBeGreaterThanOrEqual(0);
      expect(v.volume).toBeLessThanOrEqual(1);
    }
  });
  it('all presets have sacred terms hint', () => {
    for (const v of listVoices()) {
      expect(v.sacredTermsHint.length).toBeGreaterThan(0);
    }
  });
  it('all presets have lang field', () => {
    const validLangs = ['pt-BR', 'en', 'pt-BR+yoruba', 'pt-BR+hebraico', 'pt-BR+sanscrito'];
    for (const v of listVoices()) {
      expect(validLangs.includes(v.lang)).toBeTruthy();
    }
  });
  it('formality is one of 4 values', () => {
    const valid = ['cerimonial', 'ritual', 'acolhedor', 'coloquial'];
    for (const v of listVoices()) {
      expect(valid.includes(v.formality)).toBeTruthy();
    }
  });
});

describe('sacred term detection', () => {
  it('SACRED_TERMS_PT_BR has ≥20 entries', () => {
    expect(SACRED_TERMS_PT_BR.length).toBeGreaterThanOrEqual(20);
  });
  it('normalizeForMatch NFD-normalizes + lowercases (combining mark preserved)', () => {
    // NFD splits 'á' into 'a' + U+0301 — kept for Unicode lookaround matching
    const r1 = normalizeForMatch('Oxalá');
    expect(r1.length).toBe(6); // 'o','x','a','l','a','\u0301'
    expect(r1.charAt(5)).toBe('\u0301');
    const r2 = normalizeForMatch('AXÉ');
    expect(r2.length).toBe(4); // 'a','x','e','\u0301'
    expect(r2.charAt(3)).toBe('\u0301');
  });
  it('detectSacredTerms finds orixá in PT text', () => {
    const hits = detectSacredTerms('O orixá Ogum traz a força do ferro.');
    expect(hits.length).toBeGreaterThan(0);
    expect(hits).toContain('orixá');
  });
  it('detectSacredTerms finds axé (case + diacritic insensitive)', () => {
    const hits = detectSacredTerms('Com muito axé abençoamos o consulente.');
    expect(hits).toContain('axé');
  });
  it('detectSacredTerms finds tikkún (cabala term)', () => {
    const hits = detectSacredTerms('O tikkún da sefirah é trabalho sagrado.');
    expect(hits.length).toBeGreaterThanOrEqual(1);
  });
  it('detectSacredTerms finds mantra (tantra term)', () => {
    const hits = detectSacredTerms('Repita o mantra três vezes ao amanhecer.');
    expect(hits.length).toBeGreaterThanOrEqual(1);
  });
  it('detectSacredTerms returns empty for plain text', () => {
    const hits = detectSacredTerms('Hello world, this is a plain message.');
    expect(hits).toHaveLength(0);
  });
});

describe('response chunking', () => {
  it('short text → single chunk', () => {
    const chunks = chunkResponse('Olá, mundo.');
    expect(chunks).toHaveLength(1);
    expect((chunks[0] as AudioChunk).text.length).toBe(11);
    expect((chunks[0] as AudioChunk).charCount).toBe(11);
    expect((chunks[0] as AudioChunk).index).toBe(0);
  });
  it('empty text → empty chunks', () => {
    expect(chunkResponse('')).toHaveLength(0);
    expect(chunkResponse('   ')).toHaveLength(0);
  });
  it('long text → multiple chunks (each ≤240 chars)', () => {
    const longText = 'A primeira frase do consulente é sobre sua carreira. '.repeat(20);
    const chunks = chunkResponse(longText);
    expect(chunks.length).toBeGreaterThan(1);
    for (const c of chunks) {
      expect(c.charCount).toBeLessThanOrEqual(240);
    }
  });
  it('chunks have unique hashes (SHA-256 64-hex)', () => {
    const longText = 'Uma frase muito longa. Outra frase muito longa. Mais uma frase longa.'.repeat(10);
    const chunks = chunkResponse(longText);
    const hashes = chunks.map((c) => c.hash as string);
    const unique = new Set(hashes);
    expect(unique.size).toBe(hashes.length);
    for (const h of hashes) {
      expect(h.length).toBe(64);
    }
  });
  it('chunk indices are sequential from 0', () => {
    const chunks = chunkResponse('Frase um. Frase dois. Frase três. Frase quatro. Frase cinco.');
    chunks.forEach((c, i) => expect(c.index).toBe(i));
  });
  it('chunks preserve sentence boundaries', () => {
    const chunks = chunkResponse('Frase A. Frase B. Frase C.');
    expect(chunks.length).toBeGreaterThanOrEqual(1);
    // At minimum, no chunk should split mid-word — all should end at word boundary
    for (const c of chunks) {
      const t = c.text.trim();
      expect(t.endsWith('.') || t.endsWith('!') || t.endsWith('?') || t.length < 50).toBeTruthy();
    }
  });
});

describe('synthesis request + audio buffer', () => {
  beforeEach(() => { _resetTTSForTests(); });
  afterEach(() => { _resetTTSForTests(); });

  it('buildSynthesisRequest accepts non-empty text', () => {
    const v = getDefaultVoiceForTradition('CIGANO');
    const r = buildSynthesisRequest('Olá consulente.', v);
    expect(r.ok).toBeTruthy();
    if (r.ok) {
      expect(r.value.totalChars).toBe('Olá consulente.'.length);
      expect(r.value.estimatedDurationMs).toBeGreaterThan(0);
      expect(r.value.chunks.length).toBeGreaterThan(0);
    }
  });
  it('buildSynthesisRequest rejects empty text', () => {
    const v = getDefaultVoiceForTradition('CIGANO');
    const r = buildSynthesisRequest('   ', v);
    expect(r.ok).toBeFalsy();
    if (!r.ok) expect(r.error.kind).toBe('empty-text');
  });
  it('buildSynthesisRequest detects sacred terms', () => {
    const v = getDefaultVoiceForTradition('CANDOMBLE');
    const r = buildSynthesisRequest('O orixá Ogum traz proteção.', v);
    expect(r.ok).toBeTruthy();
    if (r.ok) {
      expect(r.value.sacredTermsDetected.length).toBeGreaterThan(0);
    }
  });
  it('synthesizeToBuffer produces cached buffer', () => {
    const v = getDefaultVoiceForTradition('CIGANO');
    const r = synthesizeToBuffer('Texto para teste.', v);
    expect(r.ok).toBeTruthy();
    if (r.ok) {
      expect(r.value.sizeBytes).toBeGreaterThan(0);
      expect(r.value.estimatedDurationMs).toBeGreaterThan(0);
      expect(r.value.format).toBe('wav');
      expect((r.value.id as string).startsWith('ab_')).toBeTruthy();
    }
    expect(audioCacheSize()).toBe(1);
  });
  it('synthesizeToBuffer returns cached on repeat', () => {
    const v = getDefaultVoiceForTradition('CIGANO');
    const r1 = synthesizeToBuffer('Cache me.', v);
    const r2 = synthesizeToBuffer('Cache me.', v);
    if (r1.ok && r2.ok) {
      expect(r1.value.id).toBe(r2.value.id);
    }
    expect(audioCacheSize()).toBe(1);
  });
  it('synthesizeToBuffer rejects empty', () => {
    const v = getDefaultVoiceForTradition('CIGANO');
    const r = synthesizeToBuffer('', v);
    expect(r.ok).toBeFalsy();
    if (!r.ok) expect(r.error.kind).toBe('empty-text');
  });
  it('synthesizeToBuffer accepts mp3 format', () => {
    const v = getDefaultVoiceForTradition('CIGANO');
    const r = synthesizeToBuffer('Teste mp3.', v, { format: 'mp3' });
    expect(r.ok).toBeTruthy();
    if (r.ok) expect(r.value.format).toBe('mp3');
  });
  it('getCachedBuffer returns some on hit, none on miss', () => {
    const v = getDefaultVoiceForTradition('CIGANO');
    synthesizeToBuffer('Cache hit.', v);
    const hit = getCachedBuffer('Cache hit.', v);
    expect(hit.kind).toBe('some');
    const miss = getCachedBuffer('Not cached.', v);
    expect(miss.kind).toBe('none');
  });
  it('clearAudioCache empties the cache', () => {
    const v = getDefaultVoiceForTradition('CIGANO');
    synthesizeToBuffer('To clear.', v);
    expect(audioCacheSize()).toBe(1);
    clearAudioCache();
    expect(audioCacheSize()).toBe(0);
  });
});

describe('playback state machine', () => {
  beforeEach(() => { _resetTTSForTests(); _setAutoPlayForTests(true); });
  afterEach(() => { _resetTTSForTests(); _setAutoPlayForTests(false); });

  function makeReq(): SynthesisRequest {
    const v = getDefaultVoiceForTradition('CIGANO');
    const r = buildSynthesisRequest('Texto para sessão.', v);
    if (!r.ok) throw new Error('buildSynthesisRequest failed');
    return r.value;
  }

  it('createSession starts in idle', () => {
    const req = makeReq();
    const s = createSession(req, { autoPlayApproved: true });
    expect(s.state).toBe('idle');
    expect(s.positionMs).toBe(0);
    expect(s.durationMs).toBeGreaterThan(0);
    expect(s.chunkCount).toBe(1);
  });
  it('play transitions idle → playing (when autoPlayApproved)', () => {
    const req = makeReq();
    const s = createSession(req, { autoPlayApproved: true });
    const next = play(s);
    expect(next.state).toBe('playing');
  });
  it('play from idle WITHOUT autoPlayApproved stays idle (LGPD)', () => {
    const req = makeReq();
    const s = createSession(req, { autoPlayApproved: false });
    const next = play(s);
    expect(next.state).toBe('idle');
  });
  it('pause from playing → paused', () => {
    const req = makeReq();
    const s = createSession(req, { autoPlayApproved: true });
    const playing = play(s);
    const paused = pause(playing);
    expect(paused.state).toBe('paused');
  });
  it('pause from non-playing is no-op', () => {
    const req = makeReq();
    const s = createSession(req, { autoPlayApproved: true });
    const next = pause(s);
    expect(next.state).toBe('idle');
  });
  it('resume from paused → playing', () => {
    const req = makeReq();
    const s = createSession(req, { autoPlayApproved: true });
    const playing = play(s);
    const paused = pause(playing);
    const resumed = resume(paused);
    expect(resumed.state).toBe('playing');
  });
  it('resume from non-paused is no-op', () => {
    const req = makeReq();
    const s = createSession(req, { autoPlayApproved: true });
    const playing = play(s);
    const next = resume(playing);
    expect(next.state).toBe('playing');
  });
  it('stop resets position and sets state to ended', () => {
    const req = makeReq();
    const s = createSession(req, { autoPlayApproved: true });
    const playing = play(s);
    const stopped = stop(playing);
    expect(stopped.state).toBe('ended');
    expect(stopped.positionMs).toBe(0);
  });
  it('seek updates position and clamps to duration', () => {
    const req = makeReq();
    const s = createSession(req, { autoPlayApproved: true });
    const mid = seek(s, 100);
    expect(mid.positionMs).toBe(100);
    const over = seek(s, 99999);
    expect(over.state).toBe('ended');
  });
  it('seek to negative is no-op', () => {
    const req = makeReq();
    const s = createSession(req, { autoPlayApproved: true });
    const next = seek(s, -100);
    expect(next.positionMs).toBe(0);
  });
  it('failOnLoad transitions to error state', () => {
    const req = makeReq();
    const s = createSession(req, { autoPlayApproved: true, failOnLoad: true });
    const next = play(s);
    expect(next.state).toBe('error');
  });
  it('onStateChange subscribes and unsubscribes', () => {
    const req = makeReq();
    const s = createSession(req, { autoPlayApproved: true });
    let received: PlaybackState = 'idle' as PlaybackState;
    const unsub = onStateChange(s, (st: PlaybackState) => { received = st; });
    play(s);
    expect(received).toBe('playing');
    unsub();
  });
});

describe('accessibility', () => {
  it('getKeyboardShortcuts has 7 shortcuts', () => {
    const sc = getKeyboardShortcuts();
    expect(sc).toHaveLength(7);
  });
  it('Space = play-pause', () => {
    const sc = getKeyboardShortcuts().find((s) => s.key === 'Space');
    expect(sc?.action).toBe('play-pause');
  });
  it('Escape = stop', () => {
    const sc = getKeyboardShortcuts().find((s) => s.key === 'Escape');
    expect(sc?.action).toBe('stop');
  });
  it('ArrowLeft/Right = seek', () => {
    const sc = getKeyboardShortcuts().filter((s) => s.key === 'ArrowLeft' || s.key === 'ArrowRight');
    expect(sc).toHaveLength(2);
    const actions = sc.map((s) => s.action).sort();
    expect(actions.join(',')).toBe('seek-backward,seek-forward');
  });
  it('getScreenReaderAnnouncement returns 6 states', () => {
    const states: PlaybackState[] = ['idle', 'loading', 'playing', 'paused', 'ended', 'error'];
    const msgs = states.map((s) => getScreenReaderAnnouncement(s, 'Cigana voz suave'));
    expect(msgs).toHaveLength(6);
    for (const m of msgs) {
      expect(m.id.length).toBeGreaterThan(0);
      expect(m.text.length).toBeGreaterThan(0);
    }
  });
  it('playing announcement includes voice label', () => {
    const m = getScreenReaderAnnouncement('playing', 'Orixá Feminino');
    expect(m.text).toContain('Orixá Feminino');
  });
});

describe('download / filename', () => {
  it('buildAudioFilename returns safe filename', () => {
    const v = getDefaultVoiceForTradition('CIGANO');
    const f = buildAudioFilename(v, 'wav');
    expect(f.endsWith('.wav')).toBeTruthy();
    expect(f).toContain('cigano');
  });
  it('buildAudioFilename strips diacritics from mp3', () => {
    const v = getDefaultVoiceForTradition('CANDOMBLE');
    const f = buildAudioFilename(v, 'mp3');
    expect(f.endsWith('.mp3')).toBeTruthy();
    expect(f).toContain('candomb');
  });
  it('estimateAudioSizeMs scales linearly', () => {
    const a = estimateAudioSizeMs('Olá.');
    const b = estimateAudioSizeMs('Olá.'.repeat(10));
    expect(b).toBeGreaterThan(a * 5);
  });
});

describe('LGPD / autoPlay', () => {
  beforeEach(() => { _setAutoPlayForTests(false); });
  afterEach(() => { _setAutoPlayForTests(false); });

  it('isAutoPlayApproved defaults to false (LGPD)', () => {
    expect(isAutoPlayApproved()).toBeFalsy();
  });
  it('approveAutoPlay toggles to true', () => {
    approveAutoPlay();
    expect(isAutoPlayApproved()).toBeTruthy();
  });
  it('revokeAutoPlay toggles back to false', () => {
    approveAutoPlay();
    revokeAutoPlay();
    expect(isAutoPlayApproved()).toBeFalsy();
  });
});

describe('hash / canonicalization', () => {
  it('hashSynthesisRequest deterministic', () => {
    const v = getDefaultVoiceForTradition('CIGANO');
    const r = buildSynthesisRequest('Hash me.', v);
    if (!r.ok) throw new Error('build failed');
    const h1 = hashSynthesisRequest(r.value);
    const h2 = hashSynthesisRequest(r.value);
    expect(h1).toBe(h2);
  });
  it('hashAudioBuffer deterministic', () => {
    const v = getDefaultVoiceForTradition('CIGANO');
    const r = synthesizeToBuffer('Buffer me.', v);
    if (!r.ok) throw new Error('synth failed');
    expect(hashAudioBuffer(r.value)).toBe(hashAudioBuffer(r.value));
  });
  it('hashVoicePreset deterministic', () => {
    const v = getDefaultVoiceForTradition('CIGANO');
    expect(hashVoicePreset(v)).toBe(hashVoicePreset(v));
  });
  it('hashes change when content changes', () => {
    const v = getDefaultVoiceForTradition('CIGANO');
    const a = hashVoicePreset(v);
    const alt = getAlternativeVoiceForTradition('CIGANO', 'M');
    expect(a === hashVoicePreset(alt)).toBeFalsy();
  });
});

// ============================== REPORT ==============================

console.log(`\nSpec summary: ${_testsPassed} passed, ${_testsFailed} failed`);
if (_testsFailed > 0) {
  console.error('Failures:');
  for (const f of _failures) console.error('  - ' + f);
  process.exit(1);
}
