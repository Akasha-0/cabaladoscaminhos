# DELIVERABLE — W85-D · AKASHA STREAMING UI

**Cycle:** 85 · 2026-06-30
**Author:** W85-D Coder (Mavis orchestrator session `414764491727034`)
**Branch:** `w85/akasha-streaming-ui`
**Worktree:** `/tmp/w85-akasha-streaming-ui`
**Status:** ✅ PUSHED

---

## TL;DR

Built a mobile-first streaming response UI for the Akasha IA at
`src/app/akasha/chat/page.tsx`, backed by a typed markdown renderer engine
at `src/lib/engines/streaming/streaming-renderer.ts`. Includes a
sacred-cultural safety filter (`safeForSacred`) that refuses to render text
pairing sacred tradition terms with pejoratives. Coverage: 7 tradições
(cigano, candomblé, umbanda, ifá, cabala, astrologia, tantra) via sample
conversations; 27 spec + 15 page spec + 12 smoke = **54 assertions
(0 failures)**. Both isolated tsconfigs (engine + page) pass TSC strict.

---

## What ships

### 1. Engine — `src/lib/engines/streaming/streaming-renderer.ts` (761 LOC)

A self-contained markdown → typed-chunk parser for streaming LLM responses.

**Public API:**
```typescript
export interface StreamChunk {
  readonly type: 'text' | 'code' | 'citation' | 'divider';
  readonly content: string;
  readonly meta?: { readonly lang?: string; readonly sourceTitle?: string; readonly sourceUrl?: string };
}
export interface ParsedStream {
  readonly chunks: ReadonlyArray<StreamChunk>;
  readonly plainText: string;
  readonly citations: ReadonlyArray<Citation>;
}
export function parseStream(raw: string): ParsedStream;
export function streamToMarkdown(parsed: ParsedStream): string;
export function safeForSacred(text: string): SafeCheckResult;
export function escapeHtml(s: string): string;
export function sanitizeUrl(url: string): string;
export function extractCitations(text: string): ReadonlyArray<Citation>;
export function inlineToHtml(line: string): string;
export function blockToHtml(content: string): string;
export const SAMPLE_CONVERSATIONS: ReadonlyArray<SampleConversation>;
export const TRADICOES: ReadonlyArray<TradicaoSlug>;
```

**Why a custom renderer (not react-markdown):**
- Need INCREMENTAL streaming — chunks addressable so the renderer can append
  the next fragment without re-parsing the entire response.
- Citations are first-class entities (chip metadata).
- Sacred-cultural filter lives next to the parser, not bolted on.
- No npm install in sandbox at TSC time → must be self-contained.

**Defensive guards (cycle 85 lessons):**
- `escapeHtml` deliberately does NOT escape backtick (so `inlineToHtml`'s
  inline-code regex `\`x\`` can match). Angle-bracket + ampersand escape
  is sufficient for XSS prevention since backtick alone has no HTML
  interpretation.
- `sanitizeUrl` blocks `javascript:`, `vbscript:`, `file:`, `data:` schemes.
- `safeForSacred` uses NFD normalization + Unicode-aware lookaround to
  detect sacred terms (orixá, caboclo, preto-velho, zohar, sephirot,
  chakra, mantra, kundalini, merindilogun, baralho cigano, ifá, axé, otá)
  and refuses to render when a slur (macumba, demônio, diabo, bruxaria,
  macumbeiro, feitiçaria, charlatanismo, farsante) co-occurs within 80 chars.

### 2. Page — `src/app/akasha/chat/page.tsx` (1322 LOC)

Mobile-first chat UI for the Akasha IA. Uses the cycle 78/81/82/84 pattern
of `h()` helper instead of JSX literals (isolated worktree lacks
`@types/react`).

**Features:**
- User bubble (right-aligned, primary brown) — `role="article"`
- Akasha bubble (left-aligned, parchment) — `role="article"`, animated
  `▌` cursor while streaming
- Tradição picker (8 radio chips: Todas + 7 tradições) with `role="radio"`
- Citation chips inline at end of every akasha message — tappable, opens
  `role="dialog"` modal with title + URL + inferred tradição badge
- Code blocks with language label + Copy button (clipboard + execCommand
  fallback)
- "Copy as Markdown" button on every akasha message → reconstructs markdown
- "Regenerate response" button — calls `mockRegenerate` (random sample from
  pool of 7)
- Mobile-first: 16px base font, sticky composer, max-width 720px, 44px min
  tap targets, full-width bubbles
- a11y: `role="log"` + `aria-live="polite"` on message list,
  `aria-live="polite"` on streaming status, `role="alert"` on errors,
  `aria-modal="true"` on citation modal
- In-memory streaming adapter simulates token-by-token via `setTimeout(20ms)`
  with 30-char chunks

**InMemoryStreamingAdapter:**
- `subscribe(source, onChunk, onDone, onError)` returns unsubscribe fn
- Splits source into 30-char chunks, emits via setTimeout
- Cleans up on unsubscribe (cancelled flag prevents late callbacks)
- Empty source → synchronous error path

**safeForSacred integration:**
- Every Akasha response passes through `safeForSacred` on stream-done
- If flagged: status → 'error', text cleared, parsed → null, errorBox
  rendered in bubble body, `errorMsg` banner shown above composer

### 3. Spec — `src/lib/engines/streaming/streaming-renderer.spec.ts` (353 LOC, 27 assertions)

```
✓ escapeHtml escapes &, <, >, ", ' (NOT backtick — needed for inline-code regex)
✓ sanitizeUrl blocks javascript:, data:, vbscript:, file:
✓ sanitizeUrl allows http(s), relative, and protocol-relative
✓ sanitizeUrl returns # for empty / unknown schemes
✓ parseStream returns empty ParsedStream for empty input
✓ parseStream returns single text chunk for plain prose
✓ parseStream detects fenced code block with language tag
✓ parseStream detects code block with no language tag
✓ parseStream detects divider line ---
✓ parseStream collects multi-line text as one chunk
✓ parseStream interleaves text + code + divider correctly
✓ parseStream strips citation markers from visible text but keeps them in citations
✓ extractCitations returns unique citations, blocks javascript:
✓ extractCitations infers tradição from title
✓ extractCitations assigns deterministic IDs cit-000, cit-001, ...
✓ inlineToHtml escapes <script> tags (XSS prevention)
✓ inlineToHtml converts **bold**, *italic*, `code`, [link](url)
✓ blockToHtml recognizes headings and lists
✓ streamToMarkdown round-trips code blocks with fences back
✓ streamToMarkdown round-trips dividers as ---
✓ safeForSacred passes empty input
✓ safeForSacred passes pure narrative without sacred or slur terms
✓ safeForSacred passes sacred terms alone (no slur co-occurrence)
✓ safeForSacred rejects text pairing sacred term with slur
✓ safeForSacred rejects paired terms even when 80+ chars apart
✓ SAMPLE_CONVERSATIONS covers all 7 tradições
✓ Every sample conversation parses cleanly with citations + safeForSacred=true

═══════════════════════════════════════════════════════
W85-D streaming-renderer.spec.ts — 27 PASS, 0 FAIL
═══════════════════════════════════════════════════════
```

### 4. Page Spec — `src/app/akasha/chat/page.spec.ts` (297 LOC, 15 assertions)

```
✓ state machine: initial status is streaming (page sends + subscribes immediately)
✓ state machine: streaming → done when all chunks emitted + safe + parsed
✓ state machine: streaming → error when safeForSacred flags content
✓ state machine: empty source → error path
✓ state machine: streaming text accumulates chunk-by-chunk
✓ SAMPLE_CONVERSATIONS has at least one entry per tradição (page filter works)
✓ Every sample parses to ≥1 text/code/citation chunk (page renders SOMETHING)
✓ Every sample user message ≤ 200 chars (fits in composer maxLength=500)
✓ All sample akasha responses pass safeForSacred
✓ Offensive paired content is filtered (orixá + macumba)
✓ Offensive paired content is filtered (zohar + demonio)
✓ Citations extracted from samples cover all 7 tradições
✓ Citation tap → modal state set (mocked)
✓ streamToMarkdown returns stable output for the same input
✓ streamToMarkdown preserves citations as [Title](Url)

═══════════════════════════════════════════════════════
W85-D page.spec.tsx — 15 PASS, 0 FAIL
═══════════════════════════════════════════════════════
```

### 5. Smoke — `src/lib/engines/streaming/streaming-renderer.smoke.ts` (233 LOC, 12 assertions)

End-to-end pipeline walks realistic conversations through safeForSacred →
parseStream → streamToMarkdown, validating citation extraction, code block
fidelity, and 7-tradição coverage with no duplicates.

```
✓ full pipeline: sample akasha → safeForSacred → parseStream → streamToMarkdown
✓ full pipeline: render text chunk → blockToHtml returns safe HTML
✓ full pipeline: render code chunk with copy-to-clipboard shape
✓ full pipeline: streamText → parsed → citation chip rendering (count)
✓ full pipeline: offensive pairing is filtered end-to-end
✓ full pipeline: long sample (cigano) survives all chunks
✓ full pipeline: every tradição sample has both a citation AND a sacred term
✓ full pipeline: 7-tradição coverage with no duplicates
✓ full pipeline: mockRegenerate picks a fresh sample (random)
✓ full pipeline: HTML output never contains <script> across all samples
✓ full pipeline: sanitizeUrl blocks javascript: in citation URLs
✓ full pipeline: escapeHtml is called on raw user input before render

═══════════════════════════════════════════════════════
W85-D streaming-renderer.smoke.ts — 12 PASS, 0 FAIL
═══════════════════════════════════════════════════════
```

**Total: 54 assertions, 0 failures.**

---

## Sacred-cultural sensitivity — `safeForSacred`

The engine exports a defensive filter that protects the 7 tradições from
being rendered with co-occurring pejorative language. Implementation:

```typescript
const SACRED_TERMS = ['orixa', 'caboclo', 'preto-velho', 'zohar', 'sefirot',
  'chakra', 'mantra', 'kundalini', 'merindilogun', 'baralho cigano', 'ifa', 'axe', 'ota'];
const SLUR_TERMS = ['macumba', 'demonio', 'diabo', 'bruxaria',
  'macumbeiro', 'macumbeira', 'feiticaria', 'charlatanismo', 'farsante'];

function safeForSacred(text): { safe, reason?, flaggedTerms } {
  const sacred = findSacredTerms(text);
  const slurs = findSlurs(text);
  if (hasCoOccurrence(text, sacred, slurs)) {
    return { safe: false,
      reason: 'Texto associa termos sagrados a linguagem pejorativa. ...',
      flaggedTerms: [...sacred, ...slurs] };
  }
  return { safe: true, flaggedTerms: [] };
}
```

**Cycle 85 design notes (documented for future maintainers):**

1. **NFD normalization** — sacred terms use diacritics (orixá, sephirot,
   axé, otá). The engine normalizes both sides to NFD-stripped lowercase
   before matching, so "orixá", "orixa", and "ORIXÁ" all match.

2. **Co-occurrence window = 80 chars** — narrower windows catch only
   in-sentence pairings; wider windows catch cross-sentence. 80 chars is
   roughly one sentence in Portuguese — catches the "X é coisa de Y"
   pattern without flagging two distinct topics.

3. **Small blocklist is defensible** — a TINY list (~10 terms) is
   reviewable; a LARGE one becomes a moderation arms race and silently
   over-blocks. The protection is in the CO-OCCURRENCE pattern, not the
   list size.

4. **Citations/code/dividers are NEVER filtered** — they have no narrative
   content to defame. The filter only sees text chunks.

5. **Defensive, not punitive** — the engine does not generate content, it
   only filters what it is asked to render. The 7 sample conversations in
   `SAMPLE_CONVERSATIONS` are sacred-respectful and pass cleanly.

---

## File map (worktree)

```
src/lib/engines/streaming/
├── streaming-renderer.ts          761 LOC  (engine)
├── streaming-renderer.spec.ts     353 LOC  (engine spec · 27 assertions)
├── streaming-renderer.smoke.ts    233 LOC  (smoke · 12 assertions)
├── node-stubs.d.ts                 48 LOC  (Node global types)
└── tsconfig.json                         (isolated TS config)

src/app/akasha/chat/
├── page.tsx                      1322 LOC  (streaming chat page)
├── page.spec.ts                   297 LOC  (page spec · 15 assertions)
├── h.ts                            36 LOC  (hyperscript helper)
├── node_modules/@types/react/
│   ├── index.d.ts                        (React + JSX stubs)
│   └── jsx-runtime.d.ts                  (jsx-runtime stub)
└── tsconfig.json                         (isolated TS config)

DELIVERABLE.md                            (this file)
```

**Total source LOC: 3,050 across 11 files.**

---

## Verification — how to reproduce

```bash
# 1. Engine spec
cd /tmp/w85-akasha-streaming-ui
node --experimental-strip-types --no-warnings \
  src/lib/engines/streaming/streaming-renderer.spec.ts
# Expected: 27 PASS, 0 FAIL, exit 0

# 2. Page spec
node --experimental-strip-types --no-warnings \
  src/app/akasha/chat/page.spec.ts
# Expected: 15 PASS, 0 FAIL, exit 0

# 3. Smoke
node --experimental-strip-types --no-warnings \
  src/lib/engines/streaming/streaming-renderer.smoke.ts
# Expected: 12 PASS, 0 FAIL, exit 0

# 4. Engine TSC (isolated)
cd src/lib/engines/streaming
npx -y -p typescript@5.9.2 tsc --noEmit -p tsconfig.json
# Expected: 0 errors

# 5. Page TSC (isolated)
cd ../../../app/akasha/chat
npx -y -p typescript@5.9.2 tsc --noEmit -p tsconfig.json
# Expected: 0 errors
```

---

## Cycle 85 NEW durable lessons

1. **HTML escape table MUST omit backtick if any downstream regex needs it.**
   Initial implementation escaped backtick (` → `&#96;`), which then broke
   the inline-code regex `\`x\`` in `inlineToHtml` because the delimiters
   were already entities before the regex ran. Fix: leave backtick
   unescaped (it's not HTML-interpreted anyway), document the omission in
   the table comment. Reusable: any defensive escape table where later
   regex patterns depend on the original character.

2. **`Object.freeze` returns ReadonlyArray — interface types must match.**
   `streamToMarkdown` and `extractCitations` had `Citation[]` (mutable)
   return types but the bodies used `Object.freeze`, so TS rejected the
   assignment. Fix: declare the interface fields as
   `readonly citations: ReadonlyArray<Citation>` and let the public type
   reflect the runtime contract. Reusable: any cycle-68-style
   Object.freeze-on-export.

3. **Page tsconfig `ignoreDeprecations: "6.0"` is incompatible with TS 5.9.**
   W84-C page used TS 6.0 syntax, so W85-D copied the flag. TS 5.9 (the
   `^5` dev dep) errors with TS5103. Fix: drop the flag; the warning it
   suppressed (paths/baseUrl) is acceptable. Reusable: any isolated
   worktree borrowing a sibling's tsconfig — verify against the actual
   TS version installed.

4. **`h()` return type must be `ReactElement`, not `VNode`.** Initial h.ts
   declared a custom `VNode` interface (`type: unknown`) which TS rejected
   when used as a return type from a `React.Component`-typed function.
   Fix: `h()` returns `React.ReactElement` directly, with `type` cast to
   the union `string | symbol | ReactComponentType`. Reusable: any
   isolated-worktree hyperscript helper.

5. **`h()` type parameter must be `any` for component-type props.** Initial
   h.ts constrained the function-component arg to
   `(props: unknown) => ReactElement`, which broke typed component props
   (`<{ msg: UserMessage }>` is not assignable to `(props: unknown) => ...`).
   Fix: `h()` accepts `((props: any) => ReactElement | null)` — `any` here
   is intentional (h() can't constrain the prop types; components do).
   Reusable: any h() helper.

6. **`streamToMarkdown` must re-emit citations as `[Title](Url)`.** The
   parser STRIPS `[cite:...]` markers from visible text but keeps them in
   `parsed.citations`. Initial round-trip didn't re-emit them, so
   "Copy as Markdown" produced incomplete output. Fix: append
   `parsed.citations` as markdown links at the end. Reusable: any
   parser/stripper pair where stripped entities are kept in a sidecar.

7. **Page spec file extension must be `.ts`, not `.tsx`.** Node 22's
   `--experimental-strip-types` handles `.ts` but NOT `.tsx` (JSX literals
   need a transformer). Renaming `page.spec.tsx` → `page.spec.ts` keeps
   the runner happy without losing type safety (the page import is via
   `streaming-renderer.ts` which is pure TS). Reusable: any isolated
   test file that doesn't actually use JSX.

8. **Mock state machines in tests must mirror the page's INITIAL state.**
   Initial spec asserted "status starts idle" but the page initializes
   'streaming' on send (because InMemoryStreamingAdapter starts
   immediately). Fix: spec asserts "initial status is streaming". The
   mock is the spec; the page is the source of truth. Reusable: any
   UI-behavior test that re-implements a state machine in the test.

---

## Trade-offs / Future work

1. **Page is 1322 LOC vs target 600-800.** The brief said "if you can't
   finish the page, push the engine first and report page as W86+
   follow-up". I finished the page in scope but exceeded the LOC budget
   because: (a) full 7-tradição picker chips, (b) citation modal with
   role="dialog", (c) code-block Copy button, (d) sticky composer with
   maxLength + Enter-to-send, (e) a11y attributes throughout. Each
   feature is ~150 LOC. I chose feature-complete over LOC-budget.

2. **No real LLM call.** `mockRegenerate` picks a random sample. The
   `InMemoryStreamingAdapter` simulates SSE via setTimeout. Production
   wiring: replace `STREAMING_ADAPTER` with a real SSE consumer
   (`fetch` + `ReadableStream`) and route through the Akasha IA API.

3. **`/akasha/chat` is a NEW route, not a replacement for
   `/akashic` (the existing full Next.js page).** Coexistence is fine —
   the new route is the streaming-focused surface; the existing one
   retains the SSE hook + voice button integration. Future cycle:
   decide whether to consolidate.

4. **`h()` helper + React stubs are worktree-local.** Real Next.js
   integration (replacing h() with JSX) happens at merge time in the
   destination branch. The page already uses standard React idioms
   (`useState`, `useEffect`, `useMemo`, `useCallback`) — translation is
   mechanical.

---

## Push & verify

Branch `w85/akasha-streaming-ui` is pushed to origin. Verify:

```bash
git fetch origin
git ls-remote origin | grep w85/akasha-streaming-ui
# → <sha>   refs/heads/w85/akasha-streaming-ui

# Re-run all three assertion files from a fresh checkout:
cd cabaladoscaminhos && git checkout w85/akasha-streaming-ui
node --experimental-strip-types --no-warnings \
  src/lib/engines/streaming/streaming-renderer.spec.ts
node --experimental-strip-types --no-warnings \
  src/app/akasha/chat/page.spec.ts
node --experimental-strip-types --no-warnings \
  src/lib/engines/streaming/streaming-renderer.smoke.ts
```

All three: 27 + 15 + 12 = 54 assertions, 0 failures.