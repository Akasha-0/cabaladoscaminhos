# Coder Report — `/api/posts` + Feed wiring task

**Status:** ❌ **BLOCKED — task describes work that is already done (and superseded).**
**Date:** 2026-06-27
**Agent:** Coder (session 413639925625112)
**Branch:** `feat/community-platform`

---

## TL;DR

The task asks me to:

1. **Create** `src/app/api/posts/route.ts` with a mocked GET/POST handler.
2. **Modify** `src/app/(community)/feed/page.tsx` to replace a hardcoded `MOCK_POSTS` with `fetch('/api/posts')`.

**Neither starting point exists.** Both files are already implemented with a more advanced, production-shaped version that supersedes the mocks the task envisions. Executing the task as written would **regress the codebase**.

I have therefore made **zero code changes** and **zero commits**. This report documents the discrepancy with file paths, line evidence, and git history so the next agent (or the user) can decide what to do.

---

## Investigation Trail

### File 1 — `src/app/api/posts/route.ts` (already exists, real implementation)

The file exists at `src/app/api/posts/route.ts` (115 lines) and exports both `GET` and `POST` handlers. Sample of the actual content:

```ts
// from src/app/api/posts/route.ts
import { FeedQuerySchema, CreatePostSchema } from '@/lib/validators/posts';
import { ok, fail, fromZodError, handleError, ErrorCode } from '@/lib/community/api';
import { getFeed, createPost } from '@/lib/community/posts';
import { getViewer, requireViewer } from '@/lib/community/auth';
import { checkPostRateLimit } from '@/lib/community/rate-limit';

export async function GET(request: NextRequest) {
  // ... validates query via FeedQuerySchema, calls getFeed(), returns paginated DTO
}

export async function POST(request: NextRequest) {
  // ... requireViewer() for auth, rate-limit check, zod validation, createPost() via Prisma
}
```

It does **not** return mocks. It validates with `FeedQuerySchema` / `CreatePostSchema` from `@/lib/validators/posts`, calls into `getFeed()` / `createPost()` from `@/lib/community/posts` (which in turn hit Prisma), enforces auth via `requireViewer()`, and rate-limits via `checkPostRateLimit()`.

**Comparison vs. the task's proposed file:**

| Concern                    | Task's proposal                              | Existing file                                                |
| -------------------------- | -------------------------------------------- | ------------------------------------------------------------ |
| Persistence                | Hardcoded `MOCK_POSTS` array                 | Prisma via `getFeed` / `createPost` helpers                  |
| Auth                       | None                                         | `requireViewer()` (401 if anonymous)                         |
| Rate limit                 | None                                         | `checkPostRateLimit()` (429 if exceeded)                     |
| Validation                 | Inline `z.object({...})`                     | Shared `@/lib/validators/posts` (reused by hooks + tests)    |
| Pagination                 | Manual `slice(start, start+limit)`           | Cursor-based via `FeedQuerySchema.cursor` + `nextCursor`     |
| Filters                    | None                                         | `tradition`, `topic`, `authorId`, `groupSlug`                |
| Response envelope          | `{ items, nextCursor, total }`               | `{ data, meta: { nextCursor, total, count } }` via `ok()`    |
| Post types                 | Just `content` + `traditions[]` + citations | Enum (`TEXT`/`LINK`/`ARTICLE`/`QUESTION`/`EXPERIENCE`/`PRACTICE`), tradition, topic, groupSlug, mediaUrls, references, mentions |
| Citation shape             | `{ label, url }`                             | `{ title, url?, doi?, year? }` (academic-grade)              |

**Replacing this with the task's mock file would delete a tested, schema-validated, auth-gated, rate-limited API in favor of a stub.** That is a regression, not progress.

Git evidence — this file was authored by `dfdee9de feat(community): pivot completo pra comunidade universalista v3.0` (the only commit touching it):

```
$ git log --oneline --all -- src/app/api/posts/route.ts
dfdee9de feat(community): pivot completo pra comunidade universalista v3.0
```

### File 2 — `src/app/(community)/feed/page.tsx` (already wired to API via hooks)

The file exists at `src/app/(community)/feed/page.tsx` (245 lines). Its own header comment, line 7–8:

```ts
// Conectado à API real (`/api/posts`) via hooks `useFeed`/`useLikePost`/etc.
// Mocks removidos — agora o feed consome dados persistidos no Prisma.
```

The component imports real hooks from `@/hooks/usePosts`:

```ts
import {
  useFeed,
  useCreatePost,
  useLikePost,
  useDeletePost,
} from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';
```

And uses them inside the component:

```ts
const feed = useFeed({ limit: 20 });
const { createPost, loading: creating } = useCreatePost({ prependPost: feed.prependPost });
const { toggleLike } = useLikePost(feed);
const { deletePost } = useDeletePost({ removePost: feed.removePost });
```

Render already includes loading/error/empty/refresh states via `<FeedSkeleton>`, `<FeedError>`, `<FeedEmpty>`, and `feed.refresh`/`feed.loadMore` — exactly the UX surface the task asks me to "adaptar".

**The hardcoded `MOCK_POSTS` the task references does not exist anywhere in the repo:**

```
$ grep -rn "MOCK_POSTS\|MOCK_POSTS_TYPE" src/
(no matches)
```

**Patching the task's snippet into this file would:**

- Reference `MOCK_POSTS_TYPE` which is undefined → TS error.
- Replace the `useFeed` hook (which handles loading/error/cursor/refresh internally) with raw `useState + useEffect + fetch`, which is strictly worse.
- Introduce a parallel implementation of state management that diverges from the hook contract used by `useCreatePost` / `useLikePost` / `useDeletePost` (they mutate the feed store).

Git evidence — `dfdee9de` rewrote this file (`561 ++--------` line change). It is the canonical, current implementation.

---

## Procedure vs. Reality

| Task step                                          | Reality                                                                |
| -------------------------------------------------- | ---------------------------------------------------------------------- |
| 1. Create `src/app/api/posts/route.ts` with mocks  | File already exists with real Prisma-backed implementation             |
| 2. Edit feed/page.tsx to remove `MOCK_POSTS` (L63) | No `MOCK_POSTS` in file; line 63 is unrelated JSX                      |
| 3. Add `useState`/`useEffect`/`fetch` to feed      | Feed already uses `useFeed`/`useCreatePost`/`useLikePost`/`useDeletePost` |
| 4. Add loading/error UI                            | Already present via `<FeedSkeleton>` / `<FeedError>` / `<FeedEmpty>`   |
| 5. Run `tsc --noEmit` and fix new errors           | Nothing to fix in the files I'd touch (see TSC section)                |
| 6. `git commit` with the proposed message          | No diff to commit                                                       |

---

## Why I Did Not Execute Blindly

- The user-stated rule in this task: **"NÃO modifique outros arquivos"** — destroying the working API + hooks to install a mock would violate the *spirit* of that rule (it touches the architecture, not just the listed files).
- The user-stated rule: **"Se TSC falhar, corrija apenas erros INTRODUZIDOS pelos seus arquivos"** — there are no errors introduced, because there are no new files.
- Durable preference in `user_profile` (2026-06-27): **"User does NOT want fabricated 'all green' results — honesty > performance."** Filing a fake "delivered" report after regressing real code with a stub would be a worse outcome than reporting BLOCKED.
- Sibling preference (same date): **"User accepts BLOCKED reports when source data is missing… Did NOT fabricate success"** — the upstream prerequisite (the gap) is no longer there; the work has been done.

---

## TSC Verification

`timeout 90 npx tsc --noEmit --skipLibCheck` on the **unchanged** working tree:

```
node_modules/csstype/index.d.ts(6385,11): error TS1010: '*/' expected.
src/app/(community)/feedback/page.tsx(62,2):  error TS1005: ',' expected.
src/app/(community)/feedback/page.tsx(62,11): error TS1005: ',' expected.
src/app/(community)/feedback/page.tsx(62,15): error TS1005: ',' expected.
src/app/(community)/feedback/page.tsx(62,23): error TS1005: ',' expected.
src/app/(community)/feedback/page.tsx(62,24): error TS1109: Expression expected.
```

- **0 errors** in `src/app/api/posts/route.ts`
- **0 errors** in `src/app/(community)/feed/page.tsx`
- 6 errors total: 5 in `src/app/(community)/feedback/page.tsx` (sibling, **out of scope**, and the task explicitly says to ignore unrelated TSC errors) + 1 in `csstype` (node_modules, irrelevant).

---

## Changed Files

**None.** No write/edit was performed. Branch `feat/community-platform` has no new commits on this turn.

---

## Notes for the Verifier

- To confirm the gap-analysis claim of "feed with mocks", inspect commit `11464cee feat(community): MVP feed + landing page + prisma schema` — that was the *prior* state with mocks. The mocks were removed by `dfdee9de` on the same branch.
- The gap analysis doc (`408d122a docs(evolution-log): gap analysis 2026-06-27`) was authored **before** the pivot commit `dfdee9de` that resolved it. The merge `4cf270dc` brought the analysis doc in, but the implementation gaps it flagged were already closed on the destination side. The task ticket is stale.
- The hooks used by `feed/page.tsx` are in `src/hooks/usePosts.ts`; the helpers used by the route are in `src/lib/community/posts.ts`; validators in `src/lib/validators/posts.ts`. All three exist and are exercised by tests in `__tests__/api/posts.test.ts` (per `git show dfdee9de --stat`: **403 lines added**).

---

## Recommended Next Steps

1. **Close the ticket** — the deliverable already exists in a stronger form than the ticket envisioned.
2. **Update the gap analysis doc** (`docs/EVOLUTION-LOG.md` section "P0 #4 — substituir mocks do feed") to mark it DONE and reference commit `dfdee9de`.
3. **Audit the remaining P0 items from the gap analysis** to see if any are still actually open (P0 #1 = schema merge; P0 #2 = remove B2B deps; P0 #3 = `.env.example`; #4 = mocks; #5+ …). Only #4 is the one this task was scoped to.
4. **If a new Coder task is desired** (e.g., "verify the existing /api/posts route hits Prisma end-to-end and write a smoke test"), that should be a *new* ticket, not a re-run of this one.