# @akasha/core-cabala DOX

## Purpose

Motor determinístico de Numerologia Cabalística (Caminho de Vida,
Expressão, Motivação, Impressão, Missão, ciclos, pináculos, desafios,
Sefirot, Tarot cabalístico). **Pilar 1 (Cabala)** do Akasha — alimenta
Mandala (Layer 2: triângulo interno, raio 80), Mandato, Mentor via
RAG, e a página de Sobre (perfil numerológico).

Engine puro, sem dependências de framework. Mesma entrada → mesma
saída (testável, auditável).

## Ownership

- `src/calculos.ts`: Cálculos numerológicos agregados
  (calcularPitagorica, calcularCaldeia, calcularCabalistica,
   calcularTantrica, calcularCaminhoVida)
- `src/numerology-kabalah.ts`: Implementação principal (reduceToSingleDigit
  com master numbers 11/22/33, deriva Expression/Motivation/Impression
  /Mission)
- `src/calculator.ts`: Calculadora alternativa (reduceToDigits
  alternativo) — **dead code**, não exportado pelo index.ts
- `src/life-path.ts`: Caminho de Vida (1-9 + master 11/22/33)
- `src/number-meanings.ts`: Significados dos números 1-9
- `src/sefirot-meanings.ts`: 10 Sefirot + 22 caminhos (árvore da
  vida) — usado em Pilar 1 info
- `src/ciclos.ts`: 3 ciclos de vida + pináculos + 4 desafios
- `src/generator.ts`: Gerador de perfis numerológicos completos
- `src/odu-correlations.ts`: Correlações Cabala × Odu (Pilar 1 ↔
  Pilar 4) — usado em `cross-engine.ts`
- `src/index.ts`: Barrel — export point público

## Local Contracts

- **Pilar 1 engine**: alimenta Mandala `data.kabala` (lifePath,
  expression, motivation, impression, mission, personalYear/Month/Day,
  sefira, hebrewLetter, tarotCard, challenges, pinnacles, lifeCycles).
- **Pilar 1 vs 2 colors** (MandalaChart): Cabala usa **indigo**
  (`#5C7CFF`); Astrologia usa **roxo/ar** (`#7C5CFF`). Ver
  `apps/akasha-portal/src/components/akasha/MandalaChart.tsx:198-204`.
- **Master Numbers 11/22/33**: `reduceToSingleDigit(n, keepMaster=true)`
  preserva 11/22/33 (NÃO reduz para 2/4/6). Se `keepMaster=false`,
  reduz como Pitagórico padrão.
- **Determinístico**: zero `Math.random()`. Mesma data de nascimento
  → mesmo `lifePath`, mesmo `expression`, etc.
- **Multiple reduceTo* implementations**: há 2 implementações
  (`reduceToSingleDigit` em `numerology-kabalah.ts`,
  `reduceToDigits` em `calculator.ts`). **A de `calculator.ts` é
  dead code** — não exportada pelo `index.ts`. Future cleanup:
  remover `calculator.ts` (~130 linhas).
- **Pilar 1 ↔ Pilar 4 correlation**: `odu-correlations.ts` cruza
  dados Cabala com Odus. Pilar 1 (numerologia) e Pilar 4 (Odu)
  compartilham correspondências (ex: 1 (Kether) ↔ Ogbe).

## Work Guidance

- **PT-BR primeiro** (i18n config). Números escritos em PT ("um",
  "onze", "vinte e dois"). Sefirot em PT ("Keter", "Chokhmah", etc).
- **Master Numbers**: 11, 22, 33 são especiais (NÃO reduzir). Outros
  números > 9 → soma algarismos → se for 11/22/33, preserva; senão
  reduz até 1-9.
- **API stability**: `lifePath()`, `expression()`, etc. são contratos
  públicos. `kabala.sefira` field string é estável.
- **Pilar 4 (Odu) ethics**: este package cruza com Pilar 4 via
  `odu-correlations.ts`. Manter Pilar 4 canonical whitelist (15
  Odus) — ver `packages/core-odus/AGENTS.md`.
- **Determinism in tests**: usar `vi.useFakeTimers()` para
  data-dependente tests. NUNCA depender de `Date.now()` real.
- **NÃO inventar correspondências**: Cabala tem sistema fechado.
  Toda correspondência nova precisa de source canônico.

## Verification

- `pnpm --filter @akasha/core-cabala typecheck` — `tsc --noEmit`
- Antes de commit: typecheck
- Antes de merge: typecheck + portal typecheck

## Known Issues / Notes

- **`calculator.ts` é dead code** (~130 linhas) — não exportado pelo
  `index.ts`. Future F-100 cleanup: deletar.
- **`calculos.ts` e `numerology-kabalah.ts` ambos calculam** —
  alguma duplicação. `calculos.ts` é re-export wrapper; `numerology-
  kabalah.ts` é a implementação. `index.ts` re-exporta de
  `numerology-kabalah.ts`. Future F-100 cleanup: consolidar.

## Related Files

- `packages/core-astrology/AGENTS.md` — Pilar 2 (sibling)
- `packages/core-odus/AGENTS.md` — Pilar 4 (sibling) — `odu-
  correlations.ts` cruza
- `apps/akasha-portal/AGENTS.md` §Local Contracts — Mandala
  data.kabala shape

## Child DOX Index

(Nenhum subdiretório com AGENTS.md dedicado.)
