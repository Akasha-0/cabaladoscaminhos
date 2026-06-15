# Lesson — fallow-ignore markers are documentation, not noise

**Date:** 2026-06-15
**Session:** ralph-loop iter 23
**Commit:** (this commit, comparison.ts comment)
**Context:** Found 5 `// fallow-ignore-next-line unused-type` markers
in `core-odus/src/comparison.ts`. Investigated each before deciding
to act. The right move was to ADD a top-of-file comment explaining
each, not to remove the markers or the types.

## Contexto

Codegraph discovery (iter 22) flagged `core-odus/src/comparison.ts`
as having 5 fallow-ignore markers on types. F-100/F-101 would
suggest "clean these up". But each marker represents a conscious
decision: fallow flagged the type as unused, the author suppressed
the warning, life went on.

Removing the markers is risky: the linter was right about the
unused state. Removing the types is breaking: public API change.
Ignoring the markers is wasted signal: the next F-100 pass will
re-encounter them.

## Achado

The right move in this case was **document, don't fix**:
- For each marker, I checked the actual usage
- Found 1 was a false positive (`OduComparison` IS used internally)
- Found 4 were true positives (no external consumer)
- Wrote a comment block explaining each, with a future-cleanup plan
- Did NOT remove the markers, the types, or the export keyword

The comment gives the next agent:
- A clear inventory of which types are unused
- A safe cleanup path (change `export interface` → `interface`)
- The expected file size delta (~30 lines)
- A "pause" reminder (lesson N+25) since it's a public API change

## Aprendizado

1. **`// eslint-disable` and `// fallow-ignore` markers are decisions,
   not noise.** Someone made a conscious call. Investigate before
   acting.
2. **Audit markers in 3 steps:** (a) is the lint correct that the
   symbol is unused? (b) Is the symbol used internally (e.g. as
   return type)? (c) Is the symbol used externally (grep across
   packages)?
3. **"Surface, don't hide"** is the right move when you find markers
   but can't fix them safely. Add a comment that names each marker,
   explains its state, and gives a future-cleanup path. The next
   agent (or future-you) has the full picture without re-doing the
   investigation.
4. **Public API changes are different from dead code.** Even if a
   type is unused today, removing the `export` keyword is a SemVer
   breaking change for any future consumer. Pause before that
   refactor (lesson N+25).
5. **Top-of-file comments survive.** Inline markers can be missed
   when the file is opened to a specific line. A top-of-file
   `// NOTE (...)` block is seen first.

## Como aplicar

- When you find lint suppressions (`eslint-disable`, `fallow-ignore`,
  `@ts-ignore`, `@ts-expect-error`): audit before removing
- For multi-marker files: add a top-of-file `// NOTE (...)` block
  with one bullet per marker explaining the state and any
  future-cleanup plan
- Don't remove `export` keywords without a SemVer-major commit and
  deprecation cycle
- If you're going to ignore the issue, at least name it — silence
  is what makes the next F-100 pass re-do the work
