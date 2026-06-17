# SPEC.md — Akasha System Specification

> **Source:** Derived from `attachment-1` constitution + codebase survey as of 2026-06-17.
> This file is the **living source of truth** for what the Akasha system is and is not.
> Keep it faithful to what the code actually does. When code and spec diverge, fix the spec.

---

## 1. Mission

O Akasha é um sistema de tecnologia espiritual que faz **uma** coisa que nenhum mapa isolado
faz: traduzir cinco tradições simbólicas em **uma única linguagem prática de autoconhecimento
e ação**, organizada por todas as áreas da vida.

As cinco tradições-fonte:
1. **Odu de Nascimento** (Ifá) — destino, movimento, equilíbrio de forças, padrões da existência.
2. **Numerologia Cabalística** — códigos vibracionais da identidade e da missão.
3. **Numerologia Tântrica** — corpos de consciência e desafios da alma.
4. **Astrologia** — arquétipos psicológicos e dinâmicas cósmicas.
5. **I Ching (64 hexagramas)** — estados de transformação e ciclos.

**Teste-mãe:** se uma saída ainda exige que o usuário saiba o que é "Sol em Escorpião" ou "Odu 11", ela está errada.

---

## 2. O Mandato Duplo (Guiding Principles — verbatim from constitution §2)

O Akasha precisa ser, ao mesmo tempo, duas coisas que normalmente se excluem:

- **Por dentro (o motor): o sistema mais complexo e profundo que existe.** Ele cruza cinco
  tradições independentes, calcula convergências e tensões entre elas, e sintetiza isso num
  modelo coerente de consciência.
- **Por fora (a experiência): o sistema mais simples e claro que existe.** Qualquer pessoa, sem
  nenhum conhecimento esotérico, abre e entende em segundos quem ela é e o que fazer.

### 2.1 O Iceberg
~90% da inteligência fica **abaixo da linha d'água**. Acima, o usuário vê só o que gera compreensão imediata e um próximo passo claro. A profundidade existe sob demanda (revelação progressiva), nunca empurrada.

### 2.2 O Teste dos Dois Leitores
Toda tela e toda saída precisa passar nos **dois** leitores ao mesmo tempo:
- **O Mestre.** Percebe síntese real entre as cinco tradições — convergências, tensões, nuance.
- **O Iniciante.** Não sabe nada, entende em segundos, sai sabendo o que fazer.

### 2.3 A Barra de Ambição
Gene Keys explica potencial. Human Design explica mecânica energética. Astrologia explica tendências. Nenhum deles:
1. **Correlaciona** múltiplas tradições independentes num único sinal coerente.
2. **Responde** perguntas concretas da vida cotidiana.
3. **Evolui** junto com a pessoa ao longo do tempo.

---

## 3. Princípios Inegociáveis (Constitution §3)

1. **Propriedade de tradução.** Nenhum símbolo bruto vaza para o usuário sem tradução em significado.
2. **Sistema unificado, não agregado.** A saída fala em arquétipos e padrões — não "o que cada tradição diz".
3. **Mandato Duplo.** Profundidade máxima no motor e simplicidade máxima na experiência.
4. **Cálculo determinístico, linguagem gerada.** Mesma entrada → sempre o mesmo perfil.
5. **Procedência rastreável.** Toda afirmação carrega (tradição, símbolo, intensidade) que a originou.
6. **Anti-Barnum.** Frases genéricas são cortadas.
7. **Insight + ação, sempre juntos.**
8. **Hipóteses calibradas, não veredictos.**
9. **Cobertura de vida completa.**
10. **Justificação de existência.** O que não responde pergunta-núcleo é cortado.
11. **UI/UX a serviço da compreensão.** Profundidade em camadas, cards, modais — nunca paredes de texto.
12. **Economia de contexto por padrão.**
13. **Build sempre funcional.**

---

## 4. Arquitetura em Camadas (Constitution §4)

As camadas 0–2 são **determinísticas e testáveis**. A camada de linguagem (4+ na prosa) é **gerada**, mas fiel às camadas anteriores.

### Layer 0 — Entrada
**Status: ✅ IMPLEMENTED**

- Data, hora e local de nascimento + nome
- Via: `BirthChart` Prisma model + `birth-chart.ts` (core-astrology)
- Inputs: `User.birthDate`, `User.birthTime`, `User.birthCity`, `User.birthLatitude`, `User.birthLongitude`, `User.birthTimezone`

### Layer 1 — Símbolos Brutos
**Status: ✅ IMPLEMENTED**

| Tradição | Símbolos Brutos | Archivo |
|---|---|---|
| Astrologia | Sol/Lua/Ascendente/planetas/casas | `core-astrology` + `AstrologyMap` |
| Cabala | Caminho de Vida, expressão, alma, desafios, números mestres | `core-cabala` + `KabalisticMap` |
| Tantra | Corpos (1–11), temperamento, alma | `core-tantra` + `TantricMap` |
| Odu | Odu de nascimento + família Odu | `core-odus` + `OduBirth` |
| I Ching | Hexagrama natal + hexagramas de ciclo (opt-in) | `core-iching` + `IChingMap` |

Raw symbols exist in the `@akasha/types` output types (`AstrologyMap`, `KabalisticMap`, `TantricMap`, `OduBirth`).
**Critical gap:** I Ching integration is opt-in (flag in User model) and not yet fully synthesized into the profile.

### Layer 2 — Vetores Universais (Primitives)
**Status: ✅ IMPLEMENTED — synthesizePrimitives() called in buildAkashaSynthesis (June 2026); all 5 traditions wired including I Ching**

Constitution §5.1 defines 12 primitives:
> Transformação · Expansão · Ordem · Expressão · Amor · Poder · Sabedoria · Movimento · Serviço · Materialização · Intuição · Conexão

**Current reality:** The primitive system **is implemented** as a translation layer via `mapeamentos/` (project root) and `PRIMITIVE_TO_TYPE` in `derive-akasha-type.ts`. Aggregation is weighted and systematic: Cabala×3, Astrologia×3, Odu×2, Tantra×2, I Ching×1 (wired but not yet called). `deriveAkashaType()` aggregates dominant primitive from all available traditions.

This was the most significant gap — now partially closed (I Ching pending final wiring).

**Aspirational implementation (section 5.1 of constitution):**
```
{
  primitivo: "Transformacao",
  intensidade: 0–10,
  polaridade: "luz" | "sombra" | "ambas",
  fonte: "justificativa tradicional que embasa este mapeamento"
}
```

### Layer 3 — Arquitetura da Consciência
**Status: ⚠️ PARTIAL**

Constitution defines dimensions: Identidade, Talentos, Desafios, Missão, Evolução, Relações, Prosperidade, Espiritualidade.

**Current implementation:** The 6 `LifeArea` strings in `synthesis-types.ts` serve this role:
- `vitalidadeEnergia` — saúde, sexualidade, energia vital, hábitos, ciclos
- `conexoesAmor` — amor, família, vínculos, relações
- `carreiraProsperidade` — finanças, carreira, abundância
- `oriCabecaQuizilas` — intuição, propósito, direção (mente/orixá)
- `missaoDestino` — missão, destino, transcendência
- `desafiosSombras` — sombras, karma, superação, transformação

### Layer 4 — Síntese Akáshica
**Status: ✅ IMPLEMENTED**
- `AkashaTypeProfile` (F-227): 9 catalogued types (all 9 defined in `akasha-types-catalog.ts`; all have full fields: corePattern, strategy, strategyDetail, dimensionOrigin, growthEdge, shadowTrap)
- `AkashicHologram` — 6-dimension structure in `hologram-aggregator.ts`
- `crossAnalyze()` in `cross-engine.ts` — produces `TensionPoint[]` and `SyncPoint[]` across traditions
- `deriveAkashaType()` — aggregates dominant primitive from Cabala + Astrologia + Tantra + Odu via `PRIMITIVE_TO_TYPE`
- `synthesizePrimitives()` called in `buildAkashaSynthesis()` with 5-pilar input (I Ching, Cabala, Astrologia, Tantra, Odu); all 5 traditions fully wired (June 2026)

### Layer 5 — Projeção por Áreas da Vida
**Status: ✅ IMPLEMENTED**
- `deriveAreaNarratives()` for each of the 6 life areas — each accepts optional `_synthesizedProfile?: SynthesizedProfile` as 6th parameter for cross-pillar synthesis
- `buildAkashaSynthesis()` calls `synthesizePrimitives()` and passes `SynthesizedProfile | undefined` to all 6 area functions
- `AreaNarrative` output includes: shadow pattern, gift pattern, practical advice, daily ritual, transformation prompt, `pillarContribution` (5 pilares: Cabala, Astrologia, Tantra, Odú, I Ching), `expandedNarrative` (5 narrative blocks incl. `ichingNarrative`), `chainOfReasoning`
- `ExpandedNarrativeUI` (client) and `AreaNarrativeUI.pillarContribution` (client) fully typed for 5 pillars — ichingNarrative gap closed iter35
### Layer 6 — Motor de Recomendações
**Status: ⚠️ PARTIAL**

- `deriveDailyDecision()` — strategy + recommendation + avoidance
- `deriveDailyTransitOverlay()` — transit aspect overlay per area
- `buildPracticalAdvice()` — area-specific guidance (stub implementation)
- `buildAreaRitual()` — ritual per area using `AkashicHologram` data

**Gap:** Rituals are built from hologram data but the ritual database (`ritual-storage.ts` is a stub) is not yet populated.

### Layer 7 — Agente Evolutivo
**Status: ⚠️ PARTIAL**

Implemented via `evolutionary-agent/index.ts` (iter30): personalDay/Month/Year cycle calculations, pinnacle/challenges/maturity derivation, exercise prioritization, cycle modulation per life area.
Extended in iter33 with persistence layer: `CycleSnapshot`, `AreaHistoryEntry`, `ExerciseCompletion` Prisma models + API routes for storage.
Extended in iter34 with pattern display: `EvolutionPatterns` component in "Sua Jornada" tab showing frequency trends, alignment sparklines, and detected patterns.
**Remaining gap:** Re-assessment triggers (milestone-based re-evaluation), I Ching cycle integration, and formal "gêmeo digital simbólico" UI representation.
---

## 5. O Motor de Tradução — Primitive System (Section 5.1)

### 5.1 Primitivos (Eixos Fixos)
**Status: ⚠️ DECLARED BUT NOT YET IMPLEMENTED AS A TRANSLATION LAYER**

Constitution defines 12 primitives:
1. **Transformação** — polo luz: integração; polo sombra:魔
2. **Expansão** — polo luz: abertura; polo sombra: dispersão
3. **Ordem** — polo luz: estrutura; polo sombra: rigidez
4. **Expressão** — polo luz: criatividade; polo sombra: Performance
5. **Amor** — polo luz: conexão; polo sombra: apego
6. **Poder** — polo luz: autoridade; polo sombra: dominação
7. **Sabedoria** — polo luz: discernimento; polo sombra: intelectualização
8. **Movimento** — polo luz: ação; polo sombra: inquietação
9. **Serviço** — polo luz: contribuição; polo sombra: sacrifício
10. **Materialização** — polo luz: manifestação; polo sombra: apego material
11. **Intuição** — polo luz: percepção sutil; polo sombra: ilusão
12. **Conexão** — polo luz: unidade; polo sombra: fusão

**Current code status:** The primitive names ARE the internal representation. `mapeamentos/` exists at project root with 5 JSON files. `PRIMITIVE_TO_TYPE` and `aggregatePrimitivesFromPilars()` form the active translation layer.

### 5.2 Tabelas de Mapeamento (`mapeamentos/`)
**Status: ⚠️ SEEDED — 5 files created, content coverage partial**

Constitution specifies: `mapeamentos/` directory with versioned JSON mapping per tradition per symbol.
This directory **exists** at the project root with 5 files: `astrologia.json`, `cabala.json`, `iching.json`, `odu.json`, `tantra.json`.

**Aspirational structure:**
```
mapeamentos/
  astrology/
    planets.yaml
    signs.yaml
    houses.yaml
    aspects.yaml
  kabalah/
    life-path.yaml
    expression.yaml
    challenges.yaml
  tantra/
    bodies.yaml
    temperaments.yaml
  odus/
    odus.yaml
    ifa-options.yaml
  iching/
    hexagrams.yaml
```

### 5.3 Pesos por Domínio
**Status: ⚠️ HEURISTIC ONLY — not yet a tunable matrix**

Constitution specifies:
| Tradição | Peso Primário | Peso Secundário |
|---|---|---|
| Odu | Missão/Destino | Prosperidade |
| Cabalística | Identidade | Missão |
| Tântrica | Desafios da alma | Vitalidade |
| Astrologia | Temperamento | Relações |
| I Ching | Ciclos atuais | Timing |

**Current implementation:** `cross-engine.ts` uses fixed element-based correlations. No tunable matrix exists yet.

### 5.4 Síntese (Convergência / Tensões)
**Status: ✅ PARTIAL**

- `crossAnalyze()` in `cross-engine.ts` produces `TensionPoint[]` and `SyncPoint[]`
- Tensions are detected via element clash between Odu element and Astrology moon sign
- `FrequencyLevel` (shadow/gift/siddhi) is computed per area via `assessAreaFrequency()`
- **Gap:** Convergence scoring (tradições concordam com magnitude X) is heuristic; full magnitude/convergence/confiança calculation per primitive does not exist yet.

### 5.5 Linguagem fiel
**Status: ⚠️ PARTIAL**

- `buildSynthesisParagraph()` in `synthesis-paragraph.ts` generates narrative text
- `narrative-generator.ts` generates area narratives
- **Gap:** No formal audit trail attaches `(tradição, símbolo, intensidade)` to each output claim. Alucinação detection is not systematic.

---

## 6. Cobertura de Vida (Jornada Evolutiva — Constitution §6)

| Camada | Área Akasha | Status | Tradições Fontes |
|---|---|---|---|
| Sobrevivência | `carreiraProsperidade` | ✅ | Cabala, Odu |
| Vitalidade | `vitalidadeEnergia` | ✅ | Tantra, Astrologia |
| Relacionamentos | `conexoesAmor` | ✅ | Astrologia, Odu |
| Expressão | `oriCabecaQuizilas` | ✅ | Cabala, Tantra |
| Realização | `missaoDestino` | ✅ | Odu, Cabala |
| Transformação | `desafiosSombras` | ✅ | Tantra, Odu, Astrologia |

**Note:** The `life-areas-engine/` at `apps/akasha-portal/src/lib/application/life-areas/life-areas-engine/` defines a different, larger set of 12 life areas (`proposito`, `carreira`, `financas`, `saude`, `relacionamentos`, `sexualidade`, `familia`, `espiritualidade`, `criatividade`, `amizades`, `conhecimento`, `autoconhecimento`). This is a **parallel system** that should be unified with the 6-area synthesis model.

---

## 7. AkashaTypeProfile (F-227) — 9-Tipo System

**Status: ⚠️ PARTIAL — 3 of 9 types fully defined**

### Catalogued Types (in `akasha-types-catalog.ts`)

| Tipo | Nome | Estratégia | Autoridade | Status |
|---|---|---|---|---|
| `catalisador` | O Catalisador | initiate-before-ready | derived | ✅ Full |
| `receptor` | O Receptor | wait-for-response | derived | ✅ Full |
| `construtor` | O Construtor | — | — | ⚠️ Stub |
| `transformador` | O Transformador | — | — | ⚠️ Stub |
| `guardiao` | O Guardião | — | — | ⚠️ Stub |
| `curador` | O Curador | — | — | ⚠️ Stub |
| `canal` | O Canal | — | — | ⚠️ Stub |
| `alquimista` | O Alquimista | — | — | ⚠️ Stub |
| `arquiteto` | O Arquiteto | — | — | ⚠️ Stub |

### AkashaTypeProfile Fields (from `synthesis-types.ts`)
```typescript
interface AkashaTypeProfile {
  type: string;
  typeName: string;
  typeIcon: string;
  corePattern: string;
  strategy: string;
  strategyDetail: string;
  dimensionOrigin: string;
  growthEdge: string;
  shadowTrap: string;
  authority: AkashaAuthority;        // derived: emotional | sacral | splenic | mental
  authorityPractice: string;         // derived
  dailyDirective: string;            // derived
  oneLiner: string;                 // derived
}
```

### AkashaAuthority (Human Design inspired)
**Status: ✅ IMPLEMENTED**
- `emotional` — decisão pelo clareamento emocional (tempo)
- `sacral` — decisão pela resposta visceral (energia)
- `splenic` — decisão pela intuição心惊 (sutil)
- `mental` — decisão pela análise (mental)

Derived in `deriveAkashaType()` from `TantricMap.bodyCount` and `AstrologyMap` placements.

### AkashaStrategy
**Status: ✅ IMPLEMENTED**
- `act` — aja antes de estar pronto
- `wait` — aguarde a resposta antes de agir
- `observe` — observe antes de decidir

Derived in `derive-decision.ts` (`deriveStrategy()`) and stored in `DailyDecision`.

---

## 8. Frequency Levels (Gene Keys inspired)

**Status: ✅ IMPLEMENTED in `frequency-analysis.ts`**

```typescript
type FrequencyLevel = 'shadow' | 'gift' | 'siddhi';
```

### Shadow Frequency
Pattern in `area-builders.ts`:
- `buildShadowSymptoms()` — lista de sintomas de baixa frequência
- `buildShadowPattern()` — texto descritivo do padrão sombra

Heuristic scoring:
- `KarmicDebts` count → shadow
- `Challenges.first/second` → shadow
- Pluto/Saturn in chart → shadow

### Gift Frequency
Pattern in `area-builders.ts`:
- `buildGiftStrengths()` — lista de forças
- `buildGiftPattern()` — texto descritivo do dom

Heuristic scoring:
- `LifePathMaster` number → gift
- Soul number 1 or 22 → gift

### Siddhi Frequency
**Status: ⚠️ PARTIAL**
- Referenced in `pickDailyDirectiveFrequency()`: `body >= 7 → siddhi`
- No systematic siddhi computation across all traditions yet
- `siddhi` is the highest frequency state but has no dedicated synthesis path

---

## 9. Páginas e Rotas (App Router — Constitution §7)

| Rota | Pergunta-Núcleo | Camada | Estado |
|---|---|---|---|
| `/dashboard` | Quem eu sou hoje? | 5–6 | ✅ Viva |
| `/diario` | O que eu faço hoje? | 6 | ✅ Viva |
| `/mandala` | Visualização gráfica do perfil | 4 | ✅ Viva |
| `/manifesto` | Documento completo do perfil | 5 | ✅ Viva |
| `/oraculo` | Pergunta específica ao sistema | 7 | ✅ Viva |
| `/mapa` | Mapa akáshico por área | 5 | ✅ Viva |
| `/glossario` | Referência de símbolos | — | ✅ Viva |
| `/conta` | Gestão de conta | — | ✅ Viva |
| `/onboarding` | Cadastro de nascimento | L0 | ✅ Viva |
| `/meu-dia` | Visão do dia + transitos | 6 | ✅ Viva |
| `/minha-caixa` | Caixa de ferramentas pessoais | 6 | ✅ Viva |
| `/mural` | Mural comunitário | — | ⚠️ Candidata a fusão |
| `/compartilhar` | Receber perfil compartilhado | — | ✅ Viva |
| `/significado-primeiro` | Interpretação do primeiro Odu | L1 | ✅ Viva |
| `/sobre` | Sobre o sistema Akasha | — | ✅ Viva |

---

## 10. Quality Gates (Constitution §10 — verbatim)

- ❌ Deixar símbolo bruto vazar como resposta ("você é Sol em Escorpião").
- ❌ Produzir frase Barnum (vaga, válida para qualquer pessoa).
- ❌ Entregar insight sem ação concreta pareada.
- ❌ Tornar o cálculo de vetores não-determinístico.
- ❌ Afirmar com certeza onde a convergência é baixa (use hipótese calibrada).
- ❌ Sacrificar profundidade real para simplificar (virar horóscopo) **ou** sacrificar clareza para parecer profundo (virar jargão impenetrável).
- ❌ Entregar saída que passaria despercebida em qualquer app de horóscopo.
- ❌ Criar página nova quando o conteúdo caberia como revelação progressiva numa existente.
- ❌ Deixar página órfã, redundante ou sem pergunta-núcleo sobreviver sem veredicto.
- ❌ Aumentar "inteligência" inflando o número de telas em vez de aprofundar o motor.
- ❌ Criar parede de texto onde cabe card, modal ou visual.
- ❌ Inventar correspondência tradicional sem registrar fonte/raciocínio nos mapeamentos.
- ❌ Fazer cinco mudanças rasas em vez de uma profunda e completa.
- ❌ **Iniciar o loop sem a Camada de Economia (seção 8) garantida.**
- ❌ **Usar grep/glob/read para pergunta estrutural que o codegraph responde.**
- ❌ **Editar um símbolo sem antes checar `codegraph_impact`.**
- ❌ **Rodar a suíte inteira quando `codegraph affected` isola os testes atingidos.**
- ❌ **Deixar saída enorme entrar crua no contexto sem passar por headroom.**
- ❌ **Ignorar o aviso de staleness do codegraph após escrever.**
- ❌ Quebrar o build ou terminar a iteração com o app fora do ar.

---

## 11. State Files Inventory

| Arquivo | Propósito | Status |
:|---|:---|
| `SPEC.md` | Este arquivo — especificação atual | ✅_exists |
| `MAPA.md` | Inventário vivo de superfícies | ✅_exists |
| `PROGRESS.md` | Diário append-only de iterações | ✅_exists |
| `ROADMAP.md` | Lista priorizada de próximos passos | ✅_exists |
| `DECISIONS.md` | Decisões difíceis de reverter com justificativa | ✅_exists |
| `mapeamentos/` | Tabelas de mapeamento tradição→primitivos | ✅_exists (5 files, project root) |

> **Bootstrap status:** All state files exist. `mapeamentos/` created with 5 JSON files (v0.2.0). Bootstrap complete.

---

## 12. Tech Stack

- **Framework:** Next.js 16.2.6 + React 19 + Turbopack
- **ORM:** Prisma 7 + PostgreSQL + pgvector
- **Auth:** JWT operator auth with refresh tokens (`akasha-jwt.ts`)
- **AI:** MiniMax M3 via headroom proxy on port 8787
- **Testing:** Vitest
- **Styling:** Tailwind CSS v4
- **Monorepo:** pnpm workspace
- **Packages:**
  - `@akasha/core-astrology` — astrological calculations
  - `@akasha/core-cabala` — Kabbalistic numerology
  - `@akasha/core-iching` — I Ching hexagrams
  - `@akasha/core-odus` — Odu Ifá system
  - `@akasha/core-tantra` — Tantric numerology
  - `@akasha/mentor` — AI mentor subsystem
  - `@akasha/types` — shared type definitions

---

## 13. Known Gaps (Priority Order)

2. **[MEDIUM] Siddhi frequency:** ✅ Implemented (June 2026). `assessAreaFrequency()` detects siddhi signal (noShadow + lifePathMaster + soulMaster ∈ {1,22,33}); `deriveDominantFrequency()` returns siddhi when 3+ of 6 areas reach it. `computeOverallScore()` weights siddhi areas 1.5×. `FrequencyPathExplorer` component renders the shadow→gift→siddhi journey with practices.
4. **[MEDIUM] Ritual database:** ✅ Persistence implemented (June 2026). `AreaHistoryEntry` now stores `ritualTitle`, `ritualInstruction`, `ritualDuration`, `ritualElement`, `ritualColor` per area per day. `RitualTrendsSection` in `EvolutionPatterns` displays per-area ritual history. Ritual content still generated from hologram data — curated ritual script database remains a future gap.
5. **[MEDIUM] Layer 7 (Agente Evolutivo):** Not implemented. `personal-cycle-engine.ts` exists but is not wired in.
6. **[LOW] Procedência audit trail:** No formal `(tradição, símbolo, intensidade)` attached to each output claim.
7. **[LOW] Tunable domain weights:** No `tradição × domínio` matrix yet; weights are hard-coded heuristics (Cabala×3, Astrologia×3, Odu×2, Tantra×2, I Ching×1).
