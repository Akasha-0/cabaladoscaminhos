# Lesson — F-231 grimoire path pollution masked a real bug

**Date:** 2026-06-15
**Session:** ralph-loop iter 1 (respawned)
**Commit:** (this commit)
**Spec:** `.trae/specs/qualidade-i18n-en/spec.md` §Fase A

## Contexto

F-231 (qualidade-i18n-en) Fase A claimed "fix 4 i18n tests broken". When I
ran `pnpm test:run tests/lib/i18n/` (suite), all 4 files / 42 tests passed.
Spec described wrong root cause (filter AGENTS.md), so I almost moved on.

## Achado

Re-ran each i18n test in isolation per STEP 5.6 (test pollution check from
coding_prompt). `grimoire-completeness.test.ts` failed:

```
AssertionError: expected 0 to be greater than or equal to 80
  ❯ ../../tests/lib/i18n/grimoire-completeness.test.ts:51
```

`listAllGrimoire()` returned 0 files. Root cause: `findGrimoireRoot()` had
3 candidates:

1. `path.resolve(process.cwd(), 'grimoire')` — fails when vitest cwd is
   `apps/akasha-portal/` (which it is under `pnpm --filter`)
2. `path.resolve(__dirname, '..', '..', '..', '..', '..', 'grimoire')` —
   5 `..` from `tests/lib/i18n/`, lands at `/home/skynet/` (parent of parent
   of repo)
3. `path.resolve(__dirname, '..', '..', '..', '..', 'grimoire')` — 4 `..`,
   lands at `/home/skynet/` (one level too high)

None pointed to the actual monorepo root. The 3-`..` candidate (which would
land at the repo root) was missing.

When the i18n suite was run, the `dictionaries.test.ts` / `comprehensive`
tests imported the JSON files via `../../../apps/akasha-portal/src/i18n/...`
which DOES resolve correctly (3 `..` from `tests/lib/i18n/` to the root, then
into apps/akasha-portal/src/i18n/). That import resolution is the one the
spec called out, and it was actually correct. So the i18n suite passed
because the OTHER 3 files masked the broken 4th file's pre-test setup.

The 4th test (`grimoire-completeness.test.ts`) had its own file-system
path search that was independently broken — and was being masked by
nothing (it was the failure point all along, just hidden because the
spec falsely reported it as already-passing).

## Aprendizado

1. **"Suite passes" is NOT the same as "each test passes"** — classic test
   pollution. STEP 5.6 of `coding_prompt.md` mandates running both isolated
   AND suite before commit. This time it caught a real spec error.
2. **Spec text can lie about root cause.** F-231 spec claimed the problem
   was an `AGENTS.md` filter; that filter was already in the file. The
   real problem was a different file's path resolution. **Always verify the
   spec's diagnosis against ground truth** (`pnpm test:run <file>` + reading
   the file) before applying the prescribed fix.
3. **`existsSync` > `require('node:fs').accessSync`** — the latter requires
   an eslint-disable for `no-require-imports`. ESM-clean import is shorter
   AND lets the linter do its job.
4. **Path candidates for "find monorepo root" should be exhaustive across
   cwd variations**: include both `process.cwd()-relative` AND
   `__dirname-relative` paths with the right number of `..`.

## Como aplicar

- Before declaring a spec's "broken test" fixed, run each affected test in
  isolation (`pnpm test:run <path>`), not just the suite.
- When a spec describes a fix, **also read the actual file** to confirm
  the symptom matches the spec's root cause analysis.
- For path resolution in monorepo tests, always include the `__dirname`-
  based candidate (stable across cwd) and a `process.cwd()`-based
  candidate (works when run from repo root).
- Refactor `require('node:fs').accessSync` to `existsSync` from ESM
  import whenever you see an `eslint-disable @typescript-eslint/no-require-imports`.
