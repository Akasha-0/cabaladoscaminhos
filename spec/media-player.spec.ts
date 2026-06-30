/**
 * media-player.spec.ts — self-running spec harness
 *
 * Tests mock HTMLMediaElement to exercise the player controls and waveform
 * rendering. Magic-byte parsing is unit-tested directly via the WAV header
 * generator.
 */

import {
  createPlayer,
  play,
  pause,
  seek,
  setVolume,
  setPlaybackRate,
  getPlayerState,
  extractWaveform,
  generateWaveformSvg,
  extractVideoThumbnail,
  parseWavHeader,
  setPlayerCtor,
  auditPlayerRules,
} from '../engines/media-player.ts';

type ItResult = { name: string; ok: boolean; msg?: string };

function assertIt(cond: unknown, msg: string, neg = false): void {
  const ok = neg ? !cond : !!cond;
  if (!ok) throw new Error(`assertIt failed: ${msg} (got ${JSON.stringify(cond)})`);
}

let passed = 0;
let failed = 0;
let assertions = 0;
const its: ItResult[] = [];

const itFn = async (name: string, fn: () => void | Promise<void>) => {
  try {
    await fn();
    passed++;
    its.push({ name, ok: true });
  } catch (e: any) {
    failed++;
    its.push({ name, ok: false, msg: e?.message ?? String(e) });
  }
};

// ─── Mock HTMLMediaElement ──────────────────────────────────────────────────

class MockTimeRanges {
  ranges: ReadonlyArray<[number, number]>;
  constructor(ranges: ReadonlyArray<[number, number]>) {
    this.ranges = ranges;
  }
  get length(): number { return this.ranges.length; }
  start(i: number): number { return this.ranges[i]?.[0] ?? 0; }
  end(i: number): number { return this.ranges[i]?.[1] ?? 0; }
}

class MockHTMLMediaElement {
  src: string;
  currentSrc: string = '';
  duration = 0;
  currentTime = 0;
  volume = 1;
  muted = false;
  defaultPlaybackRate = 1;
  playbackRate = 1;
  paused = true;
  ended = false;
  readyState = 0;
  networkState = 0;
  error: any = null;
  buffered: MockTimeRanges = new MockTimeRanges([]);
  playCalls = 0;
  pauseCalls = 0;
  constructor(src: string) {
    this.src = src;
    this.currentSrc = src;
  }
  async play(): Promise<void> {
    this.playCalls++;
    this.paused = false;
  }
  pause() {
    this.pauseCalls++;
    this.paused = true;
  }
  setDuration(seconds: number) { this.duration = seconds; }
}

// ─── WAV generator ──────────────────────────────────────────────────────────

function buildWavHeader(sampleRate: number, numChannels: number, bitsPerSample: number, dataSize: number): Uint8Array {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const totalSize = 36 + dataSize;
  const buf = new Uint8Array(44 + dataSize);
  const view = new DataView(buf.buffer);
  view.setUint8(0, 0x52); view.setUint8(1, 0x49); view.setUint8(2, 0x46); view.setUint8(3, 0x46); // RIFF
  view.setUint32(4, totalSize, true);
  view.setUint8(8, 0x57); view.setUint8(9, 0x41); view.setUint8(10, 0x56); view.setUint8(11, 0x45); // WAVE
  view.setUint8(12, 0x66); view.setUint8(13, 0x6d); view.setUint8(14, 0x74); view.setUint8(15, 0x20); // 'fmt '
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  view.setUint8(36, 0x64); view.setUint8(37, 0x61); view.setUint8(38, 0x74); view.setUint8(39, 0x61); // 'data'
  view.setUint32(40, dataSize, true);
  return buf;
}

function buildSineWav(sampleRate: number, durationSec: number, freq: number): Uint8Array {
  const numSamples = sampleRate * durationSec;
  const dataSize = numSamples * 2;
  const buf = buildWavHeader(sampleRate, 1, 16, dataSize);
  const view = new DataView(buf.buffer, 44, dataSize);
  for (let i = 0; i < numSamples; i++) {
    const v = Math.sin((2 * Math.PI * freq * i) / sampleRate);
    view.setInt16(i * 2, Math.round(v * 32000), true);
  }
  return buf;
}

// ─── Spec body ──────────────────────────────────────────────────────────────

export async function runMediaPlayerSpec(): Promise<{
  passed: number;
  failed: number;
  assertions: number;
  its: ItResult[];
}> {
  passed = 0;
  failed = 0;
  assertions = 0;
  its.length = 0;
  setPlayerCtor(MockHTMLMediaElement as any);

  await itFn('createPlayer rejects empty url', async () => {
    let threw = false;
    try { createPlayer('', 'audio'); } catch { threw = true; }
    assertions++;
    assertIt(threw, 'expected throw');
  });

  await itFn('createPlayer rejects invalid type', async () => {
    let threw = false;
    try { createPlayer('http://x', 'wrong' as any); } catch { threw = true; }
    assertions++;
    assertIt(threw, 'expected throw');
  });

  await itFn('createPlayer returns the constructor instance', () => {
    const el = createPlayer('http://example/audio.webm', 'audio');
    assertions++;
    assertIt(el.src === 'http://example/audio.webm', `src=${el.src}`);
  });

  await itFn('play resolves and updates state', async () => {
    const el = createPlayer('http://example/audio.webm', 'audio') as any;
    await play(el);
    assertions++;
    assertIt(el.playCalls === 1, `playCalls=${el.playCalls}`);
    assertions++;
    assertIt(!el.paused, 'still paused');
  });

  await itFn('pause increments counter', () => {
    const el = createPlayer('http://example/audio.webm', 'audio') as any;
    pause(el);
    assertions++;
    assertIt(el.pauseCalls === 1, `pauseCalls=${el.pauseCalls}`);
    assertions++;
    assertIt(el.paused, 'not paused');
  });

  await itFn('seek converts ms to seconds', () => {
    const el = createPlayer('http://example/audio.webm', 'audio') as any;
    seek(el, 5000);
    assertions++;
    assertIt(el.currentTime === 5, `currentTime=${el.currentTime}`);
  });

  await itFn('seek rejects negative or non-finite ms', () => {
    const el = createPlayer('http://example/audio.webm', 'audio') as any;
    let threw1 = false; try { seek(el, -1); } catch { threw1 = true; }
    let threw2 = false; try { seek(el, NaN); } catch { threw2 = true; }
    assertions++;
    assertIt(threw1, 'expected throw for -1');
    assertions++;
    assertIt(threw2, 'expected throw for NaN');
  });

  await itFn('setVolume clamps to [0,1]', () => {
    const el = createPlayer('http://example/audio.webm', 'audio') as any;
    setVolume(el, 0.5);
    assertions++;
    assertIt(el.volume === 0.5, `volume=${el.volume}`);
    let threw1 = false; try { setVolume(el, -0.1); } catch { threw1 = true; }
    let threw2 = false; try { setVolume(el, 1.5); } catch { threw2 = true; }
    assertions++;
    assertIt(threw1, 'expected throw for -0.1');
    assertions++;
    assertIt(threw2, 'expected throw for 1.5');
  });

  await itFn('setPlaybackRate clamps to [0.25, 2]', () => {
    const el = createPlayer('http://example/audio.webm', 'audio') as any;
    setPlaybackRate(el, 1.0);
    assertions++;
    assertIt(el.playbackRate === 1.0, `rate=${el.playbackRate}`);
    let threw = false; try { setPlaybackRate(el, 3.0); } catch { threw = true; }
    assertions++;
    assertIt(threw, 'expected throw for 3.0');
  });

  await itFn('getPlayerState reads snapshotted state', async () => {
    const el = createPlayer('http://example/audio.webm', 'audio') as any;
    el.setDuration(60);
    el.currentTime = 5;
    el.volume = 0.7;
    el.playbackRate = 1.5;
    el.buffered = new MockTimeRanges([[0, 30]]);
    const s = getPlayerState(el);
    assertions++;
    assertIt(s.durationMs === 60000, `duration=${s.durationMs}`);
    assertions++;
    assertIt(s.currentTimeMs === 5000, `currentTime=${s.currentTimeMs}`);
    assertions++;
    assertIt(s.volume === 0.7, `volume=${s.volume}`);
    assertions++;
    assertIt(s.playbackRate === 1.5, `rate=${s.playbackRate}`);
    assertions++;
    assertIt(s.buffered.length === 1, `buffered=${s.buffered.length}`);
    assertions++;
    assertIt(s.buffered[0]![0] === 0 && s.buffered[0]![1] === 30, 'buffered range mismatch');
  });

  await itFn('parseWavHeader parses canonical 16-bit PCM mono 44.1k WAV', () => {
    const wav = buildSineWav(44100, 0.05, 440);
    const info = parseWavHeader(wav);
    assertions++;
    assertIt(info !== null, 'parseWavHeader returned null');
    if (info) {
      assertions++;
      assertIt(info.sampleRate === 44100, `sampleRate=${info.sampleRate}`);
      assertions++;
      assertIt(info.numChannels === 1, `channels=${info.numChannels}`);
      assertions++;
      assertIt(info.bitsPerSample === 16, `bits=${info.bitsPerSample}`);
      assertions++;
      assertIt(info.audioFormat === 1, `format=${info.audioFormat}`);
      assertions++;
      assertIt(info.dataSize > 0, `dataSize=${info.dataSize}`);
    }
  });

  await itFn('parseWavHeader rejects non-WAV bytes', () => {
    const notWav = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    const info = parseWavHeader(notWav);
    assertions++;
    assertIt(info === null, `info=${JSON.stringify(info)}`);
  });

  await itFn('extractWaveform from data URL WAV yields peaks', async () => {
    const wav = buildSineWav(44100, 0.1, 440);
    // Encode to base64.
    const bin = Buffer.from(wav).toString('base64');
    const dataUrl = `data:audio/wav;base64,${bin}`;
    const waves = await extractWaveform(dataUrl, 32);
    assertions++;
    assertIt(waves.length === 32, `length=${waves.length}`);
    assertions++;
    assertIt(waves.every((v) => v >= 0 && v <= 1), 'out of [0,1]');
    assertions++;
    assertIt(waves.some((v) => v > 0.05), 'no significant peaks');
  });

  await itFn('extractWaveform from non-data URL returns deterministic placeholder', async () => {
    const waves = await extractWaveform('https://example/audio.wav', 16);
    assertions++;
    assertIt(waves.length === 16, `length=${waves.length}`);
    assertions++;
    assertIt(waves.every((v) => v >= 0 && v <= 1), 'out of [0,1]');
  });

  await itFn('extractWaveform rejects bad samples count', async () => {
    let threw = false;
    try { await extractWaveform('http://x', 0); } catch { threw = true; }
    assertions++;
    assertIt(threw, 'expected throw');
  });

  await itFn('generateWaveformSvg produces valid SVG markup', () => {
    const waves = [0.1, 0.5, 0.8, 0.3, 0.7];
    const svg = generateWaveformSvg(waves, { width: 200, height: 50, color: '#4f46e5', backgroundColor: '#0f172a' });
    assertions++;
    assertIt(svg.startsWith('<svg'), `svg=${svg.slice(0, 30)}`);
    assertions++;
    assertIt(svg.endsWith('</svg>'), 'missing closing tag');
    assertions++;
    assertIt(svg.includes('viewBox="0 0 200 50"'), 'viewBox missing');
    assertions++;
    assertIt(svg.includes('fill="#4f46e5"'), 'fill missing');
    assertions++;
    assertIt((svg.match(/<rect /g) ?? []).length === waves.length + 1, 'rect count mismatch');
  });

  await itFn('generateWaveformSvg rejects empty waveform', () => {
    let threw = false;
    try { generateWaveformSvg([], { width: 100, height: 30, color: '#fff', backgroundColor: '#000' }); } catch { threw = true; }
    assertions++;
    assertIt(threw, 'expected throw');
  });

  await itFn('generateWaveformSvg sanitizes dangerous color strings', () => {
    const waves = [0.5];
    const svg = generateWaveformSvg(waves, { width: 100, height: 30, color: 'red;background:url(javascript:1)', backgroundColor: '#000000' });
    assertions++;
    assertIt(!svg.includes('url('), 'sanitizer missed url()');
    assertions++;
    assertIt(svg.includes('rect'), 'no rect');
  });

  await itFn('extractVideoThumbnail returns a Blob', async () => {
    const b = await extractVideoThumbnail('http://x/test.mp4', 1000);
    assertions++;
    assertIt(b instanceof Blob, `not Blob: ${typeof b}`);
    assertions++;
    assertIt(b.size > 0, `size=${b.size}`);
    assertions++;
    assertIt(b.type === 'image/png', `type=${b.type}`);
  });

  await itFn('extractVideoThumbnail rejects negative timeMs', async () => {
    let threw = false;
    try { await extractVideoThumbnail('http://x/test.mp4', -1); } catch { threw = true; }
    assertions++;
    assertIt(threw, 'expected throw');
  });

  await itFn('auditPlayerRules shape', () => {
    const a = auditPlayerRules();
    assertions++;
    assertIt(a.engine === 'media-player', 'engine mismatch');
    assertions++;
    assertIt(a.wavMagic === 'RIFF?WAVE', `wavMagic=${a.wavMagic}`);
    assertions++;
    assertIt(a.svgBars === true, 'svgBars');
    assertions++;
    assertIt(a.sacredCoverage.traditions.length === 7, 'tradition count');
  });

  setPlayerCtor(null);

  return { passed, failed, assertions, its };
}

const isMain = (() => {
  try { return import.meta.url === `file://${process.argv[1]}`; } catch { return false; }
})();

if (isMain) {
  runMediaPlayerSpec().then((r) => {
    console.log(`media-player.spec: passed=${r.passed} failed=${r.failed} assertions=${r.assertions}`);
    if (r.failed > 0) {
      for (const it of r.its) if (!it.ok) console.error(` - [FAIL] ${it.name}: ${it.msg}`);
      process.exit(1);
    }
  });
}
