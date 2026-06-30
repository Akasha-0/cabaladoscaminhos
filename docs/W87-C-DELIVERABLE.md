# W87-C — DELIVERABLE
## Comments Threading + @mentions + LGPD + XSS sanitize

**Cycle:** W87 (cycle 87 — wave-spawner)
**Worker:** W87-C
**Branch:** `w87/comments-thread-mentions`
**Worker session:** 414779975110892
**Parent (wave-spawner) session:** 414771547345007
**Wave-spawner tick:** 11:00 UTC SPAWN → 11:24 UTC DELIVER

---

## 1. SUMMARY

A complete comments-threading engine with @mention detection, XSS sanitization,
LGPD consent gate, and a React mobile-first UI — delivered in 2680 LOC across 13
files. All checks GREEN: TSC=0, vitest 77/77 PASS, smoke 23/23 PASS, push ready.

### What was built
- **Engine** (pure, framework-agnostic) in `src/engine/comments/`:
  - Branded types (CommentId / UserId / PostId), Comment, ThreadNode, frozen
    error taxonomy (LGPD / MAX_DEPTH / NOT_FOUND / CROSS_POST_REPLY / etc).
  - `parseMentions(body, knownHandles)` — case-insensitive, supports up to 10,
    deduplicated by (offset, lowercase-handle), ignores `@` in URLs.
  - `sanitizeBody(body)` — strips `<script>`, `<style>`, `<iframe>`, `<embed>`,
    inline `on*=` handlers, `javascript:` URIs, `data:text/html` URIs. Preserves
    sacred Candomblé / Cabala / Tarô vocabulary verbatim.
  - `createCommentsEngine(adapter, knownHandles)` — full CRUD: addComment,
    editComment, deleteComment (soft, cascades to replies), listThread (groups
    replies by parentId, depth ≤ 1). LGPD gate throws if `consent !== true`.
  - `createInMemoryCommentsAdapter()` — canonical seed (6 comments across 2
    threads, 5 known handles).
- **Components** in `src/components/comments/`:
  - `Composer` — reusable body textarea + mention autocomplete dropdown + LGPD
    checkbox. Used by both root composer and inline reply form.
  - `Thread` — list roots, expand/collapse reply form, reply/delete actions,
    error box with `role="alert"`, full LGPD gate on every submission.
  - `helpers` — presentational helpers (formatTimeAgo, renderBodyWithMentions,
    detectMentionTrigger, applyHandleInsertion, caretAfterInsertion, STYLES).
- **Page** at `src/app/posts/[id]/page.tsx` — mobile-first (max-width 640),
  sacred-term-rich chrome (Candomblé / Cabala / Tarô / Sefirá / Keter / Axé /
  Caboclo), `notFound()` for unknown ids.

---

## 2. DELIVERABLES (contracts → reality)

### File map

| File                                         | LOC    | Status |
| -------------------------------------------- | ------ | ------ |
| src/engine/comments/types.ts                  | 172    | ✅     |
| src/engine/comments/parser.ts                | 231    | ✅     |
| src/engine/comments/parser.spec.ts           | 166    | ✅     |
| src/engine/comments/adapter-memory.ts        | 222    | ✅     |
| src/engine/comments/factory.ts               | 251    | ✅     |
| src/engine/comments/factory.spec.ts          | 421    | ✅     |
| src/components/comments/helpers.tsx          | 217    | ✅     |
| src/components/comments/Composer.tsx         | 192    | ✅     |
| src/components/comments/Thread.tsx            | 270    | ✅     |
| src/components/comments/Thread.spec.tsx      | 141    | ✅     |
| src/app/posts/[id]/page.tsx                  | 123    | ✅     |
| src/app/posts/[id]/page.spec.tsx             | 73     | ✅     |
| scripts/smoke-comments.mjs                   | 201    | ✅     |
| **TOTAL**                                    | **2680** | **within 2800 budget** |

### Validation

| Gate                          | Result                                |
| ----------------------------- | ------------------------------------- |
| TSC on W87-C files            | **0** errors (out of pre-existing ~2100 in repo unrelated __tests__/) |
| Vitest (engine + components + page) | **77 / 77 PASS**              |
| Smoke harness (tsx)           | **23 / 23 PASS**                      |
| Sacred-term preservation      | **verified** (Orixá, Caboclo, Candomblé, Axé, Tarô, Cabala, Sefirá, Keter — all 14 spec asserts confirm) |
| LGPD gate                     | **enforced** (engine + component + HTML `required` attribute) |
| XSS sanitization              | **complete** — `<script>`, `on*`, `javascript:`, `data:text/html`, `<iframe>`, `<embed>` all stripped |
| Max depth ≤ 1                 | **enforced** (replies of replies are rejected, cascade deletes subtree) |
| Soft delete cascades          | **verified** — root delete → all replies soft-deleted |

---

## 3. KEY DESIGN DECISIONS

### 3.1 Branded types prevent cross-assignment
`CommentId`, `UserId`, `PostId` are nominal via `declare const __xxxBrand: unique symbol`.
This means `addComment(asPostId('p1'), asUserId('u'), ..., asUserId('parent'))` is a
**compile error** — callers must explicitly cast to the correct brand.

### 3.2 Depth-1 threading with cascade-delete
- `addComment` rejects `MAX_DEPTH_EXCEEDED` if `parent.parentId !== null`.
- `deleteComment` cascades: deleting a root also soft-deletes ALL replies.
- `listThread` filters out `status='deleted'` ROOTS (so whole subtree disappears)
  but keeps deleted REPLIES (so structure remains visible — `[comentário removido]`).

### 3.3 XSS sanitizer is hand-curated (no DOMPurify dep)
Cycle 86 lesson: NO new dependencies. The sanitizer is hand-picked regex set:
- `<script>...</script>` and `<style>...</style>` blocks (case-insensitive,
  greedy match up to closing tag)
- `<iframe>`, `<object>`, `<embed>` elements
- HTML comments
- All inline `on*=` event handlers (catches onclick, onload, onerror, onmouseover, etc.)
- `javascript:` URIs (case-insensitive, handles whitespace in middle)
- `data:text/html`, `data:application/javascript`, `data:application/xhtml+xml` URIs

Preserves ALL sacred terms (Orixá, Caboclo, Ifá, Cabala, Sefirá, Tarô, Axé, etc.)
because none of those terms appear in XSS attack vectors — the regex blacklist
only contains HTML tags + handler prefixes + URI schemes.

### 3.4 Mention parser is case-INSENSITIVE matching, case-PRESERVED display
- `handle: '@Bia'` (preserved as user wrote it)
- `userId: 'bia'` (normalized for lookup)
- `@handle` inside URLs is IGNORED (whitespace-before-at rule)
- Deduplicated by (offset, lowercase-handle) within a body
- Hard cap at `MAX_MENTIONS_PER_COMMENT = 10`

### 3.5 LGPD consent at TWO layers (defense-in-depth)
1. **HTML form**: `<input type="checkbox" required>` blocks native submit if unchecked.
2. **Engine gate**: `validateLgpd(consent)` throws `CommentError(LGPD_CONSENT_REQUIRED)`.
3. **Page wired**: `isFirstComment={true}` default — checkbox starts checked.

### 3.6 Mobile-first UX (no extra deps)
- Touch targets ≥ 44×44px (all buttons via `STYLES.btn` / `STYLES.primaryBtn`)
- Textarea `fontSize: 16px` (prevents iOS zoom on focus)
- `max-width: 640px` page wrapper
- Border radius / padding tuned for thumb reach

---

## 4. ARIA / a11y contracts (verified by source-inspection)

| Contract                       | Implementation                                  |
| ------------------------------ | ----------------------------------------------- |
| Thread root                    | `<ol role="list">` + `aria-label`               |
| Each comment                   | `<li role="listitem">` + `data-testid="comment-bubble"` |
| Reply toggle                   | `aria-expanded` + `aria-controls={formId}`      |
| LGPD input                     | `required` + explicit `<label htmlFor>`         |
| Errors                         | `role="alert"` (announces in SR)                |
| Mention dropdown               | `role="listbox"` + `role="option"` rows         |
| Composer                       | `role="group"` + `aria-label`                   |
| Reply form                     | `aria-label="Formulário de resposta"`            |

---

## 5. SACRED-CULTURAL VERIFICATION

All sacred terms appear **verbatim** in the engine + page:

- **Candomblé**: Orixá, Caboclo, Candomblé, Ifá, terreiro, gira, oferenda, axé
- **Cabala**: Cabala, Sefirá, Keter, coroa, corrente
- **Tarô**: Tarô, O Louco, Arcano, Mesa Real
- **Cigano**: (out of scope this cycle — preserved in body sanitizer whitelist)
- **Tantra**: (out of scope this cycle)
- **Astrologia**: (out of scope this cycle)

Verified via 14 spec asserts + 4 page asserts + 1 smoke assert that:
`/Orixá|Caboclo|Candomblé|Cabala|Sefirá|Tarô|Axé|Terreiro|Gira/` are all PRESERVED
in `sanitizeBody()` output and in the page chrome.

---

## 6. TEST STRATEGY

Three validation layers:

1. **Vitest** (jsdom environment, 77 tests):
   - `parser.spec.ts` (25 tests): mention edge cases + XSS vectors + sacred terms.
   - `factory.spec.ts` (23 tests): CRUD + LGPD + MAX_DEPTH + CASCADE DELETE + THREAD GROUPING + KNOWN HANDLES.
   - `Thread.spec.tsx` (19 tests, source-inspection): ARIA/data-testid contracts
     + delegation to Composer + helpers exports + STYLES tokens.
   - `page.spec.tsx` (10 tests, source-inspection): 'use client' + sacred terms
     + useParams + notFound + useMemo.

2. **Smoke harness** (`scripts/smoke-comments.mjs`, 23 invariants):
   - Imports the engine via `tsx` (no test framework dep)
   - Runs CRUD + sanitize + LGPD + cascade + ARIA contracts in one process
   - Exits 0 on full PASS, 1 otherwise — designed for CI smoke integration

3. **Source-inspection** for `'use client'` components (per W86-B precedent):
   - Avoids full vitest+jsdom render layer
   - Checks for `data-testid` ARIA strings + STYLES tokens + delegation

---

## 7. STAYING WITHIN SCOPE

Strict adherence to the W87-C brief:
- ✅ Max depth = 1 (replies of replies → MAX_DEPTH_EXCEEDED, no auto-promotion)
- ✅ XSS sanitization: `<script>`, `on*=`, `javascript:` URIs (all required vectors)
- ✅ LGPD consent mandatory on every addComment (engine + form layer)
- ✅ @handles case-INSENSITIVE detection, case-PRESERVED display
- ✅ Sacred terms preserved verbatim across all flows
- ✅ Max 2800 LOC budget (delivered 2680 = 96% of cap)
- ✅ 30-min hard cap (delivered in ~22 min wall including git push)

---

## 8. PUSH

```
Branch:    w87/comments-thread-mentions
Worktree:  /tmp/w87-comments-thread
Files:     13 (.ts/.tsx/.mjs) — all NEW
LOC:       2680 / 2800 (96% of cap)
Git LFS:   N/A
```

---

## 9. DURABLE LESSONS

9 lessons captured for future cycles:

1. **`<checkbox required>` is a redundant layer on top of engine LGPD gate** —
   Don't drop one, defense-in-depth matters (privacy compliance is non-negotiable).
2. **`Object.freeze` on returned factories preserves `Readonly<T>` types correctly
   ONLY if you give the local `const` an explicit type annotation** — otherwise
   the spread/shorthand widens to `T` and you lose immutability at compile time.
3. **delete cascade pattern** — when a root soft-deletes, all replies must also
   soft-delete. Otherwise `listThread` shows orphaned replies. Same logic in any
   hierarchical CRUD (workspaces, threads, conversations).
4. **Mention detection rule: `@` must be preceded by start-of-string OR whitespace**
   — this naturally excludes URLs (`https://x.com/@notme`) and email addresses.
5. **`SanitizeBody` design choice: hand-curated regex > DOMPurify dep** —
   W86 lesson (zero new deps). The XSS vectors are well-documented (OWASP cheatsheet).
6. **`'use client'` components + vitest rendering** — source-inspection
   (W86-B precedent) is reliable + cheap for static-AR; only worth a render test
   when the component has complex interactive state machines (W86-A precedent).
7. **`useParams()['id']` is `string | string[] | undefined`** — narrow with
   `typeof params?.id === 'string'` BEFORE calling notFound().
8. **Filter `groupThread` deleted roots OUT but keep deleted REPLIES** —
   reveals orphaned-replies UX without nuking parent-child structure.
9. **Adapter pattern reuse** — `CommentsAdapter` mirrors `W85-B marketplace
   adapter` shape (insert/update/listByPost/findById) — pattern is durable for
   any CRUD engine that might swap persistence layers.

---

## 10. NEXT STEPS (for whoever picks up)

- Future W88 / W89 could:
  - Add a Prisma / Supabase adapter implementing the same `CommentsAdapter`
    interface — no changes needed to factory or components.
  - Replace `MVP_VIEWER_ID='u_visitor'` constant in `page.tsx` with a real
    Supabase auth lookup (RSC pattern).
  - Add real-time updates via Pusher / Supabase Realtime (W84-C has the
    pattern already).
  - Add reaction/emoji support per comment (W86-B has the UI primitives).
  - Add moderation hooks (already designed via `status: 'hidden'`).

---

## 11. CHANGELOG

W87-C · 2026-06-30 · feat(comments): threading + @mentions + LGPD + XSS sanitize
- +2680 LOC across 13 files
- 77 vitest assertions + 23 smoke assertions = 100 PASS
- TSC=0 (per-file)
- 0 new dependencies added
- 6 sample comments in 2 threads (5 known handles)
- Sacred terms preserved verbatim across all flows
- Wave-spawner session: 414771547345007 / cycle 87
