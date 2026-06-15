# Checklist — Mandala Fase 3: Anel Zodiacal Expandido + InfoPanel Tantra

## Fase 3 — Anel Zodiacal Expandido

### Bug fix de longitude

- [ ] `absoluteLongitude` adicionado ao planet shape no route handler
- [ ] `core-astrology` NÃO é modificado (longitude já existe)
- [ ] MandalaChart usa `absoluteLongitude` em vez de `degree` para renderizar planeta
- [ ] `longitudeToAngle(0)` retorna 180° SVG (esquerda, 9 horas)
- [ ] `longitudeToAngle(90)` retorna 90° SVG (baixo, 6 horas)
- [ ] `longitudeToAngle(180)` retorna 0° SVG (direita, 3 horas)
- [ ] `longitudeToAngle(270)` retorna 270° SVG (cima, 12 horas)
- [ ] Planetas não estão mais clusterizados no arco 0-30°
- [ ] Unit tests para `longitudeToAngle` passam

### Glifos astrológicos

- [ ] 10 planetas renderizam como glifos unicode (☉ ☽ ☿ ♀ ♂ ♃ ♄ ♅ ♆ ♇)
- [ ] Glifos não renderizam como dots genéricos
- [ ] Cores fixas por planeta (Sol/Lua = dourado/prata; clássicos = branco; modernos = cinza)
- [ ] Tamanho do glifo: 12-14px (legível)
- [ ] Sufixo ℞ aparece se `planet.retrograde === true`
- [ ] Glifos não conflitam visualmente com os signos (camadas separadas)

### 12 Casas Astrológicas

- [ ] 12 linhas radiais dividem o anel zodiacal em segmentos
- [ ] Casa 1 começa no ascendente (ângulo 0° longitude)
- [ ] Números das casas (1-12) visíveis no centro de cada segmento
- [ ] Linha cheia para signos, linha tracejada para casas (diferenciação visual)
- [ ] Casa 1 (ascendente) e Casa 10 (meio do céu) com marca visual especial

### Rotação

- [ ] Anel zodiacal NÃO rotaciona continuamente (120s linear removido)
- [ ] Posição inicial é fixa
- [ ] Verificar que nenhuma outra parte do código depende da rotação
- [ ] Animações restantes (se houver) fazem sentido sem a rotação do zodiac

### Acessibilidade

- [ ] Contraste dos textos ≥ 4.5:1 (WCAG AA)
- [ ] Cada planeta tem `<g role="img" aria-label="...">` com nome + signo + grau
- [ ] `<svg>` tem `<title>` e `<desc>` nativos

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
- [ ] Unit tests de `longitudeToAngle` passam
- [ ] Testes anteriores (Fase 1, 2) não regrediram

### Verificação técnica

- [ ] `pnpm --filter akasha-portal typecheck` exit 0
- [ ] `pnpm --filter akasha-portal lint` exit 0
- [ ] `pnpm --filter akasha-portal test:unit` exit 0
- [ ] Sem regressão no InfoPanel da Camada 4 (Fase 2)

### Commit

- [ ] Mensagem: `feat(mandala): Fase 3 - anel zodiacal expandido (10 planetas + 12 casas + glifos)`
- [ ] Arquivos modificados: `route.ts` (mandala), `MandalaChart.tsx`, `zodiac.ts`, `i18n/*.json`, `MandalaChart.test.tsx`
- [ ] Commit no log

---

## Fase 4 — InfoPanel Tantra enriquecido

### KOSHAS data

- [ ] Arquivo `apps/akasha-portal/src/lib/shared/koshas.ts` criado
- [ ] `KOSHAS: Kosha[]` com 5 entradas (Anna, Prana, Mano, Vijnana, Ananda)
- [ ] Cada kosha tem: id, name (pt/en/sanskrit), color, description (pt/en)
- [ ] Exportado de `lib/shared/index.ts`
- [ ] Unit test valida 5 entries com IDs únicos

### InfoPanel Tantra

- [ ] InfoPanel do Layer 3 localizado
- [ ] Seção 1 (existente): 11 bodies de Yogi Bhajan permanece
- [ ] Seção 2 (NOVA): "5 Koshas (Tantra Védica)" adicionada abaixo
- [ ] Cada kosha mostra: nome sânscrito, tradução PT, badge de cor, descrição
- [ ] SVG do Layer 3 INTOCADO (11 nodes permanecem)

### i18n

- [ ] `en.json` tem `mandala.koshas.sectionTitle`
- [ ] `pt-BR.json` tem `mandala.koshas.sectionTitle`
- [ ] Ambos os idiomas sincronizados

### Testes

- [ ] Snapshot test passa com InfoPanel atualizado
- [ ] Snapshot inclui "Anna", "Prana", "Mano", "Vijnana", "Ananda"
- [ ] Testes anteriores não regrediram
- [ ] SVG do Layer 3 não regrediu (11 nodes presentes)

### Verificação técnica

- [ ] `pnpm --filter akasha-portal typecheck` exit 0
- [ ] `pnpm --filter akasha-portal lint` exit 0
- [ ] `pnpm --filter akasha-portal test:unit` exit 0

### Commit

- [ ] Mensagem: `feat(mandala): Fase 4 - InfoPanel Tantra enriquecido com 5 Koshas védicas`
- [ ] Arquivos modificados: `koshas.ts`, `lib/shared/index.ts`, `MandalaChart.fase2.tsx` (InfoPanel), `i18n/*.json`, `MandalaChart.test.tsx`
- [ ] Commit no log

---

## Fechamento

### AGENTS.md (DOX pass)

- [ ] `apps/akasha-portal/src/components/akasha/AGENTS.md` documenta nova estrutura visual (10 glifos, 12 casas, rotação removida, koshas no InfoPanel)
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

- [ ] Pilar 1 (Cabala) koréby: descrições das koshas de fontes tântricas védicas (Taittiriya Upanishad), não inventadas
- [ ] Pilar 4 (Odu) ethics: koshas não tocam em "consentimento + terreiro"
- [ ] LGPD by design: nenhum PII exposto
- [ ] Performance: render < 16ms (medido com React DevTools Profiler, sem memo prematuro)
- [ ] i18n: en.json + pt-BR.json sincronizados
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
- ❌ Substituir 11 bodies (Yogi Bhajan) por 5 koshas — seriam dados distintos; optou-se por InfoPanel
