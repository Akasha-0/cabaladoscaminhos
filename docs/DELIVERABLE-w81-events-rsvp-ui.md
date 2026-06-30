# W81-B — events-rsvp-ui — DELIVERABLE

## Status: ✅ COMPLETE

Branch: `w81/events-rsvp-ui`
Worktree: `/workspace/cabaladoscaminhos-w81b` (Note: original spec said `/tmp/w81-b` — moved to `/workspace` because the Write tool blocks `/tmp`; git operations work from either path)

## Summary

Production-grade React UI for the events RSVP lifecycle. Pure presentational
components wrap the events engine (`src/lib/events/`) with a state-machine-driven
RSVP flow, capacity meter, waitlist indicator, and a11y-live toast.

## Files (compact, single-feature)

| File | LOC | Purpose |
|------|-----|---------|
| `src/lib/w81/events-rsvp-engine.ts` | 578 | Pure logic: RSVP state machine, capacity, waitlist promotion, 7-tradition labels, HMAC audit chain |
| `src/lib/w81/events-rsvp-ui.ts` | 515 | React components: RSVPButton, WaitlistIndicator, CapacityMeter, ConfirmationToast, EventsRsvpCard |
| `src/lib/w81/events-rsvp-ui.spec.ts` | 1046 | Self-running spec harness (98 assertions) |
| `scripts/smoke/w81-events-rsvp-ui.ts` | 416 | Runtime smoke (129 checks) |
| `src/lib/w81/_vnode_recorder.ts` | 251 | Minimal React runtime stub + vnode tree walker |
| `src/lib/w81/react-types.ts` | 44 | Pure-type exports (no runtime) |
| `src/lib/w81/react-stubs.d.ts` | 82 | Ambient `declare module 'react'` for TSX compilation |
| `src/lib/w81/node-stubs.d.ts` | 56 | Ambient `declare module 'node:crypto'` + global `process`/`console`/`Promise` |
| `src/lib/w81/_react_module.ts` | 20 | Runtime re-export shim mapping `react` → `_vnode_recorder` |
| `tsconfig.w81-b.json` | 40 | Isolated TypeScript config |
| `docs/DELIVERABLE-w81-events-rsvp-ui.md` | this file | Deliverable doc |
| **Total** | **3186** | |

## Verification

| Check | Result |
|-------|--------|
| TSC (isolated config) | **0 errors** |
| Spec assertions | **98/98 PASS** |
| Smoke checks | **129/129 PASS** |
| Spec runtime | ~3s |
| Smoke runtime | ~2s |

## Mandatory patterns implemented

1. ✅ **Object.freeze** on every record, capacity view, label map, audit event
2. ✅ **Branded types** — `EventId`, `UserId`, `RsvpId`, `WaitlistToken` with regex-validated factories
3. ✅ **Discriminated union** for RSVP state with `idle | submitting | confirmed | waitlisted | rejected | cancelling | attended | no_show`
4. ✅ **Self-running spec harness** with no external framework (vitest/jest)
5. ✅ **No external deps** — pure TS + node:crypto + custom React stub
6. ✅ **7-tradition labels** — cigano / candomble / umbanda / ifa / cabala / astrologia / tantra
7. ✅ **A11Y** — `aria-live="polite"` toast, `role="progressbar"`, ARIA labels, focus states, 44px touch targets
8. ✅ **Mobile-first** — vertical layout, 44px min height, padding-tuned for thumbs
9. ✅ **State machine**: `IDLE → SUBMITTING → CONFIRMED | WAITLISTED | REJECTED` → `IDLE | CANCELLING → IDLE`

## Engine API surface

```ts
// Branded IDs
makeEventId(raw)        // throws on invalid
tryParseEventId(raw)    // returns null on invalid
makeUserId / makeRsvpId / makeWaitlistToken

// RSVP state machine
canTransition(from, to): boolean
transition(record, to, now?, strict?): RsvpTransitionResult
idleRsvp(eventId, userId): RsvpRecord
attemptSubmit(input): SubmitOutcome   // auto-resolves to confirmed/waitlisted
promoteFromWaitlist(input): PromotionOutcome

// Capacity
computeCapacity(snapshot): CapacityView

// 7-tradition labels
labelFor(tradition, kind): TraditionKindLabel | null
labelsForTradition(tradition): readonly TraditionKindLabel[]
TRADITION_KIND_LABELS   // full frozen map

// Audit chain (HMAC-SHA-256)
appendAudit(input): AuditEvent
verifyAuditChain(chain, secret): boolean
hashAuditEvent(event, secret): string

// UI helpers
ctaLabelFor(phase, isFree): string
a11yAnnounceFor(phase): string
```

## Component API

```tsx
<RSVPButton
  record={rsvp}
  isFree={true}
  disabled={false}
  onSubmit={(r) => ...}
  onCancel={(r) => ...}
  labelId="cta-1"
/>

<WaitlistIndicator
  position={3}
  total={5}
  promoted={false}
/>

<CapacityMeter view={capacityView} labelId="cap-1" />

<ConfirmationToast
  phase="confirmed"
  detail="RSVP-abc"
  liveRegionId="live-1"
/>

<EventsRsvpCard
  eventId={...}
  userId={...}
  record={rsvp}
  capacity={{ capacity: 20, confirmed: 5, waitlist: 0 }}
  isFree={true}
  tradition="cigano"
  label={...}
  title="Leitura de Cartas"
  startsAt="2026-09-14T15:00:00-03:00"
  promotedFromWaitlist={false}
  onSubmit={...}
  onCancel={...}
/>
```

## 7-tradition × event-kind matrix

| Tradition  | Kinds |
|------------|-------|
| cigano     | leitura (Cartas), prece (Prece Cigana) |
| candomble  | gira, ponto |
| umbanda    | gira (Caboclo), ponto (Riscado) |
| ifa        | mutirao, prece (Orunmilá) |
| cabala     | leitura (Árvore), prece (Meditação) |
| astrologia | leitura (Mapa), prece (Planetária) |
| tantra     | mantra, prece (Kundalini) |

## A11Y coverage

- RSVPButton: `aria-disabled`, `aria-busy`, `aria-describedby`, `aria-label` via `ctaLabelFor`
- WaitlistIndicator: `role="status"`, `aria-live="polite"`, `data-position` for testing
- CapacityMeter: `role="progressbar"`, `aria-valuemin/max/now`, `aria-labelledby`
- ConfirmationToast: `role="status"`, `aria-live="polite"`, `aria-atomic="true"`, off-screen position when no announcement
- EventsRsvpCard: wraps all 4 components in `<article>` with `data-*` testing hooks

## Mobile-first design

- 44px min height on every interactive element (WCAG 2.5.5)
- 16px font size (no iOS zoom on focus)
- Vertical flex layout (column direction)
- Border-radius 8px (touch-friendly)
- Padding 12-16px (thumb-friendly tap zones)
- Full-width within container, max-width 420px (single-column mobile)

## How to run

```bash
# Type check
tsc --noEmit -p tsconfig.w81-b.json

# Spec (self-running)
node --experimental-strip-types --no-warnings src/lib/w81/events-rsvp-ui.spec.ts

# Smoke
node --experimental-strip-types --no-warnings scripts/smoke/w81-events-rsvp-ui.ts
```

## Cycle 80 lessons applied (carryover)

- Vnode recorder pattern (cycle 80 W80-B/D) for component testing without DOM
- Spec harness with module-level `beforeEach` reset
- Branded ID factories with regex prefix
- `Object.freeze` on every record
- 7-tradition coverage
- Self-running assertions, no vitest
- `noUncheckedIndexedAccess` strict mode

## New lessons (cycle 81)

See "5 NEW lessons" section in parent report.

## Cycle 80 carryover that did NOT apply

- `.tsx` runtime: Cycle 80 lessons said Node 22 doesn't load `.tsx` under `--experimental-strip-types`. We worked around this by writing the UI in `.ts` (using `createElement()` only — no JSX syntax). This is more portable but loses the JSX DX. Trade-off accepted: portability > DX for a worktree-deliverable.

## Next-step recommendations

1. **Real React integration**: drop the stubs, install `@types/react`, point tsconfig `paths` at `node_modules/react`.
2. **Page adapter**: write `app/eventos/[slug]/page.tsx` that wires `EventsRsvpCard` to the events mock + a real `useRSVP` hook.
3. **API contract**: implement `/api/rsvp` POST + GET endpoints using the engine's pure functions; the UI stays unchanged.
4. **Persistence**: hook `appendAudit` into a Postgres ledger table for LGPD compliance.
5. **WebSocket promotion**: stream `promoteFromWaitlist` events so the waitlist indicator updates in real-time.