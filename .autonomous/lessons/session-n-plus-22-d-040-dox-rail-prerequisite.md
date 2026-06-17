# Lesson — F-100 blocked by multi-session, found D-040 DOX rail gap instead

**Date:** 2026-06-15
**Session:** ralph-loop iter 5
**Commit:** (this commit, prisma AGENTS.md)
**Context:** iter 4 was a safety stop (80+ uncommitted M/D/?? from another
session). Iter 5 needed safe, non-conflicting work. Found it by reading
D-040's CoT, which explicitly flagged the missing `prisma/AGENTS.md`.

## Contexto

Iter 4 stopped because the working tree was 80+ entries of WIP from
another session. F-100/F-101 unsafe.

For iter 5, the handoff listed 3 fallback options:
- A: wait for tree to settle (didn't — 111 entries now)
- C: D-040 design proposal (already done, awaiting human)
- D: F-104 docs sync (could conflict)

None of these looked safe. But: the D-040 CoT itself contained the
answer. E6 said:

> AGENTS.md não tem apps/akasha-portal/prisma/AGENTS.md — faltando DOX
> rail local para o subsistema de DB. AGENTS.md §Update After Editing
> exige criar antes de mudar schema.

Creating a NEW `??` file (not modifying anything in `M` state) is
inherently non-conflicting. Pure additive doc work. Zero blast radius.

## Achado

When the "obvious" next work item is blocked, **read the chain-of-thought
docs of blocked items** for unblocking hints. D-040's CoT was a
pre-condição list masquerading as analysis. E6 was a TODO item I could
close right now, without waiting for human approval (unlike E1-E5 which
require migration approval).

The shape of the lesson:
- "Multi-session pollution" doesn't mean "do nothing." It means
  "restrict blast radius to ?? new files only."
- The DOX framework (AGENTS.md chain) is a great source of additive,
  non-conflicting work: chain gaps, missing local contracts, orphan
  sections, stale Status headers.
- Reading the COT of pending items is a high-signal way to find work
  that the author themselves flagged as missing.

## Aprendizado

1. **When the working tree is shared, restrict to `??` files only.**
   New files can't conflict with anyone's WIP because there's no prior
   state. `M` files are actively being edited; `D` files are being
   removed; `??` files are net-new. Only the last is safe.
2. **DOX chain is a TODO generator.** Reading AGENTS.md and
   chain-of-thought docs often surfaces "TODO" items the author
   themselves didn't close. Each is a small, additive, non-conflicting
   task.
3. **D-040's CoT was a pre-condição list.** E1-E5 need migration
   approval. E6 was a pure doc fix I could do without approval. Knowing
   which category a TODO falls into (migration-approval-required vs
   not) determines whether to act now or defer.
4. **"Awaiting human approval" ≠ "blocked".** Items like D-040 that
   wait for human approval are NOT work for the autonomous loop. But
   their **pre-conditions** (DOX rails, design docs, chain-of-thought)
   often ARE safe autonomous work.

## Como aplicar

- When the working tree is shared, prefer `??` (new) files only
- Read the COT/notes of blocked items to find their pre-conditions
- DOX chain gaps (missing AGENTS.md, stale Status, orphan Child DOX
  Index) are safe, additive, non-conflicting work
- Distinguish "blocked by human approval" (defer) from "blocked by
  pre-condition" (work on the pre-condition)
