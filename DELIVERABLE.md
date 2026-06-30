# W85-A · Voice Mode Akasha · Engine

**Cycle:** 85 · 2026-06-30
**Branch:** `w85/voice-mode-akasha`
**Session:** 414764491727032
**Theme:** TTS playback engine for the Akasha IA voice mode
**Mode:** ENGINE-ONLY (no page — page deferred to W86+)

---

## TL;DR

Shipped a production-grade TTS playback engine for the Akasha IA voice mode.
One engine file + one spec + one smoke + one tsconfig + one preset file + node-stubs.

| Metric | Value |
|---|---|
| Files | 6 (engine, spec, smoke, tsconfig, voice-presets, node-stubs) |
| Total LOC | 1635 |
| Engine LOC | 627 |
| Spec assertions | **56 / 56 PASS** |
| Smoke assertions | **48 / 48 PASS** |
| TSC strict isolated | **0 errors** |
| Voice presets | 6 (cigano / iya / pai-ogum / swami-ananda / rabino-moshe / astrologa-stella) |
| Tradições covered | 6 of 7 (ifá = coming soon) |
| Status | ✅ **READY TO PUSH** |

---

## What Was Built

### `voice-engine.ts` (627 LOC)

The engine implements the full cycle-85 public API contract:

```typescript
interface VoiceEngine {
  play(text: string, voiceId: VoicePresetId): Promise<PlaybackState>;
  pause(cueId: CueId): Promise<void>;
  resume(cueId: CueId): Promise<void>;
  cancel(cueId: CueId): Promise<void>;
  getQueue(): ReadonlyArray<PlaybackState>;
  getPreset(voiceId: VoicePresetId): VoicePreset | undefined;
  listPresets(): ReadonlyArray<VoicePreset>;
  getVoicesByTradicao(t: TradicaoName): ReadonlyArray<VoicePreset>;
  exportAudit(): ReadonlyArray<PlaybackState>;
  resetForTests(): void;
}
```

Key implementation details:

1. **State machine** — each cue transitions through `queued → playing → paused/done/error`.
   `queued` and `playing` collapse into one transition (the engine goes straight to `playing`
   after `play()` resolves, since there's no real audio to wait on).

2. **InMemoryVoiceAdapter** — deterministic CueIds via FNV-1a hash (`cue-NNNN-XXXXXXXX`),
   no actual audio (mocked `in-memory://voice/<voiceId>/<cueId>.mp3` URLs), heuristic
   duration estimate (150 wpm × rate scaling, 500ms floor).

3. **Markdown → plain text rendering** — `renderSacredText()` strips code fences,
   inline code, bold/italic markers, headings, blockquotes (prefixes with "Citação:"),
   bullets (prefixes with "Item:"), and drops URLs from markdown links. The engine
   stores the rendered text in `PlaybackState.text`.

4. **Branded types** — `CueId`, `VoiceId`, `Tradicao` are branded strings to prevent
   accidental cross-domain string mixing at the type level.

5. **VoiceEngineError** — typed error codes (`VOICE_NOT_FOUND`, `CUE_NOT_FOUND`,
   `INVALID_RATE`, `INVALID_PITCH`, `EMPTY_TEXT`, `TEXT_TOO_LONG`, `QUEUE_FULL`,
   `INVALID_STATE_TRANSITION`, `ADAPTER_ERROR`).

6. **Rate/pitch validation** — `validateRate()` and `validatePitch()` enforce
   [0.5, 1.5] bounds on each play. Voice presets are validated at construction
   time.

7. **Queue management** — `MAX_QUEUE_SIZE = 32`, `MAX_TEXT_LENGTH = 4000` chars.
   `getQueue()` filters out `done`/`error` terminals and preserves insertion order.

8. **Audit log** — every state transition is appended to `auditLog`. Tests use
   `exportAudit()` to assert transition counts.

### `voice-presets.ts` (201 LOC)

6 sacred-cultural presets. Each has a `name`, `tradicao`, `rate`, `pitch`,
`voiceStyle` (human-readable description), `sampleText` (sacred greeting),
and `locale: 'pt-BR'`.

### `voice-engine.spec.ts` (568 LOC)

56 assertions across 10 sections:
1. Preset registry integrity (10 assertions)
2. FNV-1a hash determinism (3 assertions)
3. `renderSacredText` (9 assertions)
4. `estimateDurationMs` (3 assertions)
5. `validateRate` / `validatePitch` (4 assertions)
6. Engine lifecycle — play / pause / resume / cancel (16 assertions)
7. `InMemoryVoiceAdapter` (5 assertions)
8. Queue management (3 assertions)
9. Adapter error wrapping (1 assertion)
10. `ALL_KNOWN_VOICE_IDS` integrity (2 assertions)

### `voice-engine.smoke.ts` (196 LOC)

48 inline `check()` calls covering preset integrity, hash determinism, markdown
rendering, full play→pause→resume→done cycle, error states, getVoicesByTradicao
(including ifá=0), and InMemoryVoiceAdapter determinism.

### `tsconfig.json`

Worktree-isolated: `strict`, `noUncheckedIndexedAccess`, `lib: ES2022 + DOM`,
`include: **/*.ts`, **/*.d.ts`. Copy of the cycle-60/73 pattern.

### `node-stubs.d.ts`

Minimal Node 22 globals for `--experimental-strip-types`:
`TextEncoder`, `crypto`, `process`, `console`, `setTimeout`, `clearTimeout`.
Cycle-60 lesson: parameter properties banned in strip-only mode, so the
codebase uses explicit fields.

---

## Sacred-Cultural Sensitivity (Curator-Intent)

Each voice personality was designed with care for the tradition it represents:

| Voice | Tradição | Personality Rationale |
|---|---|---|
| **Cigano** (Cavaleiro do Baralho) | cigano | Warm, conversational, road/moon/baralho metaphors. Never rushed. |
| **Iyá** (Mãe-de-Santo) | candomble | Measured (rate 0.85), warm (pitch 0.95), maternal/grundamento tone. The voiceStyle explicitly affirms "nunca austera ou julgadora" — iyá is the mother-of-saints voice, not a stern matriarch. |
| **Pai Ogum** (Caboclo) | umbanda | Decisive (rate 1.0), protective, "firme sem ser ríspido". The warrior-king of Umbanda Caboclo Ogum is firm and protective — not gruff, not aggressive. |
| **Swami Ananda** | tantra | Joyful (rate 0.9, pitch 1.05), breath-aware, jubilant. Tantra is ecstatic philosophy — not eroticized. voiceStyle affirms "jubiloso" and "reconhece o divino em tudo". |
| **Rabi Moshe** | cabala | Scholarly (rate 0.92), contemplative, passionate about Zohar but contained in volume. Erudite — never loud or shrill. |
| **Stella** (Astróloga) | astrologia | Didactic, warm (pitch 1.1), celestial — speaks like one pointing up at the sky. Translates charts into plain words. |

### Ifá (7th tradição) — Documented as "coming soon"

The cycle-85 contract defines 6 `VoicePresetId`s, not 7. Mapping:
- pai-ogum → **umbanda** (Umbanda Caboclo Ogum is the most commonly requested Ogum-line voice)
- ifá → **no preset yet**

The engine returns `[]` from `getVoicesByTradicao('ifa')` and `false` from
`hasVoiceForTradicao('ifa')`. The `ALL_KNOWN_TRADICOES` array DOES include ifá
(`length === 7`) — it's documented as part of the system but not yet voice-enabled.

Spec assertion explicitly verifies: `ifá NOT in presets` AND `ifá in ALL_KNOWN_TRADICOES`.

This decision is documented in `voice-presets.ts` as `IFA_STATUS: 'coming-soon'`.

### Future W86+ work

- Add a dedicated **Baba de Ifá** voice for ifá tradisião (e.g., `Baba Ifatunde` —
  measured, ancestral, Yoruba-rooted).
- Real TTS adapter (ElevenLabs / Azure / OpenAI TTS) wired through
  `VoiceAdapter` interface — the abstraction is ready.

---

## 7-Tradição Coverage

```
cigano       → 1 voice (Cigano Cavaleiro)
candomble    → 1 voice (Iyá)
umbanda      → 1 voice (Pai Ogum)
ifa          → 0 voices (coming soon — explicit empty result)
cabala       → 1 voice (Rabi Moshe)
astrologia   → 1 voice (Stella)
tantra       → 1 voice (Swami Ananda)
```

---

## Verification

```
$ cd /tmp/w85-voice-mode-akasha
$ npx tsc --noEmit -p src/lib/engines/voice/tsconfig.json
(no output — 0 errors)

$ node --experimental-strip-types --no-warnings \
    src/lib/engines/voice/voice-engine.spec.ts
═══ W85-A Voice Mode Akasha · Spec Harness ═══
  ✓ ... (56 assertions)
56 passed, 0 failed (of 56)

$ node --experimental-strip-types --no-warnings \
    src/lib/engines/voice/voice-engine.smoke.ts
W85-A Voice Mode Akasha — Smoke Harness
  ✓ ... (48 assertions)
48 passed, 0 failed (smoke)
```

---

## Durable Lessons (cycle 85 — to be saved in agent memory)

1. **Parameter properties banned in `--experimental-strip-types`** — use explicit
   field declaration + assignment in constructor body. Cycle-60 lesson re-applied
   to `InMemoryVoiceAdapter` and `VoiceEngineError`.

2. **`!!x` for narrowing `Map.get()` / `Array.find()` returns** — `find()` returns
   `T | undefined`, so guard with `if (x)` then re-narrow. Pattern seen in
   `getPreset()` consumers.

3. **`Object.isFrozen()` is a runtime call** — verified by passing
   `ALL_KNOWN_VOICE_IDS` to spec assertion `Object.isFrozen(ALL_KNOWN_VOICE_IDS)`.

4. **InMemoryVoiceAdapter determinism via FNV-1a + sequence counter** — same input
   + same seq → same CueId across two adapter instances. Cycle-84-B FNV-1a
   lesson re-applied with `Math.imul(hash, 0x01000193)`.

5. **VoiceAdapter interface isolation** — the engine never knows about real TTS
   providers. Cycle-79 / cycle-82 pattern of "adapter behind interface" makes
   swapping ElevenLabs/Azure/OpenAI TTS trivial.

6. **State machine as audit log** — appending every transition to an audit array
   (vs overwriting) makes test assertions + production debugging much easier.

7. **Markdown→plain text** — code fences, headings, blockquotes, bullets, links
   all need distinct transformations. Cycle-75 pattern re-applied.

8. **Brand-typed error codes** — `VoiceEngineErrorCode` as a union literal type
   with the `code` field typed against it catches typos at compile time.

---

## File Inventory

```
src/lib/engines/voice/
├── tsconfig.json           (cycle-60/73 worktree-isolated pattern)
├── node-stubs.d.ts         (minimal Node 22 globals)
├── voice-presets.ts        (201 LOC — 6 presets + lookup helpers)
├── voice-engine.ts         (627 LOC — engine, adapter, helpers)
├── voice-engine.spec.ts    (568 LOC — 56 assertions, self-running harness)
└── voice-engine.smoke.ts   (196 LOC — 48 inline checks)
```

Plus this DELIVERABLE.md.

---

## Pushed

Branch `w85/voice-mode-akasha` ready for push.