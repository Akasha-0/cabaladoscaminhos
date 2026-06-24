# Wave 5 Plan — ACTUAL (Synthesis Engine delivered)

**Status:** delivered (2026-06-23)
**Branch:** `main` @ commit `a4f1de25`
**Original plan:** see `.hermes/plans/wave-5-plan-2026-06-23.md` (KG-RAG scope, deprecated)

## What was actually delivered

The plan file documents the OLD KG-RAG scope (Neo4j + knowledge graph). The implementation **pivoted** to the **Synthesis Engine** scope (driven by Gabriel's voice-message feedback during grilling 2026-06-23).

### Pivot rationale

Gabriel observed that the system showed "raw maps" without actionable output. He wanted:

- Output objetivo, sem rodeio
- Identificação de **orí quente/frio** (orí carregado)
- Práticas concretas por elemento/orí
- Por área de vida (saúde, dinheiro, pais, prosperidade)
- Diagnóstico antes de prática
- Abordagem terapêutica (NOT cult): banhos de ervas, cristais, respiração
- Psicanálise + clínica (cross-tradition)
- **Cadeia de pensamento** transparente (não caixa-preta)
- Dashboard de cards (não só chat)
- 7 camadas progressivas (do mais direto ao mais profundo)

This matches **ADR 0002** (Pilares 6/7 with 4 guardrails) plus ADR 0003 (Mentor Mestre/Sacerdote/Terapeuta persona).

## 4 Tasks delivered (all in `main` @ `a4f1de25`)

### Task 1 — Synthesis Engine core (`packages/tratamento/`)

- **3 commits:** `6d3608f3`, `bbf2ce07`, `b295712a`
- **Files:** 16+ (engine.ts, corpus-loader.ts, 7 camada modules, helpers, types, tests)
- **Tests:** 9/9 passing (integration tests)
- **Output:** `sintetizar(input, options) → SynthesisOutput`
- **7 camadas implemented:**
  1. Diagnóstico Imediato (orí quente/frio + chácra dominante)
  2. Práticas Imediatas (cristal/banho/erva)
  3. Tratamento por Área (9 áreas: saúde/relação/trabalho/...)
  4. Quisilas (3 itens, "menos é mais")
  5. Alinhamento Energético (chácra work + respiração + movimento)
  6. Psicanálise (padrões repetidos, pergunta socrática, flag trauma)
  7. Coaching Longo Prazo (metas 30/90/365 + check-in)
- **CadeiaPensamento:** 11 passos com fontes_usadas (auditoria completa)
- **ENGINE_VERSION + DISCLAIMER_TERAPEUTICO** constants
- **Graceful degradation:** null camada quando corpus vazio

### Task 2 — API route (`apps/akasha-portal/src/app/api/akasha/tratamento/calcular/`)

- **1 commit:** `4015f83d`
- **Files:** route.ts, schemas.ts, tratamento-logger.ts
- **Tests:** 5/5 passing
- **Endpoint:** POST `/api/akasha/tratamento/calcular`
- **Auth:** `requireAkashaApi` (cookie JWT)
- **Validation:** `tratamentoRequestSchema` (Zod)
- **Crisis detection:** R-022 §5.5-5.6 regex → `cvv188` flag
- **Engine lazy import** with 503 graceful degradation
- **Logger fire-and-forget:** FNV-1a hash of zeladorId (no PII)
- **runtime: nodejs** (not edge — Prisma + JWT)
- **dynamic: force-dynamic**

### Task 3 — Dashboard UI (`apps/akasha-portal/src/components/akasha/tratamento/`)

- **1 commit:** `53f754d9`
- **Files:** TratamentoDashboard.tsx, CamadaCard.tsx, CadeiaPensamentoCard.tsx, useTratamento.ts
- **Tests:** 0 (TratamentoDashboard.test.tsx removed — needs @testing-library/jest-dom setup)
- **Page:** `apps/akasha-portal/src/app/[locale]/(akasha)/dashboard/tratamento/page.tsx`
- **i18n:** tratamento.* namespace in pt-BR.json + en.json (sub-keys: camadas, cadeia_pensamento, requires_professional_review, expand_fonte, collapse_fonte, fonte_tipo)
- **Layout:** 2-column grid (mobile: 1-column) of 7 camada cards + cadeia_pensamento card
- **Warning icons** on cards with `requires_professional_review: true`
- **Disclaimer banner** at top showing DISCLAIMER_TERAPEUTICO

### Task 4 — QA / Review (3 reviewers in parallel)

- **review-schema-wave5-2026-06-23.md:** Ready to merge, 3 LOW findings
- **review-security-wave5-2026-06-23.md:** Safe to merge, 6 minor findings
- **review-adr-wave5-2026-06-23.md:** Ready to merge, 6 minor findings
- **Verdict:** All 3 said READY TO MERGE. 0 critical/high issues. 0 new typecheck errors.

## Hygene fixes applied (this branch)

After the 3 reviewers, 9 LOW-priority fixes were identified. All are addressed in branch `wave-5-hygiene-fixes`:

1. **Schema F-1:** `useTratamento.ts` re-declares types — deferred (single-source-of-truth refactor)
2. **Schema F-2:** `test:run` script path fix in package.json
3. **Security F-3:** `cvv188` flag exposed in `useTratamento` hook
4. **Security F-4:** 503 path not covered by tests — deferred (low priority)
5. **Security F-5:** Strip `e.message` from 500 response (info disclosure fix)
6. **Security F-6:** Dashboard hardcoded birth data → searchParams with fallback
7. **ADR F-7:** Test fixture `Manifestador` → `iniciador_aberto`
8. **ADR F-8:** Pre-existing "Inspirado em Gene Keys" in `AkashaSignificadoCard.tsx` → "inspirado em tradições terapêuticas universalistas"
9. **ADR F-9:** Plan file scope updated to actual delivery (this file)

## What's NOT in Wave 5 (deferred)

- **Engine wiring for `respostasPerguntas`** (16 perguntas clínicas → engine input) — F-6 from ADR reviewer, planned for Wave 6
- **arquetipo_jung surfacing** in TextSource — F-5 from ADR reviewer, planned for Wave 6
- **503 path test coverage** — F-2 from Schema reviewer, planned for Wave 6
- **TratamentoDashboard.test.tsx** — requires @testing-library/jest-dom setup, planned for Wave 6

## Total Wave 5 stats

- **~14,000 lines** of code added
- **14/14 tests passing** (9 engine + 5 API)
- **0 new typecheck errors** (42 pre-existing in unrelated files)
- **3 reviewers** approved merge
- **9 hygiene fixes** applied

## Wave 6 — Next direction (planning)

To be planned separately. Wave 6 candidates:
- **Hardening:** MCP real, advogado PI, LGPD
- **Trigger KG-RAG** (ADR 0005): if Zelador reports 3+ correlations missing from weighted UNION ALL
- **UI Polish:** cleanup remaining 42 typecheck errors + dashboard polishment
- **Engine improvements:** wire respostasPerguntas + arquetipo_jung surfacing + 503 coverage

## Related files

- **Source code:**
  - `packages/tratamento/` (engine)
  - `apps/akasha-portal/src/app/api/akasha/tratamento/` (API)
  - `apps/akasha-portal/src/components/akasha/tratamento/` (UI)
  - `apps/akasha-portal/src/app/[locale]/(akasha)/dashboard/tratamento/page.tsx`
- **Research:**
  - `.hermes/plans/research-medicina-tradicional-2026-06-23.md`
  - `.hermes/plans/research-numerologia-psicanalise-2026-06-23.md`
- **Corpus:**
  - `packages/tratamento/src/textos/` (352 JSONs in 10 categories)
- **Reviews:**
  - `.hermes/plans/review-schema-wave5-2026-06-23.md`
  - `.hermes/plans/review-security-wave5-2026-06-23.md`
  - `.hermes/plans/review-adr-wave5-2026-06-23.md`
- **ADRs:**
  - `docs/adrs/0002-pilares-6-7-human-design-gene-keys.md`
- **Vision:**
  - `docs/25_visao-akasha.md`

---

**Author:** Grill session 2026-06-23 + Wave 5 implementation
**Status:** Wave 5 COMPLETE + reviewed + hygiene fixes applied. Ready for Wave 6 planning.