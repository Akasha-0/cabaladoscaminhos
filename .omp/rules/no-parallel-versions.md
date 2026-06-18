---
name: no-parallel-versions
description: Prevents creating parallel version files (-v2, _v3, -new, -final, -old, -copy) — the single biggest source of harness entropy.
condition:
  - '-v\d'
  - '_v\d'
  - '\.new\b'
  - '-final\b'
  - '-copy\b'
  - '-old\b'
interruptMode: tool-only
---
STOP. You are about to create a parallel version of a file (`-v2`, `_v3`, `-new`, `-final`, `-old`, `-copy`...). This is instant technical debt and has been the primary source of chaos in this project.

Edit the CANONICAL file in place. If you need to rewrite, replace the content and delete the old file in the same task. Never leave two versions coexisting.
