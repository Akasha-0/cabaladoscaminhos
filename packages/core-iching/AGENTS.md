# @akasha/core-iching DOX

## Purpose

Motor determinístico do I-Ching (64 hexagramas King Wen + 8 trigramas
Bagua + práticas). **Pilar 5 (I-Ching)** do Akasha — alimenta
Mandala (Layer 5: hexagrama externo), Mandato, Mentor via RAG, e o
fluxo opt-in de opt-in de I-Ching (Doc 14 §2, F-219).

Engine puro, sem dependências de framework. Mesma entrada → mesma
saída (testável, auditável).

**Canonical count**: 64 hexagramas (King Wen) + 8 trigramas (Bagua).

## Ownership

- `src/hexagrams.ts`: 64 hexagramas King Wen (com nome, ideograma,
  trigramas upper/lower, significado, source/lineage)
- `src/bagua.ts`: 8 trigramas (Qian, Kun, Zhen, Xun, Kan, Li, Gen,
  Dui) + suas naturezas + elementos
- `src/wings.ts`: Upper/Lower trigram classification
- `src/types.ts`: Tipos compartilhados (Hexagram, Trigram, Line,
  PracticeAssociation)
- `src/practices.ts`: Práticas associadas a cada hexagrama
  (meditações, rituais)
- `src/natal.ts`: I-Ching natal (cálculo do hexagrama de nascimento)
- `src/index.ts`: Barrel — export point público
- Tests: `__tests__/practices.test.ts`, `__tests__/iching.test.ts`,
  `__tests__/wings.test.ts`

## Local Contracts

- **64 hexagramas (NÃO 63, NÃO 65)**: King Wen canon. `HEXAGRAMS`
  é source of truth. NÃO inventar hexagrama 65 ou remover 64.
- **8 trigramas (NÃO 9, NÃO 7)**: Bagua canon. Cielo/Terra/Trovão/
  Vento/Água/Fogo/Montanha/Lago.
- **Pilar 5 engine**: alimenta Mandala `data.iching` (hexagramNumber,
  hexagramName, hexagramChineseName, upperTrigram, lowerTrigram,
  lines, algorithm, available, error).
- **Opt-in model** (F-219): Pilar 5 é opt-in. `User.ichingEnabled`
  deve ser true antes de calcular. `User.ichingMap` cacheia
  resultado. **NÃO** gerar hexagrama sem consentimento.
- **D-040 inconsistency** (still open): Pilar 5 mora em
  `User.ichingMap` (não em `BirthChart.pilar5IChing`). Ver
  `apps/akasha-portal/prisma/AGENTS.md` §Local Contracts e a CoT
  `cot-20260611-d-040-prisma-design-proposal.md`. Migration
  design proposta, **awaiting human approval**.
- **Determinístico**: `getHexagram(n)` retorna sempre o mesmo
  objeto. `natalChart(birthData)` retorna sempre o mesmo hexagrama
  para a mesma data.
- **Type stability**: `HexagramWithDetails`, `MutatingLine`,
  `PracticeAssociations` são contratos públicos. Mudanças
  quebrantes exigem major version.

## Work Guidance

- **PT-BR primeiro** (i18n config). Nomes dos hexagramas em PT
  ("O Criativo", "O Receptivo", "A Dificuldade Inicial"). Trigramas
  em PT ("Céu", "Terra", "Trovão", "Vento", "Água", "Fogo",
  "Montanha", "Lago").
- **Canonical whitelist** (64 hexagramas). Fora dela, use stub
  fallback + warning. Ver `core-odus/AGENTS.md` §"Canonical
  whitelist" pattern.
- **Naming Akasha vs Tradição** (lesson N+3 do coding_prompt):
  - 64 hexagramas King Wen (NÃO Wilhelm/Baynes naming)
  - 8 trigramas (NÃO 9 centers HD — IP clean)
  - Mutating lines 6/7/8 (NÃO gene keys Shadow/Gift/Siddhi)
- **Opt-in UX**: Pilar 5 é opt-in. App não deve mostrar Pilar 5
  results sem `ichingEnabled=true`.
- **Determinism in tests**: `natalChart(birthData)` deve ser
  byte-identical entre runs.
- **Performance**: `getHexagram(n)` é O(1) lookup. `natalChart()` é
  O(1) também. Manter < 5ms.

## Verification

- `pnpm --filter @akasha/core-iching typecheck` — `tsc --noEmit`
- `pnpm --filter @akasha/core-iching test:run` (via vitest root config)
- Antes de commit: typecheck + test:run
- Antes de merge: typecheck + portal typecheck

## Known Issues / Notes

- **D-040 Pilar 5 inconsistency**: `User.ichingMap` vs
  `BirthChart.pilar5IChing`. Aguardando aprovação humana antes
  de migration. Ver `apps/akasha-portal/prisma/AGENTS.md`.
- **11 failing tests** em `tests/lib/core-iching/bagua.test.ts` (per
  `tests/FAILING-DIAGNOSIS.md`) — likely bagua computation issue.
  Future F-101 priority.

## Related Files

- `packages/core-odus/AGENTS.md` — Pilar 4 (Pilar 1-4 correlation
  em `odu-correlations.ts` cross-package)
- `apps/akasha-portal/AGENTS.md` §Local Contracts — Mandala
  data.iching shape
- `.autonomous/research/designs/d-040-prisma-5-pilares-design.md` —
  design proposal para D-040

## Child DOX Index

(Nenhum subdiretório com AGENTS.md dedicado.)
