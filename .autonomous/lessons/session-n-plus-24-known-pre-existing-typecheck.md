# Lesson — known pre-existing typecheck failures must be documented, not "fixed"

**Date:** 2026-06-15
**Session:** ralph-loop iter 7
**Commit:** (this commit, mentor AGENTS.md expansion)
**Context:** while expanding `packages/mentor/AGENTS.md`, discovered that
`pnpm --filter @akasha/mentor typecheck` fails with "Cannot find module
'@akasha/core'" — but the failure is pre-existing (caused by another
autonomous session's massive refactor of `lib/application/ai/*`).

## Contexto

The conservative scope says "verify triad before commit: typecheck +
lint + test". In multi-session state, the typecheck might fail for
reasons unrelated to my change. I had 3 options:

1. **Fix the typecheck** — chase down the broken imports, re-wire
   mentor.ts. But this is in `lib/application/ai/*` which is the
   OTHER session's WIP. Would conflict.
2. **Skip the typecheck** — pretend the verification is green.
   Dishonest. Sets a bad precedent.
3. **Document the known pre-existing failure** — keep the actual
   failure visible, but say in the AGENTS.md Verification section
   "this might fail when portal refactors lib/application/ai/*, it's
   pre-existing, not this package's fault".

I chose 3.

## Achado

The right move in multi-session is:
- DO run the verification that I CAN trust (portal typecheck, prisma
  validate, lint) and report those as green
- DON'T pretend the pre-existing failure doesn't exist
- DO document the known pre-existing failure in the AGENTS.md
  Verification section so the next session knows "this is pre-existing,
  not my fault"
- DON'T try to fix the pre-existing failure if it's in another
  session's WIP

This preserves honesty (next session sees the truth) and avoids
conflict (I don't touch files that are being edited elsewhere).

## Aprendizado

1. **"Verify triad" is contextual.** In single-session, you fix what
   you broke. In multi-session, you document what someone else
   broke. The triad is "are MY changes green?" not "is the whole
   tree green?"
2. **Pre-existing typecheck failures are valuable signals.** They
   point at cross-package coupling that's brittle. Documenting them
   in AGENTS.md is more useful than a 1-time commit fix, because the
   fix might not survive the other session's WIP.
3. **AGENTS.md Verification section is the right place for
   known-issues.** Reviewers and future sessions see the truth
   without needing to dig through git history.
4. **"Cannot find module X" in multi-session is almost always
   cross-package coupling under refactor.** Don't try to add the
   missing module — figure out if X was renamed, moved, or deleted
   by the other session first.

## Como aplicar

- When typecheck fails, distinguish "I broke it" from "someone else
  broke it" before trying to fix
- For pre-existing failures: document in AGENTS.md Verification
  section, don't silently skip
- For failures in another session's WIP: defer until that session
  commits, then re-check
- Always run the verifications you CAN trust (portal typecheck,
  prisma validate, lint) and report those — even if other checks
  are blocked by multi-session state
- Add `**Known issue**:` lines to AGENTS.md Verification when
  pre-existing failures are documented, with a one-line root cause
