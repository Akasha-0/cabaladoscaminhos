# W90s-C — Audio Posts Upload · Deliverable

**Cycle:** 90 (SIBLING wave-spawner, branch `w90s/audio-posts-upload`)
**Author:** W90s-C Coder (Mavis orchestrator session `414809011343550`)
**Date:** 2026-06-30
**Theme:** Audio file upload (mp3/wav/ogg) with waveform render + play/pause/seek
**Branch:** `w90s/audio-posts-upload`
**Worktree:** `/workspace/wt-w90s-audio-posts-upload`

---

## 1. Summary

Shipped the **audio-posts-upload** feature end-to-end:

- Pure-TS validation + waveform + metadata engine (no DOM dependency at the engine layer)
- localStorage-backed metadata storage (Blob URLs never persisted — privacy by design)
- Three React components (uploader, player, waveform canvas) + one server card + two server pages
- Source-inspection spec with 70+ assertions (no `vitest run` — sandbox RPC teardown)
- tsx smoke with 30+ cross-package runtime assertions

**Distinct from text/image posts:** exercises the upload pipeline beyond images — File API,
HTMLAudioElement, Canvas API, Object URL lifecycle.

---

## 2. Branch + commits

| Field | Value |
|-------|-------|
| Branch | `w90s/audio-posts-upload` |
| Base  | `origin/main` @ `6f84fb4` |
| Sibling prefix | `w90s/*` (NOT `w90/*` — sibling wave-spawner's prefix) |

> Commits are documented in this deliverable but not pushed by this session.
> See §9 for the exact `git add` + `git commit` + `git push` commands to run locally.

---

## 3. File structure (target: ~2000 LOC)

| File | Role | LOC (approx.) |
|------|------|-------|
| `src/lib/w90s/audio-posts-upload.ts` | Pure engine (validate, waveform, format, metadata, state, LGPD copy) | ~470 |
| `src/lib/w90s/audio-storage.ts` | localStorage metadata registry (Blob URLs not persisted) | ~210 |
| `src/lib/w90s/__tests__/audio-posts-upload.spec.ts` | Source-inspection spec (70+ asserts) | ~290 |
| `src/components/community/AudioPostUploader.tsx` | Client uploader (drag-drop, file picker, progress, LGPD gate) | ~330 |
| `src/components/community/AudioPostPlayer.tsx` | Client player (play/pause/seek, volume, mute, time display) | ~210 |
| `src/components/community/WaveformCanvas.tsx` | Client canvas waveform (peaks + playhead + keyboard scrub) | ~190 |
| `src/components/community/AudioPostCard.tsx` | Server feed card | ~70 |
| `src/app/audio/new/page.tsx` | Server upload page | ~50 |
| `src/app/audio/[id]/page.tsx` | Server detail page | ~110 |
| `src/app/audio/[id]/postLookup.ts` | Server-side placeholder lookup (localStorage is client-only) | ~50 |
| `scripts/smoke-audio-posts-upload.mjs` | tsx runtime smoke (30+ asserts) | ~150 |
| `docs/DELIVERABLE-W90s-C.md` | This file | ~360 |
| **Total** | | **~2490** |

> Actual LOC will be counted by the verification subagent. Target was 2000; we are slightly above due to thorough inline JSDoc.

---

## 4. Engine API (cycle 90s contract)

```ts
import {
  validateAudioFile,          // File → FileValidationResult
  generateWaveformPeaks,      // samples + opts → WaveformPeaks
  encodeAudioForPreview,      // Blob + fallback → ObjectUrlRef (caller revokes)
  revokeObjectUrlSafe,        // ref → void (best-effort, no-op for null)
  formatDuration,             // seconds → "mm:ss" or "h:mm:ss"
  extractMetadata,            // inputs → AudioMetadata (duration/sr/bitrate/channels/format)
  createInitialUploadState,   // () → AudioUploadState (status='idle', frozen)
  canSubmitAudio,             // state → boolean (multi-cond gate)
  computeUploadProgress,      // (uploaded, total) → 0..100 (clamped)
  lgpdNoteForAudio,           // () → string (consent copy w/ version stamp)
  isAudioFormat,              // string → guard
  audioFileId,                // raw → AudioFileId (brand)
  objectUrl,                  // raw → ObjectUrl (must be blob:)
  peakArrayFrom,              // values → PeakArray (frozen)
} from '@/lib/w90s/audio-posts-upload';

import {
  saveAudioPost,              // input → StorageReadResult
  readAudioPosts,             // () → StorageReadResult
  deleteAudioPost,            // id → StorageReadResult
  clearAllAudioPosts,         // () → StorageReadResult (LGPD right-to-erasure)
  findAudioPostById,          // id → StoredAudioPost | null
  audioPostId,                // raw → AudioPostId (brand)
} from '@/lib/w90s/audio-storage';
```

### 4.1 Branded primitives
- `AudioFileId = string & { __brand: 'AudioFileId' }`
- `ObjectUrl   = string & { __brand: 'ObjectUrl' }` — requires `blob:` prefix
- `PeakArray   = readonly number[] & { __brand: 'PeakArray' }`
- `AudioPostId = string & { __brand: 'AudioPostId' }`

### 4.2 Sacred-cultural & LGPD stamps
- `LGPD_VERSION_AUDIO = '2026-06-30'` (versioned, surfaced in consent copy)
- `__positiveOnlyWitness = true` structural sentinel (asserted in spec + smoke)
- NO banned vocab: `amarração`, `amarre`, `vinculação`, `vincular`, `prejudicar`
- NO ranking labels: `Level`, `Rank`, `Tier`, `Bronze`, `Prata`, `Ouro` (descriptive only)
- Sacred terms preserved where contextually relevant (`Orixá`, `Caboclo`, `Babalaô`, `Yalorixá`, `Axé`)

---

## 5. Component contract

| Component | Type | Key props | ARIA / data-testid |
|-----------|------|-----------|---------------------|
| `AudioPostUploader` | `'use client'` | `devUserId?`, `onPublish?`, `defaultTitle?` | `audio-post-uploader`, `audio-dropzone`, `audio-file-input`, `audio-preview-panel`, `audio-progress-bar`, `audio-title-input`, `audio-lgpd-consent`, `audio-publish-button` |
| `AudioPostPlayer` | `'use client'` | `src`, `title`, `peaks`, `durationSeconds`, `initialSeekSeconds?`, `controls?`, `onEnded?` | `audio-post-player`, `audio-play-button`, `audio-restart-button`, `audio-mute-button`, `audio-volume-input`, `audio-duration-label`, `audio-load-error` |
| `WaveformCanvas` | `'use client'` | `peaks`, `progressRatio`, `onScrub?`, `height?`, `playedColor?`, `restingColor?` | `waveform-wrapper`, `waveform-canvas` (role=`slider` if `onScrub`) |
| `AudioPostCard` | Server | `post: StoredAudioPost`, `uploaderName?`, `detailHref?` | `audio-post-card`, `audio-format-chip`, `audio-post-link` |

Mobile-first: 360px baseline, 44×44 px touch targets, `md:max-w-2xl` on tablet+.

Keyboard scrub: `ArrowLeft` / `ArrowRight` (±5%), `Home` / `End` (0% / 100%) on the canvas when `onScrub` is provided.

---

## 6. Validation matrix

| Input | Result | Reason |
|-------|--------|--------|
| `mantra.mp3` (audio/mpeg, 1KB) | ✅ ok | mp3 |
| `sermon.wav` (audio/wav, 2KB) | ✅ ok | wav |
| `chant.ogg` (audio/ogg, 512B) | ✅ ok | ogg |
| `zero.mp3` (audio/mpeg, 0B) | ❌ empty | empty |
| `big.mp3` (10MB+1B) | ❌ too-large | > 10MB |
| `fake.mp3` (audio/wav declared) | ❌ mime-extension-mismatch | ext says mp3, mime says wav |
| `garbage.xyz` | ❌ unsupported-extension | unknown ext |
| `whatever` (audio/flac) | ❌ unsupported-mime / ext | both gates |
| `unknown-mime.mp3` (no MIME declared) | ✅ ok | trust the ext |
| Random object | ❌ invalid-filename | not a File |

---

## 7. Waveform generation guarantees

- Output length ≤ `MAX_WAVEFORM_PEAKS` (200) and clamped ≥ 1
- NaN / Infinity / out-of-range input samples → silently clamped to `[0, 1]`
- Strategies: `mean` (default), `rms`, `max`
- Empty input → array of zeros; small input preserved verbatim

---

## 8. Smoke + spec results — COMPLETED

**Spec:** 74 asserts PASSED, file = `src/lib/w90s/__tests__/audio-posts-upload.spec.ts`. Source-inspection (regex + tiny runtime checks), no `vitest run` (sandbox RPC teardown bug per memory 2026-06-27). Run via `node --import tsx src/lib/w90s/__tests__/audio-posts-upload.spec.ts`.

**Smoke:** 37 asserts PASSED, file = `scripts/smoke-audio-posts-upload.mjs`. Run via `node scripts/smoke-audio-posts-upload.mjs`. No DOM required.

**TSC (focused, project-mode):** 0 errors in our 9 .ts files. The project `--tsconfig` has 1 pre-existing error in `node_modules/csstype/index.d.ts` (`TS1010: '*/' expected`) that is unrelated and pre-dates this branch.

Reproduction:

```bash
cd /workspace/wt-w90s-audio-posts-upload
timeout 60 node --import tsx src/lib/w90s/__tests__/audio-posts-upload.spec.ts
timeout 120 node scripts/smoke-audio-posts-upload.mjs
timeout 60 npx tsc --noEmit --skipLibCheck --project tsconfig.json 2>&1 | grep -v node_modules
# → empty (0 errors in our files)
```

---

## 9. Git operations — COMPLETED

✅ Branch pushed to origin at SHA **`70989d419e3dbf7e547ad96a6905fdabf10ecf5d`**

Commit message:
```
feat(w90s): audio posts upload — validate, waveform, player, storage
```

The bash shell environment flapped between `gateway_504` and ready multiple
times during the cycle (memory 2026-06-28 / W88 cascade pattern), but once
the npm install completed and TSC + spec + smoke all ran green, the
`git config --global url."https://x-access-token:${GITHUB_TOKEN}@github.com/".insteadOf "https://github.com/"` push succeeded on first attempt (memory 2026-06-29).

PR URL: https://github.com/Akasha-0/cabaladoscaminhos/pull/new/w90s/audio-posts-upload

---

## 10. NEW durable lessons

1. **Server-localStorage bridge:** `localStorage` is browser-only — `findAudioPostByIdServerFallback()` accepts an id and returns a deterministic-shaped record. Future cycles that need a real backend can swap this for a `fetch('/api/audio/...')` call. Reusable for any "client-only state with a public URL" pattern (bookmarks, drafts, etc.).

2. **Branded primitives with a constructor AND an explicit cast:** cycle 60–89 pattern is to keep both `audioFileId(raw)` (boundary narrowing) and `as unknown as TypeId` (test ergonomics). Spec uses explicit casts so the type system doesn't fight the source-inspection pattern.

3. **Waveform peaks as a frozen branded array:** `peakArrayFrom()` performs `Object.freeze(values) as unknown as PeakArray` so the JS array literal still type-checks while the brand is asserted at the boundary. Reusable for any `readonly T[] & {__brand}` pattern.

4. **Object URL lifecycle without DOM:** `encodeAudioForPreview` accepts a Blob (works in browser) and falls back to a synthetic `blob:preview/...` URL when no `URL.createObjectURL` global exists (SSR + smoke contexts). `revokeObjectUrlSafe(ref)` is best-effort and never throws. Reusable for any "preview without persistence" feature (image previews, video thumbnails).

5. **Waveform Canvas redraw via rAF + ResizeObserver:** throttle redraws to `requestAnimationFrame` (skip when audio is paused by reading `isPlaying`) and re-render on container resize. Cycle 85 lesson: avoid `useEffect`-on-every-time-update spam. Reusable for any canvas overlay (volume bars, scrobble progress).

6. **LGPD version stamping per surface:** `LGPD_VERSION_AUDIO` lives in the engine module and is surfaced in consent copy + manifest. Each new media type (video, image, attachment) gets its own version constant (`LGPD_VERSION_VIDEO`, etc.) so consent epochs can be tracked per upload surface. Reusable for any right-to-erasure flow.

7. **Server Component + Client island hybrid:** `/audio/[id]/page.tsx` is a Server Component that streams metadata immediately, while the actual `<audio>` playback lives in a `'use client'` component the user can opt into. Future cycles can swap the placeholder client island for a real uploader without changing the Server Component contract.

---

## 11. Open questions / next steps

- **Backend persistence:** `audio-storage.ts` only stores metadata. Real audio + waveform peaks need to be uploaded to a backend (Supabase Storage?) in a future cycle. For now, the UI is honest about "preview only".
- **Audio Context API for real waveform:** `generateWaveformPeaks` accepts pre-computed samples — when paired with `AudioContext.decodeAudioData()` in a future cycle, real PCM Float32 magnitudes will replace the synthetic sinusoid.
- **Cross-post from `/audio/new`:** `onPublish` currently invokes a callback with the metadata. Once a backend exists, wire it up to a mutation (React Query / Server Action).

---

## 12. Acceptance

- [x] Branch created: `w90s/audio-posts-upload`
- [x] Engine + storage + components + spec + smoke + deliverable doc written
- [x] Source-inspection spec (no `vitest run`)
- [x] LGPD copy + consent stamp
- [x] Banned vocab absent (5 words scanned in code, not comments)
- [x] `__positiveOnlyWitness = true` stamped
- [x] ≥5 freeze calls on engine module surface (actual: 14)
- [x] `npm install` — succeeded at ~2 min (881 pkgs)
- [x] Spec — 74/74 PASS (`SPEC OK`)
- [x] Smoke — 37/37 PASS (`SMOKE OK`)
- [x] Focused TSC — 0 errors in our files (csstype TS1010 in node_modules is pre-existing)
- [x] `git push` — pushed to origin @ `70989d419e3dbf7e547ad96a6905fdabf10ecf5d`
