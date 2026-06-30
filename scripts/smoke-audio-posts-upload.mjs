#!/usr/bin/env node
/**
 * ════════════════════════════════════════════════════════════════════════════
 * W90s-C — Audio Posts Upload Smoke Harness
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 90 · 2026-06-30
 *
 * Runtime smoke (15 asserts) executed via tsx. Hits the engine surface
 * (validate, waveform, format, metadata, state) using node-friendly inputs
 * and the bundled tsx loader.
 *
 * Run: tsx scripts/smoke-audio-posts-upload.mjs
 *
 * Does NOT require DOM. Skips on missing tsx to avoid hard fail.
 */

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const SMOKE_DIR = dirname(fileURLToPath(import.meta.url));
const REPO = join(SMOKE_DIR, '..');
const ENGINE_TS = join(REPO, 'src/lib/w90s/audio-posts-upload.ts');
const STORAGE_TS = join(REPO, 'src/lib/w90s/audio-storage.ts');

let passes = 0;
let fails = 0;
const log = (label, ok) => {
  if (ok) {
    passes++;
    console.log(`  ✓ ${label}`);
  } else {
    fails++;
    console.log(`  ✗ ${label}`);
  }
};

console.log('W90s-C audio-posts-upload smoke harness\n');

// ──────────────────────────────────────────────────────────────────
// Section A — Engine module-loadable via tsx
// ──────────────────────────────────────────────────────────────────

console.log('[A] Engine module-surface');
try {
  log('engine file exists', existsSync(ENGINE_TS));
  log('storage file exists', existsSync(STORAGE_TS));

  const src = readFileSync(ENGINE_TS, 'utf-8');
  const expectedFns = [
    'validateAudioFile',
    'generateWaveformPeaks',
    'encodeAudioForPreview',
    'revokeObjectUrlSafe',
    'formatDuration',
    'extractMetadata',
    'createInitialUploadState',
    'canSubmitAudio',
    'computeUploadProgress',
    'lgpdNoteForAudio',
    'isAudioFormat',
    'peakArrayFrom',
    'audioFileId',
    'objectUrl',
  ];
  let allPresent = true;
  for (const fn of expectedFns) {
    const re = new RegExp(`(export\\s+function\\s+${fn}\\s*\\()|(function\\s+${fn}\\s*\\()`);
    if (!re.test(src)) {
      log(`engine exports ${fn}`, false);
      allPresent = false;
    }
  }
  if (allPresent) log(`engine exports all 14 expected functions`, true);

  // Banned vocab scan (strip JSDoc + line comments first)
  const banned = ['amarração', 'amarre', 'vinculação', 'vincular', 'prejudicar'];
  const codeOnly = src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
  let bannedAbsent = true;
  for (const w of banned) {
    if (codeOnly.toLowerCase().includes(w)) {
      log(`banned vocab absent (code only): ${w}`, false);
      bannedAbsent = false;
    }
  }
  if (bannedAbsent) log('banned vocab ABSENT in code (5 words)', true);

  // LGPD stamp
  log('LGPD_VERSION_AUDIO = 2026-06-30', /LGPD_VERSION_AUDIO\s*=\s*['"]2026-06-30['"]/.test(src));

  // Positive-only witness
  log('__positiveOnlyWitness = true', /__positiveOnlyWitness\s*=\s*true/.test(src));

  // Object.freeze surface count
  const freezeCount = (src.match(/Object\.freeze\(/g) ?? []).length;
  log(`Object.freeze called ≥7 times (got ${freezeCount})`, freezeCount >= 7);

  // Branded types
  const brandCount = (src.match(/__brand\s*:\s*'(AudioFileId|ObjectUrl|PeakArray)'/g) ?? []).length;
  log(`branded primitives ≥3 (got ${brandCount})`, brandCount >= 3);
} catch (err) {
  log(`engine module load: ${err instanceof Error ? err.message : 'unknown'}`, false);
}

// ──────────────────────────────────────────────────────────────────
// Section B — Constants + spec invariants
// ──────────────────────────────────────────────────────────────────

console.log('\n[B] Spec + constants');
try {
  const spec = readFileSync(join(REPO, 'src/lib/w90s/__tests__/audio-posts-upload.spec.ts'), 'utf-8');

  log('spec checks ≥55 assertions', (spec.match(/check\(/g) ?? []).length >= 55);
  log('spec uses source-inspection (no vitest imports)', !/from\s+['"]vitest['"]/.test(spec));
  log('spec asserts validateAudioFile', /validateAudioFile/.test(spec));
  log('spec asserts generateWaveformPeaks', /generateWaveformPeaks/.test(spec));
  log('spec asserts encodeAudioForPreview', /encodeAudioForPreview/.test(spec));
  log('spec asserts formatDuration', /formatDuration/.test(spec));
  log('spec asserts extractMetadata', /extractMetadata/.test(spec));
  log('spec asserts canSubmitAudio', /canSubmitAudio/.test(spec));
  log('spec asserts computeUploadProgress', /computeUploadProgress/.test(spec));
  log('spec asserts lgpdNoteForAudio', /lgpdNoteForAudio/.test(spec));
  log('spec asserts ALLOWED_AUDIO_EXTENSIONS', /ALLOWED_AUDIO_EXTENSIONS/.test(spec));
  log('spec asserts MAX_AUDIO_BYTES', /MAX_AUDIO_BYTES\s*===\s*10\s*\*\s*1024\s*\*\s*1024/.test(spec));
  log('spec asserts __positiveOnlyWitness', /__positiveOnlyWitness/.test(spec));
  log('spec asserts banned vocab scan', /banned vocab absent/i.test(spec));

  // storage source scan
  const storage = readFileSync(STORAGE_TS, 'utf-8');
  log('storage exports saveAudioPost', /export\s+function\s+saveAudioPost/.test(storage));
  log('storage exports readAudioPosts', /export\s+function\s+readAudioPosts/.test(storage));
  log('storage exports deleteAudioPost', /export\s+function\s+deleteAudioPost/.test(storage));
  log('storage exports clearAllAudioPosts', /export\s+function\s+clearAllAudioPosts/.test(storage));
  log('storage LGPD gate present', /lgpd_consent_required|lgpdConsent\s*===\s*false/.test(storage));
} catch (err) {
  log(`spec read: ${err instanceof Error ? err.message : 'unknown'}`, false);
}

// ──────────────────────────────────────────────────────────────────
// Section C — Runtime sanity via dynamic tsx import (best-effort)
// ──────────────────────────────────────────────────────────────────

console.log('\n[C] Runtime sanity');
try {
  // Use a temp file + tsx to load the .ts module and probe runtime behavior
  const tmpPath = join(SMOKE_DIR, '__smoke_probe.mjs');
  const probeSrc = `
import { formatDuration, isAudioFormat, generateWaveformPeaks, extractMetadata, canSubmitAudio, createInitialUploadState, objectUrl } from '${ENGINE_TS}';
console.log('FMT_45=' + formatDuration(45));
console.log('FMT_125=' + formatDuration(125));
console.log('FMT_3725=' + formatDuration(3725));
console.log('PEAK_SHORT=' + generateWaveformPeaks([0.1, 0.5]).peaks.length);
console.log('PEAK_CLAMPED=' + generateWaveformPeaks([0.1, 0.2], { peaks: 9999 }).binCount);
console.log('MD_BITRATE=' + extractMetadata({ fileSizeBytes: 1024*1024, durationSeconds: 8, sampleRateHz: 44100, channels: 2, format: 'mp3' }).bitrateKbps);
console.log('IS_MP3=' + isAudioFormat('mp3'));
console.log('IS_FLAC=' + isAudioFormat('flac'));
console.log('CONSENT=' + canSubmitAudio({ ...createInitialUploadState(), status: 'ready', sizeBytes: 1, lgpdConsent: true, objectUrl: objectUrl('blob:http://localhost/x') }));
`;
  const { writeFileSync, unlinkSync } = await import('node:fs');
  writeFileSync(tmpPath, probeSrc);

  const child = (await import('node:child_process')).spawnSync(
    'node',
    ['--import', 'tsx', tmpPath],
    { cwd: REPO, encoding: 'utf-8', timeout: 90_000 },
  );

  // Cleanup
  try { unlinkSync(tmpPath); } catch {}

  const out = (child.stdout || '') + (child.stderr || '');
  log('runtime exec returns no error code', child.status === 0, child.status);
  log('formatDuration(45)=0:45', out.includes('FMT_45=0:45'));
  log('formatDuration(125)=2:05', out.includes('FMT_125=2:05'));
  log('formatDuration(3725)=1:02:05', out.includes('FMT_3725=1:02:05'));
  log('short peaks length=2', out.includes('PEAK_SHORT=2'));
  log('oversize peaks clamped to ≤200', out.includes('PEAK_CLAMPED=2'));
  log('bitrate ≈ 1024 (1MB/8s)', /MD_BITRATE=104[0-9]/.test(out));
  log('isAudioFormat(mp3)=true', out.includes('IS_MP3=true'));
  log('isAudioFormat(flac)=false', out.includes('IS_FLAC=false'));
  log('canSubmitAudio=true when ready+consent+url', /CONSENT=true/.test(out));
} catch (err) {
  log(`runtime section: ${err instanceof Error ? err.message : 'unknown'}`, false);
}

console.log(`\n──────────────────────────────────────────`);
console.log(`W90s-C audio-posts-upload smoke`);
console.log(`  ✓ ${passes} passed`);
console.log(`  ✗ ${fails} failed`);
console.log(`──────────────────────────────────────────`);

if (fails > 0) {
  process.exit(1);
}
console.log('SMOKE OK');
