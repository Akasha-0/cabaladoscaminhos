# Lesson — F-231 mentor grimoire: consistency vs test coverage mismatch

**Date:** 2026-06-15
**Session:** ralph-loop iter 2
**Commit:** (this commit, F-231 fase B)
**Spec:** `.trae/specs/qualidade-i18n-en/spec.md` §Fase B

## Contexto

After fixing the real Fase A bug in iter 1 (the spec's diagnosis was wrong),
Fase B claimed `grimoire/mentor/system-prompt.md` was "the 1 grimoire file
with a gap" because my `find` across all of `grimoire/**/*.md` found it as
the only one missing `## EN` and `title_en`.

But: re-reading `grimoire-completeness.test.ts` revealed that the test's
`CATEGORIES = ['botanica', 'ancestral', 'vibracional', 'diagnostico']`
**does NOT include `mentor`**. So the test never flagged the mentor file
as missing. My "find" was technically correct (it was the only one
without EN in the whole `grimoire/` tree) but the test was already
narrower in scope than my discovery tool.

## Achado

Two valid ways to look at the work:
- **(A) Strict test-coverage view:** mentor/ is out of test scope; no fix needed.
- **(B) Repo-wide consistency view:** all 82 grimoire entries should have
  `## EN` + `title_en`; mentor/ is the odd one out.

I chose (B) because:
- Future test expansion (CATEGORIES += 'mentor') is plausible
- The mentor system prompt is the most user-facing document of all
  grimoire entries (the LLM literally reads it)
- A 19-line additive change is low-risk and high-consistency-value

But I called it out in the commit message so the next reviewer knows it
doesn't add a test pass.

## Aprendizado

1. **"Test doesn't cover X" ≠ "X doesn't need the work"** — be honest
   in commit messages about whether a change makes a test pass or is a
   consistency improvement.
2. **Read the test's `CATEGORIES` / `SOURCES` constants before assuming
   the test covers everything that looks like it should be covered.**
3. **Spec gaps are not always test gaps.** The spec was written assuming
   "all grimoire files"; the test was scoped to 4 categories. Both are
   valid. The commit message should call this out so the next person
   doesn't get confused when they see "no test pass" for a "fix".
4. **When you find a gap outside the test's scope, do the work but
   disclose the scope mismatch** in the commit. Don't pretend it's a
   test fix when it isn't.

## Como aplicar

- Before assuming "X is broken because spec says so", check the test's
  actual scope (constants, fixtures, imports). The gap might be outside
  the test.
- Commit messages should distinguish "fix that makes test X pass" from
  "consistency improvement outside test scope". Reviewers need both
  categories named to evaluate correctly.
- For consistency improvements outside test scope, add a TODO/lesson
  line suggesting the test be expanded later — that way the gap stays
  visible.
