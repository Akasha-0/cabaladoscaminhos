# W71-C — Audio + Video Posts (record, upload, playback, waveform)

**Cycle:** W71-C (Akasha Wave-Spawner batch 71)
**Worker:** Coder (session `414647196577872`)
**Spawn:** 2026-06-30 02:06 UTC
**Branch:** `w71/audio-video-posts`
**SHA (HEAD):** `2f381485dfaf74f0b8c3f6d0cb4be0b1ee5f694e`
**Push:** ✅ origin/w71/audio-video-posts (`git ls-remote` confirmed)
**Wall-clock:** ~19 min (target 30 min, comfortably under cap)

---

## Status: ✅ DELIVERED + PUSHED + SMOKE-PASSING

---

## 4 Engines

| Engine | LOC | Public API | Sacred |
|---|---|---|---|
| `engines/media-recorder.ts` | 336 | `createRecorder`, `startRecording`, `stopRecording`, `pauseRecording`, `resumeRecording`, `getRecordingState`, `getSupportedMimeTypes`, `setRecorderFactory`, `saveMedia`, `getMedia`, `listMedia`, `clearMediaStore`, `setupStreamedRecorder`, `auditRecorderRules` (14 exports) | 7 traditions × audit metadata |
| `engines/media-player.ts` | 417 | `createPlayer`, `play`, `pause`, `seek`, `setVolume`, `setPlaybackRate`, `getPlayerState`, `extractWaveform`, `generateWaveformSvg`, `extractVideoThumbnail`, `parseWavHeader` (internal), `setPlayerCtor`, `auditPlayerRules` (13 exports) | 7 traditions × 1 = 7 |
| `engines/media-upload.ts` | 538 | `uploadMedia`, `cancelUpload`, `pauseUpload`, `resumeUpload`, `getUploadProgress`, `validateMediaFile`, `setFetch`, `setUploadHmacSecret`, `signUploadRequest`, `clearUploadStore`, `auditUploadRules` (11 exports) | 7 traditions × 1 = 7 |
| `engines/media-codec.ts` | 611 | `detectFormat`, `getRecommendedSettings`, `estimateFileSize`, `transcodePlan`, `getTraditionPreset`, `TRADITION_PRESETS`, `auditCodecRules` (7 exports) | **7 traditions × 12 sacred refs each = 84** |
| **Total engines** | **1,902L** | **45 exports across 4 engines** | — |

## Spec files (self-running harness)

| Spec | LOC | its | assertions | status |
|---|---|---|---|---|
| `spec/media-recorder.spec.ts` | 321 | 14 | 37 | ✅ 14/14 PASS |
| `spec/media-player.spec.ts` | 374 | 21 | 50 | ✅ 21/21 PASS |
| `spec/media-upload.spec.ts` | 351 | 16 | 42 | ✅ 16/16 PASS |
| `spec/media-codec.spec.ts` | 401 | 36 | 103 | ✅ 36/36 PASS |
| **Total** | **1,447L** | **87** | **232** | **✅ 87/87 PASS** |

## Smoke runner

- File: `smoke/media-smoke.ts` (92 lines)
- Aggregates 4 sections (recorder / player / upload / codec) via dynamic `import()`
- Exits 0 only if all sections pass
- Output: **`Total: 87/87 tests, 232 assertions across 4 sections. ✅ SMOKE PASSED`**
- Wall-clock per section: recorder 99ms, player 76ms, upload 1211ms (with retry test), codec 24ms

## Sacred coverage (REQUIRED 7/7 traditions)

`engines/media-codec.ts → TRADITION_PRESETS` exposes:

| Tradition | displayName | audio | video | sacred refs |
|---|---|---|---|---|
| `cigano` | Baralho Cigano (Ramiro) | 432Hz / 128kbps | 720p / 1.2Mbps | 12 (cigano:1..cigano:28) |
| `orixas` | Orixás da Bahia | 48kHz / 192kbps | 1080p / 4Mbps | 12 (orixa:oxala..logum-ede) |
| `astrologia` | Astrologia Ocidental | 44.1kHz / 96kbps | 720p / 1.5Mbps | 12 (casa-1..casa-12) |
| `cabala` | Cabala (Kabbalah) | 44.1kHz / 128kbps | 720p / 2Mbps | 12 (kether..shem-hameforash) |
| `numerologia` | Numerologia Pitagórica | 44.1kHz / 128kbps | 720p / 1.2Mbps | 12 (1-sol..33-mestre) |
| `tantra` | Tantra (Kundalini) | 528Hz / 192kbps | 720p / 3Mbps | 12 (muladhara..aham-brahmasmi) |
| `tarot` | Tarot (Arcanos Maiores) | 44.1kHz / 96kbps | 720p overlay | 12 (0-o-louco..forca) |
| **Total sacred refs** | | | | **84** (≥84 required) |

Each preset also carries locale strings in **pt-BR / en / es** for display + description (3 locales × 7 traditions = 21 i18n pairs minimum).

## Architecture notes

### Browser-API injection pattern (cycle 70+ lesson)
Engines reference browser globals (`MediaRecorder`, `HTMLMediaElement`, `Blob`, `FileReader`, `fetch`, `AbortController`, `navigator`) only via `(globalThis as any).X` lookups OR via `setRecorderFactory`/`setPlayerCtor`/`setFetch` injection. Tests inject mock implementations. Production wires the real browser globals — no shim needed.

### Worktree-isolated TS config
- `tsconfig.json` at worktree root (module: NodeNext, lib: [ES2022, DOM], types: [], `allowImportingTsExtensions: true`)
- `globs.d.ts` provides TypeScript type stubs for browser APIs + Node globals (TS-only, no runtime cost)
- `.ts` extension imports work cleanly under `node --experimental-strip-types`
- **TSC:** 0 errors. Verified: `tsc --noEmit --skipLibCheck 2>&1 | wc -l = 0`

### Self-running spec harness + smoke aggregator (cycle 60+ pattern)
- Each spec exposes `runXxxSpec()` returning `{passed, failed, assertions, its}`
- `smoke/media-smoke.ts` does dynamic `import('../spec/$name.spec.ts')` (NOT `pathToFileURL()` — would double-encode `file:` URLs)
- Aggregator shadows the vitest API surface

## NEW lessons (reusable cross-project)

1. **`w = new Uint32Array(16)` breaks SHA-1** — the message-schedule array MUST be 80 elements (16 input + 64 expanded). Setting `w[16]` on a 16-element typed array throws `RangeError` in strict mode. Symptom: HMAC-SHA1 returns the initial state hex untransformed. Reusable: any custom SHA-1/HMAC-SHA1 implementation.

2. **Mock `Blob` instances get coerced to `"[object Object]"` (15 chars) when passed to `new Blob([nonBlob])`** — Node's Blob constructor only accepts BufferSource | real Blob | string. Test mocks that don't inherit Blob fall back to ToString. Fix: use the real `global Blob` for chunks; or wrap each chunk in a `Uint8Array(size)`.

3. **`node:url` and `node:path` imports require `node` in tsconfig types** — but `types: []` blocks that. Fix: declare module stubs `'url' { export function fileURLToPath(...) }` and `'path' { export function dirname(...) }` in a globs.d.ts. Cleaner than installing @types/node for a 92-line smoke runner.

4. **Magic-byte offset matters** — `ftyp` at MP4 offset 4 (not 0). The handle `'ftyp'` checks at offset 4. WAV header walks chunks (`RIFF` → `WAVE` → `fmt ` → `data`); sub-chunk offsets are dynamic. Reusable: any binary format that uses chunk containers (RIFF, AIFF, MKV, MP4).

5. **MP3 frame sync (`0xFF FB/FA/F3/F2` at offset 0) is the more common case than ID3** — ID3 tags are optional and many encoders skip them. Frame sync at offset 0 is the canonical MPEG audio header.

6. **HMAC for chunked upload signatures is the cycle-67 lesson applied here** — each chunk is signed with `HMAC-SHA1(secret, "chunk:<uploadId>:<idx>:<start>")` and finalize with `HMAC-SHA1(secret, "finalize:<uploadId>")`. Production swaps in `SubtleCrypto.sign('HMAC', sha256, key)` for stronger primitives.

7. **Self-contained SHA-1 keeps the engine zero-dep** — the canvas's `crypto.subtle` is async; a synchronous SHA-1 lets signatures be computed inline during chunk serialization without `await` machinery. Tradeoff documented in DELIVERABLE.

## Push verification

```
$ git push origin HEAD
To https://github.com/Akasha-0/cabaladoscaminhos.git
 * [new branch]      HEAD -> w71/audio-video-posts
```

SHA: `2f381485dfaf74f0b8c3f6d0cb4be0b1ee5f694e`

## Notes for verifier

- **Worktree-local tsconfig.json + package.json** override root configs in this branch only (won't leak to main until merged). Cycle 60-70 used the same pattern.
- **Mock factories**: `setRecorderFactory`, `setPlayerCtor`, `setFetch` are the only way to drive the engines in Node. Tests use them. Production calls without them and reads `globalThis`.
- **HMAC secret default = ""** — tests call `setUploadHmacSecret('w71-secret')`. Production MUST call with a real secret before any chunk upload.
- **In-memory store** — `STORE: Map<mediaId, RecordedMedia>` and `UPLOADS: Map<uploadId, UploadEntry>` are non-persistent. Production uses Redis (TTL ≥ 24h) and signed S3 multipart uploads.
- **WAV header parser** supports chunk-walking (handles extra metadata chunks); MP3/M4A return deterministic placeholder waveforms. Production wires Web Audio API.
- **extractVideoThumbnail** returns a 1×1 PNG placeholder. Production uses `<video> + <canvas>.drawImage`.
- **transcodePlan** is pure-computation (steps + estimates), no I/O. FFmpeg.wasm is the production TODO.
- **`getTraditionPreset`** returns a frozen RecorderConfig (no caller mutation).
- **`auditXxxRules`** exported on every engine so the verifier can introspect the rules without reading the source.

## Honest concerns (documented per cycle 60+ lesson)

1. **Server-side persistence** for `UPLOADS` and `STORE` is non-persistent. Flagged.
2. **MP3/M4A waveform extraction** returns a deterministic FNV-based placeholder curve. Production uses Web Audio API.
3. **Video thumbnail extraction** returns a 1×1 PNG placeholder. Production uses canvas + currentTime.
4. **HMAC-SHA1** is shipped standalone (zero-dep). Production should swap to SubtleCrypto.
5. **Chunk size 5MB default** is a hardcoded magic number in `DEFAULT_CHUNK_SIZE`. Production should make this per-tier.
6. **`audioBitrate`/`videoBitrate`** were removed from RecorderConfig (typo, not standard). If wanted back, add to `RecorderConfig` and `normalizeOptions`.
7. **tsconfig.json / package.json at worktree root**: changes are branch-scoped (won't leak to main until merged). Verifier should review `git diff` for this branch before merging.

## Files changed/created

```
engines/media-recorder.ts          (new) 336L
engines/media-player.ts            (new) 417L
engines/media-upload.ts            (new) 538L
engines/media-codec.ts             (new) 611L
spec/media-recorder.spec.ts        (new) 321L
spec/media-player.spec.ts          (new) 374L
spec/media-upload.spec.ts          (new) 351L
spec/media-codec.spec.ts           (new) 401L
smoke/media-smoke.ts               (new)  92L
globs.d.ts                         (new) ~250L
tsconfig.json                      (mod) worktree-local override
package.json                       (mod) worktree-local override
DELIVERABLE.md                     (new) this file
```

Total: 12 files, 3,541 insertions, 253 deletions.

## Reproduction

```bash
cd /workspace/cabaladoscaminhos-w71-media
tsc --noEmit --skipLibCheck                              # TSC = 0 errors
node --experimental-strip-types ./smoke/media-smoke.ts   # 87/87 PASS
```
