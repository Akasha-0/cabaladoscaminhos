# @akasha/core-tantra DOX

## Purpose

Motor determinístico de Numerologia Tântrica (11 Corpos Espirituais
de Yogi Bhajan) + sub-framework de 4 Temperamentos Gregos (F-220,
R-019). Pilar 3 (Tantra) do Akasha. Engine puro, sem dependências
de framework.

## Ownership

- `src/numerology-tantric.ts`: motor principal
  - `calculateSoul`, `calculateKarma`, `calculateDivineGift`,
    `calculateDestiny`, `calculateTantricPath`, `buildTantricMap`
- `src/temperaments.ts`: 4 Temperamentos Gregos (R-019, F-220)
  - `TEMPERAMENTOS` (4 entries: sanguíneo, colérico, melancólico, fleumático)
  - `TEMPERAMENTO_PILAR_MAP` (4-way mapping → Pilar)
  - `TEMPERAMENTO_CARACTERISTICAS` (descrições curadas)
  - `isTemperamento`, `inferirTemperamentoAtual` (helper)
  - type `Temperamento`
- `src/temperaments.test.ts`: 1 test file, cobertura dos temperamentos
- `src/index.ts`: barrel — export point público

## Local Contracts

- **11 Corpos Espirituais (Yogi Bhajan)** — sistema CANÔNICO. NÃO
  confundir com os 9 Centers de Human Design (HD). Akasha usa
  deliberadamente 11 (Yogi Bhajan) — IP clean, domínio público.
  (Ver `apps/akasha-portal/AGENTS.md` Local Contracts + lesson
  `session-n-plus-15-f-219-pilar4-truth-base.md` sobre IP invariants.)
- **5 Koshas Védicas** são conceito paralelo (informativo, em
  `apps/akasha-portal/src/lib/shared/koshas.ts`) — NÃO são parte
  deste package, mas o Mandala Fase 4 InfoPanel usa ambos os
  sistemas lado a lado.
- **4 Temperamentos Gregos** (sanguíneo, colérico, melancólico,
  fleumático) — domínio público milenar (Hipócrates ~400 BCE).
  NÃO substituir por MBTI/Keirsey/DISC (lesson N+3 do
  coding_prompt: "4 Temperamentos Gregos (NÃO MBTI/Keirsey/DISC)
  — domínio público milenar").
- **Determinístico**: `buildTantricMap(birthData)` retorna sempre
  o mesmo `TantricMap` para a mesma data. ZERO `Math.random()`.
- **Type stability**: `TantricMap`, `Temperamento` são contratos
  públicos. Mudanças quebrantes exigem major version bump.
- **Stub fallback** (F-220): se um consumer pedir um temperamento
  fora dos 4, `isTemperamento` retorna false + warning, NÃO
  inventa 5º.
- **Zero network**: package não importa nada de `@supabase`,
  `fetch`, `axios`. Toda a lógica é local.

## Work Guidance

- **PT-BR primeiro** (i18n config do portal). Nomes dos corpos em
  PT-BR com fallback transliterado (ex: "Alma", "Mente Positiva",
  "Mente Negativa", "Mente Neutra", "Físico", "Linha-Arco", "Aura",
  "Pranico", "Sutil", "Radiante", "Mente Divina").
- **Deterministic test pollution check** (lesson N+18): rodar
  `pnpm test:run` (suite) E `pnpm test:run
src/temperaments.test.ts` (isolado) antes de commit.
- **Naming Akasha vs Tradição** (lesson N+3 do coding_prompt):
  - 7 chakras hindus (NÃO 9 centers HD) — IP clean
  - Sombra/Dom/Graça (NÃO Shadow/Gift/Siddhi) — PT-BR
  - 4 Temperamentos Gregos (NÃO MBTI/Keirsey/DISC) — domínio público
- **API stability**: `TantricMap` é o output canônico de Pilar 3.
  Adicionar field novo é OK (com `?`). Mudar nome ou tipo é breaking.
- **Performance**: `buildTantricMap` é chamado em hot path
  (Mandala render, Mandato). Manter O(1) onde possível.
- **Tests**: 1 test file cobre temperamentos. Bodies/Yogi Bhajan
  tests estão em outro lugar (provavelmente `apps/akasha-portal/`
  ou `tests/lib/`). Adicionar coverage aqui se crescer.

## Verification

- `pnpm --filter @akasha/core-tantra typecheck` — `tsc --noEmit`
- `pnpm --filter @akasha/core-tantra test:run` (se houver script
  configurado; senão via vitest root config)
- `pnpm test:run src/temperaments.test.ts` — isolado
- Antes de commit: typecheck E test:run
- Antes de merge: portal typecheck (MandalaChart, Mandato, Mentor
  importam este package)

## Known Issues / Notes

- **Sem `test:run` script** no `package.json` (só typecheck). Tests
  rodam via vitest root config. Lesson N+8 capturou padrão similar.
- **`inferirTemperamentoAtual`** é heurística — pode ser revisitada
  com mais dados no futuro. Manter contrato: retorna `Temperamento`
  (não inventar tipo novo).

## Child DOX Index

(Nenhum subdiretório com AGENTS.md dedicado. Se `src/bodies/`
ou `src/koshas/` forem criados, cada um ganha seu próprio
AGENTS.md.)
