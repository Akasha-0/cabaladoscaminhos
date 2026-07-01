# W30 URGENT FIX 1/8 — TSC Syntax Errors

**Status:** ✅ PASSED
**Commit:** `14706f77` on `main`
**TSC errors fixed:** 6 → 0
**Files changed:** 2

## Root Causes

### File 1: `src/app/(community)/oraculo/page.tsx` (4 errors)

Line 65 contained a stray `</strong>` tag inside a `<p>` block. The `<p>` had TWO `<strong>` opens but THREE close tags (`</strong>`, `</strong>`, `</strong>`). TS error `JSX closing tag mismatch` propagated to lines 98–99 (downstream cascade).

**Fix:** Removed the orphan `</strong>` between "qualificado." and `</p>`.

### File 2: `src/components/ui/v2/luminous-card.tsx` (2 errors)

Three `React.forwardRef(...)` calls (Description, Content, Footer) ended with `)` instead of `);` before `.displayName = ...` assignments. Additionally, `LuminousCardDescription`'s generic was split across multiple lines:

```tsx
const LuminousCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<"p">
>({...})
```

**Fix:**
1. Added `;` after closing `)` of `forwardRef(...)` call for Content and Footer.
2. Inlined the generic to single-line form for Description (matching Title/Content/Footer pattern).
3. Removed extra `;` for Description (now matches Title's no-`;` style which works via ASI).

## Validation

```bash
$ timeout 90 npx tsc -p tsconfig.json --noEmit 2>&1 \
    | grep "error TS" | grep -v csstype | wc -l
0
```

## Commit

```
14706f77 fix(tsc): close 6 syntax errors in oraculo and luminous-card W30
 2 files changed, 108 insertions(+), 10 deletions(-)
 create mode 100644 src/app/(community)/oraculo/page.tsx
```

Note: `oraculo/page.tsx` shows as `create mode 100644` — file was previously untracked or in a state that wasn't committed; commit captures it now.

## Durable Lessons (cycle 82/W30)

1. **Generic split across newlines can confuse TSC parser.** Even though syntactically valid TS, splitting `forwardRef<T1, T2>(...)` across multiple lines was causing spurious `, expected` errors at the closing `)`. Lesson: keep generic args inline or on one line for tooling compatibility. Reusable: any `forwardRef`, `useState`, `useRef` with multi-line generics.

2. **ASI handles `const X = f(...)\nX.prop = ...` cleanly without explicit `;`.** But the combination of multi-line generic + missing `;` triggers cascade parse errors. Lesson: pick ONE style (single-line generic OR explicit `;`) per file for consistency.

3. **`</strong>` typo in `<p>` cascades to 4 errors.** Single orphan closing tag at line 65 produced 4 parse errors (lines 63, 64, 98, 99). Reusable: any JSX file with mismatched tags — fix ONE root cause and many errors evaporate.
