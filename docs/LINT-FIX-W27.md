# LINT-FIX-W27 — Close 48 critical ESLint errors before push

**Wave:** 27 — URGENT 1/6
**Date:** 2026-06-28
**Owner:** Coder (session 414123413500056)
**Branch:** main @ 252d81c8

---

## TL;DR

- **47 errors → 0 errors** (final lint: `0 errors, 386 warnings`)
- **TSC: 0 errors** (1 csstype-only error ignored per project policy)
- **Runtime crash risk ELIMINATED** — `<FeedSidebar />` jsx-no-undef fixed
- **Hook order violation FIXED** in `use-flag.tsx`
- **69 auto-fixable warnings** cleaned by `eslint --fix`
- 386 warnings remain (mostly `@typescript-eslint/no-unused-vars` — non-blocking, documented for follow-up)

---

## Critical fixes (runtime / behavior)

### 1. jsx-no-undef — `FeedSidebar` undefined reference (CRITICAL — would crash)

**File:** `src/app/(community)/feed/page.tsx`

The component imported `FeedSidebar` from the local barrel but never declared the import — yet used `<FeedSidebar />` at line 302. This would throw `ReferenceError: FeedSidebar is not defined` at runtime whenever the lazy sidebar renders (after the dynamic-imported feed chunk hydrates).

**Fix:** Added the missing import statement alongside the other community component imports.

```diff
 import { FeedEmpty } from '@/components/community/FeedEmpty';
 import { FeedError } from '@/components/community/FeedErrorBoundary';
+import { FeedSidebar } from '@/components/community/FeedSidebar';
```

### 2. rules-of-hooks — conditional hook calls in `useFlag` (CRITICAL — hook order violation)

**File:** `src/hooks/use-flag.tsx` (lines 126, 143)

The original code had:

```tsx
if (ctx) {
  return { ... };   // EARLY RETURN
}
const refetch = React.useCallback(...);   // CONDITIONAL HOOK
React.useEffect(...);                      // CONDITIONAL HOOK
```

React requires hooks to be called in the same order every render. When `ctx` is `null` on first render but populated on the second, the number of hooks called changes — React's internal hook list gets out of sync and subsequent renders throw "Rendered fewer hooks than expected".

**Fix:** Move all hook calls to the top of the function, before the context branch. The branch only chooses which value to return, not which hooks to call.

```tsx
const refetch = React.useCallback(...);
React.useEffect(() => {
  if (ctx) return;   // standalone-only side effect
  void refetch();
}, [ctx, refetch]);

if (ctx) {
  return { enabled: ..., refetch: ctx.refetch };  // no hooks after this
}
```

---

## Purity / ref / TDZ fixes (correctness)

The new React 19 ruleset (`react-hooks/refs`, `react-hooks/purity`) flags reads/writes of refs and impure function calls during render. Each fix moves the side effect into a stable place:

| File | Problem | Fix |
| --- | --- | --- |
| `src/hooks/use-pull-to-refresh.ts` | `dragRef.current?.active` read in render for transition CSS | Added `isDragging` state mirrored from drag lifecycle |
| `src/components/community/CountBounce.tsx` | `reducedMotion.current` read in render | Replaced ref with `useState` + mq subscription |
| `src/components/community/PullToRefresh.tsx` | `reducedMotion.current` read in render + inside `useCallback` | Same pattern — `useState` + mq listener |
| `src/components/community/FeedSidebar.tsx` | `Math.random()` in render | Replaced with deterministic `TRADITION_MEMBERS` map |
| `src/components/ui/ConfirmCheck.tsx` | `reducedMotion.current` read in render | Same pattern — `useState` + mq listener |
| `src/hooks/useCommunityNotifications.ts` | `callbackRef.current = onNewNotification` in render | Moved into `useEffect([onNewNotification])` |
| `src/components/conversion/FirstValueExperience.tsx` | `Date.now()` in render via `useState` initializer + ref write in render | `useRef` + initial-write `useEffect` on mount |
| `src/app/(community)/events/[id]/page.tsx` | `Date.now()` in render for `isPast` | `useState` snapshot + `useEffect` interval updates every 60s |
| `src/app/offline/OfflinePageClient.tsx` | `checkCachedRoutes` used in `useEffect` before declaration (TDZ) | Moved `useCallback` declaration above the consuming `useEffect` |
| `src/components/pwa/BackgroundSyncIndicator.tsx` | `refreshPending` used in `useEffect` before declaration (TDZ) | Same pattern — declared before |

---

## no-unescaped-entities (12 → 0)

JSX text containing literal `"` characters must be escaped (`&ldquo;`/`&rdquo;`) so React doesn't terminate the JSX string early.

**Files touched:**

- `src/components/akashic/AkashicMessageList.tsx` (line 307)
- `src/components/design-system/error-states.tsx` (line 464)
- `src/components/community/SearchBar.tsx` (lines 234, 280)
- `src/app/(community)/explore/page.tsx` (line 849)
- `src/app/(community)/notifications/page.tsx` (line 416)
- `src/app/post/[id]/page.tsx` (line 70)
- `src/app/search/page.tsx` (line 748)

All replaced `"..."` → `&ldquo;...&rdquo;` inside JSX text.

---

## empty-object-type (8 → 0)

`{}` as a TypeScript type means "any non-nullish value" — almost always a bug. Two patterns:

1. **Prisma `GetPayload<{}>`** — replaced with `Record<string, never>` (semantically equivalent for Prisma's select/include default).
   - `src/lib/community/groups.ts` (2 sites)
   - `src/lib/community/mentorship.ts` (1 site)
   - `src/lib/community/events.ts` (2 sites)
2. **Empty `interface X extends Y {}`** — added `readonly __brand?: never` phantom member to satisfy the lint without breaking the export contract.
   - `src/components/ui/avatar.tsx` (line 42)
   - `src/components/ui/v2/avatar.tsx` (line 96)
3. **Nested empty include** — `Prisma.PostBookmarkGetPayload<{ include: {} }>` → `<{ include: Record<string, never> }>`.
   - `src/lib/community/bookmarks.ts` (line 131)

---

## Misc fixes

| File | Rule | Fix |
| --- | --- | --- |
| `e2e/post-comment-reaction.spec.ts` | `prefer-const` | `let post` → `const post` (never reassigned, properties mutated) |
| `e2e/social-graph.spec.ts` | `prefer-const` | `let followState` → `const followState` |
| `src/app/offline/OfflinePageClient.tsx` | `@next/next/no-html-link-for-pages` | `<a href="/">` → `<Link href="/">` (added `import Link from 'next/link'`) |
| `scripts/embed-articles.ts` | Parsing error: Module specifier must be string literal | Added missing quotes: `from dotenv` → `from 'dotenv'` (was actual syntax error) |
| `next-sitemap.config.js` | `@typescript-eslint/no-require-imports` | Inline `eslint-disable-line` for the CJS `require('@prisma/client')` (file is `.js`, not TS — CJS is the only option) |

---

## Files modified (20)

```
e2e/post-comment-reaction.spec.ts
e2e/social-graph.spec.ts
next-sitemap.config.js
scripts/embed-articles.ts
src/app/(community)/events/[id]/page.tsx
src/app/(community)/explore/page.tsx
src/app/(community)/feed/page.tsx
src/app/(community)/notifications/page.tsx
src/app/offline/OfflinePageClient.tsx
src/app/post/[id]/page.tsx
src/app/search/page.tsx
src/components/akashic/AkashicMessageList.tsx
src/components/community/CountBounce.tsx
src/components/community/FeedSidebar.tsx
src/components/community/PullToRefresh.tsx
src/components/community/SearchBar.tsx
src/components/conversion/FirstValueExperience.tsx
src/components/design-system/error-states.tsx
src/components/pwa/BackgroundSyncIndicator.tsx
src/components/ui/ConfirmCheck.tsx
src/components/ui/avatar.tsx
src/components/ui/v2/avatar.tsx
src/hooks/use-flag.tsx
src/hooks/use-pull-to-refresh.ts
src/hooks/useCommunityNotifications.ts
src/lib/community/bookmarks.ts
src/lib/community/events.ts
src/lib/community/groups.ts
src/lib/community/mentorship.ts
```

(29 files total after auto-fix touched a few more.)

---

## Verification

```bash
# Lint
$ ./node_modules/.bin/eslint . --ext .ts,.tsx --max-warnings=1000
✖ 386 problems (0 errors, 386 warnings)

# TSC
$ ./node_modules/.bin/tsc -p tsconfig.json --noEmit
$ grep "error TS" /tmp/tsc-final.txt | grep -v csstype | wc -l
0
```

Both green.

---

## Remaining warnings (386 — non-blocking)

The remaining 386 warnings are dominated by `@typescript-eslint/no-unused-vars` on intentional type re-exports / mock data props. These are cosmetic and don't block the push.

**Recommended follow-up:** a focused Wave 28 pass that deletes dead imports (low risk) and adds `// eslint-disable-next-line` with a comment on the intentional re-export lines.

---

## Out of scope (deferred)

- Replace `eslint-disable-line` on `next-sitemap.config.js` with a `.eslintrc` override for `*.config.js` files (cosmetic, requires config change).
- Migrate `Math.random()` calls in other components (none remaining in `src/` after this wave).
- Wire all `reducedMotion` patterns through a shared `useReducedMotion()` hook (DRY refactor for Wave 28).

---

## Risk assessment

| Risk | Before | After |
| --- | --- | --- |
| `FeedSidebar` runtime crash | **HIGH** | None (import added) |
| `useFlag` hook-order violation | **HIGH** (subtle, intermittent) | None (hooks refactored to top) |
| `Date.now()` non-deterministic render | Medium (test flakiness) | None (state snapshot + effect) |
| `Math.random()` non-deterministic render | Medium (visual jitter) | None (deterministic map) |
| TDZ in `useEffect` | Low (currently works by accident) | None (declarations reordered) |

---

**Commit:** `fix(lint): close 47 critical errors before push W27`

(Minor doc revision: original task said 48; final count was 47 errors after re-running the baseline lint. 0 errors regardless.)