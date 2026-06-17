# Tasks — Mandala Fase 3: Anel Zodiacal Expandido + InfoPanel Tantra

> Sessão única 4-8h, totalmente autônoma. Cada Fase vira 1 commit.
> Sequencial (sem subagentes paralelos). Auto-recovery + reportar falhas.
>
> **Nota**: tasks.md foi reescrito após CodeGraph check (Task 1) revelar:
> - `data.tantra.bodies` tem 11 entries (Yogi Bhajan), não 5
> - `p.longitude` (longitude absoluta) já existe no `core-astrology`, só precisa ser passada pelo route handler
> - SVG Layer 3 NÃO é modificado; Fase 4 vira enriquecimento do InfoPanel

## Dependências

- [`mandala-fase1-api-route`](file:///home/skynet/cabala-dos-caminhos/.trae/specs/mandala-fase1-api-route/spec.md) — API route expandida (completo ✓)
- [`mandala-fase2-infopanels`](file:///home/skynet/cabala-dos-caminhos/.trae/specs/mandala-fase2-infopanels/spec.md) — InfoPanels completos (completo ✓)

---

## Task 1: Mapear consumidores de `planets` e `bodies` ✓ COMPLETO

CodeGraph: identificar todos os lugares que consomem `data.astrology.planets` e `data.tantra.bodies`.

- [x] Task 1.1: `codegraph explore "who consumes data.astrology.planets"`
- [x] Task 1.2: `codegraph explore "who consumes data.tantra.bodies or tantricNodes"`
- [x] Task 1.3: Listar consumidores — encontrado: apenas `MandalaChart.tsx` + `MandalaChart.fase2.tsx` (InfoPanel)
- [x] Task 1.4: Decisão: `data.tantra.bodies` é 11 entries (Yogi Bhajan) e devem permanecer no SVG. 5 koshas vão como InfoPanel.

**Verificação**: ✓ decisão documentada; sem risco de regressão em outros consumidores

---

## Task 2: Passar `absoluteLongitude` pelo route handler (Fase 3)

O dado `p.longitude` (longitude absoluta) já existe em `core-astrology`. O route handler só precisa passá-lo adiante, junto com o campo `degree` atual.

- [ ] Task 2.1: Editar `apps/akasha-portal/src/app/api/akasha/mandala/route.ts`: na linha que mapeia `p` para o planet shape, adicionar `absoluteLongitude: p.longitude`
- [ ] Task 2.2: Verificar typecheck do `MandalaData.astrology.planets[].absoluteLongitude`
- [ ] Task 2.3: Adicionar unit test do mapper: `planet.absoluteLongitude === astrologiaMap.planeta[planetKey].longitude`
- [ ] Task 2.4: NÃO modificar `core-astrology` (já tem o dado, é só transporte)

**Verificação**: typecheck passa; planet shape inclui `absoluteLongitude`

---

## Task 3: Helpers de glifos em `zodiac.ts` (Fase 3)

Adicionar mapeamento de glifos astrológicos.

- [ ] Task 3.1: Adicionar `GLYPHS_BY_PLANET: Record<string, string>` em `apps/akasha-portal/src/lib/shared/zodiac.ts`:
  - `Sol: '☉'`, `Lua: '☽'`, `Mercúrio: '☿'`, `Vênus: '♀'`, `Marte: '♂'`, `Júpiter: '♃'`, `Saturno: '♄'`, `Urano: '♅'`, `Netuno: '♆'`, `Plutão: '♇'`
- [ ] Task 3.2: Adicionar `PLANET_COLORS: Record<string, string>` com cores fixas
- [ ] Task 3.3: Adicionar `longitudeToAngle(absoluteLongitude: number): number` que retorna SVG angle com 0° = 9 horas (esquerda), fórmula `(180 - longitude + 360) % 360`
- [ ] Task 3.4: Adicionar unit tests para `longitudeToAngle`

**Verificação**: typecheck passa; helpers são pure functions

---

## Task 4: Refatorar `renderZodiac` no MandalaChart (Fase 3)

Corrigir o bug de longitude e adicionar 12 casas.

- [ ] Task 4.1: Editar `MandalaChart.tsx`: na função que renderiza planetas, usar `absoluteLongitude` em vez de `degree`
- [ ] Task 4.2: Trocar dots por glifos unicode (`GLYPHS_BY_PLANET[planet.name]`)
- [ ] Task 4.3: Aplicar cor fixa por planeta (Sol/Lua = dourado/prata; clássicos = branco; modernos = cinza claro)
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

- [ ] Task 6.1: Verificar se `apps/akasha-portal/src/components/akasha/MandalaChart.test.tsx` existe
- [ ] Task 6.2: Adicionar/atualizar mock de `data.astrology.planets` para incluir `absoluteLongitude`
- [ ] Task 6.3: Adicionar mock de `data.astrology.houses` (12 casas)
- [ ] Task 6.4: Atualizar snapshot do SVG renderizado
- [ ] Task 6.5: Verificar que snapshot inclui glifos (☉ ☽ ☿ ♀ ♂ ♃ ♄ ♅ ♆ ♇) e casas (1-12)

**Verificação**: snapshot test passa

---

## Task 7: Verificação Fase 3 + Commit (Fase 3)

Rodar todos os checks e fazer commit.

- [ ] Task 7.1: `pnpm --filter akasha-portal typecheck` → exit 0
- [ ] Task 7.2: `pnpm --filter akasha-portal lint` → exit 0
- [ ] Task 7.3: `pnpm --filter akasha-portal test:unit` → exit 0
- [ ] Task 7.4: Verificar que InfoPanel da Camada 4 (Fase 2) não regrediu
- [ ] Task 7.5: `git add` dos arquivos modificados
- [ ] Task 7.6: `git commit -m "feat(mandala): Fase 3 - anel zodiacal expandido (10 planetas + 12 casas + glifos)"`
- [ ] Task 7.7: Verificar que commit foi criado

**Verificação**: commit no log; todos os checks passam

---

## Task 8: Criar `KOSHAS` data (Fase 4)

Constante separada para 5 koshas védicas.

- [ ] Task 8.1: Criar `apps/akasha-portal/src/lib/shared/koshas.ts` com `KOSHAS: Kosha[]` (5 entradas)
- [ ] Task 8.2: Cada kosha tem: id, name (pt/en/sanskrit), color, description (pt/en)
- [ ] Task 8.3: Exportar de `lib/shared/index.ts`
- [ ] Task 8.4: Adicionar unit test que valida 5 entries com IDs únicos

**Verificação**: typecheck passa; KOSHAS é importável

---

## Task 9: InfoPanel Tantra enriquecido (Fase 4)

Atualizar o InfoPanel da Camada 3 para mostrar as 5 koshas ao lado dos 11 bodies.

- [ ] Task 9.1: Localizar componente do InfoPanel do Layer 3 (em `MandalaChart.fase2.tsx` ou similar)
- [ ] Task 9.2: Adicionar seção "5 Koshas (Tantra Védica)" abaixo dos 11 bodies
- [ ] Task 9.3: Para cada kosha: nome sânscrito, tradução PT, badge de cor, descrição de 1-2 frases
- [ ] Task 9.4: Estado vazio: "Sem dados" se `KOSHAS` não importou (não deveria acontecer)
- [ ] Task 9.5: Não mexer no SVG do Layer 3 — 11 nodes de Yogi Bhajan permanecem

**Verificação**: InfoPanel renderiza com 2 seções (11 bodies + 5 koshas)

---

## Task 10: i18n para Fase 4

Adicionar entradas de koshas em en.json e pt-BR.json.

- [ ] Task 10.1: `en.json`: adicionar `mandala.koshas.sectionTitle` ("Tantra Védica: 5 Koshas")
- [ ] Task 10.2: `pt-BR.json`: adicionar `mandala.koshas.sectionTitle` ("Tantra Védica: 5 Koshas")
- [ ] Task 10.3: `en.json` + `pt-BR.json`: descrições das koshas vêm de KOSHAS (não precisam de i18n adicional)

**Verificação**: typecheck passa; ambos os idiomas sincronizados

---

## Task 11: Atualizar snapshot test (Fase 4)

Atualizar snapshot com InfoPanel Tantra enriquecido.

- [ ] Task 11.1: Atualizar snapshot se necessário (InfoPanel muda)
- [ ] Task 11.2: Verificar que snapshot inclui "Anna", "Prana", "Mano", "Vijnana", "Ananda" (nomes das koshas)

**Verificação**: snapshot test passa com InfoPanel atualizado

---

## Task 12: Verificação Fase 4 + Commit (Fase 4)

Rodar todos os checks e fazer commit.

- [ ] Task 12.1: `pnpm --filter akasha-portal typecheck` → exit 0
- [ ] Task 12.2: `pnpm --filter akasha-portal lint` → exit 0
- [ ] Task 12.3: `pnpm --filter akasha-portal test:unit` → exit 0
- [ ] Task 12.4: Verificar que InfoPanel Tantra renderiza com 2 seções
- [ ] Task 12.5: Verificar que SVG do Layer 3 (11 nodes) NÃO regrediu
- [ ] Task 12.6: `git add` dos arquivos modificados
- [ ] Task 12.7: `git commit -m "feat(mandala): Fase 4 - InfoPanel Tantra enriquecido com 5 Koshas védicas"`
- [ ] Task 12.8: Verificar que commit foi criado

**Verificação**: commit no log; todos os checks passam

---

## Task 13: Atualizar AGENTS.md (DOX pass)

Atualizar a documentação da hierarquia AGENTS.md.

- [ ] Task 13.1: `apps/akasha-portal/src/components/akasha/AGENTS.md`: documentar nova estrutura visual (10 glifos, 12 casas, rotação removida, koshas no InfoPanel)
- [ ] Task 13.2: `apps/akasha-portal/AGENTS.md`: atualizar scope/ownership
- [ ] Task 13.3: Verificar que docs refletem o estado real do código (sem DOX drift)

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
3. Tasks 13-14 = **Fechamento** (sem commit adicional)

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
