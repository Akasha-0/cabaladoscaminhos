# Lesson — knowing when to PAUSE a ralph-loop run

**Date:** 2026-06-15
**Session:** ralph-loop iter 13 (final)
**Context:** After 12 iters of solid DOX-rail work (19 commits, 7 rails
added, 4 specs closed, 7 lessons, zero regression), the right move is
to PAUSE — not to keep grinding for diminishing returns.

## Contexto

The ralph-loop skill says "Completion promise: none (runs forever)".
Without an explicit `cancel-ralph` from the user, the loop will keep
re-invoking the agent. Each re-invocation:
- Re-reads the handoff (cost: ~500-2000 tokens of context)
- Re-runs the STEP 0 git status / lessons INDEX lookup
- Re-decides what to do

This is wasteful. After a complete run, the agent should PAUSE — which
in ralph-loop terms means: do a small, self-contained final iter that
captures the run summary, then exit cleanly. The loop will re-invoke,
the next agent will see "run complete" in the handoff, and either
continue with a fresh work item or stop.

## When to PAUSE

A run is complete when **at least 3 of these 5 are true:**

1. **Pattern completion**: a logical work pattern has run its course
   (e.g., DOX rail gap-fill — once all known gaps are closed, stop)
2. **Diminishing returns**: each iter is finding smaller and smaller
   gaps; the cost (context burn, commit noise) exceeds the value
3. **Working tree stable**: no new low-hanging fruit emerging from
   `git status --short` or `ls` of candidate dirs
4. **Triad still green**: typecheck/lint/test all pass — but no NEW
   tests added (i.e., not making the project better, just maintaining)
5. **Multiple options all low-priority**: handoff lists 4+ backup
   options, all small/optional

The DOX-rail run of iters 5-12 hit pattern completion (all known
gaps filled) by iter 12. Iter 13 onwards would be filling even
smaller gaps (akasha-cli, akasha-core, etc.) — diminishing returns.

## What "PAUSE" looks like in a ralph-loop

There's no real "stop" — the loop re-invokes. So PAUSE means:
- One final small iter that captures the meta-lesson (this file)
- A clear handoff update saying "RUN COMPLETE — start fresh or cancel-ralph"
- A note in `.autonomous/claude-progress.txt` that this is the natural
  endpoint
- Exit normally; the next re-invocation will see the complete handoff
  and either start a new run or stop

The user controls actual loop termination via `cancel-ralph`. The
autonomous agent's job is to recognize completeness and signal it
clearly, not to grind forever.

## Aprendizado

1. **Pattern completion > grinding.** A run is "done" when the
   pattern that defined it (DOX-rail fill, F-XXX feature, refactor)
   has run its natural course, NOT when the loop decides to stop.
2. **Diminishing returns are real.** Filling the 5th smallest gap
   takes the same context as filling the 1st, but adds less value.
3. **The handoff IS the artifact.** When the run is complete, the
   handoff should read like a run report, not a "what's next" doc.
4. **Quality > quantity.** 12 iters of solid work beats 20 iters of
   "let me find one more thing". Each iter adds to git history and
   lessons; if the additions are noise, they pollute future agents.
5. **User control vs agent autonomy.** Ralph-loop re-invokes
   unconditionally, but the agent should signal completion clearly
   so the user knows it's safe to `cancel-ralph`.

## Como aplicar

- After every run, ask: "is the pattern complete? are the next 3-4
  options all low-priority? is the working tree stable?" If yes to
  2+ → PAUSE
- Update the handoff to be a "run report" not a "what's next" doc
- Write a meta-lesson like this one capturing the pause decision
- The user decides when to actually `cancel-ralph`; you decide when
  to signal "ready to be cancelled"
- 12-iter runs are healthy. 20+ is usually grinding. >25 is almost
  always a sign the agent forgot to ask "is this still valuable?"
