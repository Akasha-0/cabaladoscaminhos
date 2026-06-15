# Plans — cabala-dos-caminhos

> Task ledger for this thread. Background autonomous loop (PID 958587) tracks its own progress in `.autonomous/sessions/` and `.autonomous/claude-progress.txt` — out of scope here.


## cc: Ralph-loop iter 0 (2026-06-15T21:26:43Z)

- [x] **PLN-000** — Ralph-loop iteration 0
  - Phase: PLANNING → RESEARCH → ... → RELEASE
  - Features analyzed: 1
  - CodeGraph queries: 1
  - Headroom tokens saved: 0


## cc: Ralph-loop iter 0 | None (2026-06-15T21:57:30Z)
- [x] **PLN-000** — None | ver 0.0.0
  - Phase: RESEARCH → PLANNING → IMPLEMENTATION → QA → VALIDATION → RELEASE
  - Recent learnings: 0


## cc: Ralph-loop iter 0 | D-040 (2026-06-15T22:08:55Z)
- [x] **PLN-000** — D-040 | ver 0.0.0
  - Phase: RESEARCH → PLANNING → IMPLEMENTATION → QA → VALIDATION → RELEASE
  - Recent learnings: 0

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
  Pendentes: R-014/015/016 (reverse-eng), F-103 (perf), F-104 (docs sync)
- [x] **PLN-015** — Supervisor takeover turn 2: re-priorizou FASE 8 reverse-eng (R-014 HD, R-015 GK, R-016 Enneagrama) + F-103 perf (N+1 → batch). 7 commits entregues:
  - `168e320a` housekeeping F-104 (cleanup from turn 1)
  - `875630ed` R-014 (HD) — 500 linhas, 10 seções, COT
  - `7dded2bd` fix feature_list.json quebrado (R-014 edit orphan) + parallel-agent prisma sync
  - `a8968503` orchestrator self-check feature_list.json + fecha bug pre-existente (fi faltante)
  - `2b389596` R-015 (GK) — 508 linhas, 12 seções, COT
  - `efd0a604` F-103 perf — credit-reconciliation N+1 → batch queries (60-100x speedup)
  - `250d883e` R-016 (Enneagrama) — 500+ linhas, 10 seções, COT
  - `c8988ab6` housekeeping F-103 e F-104
  Pendente: D-040 (Prisma schema 5 Pilares — awaiting human approval)
  Melhoria de harness: orchestrator self-check JSON (evita feature_list quebrado)
- [x] **PLN-016** — Supervisor takeover turn 3: F-208 (88° solar arc), F-209 + F-209b (Tríade Sombra/Dom/Graça + análise completa de aspectos), R-018 (Jyotish), R-019 (4 Temperamentos Gregos). 6 commits entregues:
  - `e2b64e8a` F-208 88° solar arc "Momento Pré-natal Akasha" (220 linhas, 8 testes)
  - `86de3efe` F-209 Tríade Sombra/Dom/Graça (269 linhas, 14 testes)
  - `2b708f6e` Adicionar F-209b + R-018 + R-019 ao backlog
  - `cf413bde` R-018 Jyotish reverse-eng (491 linhas, 11 seções + COT)
  - `3079e680` F-209b análise completa de aspectos no Pilar 2 trinity
  - `8ee23c8a` R-019 4 Temperamentos Gregos (433 linhas, 12 seções + COT)
  Akasha agora tem 6 frameworks complementares (5 Pilares + 4 Camadas + 9 Levels + 3 Tríades + 4 Temperamentos + Tríade Sombra/Dom/Graça).
  Triad: 363/363 verde, zero regressão.
- [x] **PLN-017** — Supervisor takeover turn 4: implementações FASE 6 de R-018 D1/D3/D4. 4 commits entregues:
  - `6c9dd2d1` F-210 Vimshottari Dasha (Jyotish 9 Grahas + 27 Nakshatras, 27 testes)
  - `02f1eb90` F-211 Rahu/Ketu nodais lunares primários (Jyotish, 11 testes)
  - `e2bc0f8a` F-212 Ayanamsa opt-in (Lahiri/Raman/Krishnamurti, 9 testes)
  Status: 32 entries, 1 pending (D-040 blocked, awaiting human approval).
  Triad: 419/419 verde. Akasha Pilar 2 agora tem:
  - 88° solar arc (F-208)
  - Tríade Sombra/Dom/Graça com análise completa de aspectos (F-209/F-209b)
  - Vimshottari Dasha (F-210) — 120 anos de períodos planetários
  - Rahu/Ketu primários (F-211) — diferenciação Jyotish
  - Ayanamsa opt-in (F-212) — tropical default + Jyotish opt-in
  Triad: 363/363 verde, zero regressão.
- [x] **PLN-018** — Akasha Evolution Phase 1 (v0.0.19): Pesquisa completa + Spec v0.0.19 criada + R-023 Synthesis Framework + F-223 Caixa Akasha. 5 arquivos criados:
  - `.autonomous/research/synthesis/akasha-evolution-research.md` (25KB)
  - `.trae/specs/akasha-v0.0.19/` (spec.md + tasks.md + checklist.md)
  - `lib/grimoire/synthesis/dimensoes.ts` (9 dimensões + matriz)
  - `lib/grimoire/synthesis/synthesizer.ts` (motor de síntese)
  - `components/akasha/CaixaUnificada/` + `minha-caixa/page.tsx`
  Pendentes: F-226 LLM Narrativa, F-227 Authority, F-228 Mobile Strategy.
- [x] **PLN-019** — AkashaNarrativeEngine v1 (Síntese de 5 pilares em 6 áreas de vida)
- [x] `lib/application/akasha/synthesis-engine.ts` — Motor de síntese narrativa (Shadow→Gift→Siddhi, Strategy+Authority, 6 áreas Maslow)
- [x] `lib/application/akasha/daily-engine.ts` — Integração do motor (synthesis field adicionado a DailyContent)
- [x] `components/akasha/dashboard/hooks/useAkashaSynthesis.ts` — Hook React para buscar síntese
- [x] `components/akasha/dashboard/AkashaLifeAreasDashboard.tsx` — UI mobile-first das 6 áreas (expandível, 2ª pessoa)
- [x] `app/api/akasha/daily/route.ts` — API expõe synthesis field no JSON
- [x] `components/akasha/dashboard/Dashboard.tsx` — AkashaLifeAreasDashboard integrado

- [x] **PLN-021** — F-226 Narrative Generator (Deep Life-Area Narratives)
  - `lib/application/akasha/narrative-generator.ts` — 364 linhas de motor narrativo:
    - LIFE_PATH_NARRATIVES: 12 Camdenhos completos (1-9, 11, 22, 33) com essencia/missao/sombra/pratica
    - buildKabalaNarrative(): 6 áreas × Camino de Vida + nuance por área
    - buildAstrologyNarrative(): 4 elementos × 6 áreas + nota lunar
    - buildTantraNarrative(): 11 corps × 6 áreas + corpo emocional
    - buildOduNarrative(): Ejioko, Ogundá × 6 áreas + genérico
    - generateAreaNarrativeFull(): 4 blocos pilar + síntese integrada + prática
    - generateSynthesisParagraph(): parágrafo geral de 50-100 palavras
    - generateAllAreaNarratives(): todas as 6 áreas
  - `synthesis-engine.ts`: expandedNarrative integrado em todas as 6 áreas
  - Typecheck: 0 errors | Build: Turbopack sucesso
  - Commit: 615a87a5 (+397 -14, 2 files)
  Pendentes: F-224/F-225 UI, F-227 Authority, F-228 Mobile Strategy
** — F-224 (deriveDailyTransitOverlay) + F-225 (deriveSexualArchetype) em synthesis-engine.ts + types em useAkashaSynthesis.ts
  - deriveDailyTransitOverlay: trânsitos planetários por área + Odu do dia + energia tântrica do dia
  - deriveSexualArchetype: Lilith/Vênus/Marte/Odu → 11 arquétipos sexuais com fantasias, fetiches, turnOn/turnOff
  - Syntax bugs corrigidos (duplicate ternary, missing positiveTransit)
  - Typecheck: 0 errors ✅
  - [x] **PLN-022** — F-224/F-225/F-226 UI Integration
    Competitor research: AstroLink, Numerologia Redescubra-se, Human Design, Gene Keys
    Gaps: (1) Caixa unificada por área de vida, (2) Authority framework, (3) Sexualidade deep
    SexualidadeSection: turnOn/turnOff, desejos ocultos, fantasia, fetiches, chave transformacao
    Núcleo Akasha card: expandedNarrative.integratedNarrative + practicalExample
    Typecheck: 0 errors | Build: sucesso ✅ | Commit: 32f9ac73
    Pendentes: F-227 Authority (decision framework), F-228 Mobile Strategy (Capacitor PWA — android/ios dirs já existem, falta build APK)
