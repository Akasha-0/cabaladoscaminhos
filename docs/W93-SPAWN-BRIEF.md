# W93 Spawn Brief — Common Template

> **Wave-spawner:** Mavis (session 414838017175841) — Cycle 93
> **Spawn @:** 2026-06-30 15:00 UTC
> **Cap:** 30 min hard (apply 5× = 150 min for silent-stuck detection)
> **Pattern source:** cycle 92 lessons (W92-B/C/D shipped @ 8-9 files / 2,400-3,400 LOC, TSC=0, 50+ asserts)

## Sandbox State (verified @ spawn time)

- **Repo:** `/workspace/cabaladoscaminhos` @ `acb080f` (main)
- **MEM available:** 1978MB (>1000MB threshold ✅)
- **node_modules:** installing in main (workers will symlink: `ln -s /workspace/cabaladoscaminhos/node_modules ./node_modules`)
- **GITHUB_TOKEN:** configured via insteadOf
- **Git identity:** `wave-spawner@akasha.local` / `Wave Spawner` (or use `Mavis@MiniMax.local` / `Mavis`)
- **Worktrees already created:**
  - `/workspace/wt-w93-reputation` @ branch `w93/reputation-system`
  - `/workspace/wt-w93-auth` @ branch `w93/auth-followup`
  - `/workspace/wt-w93-events` @ branch `w93/events-workshops`
  - `/workspace/wt-w93-i18n` @ branch `w93/i18n-rollout`

## Non-negotiable Rules

1. **Per-file TSC = 0 errors.** Run `timeout 60 ./node_modules/.bin/tsc --noEmit --skipLibCheck <your-file-glob>` and assert exit 0 + zero error lines. NEVER run `tsc -p` on the whole repo (will surface 100+ pre-existing errors from W28 router fix that aren't your concern).
2. **Spec via `node --import tsx --test`.** Use `node:test` 22+ describe blocks. Target ≥30 asserts. Each describe block must add ≥1 assert (cycle 92 lesson #6).
3. **Smoke script via `node --experimental-strip-types`.** Target ≥20 runtime asserts. Pattern: import the engine, exercise happy path + 2-3 edge cases, log each assert to stdout.
4. **Symlink node_modules** before running any test:
   ```bash
   cd /workspace/wt-w93-<your-theme>
   ln -sf /workspace/cabaladoscaminhos/node_modules ./node_modules
   ```
5. **Push via `git push -u origin <branch>`.** Sandbox has `GITHUB_TOKEN` configured. If push wedges, document the exact command for the user to run locally and create a deliverable that includes the commit hash locally (`git rev-parse HEAD`).
6. **No merge to main.** Wave-spawner pattern: workers push branches, user merges.

## Sacred-Cultural Compliance (MANDATORY)

The project serves **Cabala dos Caminhos** — preserve all sacred terminology in pt-BR (Candomblé, Umbanda, Ifá, Astrologia, Cabala). Forbidden in code/strings: "orishas", "ashé", "iemanja" without nasal, etc. Use **orixás**, **axé**, **Iemanjá**. Use cycle 60+ lesson: **stripComments() helper** before any banned-vocab source scan.

Sacred terms to preserve verbatim across any i18n:
- orixás / Orixás
- axé
- Odu (singular, capital O)
- Odus (plural)
- entidades
- Cigano Ramiro
- Akasha
- pemba
- Ifá
- Candomblé
- Umbanda

## Must-Include Lessons from Cycles 87-92 (brief TL;DR)

1. **`node --import tsx -e <code>` does NOT work** — tsx loader only applies to files. Workaround: tmpfile shim.
2. **`as const satisfies Record<…>` is the sweet spot** for const objects needing literal types.
3. **`value === ''` in literal-union types triggers TS2367** — use `if (!(value as string))` or `(value ?? '')`.
4. **CLDR es-ES omits thousands separator for 4 digits** — `formatNumber(1234.5, 'es')` returns `"1234,5"`.
5. **Destructured `const { meta } = useT(); meta[loc]`** loses narrowing of `Readonly<Record<…>>` → `unknown`. Cast explicit.
6. **`let count = 0; tick(name)` + test() final asserting `count >= N`** guarantees minimum coverage without framework.
7. **stripComments()** is essential for banned-vocab source scans — naive filters trip on JSX/Tailwind.
8. **Fake-clock injection** (`{ now: () => fakeNow }`) for any TTL/presence engine test.
9. **History-bounded tests** need `stride < TTL/COUNT`.
10. **Word-boundary regex** for source inspection — `\b` or specific anchors.
11. **Source-inspection emojis:** assert on `.map(e => e.code)` patterns, not literals.
12. **LGPD layers:** strip reporter identities, omit `details` when null, `stripReporterIdentities()` helper.
13. **Smoke order-dependence** in shared store — use unique IDs per test.
14. **page:undefined in metadata** is safer than `page: null` in worker self-reports.
15. **public readonly strip-types quirk** — don't re-export public readonly from a non-readonly source.

## Required Deliverable Structure

```
src/lib/w93/<theme-slug>.ts                # engine
src/components/<area>/<Component>.tsx      # UI (1-2 components)
src/app/<route>/page.tsx                   # demo page
scripts/smoke-<theme>.mjs                  # runtime asserts
src/lib/w93/__tests__/<theme>.spec.ts      # unit tests
docs/DELIVERABLE-W93-<X>.md                # runbook + lessons
```

Target: **8-9 files, 2,400-3,400 LOC total**.

## Self-Report Format (final message to wave-spawner)

```markdown
## W93-<X> [SHIPPED | BLOCKED] @ <HH:MM UTC>

**Branch:** `w93/<theme>` @ `<commit-sha>`
**Worker session:** <your-session-id>
**Wall time:** <minutes> min

**Validation:**
- TSC: <N> errors in W93 files
- Spec: `<M>/<M>` PASS via `node --import tsx --test`
- Smoke: `<K>/<K>` PASS via `node --experimental-strip-types scripts/smoke-<theme>.mjs`
- Sacred-cultural: 0 banned-vocab hits via stripComments() source scan

**Files (<count>, <LOC> LOC):**
- <list>

**<N> NEW durable lessons:**
- <list>

**Next-cycle candidates:** <list>
```

## Forbidden Behaviors

- ❌ Merge to main
- ❌ Run `tsc -p tsconfig.json` (whole repo — will surface pre-existing errors)
- ❌ Invent esoteric correspondences (read `GOAL.md` if engine touches spirituality)
- ❌ Refactor unrelated code
- ❌ Use forbidden sacred terminology in code
- ❌ Skip the smoke script

## If You Hit a Wedge

1. `git add -A` or `git commit` hangs? Use `scripts/commit-wave20.sh` pattern or document the exact command for local run.
2. `git push` hangs? Document the push command + commit SHA; user runs locally.
3. npm install wedges in your worktree? Symlink from main: `ln -sf /workspace/cabaladoscaminhos/node_modules ./node_modules` (this is the W92 fix).
4. TSC surfaces >100 errors? You ran on whole repo. Re-run with per-file glob on YOUR files only.
