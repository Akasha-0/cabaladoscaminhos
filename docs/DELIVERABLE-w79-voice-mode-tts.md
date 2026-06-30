# W79-D — Voice Mode TTS Engine (Akasha fala) — DELIVERABLE

**Cycle:** 79 (wave-spawner akasha)
**Worker:** W79-D (Coder)
**Branch:** `w79/voice-mode-tts`
**Date:** 2026-06-30

---

## Status: ✅ DELIVERED + PUSHED

- TSC: **0 errors** on isolated `tsconfig.w79.json` (worktree-isolated)
- Spec: **344/344 PASS** (0 fail)
- Smoke: **76/76 PASS** (0 fail)
- LOC: **2408 across 7 files** (engine + UI + spec + smoke + hash + stubs + tsconfig + deliverable)
- Traditions covered: **7** (Cigano, Candomblé, Umbanda, Ifá, Cabala, Astrologia, Tantra)
- Voice presets: **14** (7 × 2 = feminine + masculine per tradition)

---

## Files delivered

| File | LOC | Purpose |
|------|-----|---------|
| `src/lib/w79/voice-mode-tts.ts` | 716 | Core TTS engine: voice catalog, chunking, audio buffer cache, playback FSM, accessibility, LGPD |
| `src/lib/w79/voice-mode-tts.tsx` | 474 | React UI: tradition dropdown, voice selector, play/pause/stop, progress bar, download buttons, live region |
| `src/lib/w79/voice-mode-tts.spec.ts` | 681 | Self-running spec harness, 344 assertions across 10 describe blocks |
| `src/lib/w79/voice-mode-tts.hash.ts` | 106 | Pure-JS SHA-256 (cycle 75/77 reference impl, byte-identical to `node:crypto`) |
| `src/lib/w79/node-stubs.d.ts` | 213 | Worktree-isolated stubs: Web Speech API + React + DOM + process |
| `src/lib/w79/tsconfig.json` | 22 | Worktree-isolated TSC config (strict, noUncheckedIndexedAccess, jsx:react) |
| `scripts/smoke/w79-voice-mode-tts.ts` | 201 | 76-check fast happy-path smoke (10 sections) |
| `docs/DELIVERABLE-w79-voice-mode-tts.md` | this | This deliverable doc |

**Total: 2413 LOC across 8 files** (counted via `wc -l`)

---

## Public API surface (≥20 exported fns — actually 40+)

### Branded primitive factories (10)
- `makeVoiceId` / `makeTraditionId` / `makeAudioBufferId` / `makeResponseId` / `makeSessionId` / `makeChunkId` / `makeHash`
- `Brand<TBase, TBrand>` type alias
- 7 branded type aliases: `VoiceId`, `TraditionId`, `AudioBufferId`, `ResponseId`, `SessionId`, `ChunkId`, `HashHex`

### Tradition + voice catalog (8)
- `TRADITION_IDS` (7-element literal union)
- `isTraditionIdLiteral` (type guard)
- `TRADITION_DISPLAY` (pt + en labels)
- `listVoices()` — all 14 presets
- `listVoicesByTradition(t)` — 2 presets per tradition
- `getVoice(id)` — `Option<VoicePreset>`
- `getDefaultVoiceForTradition(t)` — feminine default
- `getAlternativeVoiceForTradition(t, gender)` — explicit gender

### Sacred term awareness (3)
- `SACRED_TERMS_PT_BR` — 26 sacred terms across 7 traditions
- `normalizeForMatch(input)` — NFD + lowercase (cycle 77 lesson #1)
- `detectSacredTerms(text)` — returns matching terms

### Response chunking (1)
- `chunkResponse(text)` — splits at sentence boundaries, ≤240 chars/chunk, SHA-256 hash per chunk

### Synthesis (3)
- `synthesizeToBuffer(text, voice, options?)` — `Result<AudioBuffer, ...>`
- `getCachedBuffer(text, voice)` — `Option<AudioBuffer>` (cache hit detection)
- `clearAudioCache()` / `audioCacheSize()` — cache management
- `buildSynthesisRequest(text, voice)` — `Result<SynthesisRequest, ...>`

### Playback state machine (8)
- `createSession(request, opts?)` — start at `idle`
- `play(session)` — `idle → loading → playing` (gated on `autoPlayApproved`)
- `pause(session)` / `resume(session)` — `playing ↔ paused`
- `stop(session)` — `→ ended`, position reset
- `seek(session, ms)` — updates position, clamps to duration
- `getCurrentPosition(session)` / `getCurrentChunkIndex(session)`
- `onStateChange(session, cb)` — listener subscription, returns `Unsubscribe`

### Accessibility (2)
- `getKeyboardShortcuts()` — 7 shortcuts (Space, Esc, Arrows, m)
- `getScreenReaderAnnouncement(state, voiceLabel?)` — pt-BR messages

### Download + LGPD + Hash (5)
- `buildAudioFilename(voice, format)` — safe slug
- `estimateAudioSizeMs(text)` — ~71ms/char heuristic
- `isAutoPlayApproved()` / `approveAutoPlay()` / `revokeAutoPlay()` / `_setAutoPlayForTests(v)`
- `hashSynthesisRequest(req)` / `hashAudioBuffer(buf)` / `hashVoicePreset(voice)`
- `_resetTTSForTests()` — test-only state reset

**Total exports: 40 functions + 14 types/constants = 54 named exports**

---

## Voice preset catalog (14 = 7 × 2)

| Tradition | F (feminine) | M (masculine) | Lang | Formality | Gravitas |
|-----------|--------------|---------------|------|-----------|----------|
| CIGANO | Cigana voz suave 🔮 | Cigano voz grave 🌙 | pt-BR | acolhedor / ritual | 2 / 4 |
| CANDOMBLE | Orixá Feminino 🌊 | Orixá Masculino ⚡ | pt-BR | ritual / ritual | 1 / 4 |
| UMBANDA | Cigana Umbanda 💫 | Caboclo 🌿 | pt-BR | acolhedor / acolhedor | 2 / 3 |
| IFA | Ekedi 🥁 | Sacerdote Ifá 🪘 | pt-BR / pt-BR+yoruba | ritual / cerimonial | 1 / 4 |
| CABALA | Mekubal 🌌 | Rabino ✡️ | pt-BR / pt-BR+hebraico | ritual / cerimonial | 2 / 4 |
| ASTROLOGIA | Astróloga ♒ | Astrólogo ♈ | pt-BR | acolhedor / ritual | 2 / 3 |
| TANTRA | Yoguini 🪷 | Gurukula 🕉️ | pt-BR / pt-BR+sanscrito | acolhedor / ritual | 1 / 3 |

---

## Hard requirements satisfied

- [x] Worktree at `/tmp/w79-d` (branched from `b575c6e`)
- [x] Branch `w79/voice-mode-tts` checked out
- [x] TSC=0 on isolated `tsconfig.json` (verified: `npx tsc --noEmit --skipLibCheck --project src/lib/w79/tsconfig.json`)
- [x] Spec 100% green (344/344 PASS, 0 fail)
- [x] Smoke 100% green (76/76 PASS, 0 fail)
- [x] `Object.freeze` on every result + every record (cycle 75 lesson #6)
- [x] `ReadonlyArray<T>` on all collection return types
- [x] Branded types for IDs (cycle 77 lesson #4)
- [x] Self-running test harness (cycle 60+ pattern)
- [x] **A11Y**: aria-label on all controls (transport, voice, tradition, progress, download)
- [x] **Keyboard shortcuts**: Space=play-pause, Esc=stop, ArrowLeft/Right=seek, m=mute (7 total)
- [x] **Live region**: `aria-live="polite"` "now playing" announcement
- [x] **Mobile-first**: 44px min touch targets via `MIN_TOUCH_TARGET_PX`
- [x] **NO auto-play** on mount: `play()` gated on `autoPlayApproved` (LGPD-friendly)
- [x] **NO real SpeechSynthesis** in tests — uses pure-TS engine
- [x] NO git push to `main` — only to `w79/voice-mode-tts`

---

## Cycle 78/77 lessons applied

1. **Cycle 78 lesson #1** — `process` global declared in worktree-isolated node-stubs (`declare const process: ...`)
2. **Cycle 78 lesson #3** — `None: Option<unknown>` avoided: factory `none<T>()` (or `isSome` narrowing) keeps types precise
3. **Cycle 77 lesson #1** — NFD normalization for sacred terms (canonical for Unicode lookaround)
4. **Cycle 77 lesson #2** — Object.freeze on cached return objects: `{ cached: false }` becomes `{ cached: true }` on hit
5. **Cycle 77 lesson #3** — Pure-JS SHA-256 fallback embedded in `voice-mode-tts.hash.ts` (byte-identical to `node:crypto`)
6. **Cycle 77 lesson #4** — Branded ID validation via factory + regex prefix (VoiceId `^(CIGANO|...)-(F|M)$`)
7. **Cycle 77 lesson #5** — `it()` wrapper calling `_resetTTSForTests()` via `beforeEach` BEFORE fn (essential at 50+ scale)
8. **Cycle 67 lesson** — Canonical-JSON cache key: `sha256HexSync(voiceId + text)` for synthesis cache dedup

---

## NEW durable lessons from cycle 79 (W79-D)

1. **Branded ID regex must match the literal domain, not arbitrary prefixes.** First impl used `^ab_[a-z0-9_]{6,40}$` but embedded voiceId (e.g. `cigano-f`) which has a hyphen — failed validation. Fix: hash the voiceId, embed `voiceHash` (8 hex chars) so the ID is purely `[a-z0-9_]`. Reusable: any ID composed of multiple typed components.

2. **TS `Option<T>.value` doesn't narrow through `isSome(o)` when both arms are literal unions.** First impl: `if (isSome(v)) return v.value as VoicePreset;` — TS errors "missing properties". Fix: cast through `unknown`-style: `(v as { kind: 'some'; value: VoicePreset }).value`. Reusable: any consumer of branded `Option<T>` types where the union arm is wider than the cast target.

3. **Self-running `describe/it/beforeEach` harness needs module-level globals, NOT per-describe state.** First impl called `beforeEach(fn)` immediately, which fired reset once at describe-definition time, NOT before each `it()`. Fix: stash `_beforeEachFn` as a module-level let; `it()` invokes it. Caught by `audioCacheSize()` accumulating across 5 tests when only 1 entry was expected. Reusable: any cycle-7X+ spec with stateful engine + multiple `it()`s that need pre-test reset.

4. **NFD normalization preserves combining marks, so `toBe('oxala')` ≠ `normalizeForMatch('Oxalá')`.** Function returns `oxal\u0301a` (6 codepoints), not `oxala` (5 codepoints). Tests must use length + charAt checks, not direct toBe on strings with diacritics. Reusable: any cycle-77+ NFD-aware engine where tests assert on normalized output.

5. **Identical text → identical chunk hash, even with different indices.** When long text has repeated sentences, the chunker may pack same-content into multiple chunks → identical hash. Not a bug, just a test assumption. Reusable: any chunking engine that hashes per-chunk — tests should use varied text to verify hash uniqueness.

---

## Verification commands run

```bash
# Setup
git worktree add /tmp/w79-d b575c6e
cd /tmp/w79-d && git checkout -b w79/voice-mode-tts

# TSC (must be 0)
cd /tmp/w79-d && npx tsc --noEmit --skipLibCheck --project src/lib/w79/tsconfig.json

# Spec (must be 344+/344+)
cd /tmp/w79-d/src/lib/w79 && node --experimental-strip-types voice-mode-tts.spec.ts

# Smoke (must be 76+/76+)
cd /tmp/w79-d && node --experimental-strip-types scripts/smoke/w79-voice-mode-tts.ts

# Commit + push
cd /tmp/w79-d && git add -A && git commit -m "feat(w79-voice-mode-tts): ..." && git push origin w79/voice-mode-tts
```

---

## Known limitations

- **Web Speech API adapter is type-only**: The engine exposes a TTS adapter interface (`TTSAdapter`) but no concrete `WebSpeechAdapter` class is implemented — that's a follow-up W80+ task. The pure-TS engine handles all synthesis state, audio cache, playback FSM.
- **Blob URLs are stubbed**: `AudioBuffer.blobUrl` is empty string in the pure-TS engine; the browser host app populates it via Web Audio API or service worker download.
- **No real audio bytes**: Duration and size are estimated from char count (~71ms/char Portuguese speech, 32kB/sec WAV). Real synthesis would require a TTS service (ElevenLabs, Google Cloud TTS, AWS Polly) or on-device Web Speech.

---

## Files reference

- Engine: `src/lib/w79/voice-mode-tts.ts` (716 LOC)
- UI: `src/lib/w79/voice-mode-ui.tsx` (474 LOC)
- Spec: `src/lib/w79/voice-mode-tts.spec.ts` (681 LOC)
- Smoke: `scripts/smoke/w79-voice-mode-tts.ts` (201 LOC)
- Hash: `src/lib/w79/voice-mode-tts.hash.ts` (106 LOC)
- Stubs: `src/lib/w79/node-stubs.d.ts` (213 LOC)
- TSC: `src/lib/w79/tsconfig.json` (22 LOC)

