# Akasha Core DOX

## Purpose

Núcleo do Akasha OS — `@akasha/core`. Orquestrador determinístico
que combina os 5 Pilares (Numerologia Cabalística, Numerologia
Tântrica, Odu, Astrologia, I Ching) em uma única função pura:

`akasha.calcular(pessoa, momento) → Leitura`

Inclui Mapa de Correlações, guardrails, gerador de Mandato,
dashboard, e rituals.

## Ownership

- `src/akasha-core.ts`: Akasha Core Algorithm v1 (R-030)
  - 5 Pilares (realPilar1..5 com loadEngines lazy)
  - Pilar 4 ethics invariant (canonical whitelist)
  - Pilar 4 ethics invariant
- `src/correlation-map.ts`: IFA_ODUS × I Ching × Sefirot
- `src/correlation-engine.ts`: Scoring + cross-tradition
- `src/ritual-calculator.ts`: AkashaCode + ritual diário
- `src/recommendation-generator.ts`: Practices from rules + RAG
- `src/dashboard-service.ts`: Streak + history + stats
- `src/practices-guardrails.ts`: Safety validation
- `src/profiles-fixtures.ts`: 10 perfis representativos (D-043)
- `src/index.ts`: barrel export
- `__tests__/`: 298 testes verdes (correlation, profile, validation)

## Local Contracts

- Sempre cite a fonte canônica (R-022, R-022b, AGENTS.md §5)
- Pilar 4 (Odu): whitelist canônica (15 names derivados de D-044)
- Pilar 4 (Odu): NÃO inventar correspondência esotérica
- MandatoEsqueleto NÃO redige redação final (Mentor LLM redige)
- Detecção de crise → CVV 188 (regex expandido em ethics_charter)
- 5 Pilares são **derivações** do CORRELATION_MAP, não hardcoded
  (cycle 114 lesson: HOUSES_36 derivado, não hardcoded)

## Work Guidance

- 1 feature = 1 commit
- Verify triad: typecheck + vitest + lint
- Pilar 4 sempre tem fallback para stub quando engine retorna
  nome composto (Pilar 4 ethics invariant)
- Engines core-\* são lazy import (.catch() por engine)

## Verification

- `pnpm exec vitest run packages/akasha-core/` → 298/298 verde
- `pnpm exec tsc --noEmit -p packages/akasha-core/` (0 novos erros)
- knip check (F-101 deadcode)

## Child DOX Index

(Nenhum subdiretório com AGENTS.md dedicado no momento)
