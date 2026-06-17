# Lesson — F-231 fase C: "discover-don't-invent" beats prescribed work

**Date:** 2026-06-15
**Session:** ralph-loop iter 3
**Context:** F-231 fase C was supposed to "create" the `pnpm i18n:check` script
and document it in AGENTS.md. When iter 3 started, the script already existed
(committed in some prior cycle) AND the AGENTS.md already had the line.

## Contexto

Spec said: "Criar `scripts/check-i18n-parity.mjs` ... Adicionar `pnpm i18n:check`
no `apps/akasha-portal/package.json` ... Documentar em `apps/akasha-portal/AGENTS.md`"

Iter 1 (path-fix) confirmed via `pnpm --filter akasha-portal i18n:check` that
the script existed and exited 0. Iter 2 didn't touch AGENTS.md. Iter 3
opened the file intending to add a 1-line bullet — and found the bullet was
already there on line 38.

This is the **third** time in 3 iterations that the spec's prescribed work
was already done:
- Iter 1: spec prescribed "fix filter" — actual problem was path resolution
- Iter 2: spec prescribed "add EN to grimoire" — the file existed but test didn't cover it
- Iter 3: spec prescribed "create + document" — both already in place

## Aprendizado

1. **Before applying a spec's prescribed work, grep for the symptom.**
   `grep -rn "i18n:check" apps/ packages/` would have shown the line was
   already there. Saves a duplicate commit.
2. **Specs go stale fast** in a fast-moving codebase. The ralph-loop
   iterates 1 feature per respawn, and a spec written 6 hours ago can
   already be obsolete. Trust ground truth (`pnpm test`, `cat file`, `git log`)
   over prose.
3. **"Discover-don't-invent"** is a different mode from "fix-or-create".
   When the prescribed work is already done, the right move is to:
   - Verify it actually works (don't trust presence, verify behavior)
   - Update the spec to mark it closed (closes the loop for next time)
   - Add a lesson about the discovery pattern
   - Move on — don't invent new work just to fill the iteration
4. **"Status" header in spec files** is a cheap way to keep multi-session
   coordination honest. If the spec says "CLOSED", the next session won't
   re-do the work.

## Como aplicar

- Always `grep`/`cat` the spec's target before doing prescribed work
- When the prescribed work is already done, don't add a duplicate line
  or a "no-op" commit. Instead: verify it works + update spec status +
  add a lesson + move to next work item.
- Add a `## Status` section to spec files (top of file, after the
  multi-spec roadmap note) whenever a phase is closed. Acts as a single
  source of truth for "is this done yet?".
- In a ralph-loop, if 2+ iterations in a row discover that prescribed
  work was already done, the spec is stale. Skip ahead to the next
  work item from the backlog instead of grinding through stale specs.
