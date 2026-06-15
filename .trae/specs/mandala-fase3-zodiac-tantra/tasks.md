# Tasks — Mandala Fase 3: Anel Zodiacal Expandido + Tantra 5 Koshas

> Sessão única 4-8h, totalmente autônoma. Cada Fase vira 1 commit.
> Sequencial (sem subagentes paralelos). Auto-recovery + reportar falhas.

## Dependências

- [`mandala-fase1-api-route`](file:///home/skynet/cabala-dos-caminhos/.trae/specs/mandala-fase1-api-route/spec.md) — API route expandida (completo ✓)
- [`mandala-fase2-infopanels`](file:///home/skynet/cabala-dos-caminhos/.trae/specs/mandala-fase2-infopanels/spec.md) — InfoPanels completos (completo ✓)

---

## Task 1: Mapear consumidores de `planets` e `bodies`

CodeGraph: identificar todos os lugares que consomem `data.astrology.planets` e `data.tantra.bodies`. Resultado vira "Risks and Mitigations" do spec.

- [ ] Task 1.1: `codegraph explore "who consumes data.astrology.planets"`
- [ ] Task 1.2: `codegraph explore "who consumes data.tantra.bodies or tantricNodes"`
- [ ] Task 1.3: Listar arquivos consumidores em comentário no spec ou em handoff
- [ ] Task 1.4: Decidir se `data.tantra.bodies` tem semântica fixa de 5 entries (sim → replace 11 nodes; não → manter retrocompat)

**Verificação**: lista de consumidores identificada, decisão sobre 11→5 documentada

---

## Task 2: Adicionar `absoluteLongitude` à API (Fase 3)

Estender o tipo `Planet` em `core-astrology` para incluir longitude absoluta.

- [ ] Task 2.1: Editar `packages/core-astrology/src/types.ts`: adicionar `absoluteLongitude: number` em `Planet`
- [ ] Task 2.2: Editar `packages/core-astrology/src/birth-chart.ts`: calcular `signIndex * 30 + degree` ao construir cada planeta
- [ ] Task 2.3: Adicionar unit test: `planet.absoluteLongitude === signIndex * 30 + planet.degree`
- [ ] Task 2.4: Adicionar `houses: HouseCusp[]` ao tipo `AstrologyData` (com `absoluteLongitude` por cusp)
- [ ] Task 2.5: Verificar que API `/api/akasha/mandala` retorna os novos campos

**Verificação**: typecheck de `core-astrology` passa; testes novos passam

---

## Task 3: Helpers de longitude e glifos em `zodiac.ts` (Fase 3)

Adicionar funções utilitárias para conversão e mapeamento de glifos.

- [ ] Task 3.1: Adicionar `GLYPHS_BY_PLANET: Record<string, string>` com 10 planetas (☉ ☽ ☿ ♀ ♂ ♃ ♄ ♅ ♆ ♇)
- [ ] Task 3.2: Adicionar `longitudeToAngle(absoluteLongitude, ringOffset)` — converte longitude para ângulo SVG, considerando o ponto 0° = esquerda do relógio (não topo)
- [ ] Task 3.3: Adicionar `KOSHAS` data em arquivo separado `apps/akasha-portal/src/lib/shared/koshas.ts` (não em `zodiac.ts`)
- [ ] Task 3.4: Exportar de `index.ts` da pasta `lib/shared`

**Verificação**: typecheck passa; helpers são pure functions (testáveis)

---

## Task 4: Refatorar `renderZodiac` no MandalaChart (Fase 3)

Corrigir o bug de longitude e adicionar 12 casas.

- [ ] Task 4.1: Editar `MandalaChart.tsx`: na função que renderiza planetas, usar `absoluteLongitude` em vez de `degree`
- [ ] Task 4.2: Trocar dots por glifos unicode (`GLYPHS_BY_PLANET[planet.name]`)
- [ ] Task 4.3: Adicionar cor fixa por planeta (Sol/Lua = dourado/prata; clássicos = branco; modernos = cinza claro)
- [ ] Task 4.4: Adicionar sufixo ℞ se `planet.retrograde === true`
- [ ] Task 4.5: Adicionar `aria-label` em cada `<g>` de planeta (e.g., "Sol em Gêmeos, 15°")
- [ ] Task 4.6: Adicionar 12 casas numeradas no anel zodiacal (linha tracejada + número)
- [ ] Task 4.7: Remover a rotação contínua (120s linear) do anel zodiacal
- [ ] Task 4.8: Adicionar `<title>` e `<desc>` no `<svg>` do anel zodiacal

**Verificação**: visualmente, planetas estão distribuídos pela roda, casas visíveis, sem rotação

---

## Task 5: i18n para Fase 3 (novos rótulos)

Adicionar entradas em en.json e pt-BR.json.

- [ ] Task 5.1: `en.json`: adicionar `mandala.houses.1` ... `mandala.houses.12` ("First House", "Second House", ...)
- [ ] Task 5.2: `pt-BR.json`: adicionar `mandala.houses.1` ... `mandala.houses.12` ("Casa 1", "Casa 2", ...)
- [ ] Task 5.3: `en.json`: adicionar `mandala.retrograde` ("Retrograde")
- [ ] Task 5.4: `pt-BR.json`: adicionar `mandala.retrograde` ("Retrógrado")
- [ ] Task 5.5: `en.json`: adicionar `mandala.ascendant` ("Ascendant")
- [ ] Task 5.6: `pt-BR.json`: adicionar `mandala.ascendant` ("Ascendente")

**Verificação**: typecheck passa; en.json e pt-BR.json têm as mesmas chaves

---

## Task 6: Snapshot test do MandalaChart (Fase 3)

Teste de regressão visual.

- [ ] Task 6.1: Criar `apps/akasha-portal/src/components/akasha/MandalaChart.test.tsx` (se não existir)
- [ ] Task 6.2: Renderizar MandalaChart com mock de `data.astrology.planets` (10 planetas)
- [ ] Task 6.3: Renderizar com mock de `data.astrology.houses` (12 casas)
- [ ] Task 6.4: Snapshot do SVG renderizado (incluindo glifos, casas, sem rotação)
- [ ] Task 6.5: Verificar que snapshot inclui "Sol", "Lua", "Mercúrio" (em glifos) e "1", "2", ..., "12" (casas)

**Verificação**: snapshot test passa; git diff mostra novo arquivo

---

## Task 7: Verificação Fase 3 + Commit (Fase 3)

Rodar todos os checks e fazer commit.

- [ ] Task 7.1: `pnpm --filter akasha-portal typecheck` → exit 0
- [ ] Task 7.2: `pnpm --filter akasha-portal lint` → exit 0
- [ ] Task 7.3: `pnpm --filter akasha-portal test:unit` → exit 0
- [ ] Task 7.4: Verificar visualmente (se possível) que o anel zodiacal renderiza planetas
- [ ] Task 7.5: Verificar que InfoPanel da Camada 4 (Fase 2) não regrediu
- [ ] Task 7.6: `git add` dos arquivos modificados
- [ ] Task 7.7: `git commit -m "feat(mandala): Fase 3 - anel zodiacal expandido (10 planetas + 12 casas + glifos)"`
- [ ] Task 7.8: Verificar que commit foi criado

**Verificação**: commit no log; todos os checks passam

---

## Task 8: Adicionar `KOSHAS` data e renderizar Camada 5 (Fase 4)

Substituir 11 nodes hardcoded do Layer 3 por 5 Koshas (data-driven).

- [ ] Task 8.1: Criar `apps/akasha-portal/src/lib/shared/koshas.ts` com `KOSHAS: Kosha[]` (5 entradas)
- [ ] Task 8.2: Exportar de `lib/shared/index.ts`
- [ ] Task 8.3: Editar `MandalaChart.tsx`: substituir `Array.from({ length: 11 })` por iteração em `data.tantra.bodies` (5 entries)
- [ ] Task 8.4: Cada segmento ocupa 72° do anel externo
- [ ] Task 8.5: Aplicar cor de cada kosha com opacidade 0.15-0.20
- [ ] Task 8.6: Adicionar label da kosha (nome PT) centralizado no segmento
- [ ] Task 8.7: Remover a constante `TANTRIC_BODY_WISDOM` (depreciada) se nenhuma outra parte do código usar

**Verificação**: visualmente, 5 koshas visíveis no anel externo com cores e labels

---

## Task 9: InfoPanel Tantra (Fase 4)

Atualizar o InfoPanel da Camada 3 (Tantra) para mostrar as 5 koshas com badge ativo/inativo.

- [ ] Task 9.1: Editar o componente do InfoPanel (em `MandalaChart.tsx` ou extraído)
- [ ] Task 9.2: Adicionar seção "5 Koshas (Tantra)" com lista das 5 koshas
- [ ] Task 9.3: Para cada kosha: nome sânscrito, tradução PT, descrição curta
- [ ] Task 9.4: Mostrar badge "Ativo" / "Inativo" para cada kosha baseado em `data.tantra.bodies[i].active`
- [ ] Task 9.5: Se `data.tantra.bodies` for vazio, mostrar "Sem dados dos corpos"
- [ ] Task 9.6: Usar SignificadoEmbed com `pilar: 'tantrica'` para os textos das koshas (não inventar, usar significadoPorPilar)

**Verificação**: InfoPanel renderiza corretamente em ambos os estados (com/sem bodies)

---

## Task 10: i18n para Fase 4

Adicionar entradas de koshas em en.json e pt-BR.json.

- [ ] Task 10.1: `en.json`: adicionar `mandala.koshas.anna` (Physical), `prana` (Energetic), `mano` (Mental), `vijnana` (Wisdom), `ananda` (Bliss)
- [ ] Task 10.2: `pt-BR.json`: adicionar `mandala.koshas.anna` (Físico), `prana` (Energético), `mano` (Mental), `vijnana` (Sabedoria), `ananda` (Beatitude)
- [ ] Task 10.3: `en.json` + `pt-BR.json`: adicionar descrições curtas (1-2 frases) de cada kosha
- [ ] Task 10.4: `en.json`: adicionar `mandala.koshas.sectionTitle` ("Tantra: 5 Koshas")
- [ ] Task 10.5: `pt-BR.json`: adicionar `mandala.koshas.sectionTitle` ("Tantra: 5 Koshas")

**Verificação**: typecheck passa; ambos os idiomas sincronizados

---

## Task 11: Atualizar snapshot test (Fase 4)

Atualizar snapshot com novo render.

- [ ] Task 11.1: Atualizar `MandalaChart.test.tsx` para incluir mock de `data.koshas` (ou KOSHAS import)
- [ ] Task 11.2: Atualizar snapshot para refletir Camada 3 = 5 koshas (substitui 11 nodes)
- [ ] Task 11.3: Verificar que snapshot inclui "Anna", "Prana", "Mano", "Vijnana", "Ananda" (nomes)

**Verificação**: snapshot test passa com novo render

---

## Task 12: Verificação Fase 4 + Commit (Fase 4)

Rodar todos os checks e fazer commit.

- [ ] Task 12.1: `pnpm --filter akasha-portal typecheck` → exit 0
- [ ] Task 12.2: `pnpm --filter akasha-portal lint` → exit 0
- [ ] Task 12.3: `pnpm --filter akasha-portal test:unit` → exit 0
- [ ] Task 12.4: Verificar visualmente que a Camada 5 mostra koshas
- [ ] Task 12.5: Verificar que InfoPanel Tantra renderiza
- [ ] Task 12.6: `git add` dos arquivos modificados
- [ ] Task 12.7: `git commit -m "feat(mandala): Fase 4 - Tantra 5 Koshas (substitui 11 nodes no Layer 3)"`
- [ ] Task 12.8: Verificar que commit foi criado

**Verificação**: commit no log; todos os checks passam

---

## Task 13: Atualizar AGENTS.md (DOX pass)

Atualizar a documentação da hierarquia AGENTS.md.

- [ ] Task 13.1: `apps/akasha-portal/src/components/akasha/AGENTS.md`: documentar nova estrutura visual (5 koshas, 12 casas, 10 glifos)
- [ ] Task 13.2: `packages/core-astrology/AGENTS.md`: documentar `absoluteLongitude` em `Planet`
- [ ] Task 13.3: `apps/akasha-portal/AGENTS.md`: atualizar scope/ownership
- [ ] Task 13.4: Verificar que docs refletem o estado real do código (sem DOX drift)

**Verificação**: AGENTS.md bate com o código

---

## Task 14: Validação final + Memory cycle

Fechamento da sessão.

- [ ] Task 14.1: `pnpm --filter akasha-portal typecheck` → exit 0
- [ ] Task 14.2: `pnpm --filter akasha-portal lint` → exit 0
- [ ] Task 14.3: `pnpm --filter akasha-portal test:unit` → exit 0
- [ ] Task 14.4: `pnpm --filter akasha-portal build` → exit 0
- [ ] Task 14.5: Criar `memory/cycle-518.md` (próximo número após cycle-517)
- [ ] Task 14.6: Documentar F-230 (próxima evolução após F-229) com referência a este spec
- [ ] Task 14.7: Resumir trabalho no log de progresso

**Verificação**: ciclo registrado, F-XXX criado, build ok

---

## Ordem de Implementação

Sequencial obrigatório:

1. Tasks 1-7 = **Fase 3** (commit após Task 7)
2. Tasks 8-12 = **Fase 4** (commit após Task 12)
3. Tasks 13-14 = **Fechamento** (sem commit adicional; mudanças em AGENTS.md e memory cycle)

## Auto-recovery

Se algum check falhar:
1. Tentar corrigir o problema (e.g., import faltando, tipo errado)
2. Re-rodar check
3. Se falhar de novo, tentar refatoração maior
4. Se ainda falhar, reportar com:
   - Comando que falhou
   - Mensagem de erro completa
   - Arquivos modificados
   - Próximo passo sugerido
5. **NÃO** seguir para próxima task se algum check bloqueante falhou
