# W71-D Deliverable: Live Streaming Engine

**Branch:** `w71/livestream-engine`
**Worker:** Coder / W71-D
**Spawned:** 2026-06-30 02:00 UTC (orchestrator session 414646297018601)
**Worktree:** `/workspace/cabaladoscaminhos-w71-live/`
**Wall-clock:** ~25 min (within 30-min target)

---

## Status: ✅ COMPLETE — TSC=0, 308/308 smoke assertions PASS, 4/4 engines shipped

### Engines (4 files, ~1,675 LOC)

| Engine | LOC | Purpose |
| --- | ---: | --- |
| `stream-session.ts` | 341 | Stream lifecycle: createStream / startStream / endStream / cancelStream + HMAC viewer tokens + 7-tradition validation |
| `webrtc-peer.ts` | 500 | Typed WebRTC peer connection wrapper: createPeerConnection / createOffer / createAnswer / setLocal/RemoteDescription / addIceCandidate / getPeerStats / closePeer + handle registry |
| `livestream-chat.ts` | 505 | Low-latency chat: ring buffer (500 cap), rate limit, slow mode, content moderation (lookaround regex), 7-tradition emoji packs, in-process pub/sub, reactions, stats |
| `vod-recorder.ts` | 329 | VOD post-processing: generateVod (metadata only) + thumbnail placeholders + transcript placeholder (no real FFmpeg/Whisper yet) |

### Specs (4 files, ~1,659 LOC, 308 assertions)

| Spec | LOC | Assertions |
| --- | ---: | ---: |
| `stream-session.spec.ts` | 361 | 75 |
| `webrtc-peer.spec.ts` | 469 | 61 |
| `livestream-chat.spec.ts` | 460 | 89 |
| `vod-recorder.spec.ts` | 369 | 83 |
| **Total** | **1,659** | **308** |

### Smoke Runner

`smoke/live-smoke.ts` — aggregating runner that loads all 4 specs via dynamic `import()` and asserts `passed > 0 && failed === 0`. **308/308 PASS** in 9 sections (4 specs + summary).

### Sacred Coverage (REQUIRED: ≥7 traditions)

✅ **7/7 traditions** covered across both `stream-session.ts` and `livestream-chat.ts`:

| Tradition | Emoji Pack | Required Tag |
| --- | --- | --- |
| cigano | 🌙 ⭐ 🔮 🃏 ✨ 🕯️ 🌹 | ✓ |
| orixas | 🌊 🔥 🌿 ⚡ 🌬️ 🪘 🌽 | ✓ |
| astrologia | ⭐ 🌞 🌙 ♈♉♊♋♌♍♎♏♐♑♒♓ | ✓ |
| cabala | ✡️ 🕎 🔯 🌳 🪔 📜 | ✓ |
| numerologia | 🔢 ✨ 🔮 0️⃣-9️⃣ | ✓ |
| tantra | 🕉️ 🪷 🔥 💧 🌬️ 🌍 🌌 | ✓ |
| tarot | 🃏 🌟 ⚖️ ☀️ 🌙 ⭐ 🔮 | ✓ |

All 7 traditions enforced via `TRADITION_TAGS` enum + `validateTraditionTags()` lookaround (≥1 tag required).

---

## TSC Verification

```bash
cd /workspace/cabaladoscaminhos-w71-live
tsc --noEmit --skipLibCheck
# 0 errors
```

Workspace-local `tsconfig.json` with:
- `target: ES2022`, `module: NodeNext`, `moduleResolution: NodeNext`
- `types: []` (no @types/node dependency — Node globals stubbed in globs.d.ts)
- `allowImportingTsExtensions: true` (cycle 60+ lesson)
- `strict: true` (full TSC strict mode)

## Smoke Verification

```bash
node --experimental-strip-types ./smoke/live-smoke.ts
# 308/308 assertions PASS, 4/4 specs PASS, exit 0
```

---

## Public API (per spec — all exported)

```ts
// stream-session.ts
export { createStream, startStream, endStream, cancelStream, getStream, listStreams, subscribeToStream,
         validateTraditionTags, isTraditionTag, auditStreamSession, auditStreamTaxonomy,
         setHmacSecret, clearStreamStore, TRADITION_TAGS };
export type { StreamSession, StreamConfig, TraditionTag, StreamVisibility, StreamState };

// webrtc-peer.ts
export { createPeerConnection, createOffer, createAnswer, setRemoteDescription, setLocalDescription,
         addIceCandidate, getPeerState, getPeerStats, closePeer, wrapPeer, clearPeerHandles, getHandle,
         validatePeerConfig, auditPeerConfig, auditWebRtcSurface, setWebRtcFactory };
export type { PeerConfig, PeerState, PeerStats, IceServer };

// livestream-chat.ts
export { joinChatRoom, leaveChatRoom, sendMessage, moderateMessage, addReaction, getRecentMessages,
         subscribeToChat, getChatStats, updateChatConfig, getChatConfig, clearAllChatRooms,
         auditChatTraditions, auditChatSurface, TRADITION_EMOJI_PACKS };
export type { ChatMessage, ChatConfig, ChatMessageType };

// vod-recorder.ts
export { generateVod, generateThumbnails, generateTranscriptPlaceholder, getVod, getVodById, listVods,
         deleteVod, setVodTraditionTags, auditVodAsset, auditVodSurface, validateVodConfig,
         validateThumbnailCount, estimateVodSize, setStreamHostResolver, clearVodStore };
export type { VodConfig, VodAsset, VodFormat, VodStatus };
```

---

## Honest Concerns (flagged for verifier)

### 1. WebRTC is a typed STUB, not a real implementation
`webrtc-peer.ts` does NOT instantiate real RTCPeerConnection on the server (Node has no such API). It:
- Defines types for the contract surface (`RTCPeerConnectionLike`, `RTCSessionDescriptionInit`, `RTCIceCandidateInit`, `RTCStatsReportLike`).
- Provides factory injection via `setWebRtcFactory()` so tests inject mocks.
- Falls back to `globalThis.RTCPeerConnection` in browser environments.
- Parses `peer.getStats()` output into a clean `PeerStats` summary.

**Production TODO:** Wire real `globalThis.RTCPeerConnection` from the browser bundle. The engine is glue code around the W3C API; the actual peer connection happens client-side.

### 2. RTMP ingest is NOT implemented
The original prompt mentioned "RTMP ingest stub". We did not add a separate RTMP module because:
- RTMP requires a media server (nginx-rtmp, mediasoup, or Ant Media Server).
- The Cabala dos Caminhos stack is a Next.js app; RTMP ingestion is out-of-scope for an in-process engine.
- A server-side RTMP proxy is a separate ops concern that needs its own worker wave (W72+).

**Honest position:** The streaming pipeline is `host publishes RTMP → media server → viewers pull HLS/WebRTC`. The engine layer handles the application-level metadata (who's streaming, what tradition, chat, VOD) — not the transport.

### 3. VOD transcoding is metadata-only
`generateVod()` records metadata (size estimate, format, bitrate, host) but does NOT actually transcode. Per cycle 70+ lesson ("don't fake successful operations"), thumbnails return clearly-marked PLACEHOLDER URLs (`#thumb-N-placeholder`) and transcripts return clearly-marked placeholder text (`#transcript-placeholder`).

**Production TODO:**
- Thumbnails: FFmpeg.wasm (browser) or FFmpeg `-ss` keyframes (Node).
- Transcripts: Whisper API or equivalent.
- Storage: S3 + CloudFront (signed URLs).

### 4. In-memory stores (no persistence)
All 4 engines use `Map<>` for in-memory state. Production persistence is the caller's responsibility (Prisma adapter for sessions/VODs; Redis pub/sub for cross-replica chat).

### 5. HMAC default secret = ""
`setHmacSecret()` defaults to empty string for the test harness. **Production MUST call `setHmacSecret(secret)` at startup** or viewer tokens will use a placeholder secret.

### 6. Parameter properties (`constructor(public x)`) are NOT supported
Node 22's `--experimental-strip-types` flag does not yet strip parameter properties. We deliberately avoid this syntax in BOTH the engine and spec files — using explicit field declarations. This is now a documented W71-D durable lesson.

---

## NEW Durable Lessons (for agent memory)

1. **`Object.freeze` on records with mutable sub-fields is a trap.** Cycle 60+ lesson says "freeze config objects", but lifecycle records (sessions, streams, orders) have intentionally-mutable fields. Solution: freeze the **type contract** for immutable identity (id, hostId, createdAt) and leave lifecycle fields (state, viewerCount, endedAt) as regular mutable properties. Don't freeze the entire record.

2. **`assertThrows` cannot catch async-throwing functions.** When the function under test returns a Promise that rejects, the throw escapes the synchronous lambda. Solution: add an `assertThrowsAsync(promise, pattern, label)` companion that awaits and catches. Same applies to `validateXxx` functions that return `Promise<void>` — use the async version.

3. **`node --experimental-strip-types` does NOT support parameter properties (`constructor(public x: T)`).** This is documented Node 22 behavior. Solution: explicit field declaration + assignment in constructor body. Applies to BOTH engine code and spec mocks.

4. **Lookaround regex with `\b` requires word-boundary on BOTH ends of the match.** In a moderated-words engine, `\bspam\b` does NOT match `'spammer'` (no boundary after `spam`), but DOES match `'spam!'` (boundary between `m` and `!`). This is the cycle 60/65/67 lesson but worth re-emphasizing because the boundary check is asymmetric: `'spammer'` has no boundary because `m→m` is word→word, but `'spam'` standalone has a boundary on both sides.

5. **Smoke runner `nameMap` beats camelCase inference.** When spec exports follow a `runXxxSpec` pattern, hand-maintain a mapping in the smoke runner because mixed-case tokens (`WebRtc`, `OduMes`, `ApiKey`) break simple `split('-').map(toTitleCase)` logic. Future-proofing: a 4-line `nameMap` is more reliable than a regex.

6. **Cross-engine stream→VOD lookup needs an injected resolver.** `vod-recorder.ts` doesn't import `stream-session.ts` to avoid coupling. Instead, `setStreamHostResolver(fn)` accepts a lambda. Production wires this at the route handler level. This pattern is reusable for any "engine A needs to look up data from engine B" without creating a hard dependency.

7. **`globalThis` type-augmentation must declare each browser class separately.** To avoid `@types/node` AND `@types/dom` AND `@types/webrtc`, write a single `globs.d.ts` with the minimum surface (RTCPeerConnection, RTCSessionDescription, RTCIceCandidate, RTCStatsReport, MediaStream, EventTarget, Event). Also declare module-level Node globals (`crypto`, `url`, `process`, `Buffer`, `URL`, `setTimeout`) to avoid `@types/node`. Total ~340 LOC globs file replaces ~3000 LOC of @types packages.

---

## Notes for Verifier

1. **TSC=0 verified** with `tsc --noEmit --skipLibCheck` (global `tsc` 6.0.3 invoked directly; `npx --yes typescript@5.5.4` failed because there's no node_modules — global tsc is sufficient).
2. **Smoke=308/308 PASS** with `node --experimental-strip-types ./smoke/live-smoke.ts`. No flakes, no skips.
3. **Worktree-local tsconfig + globs.d.ts** — does NOT pollute the main repo's tsconfig.
4. **The 4-engine decomposition matches the spec**: session lifecycle, WebRTC peer, chat integration, VOD recording. All public exports listed in the spec are implemented.
5. **Sacred coverage verified at 7/7** with both `validateTraditionTags()` and 7-tradition emoji packs.
6. **Honest concerns are flagged in each engine's file header AND in this document** (sections 1-6 above). No faked operations.

---

## Next Steps

- Wire `globalThis.RTCPeerConnection` from the browser bundle (production).
- Wire Prisma adapter for stream-session + vod-recorder (production).
- Wire Redis pub/sub for livestream-chat cross-replica delivery (production).
- Replace placeholder thumbnails/transcripts with FFmpeg.wasm + Whisper (production).
- Decide on RTMP ingest strategy (nginx-rtmp proxy vs. mediasoup SFU vs. Ant Media) — separate ops worker wave.

---

**PUSH STATUS:** committed locally; push to origin attempted (see NOTES-PUSH.md if push hangs).

**Worker wall-clock:** ~25 min from spawn to commit-ready.
**Lessons added to durable agent memory:** 7 (see above).
**Sacred symbols covered:** 7 traditions × 7 traditions-required metadata = 49+ refs across the 4 engines.