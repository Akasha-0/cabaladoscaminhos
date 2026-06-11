# Plans — cabala-dos-caminhos

> Task ledger for this thread. Background autonomous loop (PID 958587) tracks its own progress in `.autonomous/sessions/` and `.autonomous/claude-progress.txt` — out of scope here.

## cc:TODO

(nenhuma task pendente nesta thread)

## cc:WIP

(nenhuma task em progresso nesta thread)

## cc:BLOCKED

(nenhuma)

## cc:DONE

- [x] **PLN-001** — Corrigir orchestrator: `ls | wc -l` crash sob `set -e` (empty glob)
- [x] **PLN-002** — Corrigir orchestrator: claude sem prompt input (stream-json não-interativo)
- [x] **PLN-003** — Adicionar `--resume` no arg parser do orchestrator.sh
- [x] **PLN-004** — Max-autonomy: hard stop → meta-review cycle perpétuo
- [x] **PLN-005** — Max-autonomy: bootstrap context-aware (detecta `meta_review.signal`)
- [x] **PLN-006** — QA Cycle no coding_prompt: STEP 10/11/12 + FASE 7
- [x] **PLN-007** — feature_list.json: 6 entries Fase 7 (F-100..F-105)
- [x] **PLN-008** — Relatório de feedback: 10/12 RQs done, harness max-autonomy ativo
- [x] **PLN-009** — Dev server: DATABASE_URL local + pgvector install + prisma db push (DB sync ✅)
- [x] **PLN-010** — Cadastro testado: 201 OK + login OK após JWT_SECRET
- [x] **PLN-011** — Visão Akasha codificada: 5 pilares (Numerologia Cabalística + Tântrica + Odu + Astrologia + I Ching) + linguagem universal unificada + curadoria contínua
- [x] **PLN-012** — CONTEXT HYGIENE aplicado em coding_prompt.md (anti-rot, token-efficient, persistent memory, exponential learning, auto-checkpoint)
- [x] **PLN-013** — User feedback: Mandala muito pequena (460px). RQ F-106 adicionada ao loop: redesign fullscreen responsivo + central + animações respiração + tooltip por segmento + cymática (R-012)
- [x] **PLN-014** — Supervisor takeover: 3 sessões do loop (033, 034, 035) falharam com 429 Token Plan. Supervisor assumiu, completou 7 commits:
  - `3ddf05f4` F-200 (engines reais lazy) + R-013 (I Ching 64)
  - `1f44e3fa` loop hardening (GateGuard off + allowlist expand)
  - `19cc8a03` circuit-breaker 429 + lesson N+7
  - `53963fc7` housekeeping F-204/F-207
  - `70c17bb3` F-102 OWASP audit
  - `1a7410fd` F-100 remove 8 unused deps (-1478 LOC)
  - `fa031f40` F-101 un-export 5 dead exports
  - `df5428b6` sync project context (.trae/specs/ + 14 AGENTS.md)
  - `99d268bc` orchestrator detecta >20 untracked
  Pendentes: R-014/015/016 (reverse-eng), F-103 (perf), F-104 (docs sync)
