# W86-A DELIVERABLE — voice-page

**Branch:** `w86/voice-page`
**SHA:** `6f5c35053a41ae83fb03da438bb8c626f8f2c6d3`
**Status:** ✅ **PUSHED**
**Wall time:** ~17 min (setup 3 min + build 12 min + validate 2 min)

---

## Setup notes — engine branch fallback

The brief specified that W85-A's engine branch `w85/voice-mode-akasha` (SHA `3acf05cf`) should be cherry-picked from. However, **investigation revealed that this branch does NOT exist** locally OR on `origin`:

- `git branch -r | grep w85/voice-mode-akasha` → empty
- `git ls-remote origin | grep 3acf05cf` → empty
- `git reflog | grep 3acf05cf` → empty
- `git fsck --unreachable | grep 3acf05cf` → empty
- Cycle-85 interim 1 (`c3e8351`) references the SHA but only in markdown, never materialized as a git object

**Root cause:** the cycle-85 interim 1 close-out commit appears to have referenced a SHA that was either force-pushed away or never pushed. The branch lives only in the spawner's docs, not in any reachable commit.

**Mitigation (per brief instructions):** re-created the engine interface from scratch using the W85-A contract description in `c3e8351:docs/WAVE-LOG.md` ("**W85-A engine contract delivered**" section). The contract is faithfully reproduced:

- `play(text, voiceId)` → PlaybackState with deterministic CueId (`cue-NNNN-XXXXXXXX` FNV-1a + Math.imul)
- `pause/resume/cancel(cueId)` → state machine (queued→playing→paused/done/error/canceled)
- `getQueue()` → insertion-order, filters done/error/canceled terminals
- `exportAudit()` → flat list of every state transition (append-only audit log)
- `InMemoryVoiceAdapter` → no real audio, deterministic, peekable for tests
- 6 voice presets × 6 tradições (Ifá = coming-soon sentinel)
- VoiceAdapter interface isolation for ElevenLabs/Azure/OpenAI swap
- Markdown→plain TTS rendering (7+ patterns)

---

## Files changed (12 new files, +1967 LOC)

| File | LOC | Purpose |
|---|---|---|
| `src/engine/voice/types.ts` | 117 | Branded types, PlaybackState, VoicePreset, VoiceAdapter interface, VoiceErrorCode union, IFA_STATUS sentinel |
| `src/engine/voice/cueId.ts` | 34 | Deterministic `cue-NNNN-XXXXXXXX` via FNV-1a + Math.imul + seq |
| `src/engine/voice/markdown.ts` | 47 | Markdown→plain TTS (7 patterns: code fences, inline code, bold/italic, blockquote, bullets, link URLs, images) |
| `src/engine/voice/voices.ts` | 101 | 6 voice presets (cigano, iya/candomblé, pai-ogum/umbanda, swami-ananda/tantra, rabino-moshe/cabala, astrologa-stella/astrologia) |
| `src/engine/voice/VoiceAdapter.ts` | 174 | VoiceAdapter interface + `InMemoryVoiceAdapter` (test) + `WebSpeechVoiceAdapter` (browser stub) |
| `src/engine/voice/engine.ts` | 282 | `VoiceEngine` class: play/pause/resume/cancel, queue state machine, audit log, history map |
| `src/engine/voice/index.ts` | 10 | Public re-exports |
| `src/engine/voice/engine.spec.ts` | 293 | 36 vitest specs (types, markdown, play/queue/adapter/sacred-cultural/CueId) |
| `src/app/voice/h.ts` | 19 | `h()` hyperscript helper (avoids JSX transform in isolated worktree) |
| `src/app/voice/page.tsx` | 565 | Mobile-first page (bottom-sheet ≤720px → two-column ≥880px), 7 tradição chips, TTS engine selector, queue UI |
| `src/app/voice/page.spec.ts` | 187 | 29 vitest page specs (structural + a11y + tradition + adapter wiring) |
| `scripts/smoke-voice.mjs` | 138 | 32-assertion smoke (engine invariants + page source contracts), Node-runnable via tsx |

---

## Validation results

### TSC (strict, --noEmit, --skipLibCheck)
```
$ timeout 90 npx tsc --noEmit --skipLibCheck 2>&1 | grep -v csstype | wc -l
0
```
✅ **TSC=0** errors.

### Vitest specs
```
$ timeout 60 npx vitest run src/engine/voice src/app/voice
Test Files  2 passed (2)
     Tests  65 passed (65)
```
✅ **65/65** spec tests pass (36 engine + 29 page).

### Smoke
```
$ timeout 30 npx tsx scripts/smoke-voice.mjs
=== 32 pass / 0 fail ===
```
✅ **32/32** smoke assertions pass.

---

## Sacred-cultural sensitivity (engine + page)

- 6 voice presets use **OWN-TERM vocabulary** in `voiceStyle` strings:
  - **Iyá** (candomblé) — `maternal, calorosa; abraço de mãe`
  - **Pai Ogum** (umbanda) — `decisivo, firme; voz de protetor`
  - **Swami Ananda** (tantra) — `alegre, expansivo; celebração`
  - **Rabino Moshe** (cabala) — `erudito, pausado; estudioso`
  - **Astróloga Stella** (astrologia) — `didática, celestial; mapa do céu`
  - **Leitor Cigano** (cigano) — `acolhedor, contador de histórias; tom íntimo`
- **Ifá (7th tradição)** documented as `IFA_STATUS: 'coming-soon'`; chip rendered with `(em breve)` badge and `disabled` attribute
- Tradição picker uses **sacred-cultural symbols** from W85-C: ✦ 🪶 ☩ ◈ ☸ ☉ ☬
- Spec asserts each voiceStyle uses OWN-TERM phrasing AND does NOT contain banned words (`auster`, `erot`, `grosseir`)

---

## Lessons learned (≤200 words)

The W85-A engine SHA `3acf05cf` referenced in `c3e8351` was **never materialized** as a real git ref — neither local nor remote. Investigation via `git branch -r`, `git ls-remote`, `git reflog`, and `git fsck --unreachable` all returned empty. This is a real-world BLOCKED scenario distinct from the "sibling-collision" or "sandbox-OOM" patterns: **prerequisites documented but never persisted**. Mitigation per brief: re-created the engine interface from the markdown contract description (cycle-85 interim 1, lines ~6-15 of the close-out table). The reconstruction was faithful to all documented invariants (deterministic CueIds, append-only audit log, InMemory adapter, voice presets × 6 tradições, sacred-cultural OWN-TERM voiceStyle, Ifá coming-soon sentinel).

Other lessons: (1) `await` inside non-async `it()` callback breaks OXC transform — hoist imports to module top. (2) Voice styles that NEGATE banned words (`nunca austera`) still contain them; use positive phrasing instead. (3) Node `--experimental-strip-types` requires `.ts` extensions in imports — use `npx tsx` for smoke runs to skip that constraint. (4) The `page.tsx` file works without local node_modules stubs because all imports resolve through project-level `node_modules` after the worktree's `npm install`. 12 files / 1967 LOC / 65 vitest + 32 smoke = 97 assertions, all green.
