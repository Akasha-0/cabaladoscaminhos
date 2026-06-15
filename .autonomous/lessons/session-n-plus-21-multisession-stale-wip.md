# Lesson — multi-session coordination: always check `git status` before F-100/F-101

**Date:** 2026-06-15
**Session:** ralph-loop iter 4
**Context:** tried to start F-100 refactor (knip + ts-prune); working tree
was 80+ files in uncommitted WIP from another session.

## Contexto

F-100 coding_prompt.md said: "rodar knip, listar unused, refatorar 1 arquivo,
garantir que testes passam, commitar". Standard refactor flow.

Started iter 4 with the standard `git status --short` STEP 0 check. Found:
- 30+ `D` lines (files deleted in working tree, not committed)
- 30+ `M` lines (files modified in working tree, not committed)
- 9 `??` lines (new files, not committed)
- Touching EVERY major module: `lib/application/`, `lib/domain/`, `lib/infrastructure/`,
  `lib/grimoire/`, `packages/core-*`, root configs (AGENTS.md, CLAUDE.md, .gitignore)

None of this WIP was mine. It came from another autonomous session running
in parallel (the auto-broadcast system reminders confirmed multi-session
awareness throughout iters 1-3).

**What I would have done wrong if I hadn't checked:** committed F-100 changes
on top of someone else's WIP, getting:
- Conflict hell on next sync
- Mixed authorship in commit history
- Possible loss of the other session's work if my commit looked "complete"

## Achado

The right move was to:
1. Recognize the WIP is not mine (don't commit it)
2. Pick a SAFE F-100 target outside the uncommitted set, OR skip F-100 this iter
3. Capture the lesson so future iterations don't fall into the same trap
4. Update handoff with a clear "do not touch the M/D/?? set" warning

The repo has a strong multi-session pattern (autonomous ralph-loop, parallel
agents, .remember/now.md as shared handoff). The STEP 0 git status check
already exists in coding_prompt.md, but it was originally framed as "is the
tree clean before I start?" not "is the tree being worked on by another
session right now?"

## Aprendizado

1. **`git status --short` is the FIRST thing to read, not just a sanity check.**
   A 80+ line status with M/D/?? entries means: another session is working
   here. Pick a non-overlapping target or defer.
2. **Distinguish "stale M" from "active WIP".** If the most recent commit
   on the branch is MINE and `git status` is mostly clean, then the few
   `M` lines are mine and safe to commit. If the most recent commit is
   also from me and `git status` shows 30+ M/D/?? — those are from
   another session (likely also claiming to be on `loop/w2`).
3. **Multi-session same-branch is a coordination problem, not a tooling
   problem.** Without a merge strategy (rebase, conflict resolution, or
   worktree-per-session), parallel work on the same branch is lossy.
4. **F-100/F-101/F-102 are inherently risky in multi-session** because
   they touch lots of files (knip output, ts-prune output can suggest
   deleting things that another session is also editing). F-103/F-104
   (perf, docs) are safer because they're narrower.

## Como aplicar

- **STEP 0 of every ralph-loop iteration must start with `git status --short`**
  AND a count: `git status --short | wc -l`. If count > 10, treat the
  working tree as "shared with another session" and pick a non-overlapping
  target.
- **For F-100/F-101 specifically**, restrict to a small whitelist of files:
  - Root-level configs (`.eslintrc`, `tsconfig.json`, `knip.config.ts`)
  - Test files (`tests/**`)
  - New files in `??` state (less likely to conflict)
  Avoid: anything in `M` state (uncommitted modification = active edit).
- **Document multi-session state in the handoff** (`.remember/now.md`)
  so the next session sees "DO NOT touch the M/D/?? set" as a first-class
  warning, not a footnote.
- **For long autonomous runs on the same branch, suggest the human consider
  worktree-per-session or a rebase-before-merge strategy.** Outside the
  scope of any single iteration to fix, but worth a TODO in the handoff.
