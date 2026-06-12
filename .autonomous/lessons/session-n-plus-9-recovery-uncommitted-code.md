# Lesson — Recovering from a respawn with a half-staged working tree

**Date:** 2026-06-11
**Session:** N+9
**Commits:** 4b302865, d66c28d0, 820e6497, 7ff7a9bf

## Contexto

Session 037 was a fresh respawn that came back online with the
prior session's work-in-progress still in the working tree — not
staged, not committed. 11 files in `M`, ~50 files in `??` spanning
`@akasha/core`, `@akasha/mentor`, and the portal app.

The `index.ts` re-exports committed in the prior session (line 96:
`from './correlation-engine'`) already pointed at the untracked
`correlation-engine.ts` — meaning the build only "worked" because
vitest picked the file up from the filesystem. If anything
pruned untracked files (a `git clean -fd`, a fresh `pnpm install`
on a CI box, or a worktree sync), the package would not import.

## Aprendizado

1. **The untracked state IS the runtime.** When `index.ts` re-exports
   a module that is untracked, the package only works locally.
   `git status --short` must be the first diagnostic every respawn.
2. **`pnpm install` is a config clobberer.** Adding a new
   `dependencies:` block to a package.json and running install
   regenerates the workspace's `next.config.ts` template and
   **drops keys it does not recognize** (transpilePackages
   vanished after `pnpm install`). Always re-apply non-template
   config after install, and commit the re-apply as its own
   chore.
3. **Commit untracked code in domain-shaped slices, not file-by-file.**
   3 commits, ~13 source files, all tests green between each
   commit. The @akasha/core slice was the most consequential
   because index.ts already depended on it.
4. **Vitest will run untracked `*.test.ts` files** as long as the
   pattern matches. That gave 298/298 confidence before the first
   commit landed.
5. **Skip runtime artifacts:** `.autonomous/sessions/`,
   `$TELEMETRY_FILE`, `node_modules/` are not source. They get
   the .gitignore / runtime lifecycle, not commits.

## Como aplicar

* **STEP 0** in next session: `git status --short` is mandatory,
  not optional. If the working tree has untracked code that
  `index.ts` already references, **the first commit must be the
  recovery**, not a new feature.
* Whenever adding deps to a workspace package, **stage
  `next.config.ts` and `pnpm-lock.yaml` together** so the
  install-time clobber does not leak a regression.
* When triaging untracked code, **commit in domain order**:
  core → packages that core depends on → portal that consumes
  both. Reverse order leaves the build broken between commits.
* Stop signal cleanup: if `.autonomous/state/stop.signal` is
  present in `D` (deleted) state from prior session, leave it —
  do not `git restore` it back into the tree. It will get
  re-created by the orchestrator on next loop.
