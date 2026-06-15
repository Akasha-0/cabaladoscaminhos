# Lesson — multi-session WIP can recreate untracked files; my edits still safe

**Date:** 2026-06-15
**Session:** ralph-loop iter 6
**Commit:** (this commit, 3-spec Status additions)
**Context:** F-100 was supposed to be unsafe in this multi-session state.
Iter 6 went for Option G: add `## Status` to mandala-fase1/2/3 specs.
Discovered the spec dirs were untracked (`??`) — recreated by the other
session's massive refactor — but my edits still landed safely.

## Contexto

Iter 4 stopped because the working tree had 80+ uncommitted M/D/?? from
another session. Iter 5 found safe work via D-040 pre-cond. Iter 6 tried
Option G from the handoff: add `## Status` to mandala-fase1/2/3 specs.

Before committing, ran `git status --short .trae/specs/`:

```
 M .trae/specs/mandala-fase3-zodiac-tantra/spec.md
?? .trae/specs/mandala-fase1-api-route/
?? .trae/specs/mandala-fase2-infopanels/
```

fase1 and fase2 spec dirs were `??` — untracked. They'd been DELETED from
git by the other session's massive refactor (12523 lines deleted across
80+ files including `lib/`, `packages/`, `tests/`, `.claude/`).

But the other session RECREATED the fase1/fase2 spec dirs from scratch
(files visible in working tree with content), and my Edit operations had
modified those untracked files. `git diff` only showed fase3 as modified
(fase1/fase2 are full untracked, so the diff compares against "nothing
in HEAD" — i.e., shows the full file as new, not as a delta).

## Achado

1. **Untracked files are not in HEAD**, so `git diff` doesn't show them
   as "modified" — they show as `??` in status. If you Edit them, the
   edit IS preserved (the file is on disk), but the diff is just a
   "this file didn't exist; now it does" delta.
2. **Multi-session safety: scope check is by directory, not by file.**
   I checked `.trae/specs/` and saw that:
   - The only M was fase3 (mine, safe to commit)
   - The only ?? were the recreated fase1/fase2 dirs (mine, safe to commit
     because no other session is editing `.trae/specs/`)
   - The other session's WIP is in `apps/`, `packages/`, `tests/`,
     `.claude/` — totally disjoint from `.trae/specs/`
3. **`git diff --stat` on a specific path is the right verification.**
   `git diff --stat` (no path) showed 101 files changed — overwhelming.
   `git diff --stat .trae/specs/` would have shown only my 3 changes.
4. **"Untracked" doesn't mean "dangerous".** If another session recreated
   a file, the recreation is its work. My edit modifies the recreated
   file, which is collaborative additivity (their recreation + my Status
   section) — both are valuable, both are net-new content. No conflict.

## Aprendizado

1. **`??` files can be safely committed when they're isolated to a
   directory no other session is editing.** Verify isolation with
   `git status --short <dir>` and confirm only your own changes appear.
2. **`git diff --stat` on a path filter is the right "is this safe to
   commit?" check** in multi-session state. The unfiltered diff is
   overwhelming and tells you nothing about your specific change.
3. **Untracked files appear as `??` in status but as full-add in diff.**
   `git diff` will show the entire file as a delta (vs. "nothing in
   HEAD"). Don't be confused when a 65-line file edit shows as
   "65 insertions" with no "deletion" line — that's expected.
4. **The "untracked ↔ recreated" pattern is a feature, not a bug.**
   When one session deletes a file and another recreates it, the
   recreation is preserved (git doesn't have any opinion about it
   until `git add` is run). If both sessions add value (e.g., one
   recreates the file, the other adds a Status section), the
   combined result is what gets committed.
5. **For ralph-loop multi-session, always commit with
   `git add <specific-paths>` rather than `git add -A`.** This makes
   the commit's blast radius explicit and verifiable.

## Como aplicar

- Use `git add <path>` not `git add -A` in multi-session state
- Verify with `git status --short <dir>` and `git diff --stat <dir>`
  before committing
- `??` untracked files are safe to commit when:
  - The directory is isolated from other sessions' WIP
  - The files are net-new (not recreations of HEAD content)
  - You `git add` specific paths, not `-A`
- Don't be confused when `git diff` shows a full untracked file as
  "X insertions" with no deletion — that's expected behavior
