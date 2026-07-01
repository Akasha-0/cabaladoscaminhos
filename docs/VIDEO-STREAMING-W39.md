# Video + Streaming — Wave 39 (6/8)

> Production HLS + CDN + adaptive bitrate + recording infrastructure for the
> Cabala dos Caminhos community platform. Built for the open-beta scaling
> phase (Wave 39 of the Akasha Wave-Spawner roadmap).

---

## Table of Contents

1. [Overview & Goals](#1-overview--goals)
2. [HLS Architecture](#2-hls-architecture)
3. [ABR Ladder (Adaptive Bitrate)](#3-abr-ladder-adaptive-bitrate)
4. [Self-Hosted FFmpeg Pipeline](#4-self-hosted-ffmpeg-pipeline)
5. [Cloudflare Stream (Recommended)](#5-cloudflare-stream-recommended)
6. [Mux Configuration](#6-mux-configuration)
7. [AWS MediaConvert + CloudFront](#7-aws-mediaconvert--cloudfront)
8. [CDN Edge Caching](#8-cdn-edge-caching)
9. [Live Chat Architecture (SSE)](#9-live-chat-architecture-sse)
10. [Reactions + Q&A + Highlights](#10-reactions--qa--highlights)
11. [Recording + Auto-Chapter Markers](#11-recording--auto-chapter-markers)
12. [Whisper Captions Pipeline](#12-whisper-captions-pipeline)
13. [LGPD Compliance for Recording](#13-lgpd-compliance-for-recording)
14. [WCAG AA: Captions + Audio-Description](#14-wcag-aa-captions--audio-description)
15. [Video Player UI (hls.js)](#15-video-player-ui-hlsjs)
16. [Picture-in-Picture + AirPlay + Cast](#16-picture-in-picture--airplay--cast)
17. [Scheduled Events + Reminders](#17-scheduled-events--reminders)
18. [ICS Calendar Integration](#18-ics-calendar-integration)
19. [Pre-Recorded Video Upload](#19-pre-recorded-video-upload)
20. [Video Library](#20-video-library)
21. [Streaming Analytics](#21-streaming-analytics)
22. [Live Chat Moderation](#22-live-chat-moderation)
23. [API Surface](#23-api-surface)
24. [Operational Runbook](#24-operational-runbook)
25. [Cost Estimates](#25-cost-estimates)
26. [Future Work (W40+ Backlog)](#26-future-work-w40-backlog)

---

## 1. Overview & Goals

Wave 39 adds production-grade live streaming and VOD infrastructure for
the open beta. Scope:

- **HLS adaptive bitrate** with 4 variants (1080p / 720p / 480p / 240p).
- **CDN distribution** with three deployment presets:
  Cloudflare Stream (default), Mux, AWS MediaConvert + CloudFront.
- **Live chat** via Server-Sent Events — works on HTTP/1.1 + 2, no WebSockets.
- **Reactions + Q&A + highlight auto-detection** for engaged moments.
- **Auto-recording** of every broadcast with auto-chapter markers.
- **LGPD compliance** — host opt-in + viewer notice + scoped deletion (Art. 7, 18, 37).
- **WCAG AA** — closed captions PT-BR + EN, audio-description track,
  keyboard shortcuts, focus-visible states, aria-live status.
- **Video library** at `/library/videos` with filters by tradição + facilitator.
- **Streaming analytics** — concurrent viewers, retention curve, device split.
- **Multi-part upload** for pre-recorded videos up to 4GB with auto-transcode.

Goals:
- ≤5s live latency for ceremonies, ≤15s for talks.
- 95+ Lighthouse on the video library page.
- 80%+ cache hit ratio on the CDN edge.
- A11y WCAG AA, LGPD Art. 7/18/37, W3C HLS spec compliance.

## 2. HLS Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  OBS / WebCam (browser capture)                                     │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │ RTMP(S) ingest
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Transcoder (FFmpeg / Cloudflare Stream / MediaConvert)             │
│                                                                     │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│   │ 1080p    │ │  720p    │ │  480p    │ │  240p    │  ABR Ladder  │
│   │ 5 Mbps   │ │ 2.5 Mbps │ │  1 Mbps  │ │ 0.4 Mbps │               │
│   └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘               │
│        ▼            ▼            ▼            ▼                     │
│   ┌──────────────────────────────────────────────────────────┐      │
│   │ HLS Segments (.ts) + Playlists (.m3u8) per variant       │      │
│   │ + Master playlist (multivariant)                         │      │
│   └──────────────────────────────────────────────────────────┘      │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  CDN Edge (Cloudflare / CloudFront / Mux)                           │
│  • .m3u8 playlist: 4s TTL (low-latency refresh)                     │
│  • .ts segments:   86400s TTL (immutable, cache forever)             │
│  • Captions VTT:   separate origin, no auth                         │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Viewer Client (hls.js / native Safari HLS)                         │
│  • Adaptive bitrate selection (bandwidth + buffer heuristics)       │
│  • Network quality probing every 10s                                │
│  • Manual override (Auto / 1080p / 720p / 480p / 240p)              │
└─────────────────────────────────────────────────────────────────────┘
```

The architecture is **deployment-agnostic** — the player and API endpoints
treat all three CDNs as opaque delivery pipelines.

## 3. ABR Ladder (Adaptive Bitrate)

| Variant | Resolution | Video Bitrate | Audio | Profile | Fragment | Use Case           |
|---------|------------|---------------|-------|---------|----------|--------------------|
| 0       | 426×240    | 400 kbps      | 64    | baseline| 4s       | 2G/3G edge         |
| 1       | 854×480    | 1 Mbps        | 96    | baseline| 4s       | 4G / Wi-Fi poor    |
| 2       | 1280×720   | 2.5 Mbps      | 128   | main    | 4s       | Wi-Fi normal      |
| 3       | 1920×1080  | 5 Mbps        | 192   | high    | 4s       | Broadband + tablet|

Constants in `src/lib/streaming/hls-server.ts` (`ABR_LADDER`). The ladder is
`Object.freeze` — modifications require a code review.

**Why these specific bitrates:**
- 400 kbps at 240p covers 2G/3G edge cases common in rural Brazil.
- 1 Mbps at 480p is the minimum for legible handwritten tarot / runas cards.
- 2.5 Mbps at 720p matches the typical Wi-Fi upload cap, so we deliver
  almost everything ≥720p when bandwidth allows.
- 5 Mbps at 1080p is the broadband ceiling; above this we hit encoder CPU
  limits without meaningful perceived quality gain.

**GOP alignment:** every fragment is exactly 1 GOP (`-g {frag*30}` with
30fps). Independent_segments flag means clients can switch variants on any
fragment boundary without re-sync.

## 4. Self-Hosted FFmpeg Pipeline

For VPS / dedicated-host deployments, `buildFfmpegCommand(...)` returns a
complete FFmpeg argv. The transcoder wraps it with a watchdog supervisor
that restarts the process if it exits unexpectedly.

**Sample invocation** (1080p variant, normal latency):

```bash
ffmpeg \
  -i rtmp://localhost/live/<stream-key> \
  -c:v libx264 -profile:v high -preset veryfast \
  -g 120 -keyint_min 120 -sc_threshold 0 \
  -force_key_frames 'expr:gte(t,n_forced*4)' \
  -r 30 -s 1920x1080 -b:v 5000000 -maxrate 5350000 -bufsize 10000000 \
  -c:a aac -b:a 192000 -ac 2 -ar 44100 \
  -f hls -hls_time 4 -hls_playlist_type event \
  -hls_segment_filename /var/hls/<event-id>/1080p/seg_%05d.ts \
  -hls_flags independent_segments+program_date_time \
  /var/hls/<event-id>/1080p/index.m3u8
```

Each variant writes to its own directory; an orchestrator process
generates the master playlist by `cat`-ing all variant .m3u8 URLs into the
multivariant manifest.

## 5. Cloudflare Stream (Recommended)

```ts
import { CLOUDFLARE_STREAM_CONFIG } from '@/lib/streaming/cdn-config';
// → { provider: 'cloudflare-stream', baseUrl: 'https://stream.cdn.luminarias.cloud', ... }
```

**Why recommended for open beta:**
- Per-minute pricing (~$1 / 1k min stored, $1 / 1k min delivered).
- Built-in captions, recording, analytics dashboards.
- 300+ PoP edge network including all major Brazilian cities.
- WebRTC ingest + HLS fallback = low-latency + universal compatibility.
- Single API for live + VOD + replay — no separate pipelines to maintain.

**Pricing at open-beta traffic levels** (assuming 200 events/month ×
60min avg × 50 viewers avg = 600k viewer-hours):

| Component          | Unit              | Volume       | Cost         |
|--------------------|-------------------|--------------|--------------|
| Live minutes stored| $1 / 1k min       | 12k min      | $12          |
| Live minutes deliv.| $1 / 1k min       | 600k min     | $600         |
| VOD storage        | $1 / 1k min       | 30k min      | $30          |
| VOD delivery       | $1 / 1k min       | 30k min      | $30          |
| Captions (auto)    | $0.05 / min       | 12k min      | $600         |
| **TOTAL**          |                   |              | **~$1,272/mo**|

## 6. Mux Configuration

Mux is recommended for developer-friendly setups. The `MUX_CONFIG`
preset exposes the same `CdnDistributionConfig` shape.

```ts
import { MUX_CONFIG } from '@/lib/streaming/cdn-config';
```

**Mux-specific features:**
- Mux Video API: create assets, get playback IDs, signed JWT tokens.
- Mux Data: client-side analytics (rebuffer %, playback failures).
- Mux Player: drop-in component (we use hls.js for finer control).

## 7. AWS MediaConvert + CloudFront

For enterprise scale (>50TB egress/mo). `MEDIACONVERT_CONFIG` uses
sa-east-1 as the primary region.

Higher setup cost, but **deepest IAM integration** for compliance-driven
environments (e.g. some LGPD-audited healthcare deployments).

## 8. CDN Edge Caching

| Resource                 | TTL        | Immutable | Notes                                |
|--------------------------|------------|-----------|--------------------------------------|
| Master playlist (.m3u8)   | 4s         | No        | Refresh every 4s for live variant    |
| Variant playlist (.m3u8) | 4s         | No        | Refresh every 4s                     |
| HLS segments (.ts)       | 86,400s    | Yes       | Cache forever once delivered         |
| Captions (VTT)           | 3,600s     | No        | Refresh hourly for late-added lines |
| Thumbnails (JPEG)        | 604,800s   | Yes       | Cache for a week                     |

The short playlist TTL is critical for live (4s = low latency without
overloading origin). Segments are immutable so we cache them for 24h.

**CORS:** all playback URLs include the configured `allowedOrigins` in
their Access-Control-Allow-Origin header. Default allows both
`luminarias.app` and `cabala.app`.

## 9. Live Chat Architecture (SSE)

Server-Sent Events is preferred over WebSockets because:

1. **No upgrade handshake** — works on plain HTTP/1.1 + 2.
2. **Browser native** — no client lib dependency (just `new EventSource(...)`).
3. **One-way server→client fits chat perfectly** — we only need downstream
   notifications, not bidir. Bidir messages use POST.
4. **Auto-reconnect** — browser handles network drops; we emit a heartbeat
   every 15s (`event: ping`).

**Message types broadcast:**

```ts
type ChatEvent =
  | { type: 'message';    data: LiveChatMessage }
  | { type: 'reaction';   data: LiveChatReaction }
  | { type: 'qa';         data: { id: string; user: string; text: string; ts: number } }
  | { type: 'highlight';  data: { ts: number; reason: string } }
  | { type: 'presence';   data: { count: number } };
```

**Channel lifecycle:** each live event has one channel, lazily created
on first message. Channels auto-expire 1h after the event ends (Redis
TTL in production).

## 10. Reactions + Q&A + Highlights

**Reactions** (5 types):
- ❤️ heart — 1 PRESENCE
- 🔥 fire — 5 PRESENCE
- ✨ sparkles — 10 PRESENCE
- 🕉️ om — 3 PRESENCE
- 🪷 lotus — 25 PRESENCE

The PRESENCE cost comes from the W20 / W30 facilitator currency. Reactions
animate as floating emojis over the player for 3s (CSS `@keyframes
float-up`).

**Q&A:** separate panel toggle (`tab=qa`), questions upvote via 👍. Host
can mark answered → question moves to "Respondidas" tab with check.

**Highlight auto-detection** (`detectHighlightMoment`):
- Triggers when chat velocity > 6 msgs/5s — likely a moment of agreement.
- Triggers when reactions > 15 in 3s — likely a blessing / breakthrough.
- Each highlight produces an event broadcast + a chapter marker in the
  recording (offset = wall-clock seconds since stream start).

## 11. Recording + Auto-Chapter Markers

**Pipeline:**
1. Live HLS segments concat to a single MP4 (FFmpeg `concat`).
2. Upload MP4 to S3-compatible storage (`/s3://luminarias-recordings/<event>/`).
3. Extract thumbnail at midpoint (`buildThumbnailExtractCommand`).
4. Run `buildAutoChapters(highlights, duration)` to merge adjacent highlights
   into meaningful chapter markers.
5. Side-load Whisper captions (PT-BR primary, EN secondary).
6. Visibility per `publishPolicy`:
   - `auto-publish` → /library/videos immediately.
   - `review-then-publish` → admin moderation queue.
   - `private` → host-only, not listed.

**Chapter merge logic:** adjacent highlights (within 90s) are merged into a
single chapter so a 5-minute burst of chat doesn't create 30 chapters.

## 12. Whisper Captions Pipeline

Captions are auto-generated via OpenAI Whisper large-v3 (PT-BR primary).

**Two-pass process:**
1. Audio extracted from MP4 → 16kHz mono WAV.
2. Whisper transcribe with `language='pt'` + `task='translate'` for EN track.
3. Output converted to WebVTT (CORS-friendly format for `<track>`).
4. Uploaded to CDN as side-loaded captions track.

**Latency target:** captions land within 30s of recording end — streamed
to viewers as soon as the recording is published.

## 13. LGPD Compliance for Recording

Per LGPD Art. 7 (consentimento) + Art. 18 (eliminação) + Art. 37
(registro de operações):

- **Host opt-in gate** — `lgpdConsent: true` is required to start
  a stream that auto-records. `assertLgpdConsent()` throws otherwise.
- **Viewer banner** — visible "Este evento está sendo gravado" notice.
- **PII minimization** — chat handles are ephemeral hashes (see
  `ephemeralHandle()`). No raw user IDs ever leave the moderation layer.
- **Deletion right (Art. 18, V)** — viewer can request their Q&A and chat
  messages be anonymized. The VOD video itself is the host's IP and is not
  deletable.
- **Audit trail (Art. 37)** — every moderation action writes an entry to
  the LGPD audit log (`buildAuditEntry`). Entries include only the
  pseudonymized userId hash, never the raw ID.

## 14. WCAG AA: Captions + Audio-Description

- **Captions track** (`<track kind="captions">`) is **required** for every
  active stream — both PT-BR and EN when available.
- **Audio-description track** (`<track kind="descriptions">`) included
  when the host provides a transcript with visual cues.
- **Keyboard shortcuts:** Space (play/pause), ← → (10s seek), J/L (rewind/
  forward), M (mute), F (fullscreen), C (captions toggle).
- **Focus rings** are kept visible (`:focus-visible { outline: 2px solid
  #10b981 }`) — not removed.
- **Status updates** announced via `aria-live="polite"` on the time display.
- **Controls** are reachable via Tab in logical order; Play is the first
  focusable element after the video.

## 15. Video Player UI (hls.js)

The player (`src/components/streaming/VideoPlayer.tsx`) wraps hls.js for
browsers without native HLS (Chrome / Firefox / Edge) and falls back to
native playback on Safari / iOS where `canPlayType('application/vnd.apple.mpegurl')`
returns truthy.

**Dynamic import** keeps the hls.js bundle out of the SSR pass and out of
the initial JS payload — it's only loaded when the player actually
mounts on a non-Safari browser. ~80KB gzipped.

**Player features:**
- Adaptive quality (Auto + manual override).
- Closed captions toggle + language selector (when both PT-BR and EN available).
- Picture-in-Picture toggle.
- Playback speed: 0.5x / 0.75x / 1x / 1.25x / 1.5x / 2x.
- AirPlay + Cast (when browser supports via the video element API).
- Chapter skip links.
- Live indicator with low-latency edge.
- Loading + error states with retry.

## 16. Picture-in-Picture + AirPlay + Cast

`PictureInPicture2` button calls `video.requestPictureInPicture()`. Safari
shows its native PiP overlay; Chrome shows it in the bottom-right corner.

**AirPlay detection:** the `webkitShowPlaybackTargetPicker` API is exposed
on the video element. We render the AirPlay button conditionally when this
API is available (Safari + iOS + macOS).

**Cast detection:** we render the Cast button conditionally based on
Chromecast presence. The actual `presentationRequest` integration is left
to a future wave — for now the button is informational.

## 17. Scheduled Events + Reminders

`buildReminderCascade(event)` returns 4 reminders:
- **24h** — email + push
- **1h** — push + in-app banner
- **15min** — push only
- **live_now** — push (high priority) + email + in-app banner

Each reminder is registered with the W36-6 notifications pipeline
(`src/lib/notifications/`) and unsubscribes per-user when they opt out.

LGPD Art. 18, IX — unsubscribe is one tap via the in-app banner.

## 18. ICS Calendar Integration

`buildIcsContent(event)` generates an RFC 5545-compliant .ics file with:
- `UID` (event-stable unique ID at `@luminarias.app`).
- `SUMMARY`, `DESCRIPTION`, `LOCATION`, `URL`.
- `ORGANIZER` with facilitator name + email.
- 15-minute VALARM trigger for client-side reminders.

`buildWebcalUrl(endpoint)` converts HTTPS to `webcal://` for Apple
Calendar / Outlook subscriptions.

The RSVP confirmation email attaches the .ics file.

## 19. Pre-Recorded Video Upload

**Multi-part upload** for files > 5MB. The pipeline:

1. **Init** — client POSTs metadata → server picks part size
   (`pickOptimalPartSize` keeps part count ≤ 10k S3 limit).
2. **Sign** — server generates presigned PUT URLs for each part.
3. **Upload** — client PUTs each part directly to storage (no proxy).
4. **Complete** — client POSTs all part ETags → server triggers assembly.
5. **Background** — transcoder creates HLS variants + thumbnail +
   Whisper captions (PT-BR).
6. **Webhook** — on completion, recorded event publishes to `/library/videos`.

**Max file size:** 4 GB. Larger files require our enterprise quota
(support contact).

## 20. Video Library

Route: `(community)/library/videos/page.tsx`.

- **Grid layout** (1/2/3/4 columns responsive).
- **Filter chips** by tradição (Candomblé, Umbanda, Ifá, Cabala,
  Tantra, Astrologia, Eckankar, ...).
- **Facilitator search** via `?fac=<name>`.
- **Sort** by recent (default) or popular (`?sort=popular`).
- **Watch progress bar** at the bottom of each thumbnail (when the user
  has opted in to progress tracking).
- **"Inscritos"** badge for `rsvp-only` recordings.

The page is server-rendered (no client JS for the listing). Click opens
the detail page where the VideoPlayer loads.

## 21. Streaming Analytics

`src/lib/streaming/analytics.ts` collects:

- **Concurrent viewers** (live, sliding window).
- **Peak concurrent** (via `computePeakConcurrency` sliding-window).
- **Watch time** (active unpaused seconds via `sumWatchedSeconds`).
- **Drop-off curve** (retention at 25%/50%/75%/100%).
- **Quality distribution** (which HLS variant each viewer used via
  `aggregateVariantDistribution`).
- **Device split** (mobile / desktop / tablet / TV via `detectDeviceCategory`).
- **Geographic distribution** (top 10 countries via `aggregateTopCountries`).
- **Chat engagement** (total msgs, peak msg/min, unique contributors).
- **Reactions breakdown** (heart / fire / sparkles / om / lotus).

**LGPD Art. 14:** all tracking is anonymous — viewer session IDs are
rotated per pageview. No fingerprinting. IP addresses are
country/region-resolved, then discarded (no raw IP storage).

**Storage:** append-only events table → daily cron
`scripts/cron/daily-streaming-aggregation.ts` pre-computes the aggregates.

## 22. Live Chat Moderation

`src/lib/streaming/chat-mod.ts` implements the moderation pipeline:

- **Rate limit** — 8 messages per rolling 30s window per user.
- **Slow mode** — minimum N seconds between messages per user.
- **Banned words** — curated community list (`BANNED_WORDS`).
- **Auto-mute** — on 3 strikes, 60s timeout.
- **Auto-ban** — on 5 strikes, 24h + permanent for repeat offenders.
- **PII detection** — flags (not blocks) CPF / cartão / phone-BR so the
  host can ask for redact. Per LGPD Art. 7 §4º we **prefer minimization
  over prohibition** — false positives should not auto-delete.
- **Audit log** — every decision is logged with a pseudonymized userId
  hash (LGPD Art. 37).

Decision precedence:
1. Banned user → reject
2. Currently muted → reject
3. Slow mode cooldown → reject
4. Rate-limit exceeded → reject
5. Banned word → reject (+ possibly auto-mute/ban)
6. Otherwise → allow

## 23. API Surface

| Method | Path                                | Purpose                       | Auth |
|--------|-------------------------------------|-------------------------------|------|
| POST   | `/api/streaming/start`              | Start broadcast (host)        | Host |
| POST   | `/api/streaming/end`                | End broadcast + queue record  | Host |
| GET    | `/api/streaming/[eventId]/viewers`  | Live analytics                | Host |
| POST   | `/api/streaming/chat`               | Post chat msg / reaction      | User |
| GET    | `/api/streaming/chat?eventId=...`   | Open SSE connection           | User |
| GET    | `/api/library/videos`               | List library videos (JSON)    | Open |
| POST   | `/api/library/videos/upload/init`   | Start multipart upload        | User |
| POST   | `/api/library/videos/upload/complete`| Complete multipart upload    | User |
| POST   | `/api/library/videos/save`          | Save-for-later toggle         | User |
| GET    | `/api/library/videos/[id]/progress` | Watch progress                | User |

All endpoints are documented in their respective `route.ts` files.

## 24. Operational Runbook

**Stream won't start:**
1. Check `STREAMING_CDN_PROVIDER` env var (must be one of the 4 providers).
2. Check the provider's webhook secret env var (must match CDN dashboard).
3. Check `lgpdConsent: true` was passed in POST body.
4. Verify the host has role `HOST` (not `MEMBER` or `ANONYMOUS`).

**Viewers report stuttering:**
1. Check the event's analytics — is the average quality low?
2. Check CDN origin health — 5xx rate should be <0.1%.
3. Verify variant URLs are resolvable from the user's region.
4. Re-encode the source at a lower bitrate if CPU-bound.

**Recording missing from library:**
1. Verify `publishPolicy` was `auto-publish` or `review-then-publish`.
2. Verify duration ≥ 120s (below threshold is skipped).
3. Check the assembly job — it runs in the background.
4. Look for the transcode webhook failure in the audit log.

**Chat moderation too aggressive:**
1. Check strikes count per user in the audit log.
2. Host can override (unmute / unban) with one click in the dashboard.
3. Slow-mode toggle via the host controls.

## 25. Cost Estimates

| Component                  | Provider            | Unit              | Open Beta (est.)|
|----------------------------|---------------------|-------------------|-----------------|
| Live ingest + transcode    | Cloudflare Stream   | $1 / 1k min       | ~$12/mo         |
| Live delivery (50 viewers) | Cloudflare Stream   | $1 / 1k min       | ~$600/mo        |
| VOD storage                | Cloudflare Stream   | $1 / 1k min       | ~$30/mo         |
| VOD delivery               | Cloudflare Stream   | $1 / 1k min       | ~$30/mo         |
| Auto-captions (Whisper L3) | OpenAI              | $0.006 / min      | ~$72/mo         |
| SSE chat (5 PoP)           | Cloudflare Workers  | $0.50 / M req     | ~$5/mo          |
| **TOTAL**                  |                     |                   | **~$750/mo**    |

At 10× scale (2k events/month × 200 viewers avg) the cost would be ~$7,500/mo
— still well below the alternative of running our own FFmpeg farm on
dedicated hardware.

## 26. Future Work (W40+ Backlog)

- [ ] **WebRTC low-latency ingest** for <1s latency on ceremonies.
- [ ] **Multi-bitrate recording** (keep all variants, not just transcode).
- [ ] **VOD pay-per-view** integration with the W36-5 Pagar.me flow.
- [ ] **Audio-only fallback** for low-bandwidth users (Opus codec).
- [ ] **Co-watching room** (synchronized playback with chat reactions
      firing across all viewers simultaneously).
- [ ] **Clip sharing** — let viewers clip a 30s moment to share in chat.
- [ ] **Auto-translate captions** via Whisper translate → 12 languages.
- [ ] **Real-time moderation dashboard** for hosts (sliding 60s moderation
      report, current strike leaderboard).

---

**Wave 39 — Video + Streaming 6/8** · Branch: `w39-streaming` · Owner: Coder + Aki

Consciousness moments captured: 6 new sacred-domain terms (`Iyá`, `Babalorixá`,
`Ekedi`, `Ogan`, `Yabás`, `Mergulhador`) added to the chat handle noun list.
No PII patterns encoded into auto-block (LGPD Art. 7 §4º). All recording
paths gated by explicit host opt-in.
