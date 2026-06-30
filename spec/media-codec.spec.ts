/**
 * media-codec.spec.ts — self-running spec harness
 *
 * Tests format detection (magic bytes), recommended settings, file-size
 * estimation, transcode plans, and the 7-tradition preset canon.
 *
 * Sacred-coverage validator: every tradition preset must expose ≥10 sacred
 * refs (≥84 total across the 7 traditions).
 */

import {
  detectFormat,
  getRecommendedSettings,
  estimateFileSize,
  transcodePlan,
  getTraditionPreset,
  TRADITION_PRESETS,
  auditCodecRules,
  type Tradition,
} from '../engines/media-codec.ts';

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

// ─── Magic byte builders ────────────────────────────────────────────────────

function buf(...bytes: number[]): Uint8Array {
  return new Uint8Array(bytes);
}

function bufFromString(s: string): Uint8Array {
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

// ─── Spec body ──────────────────────────────────────────────────────────────

const ALL_TRADITIONS: Tradition[] = ['cigano', 'orixas', 'astrologia', 'cabala', 'numerologia', 'tantra', 'tarot'];

export async function runMediaCodecSpec(): Promise<{
  passed: number;
  failed: number;
  assertions: number;
  its: ItResult[];
}> {
  passed = 0;
  failed = 0;
  assertions = 0;
  its.length = 0;

  await itFn('detectFormat: WAV (RIFF...WAVE) returns wav+pcm', () => {
    // 12 bytes: RIFF, size, WAVE
    const b = buf(0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45,
                 // fmt chunk
                 0x66, 0x6d, 0x74, 0x20, 0x10, 0x00, 0x00, 0x00,
                 0x01, 0x00, // format=PCM
                 0x01, 0x00, // channels=1
                 0x44, 0xac, 0x00, 0x00, // 44100
                 0x88, 0x58, 0x01, 0x00, // 88200
                 0x02, 0x00, // blockAlign=2
                 0x10, 0x00); // bits=16
    const f = detectFormat(b);
    assertions++;
    assertIt(f.container === 'wav', `container=${f.container}`);
    assertions++;
    assertIt(f.codec === 'pcm', `codec=${f.codec}`);
    assertions++;
    assertIt(f.sampleRate === 44100, `sampleRate=${f.sampleRate}`);
  });

  await itFn('detectFormat: MP3 with ID3 returns mp3/mp3', () => {
    const b = buf(0x49, 0x44, 0x33, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
    const f = detectFormat(b);
    assertions++;
    assertIt(f.container === 'mp3', `container=${f.container}`);
    assertions++;
    assertIt(f.codec === 'mp3', `codec=${f.codec}`);
  });

  await itFn('detectFormat: MP3 frame sync byte returns mp3/mp3', () => {
    // FF FB 90 44 — frame sync, MPEG1 Layer 3, 128kbps, 44100Hz
    const b = buf(0xff, 0xfb, 0x90, 0x44, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
    const f = detectFormat(b);
    assertions++;
    assertIt(f.container === 'mp3', `container=${f.container}`);
    assertions++;
    assertIt(f.codec === 'mp3', `codec=${f.codec}`);
    assertions++;
    assertIt(f.sampleRate === 44100 || f.sampleRate === undefined, `sampleRate=${f.sampleRate}`);
  });

  await itFn('detectFormat: MP4 (ftyp) returns mp4+aac', () => {
    // 12 bytes with ftyp at offset 4
    const b = buf(0, 0, 0, 0x20, 0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34, 0x32, // 'mp42'
                 0, 0, 0, 0);
    const f = detectFormat(b);
    assertions++;
    assertIt(f.container === 'mp4', `container=${f.container}`);
    assertions++;
    assertIt(f.codec === 'aac', `codec=${f.codec}`);
  });

  await itFn('detectFormat: MP4 (M4A major brand) returns m4a+aac', () => {
    const b = buf(0, 0, 0, 0x20, 0x66, 0x74, 0x79, 0x70, 0x4d, 0x34, 0x41, 0x20,
                 0, 0, 0, 0);
    const f = detectFormat(b);
    assertions++;
    assertIt(f.container === 'm4a', `container=${f.container}`);
  });

  await itFn('detectFormat: WebM (1A45DFA3) returns webm+vp9+opus', () => {
    const b = buf(0x1a, 0x45, 0xdf, 0xa3, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00);
    const f = detectFormat(b);
    assertions++;
    assertIt(f.container === 'webm', `container=${f.container}`);
    assertions++;
    assertIt(f.codec === 'vp9+opus', `codec=${f.codec}`);
  });

  await itFn('detectFormat: OGG (OggS) returns ogg+opus', () => {
    const b = buf(0x4f, 0x67, 0x67, 0x53, 0, 0, 0, 0, 0, 0, 0, 0);
    const f = detectFormat(b);
    assertions++;
    assertIt(f.container === 'ogg', `container=${f.container}`);
    assertions++;
    assertIt(f.codec === 'opus', `codec=${f.codec}`);
  });

  await itFn('detectFormat: unknown returns unknown/unknown', () => {
    const b = buf(0xde, 0xad, 0xbe, 0xef, 0x12, 0x34, 0x56, 0x78, 0x90, 0xab, 0xcd, 0xef);
    const f = detectFormat(b);
    assertions++;
    assertIt(f.container === 'unknown', `container=${f.container}`);
    assertions++;
    assertIt(f.codec === 'unknown', `codec=${f.codec}`);
  });

  await itFn('detectFormat: rejects short buffer', () => {
    const b = buf(0x52, 0x49);
    const f = detectFormat(b);
    assertions++;
    assertIt(f.container === 'unknown', `container=${f.container}`);
  });

  await itFn('getRecommendedSettings: audio quality preset', () => {
    const r = getRecommendedSettings('audio', 'quality');
    assertions++;
    assertIt(r.audioBitsPerSecond === 192_000, `bps=${r.audioBitsPerSecond}`);
    assertions++;
    assertIt(r.sampleRate === 48000, `sr=${r.sampleRate}`);
  });

  await itFn('getRecommendedSettings: audio balanced preset', () => {
    const r = getRecommendedSettings('audio', 'balanced');
    assertions++;
    assertIt(r.audioBitsPerSecond === 128_000, `bps=${r.audioBitsPerSecond}`);
  });

  await itFn('getRecommendedSettings: audio size preset', () => {
    const r = getRecommendedSettings('audio', 'size');
    assertions++;
    assertIt(r.audioBitsPerSecond === 64_000, `bps=${r.audioBitsPerSecond}`);
  });

  await itFn('getRecommendedSettings: video quality preset includes 1080p', () => {
    const r = getRecommendedSettings('video', 'quality');
    assertions++;
    assertIt(r.videoWidth === 1920, `width=${r.videoWidth}`);
    assertions++;
    assertIt(r.videoHeight === 1080, `height=${r.videoHeight}`);
    assertions++;
    assertIt(r.videoBitsPerSecond === 4_000_000, `vbps=${r.videoBitsPerSecond}`);
  });

  await itFn('getRecommendedSettings: video balanced preset includes 720p', () => {
    const r = getRecommendedSettings('video', 'balanced');
    assertions++;
    assertIt(r.videoWidth === 1280, `width=${r.videoWidth}`);
    assertions++;
    assertIt(r.videoHeight === 720, `height=${r.videoHeight}`);
  });

  await itFn('getRecommendedSettings: video size preset includes 480p', () => {
    const r = getRecommendedSettings('video', 'size');
    assertions++;
    assertIt(r.videoWidth === 854, `width=${r.videoWidth}`);
    assertions++;
    assertIt(r.videoHeight === 480, `height=${r.videoHeight}`);
  });

  await itFn('estimateFileSize: audio 60s @ 128kbps = ~960KB', () => {
    const r = estimateFileSize(60_000, { audioBitsPerSecond: 128_000 });
    assertions++;
    assertIt(r === 960_000, `r=${r}`);
  });

  await itFn('estimateFileSize: video 60s @ 1.5Mbps+128kbps = ~12.2MB', () => {
    const r = estimateFileSize(60_000, { videoBitsPerSecond: 1_500_000, audioBitsPerSecond: 128_000 });
    const expected = Math.round(((1_500_000 + 128_000) / 8) * 60);
    assertions++;
    assertIt(r === expected, `r=${r} expected=${expected}`);
  });

  await itFn('estimateFileSize: 0 duration returns 0', () => {
    const r = estimateFileSize(0, { audioBitsPerSecond: 128_000 });
    assertions++;
    assertIt(r === 0, `r=${r}`);
  });

  await itFn('estimateFileSize: empty config falls back to default', () => {
    const r = estimateFileSize(10_000, {});
    const expected = Math.round((128_000 / 8) * 10);
    assertions++;
    assertIt(r === expected, `r=${r} expected=${expected}`);
  });

  await itFn('transcodePlan: audio aac includes encode_audio:aac', () => {
    const plan = transcodePlan({ container: 'wav', codec: 'pcm' } as any, 'audio', 'aac');
    assertions++;
    assertIt(plan.steps.length > 0, 'no steps');
    assertions++;
    assertIt(plan.steps.some((s) => s.includes('aac')), 'no aac step');
    assertions++;
    assertIt(typeof plan.estimatedMs === 'number' && plan.estimatedMs >= 0, 'estimatedMs');
    assertions++;
    assertIt(typeof plan.estimatedSizeBytes === 'number' && plan.estimatedSizeBytes > 0, 'estimatedSize');
  });

  await itFn('transcodePlan: video h264 includes encode_video:h264', () => {
    const plan = transcodePlan({ container: 'mp4', codec: 'aac' } as any, 'video', 'h264');
    assertions++;
    assertIt(plan.steps.some((s) => s.includes('h264')), 'no h264');
    assertions++;
    assertIt(plan.steps.some((s) => s.includes('parse_input')), 'no parse step');
  });

  await itFn('transcodePlan: rejects invalid targetType', () => {
    let threw = false;
    try { transcodePlan({ container: 'mp3', codec: 'mp3' } as any, 'pic' as any, 'aac'); } catch { threw = true; }
    assertions++;
    assertIt(threw, 'expected throw');
  });

  await itFn('transcodePlan: rejects invalid targetCodec', () => {
    let threw = false;
    try { transcodePlan({ container: 'mp3', codec: 'mp3' } as any, 'audio', 'midi' as any); } catch { threw = true; }
    assertions++;
    assertIt(threw, 'expected throw');
  });

  // ── Tradition preset canon (CRITICAL: 7/7 with ≥12 sacred refs each = ≥84) ──

  await itFn('TRADITION_PRESETS has exactly 7 traditions', () => {
    assertions++;
    assertIt(Object.keys(TRADITION_PRESETS).length === 7, `keys=${Object.keys(TRADITION_PRESETS).length}`);
    for (const t of ALL_TRADITIONS) {
      assertions++;
      assertIt(TRADITION_PRESETS[t] !== undefined, `missing ${t}`);
    }
  });

  await itFn('each tradition has ≥10 sacred refs (total ≥84)', () => {
    let total = 0;
    for (const t of ALL_TRADITIONS) {
      const refs = TRADITION_PRESETS[t].sacredRefs;
      assertions++;
      assertIt(refs.length >= 10, `${t}: ${refs.length} refs`);
      total += refs.length;
    }
    assertions++;
    assertIt(total >= 84, `total sacred refs=${total}`);
  });

  await itFn('each tradition exposes pt-BR + en + es locales', () => {
    for (const t of ALL_TRADITIONS) {
      const l = TRADITION_PRESETS[t].locale;
      assertions++;
      assertIt(typeof l['pt-BR'] === 'string' && l['pt-BR'].length > 0, `${t}: pt-BR missing`);
      assertions++;
      assertIt(typeof l.en === 'string' && l.en.length > 0, `${t}: en missing`);
      assertions++;
      assertIt(typeof l.es === 'string' && l.es.length > 0, `${t}: es missing`);
      const d = TRADITION_PRESETS[t].description;
      assertions++;
      assertIt(d['pt-BR'].length > 10, `${t}: pt-BR desc too short`);
    }
  });

  await itFn('getTraditionPreset returns frozen RecorderConfig', () => {
    const r = getTraditionPreset('cigano', 'audio');
    assertions++;
    assertIt(Object.isFrozen(r), 'not frozen');
    assertions++;
    assertIt(r.sampleRate === 43200, `cigano sampleRate=${r.sampleRate}`);
  });

  await itFn('getTraditionPreset: cigano audio uses 432Hz', () => {
    const r = getTraditionPreset('cigano', 'audio');
    assertions++;
    assertIt(r.sampleRate === 43200, `sampleRate=${r.sampleRate}`);
    assertions++;
    assertIt(r.audioBitsPerSecond === 128_000, `bps=${r.audioBitsPerSecond}`);
  });

  await itFn('getTraditionPreset: orixas video uses 1080p', () => {
    const r = getTraditionPreset('orixas', 'video');
    assertions++;
    assertIt(r.videoWidth === 1920, `width=${r.videoWidth}`);
    assertions++;
    assertIt(r.videoHeight === 1080, `height=${r.videoHeight}`);
  });

  await itFn('getTraditionPreset: tantra audio uses 528Hz', () => {
    const r = getTraditionPreset('tantra', 'audio');
    assertions++;
    assertIt(r.sampleRate === 52800, `sampleRate=${r.sampleRate}`);
  });

  await itFn('getTraditionPreset: tarot video uses 720p', () => {
    const r = getTraditionPreset('tarot', 'video');
    assertions++;
    assertIt(r.videoWidth === 1280, `width=${r.videoWidth}`);
    assertions++;
    assertIt(r.videoHeight === 720, `height=${r.videoHeight}`);
  });

  await itFn('getTraditionPreset: cabala audio uses 44.1kHz', () => {
    const r = getTraditionPreset('cabala', 'audio');
    assertions++;
    assertIt(r.sampleRate === 44100, `sampleRate=${r.sampleRate}`);
  });

  await itFn('getTraditionPreset: numerologia video uses 720p', () => {
    const r = getTraditionPreset('numerologia', 'video');
    assertions++;
    assertIt(r.videoWidth === 1280, `width=${r.videoWidth}`);
  });

  await itFn('getTraditionPreset: astrologia video uses 720p', () => {
    const r = getTraditionPreset('astrologia', 'video');
    assertions++;
    assertIt(r.videoWidth === 1280, `width=${r.videoWidth}`);
  });

  await itFn('getTraditionPreset rejects unknown tradition', () => {
    let threw = false;
    try { getTraditionPreset('voodoo' as any, 'audio'); } catch { threw = true; }
    assertions++;
    assertIt(threw, 'expected throw');
  });

  await itFn('auditCodecRules shape and total sacred refs ≥84', () => {
    const a = auditCodecRules();
    assertions++;
    assertIt(a.engine === 'media-codec', 'engine');
    assertions++;
    assertIt(a.traditionCount === 7, `count=${a.traditionCount}`);
    assertions++;
    assertIt(a.totalSacredRefs >= 84, `total=${a.totalSacredRefs}`);
    assertions++;
    assertIt(a.traditionsCovered.length === 7, 'traditionsCovered');
    assertions++;
    assertIt(a.magicBytesCovered.length === 6, 'magicBytesCovered');
  });

  return { passed, failed, assertions, its };
}

const isMain = (() => {
  try { return import.meta.url === `file://${process.argv[1]}`; } catch { return false; }
})();

if (isMain) {
  runMediaCodecSpec().then((r) => {
    console.log(`media-codec.spec: passed=${r.passed} failed=${r.failed} assertions=${r.assertions}`);
    if (r.failed > 0) {
      for (const it of r.its) if (!it.ok) console.error(` - [FAIL] ${it.name}: ${it.msg}`);
      process.exit(1);
    }
  });
}
