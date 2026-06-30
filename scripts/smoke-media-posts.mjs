// ============================================================================
// W94-C — Media Posts Engine — runtime smoke test (.mjs)
// ============================================================================
// 20+ asserts de runtime cobrindo happy-path + failure paths + LGPD +
// determinismo de waveform. Roda via:
//   node --experimental-strip-types scripts/smoke-media-posts.mjs
//
// .mjs para compatibilidade direta (lesson #25 — smoke .mjs vs .ts).
// ============================================================================

import { readFile } from 'node:fs/promises';

// ============================================================================
// Counter + helpers
// ============================================================================
let pass = 0;
let fail = 0;
const failures = [];

function assert(cond, label) {
  if (cond) {
    pass++;
    console.log(`  \u2713 ${label}`);
  } else {
    fail++;
    failures.push(label);
    console.log(`  \u2717 ${label}`);
  }
}

function section(name) {
  console.log(`\n--- ${name} ---`);
}

// ============================================================================
// Dynamic import do engine via tsx (lesson #1 — node -e com tsx nao funciona,
// usamos import dinamico do .ts com strip-types)
// ============================================================================

const engine = await import('../src/lib/w94/media-posts.ts');
const {
  validateMediaPost,
  getWaveformPeaks,
  extractChapterTimestamps,
  redactTranscriptionPII,
  containsBannedTerm,
  isMultimediaPost,
  getCarrosselTotalDuration,
  formatDuration,
  MEDIA_LIMITS,
  SACRED_TERM_BLACKLIST,
  SACRED_TRADITIONS,
} = engine;

// ============================================================================
// Fixtures
// ============================================================================

function makeWaveform() {
  const peaks = [];
  for (let i = 0; i < MEDIA_LIMITS.WAVEFORM_PEAKS_DEFAULT; i++) {
    const v = (Math.sin(i * 0.13) + 1) / 2;
    peaks.push(Math.min(1, Math.max(0, v)));
  }
  return peaks;
}

function makeAudio(overrides = {}) {
  return {
    kind: 'audio',
    id: 'a-' + Math.random().toString(36).slice(2, 8),
    authorId: 'u-001',
    title: 'Oração para Iemanjá',
    audioUrl: '/audio/sample-001.mp3',
    durationSec: 180,
    waveformData: makeWaveform(),
    sacredMetadata: { tradition: 'candomble', entities: ['Iemanjá', 'Oxum'] },
    createdAt: '2026-06-30T12:00:00.000Z',
    ...overrides,
  };
}

function makeVideo(overrides = {}) {
  return {
    kind: 'video',
    id: 'v-' + Math.random().toString(36).slice(2, 8),
    authorId: 'u-002',
    title: 'Ponto de Ogum',
    videoUrl: 'https://cdn.example.com/v-001.mp4',
    posterUrl: 'https://cdn.example.com/p-001.jpg',
    durationSec: 45,
    sacredMetadata: { tradition: 'umbanda', entities: ['Ogum'] },
    createdAt: '2026-06-30T12:00:00.000Z',
    ...overrides,
  };
}

function makeCarrossel(segCount = 3) {
  const segs = [];
  for (let i = 0; i < segCount; i++) {
    if (i % 2 === 0) {
      segs.push(makeAudio({ id: `s${i}`, durationSec: 30, title: `Seg ${i}` }));
    } else {
      segs.push(makeVideo({ id: `s${i}`, durationSec: 25, title: `Seg ${i}` }));
    }
  }
  return {
    kind: 'carrossel',
    id: 'c-' + Math.random().toString(36).slice(2, 8),
    authorId: 'u-003',
    title: 'Ritual de Abertura',
    segments: segs,
    commonTradition: 'umbanda',
    createdAt: '2026-06-30T12:00:00.000Z',
  };
}

// ============================================================================
// §1. Happy path
// ============================================================================
section('1. Happy path');

const audio = makeAudio();
const r1 = validateMediaPost(audio);
assert(r1.ok === true, 'audio post válido passa');

const video = makeVideo();
const r2 = validateMediaPost(video);
assert(r2.ok === true, 'video post válido passa');

const car = makeCarrossel(3);
const r3 = validateMediaPost(car);
assert(r3.ok === true, 'carrossel 3 segments passa');

const car5 = makeCarrossel(5);
const r4 = validateMediaPost(car5);
assert(r4.ok === true, 'carrossel 5 segments passa');

const text = {
  kind: 'text',
  id: 't-001',
  authorId: 'u-004',
  body: 'Reflexão com axé e orixás',
  sacredMetadata: { tradition: 'ifa' },
  createdAt: '2026-06-30T12:00:00.000Z',
};
const r5 = validateMediaPost(text);
assert(r5.ok === true, 'text post válido passa');

// ============================================================================
// §2. Validation failures
// ============================================================================
section('2. Validation failures');

const audioLong = makeAudio({ durationSec: 400 });
const r6 = validateMediaPost(audioLong);
assert(r6.ok === false && r6.error.kind === 'DURATION_EXCEEDED', 'audio > 300s → DURATION_EXCEEDED');

const videoLong = makeVideo({ durationSec: 90 });
const r7 = validateMediaPost(videoLong);
assert(r7.ok === false && r7.error.kind === 'DURATION_EXCEEDED', 'video > 60s → DURATION_EXCEEDED');

const car1 = makeCarrossel(2);
const r8 = validateMediaPost(car1);
assert(r8.ok === false && r8.error.kind === 'CARROSSEL_SEGMENT_COUNT', 'carrossel 2 segs → CARROSSEL_SEGMENT_COUNT');

const car6 = makeCarrossel(6);
const r9 = validateMediaPost(car6);
assert(r9.ok === false && r9.error.kind === 'CARROSSEL_SEGMENT_COUNT', 'carrossel 6 segs → CARROSSEL_SEGMENT_COUNT');

const audioXSS = makeAudio({ audioUrl: 'javascript:alert(1)' });
const r10 = validateMediaPost(audioXSS);
assert(r10.ok === false && r10.error.kind === 'INVALID_URL', 'audio XSS url → INVALID_URL');

const audioEmpty = makeAudio({ title: '' });
const r11 = validateMediaPost(audioEmpty);
assert(r11.ok === false, 'audio title vazio → erro');

const audioBadWave = makeAudio({ waveformData: [0.1, 0.2] });
const r12 = validateMediaPost(audioBadWave);
assert(r12.ok === false && r12.error.kind === 'WAVEFORM_INVALID', 'waveform curto → WAVEFORM_INVALID');

// ============================================================================
// §3. Sacred term validation
// ============================================================================
section('3. Sacred term validation');

assert(containsBannedTerm('cultivei orishas no terreiro') === 'orishas', '"orishas" rejeitado');
assert(containsBannedTerm('cada orisha tem seu dia') === 'orisha', '"orisha" rejeitado');
assert(containsBannedTerm('homenagem a iemanja') === 'iemanja', '"iemanja" minúsculo rejeitado');
assert(containsBannedTerm('Iemanja é a rainha do mar') === 'Iemanja', '"Iemanja" capital sem acento rejeitado');

assert(containsBannedTerm('Os orixás são muitos') === null, '"orixás" aceito (preservado)');
assert(containsBannedTerm('Oração a Iemanjá, axé') === null, '"Iemanjá" aceito (preservado)');

const audioBanned = makeAudio({ title: 'Ponto dos orishas' });
const r13 = validateMediaPost(audioBanned);
assert(r13.ok === false && r13.error.kind === 'BANNED_SACRED_TERM', 'audio title com orishas → BANNED_SACRED_TERM');

// ============================================================================
// §4. LGPD redaction end-to-end
// ============================================================================
section('4. LGPD redaction end-to-end');

const r14 = redactTranscriptionPII('Meu email é joao@gmail.com e meu tel é (11) 91234-5678, CPF 123.456.789-09');
assert(r14.wasRedacted === true, 'transcrição com PII → wasRedacted=true');
assert(r14.redacted.includes('jo***@gmail.com'), 'email redigido para jo***@gmail.com');
assert(r14.redacted.includes('***.***.***-**'), 'CPF redigido para ***.***.***-**');
assert(!r14.redacted.includes('123.456.789-09'), 'CPF original não aparece no output');

const r15 = redactTranscriptionPII('Sem dados pessoais aqui, só axé e orixás');
assert(r15.wasRedacted === false, 'transcrição sem PII → wasRedacted=false');
assert(r15.redacted === 'Sem dados pessoais aqui, só axé e orixás', 'transcrição sem PII preservada intacta');

// ============================================================================
// §5. Waveform determinism
// ============================================================================
section('5. Waveform determinism');

const buf = new Float32Array(44100);
for (let i = 0; i < buf.length; i++) {
  buf[i] = Math.sin(i * 0.01) * 0.8;
}
const w1 = getWaveformPeaks(buf, 200);
const w2 = getWaveformPeaks(buf, 200);
assert(w1.length === 200, 'waveform retorna 200 peaks');
assert(JSON.stringify(w1) === JSON.stringify(w2), 'waveform é determinístico (mesma entrada → mesma saída)');
assert(w1.every((p) => p >= 0 && p <= 1), 'todos os peaks estão em [0,1]');

// ============================================================================
// §6. Chapter extraction
// ============================================================================
section('6. Chapter extraction');

const trans = `00:00 Abertura
0:30 Oração central de Iemanjá
[1:00] Fechamento com axé
(1:15:30) Ritual longo de Umbanda`;
const chapters = extractChapterTimestamps(trans);
assert(chapters.length === 4, 'extractChapterTimestamps extrai 4 chapters');
assert(chapters[0].startSec === 0, 'chapter 0:00 → startSec=0');
assert(chapters[1].startSec === 30, 'chapter 0:30 → startSec=30');
assert(chapters[3].startSec === 3600 + 15 * 60 + 30, 'chapter 1:15:30 → startSec=4530');

// ============================================================================
// §7. Type guards + helpers
// ============================================================================
section('7. Type guards + helpers');

assert(isMultimediaPost(makeAudio()) === true, 'audio → isMultimediaPost=true');
assert(isMultimediaPost(makeVideo()) === true, 'video → isMultimediaPost=true');
assert(isMultimediaPost(makeCarrossel()) === true, 'carrossel → isMultimediaPost=true');
assert(isMultimediaPost(text) === false, 'text → isMultimediaPost=false');

const c = makeCarrossel(3);
const total = getCarrosselTotalDuration(c);
// segments: indices 0,2 = audio (30s) + index 1 = video (25s) = 30+25+30 = 85
assert(total === 85, 'carrossel total = 30+25+30 = 85');

assert(formatDuration(90) === '1:30', 'formatDuration 90 → "1:30"');
assert(formatDuration(3600) === '1:00:00', 'formatDuration 3600 → "1:00:00"');
assert(formatDuration(0) === '0:00', 'formatDuration 0 → "0:00"');

// ============================================================================
// §8. Constants sanity
// ============================================================================
section('8. Constants sanity');

assert(MEDIA_LIMITS.AUDIO_MAX_DURATION_SEC === 300, 'AUDIO_MAX_DURATION_SEC = 300');
assert(MEDIA_LIMITS.VIDEO_MAX_DURATION_SEC === 60, 'VIDEO_MAX_DURATION_SEC = 60');
assert(MEDIA_LIMITS.CARROSSEL_MAX_SEGMENTS === 5, 'CARROSSEL_MAX_SEGMENTS = 5');
assert(SACRED_TRADITIONS.length === 6, '6 tradições sagradas');
assert(SACRED_TERM_BLACKLIST.length >= 8, 'blacklist tem pelo menos 8 termos');

// ============================================================================
// §9. Source-inspection: stripComments + banned-vocab scan
// ============================================================================
section('9. Source-inspection (banned-vocab scan)');

/**
 * stripComments() — lesson #7 do spawn brief. Remove // e /* * / antes
 * do scan de strings. Essencial pq JSX/Tailwind podem conter substrings
 * que triggeram false positives.
 */
function stripComments(src) {
  // Remove // line comments (nao dentro de strings — aproximacao simples)
  let out = src.replace(/\/\/[^\n]*/g, '');
  // Remove /* block comments */
  out = out.replace(/\/\*[\s\S]*?\*\//g, '');
  return out;
}

const engineSrc = await readFile(new URL('../src/lib/w94/media-posts.ts', import.meta.url), 'utf8');
const stripped = stripComments(engineSrc);

// Remove o array BLACKLIST do source antes de scanear (BLACKLIST
// é onde os termos vivem por definição — o scan é para detectar uso
// FORA do array, em código/comentários/strings de UI).
const blacklistArray = SACRED_TERM_BLACKLIST.join('|');
const blacklistLinePattern = new RegExp(
  `\\[[^\\]]*(${blacklistArray})[^\\]]*\\]`,
  'g'
);
const strippedNoBlacklist = stripped.replace(blacklistLinePattern, '[]');

// Scan: blacklist entries como substring (nao regex — para nao pegar falsos positivos)
const bannedHits = [];
for (const term of SACRED_TERM_BLACKLIST) {
  if (strippedNoBlacklist.includes(term)) {
    bannedHits.push(term);
  }
}
assert(bannedHits.length === 0, `engine não contém termos banidos FORA do BLACKLIST (found: ${bannedHits.join(',') || 'none'})`);

// Verifica que termos sagrados CANÔNICOS estão preservados
assert(stripped.includes('Iemanjá') || stripped.includes("'Iemanjá'") || stripped.includes('"Iemanjá"'), 'engine preserva "Iemanjá" canônico');
assert(stripped.includes('Odu') || stripped.includes("'Odu'"), 'engine preserva "Odu" canônico');

// ============================================================================
// §10. Final coverage assertion
// ============================================================================
section('10. Final coverage');

const totalAsserts = pass + fail;
assert(totalAsserts >= 20, `total de asserts >= 20 (atual: ${totalAsserts})`);
assert(fail === 0, `0 falhas (atual: ${fail})`);

// ============================================================================
// Summary
// ============================================================================
console.log(`\n=== SMOKE SUMMARY: ${pass} pass / ${fail} fail ===`);
if (fail > 0) {
  console.log('Failures:');
  failures.forEach((f) => console.log('  - ' + f));
  process.exit(1);
}
process.exit(0);
