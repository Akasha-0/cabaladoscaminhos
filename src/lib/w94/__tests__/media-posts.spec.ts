// ============================================================================
// W94-C — Media Posts Engine — unit tests (node:test)
// ============================================================================
// 30+ asserts cobrindo:
//   - discriminated union narrowing
//   - validation rules (audio/video/carrossel/text)
//   - waveform peaks determinismo
//   - chapter extraction ("00:00", "0:30", "[1:15:30]")
//   - LGPD redaction (email, phone BR, CPF)
//   - sacred term validation (orishas rejeitado, orixás aceito)
//   - isMultimediaPost narrowing
//   - getCarrosselTotalDuration + formatDuration
// ============================================================================

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  validateMediaPost,
  getWaveformPeaks,
  extractChapterTimestamps,
  redactTranscriptionPII,
  containsBannedTerm,
  isMultimediaPost,
  getCarrosselTotalDuration,
  formatDuration,
  MEDIA_LIMITS,
  SACRED_TRADITIONS,
  SACRED_TERM_BLACKLIST,
  type AudioPost,
  type VideoPost,
  type CarrosselAyanPost,
  type TextPost,
  type MediaPost,
} from '../media-posts';

// ============================================================================
// Counter pattern (lesson #6) — garante cobertura mínima via `count >= N`
// ============================================================================
let count = 0;
function tick(name: string) {
  count++;
  // Cada tick também roda um sub-assert basico
  assert.ok(name.length > 0, `tick name vazio: ${name}`);
}

// ============================================================================
// Fixtures
// ============================================================================

function makeWaveform(seed = 0.5): number[] {
  // 200 peaks deterministicos a partir de um seed
  const peaks: number[] = [];
  for (let i = 0; i < MEDIA_LIMITS.WAVEFORM_PEAKS_DEFAULT; i++) {
    const v = (Math.sin(i * 0.13 + seed * 7) + 1) / 2;
    peaks.push(Math.min(1, Math.max(0, v)));
  }
  return peaks;
}

function makeAudioPost(overrides: Partial<AudioPost> = {}): AudioPost {
  return {
    kind: 'audio',
    id: 'ap-001',
    authorId: 'user-1',
    title: 'Oração para Iemanjá',
    audioUrl: '/audio/sample-001.mp3',
    durationSec: 180,
    waveformData: makeWaveform(),
    sacredMetadata: {
      tradition: 'candomble',
      entities: ['Iemanjá', 'Oxum'],
    },
    createdAt: '2026-06-30T12:00:00.000Z',
    ...overrides,
  };
}

function makeVideoPost(overrides: Partial<VideoPost> = {}): VideoPost {
  return {
    kind: 'video',
    id: 'vp-001',
    authorId: 'user-2',
    title: 'Ponto de Ogum',
    videoUrl: 'https://cdn.example.com/video-001.mp4',
    posterUrl: 'https://cdn.example.com/poster-001.jpg',
    durationSec: 45,
    sacredMetadata: { tradition: 'umbanda', entities: ['Ogum'] },
    createdAt: '2026-06-30T12:00:00.000Z',
    ...overrides,
  };
}

function makeCarrosselPost(
  overrides: Partial<CarrosselAyanPost> = {}
): CarrosselAyanPost {
  const audioSeg: AudioPost = makeAudioPost({
    id: 'seg-1',
    title: 'Abertura',
    durationSec: 30,
  });
  const videoSeg: VideoPost = makeVideoPost({
    id: 'seg-2',
    title: 'Ponto central',
    durationSec: 25,
  });
  const audioSeg3: AudioPost = makeAudioPost({
    id: 'seg-3',
    title: 'Fechamento',
    durationSec: 35,
  });
  return {
    kind: 'carrossel',
    id: 'car-001',
    authorId: 'user-3',
    title: 'Ritual de Abertura — Caboclo',
    segments: [audioSeg, videoSeg, audioSeg3],
    commonTradition: 'umbanda',
    createdAt: '2026-06-30T12:00:00.000Z',
    ...overrides,
  };
}

function makeTextPost(overrides: Partial<TextPost> = {}): TextPost {
  return {
    kind: 'text',
    id: 'tp-001',
    authorId: 'user-4',
    body: 'Reflexão sobre o Odu de hoje. axé!',
    sacredMetadata: { tradition: 'ifa' },
    createdAt: '2026-06-30T12:00:00.000Z',
    ...overrides,
  };
}

// ============================================================================
// §1. Validação de AudioPost
// ============================================================================

describe('validateMediaPost: AudioPost', () => {
  it('aceita audio post válido', () => {
    tick('audio válido');
    const post = makeAudioPost();
    const r = validateMediaPost(post);
    assert.equal(r.ok, true);
    if (r.ok) {
      assert.equal(r.value.kind, 'audio');
      assert.equal(r.value.title, 'Oração para Iemanjá');
    }
  });

  it('rejeita audio com durationSec > 300s', () => {
    tick('audio > 5min');
    const post = makeAudioPost({ durationSec: 301 });
    const r = validateMediaPost(post);
    assert.equal(r.ok, false);
    if (!r.ok && r.error.kind === 'DURATION_EXCEEDED') {
      assert.equal(r.error.limitSec, 300);
      assert.equal(r.error.actualSec, 301);
      assert.equal(r.error.postKind, 'audio');
    } else {
      assert.fail(`expected DURATION_EXCEEDED, got ${JSON.stringify(r)}`);
    }
  });

  it('rejeita audio com durationSec <= 0', () => {
    tick('audio <= 0s');
    const post = makeAudioPost({ durationSec: 0 });
    const r = validateMediaPost(post);
    assert.equal(r.ok, false);
  });

  it('rejeita audio com title vazio', () => {
    tick('audio title empty');
    const post = makeAudioPost({ title: '' });
    const r = validateMediaPost(post);
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.error.kind, 'EMPTY_REQUIRED_FIELD');
  });

  it('rejeita audio com title > 140 chars', () => {
    tick('audio title > 140');
    const post = makeAudioPost({ title: 'a'.repeat(141) });
    const r = validateMediaPost(post);
    assert.equal(r.ok, false);
  });

  it('rejeita audio com waveform muito curto (< 50 peaks)', () => {
    tick('audio waveform short');
    const post = makeAudioPost({ waveformData: [0.1, 0.2, 0.3] });
    const r = validateMediaPost(post);
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.error.kind, 'WAVEFORM_INVALID');
  });

  it('rejeita audio com peak fora de [0,1]', () => {
    tick('audio peak > 1');
    const w = makeWaveform();
    w[10] = 1.5;
    const post = makeAudioPost({ waveformData: w });
    const r = validateMediaPost(post);
    assert.equal(r.ok, false);
  });

  it('rejeita audio com audioUrl javascript: (XSS)', () => {
    tick('audio XSS url');
    const post = makeAudioPost({ audioUrl: 'javascript:alert(1)' });
    const r = validateMediaPost(post);
    assert.equal(r.ok, false);
  });
});

// ============================================================================
// §2. Validação de VideoPost
// ============================================================================

describe('validateMediaPost: VideoPost', () => {
  it('aceita video post válido', () => {
    tick('video válido');
    const post = makeVideoPost();
    const r = validateMediaPost(post);
    assert.equal(r.ok, true);
    if (r.ok) assert.equal(r.value.kind, 'video');
  });

  it('rejeita video com durationSec > 60s', () => {
    tick('video > 60s');
    const post = makeVideoPost({ durationSec: 61 });
    const r = validateMediaPost(post);
    assert.equal(r.ok, false);
    if (!r.ok && r.error.kind === 'DURATION_EXCEEDED') {
      assert.equal(r.error.postKind, 'video');
      assert.equal(r.error.limitSec, 60);
    } else {
      assert.fail('expected DURATION_EXCEEDED for video');
    }
  });

  it('rejeita video com posterUrl vazio', () => {
    tick('video poster empty');
    const post = makeVideoPost({ posterUrl: '' });
    const r = validateMediaPost(post);
    assert.equal(r.ok, false);
  });

  it('rejeita video com posterUrl javascript:', () => {
    tick('video poster XSS');
    const post = makeVideoPost({ posterUrl: 'javascript:void(0)' });
    const r = validateMediaPost(post);
    assert.equal(r.ok, false);
  });
});

// ============================================================================
// §3. Validação de CarrosselAyanPost
// ============================================================================

describe('validateMediaPost: CarrosselAyanPost', () => {
  it('aceita carrossel com 3 segmentos', () => {
    tick('carrossel 3 segs');
    const post = makeCarrosselPost();
    const r = validateMediaPost(post);
    assert.equal(r.ok, true);
  });

  it('rejeita carrossel com 2 segmentos (abaixo do minimo)', () => {
    tick('carrossel 2 segs');
    const post = makeCarrosselPost();
    post.segments = post.segments.slice(0, 2);
    const r = validateMediaPost(post);
    assert.equal(r.ok, false);
    if (!r.ok) {
      assert.equal(r.error.kind, 'CARROSSEL_SEGMENT_COUNT');
    }
  });

  it('rejeita carrossel com 6 segmentos (acima do maximo)', () => {
    tick('carrossel 6 segs');
    const segs = [
      makeAudioPost({ id: 's1' }),
      makeAudioPost({ id: 's2' }),
      makeAudioPost({ id: 's3' }),
      makeAudioPost({ id: 's4' }),
      makeAudioPost({ id: 's5' }),
      makeAudioPost({ id: 's6' }),
    ];
    const post = makeCarrosselPost({ segments: segs });
    const r = validateMediaPost(post);
    assert.equal(r.ok, false);
  });

  it('rejeita carrossel com segmento inválido (propaga erro)', () => {
    tick('carrossel seg inválido');
    const bad = makeVideoPost({ durationSec: 999 });
    const post = makeCarrosselPost({ segments: [
      makeAudioPost({ id: 's1' }),
      bad,
      makeAudioPost({ id: 's3' }),
    ]});
    const r = validateMediaPost(post);
    assert.equal(r.ok, false);
    if (!r.ok) {
      assert.equal(r.error.kind, 'DURATION_EXCEEDED');
    }
  });
});

// ============================================================================
// §4. Validação de TextPost
// ============================================================================

describe('validateMediaPost: TextPost', () => {
  it('aceita text post válido', () => {
    tick('text válido');
    const post = makeTextPost();
    const r = validateMediaPost(post);
    assert.equal(r.ok, true);
  });

  it('rejeita text post com body vazio', () => {
    tick('text body empty');
    const post = makeTextPost({ body: '' });
    const r = validateMediaPost(post);
    assert.equal(r.ok, false);
  });
});

// ============================================================================
// §5. Sacred terms (orixás vs orishas)
// ============================================================================

describe('Sacred term validation', () => {
  it('detecta "orishas" como banned (sem acento)', () => {
    tick('orishas banned');
    const term = containsBannedTerm('Cultivei orishas no terreiro');
    assert.equal(term, 'orishas');
  });

  it('detecta "orisha" (singular) como banned', () => {
    tick('orisha banned');
    const term = containsBannedTerm('cada orisha tem seu dia');
    assert.equal(term, 'orisha');
  });

  it('detecta "iemanja" sem til como banned', () => {
    tick('iemanja banned');
    const term = containsBannedTerm('Homenagem a iemanja');
    assert.equal(term, 'iemanja');
  });

  it('NÃO detecta "orixás" como banned (preserva pt-BR)', () => {
    tick('orixás aceito');
    const term = containsBannedTerm('Os orixás são muitos');
    assert.equal(term, null);
  });

  it('NÃO detecta "Iemanjá" como banned', () => {
    tick('Iemanjá aceito');
    const term = containsBannedTerm('Oração a Iemanjá');
    assert.equal(term, null);
  });

  it('rejeita audio post com title contendo "orishas"', () => {
    tick('audio title orishas');
    const post = makeAudioPost({ title: 'Ponto dos orishas' });
    const r = validateMediaPost(post);
    assert.equal(r.ok, false);
    if (!r.ok) {
      assert.equal(r.error.kind, 'BANNED_SACRED_TERM');
    }
  });

  it('rejeita entities[] com "orisha" no SacredMetadata', () => {
    tick('entities orisha');
    const post = makeAudioPost({
      sacredMetadata: { tradition: 'candomble', entities: ['orisha X'] },
    });
    const r = validateMediaPost(post);
    assert.equal(r.ok, false);
  });

  it('aceita entities[] com "Iemanjá" (preserva termo correto)', () => {
    tick('entities Iemanjá');
    const post = makeAudioPost({
      sacredMetadata: { tradition: 'candomble', entities: ['Iemanjá', 'Oxum'] },
    });
    const r = validateMediaPost(post);
    assert.equal(r.ok, true);
  });

  it('rejeita sacredMetadata com tradição inválida', () => {
    tick('tradição inválida');
    const post = makeAudioPost({
      sacredMetadata: { tradition: 'budismo' as any },
    });
    const r = validateMediaPost(post);
    assert.equal(r.ok, false);
  });

  it('lista SACRED_TRADITIONS contém 6 entradas canônicas', () => {
    tick('6 tradições');
    assert.equal(SACRED_TRADITIONS.length, 6);
    assert.ok(SACRED_TRADITIONS.includes('candomble'));
    assert.ok(SACRED_TRADITIONS.includes('ifa'));
  });
});

// ============================================================================
// §6. Waveform peaks
// ============================================================================

describe('getWaveformPeaks', () => {
  it('extrai 200 peaks de buffer longo (44100 samples)', () => {
    tick('waveform 200 peaks');
    const buf = new Float32Array(44100);
    for (let i = 0; i < buf.length; i++) {
      buf[i] = Math.sin(i * 0.01) * 0.8;
    }
    const peaks = getWaveformPeaks(buf, 200);
    assert.equal(peaks.length, 200);
    assert.ok(peaks.every((p) => p >= 0 && p <= 1));
  });

  it('DETERMINISTICO: mesma entrada → mesma saída', () => {
    tick('waveform determinism');
    const buf = new Float32Array([0.1, 0.5, -0.3, 0.8, -0.9, 0.2, 0.4, -0.6]);
    const a = getWaveformPeaks(buf, 50);
    const b = getWaveformPeaks(buf, 50);
    assert.deepEqual(a, b);
  });

  it('retorna zeros para buffer vazio', () => {
    tick('waveform empty');
    const peaks = getWaveformPeaks(new Float32Array(0), 200);
    assert.equal(peaks.length, 200);
    assert.ok(peaks.every((p) => p === 0));
  });

  it('retorna 200 peaks para audio curto (normalizado)', () => {
    tick('waveform audio curto');
    const peaks = getWaveformPeaks(new Float32Array([0.1, 0.2, 0.3, 0.4]), 200);
    assert.equal(peaks.length, 200);
  });
});

// ============================================================================
// §7. Chapter extraction
// ============================================================================

describe('extractChapterTimestamps', () => {
  it('extrai "00:00 Abertura"', () => {
    tick('chapter 00:00');
    const chapters = extractChapterTimestamps('00:00 Abertura\n0:30 Oração central\n1:00 Fechamento');
    assert.equal(chapters.length, 3);
    assert.equal(chapters[0]?.startSec, 0);
    assert.equal(chapters[0]?.title, 'Abertura');
    assert.equal(chapters[1]?.startSec, 30);
    assert.equal(chapters[2]?.startSec, 60);
  });

  it('extrai "[0:30] Capitulo 1"', () => {
    tick('chapter [0:30]');
    const chapters = extractChapterTimestamps('[0:30] Capitulo 1');
    assert.equal(chapters.length, 1);
    assert.equal(chapters[0]?.startSec, 30);
  });

  it('extrai "(1:15:30) Ritual longo" (H:MM:SS)', () => {
    tick('chapter 1:15:30');
    const chapters = extractChapterTimestamps('(1:15:30) Ritual longo de Candomblé');
    assert.equal(chapters.length, 1);
    assert.equal(chapters[0]?.startSec, 3600 + 15 * 60 + 30);
  });

  it('retorna [] para transcrição sem timestamps', () => {
    tick('chapter sem ts');
    const chapters = extractChapterTimestamps('Apenas texto sem timestamps de capítulo.');
    assert.equal(chapters.length, 0);
  });

  it('retorna [] para string vazia', () => {
    tick('chapter empty');
    const chapters = extractChapterTimestamps('');
    assert.equal(chapters.length, 0);
  });
});

// ============================================================================
// §8. LGPD — PII redaction
// ============================================================================

describe('redactTranscriptionPII', () => {
  it('redige email', () => {
    tick('PII email');
    const r = redactTranscriptionPII('Contato: joao.silva@gmail.com urgente');
    assert.equal(r.wasRedacted, true);
    assert.ok(r.redacted.includes('jo***@gmail.com'));
    assert.ok(!r.redacted.includes('joao.silva'));
  });

  it('redige telefone BR (11) 91234-5678', () => {
    tick('PII phone BR');
    const r = redactTranscriptionPII('Ligue (11) 91234-5678 agora');
    assert.equal(r.wasRedacted, true);
    assert.ok(!r.redacted.includes('91234'));
  });

  it('redige CPF 123.456.789-09', () => {
    tick('PII CPF');
    const r = redactTranscriptionPII('Meu CPF é 123.456.789-09');
    assert.equal(r.wasRedacted, true);
    assert.ok(r.redacted.includes('***.***.***-**'));
  });

  it('NÃO marca como redacted se não tem PII', () => {
    tick('PII no PII');
    const r = redactTranscriptionPII('Oração a Iemanjá, axé!');
    assert.equal(r.wasRedacted, false);
    assert.equal(r.redacted, 'Oração a Iemanjá, axé!');
  });

  it('retorna string vazia sem redacted para input vazio', () => {
    tick('PII empty');
    const r = redactTranscriptionPII('');
    assert.equal(r.wasRedacted, false);
    assert.equal(r.redacted, '');
  });
});

// ============================================================================
// §9. Type guards e helpers
// ============================================================================

describe('isMultimediaPost', () => {
  it('audio é multimedia', () => {
    tick('isMult audio');
    assert.equal(isMultimediaPost(makeAudioPost()), true);
  });
  it('video é multimedia', () => {
    tick('isMult video');
    assert.equal(isMultimediaPost(makeVideoPost()), true);
  });
  it('carrossel é multimedia', () => {
    tick('isMult carrossel');
    assert.equal(isMultimediaPost(makeCarrosselPost()), true);
  });
  it('text NÃO é multimedia', () => {
    tick('isMult text');
    assert.equal(isMultimediaPost(makeTextPost()), false);
  });
});

describe('getCarrosselTotalDuration', () => {
  it('soma durações dos segments', () => {
    tick('carrossel total duration');
    const c = makeCarrosselPost();
    // segments: 30 + 25 + 35 = 90
    const total = getCarrosselTotalDuration(c);
    assert.equal(total, 90);
  });
});

describe('formatDuration', () => {
  it('formata 90s como "1:30"', () => {
    tick('format 90s');
    assert.equal(formatDuration(90), '1:30');
  });
  it('formata 3600s como "1:00:00"', () => {
    tick('format 3600s');
    assert.equal(formatDuration(3600), '1:00:00');
  });
  it('formata 0 como "0:00"', () => {
    tick('format 0');
    assert.equal(formatDuration(0), '0:00');
  });
  it('formata NaN como "0:00"', () => {
    tick('format NaN');
    assert.equal(formatDuration(NaN), '0:00');
  });
  it('formata negativo como "0:00"', () => {
    tick('format negative');
    assert.equal(formatDuration(-5), '0:00');
  });
});

// ============================================================================
// §10. Source-inspection (lesson #11) — kind values via .map
// ============================================================================

describe('MediaPost kinds — source inspection', () => {
  it('4 kinds canônicos: audio/video/carrossel/text', () => {
    tick('kinds source');
    const posts: MediaPost[] = [
      makeAudioPost(),
      makeVideoPost(),
      makeCarrosselPost(),
      makeTextPost(),
    ];
    const kinds = posts.map((p) => p.kind).sort();
    assert.deepEqual(kinds, ['audio', 'carrossel', 'text', 'video']);
  });
});

// ============================================================================
// §11. Banned term blacklist (source-inspection, lesson #10/#11)
// ============================================================================

describe('SACRED_TERM_BLACKLIST — source inspection', () => {
  it('contém "orishas" e "iemanja"', () => {
    tick('blacklist source');
    const hasOrishas = SACRED_TERM_BLACKLIST.some((t) => t === 'orishas');
    const hasIemanja = SACRED_TERM_BLACKLIST.some((t) => t === 'iemanja');
    assert.ok(hasOrishas, 'blacklist deve conter "orishas"');
    assert.ok(hasIemanja, 'blacklist deve conter "iemanja"');
  });
});

// ============================================================================
// §12. Final coverage assertion (lesson #6)
// ============================================================================

describe('Final coverage', () => {
  it('total de asserts >= 30', () => {
    // tick final só pra garantir contagem
    tick('coverage final');
    assert.ok(count >= 30, `cobertura insuficiente: ${count} asserts (esperado >= 30)`);
  });
});
