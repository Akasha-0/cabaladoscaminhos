# Checklist — Mandala Fase 3: Anel Zodiacal Expandido + Tantra 5 Koshas

## Fase 3 — Anel Zodiacal Expandido

### Bug fix de longitude

- [ ] `absoluteLongitude` adicionado ao tipo `Planet` em `core-astrology`
- [ ] `signIndex * 30 + degree` calculado corretamente em `birth-chart.ts`
- [ ] Unit test confirma: `Sol em Gêmeos 15°` → `absoluteLongitude === 75`
- [ ] MandalaChart usa `absoluteLongitude` em vez de `degree` para renderizar planeta
- [ ] Sol em Áries 0° renderiza em ângulo 0° (esquerda do relógio)
- [ ] Sol em Peixes 29° renderiza em ângulo 359° (à esquerda, perto de 0°)
- [ ] Planetas não estão mais clusterizados no arco 0-30°

### Glifos astrológicos

- [ ] 10 planetas renderizam como glifos unicode (☉ ☽ ☿ ♀ ♂ ♃ ♄ ♅ ♆ ♇)
- [ ] Glifos não renderizam como dots genéricos
- [ ] Cores fixas por planeta (Sol/Lua = dourado/prata; clássicos = branco; modernos = cinza)
- [ ] Tamanho do glifo: 12-14px (legível)
- [ ] Tooltip no hover mostra: "Planeta em Signo, grau°"
- [ ] Sufixo ℞ aparece se `planet.retrograde === true`
- [ ] Glifos não conflitam visualmente com os signos (camadas separadas)

### 12 Casas Astrológicas

- [ ] 12 linhas radiais dividem o anel zodiacal em segmentos
- [ ] Casa 1 começa no ascendente (ângulo 0°)
- [ ] Casas incrementam anti-horário (sistema Placidus simplificado)
- [ ] Números das casas (1-12) visíveis no centro de cada segmento
- [ ] Linha cheia para signos, linha tracejada para casas (diferenciação visual)
- [ ] Casa 1 e Casa 10 (ascendente e meio do céu) com marca visual especial

### Rotação

- [ ] Anel zodiacal NÃO rotaciona continuamente (120s linear removido)
- [ ] Posição inicial é fixa
- [ ] Verificar que nenhuma outra parte do código depende da rotação
- [ ] Animações restantes (se houver) fazem sentido sem a rotação do zodiac

### Acessibilidade

- [ ] Contraste dos textos ≥ 4.5:1 (WCAG AA)
- [ ] Cada planeta tem `<g role="img" aria-label="...">` com nome + signo + grau
- [ ] `<svg>` tem `<title>` e `<desc>` nativos
- [ ] Tab navega entre planetas (focus order segue o anel)
- [ ] Sem dependência de cor para identificar planetas (forma + cor)

### i18n

- [ ] `en.json` tem `mandala.houses.1` ... `mandala.houses.12`
- [ ] `pt-BR.json` tem `mandala.houses.1` ... `mandala.houses.12`
- [ ] `en.json` tem `mandala.retrograde` e `mandala.ascendant`
- [ ] `pt-BR.json` tem `mandala.retrograde` e `mandala.ascendant`
- [ ] Sem chaves faltando em um dos idiomas

### Testes

- [ ] Snapshot test do MandalaChart passa
- [ ] Snapshot inclui 10 glifos
- [ ] Snapshot inclui 12 casas numeradas
- [ ] Unit tests de `absoluteLongitude` passam
- [ ] Testes anteriores (Fase 1, 2) não regrediram

### Verificação técnica

- [ ] `pnpm --filter akasha-portal typecheck` exit 0
- [ ] `pnpm --filter akasha-portal lint` exit 0
- [ ] `pnpm --filter akasha-portal test:unit` exit 0
- [ ] Sem regressão no InfoPanel da Camada 4 (Fase 2)

### Commit

- [ ] Mensagem: `feat(mandala): Fase 3 - anel zodiacal expandido (10 planetas + 12 casas + glifos)`
- [ ] Arquivos modificados: `core-astrology`, `MandalaChart.tsx`, `zodiac.ts`, `i18n/*.json`, `MandalaChart.test.tsx`
- [ ] Commit no log

---

## Fase 4 — Tantra 5 Koshas

### Camada 5 visual

- [ ] Camada 5 renderiza 5 segmentos de 72° cada
- [ ] Cores corretas:
  - [ ] Anna (físico): `#E27D60`
  - [ ] Prana (energético): `#C38D9E`
  - [ ] Mano (mental): `#9DADE3`
  - [ ] Vijnana (sabedoria): `#7C5CFF`
  - [ ] Ananda (beatitude): `#FFD166`
- [ ] Opacidade dos segmentos: 0.15-0.20 (sutis)
- [ ] Labels centralizados nos segmentos
- [ ] Koshas não competem visualmente com o anel zodiacal

### 11 nodes removidos, 5 koshas renderizados

- [ ] `Array.from({ length: 11 })` substituído por iteração em `data.tantra.bodies` (5 entries)
- [ ] 5 koshas renderizam como segmentos de 72° no raio 138
- [ ] Cores corretas aplicadas
- [ ] Constante `TANTRIC_BODY_WISDOM` depreciada (ou migrada, decisão de implementação)

### InfoPanel Tantra

- [ ] Título: "5 Koshas (Tantra)"
- [ ] Lista das 5 koshas com nome sânscrito, tradução PT, descrição
- [ ] Fonte: tradição tântrica (não inventada)
- [ ] Badge "Ativo" / "Inativo" para cada kosha baseado em `data.tantra.bodies[i].active`
- [ ] Estado vazio: "Sem dados dos corpos" quando `data.tantra.bodies.length === 0`
- [ ] SignificadoEmbed com source attribution se houver correspondência

### i18n

- [ ] `en.json` tem `mandala.koshas.anna/prana/mano/vijnana/ananda` com traduções EN
- [ ] `pt-BR.json` tem `mandala.koshas.*` com traduções PT
- [ ] `en.json` tem `mandala.koshas.sectionTitle`
- [ ] `pt-BR.json` tem `mandala.koshas.sectionTitle`
- [ ] Descrições das 5 koshas em ambos os idiomas

### Testes

- [ ] Snapshot test atualizado passa
- [ ] Snapshot inclui "Anna", "Prana", "Mano", "Vijnana", "Ananda"
- [ ] Testes anteriores não regrediram

### Verificação técnica

- [ ] `pnpm --filter akasha-portal typecheck` exit 0
- [ ] `pnpm --filter akasha-portal lint` exit 0
- [ ] `pnpm --filter akasha-portal test:unit` exit 0
- [ ] Sem regressão nos InfoPanels

### Commit

- [ ] Mensagem: `feat(mandala): Fase 4 - Tantra 5 Koshas (substitui 11 nodes no Layer 3)`
- [ ] Arquivos modificados: `MandalaChart.tsx`, `koshas.ts`, `i18n/*.json`, `MandalaChart.test.tsx`
- [ ] Commit no log

---

## Fechamento

### AGENTS.md (DOX pass)

- [ ] `apps/akasha-portal/src/components/akasha/AGENTS.md` documenta nova estrutura visual
- [ ] `packages/core-astrology/AGENTS.md` documenta `absoluteLongitude` em `Planet`
- [ ] `apps/akasha-portal/AGENTS.md` atualiza scope/ownership
- [ ] Docs batem com o código (sem DOX drift)

### Validação final

- [ ] `pnpm --filter akasha-portal typecheck` exit 0
- [ ] `pnpm --filter akasha-portal lint` exit 0
- [ ] `pnpm --filter akasha-portal test:unit` exit 0
- [ ] `pnpm --filter akasha-portal build` exit 0

### Memory cycle

- [ ] `memory/cycle-518.md` criado (próximo número após 517)
- [ ] F-230 (próxima evolução) registrado com referência a este spec
- [ ] Resumo do trabalho no log

---

## Constraints Verificados

- [ ] Pilar 1 (Cabala) koréby: descrições das koshas de fontes tântricas, não inventadas
- [ ] Pilar 4 (Odu) ethics: koshas não tocam em "consentimento + terreiro"
- [ ] LGPD by design: nenhum PII exposto (datas completas, locais)
- [ ] Performance: render < 16ms (medido com React DevTools Profiler)
- [ ] i18n: en.json + pt-BR.json sincronizados (sem chaves faltando)
- [ ] Acessibilidade: WCAG AA mínimo
- [ ] Build: typecheck + lint + test:unit + build passam
- [ ] Commit: 1 por fase (2 commits total); conventional commits
- [ ] Docs: AGENTS.md atualizado após mudanças

## Não-objetivos (explicitamente fora do escopo)

- ❌ Fases 5 (Mandato/Dashboard) — spec futuro
- ❌ Fase 6 (Animações/polimento) — spec futuro
- ❌ Aspectos astrológicos no SVG (linhas entre planetas) — sub-fase futura
- ❌ Drag-to-rotate no anel — sub-fase futura
- ❌ Visual Companion / mockups iterativos — não usado nesta sessão
- ❌ E2E tests — overhead alto para sessão autônoma
- ❌ Code-splitting / SSR optimization — risco alto, spec futuro
- ❌ Specs de Qualidade, Grimoire, RAG/Mentor — outras specs do roadmap
