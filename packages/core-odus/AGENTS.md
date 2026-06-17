# @akasha/core-odus DOX

## Purpose

Motor determinístico dos Odus Ifá (Merindilogun) — Pilar 4 (Odu) do
Akasha. Engine puro, sem dependências de framework, sem rede, sem DB.
Mesma entrada → mesma saída (testável, auditável, eticamente confiável).

**Canonical count**: 15 Odus (D-044, NÃO 16). O `package.json` description
diz "16 Odus" mas é impreciso — `ODUS_IFA` tem 15 entries canônicas. Odu
16º (Irosu Odi) é composto e tratado via `comparison.ts`, não como
entry própria. (Ver lesson `session-n-plus-15-f-219-pilar4-truth-base.md`.)

## Ownership

- `src/odus-ifa-data.ts`: 15 Odus canônicos (ODUS_IFA + getOduPorNumero)
- `src/calculos.ts`: odusData, calcularOduNascimento, getQuizilasPorOdu,
  getPreceitosPorOdu, getEbósPorOdu, type OduInfo
- `src/odu-birth.ts`: calculateBirthOdu — Odu de Nascimento
- `src/draw.ts`: getOpe, getAllOdu, drawOdu, drawMultipleOdu, types Ope/Odu/DrawResult
- `src/matching.ts`: matchOduToRitual — Odu → ritual match
- `src/comparison.ts`: compareOduNumbers — comparação entre Odus
- `src/suggestions.ts`: getRitualSuggestions, getRitualTiming
- `src/timeline.ts`: getOduTimeline, getPhaseProgress, types TimelinePhase/Event/OduTimeline
- `src/odu-data.ts`: odu-data (legacy ou compat layer)
- `src/odus-constants.ts`: constantes dos Odus (números, paths)
- `src/index.ts`: barrel — export point público

## Local Contracts

- **15 Odus canônicos** (D-044). `ODUS_IFA` é source of truth. NÃO
  inventar entry 16ª — se compound (Irosu Odi), tratar via
  `comparison.ts` ou `matching.ts`.
- **Determinístico**: `getOduByNumber(n)` retorna sempre o mesmo
  objeto. `calcularOduNascimento(birthData)` retorna sempre o mesmo
  Odu para a mesma data. ZERO `Math.random()` em código de produção.
- **Naming PT-BR**: nomes dos Odus em português (Ogbe, Obara, etc —
  transliteração yorubá, com fallback `getOduNome`).
- **Type stability**: `OduInfo`, `Odu`, `DrawResult` são contratos
  públicos. Mudanças quebrantes exigem major version bump.
- **Stub fallback** (F-219): se um consumer pedir um Odu composto
  (ex: "Irosu Odi"), `getOduByName` deve retornar uma das 15 entries
  canônicas + warning, NÃO inventar nome composto. Pilar 4 ethics
  invariant: `requer consentimento + terreiro`.
- **Zero network**: package não importa nada de `@supabase`, `fetch`,
  `axios`. Toda a lógica é local.

## Work Guidance

- **Pilar 4 ethics invariant** (Doc 25 §4.4): Pilar 4 (Odu) é o mais
  sensível culturalmente. Toda nova entry ou rule DEVE ser curada
  contra o canon (D-044). NUNCA inventar correspondência esotérica.
- **Canonical whitelist (15 nomes)** — derivada de D-044. Fora dela,
  use stub fallback + warning. Ver lesson `session-n-plus-15-f-219-pilar4-truth-base.md`.
- **API stability**: mudar `OduInfo` ou `Odu` é breaking change. Para
  nova metadata, adicionar field opcional com `?`.
- **Performance**: `getOduByNumber` é chamado em hot path
  (Mandala render, Mandato generation). Manter O(1) lookup.
- **Idioma**: nomes em PT-BR por padrão. `getOduNome` aceita locale
  opcional mas default é `pt-BR`.
- **Tests determinísticos**: usar `vi.useFakeTimers()` quando test
  depender de data (Odu de Nascimento muda com calendário).
- **F-219 lesson critical**: F-219 (Pilar 4 truth-base) já consertou
  `getOduByName` para usar a whitelist canônica. NÃO reverter.

## Verification

- `pnpm --filter @akasha/core-odus typecheck` — `tsc --noEmit`
- Antes de commit: rodar typecheck
- Antes de merge: rodar typecheck + portal typecheck (MandalaChart,
  Mandato, Mentor importam este package)
- Test pollution check (lesson N+18): rodar `pnpm test:run
  tests/<relevant>` isolado E em suite
- Determinism check: para uma entrada conhecida, output deve ser
  byte-identical entre runs

## Known Issues / Notes

- **`package.json` description imprecisa**: diz "16 Odus" mas o
  canon é 15 (D-044). Sugere-se correção futura (mas é M state em
  outra sessão, não posso modificar agora).
- **Sem `test:run` script** no `package.json` (só typecheck). Tests
  vivem no portal ou em `tests/lib/` se houver.

## Child DOX Index

(Nenhum subdiretório com AGENTS.md dedicado. Se `src/calculos/` ou
`src/rituals/` crescerem com decisões arquiteturais não-óbvias, criar
`src/<dir>/AGENTS.md`.)
