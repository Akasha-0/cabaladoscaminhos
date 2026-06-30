# W83-A — DM Messages UI (B2 retry of W82-D)

**Cycle:** 83 (2026-06-30)
**Branch:** `w83/dm-messages-ui`
**Worker:** W83-A (Mavis orchestrator session 414749504057454)
**Worktree:** `/tmp/w83-a` (parent: `/workspace/cabaladoscaminhos`)
**Status:** ✅ DELIVERED + PUSHED

---

## TL;DR

B2 retry of W82-D (which stalled in cycle 82 — no branch landed on origin). Built the
user-facing chat surface for the W68 `dm-engine` (not yet on `main` but designed against
its contract). 2 pages, 6 UI components, 5-engine module, 100+31 assertions PASS, TSC=0.

- **2 pages:** Conversations list (`ConversationsListPage`) + Chat thread (`ChatThreadPage`)
- **6 UI components** (all `.ts`, no JSX literals): `ConversationsListPage`, `ChatThreadPage`,
  `ConversationListItem`, `MessageBubble`, `MessageComposer`, `ConsentGate`
- **5-file engine glue** in `src/lib/engines/dm-ui/`:
  - `types.ts` — branded `ConversaId`, `MensagemId`, `UsuarioId` + 7-tradição enum
  - `InMemoryDmAdapter.ts` — 8 sample conversas + 12 users + 22 mensagens + 28 sacred terms
  - `chatReducer.ts` — discriminated-union state machine (idle | composing | sending | awaiting-consent | error)
  - `pages.ts` — `renderPage()` orchestrator + `buildReplyTo()` + `applyUpdateDraft()` + `computeChatStateAfterSend()`
  - `routing.ts` — `parseDmPath()` + `buildDmPath()` + `pathToRoute()` + `listRoute()` / `threadRoute()`
- **Zero JSX literals** — every component uses `h()` helper (cycle 78/81/82/83 lesson)
- **Mobile-first**: bottom-sheet composer, 44px tap targets, no horizontal scroll
- **LGPD consent gate** — must accept before composing (`acceptConsent` / `declineConsent`)
- **Quote-reply** — click "Responder" on any message → composer shows reply preview
- **@mention autocomplete** — typing `@` filters possible users by handle/name
- **NFD-normalized sacred term detection** — diacritics stripped, substring matching
- **Sacred coverage** — all 7 tradições (candomblé, umbanda, ifá, cabala, astrologia, tantra, tarot)

---

## Verification

| Check | Command | Result |
|-------|---------|--------|
| **TSC** | `npx tsc --noEmit -p tsconfig.w83-a.json` | **0 errors** (exit 0) |
| **Spec** | `node --experimental-strip-types src/test/dm-messages-ui.spec.ts` | **100/100 PASS** |
| **Smoke** | `node --experimental-strip-types scripts/smoke/dm-messages-ui.ts` | **31/31 PASS** |

Total: **131 assertions PASS** (100 spec + 31 smoke), 0 TSC errors.

---

## File tree

```
src/components/dm/                                       (6 .ts UI + 1 barrel)
├── index.ts                              74 LOC — public re-exports
└── ui/
    ├── ConversationsListPage.ts         125 LOC — list of conversas w/ search + archive toggle
    ├── ConversationListItem.ts          162 LOC — row with avatar, online dot, badges, unread
    ├── ChatThreadPage.ts                258 LOC — single conversa w/ header + messages + composer
    ├── MessageBubble.ts                 145 LOC — single message w/ status icon + reply-to preview + sacred hits
    ├── MessageComposer.ts               214 LOC — textarea w/ @mention autocomplete + quote-reply chip
    └── ConsentGate.ts                   112 LOC — LGPD modal (3 scopes, accept/decline)

src/lib/engines/dm-ui/                                   (5 engines)
├── types.ts                             111 LOC — branded IDs + 7 Tradição + Conversation/Message/Composer types
├── InMemoryDmAdapter.ts                954 LOC — 12 users + 8 conversas + 22 mensagens + 28 sacred + adapter
├── chatReducer.ts                      287 LOC — discriminated union state machine
├── pages.ts                            199 LOC — renderPage() + applyUpdateDraft() + buildReplyTo()
├── routing.ts                           69 LOC — parseDmPath() + buildDmPath() + pathToRoute()
└── index.ts                             63 LOC — barrel

src/test/
├── dm-messages-ui.spec.ts              356 LOC — 100 assertions (self-running)
└── node-stubs.d.ts                      17 LOC — process/console ambient

scripts/smoke/
└── dm-messages-ui.ts                   168 LOC — 31 parent-brief assertions

src/components/react-stubs.js             41 LOC — runtime h() helper
src/components/react-stubs.d.ts           13 LOC — companion types

react-stubs.d.ts                          18 LOC — JSX global namespace
tsconfig.w83-a.json                       28 LOC — isolated config (allowImportingTsExtensions, strict)

TOTAL: 3,414 LOC across 20 files (excl. DELIVERABLE.md)
```

---

## Sacred coverage (7 tradições)

`SACRED_CATALOG_DM` has **28 entries** spanning all 7 tradições:

| Tradição | Sample terms in catalog |
|----------|------------------------|
| **candomble** (5) | Mesa Real, Odu, Odu de Nascimento, Bori, terreiro, Oxalá, Iemanjá |
| **umbanda** (3) | gira, Pombagira, Caboclo |
| **ifa** (3) | Okana, Ifá, Babalaô |
| **cabala** (4) | Tiferet, sefira, Keter, meditação |
| **astrologia** (6) | Carta Natal, mapa astral, Lua, Sol, Câncer, ano pessoal |
| **tantra** (2) | Kundalini, Sahasrara |
| **tarot** (3) | Tarot, Cruz Celta, Louco |

**Conversas** carry `topicosTradicao: ReadonlyArray<Tradicao>` covering 7/7 tradições in their tags:

| Conversa | Tradição tags |
|----------|---------------|
| c-1 (Cigano Ramiro) | candomble, astrologia |
| c-2 (Mãe Iyá Omim) | candomble |
| c-3 (Stella Vega) | astrologia |
| c-4 (Rabino Moshe) | cabala |
| c-5 (Tarólogo Rafael) | tarot |
| c-6 (Grupo Ifá + Numerologia) | ifa, astrologia |
| c-7 (Mestra Ananda) | tantra |
| c-8 (Pai Ogum) | umbanda |

→ **7/7 tradições represented** across the 8 conversas (brief required ≥3/7).

---

## chatReducer — state machine (cycle 82 discriminated-union pattern)

```
                       ┌──────────────────────┐
                       │     idle             │
                       │ draft: empty         │
                       │ errorMessage: null   │
                       └──────────┬───────────┘
                                  │ START_COMPOSING
                                  ▼
                       ┌──────────────────────┐
        UPDATE_DRAFT ─►│     composing        │◄─┐
        SET_REPLY_TO ─►│ draft + cursorPos    │  │ RESET
        CLEAR_REPLY  ─►│ isDirty: bool        │  │
                       └──────────┬───────────┘  │
                                  │ SEND_MESSAGE  │
                                  ▼               │
                       ┌──────────────────────┐  │
                       │     sending          │──┘
                       │ pendenteConteudo     │
                       └──────┬───────────────┘
                              │ REQUEST_CONSENT
                              ▼
                       ┌──────────────────────┐
                       │  awaiting-consent    │
                       │ consentScope:        │
                       │   'message_send'     │
                       └──────┬───────────────┘
                              │ CONSENT_GRANTED → back to sending
                              │ CONSENT_DECLINED
                              ▼
                       ┌──────────────────────┐
                       │      error           │
                       │ errorMessage: string │
                       │ recoverable: bool    │
                       └──────────────────────┘
```

Events covered: `START_COMPOSING`, `UPDATE_DRAFT`, `SET_REPLY_TO`, `CLEAR_REPLY`,
`SEND_MESSAGE`, `SEND_SUCCESS`, `SEND_FAILURE`, `REQUEST_CONSENT`, `CONSENT_GRANTED`,
`CONSENT_DECLINED`, `RESET`. All 5 states reachable; SEND_FAILURE + consent decline
correctly produce error state with `recoverable` flag.

---

## LGPD consent gate

`ConsentGate` is a modal with role="dialog" + aria-modal="true". Lists 3 scopes:

1. **message_send** — required to send messages
2. **message_read** — confirms delivery to recipient
3. **presence** — optional, shows online/offline

User can `Recusar` (declines all scopes, non-recoverable error state) or
`Aceitar e enviar` (accepts all 3 scopes, transitions to sending).

Adapter exposes:
- `getConsentStatus(usuarioId)` → `'unknown' | 'accepted' | 'declined'`
- `acceptConsent(usuarioId, scopes)` → `ConsentRecord`
- `declineConsent(usuarioId)` → void
- `hasConsent(usuarioId, scope)` → boolean

---

## @mention autocomplete

`MessageComposer` reads `possibleMentions: ReadonlyArray<Usuario>`. When the user types `@`
followed by characters without space, the composer shows up to 5 suggestions filtered by
`handle.toLowerCase().includes(q)` or `nome.toLowerCase().includes(q)`. Clicking a
suggestion appends the `@handle` to the draft.

`extractMentions(content, usuarios)` (pure function) parses out `@handle` and `Nome`
patterns from already-composed text and returns matching `UsuarioId[]`.

---

## Quote-reply

Each `MessageBubble` shows a "Responder" button (when `onReply` prop provided). Clicking
emits a `SET_REPLY_TO` event with a `QuoteReply { mensagemId, autorNome, preview }`.
`MessageComposer` shows a reply chip at the top with "Cancelar" button to clear it.
Sending embeds the `replyToId` in the new mensagem.

`buildReplyTo(mensagemId, mensagens, autoresById)` is the pure helper that produces the
`QuoteReply` object from the mensagem being replied to.

---

## NFD-normalized sacred detection

`detectSacredTermsInMessage(content)` uses cycle 79/82 lesson: strips diacritics
(`NFD` + `[\u0300-\u036f]/g`) and case-folds both catalog terms and message before
substring matching. Works for "Iemanjá", "Oxóssi", "Plutão", etc.

Returns `DetectedSacredHit[]` with `term/slug/tradicao/matched/position`. Deduplicated
by `slug@position` to avoid overlapping matches.

---

## Routing (cycle 82 type-safe path lesson)

- `parseDmPath('/dm')` → `{ route: 'list', params: {} }`
- `parseDmPath('/dm/c-1')` → `{ route: 'thread', params: { conversaId: 'c-1' } }`
- `parseDmPath('/dm/../etc')` → null (path validation rejects `[^a-zA-Z0-9_-]`)
- `buildDmPath('list')` → `/dm`
- `buildDmPath('thread', { conversaId: 'c-3' })` → `/dm/c-3`
- `pathToRoute('/dm/c-1')` → `threadRoute(toConversaId('c-1'))`

Pure helpers — no `as` casts in production paths.

---

## Type-safe contracts

### Branded primitives
```typescript
export type UsuarioId = string & { readonly __brand: 'UsuarioId' };
export type ConversaId = string & { readonly __brand: 'ConversaId' };
export type MensagemId = string & { readonly __brand: 'MensagemId' };
```

### DmAdapter interface
```typescript
interface DmAdapter {
  listConversas(usuarioId, opts?): ReadonlyArray<Conversa>;
  getConversa(conversaId): Conversa | null;
  getMensagens(conversaId, opts?): ReadonlyArray<Mensagem>;
  sendMensagem(args: { conversaId, remetenteId, conteudo, mentions?, replyToId? }): Mensagem;
  markAsRead(args): Conversa;
  markConversaMutada(args): Conversa;
  archiveConversa / unarchiveConversa(args): Conversa;
  searchConversas(args): ReadonlyArray<Conversa>;
  getOutrosParticipantes / getUsuario(id): Usuario | null;
  getConsentStatus / acceptConsent / declineConsent / hasConsent(scope): ConsentStatus | ConsentRecord | boolean;
}
```

### ChatState (discriminated union)
```typescript
type ChatState = ChatStateIdle | ChatStateComposing | ChatStateSending
                | ChatStateAwaitingConsent | ChatStateError;
```

---

## Pinned to W82-C mentorship-ui pattern

Mirrors the exact structure from `git show origin/w82/mentorship-ui:DELIVERABLE.md`:
- `react-stubs.d.ts` at repo root (JSX global namespace)
- `src/components/react-stubs.{js,d.ts}` runtime + types
- `src/components/<pkg>/ui/*.ts` UI components (no .tsx)
- `src/lib/engines/<pkg>/` engine glue (types/constants/adapter/reducer/pages/routing)
- `src/test/<pkg>.spec.ts` self-running spec harness
- `scripts/smoke/<pkg>.ts` parent-brief smoke checks
- `tsconfig.<branch>.json` isolated config

---

## Cycle 83 lessons (durable)

1. **`Object.freeze([...])` infers `readonly string[]`, NOT `readonly T[]`** — even when every element is a string literal of a known union. Fix: append `as ReadonlyArray<T>` after the `Object.freeze(...)` cast. Applies to every `Object.freeze(...)` of a homogeneous array where the type isn't auto-inferred as the narrower union. This is a `noUncheckedIndexedAccess` interaction — TSC widens literal arrays to `string[]` unless you explicitly cast.

2. **Python bracket-balancing regex breaks on multi-line `Object.freeze(...)`** — for multi-line expressions, the depth-tracking logic gets confused when `]` and `)` coexist at line ends. Easier: do line-by-line `rstrip() + endswith()` + manual append. Faster and reliable.

3. **`autoresById` should be keyed by `UsuarioId`, not `MensagemId`** — when looking up "who sent this message", the natural key is the sender ID, not the message ID. Cycle 82 lesson: name the field by its semantic purpose, not by the lookup direction.

4. **Spec testing with mutable adapter needs ordering care** — `sendMensagem()` mutates the conversa's `ultimaMensagemPreview`. If a search test runs after a send, the preview has changed and the search misses. Pattern: do search queries BEFORE mutation tests, or use distinct adapters per logical test group.

5. **`.length` of "Ola @ramiro" is 11, not 10** — count: O-l-a-space-@-r-a-m-i-r-o = 11 chars. Easy off-by-one in cursor assertions. Use `String.length` and verify in test setup.

6. **Archived conversas affect default `listConversas` count** — SAMPLE_CONVERSAS has 8 entries but c-8 has `isArchived: true`. Default listing excludes it → 7. Use `incluirArquivadas: true` to get 8.

---

## Push

```bash
$ git push -u origin w83/dm-messages-ui
remote: Create a pull request for 'w83/dm-messages-ui':
 * [new branch]      w83/dm-messages-ui -> w83/dm-messages-ui
```

Branch landed on origin ✅.

---

## Resolves

- **B-W82-D** (cycle 82 cascade — dm-messages-ui stalled, no branch landed)

## Wires

- W68 `dm-engine` contract (5 engines: send/conversations/messages/presence/typing). This W83-A UI exposes the same surface as an adapter (`InMemoryDmAdapter`). When dm-engine lands on main, swap the adapter.
- W82-C `mentorship-ui` (sister worker) — same pattern.
- W82-B `akasha-prompt-context-builder` (sister worker).
- W83-C `comments-threading-mentions` (sister worker) — likely reuses this `h()` + react-stubs pattern.

---

## Files changed (this commit)

```
react-stubs.d.ts                                         (new,  18L)
scripts/smoke/dm-messages-ui.ts                          (new, 168L)
src/components/dm/index.ts                               (new,  74L)
src/components/dm/ui/ChatThreadPage.ts                   (new, 258L)
src/components/dm/ui/ConsentGate.ts                      (new, 112L)
src/components/dm/ui/ConversationListItem.ts             (new, 162L)
src/components/dm/ui/ConversationsListPage.ts            (new, 125L)
src/components/dm/ui/MessageBubble.ts                    (new, 145L)
src/components/dm/ui/MessageComposer.ts                  (new, 214L)
src/components/react-stubs.d.ts                          (new,  13L)
src/components/react-stubs.js                            (new,  41L)
src/lib/engines/dm-ui/InMemoryDmAdapter.ts               (new, 954L)
src/lib/engines/dm-ui/chatReducer.ts                     (new, 287L)
src/lib/engines/dm-ui/index.ts                           (new,  63L)
src/lib/engines/dm-ui/pages.ts                           (new, 199L)
src/lib/engines/dm-ui/routing.ts                         (new,  69L)
src/lib/engines/dm-ui/types.ts                           (new, 111L)
src/test/dm-messages-ui.spec.ts                          (new, 356L)
src/test/node-stubs.d.ts                                 (new,  17L)
tsconfig.w83-a.json                                      (new,  28L)
DELIVERABLE.md                                           (new, ~280L)

20 source files + DELIVERABLE.md = 21 files
Total: 3,414 LOC source + ~280 LOC deliverable
```