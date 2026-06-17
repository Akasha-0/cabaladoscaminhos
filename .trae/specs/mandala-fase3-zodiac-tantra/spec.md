# Mandala Fase 3 — Anel Zodiacal Expandido + Tantra 5 Koshas

## Status

✅ **CLOSED 2026-06-15** — see `memory/cycle-518.md` for the full implementation
report. Key commits:
- `7f37a8cf` feat(mandala): Fase 3 - anel zodiacal expandido (10 planetas + 12 casas + glifos)
- `3639518d` feat(mandala): Fase 4 - InfoPanel Tantra enriquecido com 5 Koshas védicas
- `3457b2a2` docs(mandala-fase3): DOX pass + cycle 518 (F-230 closure)

Spec was corrected in 2 docs commits (`c6b279e4`, `c416a6f1`) after a
CodeGraph check revealed the original "Council" assumption was wrong.
11 bodies Yogi Bhajan were preserved as valid data; 5 koshas védicas
added as parallel InfoPanel enrichment without modifying the SVG.

> **Multi-spec roadmap**: este é o spec 1/4 do ciclo de evolução contínua.
> Ordem de execução: **Mandala (este) → Qualidade → Grimoire → RAG/Mentor**.
> Janela: **sessão única de 4-8h, totalmente autônoma**.
> Implementa: **Fases 3 e 4**. Fases 5 e 6 detalhadas ao fim do spec para sessões futuras.

> **⚠️ CORREÇÃO PÓS-CODEGRAPH-CHECK (Task 1.1)**: a versão original deste spec assumia que existia um "Council" no `MandalaData` que precisava ser removido. **Não existe**. O que parecia ser Council era o layer de partículas decorativas. Estrutura real:
> - **Layer 1**: Ori (Odu) - centro
> - **Layer 2**: Contrato (Cabala) - triângulo interno (raio 80)
> - **Layer 3**: Vitalidade (Tantra) - **web tântrica com 11 nodes no raio 138** (sistema Yogi Bhajan, 11 corpos)
> - **Layer 4**: Céu (Astrologia) - **anel zodiacal com 12 signos + 10 planetas** ← aqui entra o fix
> - **Layer 5**: Chave (I-Ching) - hexagrama externo
>
> **Fase 4 simplificada**: as 11 bodies de Yogi Bhajan **NÃO** são destruídas (são dados válidos). O que mudou: adicionar **info adicional sobre as 5 koshas** (conceito tântrico védico paralelo) no InfoPanel do Layer 3, sem mexer no SVG. As 5 koshas ficam como metadado textual. Spec original (que propunha substituir 11 nodes) foi abandonado.

## Por que

O MandalaChart hoje tem dois problemas estruturais:

1. **Bug de longitude absoluta** (linha 379 de `MandalaChart.tsx`): `pos: toXY((p.degree / 360) * 360, 178)` é matematicamente igual a `toXY(p.degree, 178)`. Como `p.degree` é o grau DENTRO do signo (0-29.99°), todos os 10 planetas ficam clusterizados no arco de 0-30° em vez de distribuídos ao longo da eclíptica inteira. Resultado: o mapa astral é visualmente incorreto.
2. **Ausência de casas astrológicas**: mapa astral de rodas clássicas mostra 12 casas (1-12) e 12 signos. O Mandala atual só mostra signos. Sem casas, não há leitura de "onde na vida" cada planeta atua.
3. **Tantra (Layer 3) — 5 koshas como InfoPanel**: as 11 bodies (Yogi Bhajan) já são renderizadas. Adicionar 5 koshas (tântrica védica, pancha-kosha) como InfoPanel enriquecido, sem mexer no SVG.

## O que muda

### Fase 3 — Anel Zodiacal Expandido (implementada nesta sessão)

- Corrigir o cálculo de longitude absoluta (sign_index × 30 + degree)
- Renderizar 10 planetas com glifos astrológicos padrão (☉ ☽ ☿ ♀ ♂ ♃ ♄ ♅ ♆ ♇) em suas posições eclípticas reais
- Adicionar 12 casas numeradas (1-12) partilhando o anel com os signos
- Adicionar divisões visuais entre signos (linha) e casas (linha tracejada)
- Corrigir rotação contínua (120s linear) para que a leitura faça sentido (ver requisito 3.6)
- Manter contraste WCAG AA mínimo
- i18n en.json + pt-BR.json para rótulos novos

### Fase 4 — InfoPanel Tantra enriquecido (implementada nesta sessão)

- Camada 3 (Tantra) do Mandala: **SVG INTOCADO** (os 11 bodies de Yogi Bhajan permanecem)
- Adicionar seção "5 Koshas (Tantra Védica)" no InfoPanel do Layer 3, **ao lado** (não substituir) dos 11 bodies
- Cores fixas por kosha exibidas como small badges (não segmentos de anel)
- `data.tantra.bodies` (11 entries Yogi Bhajan) continua sendo a fonte de verdade para o SVG
- `KOSHAS` é uma constante nova, separada, para o InfoPanel
- i18n en.json + pt-BR.json para as 5 koshas (textos do InfoPanel)

### Fases 5 e 6 (detalhadas, NÃO implementadas nesta sessão)

- **Fase 5 — Mandato/Dashboard**: cards-resumo das 5 camadas, atalhos para rotas, números-chave
- **Fase 6 — Animações/polimento**: transições entre camadas, micro-interações no InfoPanel, performance

## Impacto

- **Specs afetados**:
  - [`mandala-fase2-infopanels`](file:///home/skynet/cabala-dos-caminhos/.trae/specs/mandala-fase2-infopanels/spec.md) — Fase 3 amplia o AstrologyPanel; Fase 4 altera o que a Camada 5 mostra
  - [`mandala-fase1-api-route`](file:///home/skynet/cabala-dos-caminhos/.trae/specs/mandala-fase1-api-route/spec.md) — API precisa expor `signIndex` ou `absoluteLongitude` para cada planeta
- **Código afetado**:
  - `apps/akasha-portal/src/components/akasha/MandalaChart.tsx` (Lines 309-413: renderZodiac, renderPlanets, renderParticles; Lines 119-121: dados de planetas)
  - `apps/akasha-portal/src/lib/shared/zodiac.ts` (ZODIAC_SIGNS, ZODIAC_NAMES, helpers de longitude)
  - `packages/core-astrology/src/` (calcular `absoluteLongitude` se ainda não exposto)
  - `apps/akasha-portal/src/lib/i18n/en.json` e `pt-BR.json` (novos rótulos)
  - `apps/akasha-portal/src/components/akasha/MandalaChart.test.tsx` (novo snapshot)

## Requisitos Adicionados

### Requisito 3.1: Longitude Absoluta Correta

O sistema DEVERÁ calcular a posição angular de cada planeta na eclíptica usando **longitude absoluta** (sign_index × 30 + grau_no_signo), não o grau dentro do signo.

#### Cenário: Sol em Gêmeos 15°
- **QUANDO** `data.astrology.planets` contém `{name: "Sol", sign: "Gêmeos", degree: 15}`
- **ENTÃO** o planeta é renderizado em ângulo = (Gêmeos_index × 30) + 15 = 60 + 15 = 75° (no anel zodiacal)
- **E NÃO** em ângulo = 15° (que era o bug)

#### Cenário: API expõe longitude absoluta
- **QUANDO** `/api/akasha/mandala` retorna `data.astrology.planets`
- **ENTÃO** cada planeta inclui `absoluteLongitude: number` em graus [0, 360)
- **OU** `signIndex: number` em [0, 11] e `degree` (que é o que já tem)
- O componente MandalaChart consome essa informação para posicionar

### Requisito 3.2: 10 Planetas com Glifos Astrológicos Padrão

O sistema DEVERÁ renderizar 10 planetas com glifos unicode padrão, em vez de dots genéricos.

#### Cenário: Renderização dos planetas
- **QUANDO** `data.astrology.planets` tem 10 entradas (Sol, Lua, Mercúrio, Vênus, Marte, Júpiter, Saturno, Urano, Netuno, Plutão)
- **ENTÃO** cada planeta aparece como glifo no anel interno (raio 178) com:
  - Glifo unicode correto (☉ ☽ ☿ ♀ ♂ ♃ ♄ ♅ ♆ ♇)
  - Cor fixa por planeta (Sol/Lua = dourado/prata; clássicos = branco; modernos = cinza claro)
  - Tamanho 12-14px para legibilidade
  - Tooltip no hover com nome + signo + grau
- **E** se um planeta está retrógrado (`retrograde: true`), recebe sufixo ℞

### Requisito 3.3: 12 Casas Astrológicas Numeradas

O sistema DEVERÁ renderizar 12 casas astrológicas como partição do anel zodiacal.

#### Cenário: Renderização das casas
- **QUANDO** o MandalaChart é renderizado
- **ENTÃO** 12 linhas radiais dividem o anel em 12 segmentos de 30° cada
- **E** os ângulos das casas coincidem com os signos (casa 1 = ascendente = 0°; casas incrementam anti-horário na roda)
- **E** números das casas (1-12) aparecem em fonte pequena no centro do segmento de cada casa
- **E** a partição é visual: linha cheia para signos, linha tracejada para casas (não confunde com signos)

### Requisito 3.4: Divisão Visual Signos vs Casas

O sistema DEVERÁ distinguir visualmente partição de signos (limites) de partição de casas (sectores).

#### Cenário: Hierarquia visual
- **QUANDO** o usuário olha para o anel zodiacal
- **ENTÃO** ele distingue imediatamente:
  - 12 segmentos de signo (cada um com nome "Áries", "Touro", etc., já existente)
  - 12 casas (numeradas 1-12, partição ortogonal)
  - Os 10 planetas (glifos) e suas posições
- **E** o ascendente tem marca visual especial (seta ou ícone no ponto 0° da roda)

#### Especificação das Linhas Divisórias
- **Limites de signos**: linha cheia, cor `#FFFFFF` com 30% opacidade, stroke-width 1
- **Limites de casas**: linha tracejada (dasharray `2 3`), cor `#FFFFFF` com 20% opacidade, stroke-width 1
- **Casa 1 (ascendente)**: linha cheia com 50% opacidade, marca visual adicional no ponto exato
- **Casa 10 (meio do céu)**: linha cheia com 50% opacidade, marca visual adicional no ponto exato

### Requisito 3.5: Rotação Não Contínua + Convenção de Ângulo

O sistema NÃO DEVERÁ rotacionar o anel zodiacal continuamente (120s linear infinito).

#### Cenário: Comportamento de rotação
- **QUANDO** o MandalaChart é renderizado
- **ENTÃO** a rotação contínua é REMOVIDA do anel zodiacal
- **E** a posição inicial é fixa
- **E** se o usuário tocar/arrastar, ele pode girar manualmente (drag-to-rotate opcional, fora do escopo desta fase)
- **POR QUÊ**: rotação contínua torna a leitura do mapa impossível — usuário nunca consegue fixar o olhar em um planeta

#### Convenção de Ângulo (helper `longitudeToAngle`)
- **Longitude absoluta 0°** (ascendente) → ponto esquerdo (9 horas do relógio, Oeste)
- **Longitude absoluta 90°** → ponto inferior (6 horas, Sul)
- **Longitude absoluta 180°** → ponto direito (3 horas, Leste)
- **Longitude absoluta 270°** → ponto superior (12 horas, Norte)
- **Fórmula SVG**: `svgAngle = (180 - absoluteLongitude + 360) % 360`
- **Teste**: Sol em Áries 0° (longitude 0°) deve renderizar no ponto 9 horas (esquerda do relógio)
- **Implementação**: helper em `zodiac.ts` recebe `(absoluteLongitude: number, ringRadius: number, cx: number, cy: number)` e retorna `{x, y}` via `toXY`

### Requisito 3.6: Acessibilidade WCAG AA Mínimo

O sistema DEVERÁ cumprir WCAG AA no anel zodiacal.

#### Cenário: Contraste e labels
- **QUANDO** o SVG do Mandala é renderizado
- **ENTÃO** todos os textos têm contraste ≥ 4.5:1 com o fundo escuro
- **E** cada planeta é wrapped em `<g role="img" aria-label="Sol em Gêmeos, 15°">`
- **E** o anel zodiacal tem `<title>` e `<desc>` SVG nativos
- **E** Tab navega entre planetas (focus order segue o anel anti-horário)

### Requisito 3.7: Performance Baseline

O sistema DEVERÁ renderizar o MandalaChart em < 16ms por frame.

#### Cenário: Render time
- **QUANDO** o usuário abre `/akasha/mapa`
- **ENTÃO** o primeiro render do MandalaChart é < 16ms
- **E** re-render após mudança de camada é < 16ms
- **Medição**: usar React DevTools Profiler ou `performance.mark()`
- **POR QUÊ**: Mandala renderiza uma vez por page load, mas precisa ser snappy em mobile

### Requisito 4.1: InfoPanel Tantra mostra 5 Koshas (Tantra Védica)

O sistema DEVERÁ exibir informação textual sobre as 5 koshas (pancha-kosha) no InfoPanel do Layer 3, **ao lado** (não substituindo) a lista das 11 bodies de Yogi Bhajan.

#### Cenário: InfoPanel Tantra enriquecido
- **QUANDO** `activeLayer === 3`
- **ENTÃO** o InfoPanel lateral exibe:
  - **Seção 1** (já existente): 11 bodies de Yogi Bhajan com nomes e active/inactive
  - **Seção 2** (NOVA): "5 Koshas (Tantra Védica)" — lista das 5 koshas:
    - Anna (físico): `#E27D60` (badge de cor)
    - Prana (energético): `#C38D9E`
    - Mano (mental): `#9DADE3`
    - Vijnana (sabedoria): `#7C5CFF`
    - Ananda (beatitude): `#FFD166`
  - **E** cada kosha tem nome sânscrito, tradução PT, descrição de 1-2 frases
  - **E** as 5 koshas são **somente texto** (não alteram o SVG)
  - **E** fonte: tradição tântrica védica (Taittiriya Upanishad / Vivekachudamani)
  - **E** nenhuma correspondência esotérica fabricada (LGPD by design + Pilar 1)

### Requisito 4.2: SVG do Layer 3 NÃO é modificado

O sistema NÃO DEVERÁ alterar o render SVG dos 11 nodes de Yogi Bhajan.

#### Cenário: SVG intocado
- **QUANDO** o MandalaChart é renderizado
- **ENTÃO** os 11 nodes permanecem no raio 138 com `Array.from({ length: 11 })`
- **E** a constante `TANTRIC_BODY_WISDOM` permanece intacta
- **E** `data.tantra.bodies` continua sendo mapeado 1-1 para os nodes
- **POR QUÊ**: 11 bodies são dados válidos do sistema Yogi Bhajan; destruir seria perda de informação

### Requisito 4.3: Constante KOSHAS separada

O sistema DEVERÁ ter uma constante `KOSHAS` em arquivo separado (`koshas.ts`) que define as 5 koshas védicas.

#### Cenário: Definição de dados
- **QUANDO** o componente InfoPanel renderiza a seção de koshas
- **ENTÃO** ele importa `KOSHAS` de `apps/akasha-portal/src/lib/shared/koshas.ts`
- **E** cada kosha tem: id, name (pt/en/sanskrit), color, description (pt/en)
- **E** é puramente dado (sem lógica de UI)

### Requisito 5.1 (FUTURO): Mandato/Dashboard Cards

> NÃO IMPLEMENTADO nesta sessão. Detalhado para spec futuro.

Cards-resumo das 5 camadas, atalhos para rotas, números-chave do mapa.

### Requisito 6.1 (FUTURO): Animações e Polimento

> NÃO IMPLEMENTADO nesta sessão. Detalhado para spec futuro.

Transições entre camadas, micro-interações no InfoPanel, otimização de performance.

## Dados Disponíveis

### MandalaData.astrology.planets (atual)

```typescript
interface Planet {
  name: string;       // "Sol", "Lua", "Mercúrio", "Vênus", "Marte", "Júpiter", "Saturno", "Urano", "Netuno", "Plutão"
  sign: string;       // "Áries", "Touro", ..., "Peixes" (pt-BR) ou "Aries", ..., "Pisces" (en)
  degree: number;     // [0, 30) — grau DENTRO do signo
  house: number;      // [1, 12]
  retrograde?: boolean; // ADICIONAR se não existir
  // ADICIONAR:
  absoluteLongitude?: number; // [0, 360) — para evitar cálculo no client
  signIndex?: number;          // [0, 11] — alternativa a absoluteLongitude
}
```

### MandalaData.astrology (campos adicionais)

```typescript
interface AstrologyData {
  ascendant: { sign: string; degree: number; absoluteLongitude: number; signIndex: number } | null;
  midheaven: { sign: string; degree: number; absoluteLongitude: number } | null;
  dominantPlanet: string | null;
  planets: Planet[];
  aspects: AstrologyAspect[];
  elementalBalance: { fire: number; earth: number; air: number; water: number };
  houses: HouseCusp[]; // ADICIONAR
}

interface HouseCusp {
  house: number;       // 1-12
  sign: string;
  degree: number;      // grau no signo
  absoluteLongitude: number; // [0, 360)
}
```

### Koshas data (novo)

```typescript
interface Kosha {
  id: 'anna' | 'prana' | 'mano' | 'vijnana' | 'ananda';
  name: { pt: string; en: string; sanskrit: string };
  color: string; // hex
  description: { pt: string; en: string };
}

const KOSHAS: Kosha[] = [
  { id: 'anna',     name: { pt: 'Físico',     en: 'Physical',     sanskrit: 'Anna-maya'    }, color: '#E27D60', description: { pt: 'Corpo físico, nutrido pelo alimento. Onde a matéria, os ossos e a respiração se manifestam.', en: 'Physical body, nourished by food. Where matter, bones, and breath manifest.' } },
  { id: 'prana',    name: { pt: 'Energético',  en: 'Energetic',    sanskrit: 'Prana-maya'   }, color: '#C38D9E', description: { pt: 'Camada da energia vital e da respiração. Onde circula o prana, o sopro que dá movimento.', en: 'Layer of vital energy and breath. Where prana flows, the breath that gives movement.' } },
  { id: 'mano',     name: { pt: 'Mental',      en: 'Mental',       sanskrit: 'Mano-maya'    }, color: '#9DADE3', description: { pt: 'Camada dos pensamentos, percepções e padrões mentais. Onde a mente processa o mundo.', en: 'Layer of thoughts, perceptions, and mental patterns. Where the mind processes the world.' } },
  { id: 'vijnana',  name: { pt: 'Sabedoria',   en: 'Wisdom',       sanskrit: 'Vijnana-maya' }, color: '#7C5CFF', description: { pt: 'Camada da sabedoria e do discernimento. Onde a intuição e a visão interior se formam.', en: 'Layer of wisdom and discernment. Where intuition and inner vision form.' } },
  { id: 'ananda',   name: { pt: 'Beatitude',   en: 'Bliss',        sanskrit: 'Ananda-maya'  }, color: '#FFD166', description: { pt: 'Camada mais interna, da beatitude e da conexão com a fonte. Onde o ser repousa em si.', en: 'Innermost layer, of bliss and connection to source. Where the being rests in itself.' } },
];
```

## Constraints

- **Pilar 1 (Cabala)**: koréby, não inventar correspondências esotéricas — usar fontes tântricas reconhecidas para koshas
- **Pilar 4 (Odu) ethics**: avisar se kosha toca em "requer consentimento + terreiro" (não se aplica aqui)
- **LGPD by design**: mínimo PII; não expor datas completas; sem PII nos glifos ou labels
- **Performance**: render < 16ms; sem memo prematuro
- **i18n**: en.json + pt-BR.json sincronizados
- **Acessibilidade**: WCAG AA mínimo
- **Build**: pnpm typecheck + lint + test:unit passam; build de produção ok
- **Commit**: 1 commit por fase (2 commits total); conventional commits
- **Docs**: AGENTS.md do MandalaChart + packages afetados atualizados

## Arquivos a Modificar

| Arquivo | Fase | Mudança |
|---------|------|---------|
| `packages/core-astrology/src/types.ts` | 3 | Adicionar `absoluteLongitude` ou `signIndex` em `Planet` |
| `packages/core-astrology/src/birth-chart.ts` | 3 | Calcular `absoluteLongitude` ao construir `Planet` |
| `apps/akasha-portal/src/lib/shared/zodiac.ts` | 3 | Adicionar `GLYPHS_BY_PLANET`, `longitudeToAngle` |
| `apps/akasha-portal/src/components/akasha/MandalaChart.tsx` | 3+4 | Refatorar renderZodiac, renderPlanets, adicionar renderHouses, renderKoshas; remover rotação contínua e os 11 nodes hardcoded (Layer 3) |
| `apps/akasha-portal/src/lib/i18n/en.json` | 3+4 | Adicionar `mandala.koshas.*`, `mandala.houses.*` |
| `apps/akasha-portal/src/lib/i18n/pt-BR.json` | 3+4 | Espelho do en.json |
| `apps/akasha-portal/src/components/akasha/MandalaChart.test.tsx` | 3+4 | Novo snapshot test com planetas + koshas |
| `apps/akasha-portal/src/components/akasha/MandalaChart.stories.tsx` (se existir) | 3+4 | Atualizar/atualizar story |
| `apps/akasha-portal/src/components/akasha/AGENTS.md` | 3+4 | Documentar nova estrutura visual |
| `packages/core-astrology/AGENTS.md` | 3 | Documentar `absoluteLongitude` em Planet |
| `apps/akasha-portal/AGENTS.md` | 3+4 | Atualizar scope/ownership |
| `memory/cycle-XXX.md` | 3+4 | Registrar ciclo de evolução |

## Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| API não expõe `absoluteLongitude` | Média | Bloqueador | Adicionar à API; fallback computa no client com `signIndex` se necessário |
| Snapshot test flaky (animações) | Baixa | Médio | Remover animações antes do snapshot; usar `data-testid` |
| i18n keys faltando | Baixa | Baixo | Adicionar todas no mesmo commit |
| Rotation removal quebra UX esperada | Baixa | Baixo | Verificar se rotação é intencional em algum lugar; se for, substituir por rotação on-hover |
| Koshas coloridas poluem visual | Média | Médio | Opacidade 0.15-0.20; só ativo quando Camada 5 selecionada |
| 11 nodes do Tantra são usados em outro lugar | Baixa | Médio | CodeGraph check antes de remover; se sim, manter compatibilidade com `data.tantra.bodies` |

## Plano de Execução (sessão 4-8h)

### Bloco 1 — Fase 3 (3-4h)

1. CodeGraph check: quem consome `data.astrology.planets` e `data.tantra.bodies`
2. Adicionar `absoluteLongitude` à API (`core-astrology`)
3. Adicionar helper `longitudeToAngle(absoluteLongitude, ringOffset)` em `zodiac.ts`
4. Refatorar `renderZodiac` em `MandalaChart.tsx`:
   - Corrigir bug de longitude
   - Renderizar 10 glifos em vez de dots
   - Adicionar 12 casas numeradas
   - Remover rotação contínua
5. Adicionar `aria-label` e `role="img"` em cada planeta
6. Atualizar en.json + pt-BR.json com novos rótulos
7. Escrever snapshot test
8. Rodar typecheck + lint + test:unit
9. **Commit Fase 3**

### Bloco 2 — Fase 4 (2-3h)

10. CodeGraph check: quem consome `data.tantra.bodies` além do MandalaChart
11. Adicionar `KOSHAS` data em `MandalaChart.tsx` (ou arquivo `koshas.ts` separado)
12. Refatorar render da Camada 5: 5 segmentos coloridos com labels
13. Substituir `Array.from({ length: 11 })` por iteração sobre `data.tantra.bodies` (5 entries)
14. Atualizar InfoPanel da Camada 3: seção koshas com badge ativo/inativo
15. Atualizar en.json + pt-BR.json
16. Rodar typecheck + lint + test:unit
17. **Commit Fase 4**

### Bloco 3 — Fechamento (30min-1h)

18. Atualizar AGENTS.md de MandalaChart, core-astrology, akasha-portal
19. Rodar typecheck + lint + test:unit (validação final)
20. Verificar build de produção (`pnpm --filter akasha-portal build`)
21. Escrever memory cycle (registrar F-XXX, ex: F-230)
22. Relatório final de progresso

## Critério de Pronto (Done = Done)

- [ ] `pnpm --filter akasha-portal typecheck` exit 0
- [ ] `pnpm --filter akasha-portal lint` exit 0
- [ ] `pnpm --filter akasha-portal test:unit` exit 0
- [ ] `pnpm --filter akasha-portal build` exit 0
- [ ] Snapshot test do MandalaChart passa
- [ ] Sem regressão em InfoPanels da Fase 2
- [ ] Anel zodiacal mostra 10 planetas em posições eclípticas corretas
- [ ] Camada 5 mostra 5 koshas com cores e labels
- [ ] Camada 3 renderiza 5 koshas (substitui 11 nodes)
- [ ] en.json e pt-BR.json sincronizados
- [ ] AGENTS.md atualizados
- [ ] Memory cycle registrado

## Specs Futuras (Fases 5, 6 e Roadmap)

### Próximo spec (Qualidade)

- Consolidação: testes faltando, ResizeObserver polyfill, error states, acessibilidade ampliada, performance, i18n EN completo, build size, segurança
- Cronograma: 2-3 sessões de 4-8h

### Spec seguinte (Grimoire)

- Completar 16 odus com validação, 64 hexagramas, catálogo de ervas, corpos numerológicos
- EN translation pipeline
- Cronograma: 4-6 sessões de 4-8h

### Spec final (RAG/Mentor)

- LLM integration, RAG do grimoire, contexto do usuário
- Cronograma: 6-10 sessões de 4-8h
