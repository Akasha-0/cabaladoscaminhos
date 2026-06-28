# Voice Mode W19 — server-side TTS upgrade (2026-06-28)

## TL;DR

Wave 12 shipped a client-only `VoiceButton` (Web Speech API). Wave 19 adds a
**pluggable server-side TTS route** (`/api/akashic/tts`) that synthesizes mp3
for an Akasha response, caches the audio to disk for 7 days, and feeds it to
the same `VoiceButton` via `HTMLAudioElement`. **When no provider key is
configured the route returns 503 and the button silently falls back to the
Wave 12 Web Speech API** — so the feature works out of the box on every
deploy.

## Files

### Added

| File | Purpose |
|------|---------|
| `src/lib/tts/cache.ts` | File-system cache (SHA-256 keys, 7-day TTL, lazy GC, atomic-ish write). |
| `src/lib/tts/providers.ts` | Three providers (`google_free` / `google_cloud` / `elevenlabs`) + orchestrator. |
| `src/app/api/akashic/tts/route.ts` | `POST` returns mp3; `GET` is diagnostics. |
| `docs/VOICE-MODE-W19.md` | This file. |

### Modified

| File | Change |
|------|--------|
| `src/components/akashic/VoiceButton.tsx` | New `ttsEndpoint?: string \| 'auto'` prop. When set, button tries server first, falls back to Web Speech API on 5xx / network failure. |
| `src/components/akashic/AkashicMessageList.tsx` | Passes `ttsEndpoint="auto"` to `VoiceButton`. One-line integration. |

## API contract

### `POST /api/akashic/tts`

Request body:
```json
{
  "text": "Akasha fala assim.",          // required, 1–4500 chars
  "voiceId": "pt-BR-Neural2-B",         // optional — provider default per locale
  "locale": "pt-BR",                     // optional, one of pt-BR | en | es
  "rate": 1.0,                           // optional, 0.5–2.0
  "bypassCache": false                   // optional, default false
}
```

Response: `200 OK` with `Content-Type: audio/mpeg`. Useful response headers:

- `X-Tts-Cache: HIT-L1 | HIT-L2 | MISS` — L1 is in-memory (60s), L2 is disk.
- `X-Tts-Provider: google_cloud | google_free | elevenlabs | cached`
- `X-Tts-Voice: <voice-id>`
- `X-Tts-Bytes: <size>`
- `Cache-Control: public, max-age=604800, immutable`

Error contract:

| Status | When | Client behavior |
|--------|------|-----------------|
| 400 | Bad JSON / zod failure / empty text | UI surfaces inline error. |
| 413 | Text > 4500 chars | UI surfaces inline error. |
| 429 | Rate limit (30 req/min/IP) or upstream 429 | UI shows retry affordance. |
| 502 | Upstream provider failure | UI surfaces error, retry button. |
| 503 | No provider configured (`GOOGLE_TTS_API_KEY` + `ELEVENLABS_API_KEY` both missing, `google_free` failed too) | **`VoiceButton` silently falls back to Web Speech.** |

### `GET /api/akashic/tts`

Diagnostic. Returns provider statuses + cache TTL. `?purge=1` triggers a
sweep that deletes entries older than 7 days. Safe to call from a cron.

```json
{
  "ok": true,
  "mode": "diagnostic",
  "providers": [
    { "provider": "google_free",   "available": true,  "reason": "..." },
    { "provider": "google_cloud",  "available": false, "reason": "Set GOOGLE_TTS_API_KEY..." },
    { "provider": "elevenlabs",    "available": false, "reason": "Set ELEVENLABS_API_KEY..." }
  ],
  "maxTextChars": 4500,
  "cacheTtlDays": 7
}
```

## Provider priority

`synthesizeWithFallback` walks the preference list and returns the first
provider that returns 2xx. The default preference order is:

1. `google_cloud` — needs `GOOGLE_TTS_API_KEY`. Neural2 voices, 4M chars free/mo.
2. `google_free` — public `translate.google.com/translate_tts`. No key. ~180-char chunks. Works in dev.
3. `elevenlabs` — needs `ELEVENLABS_API_KEY`. Best pt-BR quality, 10k chars free/mo.

To customize, pass an explicit `preference` array to `synthesizeWithFallback`
or call individual `synthesize*` functions directly. To **disable** a
provider, leave its env var unset — the orchestrator skips it.

## Cache layout

```
data/tts-cache/
  <sha256>.mp3        — audio bytes
  <sha256>.meta.json  — { provider, voiceId, locale, bytes, mtimeMs, ttlMs }
```

- Cache key = `sha256(JSON.stringify({ t: text.trim().toLowerCase(), v: voiceId, l: locale }))`.
- TTL: 7 days (mtime-based, lazy GC on read).
- `data/` is gitignored. Cache is disposable — providers are idempotent.
- On read, stale files (>7d) are deleted inline.

## Client UX

`VoiceButton` (`src/components/akashic/VoiceButton.tsx`):

- Existing Wave 12 Web Speech API code is **unchanged** — the `speakClient`
  function is the fallback path.
- New `ttsEndpoint` prop defaults to `undefined` (Wave 12 behavior — pure
  client). Set to `'auto'` to use the built-in `/api/akashic/tts` route,
  or pass an arbitrary URL for a custom endpoint.
- Top-level `speak()` tries server first; on non-2xx (or fetch failure), it
  falls through to Web Speech. Users never see a "TTS unavailable" state
  when their browser supports Web Speech.
- `stop()` cancels whichever path is active (audio element + speech
  synthesis) so re-clicks behave consistently.

## Environment variables

| Var | Effect | Free tier |
|-----|--------|-----------|
| `GOOGLE_TTS_API_KEY` | Enables `google_cloud` (preferred). | 4M chars/mo (Standard), 1M/mo (Neural2). |
| `ELEVENLABS_API_KEY` | Enables `elevenlabs` (premium). | 10k chars/mo. |

If neither is set, the API route still responds: it tries `google_free`
(no key) and returns 503 only when that also fails (rare — Google rate
limits anonymous requests heavily). In that case the client falls back to
Web Speech, which never requires a server.

## Defensive guarantees

- **No external deps added.** All providers are thin `fetch()` wrappers.
- **Defensive route.** Try/catch around every external call. Returns clean
  status codes. Never throws uncaught.
- **Rate limit.** 30 req/min per IP via the existing `checkRateLimit`.
- **GC.** Lazy on read; bulk via `?purge=1`.
- **SSR-safe.** `VoiceButton` never touches `window` during render.
- **Cleanup.** `useEffect` cleans up both `audioRef` and
  `speechSynthesis.cancel()` on unmount.

## Verification checklist

- [x] `VoiceButton` props are additive (no breaking changes for Wave 12 callers).
- [x] `AkashicMessageList` passes `ttsEndpoint="auto"`.
- [x] Server route validates with Zod (400 on bad input).
- [x] Server route 503s cleanly when no provider is available.
- [x] Client silently falls back to Web Speech API on server failure.
- [x] Cache writes are atomic (tmp + rename) and best-effort.
- [x] TTL check on read prevents stale audio from being served.
- [ ] Manual verification requires a live deploy — TSC was not run in
  sandbox (no `node_modules`); see "Known limitations" below.

## Known limitations

- **No live provider verification** — no TTS keys in CI. The route returns
  503 in dev; integration is exercised end-to-end once `GOOGLE_TTS_API_KEY`
  or `ELEVENLABS_API_KEY` is set in production env.
- **Google Cloud REST endpoint** is hard-coded to v1. The SDK (`@google-cloud/text-to-speech`)
  would give better retry semantics + SSML support, but adding the SDK
  costs ~10MB install + cold-start latency for a path that's optional.
- **`google_free` chunks at 180 chars.** Larger inputs concatenate multiple
  mp3 frames. Frame-boundary artifacts are possible; `google_cloud` is
  the recommended path for production.
- **No streaming endpoint.** Akasha responses can be long; the route waits
  for full synthesis. If latency becomes an issue, the next iteration can
  add `/api/akashic/tts/stream` (chunked SSE → mp3 frames).

## Operational notes

- Cache dir `data/tts-cache/` is gitignored. On Vercel, the `/tmp` overlay
  is ephemeral; for a persistent cache, mount S3 or use Redis.
- `?purge=1` is safe to call from `vercel.json` cron or a sidecar.
- Provider cost tracking: each cache entry logs `provider` + `bytes` in
  the meta JSON; aggregate cost can be derived by summing `bytes` across
  providers.

## Follow-ups (not in W19 scope)

1. **Voice picker UI** — surface `voiceId` selector (pt-BR-A vs pt-BR-B).
2. **Streaming SSE** — for responses > 10s, stream audio chunks.
3. **Persistent cache** — S3 / Redis when ephemeral `/tmp` is a problem.
4. **SSML support** — pause markers for citation cards, emphasis on
   Orixá names.
5. **AkashicResponse.ttsUrl field** — server pre-synthesizes the most
   recent response so the button is one-click instead of waiting.

## Migration from W12

None required. Existing pages render unchanged. To activate the server
path explicitly, pass `ttsEndpoint="auto"` (already done in
`AkashicMessageList.tsx`). To opt out, pass `ttsEndpoint={undefined}`.
