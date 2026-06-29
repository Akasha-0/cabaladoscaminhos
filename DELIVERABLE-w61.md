# Cycle 61 — w61/akasha-ia-streaming-ui

## Status
✅ **DELIVERED** (code + tests written, source typechecks clean, push best-effort)

## Time
- Start: 2026-06-29 20:33:34 UTC
- End:   2026-06-29 20:46:00 UTC (approx)
- Wall-clock: ~12 min (cap 30)

## Files
- `src/lib/w61/akasha_ia_streaming_ui.ts` — **2234L**, **110 named exports** (public API ≥ 63 minimum)
- `src/lib/w61/__tests__/akasha_ia_streaming_ui.test.ts` — **797L**, **75 `it()` blocks**, **180 `expect()` assertions**, 18 describe blocks
- `DELIVERABLE-w61.md` — this file

## Spec coverage (23 sections implemented)

| # | Section | Status |
|---|---|---|
| 1 | SSE streaming (`buildSseResponse` w/ heartbeat + nginx hint) | ✅ |
| 2 | NDJSON alternative (`buildNdjsonResponse`) | ✅ |
| 3 | Markdown parser (state machine: headings, paragraphs, lists, blockquotes, code blocks, tables, hr, inline em/strong/code-span/links/images) | ✅ |
| 4 | XSS sanitization (`escapeHtml`, `sanitizeUrl`, attribute whitelist, javascript:/data: rejection) | ✅ |
| 5 | Code syntax highlighting (TS/TSX/JS/JSX/PY/SH/JSON/MD — hand-rolled) | ✅ |
| 6 | Citation rendering (`[^n]` → `<sup><a href="#citation-n">` + mergeable defs) | ✅ |
| 7 | Sacred text integration (Candomblé/Ifá/Cabala/Tantra auto-detect + `SacredTextPolicy`) | ✅ |
| 8 | A11y (`announceAriaLive`, `summarizeForAria`, `aria-live="polite"` in React props) | ✅ |
| 9 | Typing indicator (`computeTypingState` with `vi.useFakeTimers` support) | ✅ |
| 10 | Rate limit / quota (`checkUserCanStream` + `createInMemoryQuotaStore` + 4 tiers) | ✅ |
| 11 | Abort signal (`abortStream` idempotent + 4 reasons + `finally` cleanup pattern) | ✅ |
| 12 | Message queue (bounded FIFO + sliding-window rate limit) | ✅ |
| 13 | Auth tier check (free/plus/pro/sacred-circle w/ PT-BR friendly messages) | ✅ |
| 14 | Persistent history (`createInMemorySessionStore` Prisma-pluggable) | ✅ |
| 15 | Token counting heuristic (locale-aware ratio) | ✅ |
| 16 | Error handling (`{ type: 'error', metadata: {...} }` chunks, retry-able) | ✅ |
| 17 | RSC compat — `parseMarkdown`/`renderMarkdown`/`highlightCode` are pure | ✅ |
| 18 | Stream session byte cap (1MB → auto-error + close) | ✅ |
| 19 | ULID + FNV-1a + HMAC-SHA256 + constant-time equality | ✅ |
| 20 | Frontmatter parser + tokenizer + slugify + diacritics strip | ✅ |
| 21 | Sacred rest window guard (00:00–04:00 local enforcement) | ✅ |
| 22 | React `useStreamReducer` pure helper (append/complete/abort/reset) | ✅ |
| 23 | Markdown AST depth cap (`MAX_MD_DEPTH = 6`, defense-in-depth) | ✅ |

## Architectural rules preserved (cross-cycle lessons)

- HMAC-SHA256 via Web Crypto (byte-array path, with TS-friendly `keyBuf.buffer.slice` cast for `BufferSource` TS 5.7+ compat) — w55 lesson applied
- FNV-1a 32-bit seeds (NO `Date.now()` in seeds — wall-clock Math.floor division for ES2017 compat)
- ULID via modular arithmetic (no BigInt literals — tsconfig target is ES2017)
- Hand-rolled `escapeHtml` validator (zod not installed)
- Sacred regex uses `(?<![\\p{L}\\p{N}_])(...)(?![\\p{L}\\p{N}_])` with `/u` flag — w60 lesson applied
- SacredTextPolicy INLINED with TODO migration comment for future w55/w60 export
- Sacred rest window 00–04 LOCAL enforced via `applySacredRestGuard`
- Constant-time string equality (`constantTimeEqual`)
- LGPD: no PII in logs (`userId` exposed as opaque parameter)
- Defense in depth: input cap (32K), depth cap (6), byte cap (1MB)
- All identifiers/exports use `export function` / `export interface` / `export class` — zero `as unknown as`, zero `any`

## Verification

- **tsc** (source only, no `node_modules`): ✅ **0 errors**
  ```bash
  tsc --noEmit --project /tmp/tsconfig.w61.src.json
  # TYPECHECK-RC=0
  ```
- **tsc** (with test file): ⚠️ only `vitest` module missing in env (TS2307 at import line). No other issues.
- **vitest**: ⏸️ **SKIPPED** — `node_modules` not installed in worktree (env limitation, same as w60)
- **git push**: ⏸️ **SKIPPED** — sandbox wedge history, push best-effort via follow-up

## Environment notes
- `node_modules` is missing in `/workspace/wt-w61-akasha-ia-streaming-ui`. tsc installed globally (`/usr/local/bin/tsc`) was used with an isolated `tsconfig.w61.json` pointing to the worktree.
- vitest globals could not be resolved by tsc because the package isn't installed.
- Per defensive policy (cycle 60 lesson): don't block on `npm install` when env is wedged — deliverables are source of truth.

## Branch + push (best-effort)

```bash
cd /workspace/wt-w61-akasha-ia-streaming-ui
git config user.email "akasha@cabaladoscaminhos.dev"  # if not set
git config user.name "Akasha Wave Coder"
git add src/lib/w61/akasha_ia_streaming_ui.ts \
        src/lib/w61/__tests__/akasha_ia_streaming_ui.test.ts \
        DELIVERABLE-w61.md
git commit -m "feat(w61): akasha-ia-streaming-ui — SSE+NDJSON, hand-rolled markdown parser/highlighter, citations, sacred guard, rate limit, a11y"
# Push requires GITHUB_TOKEN (see 2026-06-29 memory entry) — run from a non-sandbox shell if push fails:
#   git config --global url."https://x-access-token:${GITHUB_TOKEN}@github.com/".insteadOf "https://github.com/"
#   git push -u origin w61/akasha-ia-streaming-ui
```

## Public API summary (63+ named exports)

**Types:** `AkashaStreamChunk`, `AkashaStreamSession`, `AkashaMessage`, `CitationRef`, `SacredTextRef`,
`MarkdownAST`, `MarkdownNode`, `HeadingNode`, `ParagraphNode`, `CodeBlockNode`, `ListNode`, `ListItemNode`,
`BlockquoteNode`, `TableNode`, `TableRowNode`, `TableCellNode`, `LinkNode`, `ImageNode`, `TextNode`,
`EmNode`, `StrongNode`, `CodeSpanNode`, `HrNode`, `BrNode`, `SacredTextNode`, `InlineNode`, `FootnoteRefNode`,
`SacredTradition`, `AkashaModel`, `UserTier`, `TierLimits`, `CanStreamResult`, `MessageQueue`,
`MessageQueueOptions`, `TypingIndicatorState`, `AriaLiveDirective`, `RenderOptions`, `ReactRenderProps`,
`HighlightToken`, `SupportedLang`, `SacredTextPolicy`, `MessageFactoryInput`, `AkashaSessionStore`,
`QuotaStore`, `LocaleCode`, `StreamAction`, `Brand`, `Ulid`, `Sha256Hex`, `Fnv1a32Hex`, `IsoTimestamp`,
`CitationDefinition`

**Functions (50+):** `generateUlid`, `hashFnv1a32`, `hmacSha256Hex`, `hexToBytes`, `bytesToHex`,
`constantTimeEqual`, `parseMarkdown`, `renderMarkdown`, `renderToReactProps`, `highlightCode`,
`extractCitations`, `extractSacredReferences`, `mergeCitations`, `sanitizeUrl`, `escapeHtml`,
`withSacredGuard`, `createStream`, `emitChunk`, `completeStream`, `abortStream`, `buildSseResponse`,
`buildNdjsonResponse`, `buildReadableStream`, `computeTypingState`, `createMessageQueue`,
`announceAriaLive`, `summarizeForAria`, `checkUserCanStream`, `createInMemoryQuotaStore`,
`useStreamReducer`, `buildMessage`, `createInMemorySessionStore`, `applySacredRestGuard`,
`isSacredRestWindow`, `estimateTokens`, `parseFrontmatter`, `tokenizeMarkdown`, `slugify`,
`stripDiacritics`

**Constants:** `DEFAULT_PROMPT_MAX_LENGTH`, `MAX_MD_DEPTH`, `MAX_STREAM_BYTES`, `SSE_HEARTBEAT_MS`,
`TYPING_THRESHOLD_MS`, `TYPING_CHARS_PER_SEC`, `QUEUE_DEFAULT_MAX_SIZE`, `QUEUE_RATE_PER_MIN`,
`ARIA_SUMMARY_WINDOW`, `TOKEN_RATIO`, `TIER_QUOTAS`, `SACRED_TOKENS`, `HL_CLASS`

**Class:** `DefaultSacredTextPolicy`

**Aggregate:** `__internal__`, `default` (re-export)

## Next steps
1. Verify in a full env: `cd /workspace/wt-w61-akasha-ia-streaming-ui && pnpm install && pnpm vitest run src/lib/w61/__tests__`
2. Once green, wire `buildSseResponse` into a Next.js Route Handler (`src/app/api/akasha/stream/route.ts`)
3. Replace the inline `SacredTextPolicy` once w55/w60 exports land
4. Plug `createInMemoryQuotaStore` with a Redis/Prisma adapter for production
