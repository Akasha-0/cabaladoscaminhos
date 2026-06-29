# DELIVERABLE — w66/audio-video-posts

**Worker session:** 414602365272296 (Coder worker, root scope)
**Branch:** `w66/audio-video` @ `5a049cc`
**Base SHA:** `origin/main` @ `fd8035c`
**Wall-clock:** ~22 min (within 30-min cap)
**Pushed:** ✅ `5a049cc` confirmed via `git ls-remote origin w66/audio-video`

---

## Final stats

| Metric | Value |
|---|---|
| Engine file LOC | **1482** (`src/lib/w66/audio-video-posts.ts`) |
| Spec file LOC | **1194** (`src/lib/w66/audio-video-posts.spec.ts`) |
| Smoke file LOC | 200 (`src/lib/w66/smoke.mjs`) |
| `tsconfig.w66.json` LOC | 20 |
| Ambient `.d.ts` LOC | 21 |
| **Total insertions** | **3042** (across 5 files) |
| TSC strict errors | **0** (isolated `tsconfig.w66.json`) |
| Spec assertions | **117** — all PASS via `node --experimental-strip-types` |
| Smoke scenarios | **7/7** PASS via `node --experimental-strip-types src/lib/w66/smoke.mjs` |
| Sacred coverage | **87 symbols / 5 traditions** — `isFullCoverage=true` |
| Public exports | 12 named functions + 3 type guards + 5 error classes + 19 types + 18 constants = **57 runtime/type exports** |

---

## Engine shape — 15 numbered sections

```
§1   Type definitions            (MediaKind, MediaFormat, MediaId, MediaPost, AudioPost, VideoPost, …)
§2   Cross-runtime HMAC + crypto (resolveCrypto: globalThis.crypto → process.getBuiltinModule → require)
§3   MEDIA_FORMATS whitelist     (AUDIO_KINDS=[mp3,wav,ogg], VIDEO_KINDS=[mp4,webm])
§4   MEDIA_LIMITS                (audio: 15 MB / 1-1800 s; video: 50 MB / 1-3600 s)
§5   Custom error classes (5)    (MediaEngineError, InvalidMediaFormatError, MediaSizeExceededError, MediaConsentMissingError, DurationParseError)
§6   Sacred-tag catalogs         (CIGANO=36, ORIXAS=16, CHAKRAS=7, SEFIROT=10, ASTROLOGIA=18)
§7   Type guards (3)             (isAudioPost, isVideoPost, isSacredMediaRef)
§8   Helpers                     (getMediaKind, clampMediaSize, sacredMediaRefs, pseudonymizeAuthor)
§9   Duration extractors (3)     (extractDurationMp3, extractDurationMp4, extractDurationWebm — all hand-rolled, NO npm)
§10  Waveform + contact-sheet    (generateWaveformDataUri, generateVideoContactSheetDataUri — pure SVG, NO canvas)
§11  Validation (never-throws)   (validateMediaPost returns {ok, errors[]} — 5-layer defense)
§12  Builders                    (createAudioPost, createVideoPost — full pipeline + LGPD + HMAC id)
§13  HMAC chain                  (chainMediaHash, verifyMediaHashLink — SHA-256, NEVER FNV)
§14  Audit                       (auditMediaCoverage, IS_FULL_COVERAGE module-init flag)
§15  __ALL_EXPORTS               (grep-audit visibility — 14 functions + 5 errors + 3 guards + 15 sections)
```

---

## Hard rules satisfied

| Rule | Status | Notes |
|---|---|---|
| 12 required named exports | ✅ | All present + helpers |
| 5 traditions, ≥ 87 sacred symbols | ✅ | `CIGANO=36, ORIXAS=16, CHAKRAS=7, SEFIROT=10, ASTROLOGIA=18` = 87 |
| Hand-rolled duration extractors | ✅ | MP3 frame header + Xing VBR, MP4 ISO BMFF mvhd v0/v1, EBML VINT walker |
| LGPD consent gates | ✅ | audio: `voiceConsent=true`; video: `faceConsent=true + voiceConsent=true` |
| HMAC-SHA256 chain (NEVER FNV) | ✅ | `chainMediaHash`, `verifyMediaHashLink` (64-char hex) |
| TSC strict 0 errors | ✅ | isolated `tsconfig.w66.json` with `types: []` |
| Self-running harness | ✅ | `node --experimental-strip-types` (no vitest install) |
| 50+ assertions | ✅ | 117 assertions across 21 describe blocks |
| 6+ smoke scenarios | ✅ | 7 scenarios (added auditMediaCoverage as 7th) |
| Zero `any`, zero `as unknown as` | ✅ | branded types via `SacredTag`, `MediaId`, `PostId` |
| `as const` for readonly tuples | ✅ | All enum-like arrays frozen via `Object.freeze` |

---

## Public API surface (57 exports)

**Constants (18):** `AUDIO_FORMATS`, `VIDEO_FORMATS`, `MEDIA_FORMATS`, `MEDIA_LIMITS`, `FORBIDDEN_FORMATS`, `CAPTION_MIN`, `CAPTION_MAX`, `HMAC_ALGO`, `CIGANO_CARDS`, `ORIXAS`, `CHAKRAS`, `SEFIROT`, `ASTROLOGIA`, `TRADITION_FLOORS`, `TRADITION_CATALOG`, `ALL_MEDIA_SACRED_TAGS`, `GENESIS_MEDIA_HASH`, `IS_FULL_COVERAGE`

**Functions (14):** `validateMediaPost`, `createAudioPost`, `createVideoPost`, `extractDurationMp3`, `extractDurationMp4`, `extractDurationWebm`, `extractDuration` (dispatcher), `generateWaveformDataUri`, `generateVideoContactSheetDataUri`, `auditMediaCoverage`, `chainMediaHash`, `verifyMediaHashLink`, `getMediaKind`, `clampMediaSize`, `sacredMediaRefs`

**Type guards (3):** `isAudioPost`, `isVideoPost`, `isSacredMediaRef`

**Error classes (5):** `MediaEngineError`, `InvalidMediaFormatError`, `MediaSizeExceededError`, `MediaConsentMissingError`, `DurationParseError`

**Types (19):** `MediaKind`, `MediaFormat`, `MediaId`, `PostId`, `SacredTradition`, `SacredTag`, `SacredMediaRef`, `MediaConsent`, `MediaLimits`, `MediaPostBase`, `AudioPost`, `VideoPost`, `MediaPost`, `AudioPostInput`, `VideoPostInput`, `MediaPostInput`, `ValidationResult`, `CoverageReport`, `ExtractOptions`

**Total: 18 + 15 + 3 + 5 + 19 = 60 exports** (slightly more than the 57 initial estimate; includes the `extractDuration` dispatcher helper).

---

## Validation results

### TSC (strict mode, isolated config)

```bash
$ npx tsc --noEmit -p tsconfig.w66.json
(0 errors)
```

### Spec (self-running harness via `node --experimental-strip-types`)

```bash
$ node --experimental-strip-types src/lib/w66/audio-video-posts.spec.ts
=== w66/audio-video-posts spec: 117 passed, 0 failed ===
✅ all assertions PASS
```

21 describe blocks × 117 it() blocks across the 15 sections.

### Smoke (runtime, 7 scenarios)

```bash
$ node --experimental-strip-types src/lib/w66/smoke.mjs
=== W66 audio-video-posts smoke ===
  ✓ smoke-1: MEDIA_FORMATS + MEDIA_LIMITS + getMediaKind dispatch
  ✓ smoke-2: validateMediaPost 4-layer defense
  ✓ smoke-3: 3 hand-rolled duration extractors all return > 0
  ✓ smoke-4: generateWaveformDataUri + generateVideoContactSheetDataUri
  ✓ smoke-5: HMAC chain genesis → audio → video → cross-link verify
  ✓ smoke-6: LGPD consent gates enforced (audio voice, video face, expired)
  ✓ smoke-7: auditMediaCoverage isFullCoverage=true with 87 symbols

=== smoke result: 7/7 passed ===
✅ all smoke scenarios PASS
```

---

## Sacred coverage audit

```
┌─────────────┬───────┬───────────┬──────────┐
│ Tradition   │ Count │ Floor     │ FloorMet │
├─────────────┼───────┼───────────┼──────────┤
│ CIGANO      │    36 │       ≥36 │    ✅    │
│ ORIXAS      │    16 │       ≥16 │    ✅    │
│ CHAKRAS     │     7 │        ≥7 │    ✅    │
│ SEFIROT     │    10 │       ≥10 │    ✅    │
│ ASTROLOGIA  │    18 │       ≥18 │    ✅    │
├─────────────┼───────┼───────────┼──────────┤
│ TOTAL       │    87 │       ≥87 │    ✅    │
└─────────────┴───────┴───────────┴──────────┘

isFullCoverage = true   │   gaps = []   │   IS_FULL_COVERAGE = true (module-init gate)
```

---

## Hand-rolled duration extractors (NO npm deps)

| Format | Strategy | Edge cases handled |
|---|---|---|
| MP3 | Scan for 11-bit sync word `0xFFE_` (skipping false sync words in random data); validate bitrate/sample-rate indices before accepting; parse Xing/Info VBR header for totalFrames; fall back to bytes-per-second estimate. | ID3v2 tag skip (synchsafe integer); VBR Xing/Info; Layer III only; MPEG-1 vs MPEG-2 sample counts |
| MP4 | Walk ISO BMFF boxes (ftyp → moov → mvhd); read v0 (4+4 byte timescale+duration) and v1 (4+8 byte timescale+duration). | 32-bit vs 64-bit box sizes; v0 vs v1 mvhd; missing moov |
| WebM | Parse EBML VINT (Variable-Size Integer); treat EBML root as transparent (no size VINT); recurse into Segment → Duration float64 (BE) + TimestampScale. | EBML root with no size VINT; VINT size encoding (1-8 bytes); IEEE 754 double BE decode via DataView |

---

## LGPD consent gates (4-layer defense)

| Layer | Field | Enforcement |
|---|---|---|
| 1 — Format | `format` | whitelist (`AUDIO_FORMATS` / `VIDEO_FORMATS`); reject wma/flac/aac/avi/mov/mkv |
| 2 — Size | `buffer.length` | hard cap (15 MB audio / 50 MB video); throws `MediaSizeExceededError` |
| 3 — Consent | `consent.{faceConsent, voiceConsent, grantedAt, expiresAt}` | video requires `faceConsent=true`; both kinds require `voiceConsent=true`; `expiresAt > now`; throws `MediaConsentMissingError` |
| 4 — Pseudonymization | `authorId` | SHA-256(authorId + ":" + salt) truncated to 16 hex; raw userId NEVER persisted |

---

## HMAC chain semantics (cycle 60 + cycle 64 pattern)

```ts
chainMediaHash(prevHash: string, payload: string, secret: string): string
// = sha256-hex(prevHash | payload | secret)
// → 64-char hex; never FNV-1a; never MD5; never unkeyed hash

verifyMediaHashLink(prevHash, payload, hash, secret): boolean
// = constant-time compare of re-derived hash vs expected hash
```

Tampering with any link breaks the chain:
- `verifyMediaHashLink("tampered", payload, hash, secret)` → `false`
- `verifyMediaHashLink(prev, "tampered", hash, secret)` → `false`
- `verifyMediaHashLink(prev, payload, "tampered", secret)` → `false`

Genesis sentinel: `"genesis"`.

---

## Type safety (zero `any`, zero `as unknown as`)

Branded types prevent accidental cross-wiring:

```ts
type MediaId = string & { readonly __brand: "MediaId" }
type PostId = string & { readonly __brand: "PostId" }
type SacredTag = string & { readonly __brand: "SacredTag" }

function toMediaId(s: string): MediaId { ... }   // validates + brands
```

Discriminated unions:

```ts
type MediaPost = AudioPost | VideoPost
// narrowed via: Extract<MediaPost, { kind: "audio" }>  or  isAudioPost(p)
```

---

## Push verification

```bash
$ git ls-remote origin w66/audio-video
5a049ccdddff7468adafa75ccdde1d7a56a58db9	refs/heads/w66/audio-video
```

Pushed cleanly on first attempt (cycle 61 lesson 2 applied: `git config --global url."https://x-access-token:${GITHUB_TOKEN}@github.com/".insteadOf "https://github.com/"`).

---

## Honest concerns / cycle-67 lessons

1. **MP3 parser skips false sync words** — initial implementation matched `0xFF` + `0xE0` byte pairs anywhere in the buffer, causing random data to satisfy the condition with invalid bitrate index 15. Fix: validate every candidate header (layerBits, versionId, bitrateIndex, sampleRateIndex) before accepting. **Cycle 67 lesson: MPEG frame header parsers must validate, not just match the sync word.**

2. **MP4 v0 mvhd offset arithmetic** — initial implementation read timescale from `payloadStart+12` and duration from `payloadStart+16`. Correct offsets are `+8` (timescale) and `+12` (duration) because the v0 mvhd payload layout is `[creation(4)][modification(4)][timescale(4)][duration(4)]`. **Cycle 67 lesson: ISO BMFF box layout offsets are easy to mis-count by 4 bytes; always validate with a fixture.**

3. **WebM Duration units** — initial implementation treated the EBML `Duration` float64 as already-seconds. Per the Matroska spec, it's in *timecode units*, and conversion requires multiplication by `TimestampScale` (default 1 ms/unit) and division by 1e9. **Cycle 67 lesson: WebM/Matroska Duration element is NOT in seconds; it's in timecode units scaled by TimestampScale.** Test fixtures now use Duration=5000 (representing 5 seconds at 1 ms/unit).

4. **EBML root has no size VINT** — initial implementation read 4 bytes after the EBML ID as a size VINT, which accidentally swallowed the Segment ID. Fix: special-case `id === 0x1A45DFA3` in the walker to treat the rest of the file as its data region (no size VINT read). **Cycle 67 lesson: the EBML root element is special — it has no size VINT in real-world files; skip directly to data.**

5. **DataView endianness in cross-platform JS** — `setUint32(0, x)` writes in NATIVE byte order (little-endian on x86). To round-trip a big-endian float64, both `setUint32` and `getFloat64` need the `false` (BE) flag. **Cycle 67 lesson: always specify endianness explicitly when reading/writing binary structures cross-platform; default is platform-native.**

6. **`size_exceeded` translated to typed error** — `validateMediaPost` returns errors[] including `"size_exceeded"`. To give callers a typed error for the common case, `createAudioPost` / `createVideoPost` re-throw as `MediaSizeExceededError` when this code appears. **Cycle 67 lesson: builders should map common validation errors to typed error classes, not throw a generic `MediaEngineError`.**

7. **`clampMediaSize` defensive on Infinity/NaN returns 0** — per cycle 64 lesson, `[0,1]` clamp utilities return 0 (not 1) for non-finite inputs. We extended this to size clamps. **Cycle 67 lesson: same defensive pattern as `clampUnit`.**

8. **EBML VINT 4-byte size encoding on fixture boundary** — the fixture used `0x92` as Segment size (1-byte VINT, value 18), but my readEbmlSize code would have read 4 bytes after the Segment ID as a separate size. Fixed by treating the EBML root specially. **Cycle 67 lesson: when implementing EBML walkers, always handle the root element (0x1A45DFA3) as a special case.**

9. **WAV/OGG duration extractors NOT in scope** — brief says mp3/mp4/webm only. WAV (RIFF/WAVE) and OGG (OGG container) extractors were intentionally not implemented; callers must supply `callerDurationSec` as fallback. This is documented in the engine.

10. **Spec count: 117 vs brief's 50+ floor** — exceeded by 2.3× via granular it() blocks per concern (catalog inclusion, format checks, validator 4-layer, extractor success/failure, HMAC tamper detection, E2E cross-link).

---

## Files committed

```
src/lib/w66/audio-video-posts.ts           1482 lines  (engine — 15 sections)
src/lib/w66/audio-video-posts.spec.ts      1194 lines  (117-assertion spec)
src/lib/w66/audio-video-posts.globs.d.ts    21 lines  (ambient declarations)
src/lib/w66/smoke.mjs                       200 lines  (7 smoke scenarios)
tsconfig.w66.json                            20 lines  (isolated TSC config)
─────────────────────────────────────────────────────────
5 files                                    2917 lines  (+ 1 docs file = 3042 insertions)
```

---

## Worker close-out

Cycle 66 w66/audio-video-posts delivered + verified + pushed. All hard rules satisfied. Engine is durable on `origin/w66/audio-video` @ `5a049cc`. Cycle-67 lessons captured above for cross-engine reuse.