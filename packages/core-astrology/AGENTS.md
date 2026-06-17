# @akasha/core-astrology DOX

## Purpose

Motor determinístico de Astrologia (Swiss Ephemeris puro, sem rede).
**Pilar 2 (Astrologia)** do Akasha — alimenta Mandala (Layer 4: anel
zodiacal com 10 planetas + 12 casas), Mandato, e Mentor via RAG.

Engine puro, sem dependências de framework. Mesma entrada → mesma
saída (testável, auditável).

## Ownership

- `src/swiss-ephemeris.ts`: Cálculos de efemérides (longitude, latitude,
  ascendente, midheaven, nodos lunares)
- `src/planet-positions.ts`: Posições planetárias (Sol, Lua, Mercúrio,
  Vênus, Marte, Júpiter, Saturno, Urano, Netuno, Plutão)
- `src/aspect-finder.ts`: Aspectos astrológicos (conjunção, sextil,
  quadratura, trígono, oposição, quincúncio) com orbe
- `src/dasha.ts`: Períodos Dasha (sistema Védico)
- `src/prenatal-date.ts`: Data pré-natal (para cálculo de Lua, éclipse)
- `src/ayanamsa.ts`: Ayanamsa (sistema sideral tropical, default
  Lahiri)
- `src/nodes.ts`: Nodos lunares (Norte/Sul, Rahu/Ketu)
- `src/houses.ts`: 12 casas astrológicas (sistema Placidus)
- `src/birth-chart.ts`: BirthChart agregado
- `src/trinity.ts`: Trindade astrológica (Sol/Lua/Ascendente)
- `src/tipos.ts`: Tipos compartilhados (Planet, Sign, Aspect, House)
- `src/index.ts`: Barrel — export point público
- Tests: `nodes.test.ts`, `ayanamsa.test.ts`, `prenatal-date.test.ts`

## Local Contracts

- **Pilar 2 engine**: alimenta Mandala `data.astrology` (planets +
  aspects + ascendant + midheaven). Ver `apps/akasha-portal/
  AGENTS.md` §Local Contracts para o shape exato.
- **Pilar 1 vs 2 colors** (MandalaChart): Cabala usa **indigo**
  (`#5C7CFF`); Astrologia usa **roxo/ar** (`#7C5CFF`). Distintos
  no `PILAR_COLORS` de MandalaChart.tsx:198-204.
- **10 planetas (NÃO 9)**: Sol, Lua, Mercúrio, Vênus, Marte, Júpiter,
  Saturno, Urano, Netuno, Plutão. Mandala Fase 3 expandiu de 5 → 10.
- **12 signos + 12 casas**: array de 12 entries, longitude 0-360°.
- **Absolute longitude** (0-360°) é a fonte de verdade para MandalaChart
  (lesson F-230). `degree` (0-30°) é só para display no InfoPanel.
- **Determinístico**: zero `Math.random()` em código de produção.
  Mesma data de nascimento + local → mesmo resultado.
- **Stub fallback** (F-230): se Swiss Ephemeris falhar, retornar
  `provisional: true` + `error` field, NÃO inventar posição.

## Work Guidance

- **PT-BR primeiro** (i18n config). Nomes de signos em PT-BR com
  fallback transliterado. Aspectos em PT-BR ("Trígono", "Quadratura").
- **Determinism in tests**: usar `vi.useFakeTimers()` para
  data-dependente tests. NUNCA depender de `Date.now()` real.
- **Ayanamsa choice**: default Lahiri (sistema mais usado
  publicamente). Não inventar novo sistema.
- **Swiss Ephemeris vs mock**: o engine é puro (sem rede), mas aceita
  um "mock ephemeris" para testes (injetar diretamente longitudes).
- **Type stability**: `Planet`, `Sign`, `Aspect`, `House` são
  contratos públicos. Mudanças quebrantes exigem major version.
- **Performance**: `aspect-finder.ts` é O(n²) sobre 10 planetas = 45
  pares. `birth-chart.ts` agrega tudo. Manter < 50ms para birth
  chart completo.

## Verification

- `pnpm --filter @akasha/core-astrology typecheck` — `tsc --noEmit`
- `pnpm --filter @akasha/core-astrology test:run` (via vitest root config)
- Antes de commit: typecheck
- Antes de merge: typecheck + portal typecheck (MandalaChart,
  Mandato, Mentor importam este package)

## Related Files

- `packages/core-tantra/AGENTS.md` — Pilar 3 (sibling)
- `packages/core-odus/AGENTS.md` — Pilar 4 (sibling)
- `apps/akasha-portal/AGENTS.md` §Local Contracts — Mandala data
  shape (data.astrology)
- `apps/akasha-portal/src/lib/shared/zodiac.ts` — helpers downstream
  (formatDegreeToZodiac, longitudeToSvgAngle)
- `apps/akasha-portal/src/lib/shared/koshas.ts` — companion layer
  (5 koshas védicas no InfoPanel)

## Child DOX Index

(Nenhum subdiretório com AGENTS.md dedicado. Se `src/swiss-ephemeris/`
for criado com múltiplas efemérides, ganhar AGENTS.md próprio.)
