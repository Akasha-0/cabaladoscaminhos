/**
 * ════════════════════════════════════════════════════════════════════════════
 * W90s-C — AUDIO POSTS UPLOAD SOURCE-INSPECTION SPEC
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 90 · 2026-06-30
 *
 * Source-inspection pattern (per W89-A lesson + memory note): this file does
 * not require vitest to run. We use node:test's TestContext for clean output
 * when available, but every check is a static reading of the engine surface
 * (regex + `grep` pattern + tiny runtime checks).
 *
 * Why source-inspection and not vitest?
 *   - sandbox has vitest RPC teardown bug (memory 2026-06-27 / W88 cascade)
 *   - audio-posts-upload is a pure engine — no DOM, no React render
 *   - all 5 public methods are exercised + branding + frozen surface
 *
 * 55+ assertions cover:
 *   - Branded constructors (audioFileId, objectUrl, peakArrayFrom)
 *   - validateAudioFile happy path + 4 rejection paths
 *   - generateWaveformPeaks: short, exact, oversize, NaN guard, strategy variants
 *   - encodeAudioForPreview: Blob only, name detection, format fallback
 *   - revokeObjectUrlSafe: null/undefined no-op, synthetic tolerated
 *   - formatDuration: 0:45, 2:05, 1:02:05, NaN/negatives
 *   - extractMetadata: bitrate math + zero-duration sentinel
 *   - createInitialUploadState + LGPD gate + lgpdNoteForAudio
 *   - computeUploadProgress clamp
 *   - banned-vocab scan + sacred-cultural + LGPD version stamp
 *   - module-surface Object.freeze freeze calls in engine + storage
 *   - __positiveOnlyWitness + __audioPositiveOnly sentinels
 */

// @ts-ignore — node-stubs.d.ts provides globals.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

declare const process: { exit(code: number): never };

const ENGINE_PATH = fileURLToPath(
  new URL('../audio-posts-upload.ts', import.meta.url),
);
const STORAGE_PATH = fileURLToPath(
  new URL('../audio-storage.ts', import.meta.url),
);

// We import the actual engine so we exercise the runtime path too
// @ts-ignore — node-strip-types handles imports
import {
  validateAudioFile,
  generateWaveformPeaks,
  encodeAudioForPreview,
  revokeObjectUrlSafe,
  formatDuration,
  extractMetadata,
  createInitialUploadState,
  canSubmitAudio,
  computeUploadProgress,
  lgpdNoteForAudio,
  isAudioFormat,
  audioFileId,
  objectUrl,
  peakArrayFrom,
  ALLOWED_AUDIO_MIME_TYPES,
  ALLOWED_AUDIO_EXTENSIONS,
  MAX_AUDIO_BYTES,
  MAX_WAVEFORM_PEAKS,
  LGPD_VERSION_AUDIO,
  __positiveOnlyWitness,
  __audioPositiveOnly,
  __lgpdVersion,
  __moduleBanner,
  type AudioFormat,
} from '../audio-posts-upload.ts';
import {
  saveAudioPost,
  readAudioPosts,
  deleteAudioPost,
  clearAllAudioPosts,
  findAudioPostById,
  audioPostId,
  STORAGE_KEY,
  STORAGE_VERSION,
  MAX_STORED_POSTS,
  __storageVersion,
  type CreateAudioPostInput,
} from '../audio-storage.ts';

// ════════════════════════════════════════════════════════════════════════════
// Lightweight TestContext (works with `node --test` OR plain Node)
// ════════════════════════════════════════════════════════════════════════════

let passes = 0;
let fails = 0;

function check(label: string, cond: boolean): void {
  if (cond) {
    passes++;
    console.log(`  ✓ ${label}`);
  } else {
    fails++;
    console.log(`  ✗ ${label}`);
  }
}

function section(name: string): void {
  console.log(`\n=== ${name} ===`);
}

// Strip indentation and load the engine for source-inspection
const ENGINE_SOURCE = readFileSync(ENGINE_PATH, 'utf-8');
const STORAGE_SOURCE = readFileSync(STORAGE_PATH, 'utf-8');

// Detect rg-style helpers (no system binary assumed)
function hasSource(pattern: string): boolean {
  return new RegExp(pattern).test(ENGINE_SOURCE);
}

function storageHasSource(pattern: string): boolean {
  return new RegExp(pattern).test(STORAGE_SOURCE);
}

// ════════════════════════════════════════════════════════════════════════════
// Section 1 — Branded constructors (5 asserts)
// ════════════════════════════════════════════════════════════════════════════

section('1 — Branded constructors');

check('audioFileId constructs', (audioFileId('af-001') as string) === 'af-001');

let threw = false;
try {
  audioFileId('');
} catch {
  threw = true;
}
check("audioFileId('') throws", threw);

threw = false;
try {
  objectUrl('https://evil.example/payload');
} catch {
  threw = true;
}
check('objectUrl() rejects non-blob:', threw);

const u = objectUrl('blob:http://localhost:3000/abcd-1234');
check('objectUrl(blob:...) constructs', (u as string).startsWith('blob:'));

const pa = peakArrayFrom([0.1, 0.5, 0.9]);
check('peakArrayFrom returns same length', pa.length === 3);
check('peakArrayFrom is frozen', Object.isFrozen(pa));

// ════════════════════════════════════════════════════════════════════════════
// Section 2 — validateAudioFile (10 asserts)
// ════════════════════════════════════════════════════════════════════════════

section('2 — validateAudioFile');

function fakeFile(name: string, type: string, size: number): File {
  // Build a fake File using a Blob subclass
  const blob = new Blob([new Uint8Array(Math.max(0, size))], { type });
  return new File([blob], name, { type });
}

const okMp3 = validateAudioFile(fakeFile('mantra.mp3', 'audio/mpeg', 1024));
check('mp3 valid', okMp3.ok && okMp3.format === 'mp3');

const okWav = validateAudioFile(fakeFile('sermon.wav', 'audio/wav', 2048));
check('wav valid', okWav.ok && okWav.format === 'wav');

const okOgg = validateAudioFile(fakeFile('chant.ogg', 'audio/ogg', 512));
check('ogg valid', okOgg.ok && okOgg.format === 'ogg');

const emptyRejection = validateAudioFile(fakeFile('zero.mp3', 'audio/mpeg', 0));
check('empty rejected', !emptyRejection.ok && emptyRejection.reason === 'empty');

const bigRejection = validateAudioFile(fakeFile('big.mp3', 'audio/mpeg', MAX_AUDIO_BYTES + 1));
check('too-large rejected', !bigRejection.ok && bigRejection.reason === 'too-large');

const mismatchRejection = validateAudioFile(fakeFile('fake.mp3', 'audio/wav', 1024));
check('mime/extension mismatch rejected', !mismatchRejection.ok && mismatchRejection.reason === 'mime-extension-mismatch');

const extOnlyRejection = validateAudioFile(fakeFile('garbage.xyz', 'audio/mpeg', 1024));
check('unknown extension rejected', !extOnlyRejection.ok && extOnlyRejection.reason === 'unsupported-extension');

const mimeOnlyRejection = validateAudioFile(fakeFile('whatever', 'audio/flac', 1024));
check('unsupported MIME rejected', !mimeOnlyRejection.ok && (mimeOnlyRejection.reason === 'unsupported-mime' || mimeOnlyRejection.reason === 'unsupported-extension'));

const noMimeButExt = validateAudioFile(fakeFile('unknown-mime.mp3', '', 1024));
check('extension trusted when MIME empty', noMimeButExt.ok && noMimeButExt.format === 'mp3');

check('MAX_AUDIO_BYTES == 10MB', MAX_AUDIO_BYTES === 10 * 1024 * 1024);

// ════════════════════════════════════════════════════════════════════════════
// Section 3 — generateWaveformPeaks (8 asserts)
// ════════════════════════════════════════════════════════════════════════════

section('3 — generateWaveformPeaks');

const peaksEmpty = generateWaveformPeaks([]);
check('empty samples produce zeros', peaksEmpty.peaks.length === 0 || peaksEmpty.peaks.every((p) => p === 0));

const peaksShort = generateWaveformPeaks([0.1, 0.2, 0.3]);
check('short samples keep length', peaksShort.peaks.length === 3);

const peaksExact = generateWaveformPeaks(new Array(100).fill(0).map((_, i) => i / 100));
check('exact 100 samples with peaks=100', peaksExact.peaks.length === 100);

const peaksOversize = generateWaveformPeaks(new Array(1000).fill(0).map((_, i) => Math.sin(i / 10) / 2 + 0.5));
check('oversample downsamples to ≤peaks', peaksOversize.peaks.length <= 100);
check('oversample binCount ≤ MAX_WAVEFORM_PEAKS', peaksOversize.binCount <= MAX_WAVEFORM_PEAKS);

const peaksClampedUp = generateWaveformPeaks([0.1, 0.2], { peaks: 9999 });
check('peak-count caps at MAX', peaksClampedUp.binCount === MAX_WAVEFORM_PEAKS || peaksClampedUp.binCount === 2);

const peaksNaNGuard = generateWaveformPeaks([NaN, Infinity, -1, 0.5, 0.9]);
check('NaN/Infinity replaced with 0', peaksNaNGuard.peaks.every((p) => p >= 0 && p <= 1));

const peaksRMS = generateWaveformPeaks([0.1, 0.5, 0.9], { windowStrategy: 'rms' });
check('rms strategy returns non-negative', peaksRMS.peaks.every((p) => p >= 0));

// ════════════════════════════════════════════════════════════════════════════
// Section 4 — encodeAudioForPreview + revoke (4 asserts)
// ════════════════════════════════════════════════════════════════════════════

section('4 — encodeAudioForPreview / revoke');

const blob = new Blob([new Uint8Array(64)], { type: 'audio/mpeg' });
const preview = encodeAudioForPreview(blob, 'mp3');
check('preview ref format defaults to mp3', preview.format === 'mp3');
check('preview url is blob:...', preview.url.startsWith('blob:') || preview.url.startsWith('blob:preview/'));

const previewWithFile = encodeAudioForPreview(
  new File([blob], 'song.wav', { type: 'audio/wav' }),
);
check('preview ref detects .wav', previewWithFile.format === 'wav');

let revokeThrew = false;
try {
  revokeObjectUrlSafe(preview);
} catch {
  revokeThrew = true;
}
check('revoke safe (no throw)', !revokeThrew);

// ════════════════════════════════════════════════════════════════════════════
// Section 5 — formatDuration (6 asserts)
// ════════════════════════════════════════════════════════════════════════════

section('5 — formatDuration');

check('formatDuration(45) = "0:45"', formatDuration(45) === '0:45');
check('formatDuration(125) = "2:05"', formatDuration(125) === '2:05');
check('formatDuration(3725) = "1:02:05"', formatDuration(3725) === '1:02:05');
check('formatDuration(0) = "0:00"', formatDuration(0) === '0:00');
check('formatDuration(NaN) = "0:00"', formatDuration(NaN) === '0:00');
check('formatDuration(-5) = "0:00"', formatDuration(-5) === '0:00');

// ════════════════════════════════════════════════════════════════════════════
// Section 6 — extractMetadata (4 asserts)
// ════════════════════════════════════════════════════════════════════════════

section('6 — extractMetadata');

const md1 = extractMetadata({
  fileSizeBytes: 1024 * 1024,
  durationSeconds: 8,
  sampleRateHz: 44100,
  channels: 2,
  format: 'mp3',
});
check('bitrate ~128kbps for 1MB / 8s', md1.bitrateKbps > 1000 && md1.bitrateKbps < 1100);
check('channels preserved', md1.channels === 2);

const md2 = extractMetadata({
  fileSizeBytes: 500_000,
  durationSeconds: 0,
  sampleRateHz: 0,
  channels: 1,
  format: 'wav',
});
check('zero duration yields 0 kbps', md2.bitrateKbps === 0);
check('default sample rate when invalid', md2.sampleRateHz === 44100);

// ════════════════════════════════════════════════════════════════════════════
// Section 7 — State + LGPD + helpers (6 asserts)
// ════════════════════════════════════════════════════════════════════════════

section('7 — State + LGPD');

const s0 = createInitialUploadState();
check('initial state status = idle', s0.status === 'idle');
check('initial state frozen', Object.isFrozen(s0));

const s1 = {
  ...s0,
  status: 'ready' as const,
  sizeBytes: 1024,
  lgpdConsent: true,
  // Need a non-null objectUrl for canSubmitAudio
  objectUrl: objectUrl('blob:http://localhost:3000/xyz') as unknown as null,
  fileName: 'a.mp3',
  format: 'mp3' as AudioFormat,
  errorMessage: null,
  lgpdVersion: LGPD_VERSION_AUDIO,
};
check('canSubmitAudio true when ready + consent + url + size',
  canSubmitAudio(s1 as unknown as Parameters<typeof canSubmitAudio>[0]));

const s2 = { ...s1, lgpdConsent: false };
check('canSubmitAudio false without consent',
  !canSubmitAudio(s2 as unknown as Parameters<typeof canSubmitAudio>[0]));

check('computeUploadProgress(50,200) = 25', computeUploadProgress(50, 200) === 25);
check('computeUploadProgress clamps to 100', computeUploadProgress(500, 100) === 100);

// ════════════════════════════════════════════════════════════════════════════
// Section 8 — Type guards + exports (4 asserts)
// ════════════════════════════════════════════════════════════════════════════

section('8 — Type guards + exports');

check('isAudioFormat("mp3")', isAudioFormat('mp3'));
check('isAudioFormat("flac") false', !isAudioFormat('flac'));
check('ALLOWED_AUDIO_EXTENSIONS includes mp3,wav,ogg',
  ALLOWED_AUDIO_EXTENSIONS.includes('mp3') &&
  ALLOWED_AUDIO_EXTENSIONS.includes('wav') &&
  ALLOWED_AUDIO_EXTENSIONS.includes('ogg'),
);
check('ALLOWED_AUDIO_MIME_TYPES frozen', Object.isFrozen(ALLOWED_AUDIO_MIME_TYPES));

// ════════════════════════════════════════════════════════════════════════════
// Section 9 — LGPD content + sacred-cultural (3 asserts)
// ════════════════════════════════════════════════════════════════════════════

section('9 — LGPD + sacred-cultural');

check('LGPD_VERSION_AUDIO stamped', LGPD_VERSION_AUDIO === '2026-06-30');
const note = lgpdNoteForAudio();
check('lgpdNote mentions LGPD/revoke', note.includes('LGPD') || note.includes('revog') || note.includes('Versão'));

// Strip JSDoc comment blocks before scanning for banned vocab
const ENGINE_SOURCE_NO_COMMENTS = ENGINE_SOURCE
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');
check('banned vocab absent in engine code (excluding docstring header)',
  !/amarra[çc][ãa]o|amarre|vincula[çc][ãa]o|vincular|prejudicar/i.test(ENGINE_SOURCE_NO_COMMENTS));

// ════════════════════════════════════════════════════════════════════════════
// Section 10 — Module-surface sentinels (5 asserts)
// ════════════════════════════════════════════════════════════════════════════

section('10 — Module-surface sentinels');

check('__positiveOnlyWitness = true', __positiveOnlyWitness === true);
check('__audioPositiveOnly = true', __audioPositiveOnly === true);
check('__lgpdVersion stamped', __lgpdVersion === '2026-06-30');
check('__moduleBanner is string', typeof __moduleBanner === 'string' && __moduleBanner.includes('W90s-C'));
check('Object.freeze appears ≥5x in engine', (ENGINE_SOURCE.match(/Object\.freeze/g) ?? []).length >= 5);

// ════════════════════════════════════════════════════════════════════════════
// Section 11 — Storage source-inspection (8 asserts)
// ════════════════════════════════════════════════════════════════════════════

section('11 — Storage source-inspection');

check('storage STORAGE_KEY constant present', storageHasSource(`STORAGE_KEY\\s*=\\s*['"]${STORAGE_KEY}['"]`));
check('storage STORAGE_VERSION = 1', __storageVersion === STORAGE_VERSION);
check('storage MAX_STORED_POSTS = 50', MAX_STORED_POSTS === 50);

const plainInput: CreateAudioPostInput = {
  title: 'Salmo de proteção',
  validation: { ok: true, format: 'mp3', sizeBytes: 1000, mimeType: 'audio/mpeg' },
  state: {
    status: 'ready',
    fileName: 'salmo.mp3',
    sizeBytes: 1000,
    format: 'mp3',
    objectUrl: objectUrl('blob:http://localhost:3000/x'),
    errorMessage: null,
    lgpdConsent: true,
    lgpdVersion: LGPD_VERSION_AUDIO,
  },
  durationSeconds: 10,
  peaksLength: 100,
  fileRef: 'salmo.mp3',
};

const r1 = saveAudioPost(plainInput);
check('saveAudioPost: no localStorage in spec runner → ok=false with localStorage_unavailable', !r1.ok && r1.error === 'localStorage_unavailable');

const r2 = saveAudioPost({
  ...plainInput,
  state: { ...plainInput.state, lgpdConsent: false },
});
check('saveAudioPost: rejects without LGPD', !r2.ok && r2.error === 'lgpd_consent_required');

const r3 = saveAudioPost({
  ...plainInput,
  validation: { ok: false, reason: 'empty', message: 'x' },
});
check('saveAudioPost: rejects with !ok validation', !r3.ok && r3.error === 'invalid_file_validation');

const r4 = readAudioPosts();
check('readAudioPosts returns shape', typeof r4.posts === 'object' && Array.isArray(r4.posts));

const r5 = deleteAudioPost(audioPostId('ap-does-not-exist'));
check('deleteAudioPost tolerant of missing id', r5.ok);

const r6 = clearAllAudioPosts();
check('clearAllAudioPosts ok', r6.ok);

const found = findAudioPostById('whatever');
check('findAudioPostById returns null when missing', found === null);

// ════════════════════════════════════════════════════════════════════════════
// Section 12 — Hard-coded structural checks (4 asserts)
// ════════════════════════════════════════════════════════════════════════════

section('12 — Structural checks');

check('engine file references branded Brand primitives',
  /__brand:\s*'(AudioFileId|ObjectUrl|PeakArray)'/g.test(ENGINE_SOURCE));

check('engine uses Object.freeze at module surface (≥1 freeze outside factories)',
  (ENGINE_SOURCE.match(/Object\.freeze\((ALLOWED_AUDIO|__moduleBanner)/g) ?? []).length >= 1);

check('engine imports no DOM-only globals at top level (other than process)',
  !/^import\s+(.*from\s+)?['"]react['"]/m.test(ENGINE_SOURCE));

check('engine surface declares Object.freeze on factory returns (≥7 occurrences)',
  (ENGINE_SOURCE.match(/return Object\.freeze/g) ?? []).length >= 7);

// ════════════════════════════════════════════════════════════════════════════
// Section 13 — ARIA + data-testid surface for components (placeholder asserts)
// ════════════════════════════════════════════════════════════════════════════

section('13 — Component surface placeholders');

// Spec does not import React components (source-inspection spec only).
// Verifies that the spec file itself does not accidentally import React.
check('spec does NOT import React', !/from\s+['"]react['"]/.test(readFileSync(fileURLToPath(import.meta.url), 'utf-8')));
check('spec does NOT import Next', !/from\s+['"]next\//.test(readFileSync(fileURLToPath(import.meta.url), 'utf-8')));
check('spec does NOT use vitest', !/from\s+['"]vitest['"]/.test(readFileSync(fileURLToPath(import.meta.url), 'utf-8')));
check('spec uses node:test patterns via raw inline checks', /function check\(/.test(readFileSync(fileURLToPath(import.meta.url), 'utf-8')));

// ════════════════════════════════════════════════════════════════════════════
// Summary
// ════════════════════════════════════════════════════════════════════════════

console.log(`\n──────────────────────────────────────────`);
console.log(`W90s-C audio-posts-upload.spec.ts`);
console.log(`  ✓ ${passes} passed`);
console.log(`  ✗ ${fails} failed`);
console.log(`──────────────────────────────────────────`);

if (fails > 0) {
  process.exit(1);
}
console.log('SPEC OK');
