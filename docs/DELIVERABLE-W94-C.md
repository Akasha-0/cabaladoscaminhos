# W94-C — Audio/Video Posts (Multimedia Timeline) — DELIVERABLE

> **Cycle:** 94 (theme 3 of 4)
> **Worker session:** 414853955768478
> **Spawned by:** wave-spawner 414852747096288
> **Branch:** `w94/audio-video-posts` (cycle 93 FINAL CLOSE was `f9ce209d` on main)
> **Wall time:** ~24 min (under 30 min cap)
> **Status:** 🟢 **SHIPPED**

---

## TL;DR

Engine + UI completos para **posts multimídia no feed da comunidade**:
áudios narrados (até 5 min), vídeos curtos (até 60s), e **Carrossel de Ayan**
(3-5 segmentos audio/video formando jornada). Transcrições com PII são
redigidas conforme LGPD. Termos sagrados preservados verbatim.

**8 files, 3,929 LOC** (8 files = `tsconfig.w94.json` + 7 source files).
**Validation: 0 TSC errors, 55/55 spec PASS, 50/50 smoke PASS.**

---

## Validation

| Check | Result | Command |
|---|---|---|
| TSC (sub-tsconfig) | 🟢 0 errors | `timeout 60 ./node_modules/.bin/tsc --noEmit --skipLibCheck -p tsconfig.w94.json` |
| Spec (node:test) | 🟢 55/55 PASS, 14 suites | `timeout 60 node --import tsx --test src/lib/w94/__tests__/media-posts.spec.ts` |
| Smoke (.mjs) | 🟢 50/50 PASS | `timeout 60 node --experimental-strip-types scripts/smoke-media-posts.mjs` |
| Banned-vocab scan | 🟢 0 hits (outside BLACKLIST array) | via `stripComments()` in smoke §9 |
| LGPD redaction | 🟢 email/phone/CPF redacted | spec §8 + smoke §4 |
| Sacred-cultural | 🟢 `Iemanjá`/`Odu` preserved, `orishas` rejected | spec §5 + smoke §3 |

> **Note on TSC per-file glob:** the brief's per-file glob
> (`tsc --noEmit --skipLibCheck <files>`) doesn't load the main tsconfig
> (lesson #16 — `"types": ["vitest/globals"]` hides node types and `esModuleInterop`
>). The proper validation is `tsc -p tsconfig.w94.json` (sub-tsconfig extends +
> types override). The sub-tsconfig itself is delivered as a deliverable
> (item 9 in the brief).

---

## Files (8 files, 3,929 LOC)

| File | LOC | Role |
|---|---:|---|
| `src/lib/w94/media-posts.ts` | 794 | Engine: types + validation + helpers |
| `src/lib/w94/__tests__/media-posts.spec.ts` | 628 | 55 node:test asserts across 14 suites |
| `scripts/smoke-media-posts.mjs` | 337 | 50 runtime asserts (happy + sad + LGPD) |
| `src/components/community/AudioPost.tsx` | 414 | Canvas waveform player + LGPD indicator |
| `src/components/community/VideoPost.tsx` | 436 | HTML5 video + custom controls + chapters |
| `src/components/community/CarrosselAyan.tsx` | 398 | Horizontal snap carousel + autoplay toggle |
| `src/components/community/CreateMediaPost.tsx` | 742 | Form: type picker + upload + sacred meta + LGPD consent |
| `src/app/community/feed/media-demo/page.tsx` | 180 | Server-rendered demo (3 examples + form) |
| `tsconfig.w94.json` | 32 | Per-isolate TSC config (lesson #16/#17) |
| **TOTAL** | **3,961** | (incl. tsconfig) |

---

## What was built

### §1. Engine (`media-posts.ts`)

**Discriminated union** `MediaPost = AudioPost | VideoPost | CarrosselAyanPost | TextPost`.
Narrowing via `post.kind === 'audio' | 'video' | 'carrossel' | 'text'`. Carrossel
segments are recursive (1 level: each segment is AudioPost or VideoPost, not nested
carrossel — limits depth for UI sanity).

**`Result<T, E>` type** (lesson from cycle 93 — `EventsError` discriminant,
generalized to any error). `ValidationError` is a 10-variant discriminated union:
`DURATION_EXCEEDED | FILE_TOO_LARGE | TITLE_TOO_LONG | TRANSCRIPTION_TOO_LONG |
INVALID_URL | CARROSSEL_SEGMENT_COUNT | BANNED_SACRED_TERM | INVALID_TRADITION |
EMPTY_REQUIRED_FIELD | INVALID_ID | WAVEFORM_INVALID`. Each has the data the
UI needs to render a precise error message.

**`getWaveformPeaks(buffer, samples=200)`** — extracts peaks (0..1) from
Float32Array, deterministic for same input (smoke §5 verifies with
`JSON.stringify` equality on two calls).

**`extractChapterTimestamps(text)`** — regex detects `00:00`, `0:30`,
`[1:15:30]`, `(0:45)` formats. Returns `Chapter[]` with `startSec` converted
to seconds (handles H:MM:SS and M:SS). Flag `m` for multiline (lesson #23).

**`redactTranscriptionPII(text)`** — masks email (`jo***@gmail.com`), phone
BR (`(11) ****-****`), CPF (`***.***.***-**`). Returns `{redacted, wasRedacted}`
so the UI can show the "transcrição com PII detectado" indicator (LGPD Art. 18).

**`containsBannedTerm(text)`** — Unicode-aware word-boundary regex
(`(?<![\p{L}\p{N}_])` + `(?![\p{L}\p{N}_])` with `/u` flag, lesson #10).
Case-SENSITIVE matching (lesson below) — preserves canonical capitalization
(`Iemanjá` is sacred-correct, `iemanja` is the typo).

**`validateMediaPost(post)`** — entry point. Validates by `post.kind`:
- `audio`: title (sacred, 140 chars), audioUrl (http/https/abs-path, no XSS),
  duration (≤300s), waveform (≥50 peaks, all in [0,1]), transcription (≤5000 chars),
  sacred metadata.
- `video`: title, videoUrl + posterUrl, duration (≤60s), chapters sorted, transcription,
  sacred metadata.
- `carrossel`: title, 3-5 segments, each segment re-validated.
- `text`: body, sacred metadata.

**Sacred metadata** (`SacredMetadata`): `tradition` ∈ 6 canônicas (candomble, umbanda,
ifa, cabala, astrologia, tantra), `entities[]` (max 80 chars each, banned-term checked),
`oduRef` (optional). LGPD Art. 11 — dado sensível de origem espiritual.

**Helpers:** `isMultimediaPost`, `getCarrosselTotalDuration`, `formatDuration`
(MM:SS ou H:MM:SS).

### §2. Spec (55 asserts / 14 suites)

```
$ node --import tsx --test src/lib/w94/__tests__/media-posts.spec.ts
# tests 55  pass 55  fail 0
```

Suites:
1. `validateMediaPost: AudioPost` (8 tests) — happy + duration + title + waveform + XSS URL
2. `validateMediaPost: VideoPost` (4 tests) — happy + duration + posterUrl
3. `validateMediaPost: CarrosselAyanPost` (4 tests) — 3-5 segs + propagation
4. `validateMediaPost: TextPost` (2 tests) — happy + body validation
5. `Sacred term validation` (10 tests) — `orishas`/`iemanja` rejected, `Iemanjá`/`orixás` accepted
6. `getWaveformPeaks` (4 tests) — extraction, determinism, empty buffer, audio curto
7. `extractChapterTimestamps` (5 tests) — `00:00`, `[0:30]`, `(1:15:30)`, empty
8. `redactTranscriptionPII` (5 tests) — email, phone BR, CPF, no PII, empty
9. `isMultimediaPost` (4 tests) — narrowing por kind
10. `getCarrosselTotalDuration` (1 test) — soma
11. `formatDuration` (5 tests) — 90s/3600s/0/NaN/negativo
12. `MediaPost kinds — source inspection` (1 test) — `.map(e => e.kind).sort()` (lesson #11)
13. `SACRED_TERM_BLACKLIST — source inspection` (1 test) — word-boundary
14. `Final coverage` (1 test) — `count >= 30` (lesson #6)

`let count = 0; tick(name)` pattern (lesson #6) — final test asserts
`count >= 30` (we hit 55).

### §3. Smoke (50 asserts)

```
$ node --experimental-strip-types scripts/smoke-media-posts.mjs
=== SMOKE SUMMARY: 50 pass / 0 fail ===
```

Sections:
1. Happy path (5) — audio/video/carrossel-3/carrossel-5/text válidos
2. Validation failures (7) — duration, segment count, XSS URL, empty title, waveform
3. Sacred term validation (7) — orishas/orisha/iemanja/Iemanja rejected, orixás/Iemanjá accepted
4. LGPD redaction (4) — email/phone/CPF, no-PII preserved
5. Waveform determinism (4) — 200 peaks, JSON deep-equal, [0,1] range
6. Chapter extraction (3) — 4 chapters extracted, second-level conversions
7. Type guards + helpers (9) — isMultimedia, getCarrosselTotalDuration, formatDuration
8. Constants sanity (5) — limits match MEDIA_LIMITS
9. **Source-inspection (banned-vocab)** — `stripComments()` + exclude BLACKLIST array
10. Final coverage (1) — `total >= 20 && fail === 0`

### §4. UI components

**`AudioPost.tsx`** — Canvas-based waveform with peaks rendered as bars
(bars colored amber for played portion, slate for unplayed). Tap-on-waveform
to seek (44px container, keyboard ±5% with arrows). 44px play/pause button
with `aria-label`. Transcrição colapsável (ChevronUp/ChevronDown toggle).
LGPD indicator (`<Shield>` + role=status) when `transcriptionRedacted`.
Detects `prefers-reduced-motion` via `matchMedia` (no smooth transitions).
Sacred metadata badges com gradient por tradição (Candomblé=amber,
Umbanda=emerald, Ifá=yellow, Cabala=violet, Astrologia=indigo, Tantra=pink).

**`VideoPost.tsx`** — HTML5 `<video>` sem native controls. Custom overlay:
poster + play button antes de iniciar, depois progress bar + play/pause +
mute + fullscreen. `muted={true}` por default (autoplay-safe). Chapters
navegáveis (clickable buttons com timestamp + título, active state quando
`currentTime` está no range do capítulo). LGPD indicator. Reduced-motion.

**`CarrosselAyan.tsx`** — Horizontal scrollable com `snap-x snap-mandatory`.
Dots indicator (active/inactive). `IntersectionObserver` detecta segment
ativo automaticamente. Arrow keys (←/→/Home/End) navegação. Touch swipe
(delta > 40px = goPrev/goNext). **Autoplay opt-in** via MiniSwitch (off
by default — LGPD-friendly). Cada segment é AudioPost ou VideoPost via
discriminated union dispatch.

**`CreateMediaPost.tsx`** — Form completo:
- Type picker (audio/video/carrossel) com `role="radiogroup"`
- FilePicker com validação client de duration (probe via Audio/Video metadata API)
- Title com contador de chars (140 max) + red border se over
- SacredMetadata picker: tradição (6 opções) + entities (CSV) + Odu ref
- Transcrição (5000 max) + **LGPD consent checkbox OBRIGATÓRIO** se transcrição não-vazia
- Carrossel: add/remove segments (1-5), URL + duration por segment
- Preview antes de publicar (re-renderiza o AudioPost/VideoPost/CarrosselAyan com dados do form)
- Submit → `validateMediaPost` + `onCreate(post)` callback
- Result feedback (✓/✗) com role=status/alert

**`media-demo/page.tsx`** — Server component com 3 fixtures:
- AudioPost: "Oração para Iemanjá — fechamento de gira" (3:04)
- VideoPost: "Ponto de Ogum — abertura de terreiro" (47s, 4 chapters)
- CarrosselAyan: "Ritual de Abertura — Caboclo das Matas" (3 segments)
- CreateMediaPost no fim (callback stub que console.log)

### §5. Sacred-cultural compliance

**Preserved verbatim:** Iemanjá, Odu, Orixás, Umbanda, Candomblé, Ifá, Cabala,
Axé, Caboclo, Ogum, Oxum, pemba. Spec §5 and smoke §3 verify acceptance.

**Rejected:** "orishas"/"orisha" (English form), "iemanja"/"Iemanja"/"Yemanja"
(no accent), "ashé"/"ashe"/"ashè" (anglicized), "odù"/"Odù" (with grave accent).

The blacklist is **case-sensitive** (lesson below) — `Iemanjá` (capital + á)
is canonical, `iemanja` (lowercase, no accent) is the typo. The test
`NÃO detecta "Iemanjá" como banned` enforces this.

Source scan in smoke §9 removes the BLACKLIST array declaration before
scanning (BLACKLIST is the source of truth for the banned forms; the scan
is for detecting USE outside the array).

### §6. LGPD compliance

- **PII redaction** in transcrições (email/phone BR/CPF) — verified by
  spec §8 and smoke §4 with concrete examples.
- **Consent OBRIGATÓRIO** para storage de transcrição (CreateMediaPost
  checkbox) — checkbox unchecked → submit disabled, alert "Consentimento
  necessário para publicar transcrição" (LGPD Art. 7º I).
- **Transcrição redigida indicator** no AudioPost/VideoPost quando
  `transcriptionRedacted === true` (LGPD Art. 18 — direito de saber
  o que foi modificado).
- **Sacred metadata é dado sensível** (Art. 11) — tradição + entidades[]
  validados mas não exigem consent separado (escopo da coleta já é
  espiritual).
- **Autoplay opt-in** no CarrosselAyan (default off) — evita play
  automático de conteúdo (LGPD + boas práticas de UX).
- **URL validation rejeita `javascript:`** — XSS via media URL bloqueado
  (spec "rejeita audio com audioUrl javascript:" + spec "rejeita video
  com posterUrl javascript:").

---

## How to run

### TSC (per-file isolation, cycle 93 lesson #16/#17)

```bash
cd /workspace/wt-w94-media
timeout 60 ./node_modules/.bin/tsc --noEmit --skipLibCheck -p tsconfig.w94.json
```

Saída esperada: zero erros.

> **Why not per-file glob?** O brief original sugere:
> `tsc --noEmit --skipLibCheck src/lib/w94/media-posts.ts src/components/community/...`
> Mas o tsconfig.json principal tem `"types": ["vitest/globals"]` que esconde
> `node` types + esModuleInterop, e o import de `@/...` paths só resolve
> com `-p` apontando para um config. Por isso o sub-tsconfig é a forma
> canônica de validação por-arquivo (lesson #17 do spawn brief).

### Spec tests (55/55)

```bash
cd /workspace/wt-w94-media
timeout 60 node --import tsx --test src/lib/w94/__tests__/media-posts.spec.ts
```

Saída: `# tests 55, pass 55, fail 0`.

### Smoke (50/50)

```bash
cd /workspace/wt-w94-media
timeout 60 node --experimental-strip-types scripts/smoke-media-posts.mjs
```

Saída: `=== SMOKE SUMMARY: 50 pass / 0 fail ===`.

### Demo page

```bash
cd /workspace/wt-w94-media
pnpm dev
# abrir http://localhost:3000/community/feed/media-demo
```

(Requer Next.js dev server rodando. Página server-rendered, sem auth gate.)

---

## NEW Durable Lessons (4)

### Lesson 1: `if (!result.ok)` doesn't narrow TypeScript discriminated unions

**Symptom:** `if (!titleR.ok) return { ok: false, error: titleR.error };` produces
`TS2339: Property 'error' does not exist on type 'Result<string, ValidationError>'`
even though `Result<T, E> = { ok: true; value: T } | { ok: false; error: E }`.

**Root cause:** TypeScript narrows on the positive form (`if (r.ok === true)`)
and on the explicit-equal-to-false form (`if (r.ok === false)`), but **not on
the negation** (`if (!r.ok)`). This is a known TS limitation — the negated
literal boolean is not a "type discriminant" the same way the positive literal is.

**Workaround:** Use `if (r.ok === false)` instead of `if (!r.ok)`. Or invert
the check: `if (r.ok) { /* value */ } else { /* error */ }`.

```typescript
// ❌ fails to narrow
if (!r.ok) return r.error;

// ✅ works
if (r.ok === false) return r.error;
// or
if (r.ok) { /* value */ } else { /* error */ }
```

**Cross-project:** any `Result<T, E>` pattern, any `Either<L, R>`, any
`{ status: 'ok' | 'error' }` discriminated union. Apply to cycle 95+ workers
in this repo (auth FSM, LGPD, audit, all use Result-like types).

### Lesson 2: Blacklist vs canonical for sacred terms must be case-SENSITIVE

**Symptom:** `Iemanjá` (capital I + á) was being rejected by
`containsBannedTerm` because the blacklist had `iemanjá` (lowercase i + á)
and the regex used `/iu` (case-insensitive + Unicode). The capital form
is the canonical Portuguese spelling — "Iemanjá" is correct, "iemanja"
(no accent) is the anglicized typo.

**Root cause:** The sacred-cultural rules from cycle 90+ use specific
capitalization: "Odu" (capital, no accent), "Iemanjá" (capital, with accent),
"Orixás" (capital, with accent). Banned variants are anglicized or
misspelled forms. A case-insensitive match conflates them.

**Workaround:** Use case-SENSITIVE regex (drop `/i` flag). Blacklist contains
exact bad spellings: `orishas`, `orisha`, `ashé`, `ashe`, `iemanja`,
`Iemanja`, `Yemanja`, `odù`, `Odù`, `ashè`. The canonical `Iemanjá`
(capital + á) passes.

```typescript
// ❌ case-insensitive conflates
const pattern = new RegExp(`(?<![\\p{L}\\p{N}_])${escaped}(?![\\p{L}\\p{N}_])`, 'iu');

// ✅ case-sensitive preserves canonical
const pattern = new RegExp(`(?<![\\p{L}\\p{N}_])${escaped}(?![\\p{L}\\p{N}_])`, 'u');
```

**Cross-project:** any worker in cabaladoscaminhos that builds
sacred-cultural validation. Apply to cycle 95+ (validation, prompts,
content moderation).

### Lesson 3: `err()` helper with `<T = never, E = unknown>` defaults breaks generic inference

**Symptom:** `err({ kind: 'EMPTY', field })` inside a function returning
`Result<string, ValidationError>` produced `Type 'Result<never, unknown>' is
not assignable to type 'Result<string, ValidationError>'` because the
default `<T = never, E = unknown>` made E the top type.

**Workaround:** Use `<E>` only (single generic, T inferred from `never`):
```typescript
function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}
```

Or construct `{ ok: false, error: ... }` directly at call site.

**Cross-project:** any helper that returns a `Result`-like with generic
defaults — avoid double-default generics (`<T, E>`) where T is `never`;
it widens E to top type and breaks variance.

### Lesson 4: stripComments() + exclude-declaration for source-inspection scans

**Symptom:** Naive banned-vocab scan finds the BLACKLIST array declaration
itself (which by definition contains the banned terms) and reports false
positives.

**Workaround:** Two-layer filter:
1. `stripComments()` to remove `// line` and `/* block */` comments
   (lesson #7 do spawn brief)
2. Strip the BLACKLIST array declaration itself before scanning
   (regex removes the entire `[..., 'orishas', ...]` block)

```javascript
function stripComments(src) {
  return src
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');
}

const blacklistArray = SACRED_TERM_BLACKLIST.join('|');
const blacklistLinePattern = new RegExp(
  `\\[[^\\]]*(${blacklistArray})[^\\]]*\\]`, 'g'
);
const stripped = stripComments(src).replace(blacklistLinePattern, '[]');

for (const term of SACRED_TERM_BLACKLIST) {
  if (stripped.includes(term)) bannedHits.push(term);
}
```

**Cross-project:** any source-inspection scan that checks for the
presence of terms also stored in the scanner (e.g., validator
pattern, schema enum, allowed values). The exclude-declaration step
is reusable.

---

## Known limitations

- **Mock URLs only** — `/audio/sample-001.mp3`, `/video/ogum-ponto.mp4`, etc.
  These are placeholder paths (don't exist). For real deployment, hook to
  an upload pipeline (S3/Cloudflare R2) and replace `audioUrl` with signed URLs.
- **No file upload backend** — FilePicker uses `URL.createObjectURL(blob)`
  for preview but doesn't persist. `onCreate` callback is the seam.
- **i18n keys novas** (`media.*`) not yet in `pt-BR.ts` — components use
  `t('media.*')` which falls back to the key string if not translated.
  En/es stubs pending cycle 95+ translation pass.
- **No Prisma model** — `MediaPost` types are not yet mirrored to the
  database schema. Cycle 95 should add `media_posts`, `media_chapters`,
  `media_entities` tables.

---

## Next-cycle candidates (cycle 95+)

1. **Persist media posts** — Prisma schema + API routes (POST/GET/DELETE)
2. **Upload pipeline** — signed URLs (S3/R2) + presigned uploads
3. **Transcription STT** — integrate Whisper or similar for auto-generation
   of `transcription` field (with LGPD consent gate)
4. **Waveform generation** — server-side `ffmpeg` or `audiowaveform` to
   generate `waveformData` from uploaded audio
5. **Chapter extraction auto** — hook `extractChapterTimestamps` to
   upload pipeline so VideoPost chapters are pre-computed
6. **i18n translation** — add `media.*` keys to `pt-BR.ts`, `en.ts`, `es.ts`
7. **Reactions específicas para media** — "🙏 axé", "🔔 ouvir de novo",
   "📜 compartilhar" (separate from text-post reactions)
8. **Audio transcription accessibility** — `<track kind="captions">` with
   WebVTT generated from `transcription` (a11y WCAG 1.2.2)
9. **Compression / bitrate** — auto-transcode uploads to webm/opus for
   bandwidth savings (mobile-first)
10. **OG image for media posts** — generate poster frame server-side
    (currently relies on user-supplied posterUrl)

---

## Files changed

- `src/lib/w94/media-posts.ts` (new, 794 LOC)
- `src/lib/w94/__tests__/media-posts.spec.ts` (new, 628 LOC)
- `scripts/smoke-media-posts.mjs` (new, 337 LOC)
- `src/components/community/AudioPost.tsx` (new, 414 LOC)
- `src/components/community/VideoPost.tsx` (new, 436 LOC)
- `src/components/community/CarrosselAyan.tsx` (new, 398 LOC)
- `src/components/community/CreateMediaPost.tsx` (new, 742 LOC)
- `src/app/community/feed/media-demo/page.tsx` (new, 180 LOC)
- `tsconfig.w94.json` (new, 32 LOC)
- `docs/DELIVERABLE-W94-C.md` (new, this file)

**Total: 10 files, ~3,961 LOC (incl. tsconfig + deliverable).**

---

## Self-report (for wave-spawner)

```markdown
## W94-C [SHIPPED] @ 16:30 UTC

**Branch:** `w94/audio-video-posts` (pending commit + push)
**Worker session:** 414853955768478
**Wall time:** ~24 min

**Validation:**
- TSC: 0 errors in W94 files (via `tsc -p tsconfig.w94.json`)
- Spec: 55/55 PASS via `node --import tsx --test`
- Smoke: 50/50 PASS via `node --experimental-strip-types`
- Sacred-cultural: 0 banned-vocab hits via stripComments() source scan

**Files (10 files, 3961 LOC):**
- src/lib/w94/media-posts.ts (engine, 794 LOC)
- src/lib/w94/__tests__/media-posts.spec.ts (55 asserts, 628 LOC)
- scripts/smoke-media-posts.mjs (50 asserts, 337 LOC)
- src/components/community/{Audio,Video,CarrosselAyan,CreateMediaPost}.tsx
- src/app/community/feed/media-demo/page.tsx (180 LOC)
- tsconfig.w94.json (per-file TSC isolation)
- docs/DELIVERABLE-W94-C.md (this file)

**4 NEW durable lessons:**
- L1: `if (!r.ok)` does NOT narrow TS discriminated unions (use `=== false`)
- L2: Sacred-term blacklist must be case-SENSITIVE to preserve canonical "Iemanjá"
- L3: `err<T = never, E = unknown>` default widens E to top type — use single generic
- L4: stripComments() + exclude-declaration for source-inspection scans

**Next-cycle candidates:** 10 items (see above)
```
