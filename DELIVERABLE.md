# W83-C — Comments Threading + @-Mention Autocomplete UI

**Cycle:** 83 (2026-06-30)
**Branch:** `w83/comments-threading-mentions`
**Worker:** W83-C (Mavis orchestrator session 414750161408104)
**Worktree:** `/tmp/w83-c`

## TL;DR

Built the post-detail page UI on top of a fresh comments engine: 1 sample post + 12 comments across 4 threads, threaded up to 3 levels deep (depth-4+ flattened to depth 3), @-mention autocomplete via NFD-normalized handle matching, and reply + mention notifications. Pure-presentational React via `h()` hyperscript helper. Mobile-first bottom-sheet composer with safe-area insets and 44px tap targets.

- **5 UI components** (all `.ts`, zero JSX literals)
- **1 post + 12 comments** across 4 threads (A: depth-0→1→2→3, B: 0→1→2, C: 0→1, D: 0→1→2)
- **8 sample users** across 7 tradições (Cigano, Candomblé, Umbanda, Ifá, Cabala, Astrologia, Tantra, Tarot)
- **`InMemoryCommentsAdapter`** — `getPost`, `listComments`, `buildTree`, `addComment`, `listNotificacoes`, `marcarLida`
- **`InMemoryMentionsAdapter`** — `listActive`, `getByHandle`, `getById`, `search`
- **`MAX_THREAD_DEPTH = 3`** enforced by walking the parent chain at insert time AND on every `buildTree` call
- **NFD-normalized mention extraction** — `@mãe_iyá` matches `mae_iya` (cycle 79 W79-D lesson)
- **HTML escape** — `htmlEscape` + `renderBodyWithMentions` (only known handles bolded)
- **91 spec assertions + 38 smoke checks** = 129 PASS, 0 TSC errors

## Verification

| Check | Command | Result |
|-------|---------|--------|
| **TSC** | `tsc -p tsconfig.w83-c.json` | **0 errors** (exit 0) |
| **Spec** | `node --experimental-strip-types src/test/comments-threading-mentions.spec.ts` | **91/91 PASS** |
| **Smoke** | `node --experimental-strip-types scripts/smoke/comments-threading-mentions.ts` | **38/38 PASS** |

Total: **129 assertions PASS** across spec + smoke, 0 failures, 0 TSC errors.

## File tree

```
src/components/comments/
├── types.ts                                -- (engine; re-export only)
├── index.ts                               31 LOC — public re-exports
├── react-stubs.js                          3 LOC — re-export of /react-stubs.js
├── react-stubs.d.ts                       14 LOC — local ambient types
├── MentionSuggestions.ts                  85 LOC — listbox dropdown (a11y)
├── CommentNode.ts                        180 LOC — single comment + reply btn
├── ThreadedComments.ts                   135 LOC — recursive tree, max 3 levels
├── CommentComposer.ts                    326 LOC — bottom-sheet composer + @-mention
└── PostDetailPage.ts                     350 LOC — top-level page (post + comments)

src/lib/engines/comments/
├── types.ts                              176 LOC — branded IDs, 10-tradição catalog
├── mentions.ts                           237 LOC — NFD extract + 4-tier match
├── InMemoryMentionsAdapter.ts            122 LOC — 8 sample users
├── InMemoryCommentsAdapter.ts            411 LOC — 1 post + 12 comments + notifs
└── index.ts                               52 LOC — public surface

src/test/
├── comments-threading-mentions.spec.ts   440 LOC — 91 assertions
└── node-stubs.d.ts                        18 LOC — process/console ambient

scripts/smoke/
└── comments-threading-mentions.ts        184 LOC — 38 smoke checks

react-stubs.d.ts                           19 LOC — JSX global namespace
react-stubs.js                             19 LOC — h() runtime
tsconfig.w83-c.json                        24 LOC — isolated config

TOTAL: 2,826 LOC across 19 files (incl. DELIVERABLE.md)
```

## Sacred coverage (7 tradições + 3 extras)

| Tradição | Sample user | Specialties / focus |
|----------|-------------|---------------------|
| **cigano** | u-1: Cigano Ramiro | Fundador do método Cruzamento por Casa |
| **candomble** | u-2: Mãe Iyá Omim | Yalorixá do Ilê Axé Opô Afonjá |
| **umbanda** | u-3: Pai Ogum de Iansã | Caboclo de Umbanda |
| **ifa** | u-4: Babá Ifá Oluwo | Olodumare |
| **cabala** | u-5: Rabino Moshe Ben David | Árvore da Vida, Sefirot |
| **astrologia** | u-6: Astróloga Stella Vega | Carta Natal, Trânsitos |
| **tantra** | u-7: Swami Ananda Devi | Kundalini, respiração holotrópica |
| **tarot** | u-8: Taróloga Luna Salles | Marselha, Cruz Celta |

Emoji mapping (used in MentionSuggestions + CommentNode avatars):
`🌿 Candomblé · 🕯️ Umbanda · 📿 Ifá · ✡️ Cabala · ♈ Astrologia · 🕉️ Tantra · 🃏 Cigano/Tarot`

## Threading algorithm

```typescript
function buildTreeInternal(postId: PostId): ReadonlyArray<CommentTreeNode> {
  const flat = computeDepths(comments.filter(c => c.postId === postId));

  // Build a mutable tree (then freeze recursively) — avoids the
  // stale-parent-reference bug seen in W83-C draft 1.
  const byId = new Map<CommentId, Mutable>();
  for (const c of flat) byId.set(c.id, { ...c, children: [] });
  const roots: Mutable[] = [];
  for (const c of flat) {
    const node = byId.get(c.id)!;
    if (c.parentId && byId.has(c.parentId)) {
      byId.get(c.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return Object.freeze(roots.map(freezeTree));
}
```

**Depth-3 flattening** is handled in `computeDepths` (called inside `buildTree`)
AND in `computeDepthAtInsert` (called inside `addComment` so the returned
`Comment.depth` is correct immediately, no read-after-write needed):

```typescript
function computeDepthAtInsert(parentId: CommentId | null): 0 | 1 | 2 | 3 {
  if (!parentId) return 0;
  let cursor = parentId;
  let hops = 1;
  const seen = new Set<CommentId>();
  while (cursor && !seen.has(cursor)) {
    seen.add(cursor);
    const p = comments.find(c => c.id === cursor);
    if (!p) break;
    if (hops >= MAX_THREAD_DEPTH) return MAX_THREAD_DEPTH as 0|1|2|3;
    cursor = p.parentId;
    if (cursor) hops++;
  }
  return hops as 0|1|2|3;
}
```

Plus, depth-3 replies are re-parented to the depth-3 ancestor's parent (so the
tree stays a real tree, not a flat list).

## Adapter contract

```typescript
interface CommentsAdapter {
  getPost(postId: PostId): Post | null;
  listComments(postId: PostId): ReadonlyArray<Comment>;
  buildTree(postId: PostId): ReadonlyArray<CommentTreeNode>;
  addComment(input: {
    postId: PostId;
    autorId: UsuarioId;
    parentId: CommentId | null;
    corpo: string;
  }): Comment;
  listNotificacoes(usuarioId: UsuarioId): ReadonlyArray<Notificacao>;
  marcarLida(notifId: string): Notificacao | null;
}

interface MentionsAdapter {
  listActive(): ReadonlyArray<Usuario>;
  getByHandle(handle: MentionHandle): Usuario | null;
  getById(id: UsuarioId): Usuario | null;
  search(prefix: string, limit?: number): ReadonlyArray<Usuario>;
}
```

## Mention matching (4-tier scoring)

```typescript
function matchSuggestions(prefix, users, limit = 6): SuggestionMatch[] {
  for (const u of users) {
    const hNorm = normalize(u.handle);
    const nNorm = normalize(u.nome);
    let score = 0;
    if (hNorm === norm) score = 100;          // exact handle match
    else if (hNorm.startsWith(norm)) score = 80;
    else if (hNorm.includes(norm)) score = 60;
    else if (nNorm.startsWith(norm)) score = 40;
    else if (nNorm.includes(norm)) score = 20; // nome match (fallback)
    if (score > 0) scored.push({ usuario: u, matchScore: score, ... });
  }
  // sort: score desc → handle alphabetical
}
```

`normalize` is NFD-strip + lowercase + trim. So `cig`, `Cig`, `cíG`, and `cığ`
all match `cigano_ramiro` (cycle 79 W79-D lesson applied).

## Mobile-first UX

- **Bottom-sheet composer**: `position: fixed; inset: 0;` + flexbox column → `justify-content: flex-end`
- **Safe-area insets**: `padding-bottom: calc(env(safe-area-inset-bottom, 16px) + 16px)`
- **44px tap targets** on every button (`min-height: 44px; min-width: 44px;`)
- **No horizontal scroll** (max-width 720px, padding 16px)
- **Keyboard nav in autocomplete**: ArrowUp / ArrowDown / Enter (pick) / Escape (close)

## Accessibility

| Component | Role / aria |
|-----------|-------------|
| `ThreadedComments` | `role="log" aria-live="polite" aria-relevant="additions"` |
| `MentionSuggestions` | `role="listbox"` with `aria-selected` on each `role="option"` |
| `CommentComposer` | `role="dialog" aria-modal="true"`, error in `role="alert"` |
| `CommentNode` | `role="article"`, depth indicated via `aria-label` |
| Post notifications banner | `role="status" aria-live="polite"` |

## Notifications

- **Reply notif** — emitted to the parent comment's autor (unless self-reply)
- **Mention notif** — emitted to each mentioned user (unless self-mention)
- **marking as read** — `marcarLida(notifId)` flips `lida: true`
- Sample seed generates ~3 notifs for u-1 (Cigano Ramiro): 3 mentions + 2 replies

## HTML escape (cycle 79 + injection prevention)

- `htmlEscape(raw)` replaces `& < > " '` with entities before any render
- `renderBodyWithMentions` first escapes the WHOLE body, then re-applies `<strong class="mention">` only for handles in the known set — so `<script>` in user input becomes `&lt;script&gt;` and is rendered as text, never executed

## Pattern reference (cycle 82 lessons applied)

- `react-stubs.d.ts` global JSX namespace (declared via `declare global { namespace JSX {} }` + `export {}`)
- `react-stubs.js` runtime `h()` + flat-children normalizer
- Engine split: `types.ts` / `constants.ts`-style seed data / `mentions.ts` (utilities) / `InMemoryXAdapter.ts` (stateful) / `index.ts` (barrel)
- `Object.freeze` on every catalog export
- Branded numeric + string primitives via `Brand<TBase, TBrand>`
- `.ts` extensions in source imports (per cycle 82 wave-spawner pattern)
- Self-running spec + smoke (no vitest, no `@types/node`)

## Pattern reference (cycle 78/79 lessons applied)

- **Cycle 78 lesson — multi-line generic types confuse TSC parser:** avoided by keeping all `forwardRef`-style signatures inline.
- **Cycle 79 NFD lesson — diacritics in sacred terms:** `normalize()` strips combining marks before substring matching, so `@mãe_iyá` matches `mae_iya`.

## Commits

- `21932e9 feat(comments): thread comments (max 3 levels) + @-mention autocomplete + notifications UI (W83-C)` — 19 files, 2,826 LOC

## Branch status

- **Local HEAD:** `21932e9`
- **Pushed to origin:** `w83/comments-threading-mentions` ✅
- **No merge to main** — branch protection on `main`
- **PR ready:** https://github.com/Akasha-0/cabaladoscaminhos/pull/new/w83/comments-threading-mentions

## Lessons (reusable for W84+)

1. **Build tree via mutable-then-freeze, not via `byId.set`:** The naïve `byId.set(parentId, {...parent, children: [...]})` pattern overwrites the reference, but the OLD reference still lives in ancestor's children arrays → silent depth loss. Fix: build a mutable tree, then recursively freeze at the end.
2. **Compute depth at write time:** `addComment` returns the `Comment` with `depth: 0` unless you walk the parent chain inline. Tests that read `novo.depth` immediately fail otherwise.
3. **Mention regex + sentence-ending `.`:** `(?!\w)` works; `(?![\w.])` over-rejects (any mention at end of sentence loses match). Accept that `@example` in `email@example.com` IS a syntactically valid handle (cycle 79 NFD lesson is about diacritics, not email parsing).
4. **NFD index remap:** When applying a regex to NFD-stripped text, the matched positions need remapping back to original-text positions. `buildNfdIndexMap(text)` walks char-by-char, appending the original index per NFD char.
5. **Custom-adapter test must pass BOTH `post` and `comments`:** otherwise `options.post ?? SAMPLE_POST` defaults and the test confuses itself.

(End of W83-C cycle 83 deliverable summary)