# DELIVERABLE — W80-B events-rsvp-ui

**Cycle**: 80 · Wave spawner
**Worker**: W80-B (Coder)
**Session ID**: 414727418691769
**Branch**: `w80/events-rsvp-ui`
**Date**: 2026-06-30 07:34 UTC
**Status**: ✅ DELIVERED (TSC=0, 64/64 spec, 58/58 smoke)

---

## TL;DR

UI component for confirming presence (RSVP) on events from the
`events-workshops` engine (delivered as part of W73-A, with the API endpoint
`/api/events/[id]/rsvp` shipped in W21). The component is **pure presentational**:
all mutations flow through an `onSubmit` callback that the parent page wires to
the API endpoint. State is owned by the parent (`currentRsvp`), with the
component only tracking optimistic `pending` UI state.

| Metric | Value |
|---|---|
| Branch | `w80/events-rsvp-ui` |
| Files created | 9 |
| Total LOC | 2184 |
| Spec PASS | 64/64 |
| Smoke PASS | 58/58 |
| TSC errors | 0 |
| Touch target | ≥44px (WCAG 2.5.5) |
| 7-tradition coverage | ✅ CIGANO, ORIXÁS, ASTROLOGIA, CABALA, TANTRA, UMBANDA, IFÁ |
| a11y | aria-label, aria-live, role=group, focus-visible:ring, keyboard nav |

---

## Files Created

```
src/components/events/
├── RSVPForm.helpers.ts       326 LOC  — pure logic (label mappings, capacity math, transitions)
├── RSVPForm.ts               481 LOC  — React component (pure presentational)
├── RSVPForm.spec.ts          777 LOC  — 64 self-running assertions
├── _react_stub.ts            215 LOC  — minimal React runtime for isolated spec
├── _vnode_recorder.ts        129 LOC  — vnode tree capture utility
├── node-stubs.d.ts           110 LOC  — TS types (compile-only)
└── index.ts                    7 LOC  — existing barrel
scripts/smoke/
└── w80-b-events-rsvp.ts      110 LOC  — 58 runtime smoke checks
tsconfig.w80-b.json            29 LOC  — isolated compiler config
docs/DELIVERABLE-W80-events-rsvp-ui.md  (this file)
```

Total: 9 files, 2184 LOC.

---

## Public API

### Component (`RSVPForm.ts`)

```ts
export interface RSVPFormProps {
  readonly eventId: string;
  readonly eventTitle: string;
  readonly tradition: string;       // 7 keys or free string
  readonly eventType: string;       // 4 keys or free string
  readonly confirmedCount: number;
  readonly capacity: number;        // 0 = unlimited
  readonly currentRsvp: RsvpState;  // 'going' | 'maybe' | 'declined' | null
  readonly isAuthenticated?: boolean;
  readonly loginRedirect?: string;
  readonly eventClosed?: boolean;
  readonly onSubmit?: (target: Exclude<RsvpState, null>) => void | Promise<void>;
  readonly onError?: (error: Error) => void;
  readonly onLoginRequest?: () => void;
  readonly onConfirmRequest?: (target: Exclude<RsvpState, null>, transition: ReturnType<typeof deriveRsvpTransition>) => boolean | Promise<boolean>;
  readonly variant?: 'default' | 'compact';
  readonly locale?: 'pt-BR' | 'en';
  readonly id?: string;
  readonly className?: string;
  readonly __testIsPending?: boolean;
}

export function RSVPForm(props: RSVPFormProps): React.ReactElement;
```

### Pure helpers (`RSVPForm.helpers.ts`)

```ts
// Types
type TraditionId = 'cigano' | 'orixas' | 'astrologia' | 'cabala' | 'tantra' | 'umbanda' | 'ifa';
type EventTypeId = 'workshop' | 'ritual' | 'study-circle' | 'meditation';
type RsvpState = 'going' | 'maybe' | 'declined' | null;
type RsvpTransition = { next, announcement, requiresConfirm, willMutate };
type CapacityDisplay = { label, confirmed, capacity, remaining, percent, isFull };
type RsvpButtonAvailability = 'available' | 'current' | 'waitlist_required' | 'event_closed';

// Constants
const TRADITION_LABEL: Readonly<Record<TraditionId, string>>;     // 7 keys
const TRADITION_IDS: ReadonlyArray<TraditionId>;                  // canonical order
const EVENT_TYPE_LABEL: Readonly<Record<EventTypeId, string>>;    // 4 keys
const RSVP_STATE_LABEL: Readonly<Record<..., string>>;           // + logged_out
const RSVP_STATE_LABEL_ACTIVE: Readonly<Record<..., string>>;
const RSVP_STATE_ICON: Readonly<Record<..., string>>;

// Pure functions
function isTradition(s: string | null | undefined): TraditionId | null;
function isEventType(s: string | null | undefined): EventTypeId | null;
function traditionLabel(t: string | null | undefined): string;
function eventTypeLabel(t: string | null | undefined): string;
function buildCapacityDisplay(confirmed: number, capacity: number): CapacityDisplay;
function deriveRsvpTransition(current: RsvpState, target: Exclude<RsvpState, null>): RsvpTransition | { error: string };
function buildRsvpAnnouncement(transition: RsvpTransition, capacity: CapacityDisplay): string;
function getButtonAvailability(current: RsvpState, target: Exclude<RsvpState, null>, capacity: CapacityDisplay, eventClosed: boolean): RsvpButtonAvailability;
function defaultRsvpState(): Exclude<RsvpState, null>;
```

---

## RSVP Behavior (state machine)

The component renders 3 buttons (going / maybe / declined) and one
`current state indicator` whenever `currentRsvp !== null`.

| Current → Target | willMutate | requiresConfirm | UX outcome |
|---|---|---|---|
| `null → going` | yes | no | normal POST |
| `null → maybe` | yes | no | normal POST (lista de espera) |
| `null → declined` | yes | no | normal POST |
| `going → going` | no | no | NOOP (announces "já está como…") |
| `going → maybe` | yes | **yes** | calls `onConfirmRequest` — cancela presença? |
| `going → declined` | yes | **yes** | calls `onConfirmRequest` — cancela presença? |
| `maybe → going` | yes | no | promoção sem confirmação (host aceita) |
| `maybe → maybe` | no | no | NOOP |
| `maybe → declined` | yes | no | sair da lista de espera |
| `declined → going` | yes | no | ressuscitar sem confirmação |
| `declined → maybe` | yes | no | mudar para lista de espera |
| `declined → declined` | no | no | NOOP |

When the event is full and target is `going`, the button is **disabled**
(availability=`waitlist_required`) — user must use `maybe` (lista de espera).

---

## Capacity Display

`buildCapacityDisplay(confirmedCount, capacity)` produces a `CapacityDisplay`:

| Scenario | Label | Remaining | Percent |
|---|---|---|---|
| Unlimited (capacity=0) | "Sem limite de vagas" | `null` | `null` |
| Empty (0/N) | "0/N vagas" | N | 0 |
| Normal (14/20) | "14/20 vagas" | 6 | 70 |
| Last 3 vagas (17/20) | "3 vagas restantes · 17/20" | 3 | 85 |
| Last 1 vaga (19/20) | "Última vaga · 19/20" | 1 | 95 |
| Lotado (20/20) | "Lotado · 20/20" | 0 | 100 |
| Over-capacity (25/20) | clamped to "Lotado" | 0 | 100 (clamped) |
| Negative input | sanitized to 0 | N | 0 |

All return values are `Object.freeze`'d (cycle 75 lesson #6).

---

## 7-Tradition Coverage

Each tradition has a canonical pt-BR label and is rendered in the form header:

| Key | Label |
|---|---|
| `cigano` | Baralho Cigano |
| `orixas` | Orixás |
| `astrologia` | Astrologia |
| `cabala` | Cabala |
| `tantra` | Tântrica |
| `umbanda` | Umbanda |
| `ifa` | Ifá |

Spec SECTION 8 covers all 7 with smoke render tests (one per tradition).

---

## Accessibility (WCAG AA)

| Feature | Implementation |
|---|---|
| `aria-label` on every button | `${label} — ${eventTitle}` (includes context) |
| `role="group"` on button container | + `aria-label="Ações de inscrição"` |
| `aria-live="polite"` live region | announces transitions + capacity context |
| `aria-pressed` on current state | toggles on the active button |
| `aria-describedby` | hidden description nodes with vagas restantes info |
| `aria-labelledby` on fieldset | legend hidden but linked |
| Touch target | `min-h-[44px]` on every button (WCAG 2.5.5) |
| Focus ring | `focus-visible:ring-3 focus-visible:ring-{color}/60` per variant |
| Keyboard nav | native `<button type="button">` — Tab + Enter/Space |
| Disabled state | `disabled` attr + `aria-disabled` semantically |
| Live region announce | "Status atualizado para X. Y vagas restantes." |
| Login CTA | full button label "Entrar para participar — {title}" |

---

## Integration with existing engine API

The component does NOT reimplement the engine. It calls `/api/events/[id]/rsvp`
(via the parent's `onSubmit` callback) using the same 3-state enum already in
the Prisma schema:

```prisma
enum EventRsvpStatus {
  GOING       // confirmou presença
  MAYBE       // marcou interesse, sem confirmar
  DECLINED    // recusou explicitamente
}
```

The component's "lista de espera" UX maps to `MAYBE` — the host promotes
`MAYBE → GOING` when a slot opens. This matches the engine's existing
`setRsvpStatus` (W21) which already handles:
- `EventFullError` → 409 when capacity exceeded (component shows `waitlist_required`)
- `EventAlreadyStartedError` → 409 after startsAt
- `EventHostCannotChangeRsvpError` → 409 if host tries to change RSVP
- Idempotent: re-submitir o mesmo status retorna `changed: false`

---

## Patterns Applied (cycle 60-79 lessons)

- **Object.freeze on every record** (cycle 75 lesson #6) — `TRADITION_LABEL`,
  `EVENT_TYPE_LABEL`, `RSVP_STATE_LABEL`, etc.
- **Branded primitives** (cycle 73, 77) — `RsvpState` union type guards
- **Discriminated union result type** (cycle 79 pattern) — `RsvpTransition | { error: string }`
- **Worktree-isolated tsconfig** (cycle 60+) — `tsconfig.w80-b.json`
- **Self-running test harness** (cycle 60+) — `it()`/`beforeEach()` with module-level state
- **`.ts` extension imports + allowImportingTsExtensions** (cycle 62) — all
  imports use `.ts` extension for Node 22 strip-types
- **Cycle 79 #5 vnode-recorder pattern** — captured React element trees as
  JSON-like VNode structures for DOM-less assertion
- **Mobile-first WCAG AA** — 44px touch targets, aria-label, role, focus ring
- **No fake success** (cycle 80 user preference) — 0 LOC written without
  verified assertions

---

## What's NOT in scope (and why)

- **No actual API integration** — component is pure presentational. Parent
  pages (`(community)/events/[id]/page.tsx` or similar) wire `onSubmit` to
  `fetch('/api/events/[id]/rsvp', ...)`. This is intentional: lets the
  component be unit-tested in isolation.
- **No date display** — the component shows capacity + state, not event
  date/time. The page header is responsible for that (it already has
  `EventCover` and date formatting).
- **No LGPD consent gate** — the page-level flow already handles consent
  (existing pattern from W20 magic link / W79 auth-pages).
- **No host-side "promote maybe → going" UI** — that's an admin surface,
  out of scope for the user-facing form.
- **No real-time update** — when capacity changes (someone declines), the
  parent re-fetches the event and passes new `confirmedCount`. Optimistic UI
  already covers the user's own action.

---

## Verification

```
$ cd /tmp/w80-b
$ tsc -p tsconfig.w80-b.json --noEmit
EXIT: 0

$ node --experimental-strip-types --no-warnings src/components/events/RSVPForm.spec.ts
[RSVPForm.spec] 64 passed, 0 failed (64 total)

$ node --experimental-strip-types --no-warnings scripts/smoke/w80-b-events-rsvp.ts
[smoke/w80-b-events-rsvp] 58/58 checks passed (92.19 ms)
```

---

## Follow-up work for cycle 81+

1. **Wire to actual API** — add `(community)/events/[id]/page.tsx` integration
   that passes `currentRsvp` from server-side `getEventById` + `viewerRsvpStatus`
   and wires `onSubmit` to `fetch('/api/events/[id]/rsvp', ...)`.
2. **Replace stub `SignupButton.tsx`** — the W26 stub in
   `src/components/events/SignupButton.tsx` is now redundant. Replace its
   usage with `<RSVPForm>` everywhere.
3. **Add optimistic re-render** — currently the parent re-fetches the event
   after onSubmit resolves. Could use React Query / SWR for optimistic
   updates with auto-rollback on error.
4. **i18n** — add `en` locale path (component accepts `locale` prop but
   only labels in pt-BR exist).
5. **Real-time capacity sync** — use SSE or polling to update `confirmedCount`
   when other users RSVP. Out of scope for this UI-only wave.

