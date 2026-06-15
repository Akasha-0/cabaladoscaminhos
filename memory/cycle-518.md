# Cycle 518 — 2026-06-15

## F-230: Mandala Fase 3 — Anel Zodiacal Expandido + Tantra 5 Koshas

Spec 1/4 do roadmap contínuo (Mandala → Qualidade → Grimoire → RAG).
Sessão única 4-8h, totalmente autônoma. Executada via `grill-with-docs` + `brainstorming`.

### What was done

#### Fase 3: Anel Zodiacal Expandido
- **Bug fix crítico (linha 379 MandalaChart.tsx)**: `pos: toXY((p.degree / 360) * 360, 178)` é
  matematicamente igual a `toXY(p.degree, 178)`. Como `p.degree` era grau DENTRO do signo (0-30°),
  todos os 10 planetas ficavam clusterizados no arco 0-30° (visualmente errado). Agora usa
  `absoluteLongitude` (0-360°).
- **10 glifos astrológicos**: Sol ☽ Lua ☽ Mercúrio ☿ Vênus ♀ Marte ♂ Júpiter ♃ Saturno ♄
  Urano ♅ Netuno ♆ Plutão ♇ (cada um com cor fixa).
- **12 casas astrológicas**: linhas tracejadas + números 1-12, casa 1 = ascendente (longitude 0°).
- **Rotação contínua removida**: era 120s linear infinite, agora `animation: none`. Posição fixa.
- **Acessibilidade**: `role="img"` + `aria-label` em cada planeta, `<title>` e `<desc>` no SVG.
- **Sufixo ℞** se `planet.retrograde === true`.

#### Fase 4: InfoPanel Tantra com 5 Koshas Védicas
- **Conceito paralelo**: as 5 koshas (pancha-kosha, Tantra Védica) são adicionadas ao InfoPanel
  do Layer 3, AO LADO (sem substituir) os 11 bodies de Yogi Bhajan que já existem no SVG.
- **Fonte**: tradição tântrica védica (Taittiriya Upanishad, Vivekachudamani). Pilar 1 koréby:
  descrições não inventadas.

#### i18n
- `en.json` + `pt-BR.json`: chaves `mandala.houses.1-12`, `mandala.retrograde`, `mandala.ascendant`,
  `mandala.koshas.sectionTitle`.

### Verification
- `pnpm --filter akasha-portal typecheck`: exit 0
- `pnpm --filter akasha-portal lint`: 0 errors (242 warnings pré-existentes)
- `pnpm test:run src/lib/shared/zodiac.test.ts`: 12/12 passing
- `pnpm test:run src/lib/shared/koshas.test.ts`: 5/5 passing
- MandalaChart InfoPanel Tantra renderiza: 11 bodies Yogi Bhajan + 5 koshas védicas

### Key Files Changed
- `apps/akasha-portal/src/app/api/akasha/mandala/route.ts` — passa `absoluteLongitude` e `retrograde`
- `apps/akasha-portal/src/lib/shared/zodiac.ts` — adiciona `GLYPHS_BY_PLANET`, `PLANET_COLORS`,
  `longitudeToSvgAngle`
- `apps/akasha-portal/src/lib/shared/kodiac.test.ts` — 12 testes para os novos helpers
- `apps/akasha-portal/src/lib/shared/koshas.ts` — `KOSHAS` (5 koshas védicas) + types
- `apps/akasha-portal/src/lib/shared/koshas.test.ts` — 5 testes para KOSHAS
- `apps/akasha-portal/src/components/akasha/MandalaChart.tsx` — planetDots usa absoluteLongitude,
  glifos unicode, 12 casas, InfoPanel Tantra com 5 koshas
- `apps/akasha-portal/src/i18n/en.json` + `pt-BR.json` — novas chaves i18n
- `apps/akasha-portal/AGENTS.md` — DOX pass (Ownership, Local Contracts, Work Guidance)
- `.trae/specs/mandala-fase3-zodiac-tantra/` — spec, tasks, checklist (3 commits de docs)

### Decisions & Corrections
- **CodeGraph check (Task 1)** revelou que premissa "Council" do spec original estava errada.
  Council não existe no `MandalaData`; o que parecia ser Council era partículas decorativas.
  Real estrutura: Layer 5 = I-Ching (Chave), Tantra = Layer 3 com 11 nodes (Yogi Bhajan).
- **Fase 4 foi simplificada**: as 11 bodies de Yogi Bhajan são dados válidos (não destruir).
  5 koshas védicas vão como InfoPanel enriquecido, sem mexer no SVG. Spec foi corrigido
  em 2 commits de docs.
- **Longitude data já existia**: `core-astrology` já tinha `p.longitude` (longitude absoluta).
  Não foi preciso modificar o package — só passar pelo route handler.

### Specs
- `.trae/specs/mandala-fase3-zodiac-tantra/spec.md` — 11 requisitos
- `.trae/specs/mandala-fase3-zodiac-tantra/tasks.md` — 14 tasks em 3 blocos
- `.trae/specs/mandala-fase3-zodiac-tantra/checklist.md` — verificação

### Next Spec (Qualidade)
Próximo do roadmap: Consolidação de Qualidade. Candidatos:
- Polyfill ResizeObserver (testes falham em SSR)
- Cobertura de testes dos 263 testes que falham
- Acessibilidade ampliada (além de WCAG AA mínimo já aplicado)
- Error states consistentes em todo o app
- Performance mobile (Capacitor)
- i18n EN completo (pipeline translate-en-sections.mjs)
- Build size analysis
- Segurança (auditoria de inputs nas APIs)

### Next
- Próxima sessão: spec Qualidade (próximo do roadmap)
- Validar visualmente que planetas estão distribuídos na eclíptica (browser test)
- Specs futuras: Fases 5 (Mandato/Dashboard) e 6 (Animações) detalhadas em
  `mandala-fase3-zodiac-tantra/spec.md` §"Fases 5 e 6"
