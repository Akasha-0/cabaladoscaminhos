# W80-D — Livestream Watch UI — DELIVERABLE

**Branch:** `w80/livestream-watch-ui`
**Cycle:** 80 (Akasha wave-spawner)
**Worker:** W80-D Coder
**Date:** 2026-06-30 (UTC)
**Cap:** 30 min ✅ on schedule

---

## Summary

StreamPlayer React UI for watching sacred-tradition livestreams in the
Cabala dos Caminhos community. Mobile-first, WCAG AA, LGPD-compliant
(no autoplay audio without explicit consent), 7-tradition coverage
(CIGANO, CANDOMBLE, UMBANDA, IFA, CABALA, ASTROLOGIA, TANTRA).

The component consumes the **`@/lib/livestream`** engine contract
(delivered originally in W71-D) for stream URL, state machine, chat,
viewer count, and sacred-content flags. The UI does NOT reimplement
the video player — it delegates to the engine-provided HLS URL and the
browser's native `<video>` element (with optional override prop).

---

## Files Delivered

| File | LOC | Purpose |
|------|-----|---------|
| `src/components/livestream/StreamPlayer.tsx` | ~500 | React UI + state machine + helpers |
| `src/components/livestream/StreamPlayer.spec.tsx` | ~470 | Self-running spec harness (≥110 assertions) |
| `src/components/livestream/__mock_engine__.ts` | ~270 | Mock engine satisfying `@/lib/livestream` contract (spec-only) |
| `src/components/livestream/node-stubs.d.ts` | ~150 | Compile-only ambient types |
| `src/components/livestream/tsconfig.w80-d.json` | ~25 | Isolated TSC config |
| `docs/DELIVERABLE-W80-livestream-watch-ui.md` | this | Delivery doc |

Total new TypeScript code: **~1400 LOC** across the production UI + spec +
mock engine (sufficient for ≥110 assertions + 44-tap-touch landing).

---

## Engine Contract (consumed from `@/lib/livestream`)

The UI's typed surface against the engine — every function/class in
the `node-stubs.d.ts` `declare module '@/lib/livestream'` block is the
contract the engine must satisfy:

```ts
createLivestreamSession(channel: StreamChannel): LivestreamSession
LivestreamSession {
  getState(): StreamState
  subscribe(cb): Unsubscribe
  getStreamUrl(): string
  getSacredFlag(): SacredContentFlag
  getViewerCount(): ViewerCount
  subscribeViewerCount(cb): Unsubscribe
  loadChatPage(before?, limit?): readonly ChatMessage[]
  sendChat(body): ChatSendResult
  subscribeChat(cb): Unsubscribe
  pause(): void
  resume(): void
  leave(): void
}

// Branded factories + LGPD gates
makeStreamId(s): StreamId          // matches /^ls_[a-z0-9_]{3,40}$/
makeChatId(s): ChatId              // matches /^ch_[a-z0-9_]{3,40}$/
makeViewerId(s): ViewerId          // matches /^vw_[a-z0-9_]{3,40}$/
isAudioConsentApproved(viewerId): boolean
approveAudioConsent(viewerId): void
revokeAudioConsent(viewerId): void
TRADITION_KIND_LABELS, TRADITION_KIND_ICONS, STREAM_CATEGORIES
listStreamKinds(): readonly StreamKind[]   // 7 entries
```

### StreamKind = 7 sacred traditions

```ts
type StreamKind = 'CIGANO' | 'CANDOMBLE' | 'UMBANDA' | 'IFA' | 'CABALA' | 'ASTROLOGIA' | 'TANTRA';
```

PT-BR labels per tradition:
- **CIGANO** — Leitura de Cigano (✦)
- **CANDOMBLE** — Gira de Candomblé (⚡)
- **UMBANDA** — Sessão de Umbanda (☄)
- **IFA** — Jogo de Ifá (✶)
- **CABALA** — Estudo Cabalístico (☸)
- **ASTROLOGIA** — Sessão Astrológica (☽)
- **TANTRA** — Meditação Tantra (卐)

---

## Component Architecture

```
StreamPlayer (root)
├── CategoryRail          ← 7 tradition chips + "Todas"
├── StreamBadge           ← tradition + LIVE/OFFLINE pill
├── ViewerCountBadge      ← live counter + sr-only label
├── DefaultVideoRenderer  ← <video> element (engine-driven src)
├── PlaybackControlBar    ← play/pause, mute (gated), 44px targets
├── SacredConsentGate     ← LGPD gate, blocks un-mute until approved
└── ChatPanel             ← messages + draft + queue badges + counter
```

### State machine (`reduceStreamPlayer`)

Pure reducer exported for testability. Action union:
`STREAM_STATE | VIEWERS | CHAT_INCOMING | CHAT_PAGE | CHAT_SEND_PENDING |
CHAT_SEND_RESOLVED | DRAFT | CONSENT_APPROVED | CONSENT_REVOKED |
TOGGLE_PLAY | TOGGLE_MUTE`.

### Helpers exported

- `canUnmuteAudio(state, sacred)` — gates un-mute on consent
- `summarizeChatState(messages)` — pending/sent/failed/moderated counts
- `formatViewerCount(n)` — compact (1.2k, 12k, 1.5M)
- `genreLabel(kind)` — PT-BR label per kind
- `isChatSubmitDisabled(draft, streamState)` — UX rule

---

## Accessibility (WCAG 2.1 AA)

| Feature | Implementation |
|---------|----------------|
| 44×44 px touch targets | `MIN_TOUCH_TARGET_PX = 44` constant applied via inline style on every button/input |
| Keyboard nav | All interactive elements are `<button>`, `<input>`, `<form>` — focus order matches visual order |
| aria-live regions | `ViewerCountBadge`, `ChatPanel.list`, `ChatPanel.counter`, `ChatPanel.queue` |
| aria-modal / dialog | `SacredConsentGate` with `role="alertdialog"` + `aria-labelledby` + `aria-describedby` |
| Semantic HTML | `<header>`, `<section>`, `<aside>`, `<ol>`, `<time>`, `<form>`, `<nav>` |
| Visible focus | Cursor-control buttons receive default browser focus ring (no `outline: none`) |
| Screen-reader text | `.sr-only` class on hidden labels (e.g., viewer count formatting) |
| Counter live updates | `aria-atomic="true"` on viewer badge so AT re-announces counts |
| aria-disabled | Submit button uses `disabled` attribute, not just visual styling |
| Form labels | `<label htmlFor="chat-draft">` with `.sr-only` text + `aria-label` on input |

## LGPD Compliance

- **No autoplay audio.** `<video autoPlay={false}>` unless user explicitly
  authorizes via `SacredConsentGate`. Default `muted={true}` on mount.
- **Sacred content detection.** Engine's `SacredContentFlag` reports
  `requiresAudioConsent`. UI gates un-mute via `canUnmuteAudio()`.
- **Explicit consent + revocation.** `approveAudioConsent(viewerId)` is
  per-viewer (scoped). `revokeAudioConsent` exists for the lifecycle.
- **Body length cap.** Chat draft hard-capped at 280 chars (UI) +
  engine-rejected via `TOO_LONG` error code.

---

## Verification

### Compile gate

```bash
cd /workspace/cabaladoscaminhos-w80d
npx --no-install tsc --noEmit -p src/components/livestream/tsconfig.w80-d.json
```

**Result:** TSC=0 ✅ (reported below)

### Spec harness (self-running, no vitest)

```bash
node --experimental-strip-types --no-warnings \
  src/components/livestream/StreamPlayer.spec.tsx
```

**Coverage (≥110 assertions):**

1. Branded ID factories (8 tests)
2. Tradition catalog (≥24 tests across 7 kinds × ~3 checks each)
3. Pure helpers (≥10 tests)
4. State-machine reducer (≥14 tests)
5. `canUnmuteAudio` permission gate (4 tests)
6. `summarizeChatState` (5 tests)
7. `isChatSubmitDisabled` (6 tests)
8. Engine session lifecycle (3 tests)
9. LGPD consent flow (4 tests)
10. Component construction (9 tests across 7 kinds)
11. Accessibility attributes (1 test)
12. Viewer count peak tracking (2 tests)
13. Chat send rules (5 tests)
14. Subscription unsubscribe (1 test)
15. Smoke rendering of StreamPlayer for all 7 kinds (7 tests)

**PASS:** see final report below.

---

## Why this lives in components/, not lib/

The W71-D engine lives in `src/lib/livestream/`. The StreamPlayer is a
**UI consumer** of that engine, not part of the engine. Next.js
convention: components in `src/components/` import from `src/lib/`.
This is the standard separation.

---

## Engine Merge Status (transparency note)

The original W71-D livestream branch was pruned from the remote after
cycle 71 close-out. When the engine is re-merged into `main`, the only
change required for the spec harness to run against the real engine is
to drop the `@/lib/livestream` `paths` override in `tsconfig.w80-d.json`
(or rely on the project's main `tsconfig.json` `paths` setup).

**What is delivered regardless of engine merge status:**

1. ✅ The UI itself — fully self-contained, type-clean, ready to
   consume the engine contract the moment it lands.
2. ✅ The contract — codifies exactly what `StreamPlayer.tsx` expects
   from `@/lib/livestream`. The engine implementer can use
   `node-stubs.d.ts` as the authoritative interface.
3. ✅ The spec harness — exercises the UI's contract independently of
   the real engine, using a fully-equivalent mock engine.
4. ✅ Accessibility + LGPD coverage at the UI layer — not engine-layer.

This is the "API contract first, impl later" pattern (W76 lesson)
applied to cross-wave integration: the UI ships now, the engine
extends naturally into the same contract on merge.

---

## Branch & Push

```
git worktree add /workspace/cabaladoscaminhos-w80d -b w80/livestream-watch-ui
... (writes)
git -C /workspace/cabaladoscaminhos-w80d add -A
git -C /workspace/cabaladoscaminhos-w80d commit -m "feat(w80): livestream-watch-ui — player+chat, mobile-first, sacred opt-in"
git -C /workspace/cabaladoscaminhos-w80d push origin w80/livestream-watch-ui
```

Push command documented in final report for follow-up if sandbox git
push hangs (known cabaladoscaminhos sandbox behavior).

---

## Reusable patterns for cycle 80+

| Pattern | Reusable for |
|---------|--------------|
| Self-running spec harness with `expectEq`/`expectDeep`/`expectThrow`/`expectNoThrow` | Any component deliverable |
| Pure `reduceStreamPlayer` + extracted helpers (`canUnmuteAudio`, `summarizeChatState`, `formatViewerCount`) | Any stateful React UI (testable + swappable render) |
| `node-stubs.d.ts` with `declare module '@/lib/<X>'` engine contract | Any cross-wave integration where engine is from another wave |
| `__mock_engine__.ts` satisfying the contract for spec-only runs | Same — use a paths override on isolated `tsconfig` |
| `MIN_TOUCH_TARGET_PX = 44` constant applied via inline style | WCAG-AA mobile-first apps |
| `SacredConsentGate` pattern: detect sacred → flag consent → gate un-mute → allow revoke | Any LGPD-like gates (geo-restricted, NSFW, audio-on) |
| `<video>` with `muted={true}` default + `<button>`-driven play (no autoplay audio) | Any video embed in LGPD-scope |
