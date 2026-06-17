---
name: session-n-plus-27-spec-chain-staleness-audit
description: Spec chain status (✅/⏳/Draft) drifts from on-disk reality. Audit each spec's "Status" line against actual code before assuming it's the right work target.
metadata:
  type: lesson
  originSessionId: autonomous-loop-2026-06-15
---

# Lesson N+27 — Spec chain status is a SUGGESTION, not ground truth

**Date:** 2026-06-15
**Context:** Audited `.trae/specs/akasha-v0.0.X/spec.md` for the autonomous ralph-loop.
**Trigger:** Found 7 specs marked "Draft" / "Proposta" / "⏳ Pronta para implementação" but with full code already shipped.

## What I found

| Spec | Was marked | Actual code state | Action |
|------|-----------|-------------------|--------|
| v0.0.11 | Proposta | `packages/mentor/{AGENTS.md,src/{llm,rag,cli,api}/}` exists | → ✅ Completa |
| v0.0.12 | Draft | `core-iching/src/hexagrams.ts` has wings + practices | → ✅ Completa |
| v0.0.13 | Draft | `akasha-core/src/correlation-engine.ts` + RecommendationGenerator | → ✅ Completa |
| v0.0.14 | Draft | `mentor/src/rag/{rag-service,openai-embedder,cohere-embedder}.ts` | → ✅ Completa |
| v0.0.15 | Draft | `apps/akasha-portal/src/components/akasha/dashboard/{Dashboard,...}.tsx` | → ✅ Completa |
| v0.0.17 | ⏳ Em implementação | `scripts/akasha-setup.sh` (spec.md was inconsistent with checklist.md) | → ✅ Completa |
| v0.0.18 | ⏳ Pronta para implementação | `mentor/src/llm/{openai,ollama,mock,minimax,index}.ts` all exist | → ✅ Completa |

Only **v0.0.19** is genuinely "⏳ Pronta para implementação" (features F-223..F-228 depend on R-023, not yet started).

## Why this happens

- Spec authors mark "Draft" and ship the spec, then a different session implements the code but doesn't update the spec status.
- A spec's `Status:` line is a snapshot at write-time, not a live status.
- The spec chain (`v0.0.1 → v0.0.2 → ... → v0.0.19`) accumulates drift over time.

## How to apply

**Before picking the next work target from the spec chain:**

1. **Audit statuses first** — `for d in .trae/specs/akasha-v0.0.*/; do head -10 "$d/spec.md" | grep Status; done`
2. **Cross-reference code** — `ls` the directories/files the spec claims to create
3. **Update the spec** if drift is found (1-line status flip with verification note)
4. **Commit the audit as `docs(specs):`**

This converts a "what should I work on?" question from "trust the spec" to "verify against ground truth, then trust the spec."

## Pattern: spec chain = roadmap, not state

The spec chain is a **proposal lineage** (what was thought, when). It is not a **status lineage** (what was built, when). The two diverge. Lesson N+20 (discover-don't-invent) applies to the status check too.

**Why:** Specs guide next-work decisions. Stale specs route agents to "implement this" when the code is already there, wasting cycles and diluting the changelog with redundant work.

**How to apply:** When choosing next feature, ALWAYS run a 2-step check:

```
1. Read .trae/specs/*/spec.md "Status:" line
2. For each "Draft"/"Proposta"/"⏳", verify on-disk before acting
```

**Related:** [[session-n-plus-20-f-231-discover-dont-invent]], [[session-n-plus-22-d-040-dox-rail-prerequisite]]
